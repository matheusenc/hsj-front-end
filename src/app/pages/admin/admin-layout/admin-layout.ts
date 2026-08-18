import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../core/models/api.models';

/**
 * Casca do painel. As abas substituem o `setupTabListeners()` do admin.js
 * legado, que trocava conteúdo na mesma página — agora cada aba é uma rota.
 *
 * O menu é montado a partir das permissões que vêm de GET /users/me, então
 * um Editor enxerga só Documentos.
 */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrls: ['../admin-shared.css', './admin-layout.css'],
})
export class AdminLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuario = this.auth.currentUser;

  readonly abas = computed(() => {
    const permissoes = this.usuario()?.permissions ?? [];
    const tem = (...requeridas: string[]) =>
      requeridas.some((permissao) => permissoes.includes(permissao));

    return [
      { rota: 'documentos', rotulo: 'Documentos', visivel: true },
      {
        rota: 'categorias',
        rotulo: 'Categorias',
        visivel: tem(
          PERMISSIONS.categoriesCreate,
          PERMISSIONS.categoriesUpdate,
          PERMISSIONS.categoriesDelete,
        ),
      },
      { rota: 'usuarios', rotulo: 'Usuários', visivel: tem(PERMISSIONS.usersRead) },
      { rota: 'perfis', rotulo: 'Perfis', visivel: tem(PERMISSIONS.profilesRead) },
      { rota: 'papeis', rotulo: 'Papéis', visivel: tem(PERMISSIONS.rolesRead) },
    ].filter((aba) => aba.visivel);
  });

  constructor() {
    // O guard garante o token, mas não o /users/me — numa entrada direta por
    // URL o usuário ainda não foi carregado.
    if (this.auth.currentUser() === null) {
      this.auth.loadCurrentUser().subscribe({ error: () => undefined });
    }
  }

  sair(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
