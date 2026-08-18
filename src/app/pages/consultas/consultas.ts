import { Component } from '@angular/core';
import { CONSULTAS } from '../../shared/data/consultas.data';

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.html',
  styleUrl: './consultas.css',
})
export class Consultas {
  readonly consultas = CONSULTAS;
}
