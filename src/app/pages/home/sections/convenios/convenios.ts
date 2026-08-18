import { Component } from '@angular/core';
import { CONVENIOS } from '../../../../shared/data/home.data';

@Component({
  selector: 'app-convenios',
  templateUrl: './convenios.html',
  styleUrl: './convenios.css',
})
export class Convenios {
  readonly convenios = CONVENIOS;
}
