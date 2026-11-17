export const CIDADES = [
  'Cândido Mota',
  'Alexandria',
  'Porto Almeida',
  'Frutal do Campo',
  'Guaripu',
] as const;

export const MUNICIPIO_OFICIAL = 'Cândido Mota';
export const UF_OFICIAL = 'SP';

export const LOCALIDADE_LABELS: Record<(typeof CIDADES)[number], string> = {
  'Cândido Mota': 'Cândido Mota — sede',
  Alexandria: 'Alexandria — distrito',
  'Porto Almeida': 'Porto Almeida — distrito',
  'Frutal do Campo': 'Frutal do Campo — distrito',
  Guaripu: 'Guaripu — distrito',
};

export const CARGOS = [
  'Auxiliar de jovens',
  'Administração',
  'Porteiro / Porteira',
  'Músico',
] as const;

export const MINISTERIOS = [
  'Cooperador de jovens',
  'Cooperador oficial',
  'Diácono',
  'Ancião',
  'Encarregado de orquestra',
] as const;

export const SITUACOES_RELIGIOSAS = [
  'Congrega',
  'Parado',
  'Enfermo',
  'Testemunhado',
  'Contato',
] as const;

export const SITUACOES_ECONOMICAS = [
  'Aposentado',
  'Desempregado',
  'Registrado',
  'Encostado',
  'Autônomo',
] as const;

export const TIPOS_RESIDENCIA = ['Própria', 'Alugada'] as const;

export type Cidade = (typeof CIDADES)[number];
export type Cargo = (typeof CARGOS)[number];
export type Ministerio = (typeof MINISTERIOS)[number];
export type SituacaoReligiosa = (typeof SITUACOES_RELIGIOSAS)[number];
export type SituacaoEconomica = (typeof SITUACOES_ECONOMICAS)[number];
export type TipoResidencia = (typeof TIPOS_RESIDENCIA)[number];

export function getLocalidadeLabel(value: Cidade) {
  return LOCALIDADE_LABELS[value];
}
