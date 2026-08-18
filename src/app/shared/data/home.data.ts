/**
 * Conteúdo estático da página inicial, extraído do markup de
 * public_html/index.html. Nada disso é modelado pelo backend, então segue
 * sendo conteúdo do front — editar aqui muda a home inteira.
 */

export interface MarcoHistorico {
  readonly titulo: string;
  readonly texto: string;
}

/** Os seis marcos da linha do tempo. A alternância de lado é posicional. */
export const LINHA_DO_TEMPO: readonly MarcoHistorico[] = [
  {
    titulo: 'O início',
    texto:
      'Em 1942 um grupo de pessoas reuniu-se para discutir a possibilidade de ser construído um pequeno e modesto Hospital, a fim de que nele fossem atendidos pacientes carentes.',
  },
  {
    titulo: 'Fundação',
    texto:
      'Em 18 de junho de 1944, nascia de fato, a Associação de Caridade São José, instituição que se mantém fiel a seus princípios: ser comprometida com a defesa da vida.',
  },
  {
    titulo: 'Momentos difíceis',
    texto:
      'Entretanto, durante os anos de 1971 a 1974, amargou momentos críticos, chegando a permanecer fechado neste período.',
  },
  {
    titulo: 'Reabertura',
    texto:
      'Após esse período, foi reaberto e entregue à diretoria, que permanece até os dias atuais.',
  },
  {
    titulo: 'Apoio',
    texto:
      'Para se manter atuante, contou com o apoio incondicional de pessoas da comunidade, médicos e funcionários na fase crítica de sua existência, consolidando-se ao longo dos anos como instituição filantrópica.',
  },
  {
    titulo: 'Dias atuais',
    texto:
      'O Hospital São José iniciou uma nova fase com uma administração renovada, desenvolvendo vários projetos para buscar parceiros e melhorar a qualidade de seus serviços.',
  },
];

export interface Estatistica {
  readonly valor: number;
  readonly prefixo: string;
  readonly sufixo: string;
  readonly titulo: string;
  readonly texto: string;
}

/**
 * Os números vinham do atributo `data-val` e eram animados por animacoes.js.
 * O prefixo/sufixo reproduz o `if (endValue == 70)` que existia lá.
 */
export const ESTATISTICAS: readonly Estatistica[] = [
  {
    valor: 45,
    prefixo: '+',
    sufixo: '',
    titulo: 'Leitos',
    texto: 'Enfermaria masculina, feminina e pediátrica.',
  },
  {
    valor: 70,
    prefixo: '',
    sufixo: '%',
    titulo: 'Destinado ao SUS',
    texto: 'Hospital credenciado junto ao Sistema Único de Saúde - SUS',
  },
];

export interface ConsultaDestaque {
  readonly especialidade: string;
  readonly profissional: string;
  readonly icone: string;
  /**
   * Classes de grade do card e da coluna de texto. Ficam aqui porque o markup
   * legado não era uniforme: o primeiro card tem um `col` a mais e usa
   * `col-xl-6` na coluna de texto, enquanto os outros três usam `col-xl-7`.
   * Reproduzir isso importa para o alinhamento em telas grandes.
   */
  readonly classesColuna: string;
  readonly classesTexto: string;
}

/**
 * As quatro especialidades em destaque na home. Psicologia é a única sem
 * profissional fixo: o site sorteia entre dois nomes a cada carregamento.
 */
export const CONSULTAS_DESTAQUE: readonly ConsultaDestaque[] = [
  {
    especialidade: 'Ginecologia',
    profissional: 'Larissa Cristina Ferreira',
    icone: 'fa-solid fa-person-dress fa-2x',
    classesColuna: 'col col-sm-6 col-md-6 col-lg-6',
    classesTexto: 'col-12 col-sm-12 col-md-12 col-xl-6 text-lg-center',
  },
  {
    especialidade: 'Psicologia',
    profissional: '',
    icone: 'fa-solid fa-brain fa-2x',
    classesColuna: 'col-sm-6 col-md-6 col-lg-6',
    classesTexto: 'col-12 col-sm-12 col-md-12 col-xl-7',
  },
  {
    especialidade: 'Dermatologia',
    profissional: 'Edson Pereira',
    icone: 'fa-solid fa-diagnoses fa-2x',
    classesColuna: 'col-sm-6 col-md-6 col-lg-6',
    classesTexto: 'coluna-doenca-texto col-12 col-sm-12 col-md-12 col-xl-7',
  },
  {
    especialidade: 'Fisioterapia',
    profissional: 'Andreia Sanches',
    icone: 'fa-solid fa-dumbbell fa-2x',
    classesColuna: 'col-sm-6 col-md-6 col-lg-6',
    classesTexto: 'col-12 col-sm-12 col-md-12 col-xl-7',
  },
];

export const PSICOLOGOS: readonly string[] = ['Cynthia Batista Pinto', 'Paulo de Souza Novais'];

export interface ExameDestaque {
  readonly titulo: string;
  readonly imagem: string;
}

export const EXAMES_DESTAQUE: readonly ExameDestaque[] = [
  { titulo: 'Ultrassom', imagem: 'ultrassom.webp' },
  { titulo: 'Raio-x', imagem: 'rsz_foto-67.webp' },
  { titulo: 'Eletrocardiograma', imagem: 'eletro.webp' },
];

export interface Convenio {
  readonly arquivo: string;
  readonly alt: string;
}

export const CONVENIOS: readonly Convenio[] = [
  { arquivo: 'abertta-logo.jpg', alt: 'abertta' },
  { arquivo: 'bradesco-saude-logo.png', alt: 'bradesco' },
  { arquivo: 'cassi-logo.jpg', alt: 'cassi' },
  { arquivo: 'cemig-logo.png', alt: 'cemig' },
  { arquivo: 'cenibra-logo.jpg', alt: 'cenibra' },
  { arquivo: 'hapvida.jpg', alt: 'hapvida' },
  { arquivo: 'ipsemg-logo-removebg-preview.png', alt: 'ipsemg' },
  { arquivo: 'liberats-logo.jpeg', alt: 'libertas' },
  { arquivo: 'pasa-logo.png', alt: 'pasa' },
  { arquivo: 'pmmg-logo-removebg-preview.png', alt: 'pmmg' },
  { arquivo: 'postalsaude-logo.jpg', alt: 'portalsaude' },
  { arquivo: 'promed-logo.png', alt: 'promed' },
  { arquivo: 'saude-caixa-logo-removebg-preview.png', alt: 'saude-caixa' },
  { arquivo: 'sus.jpg', alt: 'sus' },
  { arquivo: 'unimed-logo.png', alt: 'unmided' },
  { arquivo: 'usisaude-logo.png', alt: 'unisaude' },
  { arquivo: 'vale-logo.png', alt: 'vale' },
  { arquivo: 'yousaude-logo.png', alt: 'yousaude' },
];
