import {
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  forwardRef,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Caixa de texto com formatação, ligada ao formulário reativo como qualquer
 * outro controle: `<app-editor-texto formControlName="description" />`.
 *
 * O valor que sai daqui é HTML, e ele NÃO é confiável — o navegador é do
 * usuário, e o painel não é o único caminho até a API. Quem higieniza é o
 * backend, ao salvar. O que este componente faz é limitar o que a barra de
 * ferramentas oferece, o que é conveniência, não segurança.
 *
 * `ViewEncapsulation.None` porque o Quill cria os próprios elementos em tempo
 * de execução: eles não recebem o atributo do componente, e um CSS encapsulado
 * não os alcançaria.
 */
@Component({
  selector: 'app-editor-texto',
  templateUrl: './editor-texto.html',
  styleUrl: './editor-texto.css',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorTexto),
      multi: true,
    },
  ],
})
export class EditorTexto implements ControlValueAccessor {
  private readonly caixa = viewChild.required<ElementRef<HTMLDivElement>>('caixa');

  /** Só existe no navegador; durante o prerender fica nulo. */
  private editor: { root: HTMLElement; enable: (ativo: boolean) => void } | null = null;

  /** Guarda o que chegou antes de o editor existir, para aplicar na criação. */
  private valorPendente = '';
  private aplicandoDeFora = false;

  readonly carregando = signal(true);

  private aoMudar: (valor: string) => void = () => undefined;
  private aoTocar: () => void = () => undefined;

  constructor() {
    afterNextRender(async () => {
      const { default: Quill } = await import('quill');

      const instancia = new Quill(this.caixa().nativeElement, {
        theme: 'snow',
        placeholder: 'Descreva o documento…',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'bullet' }, { list: 'ordered' }],
            ['link'],
            ['clean'],
          ],
        },
      });

      instancia.on('text-change', () => {
        // Evita devolver ao formulário o que o próprio formulário acabou de
        // escrever, que ligaria os dois num laço.
        if (this.aplicandoDeFora) return;

        const html = instancia.root.innerHTML;
        this.aoMudar(instancia.getText().trim().length === 0 ? '' : html);
        this.aoTocar();
      });

      this.editor = instancia;
      this.escrever(this.valorPendente);
      this.carregando.set(false);
    });
  }

  writeValue(valor: string | null): void {
    const html = valor ?? '';

    if (this.editor === null) {
      this.valorPendente = html;
      return;
    }

    this.escrever(html);
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.editor?.enable(desabilitado === false);
  }

  private escrever(html: string): void {
    if (this.editor === null) return;

    this.aplicandoDeFora = true;
    this.editor.root.innerHTML = html;
    this.aplicandoDeFora = false;
  }
}
