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
import {
  formatarCep,
  MAX_DIGITOS_CEP,
  obterDigitosCep,
} from './cep';
import type { FamiliaDados, FamiliaInput } from './types';
import {
  formatarTelefoneCelular,
  MAX_DIGITOS_TELEFONE,
  obterDigitosTelefone,
} from './telefone';

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
  const cepInformado = textoOpcional(input.cep);
  const cepDigitos = cepInformado ? obterDigitosCep(cepInformado) : '';
  const cep = cepInformado ? formatarCep(cepInformado) : null;
  const numero = textoOpcional(input.numero);
  const bairro = textoOpcional(input.bairro);
  const cidade = textoOpcional(input.cidade);
  const telefoneInformado = textoOpcional(input.telefone);
  const telefoneDigitos = telefoneInformado
    ? obterDigitosTelefone(telefoneInformado)
    : '';
  const telefone = telefoneInformado
    ? formatarTelefoneCelular(telefoneInformado)
    : null;
  const cargos = Array.from(
    new Set((input.cargos ?? []).map((cargo) => normalizarTexto(cargo)).filter(Boolean))
  );
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

  if (cepInformado && cepDigitos.length !== MAX_DIGITOS_CEP) {
    errors.cep = 'Informe os 8 dígitos do CEP.';
  }

  if (telefoneInformado && telefoneDigitos.length === 0) {
    errors.telefone = 'Informe um telefone usando números.';
  } else if (telefoneDigitos.length > MAX_DIGITOS_TELEFONE) {
    errors.telefone = 'O telefone deve ter no máximo 11 dígitos.';
  }

  if (!pertenceALista(cidade, CIDADES)) {
    errors.cidade = 'Selecione uma cidade válida.';
  }

  if (cargos.some((cargo) => !(CARGOS as readonly string[]).includes(cargo))) {
    errors.cargos = 'Selecione somente cargos válidos.';
  }

  if (!pertenceALista(ministerio, MINISTERIOS)) {
    errors.ministerio = 'Selecione um ministério válido.';
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
      cep,
      numero,
      bairro,
      cidade: cidade as Cidade | null,
      telefone,
      cargos: cargos as Cargo[],
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
