import { Component, HostListener, afterNextRender, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { PERMISSIONS } from '../../../core/models/api.models';

/** Mesmo ponto em que a gaveta deixa de ser gaveta e vira coluna fixa. */
const LARGURA_DESKTOP = '(min-width: 992px)';

/**
 * Casca do painel: coluna de navegação à esquerda, barra superior com o
 * usuário, e o conteúdo da rota no meio.
 *
 * O menu é montado a partir das permissões que vêm de GET /users/me, então
 * um Editor enxerga só Documentos.
 */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuario = this.auth.currentUser;

  /**
   * No celular a navegação é uma gaveta sobreposta. Estado em signal, e não
   * em classe do Bootstrap, para fechar sozinha ao trocar de rota — que numa
   * SPA não recarrega a página.
   */
  readonly menuAberto = signal(false);
  readonly ehDesktop = signal(false);

  private readonly urlAtual = signal('');

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

  /** Alimenta a trilha da barra superior sem duplicar a lista de rótulos. */
  readonly tituloAtual = computed(() => {
    const url = this.urlAtual();
    return this.abas().find((aba) => url.includes(`/admin/${aba.rota}`))?.rotulo ?? 'Painel';
  });

  readonly iniciais = computed(() => {
    const nome = this.usuario()?.name?.trim() ?? '';
    if (nome.length === 0) return '—';

    const partes = nome.split(/\s+/);
    const primeira = partes[0]?.[0] ?? '';
    const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : '';

    return `${primeira}${ultima}`.toUpperCase();
  });

  constructor() {
    this.urlAtual.set(this.router.url);

    this.router.events
      .pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((evento) => {
        this.urlAtual.set(evento.urlAfterRedirects);
        this.menuAberto.set(false);
      });

    // O guard garante o token, mas não o /users/me — numa entrada direta por
    // URL o usuário ainda não foi carregado.
    if (this.auth.currentUser() === null) {
      this.auth.loadCurrentUser().subscribe({ error: () => undefined });
    }

    afterNextRender(() => {
      const consulta = window.matchMedia(LARGURA_DESKTOP);

      this.ehDesktop.set(consulta.matches);
      consulta.addEventListener('change', (evento) => {
        this.ehDesktop.set(evento.matches);
        this.menuAberto.set(false);
      });
    });
  }

  alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  fecharMenu(): void {
    this.menuAberto.set(false);
  }

  @HostListener('document:keydown.escape')
  aoPressionarEsc(): void {
    this.fecharMenu();
  }

  sair(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
