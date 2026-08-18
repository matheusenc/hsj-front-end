import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { CategoriesService } from '../../../core/services/categories.service';
import {
  DocumentsService,
  MAX_FILE_SIZE_IN_BYTES,
} from '../../../core/services/documents.service';
import {
  PERMISSIONS,
  ResponseCategoryJson,
  ResponseDocumentJson,
} from '../../../core/models/api.models';
import { extractErrorMessages } from '../../../core/api/api-error';

const PAGE_SIZE = 10;

/**
 * Substitui o admin.js legado, que só criava e excluía documentos apontando
 * para links do Google Drive. Agora o PDF é enviado para a API e a edição de
 * metadados passa a existir (PUT /documents/{id}).
 */
@Component({
  selector: 'app-admin-documentos',
  imports: [ReactiveFormsModule],
  templateUrl: './documentos.html',
  styleUrls: ['../admin-shared.css', './documentos.css'],
})
export class Documentos {
  private readonly formBuilder = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);
  private readonly documentsService = inject(DocumentsService);
  private readonly auth = inject(AuthService);

  readonly categorias = signal<ResponseCategoryJson[]>([]);
  readonly documentos = signal<ResponseDocumentJson[]>([]);
  readonly pagina = signal(1);
  readonly totalPaginas = signal(1);
  readonly abaSlug = signal<string>('');

  readonly erros = signal<string[]>([]);
  readonly sucesso = signal('');
  readonly salvando = signal(false);
  readonly carregando = signal(false);
  readonly editandoId = signal<string | null>(null);

  readonly podeCriar = computed(() => this.auth.hasPermission(PERMISSIONS.documentsCreate));
  readonly podeEditar = computed(() => this.auth.hasPermission(PERMISSIONS.documentsUpdate));
  readonly podeExcluir = computed(() => this.auth.hasPermission(PERMISSIONS.documentsDelete));

  arquivo: File | null = null;

  readonly form = this.formBuilder.nonNullable.group({
    categoryId: ['', [Validators.required]],
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    externalLink: [''],
    publicationDate: ['', [Validators.required]],
    paymentDate: [''],
  });

  constructor() {
    this.carregarCategorias();
  }

  private carregarCategorias(): void {
    this.categoriesService.list().subscribe({
      next: (categorias) => {
        const ordenadas = [...categorias].sort((a, b) => a.displayOrder - b.displayOrder);
        this.categorias.set(ordenadas);

        const primeira = ordenadas[0];
        if (primeira !== undefined) {
          this.abaSlug.set(primeira.slug);
          this.form.patchValue({ categoryId: primeira.id });
          this.carregarDocumentos();
        }
      },
      error: (error: HttpErrorResponse) => this.erros.set(extractErrorMessages(error)),
    });
  }

  trocarAba(slug: string): void {
    this.abaSlug.set(slug);
    this.pagina.set(1);
    this.carregarDocumentos();
  }

  irPara(pagina: number): void {
    this.pagina.set(pagina);
    this.carregarDocumentos();
  }

  private carregarDocumentos(): void {
    this.carregando.set(true);

    this.documentsService
      .list({ categorySlug: this.abaSlug(), page: this.pagina(), pageSize: PAGE_SIZE })
      .subscribe({
        next: (resposta) => {
          this.documentos.set(resposta.documents);
          this.totalPaginas.set(resposta.totalPages);
          this.carregando.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.carregando.set(false);
          this.erros.set(extractErrorMessages(error));
        },
      });
  }

  aoEscolherArquivo(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const escolhido = entrada.files?.[0] ?? null;

    if (escolhido !== null && escolhido.size > MAX_FILE_SIZE_IN_BYTES) {
      // Validado aqui porque acima de 26 MiB o ASP.NET derruba a requisição
      // antes da action e o erro chega como 500 genérico.
      this.erros.set(['O arquivo deve ter no máximo 25 MB.']);
      entrada.value = '';
      this.arquivo = null;
      return;
    }

    this.erros.set([]);
    this.arquivo = escolhido;
  }

  salvar(): void {
    if (this.form.invalid || this.salvando()) {
      this.form.markAllAsTouched();
      return;
    }

    const editando = this.editandoId();

    if (editando === null && this.arquivo === null) {
      this.erros.set(['O arquivo é obrigatório.']);
      return;
    }

    this.salvando.set(true);
    this.erros.set([]);
    this.sucesso.set('');

    const valores = this.form.getRawValue();
    const requisicao = {
      categoryId: valores.categoryId,
      title: valores.title,
      description: valores.description,
      externalLink: valores.externalLink || null,
      publicationDate: valores.publicationDate,
      paymentDate: valores.paymentDate || null,
    };

    const operacao: Observable<unknown> =
      editando === null
        ? this.documentsService.create(requisicao, this.arquivo!)
        : this.documentsService.update(editando, requisicao, this.arquivo);

    operacao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.sucesso.set(
          editando === null ? 'Documento publicado.' : 'Documento atualizado.',
        );
        this.limparFormulario();
        this.carregarDocumentos();
      },
      error: (error: HttpErrorResponse) => {
        this.salvando.set(false);
        this.erros.set(extractErrorMessages(error));
      },
    });
  }

  editar(documento: ResponseDocumentJson): void {
    this.editandoId.set(documento.id);
    this.arquivo = null;
    this.erros.set([]);
    this.sucesso.set('');

    this.form.setValue({
      categoryId: documento.category.id,
      title: documento.title,
      description: documento.description,
      externalLink: documento.externalLink ?? '',
      publicationDate: documento.publicationDate,
      paymentDate: documento.paymentDate ?? '',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  excluir(documento: ResponseDocumentJson): void {
    if (!confirm(`Excluir o documento "${documento.title}"?`)) return;

    this.documentsService.delete(documento.id).subscribe({
      next: () => {
        this.sucesso.set('Documento excluído.');
        this.carregarDocumentos();
      },
      error: (error: HttpErrorResponse) => this.erros.set(extractErrorMessages(error)),
    });
  }

  cancelarEdicao(): void {
    this.limparFormulario();
  }

  private limparFormulario(): void {
    const categoriaAtual = this.categorias().find(
      (categoria) => categoria.slug === this.abaSlug(),
    );

    this.editandoId.set(null);
    this.arquivo = null;
    this.form.reset({
      categoryId: categoriaAtual?.id ?? '',
      title: '',
      description: '',
      externalLink: '',
      publicationDate: '',
      paymentDate: '',
    });
  }

  urlDownload(relativeDownloadUrl: string): string {
    return this.documentsService.downloadUrl(relativeDownloadUrl);
  }

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  formatarTamanho(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
}
