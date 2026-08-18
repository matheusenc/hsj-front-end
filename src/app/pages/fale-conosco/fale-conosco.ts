import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { inject } from '@angular/core';

/**
 * A ouvidoria continua sendo um formulário do Google Forms embutido, como no
 * site legado — nada aqui passa pela API.
 */
@Component({
  selector: 'app-fale-conosco',
  templateUrl: './fale-conosco.html',
  styleUrl: './fale-conosco.css',
})
export class FaleConosco {
  private readonly sanitizer = inject(DomSanitizer);

  readonly formularioUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://docs.google.com/forms/d/1L4_oOK2gq_Ip0m7Ilj_QLiKFFfsPA6Hk16b8l-ULdgQ/viewform?embedded=true',
  );
}
