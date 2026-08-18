export interface Consulta {
  readonly especialidade: string;
  readonly profissional: string;
  /** Classes do Font Awesome, preservadas exatamente como no site legado. */
  readonly icone: string;
  readonly dias?: string;
}

/**
 * As 20 especialidades vinham escritas à mão em public_html/consultas.html,
 * em sete `.row` de três colunas. O backend não modela consultas, então a
 * lista continua sendo conteúdo do front — mexer aqui muda a página inteira.
 *
 * As classes de ícone reproduzem o original inclusive nas irregularidades: o
 * primeiro card traz um `fas` redundante ao lado de `fa-solid`, e Fisioterapia
 * usa `fa-xl` enquanto todos os outros usam `fa-lg`.
 */
export const CONSULTAS: readonly Consulta[] = [
  {
    especialidade: 'Gastroenterologia',
    profissional: 'Sidney de Oliveira Bernabé',
    icone: 'fa-solid fas fa-hand-holding-medical fa-lg white',
  },
  {
    especialidade: 'Endocrinologia',
    profissional: 'Ana Carolina Viana Peters',
    icone: 'fa-solid fa-hand-holding-medical fa-lg white',
  },
  {
    especialidade: 'Nutrição',
    profissional: 'Thaynara Cristina Evangelista',
    icone: 'fa-solid fa-apple-whole fa-lg white',
  },
  {
    especialidade: 'Nutrição',
    profissional: 'Nayara Santos Zimer',
    icone: 'fa-solid fa-apple-whole fa-lg white',
  },
  {
    especialidade: 'Angiologia',
    profissional: 'Amanda Dias da Costa',
    icone: 'fa-solid fa-heart-pulse fa-lg white',
  },
  {
    especialidade: 'Cirurgia Geral',
    profissional: 'Sidney de Oliveira Bernabé',
    icone: 'fa-solid fa-hand-holding-medical fa-lg white',
  },
  {
    especialidade: 'Fisioterapia',
    profissional: 'Andrea Sanches',
    icone: 'fa-solid fa-dumbbell fa-xl white',
    dias: 'Seg a Sexta',
  },
  {
    especialidade: 'Fisioterapeuta Osteopata',
    profissional: 'Glauco Magalhães',
    icone: 'fa-solid fa-dumbbell fa-lg white',
    dias: 'Quinta-Feira',
  },
  {
    especialidade: 'Fonoaudiologia',
    profissional: 'Maira Drumond Guerra da Silva',
    icone: 'fa-solid fa-ear-listen fa-lg white',
    dias: 'Seg a Sexta',
  },
  {
    especialidade: 'Geriatria',
    profissional: 'Flávio Enrique Mafra Campos',
    icone: 'fa-solid fa-person-cane fa-lg white',
  },
  {
    especialidade: 'Ginecologia',
    profissional: 'Larissa Cristina Ferreira',
    icone: 'fa-solid fa-person-dress fa-lg white',
  },
  {
    especialidade: 'Oftalmologia',
    profissional: 'Maria Luiza Torres Cota Ribeiro',
    icone: 'fa-solid fa-glasses fa-lg white',
  },
  {
    especialidade: 'Oftalmologia',
    profissional: 'Pedro Moreira de Araújo Junior',
    icone: 'fa-solid fa-glasses fa-lg white',
  },
  {
    especialidade: 'Oftalmologia',
    profissional: 'Natan Halabi',
    icone: 'fa-solid fa-glasses fa-lg white',
  },
  {
    especialidade: 'Ortopedia/Traumatologia',
    profissional: 'Leonardo Martins da Costa Rodrigues',
    icone: 'fa-solid fa-bone fa-lg white',
  },
  {
    especialidade: 'Ortopedia/Traumatologia',
    profissional: 'Leonardo Wariss Pena',
    icone: 'fa-solid fa-bone fa-lg white',
  },
  {
    especialidade: 'Pediatria',
    profissional: 'Amanda Karoline Silva de Caux',
    icone: 'fa-solid fa-baby fa-lg white',
  },
  {
    especialidade: 'Psicologia',
    profissional: 'Cynthia Batista Pinto',
    icone: 'fa-solid fa-brain fa-lg white',
  },
  {
    especialidade: 'Psicologia',
    profissional: 'Paulo de Souza Novais',
    icone: 'fa-solid fa-brain fa-lg white',
  },
  {
    especialidade: 'Psicologia',
    profissional: 'Mariana Neubert',
    icone: 'fa-solid fa-brain fa-lg white',
  },
];
