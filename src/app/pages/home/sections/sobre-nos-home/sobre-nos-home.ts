import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ESTATISTICAS, LINHA_DO_TEMPO } from '../../../../shared/data/home.data';

/**
 * Reescreve o public_html/js/animacoes.js.
 *
 * O original manipulava `line.style.bottom` e adicionava a classe `show-me`
 * direto no DOM. Como o projeto é zoneless, mutação direta não redesenharia
 * nada — o estado virou signal e o template faz o binding. A matemática da
 * animação é a mesma: a linha rosa cresce até o alvo em 55% da altura da
 * janela, cada marco acende ao cruzar esse ponto, e ao completar dispara uma
 * única vez a contagem dos números.
 */
@Component({
  selector: 'app-sobre-nos-home',
  imports: [RouterLink],
  templateUrl: './sobre-nos-home.html',
  styleUrl: './sobre-nos-home.css',
  host: {
    '(window:scroll)': 'aoRolar()',
    '(window:resize)': 'aoRedimensionar()',
  },
})
export class SobreNosHome {
  private readonly destroyRef = inject(DestroyRef);

  readonly marcos = LINHA_DO_TEMPO;
  readonly estatisticas = ESTATISTICAS;

  private readonly timeline = viewChild.required<ElementRef<HTMLElement>>('timeline');
  private readonly badges = viewChildren<ElementRef<HTMLElement>>('badge');

  readonly linhaVisivel = signal(false);
  readonly linhaBottom = signal('100%');
  readonly badgesAtivos = signal<readonly boolean[]>([]);
  readonly numeros = signal<readonly number[]>(ESTATISTICAS.map(() => 0));

  private alvoY = 0;
  private contagemIniciada = false;
  private readonly intervalos: ReturnType<typeof setInterval>[] = [];

  constructor() {
    // Só no navegador: no prerender não existe window, e a linha nasce oculta
    // exatamente como o `display: none` do CSS original.
    afterNextRender(() => {
      this.linhaVisivel.set(true);
      this.aoRolar();
    });

    this.destroyRef.onDestroy(() => {
      for (const intervalo of this.intervalos) clearInterval(intervalo);
    });
  }

  aoRolar(): void {
    if (this.alvoY === 0) this.alvoY = window.innerHeight * 0.55;

    const distancia = this.alvoY - this.timeline().nativeElement.getBoundingClientRect().top;
    const maxima = this.distanciaMaxima();

    this.linhaBottom.set(`calc(100% - ${Math.min(distancia, maxima)}px)`);

    if (distancia > maxima && !this.contagemIniciada) {
      this.contagemIniciada = true;
      this.iniciarContagem();
    }

    this.badgesAtivos.set(
      this.badges().map((badge) => {
        const elemento = badge.nativeElement;
        return elemento.getBoundingClientRect().top + elemento.offsetHeight / 6 < this.alvoY;
      }),
    );
  }

  aoRedimensionar(): void {
    this.alvoY = window.innerHeight * 0.55;
    this.aoRolar();
  }

  /** Distância entre o topo da timeline e o último marco. */
  private distanciaMaxima(): number {
    const badges = this.badges();
    const ultimo = badges[badges.length - 1];

    if (ultimo === undefined) return 0;

    return (
      this.deslocamentoTopo(ultimo.nativeElement) -
      this.deslocamentoTopo(this.timeline().nativeElement)
    );
  }

  private deslocamentoTopo(elemento: HTMLElement): number {
    return elemento.getBoundingClientRect().top + window.scrollY;
  }

  /**
   * Contagem de 0 até o valor final em cerca de 2 segundos, do mesmo jeito que
   * o executaAnimacaoCards() legado: passo de 1 e intervalo calculado a partir
   * do total.
   */
  private iniciarContagem(): void {
    this.estatisticas.forEach((estatistica, indice) => {
      const duracao = Math.floor(2000 / estatistica.valor);
      let atual = 0;

      const intervalo = setInterval(() => {
        atual += 1;
        this.numeros.update((valores) =>
          valores.map((valor, i) => (i === indice ? atual : valor)),
        );

        if (atual >= estatistica.valor) clearInterval(intervalo);
      }, duracao);

      this.intervalos.push(intervalo);
    });
  }
}
