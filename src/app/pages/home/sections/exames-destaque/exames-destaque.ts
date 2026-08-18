import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EXAMES_DESTAQUE } from '../../../../shared/data/home.data';

@Component({
  selector: 'app-exames-destaque',
  imports: [RouterLink],
  templateUrl: './exames-destaque.html',
  styleUrl: './exames-destaque.css',
})
export class ExamesDestaque {
  readonly exames = EXAMES_DESTAQUE;
}
