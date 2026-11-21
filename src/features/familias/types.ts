import type {
  Cargo,
  Cidade,
  Ministerio,
  Setor,
  SituacaoEconomica,
  SituacaoReligiosa,
  TipoResidencia,
} from './constants';

export type ISODateTime = string;

export type FamiliaDados = {
  nome: string;
  endereco: string;
  cep: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: Cidade | null;
  telefone: string | null;
  numeroMoradores: number | null;
  numeroCriancas: number | null;
  numeroIdosos: number | null;
  numeroEnfermos: number | null;
  numeroBatizados: number | null;
  cargos: Cargo[];
  ministerio: Ministerio | null;
  situacaoReligiosa: SituacaoReligiosa | null;
  situacaoEconomica: SituacaoEconomica | null;
  residencia: TipoResidencia | null;
};

export type Familia = FamiliaDados & {
  id: string;
  setor: Setor | null;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
};

/** Valores ainda não confiáveis vindos de formulários ou importações. */
export type FamiliaInput = {
  nome: string;
  endereco: string;
  cep?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  telefone?: string | null;
  numeroMoradores?: number | string | null;
  numeroCriancas?: number | string | null;
  numeroIdosos?: number | string | null;
  numeroEnfermos?: number | string | null;
  numeroBatizados?: number | string | null;
  cargos?: string[];
  ministerio?: string | null;
  situacaoReligiosa?: string | null;
  situacaoEconomica?: string | null;
  residencia?: string | null;
};

export type FamiliaFiltros = {
  busca?: string;
  setor?: Setor | null;
  bairro?: string | null;
  cidade?: Cidade | null;
  situacaoReligiosa?: SituacaoReligiosa | null;
  situacaoEconomica?: SituacaoEconomica | null;
};
