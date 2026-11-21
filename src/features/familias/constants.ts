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
] as const;

export const SITUACOES_ECONOMICAS = [
  'Aposentado',
  'Desempregado',
  'Registrado',
  'Encostado',
  'Autônomo',
] as const;

export const TIPOS_RESIDENCIA = ['Própria', 'Alugada'] as const;

export const SETORES = [
  'Setor 1',
  'Setor 2',
  'Setor 3',
  'Setor 4',
  'Setor 5',
  'Setor 6',
  'Setor 7',
  'Patrimônios',
] as const;

export type Cidade = (typeof CIDADES)[number];
export type Cargo = (typeof CARGOS)[number];
export type Ministerio = (typeof MINISTERIOS)[number];
export type SituacaoReligiosa = (typeof SITUACOES_RELIGIOSAS)[number];
export type SituacaoEconomica = (typeof SITUACOES_ECONOMICAS)[number];
export type TipoResidencia = (typeof TIPOS_RESIDENCIA)[number];
export type Setor = (typeof SETORES)[number];

export const BAIRROS_POR_SETOR: Record<Exclude<Setor, 'Patrimônios'>, readonly string[]> = {
  'Setor 1': ['Vila Sunta', 'Jardim das Palmeiras', 'Jardim Aeroporto'],
  'Setor 2': [
    'Jardim São Geraldo',
    'Vila Alpínia',
    'Vila Operária',
    'Jardim Alvorada',
    'Vila Marim',
  ],
  'Setor 3': [
    'Sol Nascente',
    'Vila Dias',
    'Jardim São Francisco',
    'Bela Vitta',
    'Vila Atlanta',
  ],
  'Setor 4': ['Parque Lourival', 'Parque Santa Cruz'],
  'Setor 5': [
    'Vila São Judas',
    'Jardim Vitória',
    'Vila Nova',
    'Santa Clara 1 e 2 / Jardim Bela Vista',
    'Três Cantos',
    'Jardim Vera Cruz',
  ],
  'Setor 6': ['Vila Pires', 'Jardim São Roque'],
  'Setor 7': [
    'Jardim Santa Lúcia',
    'Vila Marubo',
    'Jardim Santa Terezinha',
    'Centro',
    'Jardim Paraíso',
    'Jardim Tangará',
    'Itália',
  ],
};

export const BAIRROS_CATALOGO: readonly string[] = Object.values(BAIRROS_POR_SETOR).flat();

const DISTRITOS_PATRIMONIOS = new Set<string>([
  'alexandria',
  'nova alexandria',
  'porto almeida',
  'frutal do campo',
  'guaripu',
  'agua do guaripu',
]);

function normalizarTextoSetor(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizarBairroSetor(value: string) {
  return normalizarTextoSetor(value)
    .replace(/\bjd\.?\b/g, 'jardim')
    .replace(/\bpq\.?\b/g, 'parque')
    .replace(/\bvl\.?\b/g, 'vila')
    .replace(/\s+/g, ' ')
    .trim();
}

const BAIRRO_SETOR_MAP = new Map<string, Exclude<Setor, 'Patrimônios'>>();

for (const [setor, bairros] of Object.entries(BAIRROS_POR_SETOR) as [
  Exclude<Setor, 'Patrimônios'>,
  readonly string[],
][]) {
  for (const bairro of bairros) {
    BAIRRO_SETOR_MAP.set(normalizarBairroSetor(bairro), setor);
  }
}

const BAIRRO_ALIASES: Record<string, Exclude<Setor, 'Patrimônios'>> = {
  central: 'Setor 7',
  'jardim italia': 'Setor 7',
  'vila italia': 'Setor 7',
  'tres canto': 'Setor 5',
  'santa clara': 'Setor 5',
  'santa clara 1': 'Setor 5',
  'santa clara 2': 'Setor 5',
  'santa clara 1 e 2': 'Setor 5',
  'jardim bela vista': 'Setor 5',
  'bela vista': 'Setor 5',
  'bela vita': 'Setor 3',
  'jardim bela vitta': 'Setor 3',
  'vila santos dumont': 'Setor 1',
  'vila sutta': 'Setor 1',
};

for (const [alias, setor] of Object.entries(BAIRRO_ALIASES)) {
  BAIRRO_SETOR_MAP.set(alias, setor);
}

export function obterSetorDaFamilia({
  cidade,
  bairro,
}: {
  cidade?: Cidade | string | null;
  bairro?: string | null;
}): Setor | null {
  if (cidade) {
    const cidadeNorm = normalizarTextoSetor(cidade);
    if (DISTRITOS_PATRIMONIOS.has(cidadeNorm)) {
      return 'Patrimônios';
    }
  }

  if (bairro) {
    const bairroNorm = normalizarBairroSetor(bairro);
    const direto = BAIRRO_SETOR_MAP.get(bairroNorm);
    if (direto) return direto;

    if (bairroNorm.includes('santa clara') || bairroNorm.includes('bela vista')) {
      return 'Setor 5';
    }
  }

  return null;
}

export function getLocalidadeLabel(value: Cidade) {
  return LOCALIDADE_LABELS[value];
}
