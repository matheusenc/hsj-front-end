import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { PERMISSIONS, ResponseCategoryJson } from '../../../core/models/api.models';
import { extractErrorMessages } from '../../../core/api/api-error';

/**
 * Tela nova: no site legado as categorias eram uma enum de quatro strings
 * repetida em quatro lugares diferentes do código. Agora vêm da API, e o que
 * for criado aqui aparece direto no menu Transparência do site.
 */
@Component({
  selector: 'app-admin-categorias',
  imports: [ReactiveFormsModule],
  templateUrl: './categorias.html',
  styleUrls: ['../admin-shared.css', './categorias.css'],
})
export class Categorias {
  private readonly formBuilder = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);
  private readonly auth = inject(AuthService);

  readonly categorias = signal<ResponseCategoryJson[]>([]);
  readonly erros = signal<string[]>([]);
  readonly sucesso = signal('');
  readonly salvando = signal(false);
  readonly editandoId = signal<string | null>(null);

  readonly podeCriar = computed(() => this.auth.hasPermission(PERMISSIONS.categoriesCreate));
  readonly podeEditar = computed(() => this.auth.hasPermission(PERMISSIONS.categoriesUpdate));
  readonly podeExcluir = computed(() => this.auth.hasPermission(PERMISSIONS.categoriesDelete));

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    // O backend valida o slug contra ^[a-z0-9-]+$ com no máximo 60 caracteres.
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/), Validators.maxLength(60)]],
    displayOrder: [1, [Validators.required]],
  });

  constructor() {
    this.carregar();
  }

  private carregar(): void {
    this.categoriesService.list().subscribe({
      next: (categorias) =>
        this.categorias.set([...categorias].sort((a, b) => a.displayOrder - b.displayOrder)),
      error: (error: HttpErrorResponse) => this.erros.set(extractErrorMessages(error)),
    });
  }

  salvar(): void {
    if (this.form.invalid || this.salvando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.erros.set([]);
    this.sucesso.set('');

    const editando = this.editandoId();
    const valores = this.form.getRawValue();

    const operacao: Observable<unknown> =
      editando === null
        ? this.categoriesService.create(valores)
        : this.categoriesService.update(editando, valores);

    operacao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.sucesso.set(editando === null ? 'Categoria criada.' : 'Categoria atualizada.');
        this.cancelarEdicao();
        this.carregar();
      },
      error: (error: HttpErrorResponse) => {
        this.salvando.set(false);
        this.erros.set(extractErrorMessages(error));
      },
    });
  }

  editar(categoria: ResponseCategoryJson): void {
    this.editandoId.set(categoria.id);
    this.erros.set([]);
    this.sucesso.set('');
    this.form.setValue({
      name: categoria.name,
      slug: categoria.slug,
      displayOrder: categoria.displayOrder,
    });
  }

  excluir(categoria: ResponseCategoryJson): void {
    if (!confirm(`Excluir a categoria "${categoria.name}"?`)) return;

    this.categoriesService.delete(categoria.id).subscribe({
      next: () => {
        this.sucesso.set('Categoria excluída.');
        this.carregar();
      },
      // O backend recusa com 400 se ainda houver documento ativo na categoria.
      error: (error: HttpErrorResponse) => this.erros.set(extractErrorMessages(error)),
    });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.form.reset({ name: '', slug: '', displayOrder: 1 });
  }
}
