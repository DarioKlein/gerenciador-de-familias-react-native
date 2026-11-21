import {
  CIDADES,
  getLocalidadeLabel,
  SETORES,
  SITUACOES_ECONOMICAS,
  SITUACOES_RELIGIOSAS,
  TIPOS_RESIDENCIA,
  type Cidade,
  type Setor,
  type SituacaoEconomica,
  type SituacaoReligiosa,
  type TipoResidencia,
} from './constants';
import type { Familia } from './types';

export type DashboardItemContagem<T extends string = string> = {
  chave: T;
  label: string;
  total: number;
  percentual: number;
  proporcao: number;
};

export type DashboardResumo = {
  totalFamilias: number;
  totalBairros: number;
  totalLocalidades: number;
  totalSetores: number;
  cadastrosIncompletos: number;
  ultimaAtualizacao: string | null;
  porSetor: DashboardItemContagem<Setor | 'Não informado'>[];
  porLocalidade: DashboardItemContagem<Cidade | 'Não informado'>[];
  topBairros: DashboardItemContagem[];
  semBairro: number;
  porSituacaoReligiosa: DashboardItemContagem<SituacaoReligiosa | 'Não informado'>[];
  porSituacaoEconomica: DashboardItemContagem<SituacaoEconomica | 'Não informado'>[];
  porResidencia: DashboardItemContagem<TipoResidencia | 'Não informado'>[];
};

const TOP_BAIRROS_LIMITE = 5;

function normalizarChave(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizarEspacos(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, ' ') ?? '';
}

function calcularPercentual(total: number, base: number) {
  return base > 0 ? Math.round((total / base) * 100) : 0;
}

function calcularProporcao(total: number, base: number) {
  return base > 0 ? total / base : 0;
}

function criarItemContagem<T extends string>(
  chave: T,
  label: string,
  total: number,
  basePercentual: number,
  baseProporcao = basePercentual
): DashboardItemContagem<T> {
  return {
    chave,
    label,
    total,
    percentual: calcularPercentual(total, basePercentual),
    proporcao: calcularProporcao(total, baseProporcao),
  };
}

function possuiCadastroIncompleto(familia: Familia) {
  return (
    !normalizarEspacos(familia.cep) ||
    !normalizarEspacos(familia.numero) ||
    !normalizarEspacos(familia.bairro) ||
    !familia.cidade ||
    !normalizarEspacos(familia.telefone) ||
    !familia.situacaoReligiosa ||
    !familia.situacaoEconomica ||
    !familia.residencia
  );
}

function contarListaFixa<T extends string>(
  valores: readonly T[],
  contagens: ReadonlyMap<T, number>,
  semInformacao: number,
  totalFamilias: number
): DashboardItemContagem<T | 'Não informado'>[] {
  const itens: DashboardItemContagem<T | 'Não informado'>[] = valores.map((valor) =>
    criarItemContagem(valor, valor, contagens.get(valor) ?? 0, totalFamilias)
  );

  if (semInformacao > 0) {
    itens.push(
      criarItemContagem('Não informado', 'Não informado', semInformacao, totalFamilias)
    );
  }

  return itens;
}

export function formatarUltimaAtualizacao(iso: string | null): string {
  if (!iso) return 'Sem registros';

  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return 'Sem registros';

  const hoje = new Date();
  const mesmoDia =
    data.getFullYear() === hoje.getFullYear() &&
    data.getMonth() === hoje.getMonth() &&
    data.getDate() === hoje.getDate();

  if (mesmoDia) return 'Atualizado hoje';

  return `Atualizado em ${data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })}`;
}

