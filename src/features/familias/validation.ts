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
import {
  ehDataFutura,
  normalizarDataVisitaEntrada,
  validarDataIso,
} from './visita';

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

const ERRO_CONTAGEM_INVALIDA = 'Informe um número inteiro válido (0 ou maior).';

function parsearContagemOpcional(
  value: number | string | null | undefined
): { ok: true; value: number | null } | { ok: false } {
  if (value === null || value === undefined) {
    return { ok: true, value: null };
  }

  if (typeof value === 'number') {
    if (Number.isInteger(value) && value >= 0 && value <= 999) {
      return { ok: true, value };
    }
    return { ok: false };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { ok: false };
  }

  const parsed = Number(trimmed);
  if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 999) {
    return { ok: true, value: parsed };
  }

  return { ok: false };
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
  const moradoresParsed = parsearContagemOpcional(input.numeroMoradores);
  const criancasParsed = parsearContagemOpcional(input.numeroCriancas);
  const idososParsed = parsearContagemOpcional(input.numeroIdosos);
  const enfermosParsed = parsearContagemOpcional(input.numeroEnfermos);
  const batizadosParsed = parsearContagemOpcional(input.numeroBatizados);
  const cargos = Array.from(
    new Set((input.cargos ?? []).map((cargo) => normalizarTexto(cargo)).filter(Boolean))
  );
  const ministerio = textoOpcional(input.ministerio);
  const situacaoReligiosa = textoOpcional(input.situacaoReligiosa);
  const situacaoEconomica = textoOpcional(input.situacaoEconomica);
  const residencia = textoOpcional(input.residencia);
  const ultimaVisita = normalizarDataVisitaEntrada(input.ultimaVisita);

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

  if (!moradoresParsed.ok) errors.numeroMoradores = ERRO_CONTAGEM_INVALIDA;
  if (!criancasParsed.ok) errors.numeroCriancas = ERRO_CONTAGEM_INVALIDA;
  if (!idososParsed.ok) errors.numeroIdosos = ERRO_CONTAGEM_INVALIDA;
  if (!enfermosParsed.ok) errors.numeroEnfermos = ERRO_CONTAGEM_INVALIDA;
  if (!batizadosParsed.ok) errors.numeroBatizados = ERRO_CONTAGEM_INVALIDA;

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

  if (ultimaVisita !== null) {
    if (!validarDataIso(ultimaVisita)) {
      errors.ultimaVisita = 'Informe uma data de visita válida (DD/MM/AAAA).';
    } else if (ehDataFutura(ultimaVisita)) {
      errors.ultimaVisita = 'A data da visita não pode ser futura.';
    }
  }

  if (
    Object.keys(errors).length > 0 ||
    !moradoresParsed.ok ||
    !criancasParsed.ok ||
    !idososParsed.ok ||
    !enfermosParsed.ok ||
    !batizadosParsed.ok
  ) {
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
      numeroMoradores: moradoresParsed.value,
      numeroCriancas: criancasParsed.value,
      numeroIdosos: idososParsed.value,
      numeroEnfermos: enfermosParsed.value,
      numeroBatizados: batizadosParsed.value,
      cargos: cargos as Cargo[],
      ministerio: ministerio as Ministerio | null,
      situacaoReligiosa: situacaoReligiosa as SituacaoReligiosa | null,
      situacaoEconomica: situacaoEconomica as SituacaoEconomica | null,
      residencia: residencia as TipoResidencia | null,
      ultimaVisita,
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
