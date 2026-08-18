import { Component } from '@angular/core';

/**
 * Carrossel de topo e os dois cards sobrepostos (Emergência e Consultas).
 * O carrossel é o componente nativo do Bootstrap, acionado por data-bs-ride —
 * o bundle JS do Bootstrap é carregado globalmente pelo angular.json.
 */
@Component({
  selector: 'app-carrossel-banner',
  templateUrl: './carrossel-banner.html',
  styleUrl: './carrossel-banner.css',
})
export class CarrosselBanner {}
