import { Linking } from 'react-native';

import type { Familia } from './types';

export type ProvedorMapa = 'google-maps' | 'waze';

type EnderecoMapaInput = Pick<Familia, 'endereco' | 'numero' | 'bairro' | 'cidade'>;

function textoLimpo(value: string | null | undefined) {
  return value?.trim() ?? '';
}

export function possuiEnderecoParaMapa(
  familia: Pick<Familia, 'endereco' | 'bairro' | 'cidade'>
): boolean {
  const temRua = textoLimpo(familia.endereco).length > 0;
  const temLocalidadeOuBairro =
    Boolean(familia.cidade) || textoLimpo(familia.bairro).length > 0;

  return temRua && temLocalidadeOuBairro;
}

export function construirConsultaMapa(familia: EnderecoMapaInput): string | null {
  if (!possuiEnderecoParaMapa(familia)) {
    return null;
  }

  const partes = [
    textoLimpo(familia.endereco),
    textoLimpo(familia.numero),
    textoLimpo(familia.bairro),
    textoLimpo(familia.cidade),
    'SP, Brasil',
  ].filter(Boolean);

  return partes.join(', ');
}

export function construirUrlGoogleMaps(consulta: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(consulta)}&travelmode=driving`;
}

export function construirUrlWaze(consulta: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(consulta)}&navigate=yes`;
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
