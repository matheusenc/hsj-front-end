import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ProfilesService } from '../../../core/services/profiles.service';
import { RolesService } from '../../../core/services/roles.service';
import {
  PERMISSIONS,
  ResponseProfileJson,
  ResponseRoleJson,
} from '../../../core/models/api.models';
import { extractErrorMessages } from '../../../core/api/api-error';

/**
 * Tela nova. Os papéis marcados aqui viram claims dentro do JWT no login, e é
 * por isso que a UI avisa que a mudança só vale na próxima entrada do usuário.
 */
@Component({
  selector: 'app-admin-perfis',
  imports: [ReactiveFormsModule],
  templateUrl: './perfis.html',
  styleUrls: ['../admin-shared.css', './perfis.css'],
})
export class Perfis {
  private readonly formBuilder = inject(FormBuilder);
  private readonly profilesService = inject(ProfilesService);
  private readonly rolesService = inject(RolesService);
  private readonly auth = inject(AuthService);

  readonly perfis = signal<ResponseProfileJson[]>([]);
  readonly papeis = signal<ResponseRoleJson[]>([]);
  readonly papeisSelecionados = signal<readonly string[]>([]);

  readonly erros = signal<string[]>([]);
  readonly sucesso = signal('');
  readonly salvando = signal(false);
  readonly editandoId = signal<string | null>(null);

  readonly podeCriar = computed(() => this.auth.hasPermission(PERMISSIONS.profilesCreate));
  readonly podeEditar = computed(() => this.auth.hasPermission(PERMISSIONS.profilesUpdate));
  readonly podeExcluir = computed(() => this.auth.hasPermission(PERMISSIONS.profilesDelete));

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
  });

  constructor() {
    this.carregar();
    this.rolesService.list().subscribe({
      next: (papeis) => this.papeis.set(papeis),
      error: () => this.papeis.set([]),
    });
  }

  private carregar(): void {
    this.profilesService.list().subscribe({
      next: (perfis) => this.perfis.set(perfis),
      error: (error: HttpErrorResponse) => this.erros.set(extractErrorMessages(error)),
    });
  }

  alternarPapel(roleId: string): void {
    this.papeisSelecionados.update((selecionados) =>
      selecionados.includes(roleId)
        ? selecionados.filter((id) => id !== roleId)
        : [...selecionados, roleId],
    );
  }

  estaSelecionado(roleId: string): boolean {
    return this.papeisSelecionados().includes(roleId);
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
    const requisicao = {
      ...this.form.getRawValue(),
      roleIds: [...this.papeisSelecionados()],
    };

    const operacao: Observable<unknown> =
      editando === null
        ? this.profilesService.create(requisicao)
        : this.profilesService.update(editando, requisicao);

    operacao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.sucesso.set(editando === null ? 'Perfil criado.' : 'Perfil atualizado.');
        this.cancelarEdicao();
        this.carregar();
      },
      error: (error: HttpErrorResponse) => {
        this.salvando.set(false);
        this.erros.set(extractErrorMessages(error));
      },
    });
  }

  editar(perfil: ResponseProfileJson): void {
    this.editandoId.set(perfil.id);
    this.erros.set([]);
    this.sucesso.set('');
    this.form.setValue({ name: perfil.name, description: perfil.description });
    this.papeisSelecionados.set(perfil.roles.map((papel) => papel.id));
  }

  excluir(perfil: ResponseProfileJson): void {
    if (!confirm(`Excluir o perfil "${perfil.name}"?`)) return;

    this.profilesService.delete(perfil.id).subscribe({
      next: () => {
        this.sucesso.set('Perfil excluído.');
        this.carregar();
      },
      // Recusado com 400 se algum usuário ativo ainda usa o perfil.
      error: (error: HttpErrorResponse) => this.erros.set(extractErrorMessages(error)),
    });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.papeisSelecionados.set([]);
    this.form.reset({ name: '', description: '' });
  }
}
