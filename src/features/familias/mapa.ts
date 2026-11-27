import { Linking } from 'react-native';

import { obterDigitosCep } from './cep';
import { MUNICIPIO_OFICIAL, UF_OFICIAL } from './constants';
import type { Familia } from './types';

export type ProvedorMapa = 'google-maps' | 'waze';

type EnderecoMapaInput = Pick<
  Familia,
  'endereco' | 'numero' | 'bairro' | 'cidade' | 'cep'
>;

function textoLimpo(value: string | null | undefined) {
  return value?.trim() ?? '';
}

function limparNumeroParaMapa(numero: string | null | undefined) {
  const limpo = textoLimpo(numero)
    .replace(/\s*-?\s*\bfundos?\b$/i, '')
    .trim();
  if (!limpo) return '';
  if (/^(s\/n|0+|nao|não|asilo)$/i.test(limpo)) return '';
  return limpo;
}

function temCepValidoMunicipio(cep: string | null | undefined) {
  if (!cep) return false;
  const digits = obterDigitosCep(cep);
  return digits.length === 8 && /^198[89]/.test(digits);
}

export function possuiEnderecoParaMapa(
  familia: Pick<Familia, 'endereco' | 'bairro' | 'cidade'> & { cep?: string | null }
): boolean {
  const temRua = textoLimpo(familia.endereco).length > 0;
  const temLocalidadeOuBairro =
    Boolean(familia.cidade) ||
    textoLimpo(familia.bairro).length > 0 ||
    temCepValidoMunicipio(familia.cep);

  return temRua && temLocalidadeOuBairro;
}

export function construirConsultaMapa(familia: EnderecoMapaInput): string | null {
  if (!possuiEnderecoParaMapa(familia)) {
    return null;
  }

  const ruaENumero = [
    textoLimpo(familia.endereco),
    limparNumeroParaMapa(familia.numero),
  ]
    .filter(Boolean)
    .join(', ');

  const localidade = textoLimpo(familia.cidade);
  const distrito =
    localidade && localidade !== MUNICIPIO_OFICIAL ? localidade : '';

  const partes = [
    ruaENumero,
    distrito,
    `${MUNICIPIO_OFICIAL} - ${UF_OFICIAL}`,
  ].filter(Boolean);

  return partes.join(', ');
}

export function construirUrlGoogleMaps(consulta: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}

export function construirUrlWaze(consulta: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(consulta)}`;
}

export async function abrirEnderecoNoMapa(
  provedor: ProvedorMapa,
  familia: EnderecoMapaInput
): Promise<void> {
  const consulta = construirConsultaMapa(familia);
  if (!consulta) {
    throw new Error('Endereço incompleto.');
  }

  const url =
    provedor === 'google-maps'
      ? construirUrlGoogleMaps(consulta)
      : construirUrlWaze(consulta);

  try {
    await Linking.openURL(url);
  } catch {
    throw new Error(
      provedor === 'google-maps'
        ? 'Não foi possível abrir o Google Maps neste aparelho.'
        : 'Não foi possível abrir o Waze neste aparelho.'
    );
  }
}
