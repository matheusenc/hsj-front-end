import { Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CategoriesService } from '../../core/services/categories.service';
import { ResponseCategoryJson } from '../../core/models/api.models';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly categoriesService = inject(CategoriesService);

  /**
   * Alimenta o dropdown de Transparência, que no site legado tinha os quatro
   * slugs escritos à mão no HTML. Carregado só no navegador: durante o
   * prerender a API não está no ar, e a lista chega depois da hidratação.
   */
  readonly categories = signal<ResponseCategoryJson[]>([]);

  constructor() {
    afterNextRender(() => {
      this.categoriesService.list().subscribe({
        next: (categories) =>
          this.categories.set(
            [...categories].sort((a, b) => a.displayOrder - b.displayOrder),
          ),
        error: () => this.categories.set([]),
      });
    });
  }
}
