import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, catchError, map, of, shareReplay, startWith, switchMap } from 'rxjs';
import { CategoriesService } from '../../core/services/categories.service';
import { DocumentsService } from '../../core/services/documents.service';
import { ResponseDocumentsJson } from '../../core/models/api.models';

const PAGE_SIZE = 9;

interface ListaState {
  carregando: boolean;
  erro: boolean;
  dados: ResponseDocumentsJson | null;
}

/**
 * Substitui a consulta direta ao Firestore que existia em transparencia.js.
 *
 * Duas diferenças herdadas da API: a categoria agora vem pela URL como path
 * param (`/transparencia/convenio` em vez de `?cat=convenio`) e a paginação é
 * numerada, porque a resposta traz totalCount e totalPages — o Firestore só
 * permitia avançar por cursor.
 */
@Component({
  selector: 'app-transparencia',
  templateUrl: './transparencia.html',
  styleUrl: './transparencia.css',
})
export class Transparencia {
  private readonly route = inject(ActivatedRoute);
  private readonly categoriesService = inject(CategoriesService);
  private readonly documentsService = inject(DocumentsService);

  private readonly pagina$ = new BehaviorSubject(1);

  private readonly categorias$ = this.categoriesService
    .list()
    .pipe(catchError(() => of([])), shareReplay(1));

  /** O título vinha de um mapa fixo no JS legado; agora é o nome da categoria. */
  readonly titulo = toSignal(
    combineLatest([this.route.paramMap, this.categorias$]).pipe(
      map(([params, categorias]) => {
        const slug = params.get('slug');
        return categorias.find((categoria) => categoria.slug === slug)?.name ?? 'Documentos';
      }),
    ),
    { initialValue: 'Documentos' },
  );

  readonly state = toSignal(
    combineLatest([this.route.paramMap, this.pagina$]).pipe(
      switchMap(([params, pagina]) =>
        this.documentsService
          .list({ categorySlug: params.get('slug') ?? '', page: pagina, pageSize: PAGE_SIZE })
          .pipe(
            map((dados): ListaState => ({ carregando: false, erro: false, dados })),
            catchError(() => of<ListaState>({ carregando: false, erro: true, dados: null })),
            startWith<ListaState>({ carregando: true, erro: false, dados: null }),
          ),
      ),
    ),
    { initialValue: { carregando: true, erro: false, dados: null } satisfies ListaState },
  );

  irPara(pagina: number): void {
    this.pagina$.next(pagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  urlDownload(relativeDownloadUrl: string): string {
    return this.documentsService.downloadUrl(relativeDownloadUrl);
  }

  /**
   * A API entrega DateOnly como 'YYYY-MM-DD'. Formatar a string direto evita o
   * deslocamento de um dia que aparece ao passar por `new Date` em fusos
   * negativos, que é o Brasil inteiro.
   */
  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}
