import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RequestChangePasswordJson,
  RequestLoginJson,
  ResponseLoggedUserJson,
  ResponseTokensJson,
} from '../models/api.models';

const TOKEN_KEY = 'hsj.accessToken';
const EXPIRES_KEY = 'hsj.expiresAtUtc';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly token = signal<string | null>(null);
  private readonly expiresAt = signal<Date | null>(null);

  readonly currentUser = signal<ResponseLoggedUserJson | null>(null);

  readonly isAuthenticated = computed(() => {
    const expiration = this.expiresAt();
    if (this.token() === null || expiration === null) return false;

    // O backend valida com ClockSkew zero: o token morre exatamente em
    // expiresAtUtc, sem tolerância. Melhor considerar expirado aqui também.
    return expiration.getTime() > Date.now();
  });

  constructor() {
    // localStorage não existe durante o prerender.
    if (this.isBrowser) this.restoreSession();
  }

  login(credentials: RequestLoginJson): Observable<ResponseTokensJson> {
    return this.http
      .post<ResponseTokensJson>(`${environment.apiBaseUrl}/auth/login`, credentials)
      .pipe(tap((tokens) => this.storeSession(tokens)));
  }

  loadCurrentUser(): Observable<ResponseLoggedUserJson> {
    return this.http
      .get<ResponseLoggedUserJson>(`${environment.apiBaseUrl}/users/me`)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  changePassword(request: RequestChangePasswordJson): Observable<void> {
    return this.http.put<void>(`${environment.apiBaseUrl}/users/change-password`, request);
  }

  logout(): void {
    this.token.set(null);
    this.expiresAt.set(null);
    this.currentUser.set(null);

    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EXPIRES_KEY);
    }
  }

  accessToken(): string | null {
    return this.token();
  }

  /**
   * Checagem de permissão para gating de UI. O servidor continua sendo a
   * autoridade — um `Administrador` tem bypass de superadmin que não aparece
   * nesta lista, mas o seeder liga todos os papéis a esse perfil, então na
   * prática a lista vem completa.
   */
  hasPermission(permission: string): boolean {
    return this.currentUser()?.permissions.includes(permission) ?? false;
  }

  hasAnyPermission(permissions: readonly string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  private storeSession(tokens: ResponseTokensJson): void {
    this.token.set(tokens.accessToken);
    this.expiresAt.set(new Date(tokens.expiresAtUtc));

    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(EXPIRES_KEY, tokens.expiresAtUtc);
    }
  }

  private restoreSession(): void {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedExpiration = localStorage.getItem(EXPIRES_KEY);

    if (storedToken === null || storedExpiration === null) return;

    // Não existe refresh token: se já passou da validade, a única saída é
    // novo login. Limpar aqui evita disparar uma requisição fadada ao 401.
    if (new Date(storedExpiration).getTime() <= Date.now()) {
      this.logout();
      return;
    }

    this.token.set(storedToken);
    this.expiresAt.set(new Date(storedExpiration));
  }
}
