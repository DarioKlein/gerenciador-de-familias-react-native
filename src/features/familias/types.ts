import type {
  Cargo,
  Cidade,
  Ministerio,
  SituacaoEconomica,
  SituacaoReligiosa,
  TipoResidencia,
} from './constants';

export type ISODateTime = string;

export type FamiliaDados = {
  nome: string;
  endereco: string;
  numero: string | null;
  bairro: string | null;
  cidade: Cidade | null;
  telefone: string | null;
  cargo: Cargo | null;
  ministerio: Ministerio | null;
  situacaoReligiosa: SituacaoReligiosa | null;
  situacaoEconomica: SituacaoEconomica | null;
  residencia: TipoResidencia | null;
};

export type Familia = FamiliaDados & {
  id: string;
  criadoEm: ISODateTime;
  atualizadoEm: ISODateTime;
};

/** Valores ainda não confiáveis vindos de formulários ou importações. */
export type FamiliaInput = {
  nome: string;
  endereco: string;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  telefone?: string | null;
  cargo?: string | null;
  ministerio?: string | null;
  situacaoReligiosa?: string | null;
  situacaoEconomica?: string | null;
  residencia?: string | null;
};

export type FamiliaFiltros = {
  busca?: string;
  bairro?: string | null;
  cidade?: Cidade | null;
  situacaoReligiosa?: SituacaoReligiosa | null;
  situacaoEconomica?: SituacaoEconomica | null;
};
