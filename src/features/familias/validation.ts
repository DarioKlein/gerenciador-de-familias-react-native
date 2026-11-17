import {
  CARGOS,
  CIDADES,
  MINISTERIOS,
  SITUACOES_ECONOMICAS,
  SITUACOES_RELIGIOSAS,
  TIPOS_RESIDENCIA,
  type Cargo,
  type Cidade,
  type Ministerio,
  type SituacaoEconomica,
  type SituacaoReligiosa,
  type TipoResidencia,
} from './constants';
import type { FamiliaDados, FamiliaInput } from './types';

export type FamiliaValidationErrors = Partial<Record<keyof FamiliaInput, string>>;

export type FamiliaValidationResult =
  | { success: true; data: FamiliaDados }
  | { success: false; errors: FamiliaValidationErrors };

export class FamiliaValidationError extends Error {
  constructor(public readonly errors: FamiliaValidationErrors) {
    super('Os dados da família são inválidos.');
    this.name = 'FamiliaValidationError';
  }
}

function normalizarTexto(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, ' ') ?? '';
}

function textoOpcional(value: string | null | undefined) {
  const normalized = normalizarTexto(value);
  return normalized.length > 0 ? normalized : null;
}

function pertenceALista<const T extends readonly string[]>(
  value: string | null,
  values: T
): value is T[number] | null {
  return value === null || (values as readonly string[]).includes(value);
}

export function validarFamilia(input: FamiliaInput): FamiliaValidationResult {
  const errors: FamiliaValidationErrors = {};
  const nome = normalizarTexto(input.nome);
  const endereco = normalizarTexto(input.endereco);
  const numero = textoOpcional(input.numero);
  const bairro = textoOpcional(input.bairro);
  const cidade = textoOpcional(input.cidade);
  const telefone = textoOpcional(input.telefone);
  const cargo = textoOpcional(input.cargo);
  const ministerio = textoOpcional(input.ministerio);
  const situacaoReligiosa = textoOpcional(input.situacaoReligiosa);
  const situacaoEconomica = textoOpcional(input.situacaoEconomica);
  const residencia = textoOpcional(input.residencia);

  if (!nome) {
    errors.nome = 'Informe o nome da família ou do responsável.';
  }

  if (!endereco) {
    errors.endereco = 'Informe o endereço da família.';
  }

  if (!pertenceALista(cidade, CIDADES)) {
    errors.cidade = 'Selecione uma cidade válida.';
  }

  if (!pertenceALista(cargo, CARGOS)) {
    errors.cargo = 'Selecione um cargo válido.';
  }

  if (!pertenceALista(ministerio, MINISTERIOS)) {
    errors.ministerio = 'Selecione um ministério válido.';
  }

  if (cargo && ministerio) {
    const message = 'Escolha um cargo ou um ministério, nunca os dois.';
    errors.cargo = message;
    errors.ministerio = message;
  }

  if (!pertenceALista(situacaoReligiosa, SITUACOES_RELIGIOSAS)) {
    errors.situacaoReligiosa = 'Selecione uma situação religiosa válida.';
  }

  if (!pertenceALista(situacaoEconomica, SITUACOES_ECONOMICAS)) {
    errors.situacaoEconomica = 'Selecione uma situação econômica válida.';
  }

  if (!pertenceALista(residencia, TIPOS_RESIDENCIA)) {
    errors.residencia = 'Selecione um tipo de residência válido.';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      nome,
      endereco,
      numero,
      bairro,
      cidade: cidade as Cidade | null,
      telefone,
      cargo: cargo as Cargo | null,
      ministerio: ministerio as Ministerio | null,
      situacaoReligiosa: situacaoReligiosa as SituacaoReligiosa | null,
      situacaoEconomica: situacaoEconomica as SituacaoEconomica | null,
      residencia: residencia as TipoResidencia | null,
    },
  };
}

export function validarFamiliaOuFalhar(input: FamiliaInput) {
  const result = validarFamilia(input);

  if (!result.success) {
    throw new FamiliaValidationError(result.errors);
  }

  return result.data;
}
