import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Banner } from '../banner/banner';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

interface ChromeState {
  titulo: string;
  comBanner: boolean;
}

/**
 * Casca das páginas públicas: cabeçalho, hero, conteúdo da rota e rodapé.
 * No site legado esses três pedaços eram injetados por jQuery `.load()` em
 * cada página, o que fazia o cabeçalho aparecer só depois do primeiro paint.
 */
@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, Header, Footer, Banner],
  templateUrl: './public-layout.html',
})
export class PublicLayout {
  private readonly router = inject(Router);

  readonly chrome = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.readChromeState()),
    ),
    {
      initialValue: {
        titulo: '',
        comBanner: false,
      } satisfies ChromeState,
    },
  );

  private readChromeState(): ChromeState {
    let route: ActivatedRoute | null = this.router.routerState.root;

    while (route?.firstChild) {
      route = route.firstChild;
    }

    return {
      titulo: route?.snapshot.title ?? '',
      comBanner: route?.snapshot.data?.['comBanner'] === true,
    };
  }
}
