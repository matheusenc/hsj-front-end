import { Component, HostBinding, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  host: {
    '(window:scroll)': 'onScroll()',
  },
})
export class Footer {
  @HostBinding('class.section__footer') readonly sectionClass = true;

  /**
   * Reproduz o comportamento do fadeIn/fadeOut do jQuery em carregaRodape.js:
   * o botão aparece depois de 50px de rolagem. Como o projeto é zoneless, o
   * estado precisa ser um signal — mutar o DOM direto não redesenharia nada.
   */
  readonly showBackToTop = signal(false);

  onScroll(): void {
    this.showBackToTop.set(window.scrollY > 50);
  }

  backToTop(event: Event): void {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
