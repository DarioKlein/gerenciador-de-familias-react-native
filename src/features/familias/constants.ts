export const CIDADES = ['Cândido Mota', 'Alexandria', 'Porto Almeida', 'Frutal do Campo', 'Guaripu'] as const

export const MUNICIPIO_OFICIAL = 'Cândido Mota'
export const UF_OFICIAL = 'SP'

export const LOCALIDADE_LABELS: Record<(typeof CIDADES)[number], string> = {
  'Cândido Mota': 'Cândido Mota — sede',
  Alexandria: 'Alexandria — distrito',
  'Porto Almeida': 'Porto Almeida — distrito',
  'Frutal do Campo': 'Frutal do Campo — distrito',
  Guaripu: 'Guaripu — distrito',
}

export const CARGOS = [
  'Auxiliar de jovens',
  'Administração',
  'Porteiro(a)',
  'Músico',
  'Organista',
  'Auxiliar do som',
] as const

export const MINISTERIOS = [
  'Ancião',
  'Diácono',
  'Cooperador oficial',
  'Cooperador de jovens',
  'Irmã da obra da piedade',
  'Encarregado de orquestra',
] as const

export const SITUACOES_RELIGIOSAS = ['Congrega', 'Parado'] as const

export const SITUACOES_ECONOMICAS = ['Aposentado', 'Desempregado', 'Registrado', 'Encostado', 'Autônomo'] as const

export const TIPOS_RESIDENCIA = ['Própria', 'Alugada'] as const

export const SETORES = [
  'Setor 1',
  'Setor 2',
  'Setor 3',
  'Setor 4',
  'Setor 5',
  'Setor 6',
  'Setor 7',
  'Patrimônios',
] as const

export const FILTROS_VISITA = [
  'Há mais de 6 meses',
  'Visita não informada',
  'Visita realizada',
] as const

export const FILTROS_DADOS = [
  'Dados faltantes',
  'Dados preenchidos',
] as const

export type Cidade = (typeof CIDADES)[number]
export type Cargo = (typeof CARGOS)[number]
export type Ministerio = (typeof MINISTERIOS)[number]
export type SituacaoReligiosa = (typeof SITUACOES_RELIGIOSAS)[number]
export type SituacaoEconomica = (typeof SITUACOES_ECONOMICAS)[number]
export type TipoResidencia = (typeof TIPOS_RESIDENCIA)[number]
export type Setor = (typeof SETORES)[number]
export type FiltroVisita = (typeof FILTROS_VISITA)[number]
export type FiltroDados = (typeof FILTROS_DADOS)[number]

export const BAIRROS_POR_SETOR: Record<Exclude<Setor, 'Patrimônios'>, readonly string[]> = {
  'Setor 1': [
    'Vila Assunta',
    'Jardim das Palmeiras',
    'Jardim Aeroporto',
    'Conjunto Habitacional Manoel Inácio Dias',
    'Jardim das Flores',
  ],
  'Setor 2': [
    'Jardim São Geraldo',
    'Vila Alpínia',
    'Conjunto Habitacional Sebastião Alves Borges',
    'Vila Operária',
    'Jardim Alvorada',
    'Vila Marim',
  ],
  'Setor 3': [
    'Jardim Sol Nascente',
    'Vila Dias',
    'Jardim São Francisco',
    'Residencial Bella Vitta',
    'Vila Atlanta',
  ],
  'Setor 4': [
    'Parque Prefeito Lourival José de Almeida',
    'Parque Santa Cruz',
    'Vila Garrido',
  ],
  'Setor 5': [
    'Vila São Judas Tadeu',
    'Conjunto Habitacional Jardim Vitória',
    'Vila Nova',
    'Santa Clara',
    'Residencial Santa Clara II',
    'Jardim Bela Vista',
    'Três Cantos',
    'Vila Vera Cruz',
  ],
  'Setor 6': ['Vila Pires', 'Vila São Roque'],
  'Setor 7': [
    'Jardim Santa Lúcia',
    'Vila Marubo',
    'Jardim Santa Terezinha',
    'Vila Santa Terezinha',
    'Centro',
    'Jardim Paraíso',
    'Jardim Tangará',
    'Residencial Itália',
    'Vila Gaspar',
  ],
}

export const BAIRROS_CATALOGO: readonly string[] = Object.values(BAIRROS_POR_SETOR).flat()

const DISTRITOS_PATRIMONIOS = new Set<string>([
  'alexandria',
  'nova alexandria',
  'porto almeida',
  'frutal do campo',
  'guaripu',
  'agua do guaripu',
])

