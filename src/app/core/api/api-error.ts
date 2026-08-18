import { HttpErrorResponse } from '@angular/common/http';
import { ResponseErrorJson } from '../models/api.models';

/**
 * A API devolve erros em dois formatos diferentes:
 *
 * 1. `ResponseErrorJson` — `{ errors: string[], accessTokenExpired: boolean }`,
 *    produzido pelo ExceptionFilter para tudo que passa pelos use cases.
 * 2. `ValidationProblemDetails` (RFC 7807) — `{ title, status, errors: {...} }`,
 *    produzido pelo próprio [ApiController] quando o model binding falha
 *    (JSON malformado, `{id}` que não é GUID, `page=abc`).
 *
 * Estas funções normalizam os dois em uma lista de mensagens.
 */

function isResponseErrorJson(body: unknown): body is ResponseErrorJson {
  return (
    typeof body === 'object' &&
    body !== null &&
    Array.isArray((body as ResponseErrorJson).errors)
  );
}

function isProblemDetails(body: unknown): body is { errors: Record<string, string[]>; title?: string } {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as { errors?: unknown }).errors === 'object' &&
    !Array.isArray((body as { errors?: unknown }).errors)
  );
}

export function extractErrorMessages(error: HttpErrorResponse): string[] {
  const body: unknown = error.error;

  if (isResponseErrorJson(body)) return body.errors;

  if (isProblemDetails(body)) {
    const messages = Object.values(body.errors).flat();
    return messages.length > 0 ? messages : [body.title ?? 'Requisição inválida.'];
  }

  if (error.status === 0) {
    return ['Não foi possível conectar ao servidor. Verifique sua conexão.'];
  }

  return ['Ocorreu um erro inesperado. Tente novamente.'];
}

/**
 * Só é `true` quando o backend sinalizou explicitamente sessão expirada.
 * Um 401 sem essa flag significa "não autenticado", que é uma situação
 * diferente e merece outra mensagem.
 */
export function isAccessTokenExpired(error: HttpErrorResponse): boolean {
  const body: unknown = error.error;
  return isResponseErrorJson(body) && body.accessTokenExpired === true;
}
