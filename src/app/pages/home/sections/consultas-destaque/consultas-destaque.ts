import { Component, afterNextRender, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONSULTAS_DESTAQUE, PSICOLOGOS } from '../../../../shared/data/home.data';

@Component({
  selector: 'app-consultas-destaque',
  imports: [RouterLink],
  templateUrl: './consultas-destaque.html',
  styleUrl: './consultas-destaque.css',
})
export class ConsultasDestaque {
  readonly consultas = CONSULTAS_DESTAQUE;

  /**
   * O site legado sorteava o nome do psicólogo num script inline. O sorteio
   * roda só depois da primeira renderização: se acontecesse antes, o HTML
   * prerenderizado traria um nome e o cliente outro, quebrando a hidratação.
   * O valor inicial é o mesmo que estava fixo no markup original.
   */
  readonly psicologo = signal(PSICOLOGOS[0]);

  constructor() {
    afterNextRender(() => {
      const sorteado = PSICOLOGOS[Math.floor(Math.random() * PSICOLOGOS.length)];
      if (sorteado !== undefined) this.psicologo.set(sorteado);
    });
  }
}
