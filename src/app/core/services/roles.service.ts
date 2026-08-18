import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RequestRegisterRoleJson,
  RequestUpdateRoleJson,
  ResponseRegisteredRoleJson,
  ResponseRoleJson,
  ResponseRolesJson,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/roles`;

  /**
   * Devolve o catálogo de papéis semeado a partir de Permissions.All — é o que
   * alimenta os checkboxes da tela de perfis. Não existe GET /roles/{id}.
   */
  list(): Observable<ResponseRoleJson[]> {
    return this.http
      .get<ResponseRolesJson>(this.baseUrl)
      .pipe(map((response) => response.roles));
  }

  create(request: RequestRegisterRoleJson): Observable<ResponseRegisteredRoleJson> {
    return this.http.post<ResponseRegisteredRoleJson>(this.baseUrl, request);
  }

  /** O `key` é imutável depois da criação, por isso não vai no request. */
  update(id: string, request: RequestUpdateRoleJson): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
