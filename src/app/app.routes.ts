import { Routes } from '@angular/router';
import { PublicLayout } from './layout/public-layout/public-layout';
import { authGuard, permissionGuard } from './core/auth/auth.guard';
import { PERMISSIONS } from './core/models/api.models';

/**
 * Os títulos são exatamente os que o site legado tinha na tag <title>, porque
 * é esse texto que aparece no hero das páginas internas. `comBanner: false`
 * fica reservado para a home, que usa o carrossel no lugar do hero.
 */
export const routes: Routes = [
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'documentos' },
      {
        path: 'documentos',
        title: 'Documentos',
        loadComponent: () =>
          import('./pages/admin/documentos/documentos').then((m) => m.Documentos),
      },
      {
        path: 'categorias',
        title: 'Categorias',
        canActivate: [
          permissionGuard([
            PERMISSIONS.categoriesCreate,
            PERMISSIONS.categoriesUpdate,
            PERMISSIONS.categoriesDelete,
          ]),
        ],
        loadComponent: () =>
          import('./pages/admin/categorias/categorias').then((m) => m.Categorias),
      },
      {
        path: 'usuarios',
        title: 'Usuários',
        canActivate: [permissionGuard([PERMISSIONS.usersRead])],
        loadComponent: () => import('./pages/admin/usuarios/usuarios').then((m) => m.Usuarios),
      },
      {
        path: 'perfis',
        title: 'Perfis',
        canActivate: [permissionGuard([PERMISSIONS.profilesRead])],
        loadComponent: () => import('./pages/admin/perfis/perfis').then((m) => m.Perfis),
      },
      {
        path: 'papeis',
        title: 'Papéis',
        canActivate: [permissionGuard([PERMISSIONS.rolesRead])],
        loadComponent: () => import('./pages/admin/papeis/papeis').then((m) => m.Papeis),
      },
    ],
  },
  // Precisa vir depois de /login e /admin: o curinga do final engoliria as
  // duas se este bloco fosse avaliado primeiro.
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        title: 'Página Inicial',
        data: { comBanner: false },
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'consultas',
        title: 'Consultas',
        data: { comBanner: true },
        loadComponent: () => import('./pages/consultas/consultas').then((m) => m.Consultas),
      },
      {
        path: 'exames',
        title: 'Exames',
        data: { comBanner: true },
        loadComponent: () => import('./pages/exames/exames').then((m) => m.Exames),
      },
      {
        path: 'sobre-nos',
        title: 'Sobre Nós',
        data: { comBanner: true },
        loadComponent: () => import('./pages/sobre-nos/sobre-nos').then((m) => m.SobreNos),
      },
      {
        path: 'fale-conosco',
        title: 'Fale Conosco',
        data: { comBanner: true },
        loadComponent: () =>
          import('./pages/fale-conosco/fale-conosco').then((m) => m.FaleConosco),
      },
      {
        path: 'lgpd-politica-privacidade',
        title: 'LGPD e Política de Privacidade',
        data: { comBanner: true },
        loadComponent: () => import('./pages/lgpd/lgpd').then((m) => m.Lgpd),
      },
      {
        path: 'transparencia/:slug',
        title: 'Transparência',
        data: { comBanner: true },
        loadComponent: () =>
          import('./pages/transparencia/transparencia').then((m) => m.Transparencia),
      },
      {
        path: '**',
        title: 'Página não encontrada',
        data: { comBanner: false },
        loadComponent: () =>
          import('./pages/nao-encontrado/nao-encontrado').then((m) => m.NaoEncontrado),
      },
    ],
  },
];
