import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * As páginas institucionais são prerenderizadas no build — é conteúdo estático
 * e o Google precisa enxergá-lo.
 *
 * Transparência fica em client render porque prerenderizá-la exigiria a API no
 * ar durante o build, acoplando o deploy do site ao do backend. Quando o
 * acervo estabilizar, dá para migrá-la para Prerender com getPrerenderParams.
 *
 * Login e admin dependem de token e nunca devem virar HTML estático.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'consultas', renderMode: RenderMode.Prerender },
  { path: 'exames', renderMode: RenderMode.Prerender },
  { path: 'sobre-nos', renderMode: RenderMode.Prerender },
  { path: 'fale-conosco', renderMode: RenderMode.Prerender },
  { path: 'lgpd-politica-privacidade', renderMode: RenderMode.Prerender },

  { path: 'transparencia/:slug', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },

  { path: '**', renderMode: RenderMode.Client },
];
