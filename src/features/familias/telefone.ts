export const MAX_DIGITOS_TELEFONE = 11;
export const MAX_CARACTERES_TELEFONE_FORMATADO = 15;

export function obterDigitosTelefone(value: string) {
  return value.replace(/\D/g, '');
}

export function formatarTelefoneCelular(value: string) {
  const digits = obterDigitosTelefone(value).slice(0, MAX_DIGITOS_TELEFONE);

  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);

  if (number.length <= 4) return `(${ddd}) ${number}`;

  const prefixLength = number.length <= 8 ? 4 : 5;
  const prefix = number.slice(0, prefixLength);
  const suffix = number.slice(prefixLength);

  return suffix ? `(${ddd}) ${prefix}-${suffix}` : `(${ddd}) ${prefix}`;
}
