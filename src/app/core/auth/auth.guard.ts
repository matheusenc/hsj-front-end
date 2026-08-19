import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, of } from 'rxjs';
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
 *
 * As permissões vivem em `currentUser`, que só é preenchido por GET /users/me.
 * Num F5 dentro do painel a sessão é restaurada do localStorage, mas o usuário
 * não — e sem carregá-lo aqui o guard negava toda rota protegida a quem tem
 * todas as permissões. O AdminLayout até carrega o usuário, só que depois,
 * quando a rota já foi recusada.
 */
export function permissionGuard(permissions: readonly string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const decidir = (): boolean | UrlTree =>
      auth.hasAnyPermission(permissions) ? true : router.createUrlTree(['/admin']);

    if (auth.currentUser() !== null) return decidir();

    return auth.loadCurrentUser().pipe(
      map(() => decidir()),
      catchError(() => of(router.createUrlTree(['/admin']))),
    );
  };
}
