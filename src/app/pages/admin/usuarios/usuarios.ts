import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { UsersService } from '../../../core/services/users.service';
import { ProfilesService } from '../../../core/services/profiles.service';
import {
  PERMISSIONS,
  ResponseProfileJson,
  ResponseUserJson,
} from '../../../core/models/api.models';
import { extractErrorMessages } from '../../../core/api/api-error';

const PAGE_SIZE = 20;

/** Tela nova — o admin legado não gerenciava usuários (era o Firebase Auth). */
@Component({
  selector: 'app-admin-usuarios',
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['../admin-shared.css', './usuarios.css'],
})
export class Usuarios {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly profilesService = inject(ProfilesService);
  private readonly auth = inject(AuthService);

  readonly usuarios = signal<ResponseUserJson[]>([]);
  readonly perfis = signal<ResponseProfileJson[]>([]);
  readonly pagina = signal(1);
  readonly totalPaginas = signal(1);
  readonly filtro = signal('');

  readonly erros = signal<string[]>([]);
  readonly sucesso = signal('');
  readonly salvando = signal(false);
  readonly editandoId = signal<string | null>(null);

  readonly podeCriar = computed(() => this.auth.hasPermission(PERMISSIONS.usersCreate));
  readonly podeEditar = computed(() => this.auth.hasPermission(PERMISSIONS.usersUpdate));
  readonly podeExcluir = computed(() => this.auth.hasPermission(PERMISSIONS.usersDelete));

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    profileId: ['', [Validators.required]],
  });

  constructor() {
    this.carregarPerfis();
    this.carregar();
  }

  private carregarPerfis(): void {
    this.profilesService.list().subscribe({
      next: (perfis) => this.perfis.set(perfis),
      error: () => this.perfis.set([]),
    });
  }

  private carregar(): void {
    this.usersService
      .list({ name: this.filtro() || undefined, page: this.pagina(), pageSize: PAGE_SIZE })
      .subscribe({
        next: (resposta) => {
          this.usuarios.set(resposta.users);
          this.totalPaginas.set(resposta.totalPages);
        },
        error: (error: HttpErrorResponse) => this.erros.set(extractErrorMessages(error)),
      });
  }

  filtrar(evento: Event): void {
    this.filtro.set((evento.target as HTMLInputElement).value);
    this.pagina.set(1);
    this.carregar();
  }

  irPara(pagina: number): void {
    this.pagina.set(pagina);
    this.carregar();
  }

  salvar(): void {
    if (this.form.invalid || this.salvando()) {
      this.form.markAllAsTouched();
      return;
    }

    const editando = this.editandoId();
    const valores = this.form.getRawValue();

    if (editando === null && valores.password.length === 0) {
      this.erros.set(['A senha é obrigatória para criar um usuário.']);
      return;
    }

    this.salvando.set(true);
    this.erros.set([]);
    this.sucesso.set('');

    // A API não tem endpoint para trocar a senha de outra pessoa: só o próprio
    // usuário troca a sua, em PUT /users/change-password. Por isso a senha não
    // entra no update.
    const operacao: Observable<unknown> =
      editando === null
        ? this.usersService.create({
            name: valores.name,
            email: valores.email,
            password: valores.password,
            profileId: valores.profileId,
          })
        : this.usersService.update(editando, {
            name: valores.name,
            email: valores.email,
            profileId: valores.profileId,
          });

    operacao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.sucesso.set(editando === null ? 'Usuário criado.' : 'Usuário atualizado.');
        this.cancelarEdicao();
        this.carregar();
      },
      error: (error: HttpErrorResponse) => {
        this.salvando.set(false);
        this.erros.set(extractErrorMessages(error));
      },
    });
  }

  editar(usuario: ResponseUserJson): void {
    this.editandoId.set(usuario.id);
    this.erros.set([]);
    this.sucesso.set('');
    this.form.setValue({
      name: usuario.name,
      email: usuario.email,
      password: '',
      profileId: usuario.profile.id,
    });
  }

  excluir(usuario: ResponseUserJson): void {
    if (!confirm(`Desativar o usuário "${usuario.name}"?`)) return;

    this.usersService.delete(usuario.id).subscribe({
      next: () => {
        this.sucesso.set('Usuário desativado.');
        this.carregar();
      },
      // O backend responde 403 se o usuário tentar desativar a si mesmo.
      error: (error: HttpErrorResponse) => this.erros.set(extractErrorMessages(error)),
    });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.form.reset({ name: '', email: '', password: '', profileId: '' });
  }

  formatarDataHora(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }
}
