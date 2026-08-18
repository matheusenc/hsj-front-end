import { Component, input } from '@angular/core';

/**
 * Hero das páginas internas. No site legado o texto vinha de
 * carregaTituloBanner.js, que copiava a tag <title> da página; aqui o mesmo
 * texto chega pelo `title` da rota, preservando a equivalência.
 */
@Component({
  selector: 'app-banner',
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner {
  readonly titulo = input.required<string>();
}
