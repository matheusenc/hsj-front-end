import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { extractErrorMessages } from '../../core/api/api-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly erros = signal<string[]>([]);
  readonly enviando = signal(false);

  /** Mensagem definida pelo interceptor ao expulsar o usuário de uma rota. */
  readonly aviso = signal(this.mensagemDoMotivo());

  entrar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erros.set([]);
    this.aviso.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        // O /users/me traz as permissões que o painel usa para montar o menu.
        this.auth.loadCurrentUser().subscribe({
          next: () => this.seguir(),
          error: () => this.seguir(),
        });
      },
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        this.erros.set(extractErrorMessages(error));
      },
    });
  }

  private seguir(): void {
    const destino = this.route.snapshot.queryParamMap.get('redirect');
    void this.router.navigateByUrl(destino ?? '/admin');
  }

  private mensagemDoMotivo(): string {
    switch (this.route.snapshot.queryParamMap.get('motivo')) {
      case 'expirada':
        return 'Sua sessão expirou. Entre novamente para continuar.';
      case 'necessario':
        return 'Faça login para acessar esta página.';
      default:
        return '';
    }
  }
}
