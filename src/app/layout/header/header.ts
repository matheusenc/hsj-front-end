import {
  Component,
  ElementRef,
  HostListener,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { CategoriesService } from '../../core/services/categories.service';
import { ResponseCategoryJson } from '../../core/models/api.models';

/** Mesmo ponto de quebra do `navbar-expand-lg` do Bootstrap. */
const LARGURA_DESKTOP = '(min-width: 992px)';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly categoriesService = inject(CategoriesService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);

  /**
   * Alimenta o dropdown de Transparência, que no site legado tinha os quatro
   * slugs escritos à mão no HTML. Carregado só no navegador: durante o
   * prerender a API não está no ar, e a lista chega depois da hidratação.
   */
  readonly categories = signal<ResponseCategoryJson[]>([]);

  /**
   * O painel comprimido e o submenu são controlados aqui, e não pelos
   * `data-bs-toggle` do Bootstrap. O JavaScript do Bootstrap fecha o menu
   * quando a página recarrega — o que numa SPA nunca acontece, deixando o
   * painel aberto por cima do conteúdo depois de cada navegação.
   */
  readonly menuAberto = signal(false);
  readonly transparenciaAberta = signal(false);

  /** No desktop o submenu abre por hover; no mobile, por toque. */
  readonly ehDesktop = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.fecharTudo());

    afterNextRender(() => {
      const consulta = window.matchMedia(LARGURA_DESKTOP);

      this.ehDesktop.set(consulta.matches);
      consulta.addEventListener('change', (evento) => {
        this.ehDesktop.set(evento.matches);
        // Ao atravessar o ponto de quebra os dois painéis mudam de natureza:
        // manter qualquer um aberto deixa o menu num estado sem sentido.
        this.fecharTudo();
      });

      this.categoriesService.list().subscribe({
        next: (categories) =>
          this.categories.set([...categories].sort((a, b) => a.displayOrder - b.displayOrder)),
        error: () => this.categories.set([]),
      });
    });
  }

  alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
    this.transparenciaAberta.set(false);
  }

  alternarTransparencia(): void {
    this.transparenciaAberta.update((aberta) => !aberta);
  }

  aoEntrarNaTransparencia(): void {
    if (this.ehDesktop()) {
      this.transparenciaAberta.set(true);
    }
  }

  aoSairDaTransparencia(): void {
    if (this.ehDesktop()) {
      this.transparenciaAberta.set(false);
    }
  }

  /**
   * Chamado no clique de cada link. O `NavigationEnd` não cobre o clique no
   * item da rota em que já se está, e nesse caso o painel ficaria aberto.
   */
  fecharMenu(): void {
    this.fecharTudo();
  }

  @HostListener('document:click', ['$event'])
  aoClicarFora(evento: MouseEvent): void {
    if (this.elementRef.nativeElement.contains(evento.target) === false) {
      this.fecharTudo();
    }
  }

  @HostListener('document:keydown.escape')
  aoPressionarEsc(): void {
    this.fecharTudo();
  }

  private fecharTudo(): void {
    this.menuAberto.set(false);
    this.transparenciaAberta.set(false);
  }
}
