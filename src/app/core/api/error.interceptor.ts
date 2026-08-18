import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { isAccessTokenExpired } from './api-error';

/**
 * Trata os três desfechos de autorização da API de forma distinta:
 *
 * - 401 com accessTokenExpired = true  → sessão expirou, refazer login;
 * - 401 com accessTokenExpired = false → não autenticado;
 * - 403                                → autenticado porém sem permissão.
 *
 * O 403 deliberadamente NÃO desloga: quem está logado e esbarra numa tela
 * proibida deve continuar logado e apenas ver a mensagem.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const expired = isAccessTokenExpired(error);
        auth.logout();

        void router.navigate(['/login'], {
          queryParams: {
            redirect: router.url,
            motivo: expired ? 'expirada' : 'necessario',
          },
        });
      }

      return throwError(() => error);
    }),
  );
};
