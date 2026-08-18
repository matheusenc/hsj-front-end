import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { redirect: state.url, motivo: 'necessario' },
  });
};

/**
 * Libera a rota se o usuário tiver ao menos uma das permissões informadas.
 * Use em conjunto com o authGuard: este assume que já há sessão válida.
 *
 * Uso: `canActivate: [authGuard, permissionGuard([PERMISSIONS.usersRead])]`
 */
export function permissionGuard(permissions: readonly string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasAnyPermission(permissions)) return true;

    return router.createUrlTree(['/admin']);
  };
}
