const MS_POR_DIA = 86_400_000;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function formatarIsoLocal(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function extrairPartesIso(isoDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;

  const ano = Number(match[1]);
  const mes = Number(match[2]);
  const dia = Number(match[3]);
  const data = new Date(ano, mes - 1, dia);

  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return null;
  }

  return { ano, mes, dia };
}

export function obterDataHojeIso(hoje = new Date()) {
  return formatarIsoLocal(hoje);
}

export function obterDataOntemIso(hoje = new Date()) {
  const ontem = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1);
  return formatarIsoLocal(ontem);
}

export function validarDataIso(isoDate: string) {
  return extrairPartesIso(isoDate) !== null;
}

export function ehDataFutura(isoDate: string, hoje = new Date()) {
  return isoDate > obterDataHojeIso(hoje);
}

export function formatarDataVisitaBr(isoDate: string) {
  const partes = extrairPartesIso(isoDate);
  if (!partes) return isoDate;
  return `${pad2(partes.dia)}/${pad2(partes.mes)}/${partes.ano}`;
}

export function aplicarMascaraData(value: string) {
  const digitos = value.replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

export function parsearDataVisitaBr(value: string): string | null {
  const limpo = value.trim();
  if (!limpo) return null;

  const matchBr = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(limpo);
  if (matchBr) {
    const iso = `${matchBr[3]}-${matchBr[2]}-${matchBr[1]}`;
    return validarDataIso(iso) ? iso : null;
  }

  if (validarDataIso(limpo)) {
    return limpo;
  }

  return null;
}

export function normalizarDataVisitaEntrada(value: string | null | undefined): string | null {
  const limpo = value?.trim() ?? '';
  if (!limpo) return null;

  const matchBr = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(limpo);
  if (matchBr) {
    return `${matchBr[3]}-${matchBr[2]}-${matchBr[1]}`;
  }

  return limpo;
}

export type ResumoVisita =
  | { possuiVisita: false }
  | {
      possuiVisita: true;
      dataFormatada: string;
      diasSemVisita: number;
      textoTempoSemVisita: string;
      alertaAtrasada: boolean;
    };

export function calcularResumoVisita(
  ultimaVisita: string | null,
  hoje = new Date()
): ResumoVisita {
  if (!ultimaVisita) return { possuiVisita: false };
  const partes = extrairPartesIso(ultimaVisita);
  if (!partes) return { possuiVisita: false };

  const hojeUtc = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const visitaUtc = Date.UTC(partes.ano, partes.mes - 1, partes.dia);
  const diasSemVisita = Math.max(0, Math.round((hojeUtc - visitaUtc) / MS_POR_DIA));

  const textoTempoSemVisita =
    diasSemVisita === 0
      ? 'Visitada hoje'
      : diasSemVisita === 1
        ? 'Há 1 dia'
        : `Há ${diasSemVisita} dias`;

  const mesAlvoZeroBased = partes.mes - 1 + 6;
  const anoAlvo = partes.ano + Math.floor(mesAlvoZeroBased / 12);
  const mesAlvo = mesAlvoZeroBased % 12;
  const ultimoDiaMesAlvo = new Date(anoAlvo, mesAlvo + 1, 0).getDate();
  const diaAlvo = Math.min(partes.dia, ultimoDiaMesAlvo);
  const limiteSeisMesesUtc = Date.UTC(anoAlvo, mesAlvo, diaAlvo);

  return {
    possuiVisita: true,
    dataFormatada: formatarDataVisitaBr(ultimaVisita),
    diasSemVisita,
    textoTempoSemVisita,
    alertaAtrasada: hojeUtc >= limiteSeisMesesUtc,
  };
}
