export interface Exame {
  readonly titulo: string;
  readonly imagem: string;
  readonly alt: string;
}

/**
 * Conteúdo extraído do markup de public_html/exames.html, onde os oito cards
 * eram escritos à mão e só variavam em título e imagem. O backend não modela
 * exames, então isto continua sendo conteúdo do próprio front — editar a lista
 * aqui basta para mudar a página.
 *
 * Endoscopia e Colonoscopia dividem a mesma foto, como no site original.
 */
export const EXAMES: readonly Exame[] = [
  { titulo: 'Endoscopia', imagem: 'endocolo.webp', alt: 'Sala de endoscopia' },
  { titulo: 'Colonoscopia', imagem: 'endocolo.webp', alt: 'Sala de colonoscopia' },
  { titulo: 'Eletrocardiograma', imagem: 'eletro.webp', alt: 'Aparelho de eletrocardiograma' },
  { titulo: 'Raio-x', imagem: 'raiox.webp', alt: 'Sala de raio-x' },
  { titulo: 'Mamografia', imagem: 'mamografia.webp', alt: 'Aparelho de mamografia' },
  { titulo: 'Ultrassom', imagem: 'ultrassom.webp', alt: 'Aparelho de ultrassom' },
  { titulo: 'Audiometria', imagem: 'audiometria.webp', alt: 'Cabine de audiometria' },
  { titulo: 'Análises Clínicas', imagem: 'lab.webp', alt: 'Laboratório de análises clínicas' },
];
