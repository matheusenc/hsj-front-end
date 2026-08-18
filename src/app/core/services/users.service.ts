import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RequestFilterUsersJson,
  RequestRegisterUserJson,
  RequestUpdateUserJson,
  ResponseRegisteredUserJson,
  ResponseUsersJson,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/users`;

  list(filter: RequestFilterUsersJson): Observable<ResponseUsersJson> {
    let params = new HttpParams();

    if (filter.name) params = params.set('name', filter.name);
    if (filter.page !== undefined) params = params.set('page', filter.page);
    if (filter.pageSize !== undefined) params = params.set('pageSize', filter.pageSize);

    return this.http.get<ResponseUsersJson>(this.baseUrl, { params });
  }

  create(request: RequestRegisterUserJson): Observable<ResponseRegisteredUserJson> {
    return this.http.post<ResponseRegisteredUserJson>(this.baseUrl, request);
  }

  update(id: string, request: RequestUpdateUserJson): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  /** Desativação (soft delete). O backend recusa auto-desativação com 403. */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
