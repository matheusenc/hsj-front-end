import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RequestProfileJson,
  ResponseProfileJson,
  ResponseProfilesJson,
  ResponseRegisteredProfileJson,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ProfilesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/profiles`;

  list(): Observable<ResponseProfileJson[]> {
    return this.http
      .get<ResponseProfilesJson>(this.baseUrl)
      .pipe(map((response) => response.profiles));
  }

  getById(id: string): Observable<ResponseProfileJson> {
    return this.http.get<ResponseProfileJson>(`${this.baseUrl}/${id}`);
  }

  create(request: RequestProfileJson): Observable<ResponseRegisteredProfileJson> {
    return this.http.post<ResponseRegisteredProfileJson>(this.baseUrl, request);
  }

  /** Perfis com IsSystem = true são recusados pelo backend com 403. */
  update(id: string, request: RequestProfileJson): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  /** Recusado com 400 se ainda houver usuário ativo com o perfil. */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