export function calcularResumoDashboard(familias: readonly Familia[]): DashboardResumo {
  const totalFamilias = familias.length;

  const localidadesContagem = new Map<Cidade, number>();
  const setoresContagem = new Map<Setor, number>();
  const bairrosContagem = new Map<string, { label: string; total: number }>();
  const religiosaContagem = new Map<SituacaoReligiosa, number>();
  const economicaContagem = new Map<SituacaoEconomica, number>();
  const residenciaContagem = new Map<TipoResidencia, number>();

  let semLocalidade = 0;
  let semSetor = 0;
  let semBairro = 0;
  let semSituacaoReligiosa = 0;
  let semSituacaoEconomica = 0;
  let semResidencia = 0;
  let cadastrosIncompletos = 0;
  let ultimaAtualizacao: string | null = null;
  let maiorTimestamp = -Infinity;

  for (const familia of familias) {
    if (possuiCadastroIncompleto(familia)) {
      cadastrosIncompletos += 1;
    }

    const timestamp = Date.parse(familia.atualizadoEm);
    if (!Number.isNaN(timestamp) && timestamp >= maiorTimestamp) {
      maiorTimestamp = timestamp;
      ultimaAtualizacao = familia.atualizadoEm;
    } else if (
      Number.isNaN(timestamp) &&
      (!ultimaAtualizacao || familia.atualizadoEm > ultimaAtualizacao)
    ) {
      ultimaAtualizacao = familia.atualizadoEm;
    }

    if (familia.cidade) {
      localidadesContagem.set(
        familia.cidade,
        (localidadesContagem.get(familia.cidade) ?? 0) + 1
      );
    } else {
      semLocalidade += 1;
    }

    if (familia.setor) {
      setoresContagem.set(
        familia.setor,
        (setoresContagem.get(familia.setor) ?? 0) + 1
      );
    } else {
      semSetor += 1;
    }

    const bairroLimpo = normalizarEspacos(familia.bairro);
    if (bairroLimpo) {
      const chaveBairro = normalizarChave(bairroLimpo);
      const existente = bairrosContagem.get(chaveBairro);
      if (existente) {
        existente.total += 1;
      } else {
        bairrosContagem.set(chaveBairro, { label: bairroLimpo, total: 1 });
      }
    } else {
      semBairro += 1;
    }

    if (familia.situacaoReligiosa) {
      religiosaContagem.set(
        familia.situacaoReligiosa,
        (religiosaContagem.get(familia.situacaoReligiosa) ?? 0) + 1
      );
    } else {
      semSituacaoReligiosa += 1;
    }

    if (familia.situacaoEconomica) {
      economicaContagem.set(
        familia.situacaoEconomica,
        (economicaContagem.get(familia.situacaoEconomica) ?? 0) + 1
      );
    } else {
      semSituacaoEconomica += 1;
    }

    if (familia.residencia) {
      residenciaContagem.set(
        familia.residencia,
        (residenciaContagem.get(familia.residencia) ?? 0) + 1
      );
    } else {
      semResidencia += 1;
    }
  }

  const localidadesBase: DashboardItemContagem<Cidade | 'Não informado'>[] = CIDADES.map(
    (cidade) =>
      criarItemContagem(
        cidade,
        getLocalidadeLabel(cidade),
        localidadesContagem.get(cidade) ?? 0,
        totalFamilias
      )
  );
  const localidadesComCadastro = localidadesBase
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
  const totalLocalidades = localidadesComCadastro.length;
  const localidadesVisiveis =
    localidadesComCadastro.length > 0 ? localidadesComCadastro : localidadesBase;
  const porLocalidade: DashboardItemContagem<Cidade | 'Não informado'>[] =
    semLocalidade > 0
      ? [
          ...localidadesVisiveis,
          criarItemContagem('Não informado', 'Não informado', semLocalidade, totalFamilias),
        ]
      : localidadesVisiveis;

  const bairrosOrdenados = Array.from(bairrosContagem.entries()).sort(
    ([, a], [, b]) =>
      b.total - a.total ||
      a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' })
  );
  const maiorTotalBairro = bairrosOrdenados[0]?.[1].total ?? 0;
  const topBairros: DashboardItemContagem[] = bairrosOrdenados
    .slice(0, TOP_BAIRROS_LIMITE)
    .map(([chave, item]) =>
      criarItemContagem(chave, item.label, item.total, totalFamilias, maiorTotalBairro)
    );

  const porSetor = contarListaFixa(
    SETORES,
    setoresContagem,
    semSetor,
    totalFamilias
  );
  const totalSetores = SETORES.filter(
    (setor) => (setoresContagem.get(setor) ?? 0) > 0
  ).length;

  return {
    totalFamilias,
    totalBairros: bairrosContagem.size,
    totalLocalidades,
    totalSetores,
    cadastrosIncompletos,
    ultimaAtualizacao,
    porSetor,
    porLocalidade,
    topBairros,
    semBairro,
    porSituacaoReligiosa: contarListaFixa(
      SITUACOES_RELIGIOSAS,
      religiosaContagem,
      semSituacaoReligiosa,
      totalFamilias
    ),
    porSituacaoEconomica: contarListaFixa(
      SITUACOES_ECONOMICAS,
      economicaContagem,
      semSituacaoEconomica,
      totalFamilias
    ),
    porResidencia: contarListaFixa(
      TIPOS_RESIDENCIA,
      residenciaContagem,
      semResidencia,
      totalFamilias
    ),
  };
}
