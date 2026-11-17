import { MUNICIPIO_OFICIAL, UF_OFICIAL } from './constants';

export const MAX_DIGITOS_CEP = 8;
export const MAX_CARACTERES_CEP_FORMATADO = 9;

export type EnderecoCep = {
  cep: string;
  endereco: string;
  bairro: string | null;
  municipio: string;
  uf: string;
};

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export class CepServiceError extends Error {
  constructor(
    message: string,
    public readonly reason: 'invalid' | 'not-found' | 'network'
  ) {
    super(message);
    this.name = 'CepServiceError';
  }
}

export function obterDigitosCep(value: string) {
  return value.replace(/\D/g, '');
}

export function formatarCep(value: string) {
  const digits = obterDigitosCep(value).slice(0, MAX_DIGITOS_CEP);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function mapEnderecoCep(value: ViaCepResponse): EnderecoCep | null {
  if (value.erro || !value.cep || !value.localidade || !value.uf) {
    return null;
  }

  return {
    cep: formatarCep(value.cep),
    endereco: value.logradouro?.trim() ?? '',
    bairro: value.bairro?.trim() || null,
    municipio: value.localidade.trim(),
    uf: value.uf.trim().toUpperCase(),
  };
}

async function fetchViaCep(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 400 || response.status === 404) {
        throw new CepServiceError('CEP não encontrado.', 'not-found');
      }
      throw new CepServiceError('O serviço de CEP está indisponível.', 'network');
    }

    return (await response.json()) as ViaCepResponse | ViaCepResponse[];
  } catch (error) {
    if (error instanceof CepServiceError) throw error;
    throw new CepServiceError(
      'Sem conexão para consultar o CEP. Você pode preencher o endereço manualmente.',
      'network'
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function consultarCep(cep: string) {
  const digits = obterDigitosCep(cep);
  if (digits.length !== MAX_DIGITOS_CEP) {
    throw new CepServiceError('Informe os 8 dígitos do CEP.', 'invalid');
  }

  const response = await fetchViaCep(`https://viacep.com.br/ws/${digits}/json/`);
  const result = Array.isArray(response) ? null : mapEnderecoCep(response);
  if (!result) throw new CepServiceError('CEP não encontrado.', 'not-found');
  return result;
}

export async function pesquisarCepPorEndereco(endereco: string) {
  const query = endereco.trim().replace(/\s+/g, ' ');
  if (query.length < 3) {
    throw new CepServiceError('Informe pelo menos 3 caracteres da rua.', 'invalid');
  }

  const url = `https://viacep.com.br/ws/${UF_OFICIAL}/${encodeURIComponent(
    MUNICIPIO_OFICIAL
  )}/${encodeURIComponent(query)}/json/`;
  const response = await fetchViaCep(url);
  const values = Array.isArray(response) ? response : [response];
  const results = values
    .map(mapEnderecoCep)
    .filter((value): value is EnderecoCep => value !== null);

  if (results.length === 0) {
    throw new CepServiceError('Nenhum CEP encontrado para esse endereço.', 'not-found');
  }

  return Array.from(new Map(results.map((result) => [result.cep, result])).values());
}

export function pertenceAoMunicipioAtendido(endereco: EnderecoCep) {
  return (
    endereco.uf.toUpperCase() === UF_OFICIAL &&
    endereco.municipio.localeCompare(MUNICIPIO_OFICIAL, 'pt-BR', {
      sensitivity: 'base',
    }) === 0
  );
}
