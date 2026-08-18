import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RequestDocumentJson,
  RequestFilterDocumentsJson,
  ResponseDocumentJson,
  ResponseDocumentsJson,
  ResponseRegisteredDocumentJson,
} from '../models/api.models';

/**
 * Limite aceito pelo validador do backend. Existe também um teto de 26 MiB no
 * FormOptions do ASP.NET: passar dele derruba a requisição antes da action e
 * vira um 500 genérico. Validar 25 MiB aqui garante a mensagem de erro boa.
 */
export const MAX_FILE_SIZE_IN_BYTES = 25 * 1024 * 1024;

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/documents`;

  /** Leitura pública — não exige token. */
  list(filter: RequestFilterDocumentsJson): Observable<ResponseDocumentsJson> {
    let params = new HttpParams();

    if (filter.categorySlug) params = params.set('categorySlug', filter.categorySlug);
    if (filter.title) params = params.set('title', filter.title);
    if (filter.page !== undefined) params = params.set('page', filter.page);
    if (filter.pageSize !== undefined) params = params.set('pageSize', filter.pageSize);

    return this.http.get<ResponseDocumentsJson>(this.baseUrl, { params });
  }

  getById(id: string): Observable<ResponseDocumentJson> {
    return this.http.get<ResponseDocumentJson>(`${this.baseUrl}/${id}`);
  }

  /**
   * `downloadUrl` vem relativo do backend. O endpoint é público, então basta
   * usar esta URL num `<a href>` — um fetch cross-origin não conseguiria ler o
   * Content-Disposition, já que ele não está em WithExposedHeaders.
   */
  downloadUrl(relativeDownloadUrl: string): string {
    return `${environment.apiBaseUrl}${relativeDownloadUrl}`;
  }

  create(
    request: RequestDocumentJson,
    file: File,
  ): Observable<ResponseRegisteredDocumentJson> {
    return this.http.post<ResponseRegisteredDocumentJson>(
      this.baseUrl,
      this.toFormData(request, file),
    );
  }

  /** O arquivo é opcional: sem ele, só os metadados são alterados. */
  update(id: string, request: RequestDocumentJson, file: File | null): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, this.toFormData(request, file));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private toFormData(request: RequestDocumentJson, file: File | null): FormData {
    const formData = new FormData();

    formData.append('categoryId', request.categoryId);
    formData.append('title', request.title);
    formData.append('description', request.description);
    formData.append('publicationDate', request.publicationDate);

    if (request.paymentDate) formData.append('paymentDate', request.paymentDate);
    if (request.externalLink) formData.append('externalLink', request.externalLink);

    // O nome do campo precisa ser exatamente `file`: é o nome do parâmetro
    // IFormFile na action, sem [FromForm(Name = ...)] para renomear.
    if (file !== null) formData.append('file', file, file.name);

    return formData;
  }
}
