import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { RolesService } from '../../../core/services/roles.service';
import { PERMISSIONS, ResponseRoleJson } from '../../../core/models/api.models';
import { extractErrorMessages } from '../../../core/api/api-error';

/**
 * Catálogo de permissões. Os 18 papéis semeados pelo backend vêm marcados como
 * `isSystem` e não podem ser alterados — esta tela existe para consultá-los e
 * para criar papéis próprios, caso a API ganhe novos recursos.
 */
@Component({
  selector: 'app-admin-papeis',
  imports: [ReactiveFormsModule],
  templateUrl: './papeis.html',
  styleUrls: ['../admin-shared.css', './papeis.css'],
})
export class Papeis {
  private readonly formBuilder = inject(FormBuilder);
  private readonly rolesService = inject(RolesService);
  private readonly auth = inject(AuthService);

  readonly papeis = signal<ResponseRoleJson[]>([]);
  readonly erros = signal<string[]>([]);
  readonly sucesso = signal('');
  readonly salvando = signal(false);
  readonly editandoId = signal<string | null>(null);

  readonly podeCriar = computed(() => this.auth.hasPermission(PERMISSIONS.rolesCreate));
  readonly podeEditar = computed(() => this.auth.hasPermission(PERMISSIONS.rolesUpdate));
  readonly podeExcluir = computed(() => this.auth.hasPermission(PERMISSIONS.rolesDelete));

  readonly form = this.formBuilder.nonNullable.group({
    // O backend exige o formato recurso:acao e recusa alteração depois da criação.
    key: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+:[a-z0-9-]+$/)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
  });

  constructor() {
    this.carregar();
  }

  private carregar(): void {
    this.rolesService.list().subscribe({
      next: (papeis) => this.papeis.set(papeis),
      error: (error: HttpErrorResponse) => this.erros.set(extractErrorMessages(error)),
    });
  }

  salvar(): void {
    const editando = this.editandoId();

    // Na edição a chave é imutável, então ela sai da validação.
    if (editando !== null) this.form.controls.key.disable({ emitEvent: false });

    if (this.form.invalid || this.salvando()) {
      this.form.markAllAsTouched();
      this.form.controls.key.enable({ emitEvent: false });
      return;
    }

    this.salvando.set(true);
    this.erros.set([]);
    this.sucesso.set('');

    const valores = this.form.getRawValue();

    const operacao: Observable<unknown> =
      editando === null
        ? this.rolesService.create(valores)
        : this.rolesService.update(editando, {
            name: valores.name,
            description: valores.description,
          });

    operacao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.sucesso.set(editando === null ? 'Papel criado.' : 'Papel atualizado.');
        this.cancelarEdicao();
        this.carregar();
      },
      error: (error: HttpErrorResponse) => {
        this.salvando.set(false);
        this.form.controls.key.enable({ emitEvent: false });
        this.erros.set(extractErrorMessages(error));
      },
    });
  }

  editar(papel: ResponseRoleJson): void {
    this.editandoId.set(papel.id);
    this.erros.set([]);
    this.sucesso.set('');
    this.form.setValue({ key: papel.key, name: papel.name, description: papel.description });
    this.form.controls.key.disable({ emitEvent: false });
  }

  excluir(papel: ResponseRoleJson): void {
    if (!confirm(`Excluir o papel "${papel.name}"?`)) return;

    this.rolesService.delete(papel.id).subscribe({
      next: () => {
        this.sucesso.set('Papel excluído.');
        this.carregar();
      },
      error: (error: HttpErrorResponse) => this.erros.set(extractErrorMessages(error)),
    });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.form.controls.key.enable({ emitEvent: false });
    this.form.reset({ key: '', name: '', description: '' });
  }
}
