import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

const SITE_NAME = 'Hospital São José';

/**
 * O `title` da rota é usado cru no hero das páginas internas — é o mesmo texto
 * que o site legado copiava da tag <title>. Para o navegador e para o Google,
 * porém, o nome do hospital precisa aparecer, então o sufixo é aplicado só ao
 * título do documento.
 */
@Injectable({ providedIn: 'root' })
export class HospitalTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot);

    this.title.setTitle(
      routeTitle === undefined ? SITE_NAME : `${routeTitle} | ${SITE_NAME}`,
    );
  }
}
