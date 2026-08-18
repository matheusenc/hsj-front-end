import { Component } from '@angular/core';
import { CarrosselBanner } from './sections/carrossel-banner/carrossel-banner';
import { SobreNosHome } from './sections/sobre-nos-home/sobre-nos-home';
import { ConsultasDestaque } from './sections/consultas-destaque/consultas-destaque';
import { ExamesDestaque } from './sections/exames-destaque/exames-destaque';
import { Convenios } from './sections/convenios/convenios';
import { Ouvidoria } from './sections/ouvidoria/ouvidoria';

/**
 * A home é só a composição das seções. O recorte segue o mesmo do CSS legado
 * (css/index/secao-*.css), o que manteve a extração de estilo mecânica.
 */
@Component({
  selector: 'app-home',
  imports: [CarrosselBanner, SobreNosHome, ConsultasDestaque, ExamesDestaque, Convenios, Ouvidoria],
  templateUrl: './home.html',
})
export class Home {}