function normalizarTextoSetor(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s+/g, ' ')
}

function normalizarBairroSetor(value: string) {
  return normalizarTextoSetor(value)
    .replace(/\bjd\.?\b/g, 'jardim')
    .replace(/\bpq\.?\b/g, 'parque')
    .replace(/\bvl\.?\b/g, 'vila')
    .replace(/\bconj\.?\s*hab\.?\b/g, 'conjunto habitacional')
    .replace(/\bpref\.?\b/g, 'prefeito')
    .replace(/\s+/g, ' ')
    .trim()
}

const BAIRRO_SETOR_MAP = new Map<string, Exclude<Setor, 'Patrimônios'>>()

for (const [setor, bairros] of Object.entries(BAIRROS_POR_SETOR) as [
  Exclude<Setor, 'Patrimônios'>,
  readonly string[],
][]) {
  for (const bairro of bairros) {
    BAIRRO_SETOR_MAP.set(normalizarBairroSetor(bairro), setor)
  }
}

const BAIRRO_ALIASES: Record<string, Exclude<Setor, 'Patrimônios'>> = {
  // Setor 1
  'vila sunta': 'Setor 1',
  'vila sutta': 'Setor 1',
  'vila assunta': 'Setor 1',
  'vila santos dumont': 'Setor 1',
  'manoel inacio dias': 'Setor 1',
  'conjunto habitacional manoel inacio dias': 'Setor 1',
  // Setor 2
  'sebastiao alves borges': 'Setor 2',
  'conjunto habitacional sebastiao alves borges': 'Setor 2',
  // Setor 3
  'sol nascente': 'Setor 3',
  'residencial atlanta': 'Setor 3',
  'bela vitta': 'Setor 3',
  'bela vita': 'Setor 3',
  'bella vitta': 'Setor 3',
  'jardim bela vitta': 'Setor 3',
  'residencial bela vitta': 'Setor 3',
  // Setor 4
  'parque lourival': 'Setor 4',
  'parque prefeito lourival': 'Setor 4',
  lourival: 'Setor 4',
  'parque prefeito lourival jose de almeida': 'Setor 4',
  // Setor 5
  'vila sao judas': 'Setor 5',
  'jardim vitoria': 'Setor 5',
  'santa clara 1': 'Setor 5',
  'santa clara 2': 'Setor 5',
  'santa clara 1 e 2': 'Setor 5',
  'santa clara 1 e 2 / jardim bela vista': 'Setor 5',
  'bela vista': 'Setor 5',
  'tres canto': 'Setor 5',
  'jardim vera cruz': 'Setor 5',
  // Setor 6
  'jardim sao roque': 'Setor 6',
  // Setor 7
  central: 'Setor 7',
  italia: 'Setor 7',
  'jardim italia': 'Setor 7',
  'vila italia': 'Setor 7',
}

for (const [alias, setor] of Object.entries(BAIRRO_ALIASES)) {
  BAIRRO_SETOR_MAP.set(alias, setor)
}

export function obterSetorDaFamilia({
  cidade,
  bairro,
}: {
  cidade?: Cidade | string | null
  bairro?: string | null
}): Setor | null {
  if (cidade) {
    const cidadeNorm = normalizarTextoSetor(cidade)
    if (DISTRITOS_PATRIMONIOS.has(cidadeNorm)) {
      return 'Patrimônios'
    }
  }

  if (bairro) {
    const bairroNorm = normalizarBairroSetor(bairro)
    const direto = BAIRRO_SETOR_MAP.get(bairroNorm)
    if (direto) return direto

    if (bairroNorm.includes('lourival')) return 'Setor 4'
    if (bairroNorm.includes('assunta') || bairroNorm.includes('manoel inacio dias')) {
      return 'Setor 1'
    }
    if (bairroNorm.includes('sebastiao alves borges')) return 'Setor 2'
    if (
      bairroNorm.includes('bella vitta') ||
      bairroNorm.includes('bela vitta') ||
      bairroNorm.includes('sol nascente')
    ) {
      return 'Setor 3'
    }
    if (
      bairroNorm.includes('sao judas') ||
      bairroNorm.includes('jardim vitoria') ||
      bairroNorm.includes('santa clara') ||
      bairroNorm.includes('bela vista')
    ) {
      return 'Setor 5'
    }
    if (bairroNorm.includes('sao roque')) return 'Setor 6'
    if (bairroNorm.includes('santa terezinha')) return 'Setor 7'
  }

  return null
}

export function getLocalidadeLabel(value: Cidade) {
  return LOCALIDADE_LABELS[value]
}
