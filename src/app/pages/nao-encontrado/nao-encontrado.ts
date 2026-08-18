import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Página nova: o site legado não tinha 404 próprio — o servidor devolvia o
 * erro padrão da hospedagem.
 */
@Component({
  selector: 'app-nao-encontrado',
  imports: [RouterLink],
  templateUrl: './nao-encontrado.html',
  styleUrl: './nao-encontrado.css',
})
export class NaoEncontrado {}
