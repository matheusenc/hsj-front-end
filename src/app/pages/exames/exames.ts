import { Component } from '@angular/core';
import { EXAMES } from '../../shared/data/exames.data';

@Component({
  selector: 'app-exames',
  templateUrl: './exames.html',
  styleUrl: './exames.css',
})
export class Exames {
  readonly exames = EXAMES;
}
