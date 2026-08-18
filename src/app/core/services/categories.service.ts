import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RequestCategoryJson,
  ResponseCategoriesJson,
  ResponseCategoryJson,
  ResponseRegisteredCategoryJson,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/categories`;

  /** Leitura pública — não exige token. */
  list(): Observable<ResponseCategoryJson[]> {
    return this.http
      .get<ResponseCategoriesJson>(this.baseUrl)
      .pipe(map((response) => response.categories));
  }

  create(request: RequestCategoryJson): Observable<ResponseRegisteredCategoryJson> {
    return this.http.post<ResponseRegisteredCategoryJson>(this.baseUrl, request);
  }

  update(id: string, request: RequestCategoryJson): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  /** Recusado com 400 se ainda houver documento ativo na categoria. */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
