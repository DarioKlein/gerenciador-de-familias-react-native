import * as Crypto from 'expo-crypto';
import * as XLSX from 'xlsx';

import type { FamiliaImportacaoItem } from '@/database/familias-repository';

import {
  CARGOS,
  CIDADES,
  getLocalidadeLabel,
  MINISTERIOS,
  SITUACOES_ECONOMICAS,
  SITUACOES_RELIGIOSAS,
  TIPOS_RESIDENCIA,
} from './constants';
import type { Familia, FamiliaInput } from './types';
import { validarFamilia } from './validation';

export const NOME_ABA_FAMILIAS = 'Familias';
export const NOME_ABA_LEIAME = 'LEIAME';

export const COLUNAS_FAMILIAS = [
  'id',
  'nome',
  'endereco',
  'numero',
  'bairro',
  'cidade',
  'setor',
  'cep',
  'telefone',
  'numero_moradores',
  'numero_criancas',
  'numero_idosos',
  'numero_enfermos',
  'numero_batizados',
  'cargos',
  'ministerio',
  'situacao_religiosa',
  'situacao_economica',
  'residencia',
  'criado_em',
  'atualizado_em',
] as const;

type ColunaFamilia = (typeof COLUNAS_FAMILIAS)[number];

export type BackupImportRowValida = {
  linha: number;
  acao: 'criar' | 'atualizar';
  item: FamiliaImportacaoItem;
};

export type BackupImportRowInvalida = {
  linha: number;
  nomeExibicao: string;
  motivos: string[];
};

export type BackupImportPreview = {
  nomeAba: string;
  totalLinhasLidas: number;
  validas: BackupImportRowValida[];
  novasCount: number;
  atualizacoesCount: number;
  invalidas: BackupImportRowInvalida[];
};

const HEADER_ALIASES: Record<string, ColunaFamilia> = {
  id: 'id',
  nome: 'nome',
  familia: 'nome',
  responsavel: 'nome',
  endereco: 'endereco',
  rua: 'endereco',
  rua_ou_avenida: 'endereco',
  logradouro: 'endereco',
  numero: 'numero',
  n: 'numero',
  num: 'numero',
  bairro: 'bairro',
  cidade: 'cidade',
  localidade: 'cidade',
  localidade_distrito: 'cidade',
  distrito: 'cidade',
  cep: 'cep',
  telefone: 'telefone',
  celular: 'telefone',
  numero_moradores: 'numero_moradores',
  n_de_moradores: 'numero_moradores',
  n_moradores: 'numero_moradores',
  moradores: 'numero_moradores',
  numero_criancas: 'numero_criancas',
  n_de_criancas: 'numero_criancas',
  n_criancas: 'numero_criancas',
  criancas: 'numero_criancas',
  numero_idosos: 'numero_idosos',
  n_de_idosos: 'numero_idosos',
  n_idosos: 'numero_idosos',
  idosos: 'numero_idosos',
  numero_enfermos: 'numero_enfermos',
  n_de_enfermos: 'numero_enfermos',
  n_enfermos: 'numero_enfermos',
  enfermos: 'numero_enfermos',
  numero_batizados: 'numero_batizados',
  n_de_batizados: 'numero_batizados',
  n_batizados: 'numero_batizados',
  batizados: 'numero_batizados',
  cargo: 'cargos',
  cargos: 'cargos',
  ministerio: 'ministerio',
  situacao_religiosa: 'situacao_religiosa',
  situacao: 'situacao_religiosa',
  situacao_economica: 'situacao_economica',
  residencia: 'residencia',
  tipo_de_residencia: 'residencia',
  criado_em: 'criado_em',
  atualizado_em: 'atualizado_em',
};

function normalizarTextoComparacao(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizarChaveCabecalho(value: string) {
  return normalizarTextoComparacao(value)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function corresponderListaFixa(
  valor: string,
  opcoes: readonly string[],
  extras?: ReadonlyMap<string, string>
) {
  const limpo = valor.trim();
  if (!limpo) return null;

  const normalizado = normalizarTextoComparacao(limpo);
  if (extras?.has(normalizado)) {
    return extras.get(normalizado) ?? limpo;
  }

  for (const opcao of opcoes) {
    if (normalizarTextoComparacao(opcao) === normalizado) {
      return opcao;
    }
  }

  return limpo;
}

const LOCALIDADE_EXTRAS = new Map<string, string>(
  CIDADES.map((cidade) => [
    normalizarTextoComparacao(getLocalidadeLabel(cidade)),
    cidade,
  ])
);

function parsearCargos(valor: string) {
  const limpo = valor.trim();
  if (!limpo) return [];

  return limpo
    .split(/[,;|]/)
    .map((parte) => parte.trim())
    .filter(Boolean)
    .map((parte) => corresponderListaFixa(parte, CARGOS) ?? parte);
}

function criarLinhasLeiame() {
  return [
    ['Planilha de Backup — Aplicativo Famílias'],
    [''],
    ['Instruções importantes:'],
    [
      '1. Não altere os valores da coluna "id" das famílias já cadastradas: ela identifica cada família ao reimportar e evita duplicações.',
    ],
    [
      '2. Para adicionar uma nova família diretamente pelo Excel, deixe a coluna "id" em branco e preencha pelo menos "nome" e "endereco".',
    ],
    [
      '3. Ao importar no aplicativo, será exibida uma pré-visualização antes de salvar. Linhas com valores inválidos serão ignoradas.',
    ],
    [''],
    ['Coluna', 'Obrigatória', 'Descrição e valores permitidos'],
    ['id', 'Não', 'Identificador único gerado pelo aplicativo. Mantenha inalterado para atualizações.'],
    ['nome', 'Sim', 'Nome da família ou da pessoa responsável.'],
    ['endereco', 'Sim', 'Nome da rua ou avenida (sem o número).'],
    ['numero', 'Não', 'Número do imóvel ou complemento (ex.: 142, 45-A, S/N, Fundos).'],
    ['bairro', 'Não', 'Nome do bairro.'],
    ['cidade', 'Não', `Localidade / distrito: ${CIDADES.join(' | ')}`],
    ['setor', 'Não', 'Identificado automaticamente pelo bairro ou distrito (Setor 1 a 7 ou Patrimônios).'],
    ['cep', 'Não', 'CEP de 8 dígitos (ex.: 19880-000).'],
    ['telefone', 'Não', 'Telefone com DDD (até 11 dígitos).'],
    ['numero_moradores', 'Não', 'Quantidade de moradores na residência (número inteiro >= 0).'],
    ['numero_criancas', 'Não', 'Quantidade de crianças (número inteiro >= 0).'],
    ['numero_idosos', 'Não', 'Quantidade de idosos (número inteiro >= 0).'],
    ['numero_enfermos', 'Não', 'Quantidade de enfermos (número inteiro >= 0).'],
    ['numero_batizados', 'Não', 'Quantidade de batizados (número inteiro >= 0).'],
    ['cargos', 'Não', `Um ou mais valores separados por vírgula: ${CARGOS.join(' | ')}`],
    ['ministerio', 'Não', `Até um valor: ${MINISTERIOS.join(' | ')}`],
    ['situacao_religiosa', 'Não', `Escolha única: ${SITUACOES_RELIGIOSAS.join(' | ')}`],
    ['situacao_economica', 'Não', `Escolha única: ${SITUACOES_ECONOMICAS.join(' | ')}`],
    ['residencia', 'Não', `Escolha única: ${TIPOS_RESIDENCIA.join(' | ')}`],
    ['criado_em', 'Não', 'Data/hora de criação em formato ISO 8601 (gerada automaticamente).'],
    ['atualizado_em', 'Não', 'Data/hora da última edição em formato ISO 8601 (gerada automaticamente).'],
  ];
}

export function gerarBytesPlanilhaBackup(familias: readonly Familia[]): Uint8Array {
  const linhas: Record<ColunaFamilia, string>[] = familias.map((familia) => ({
    id: familia.id,
    nome: familia.nome,
    endereco: familia.endereco,
    numero: familia.numero ?? '',
    bairro: familia.bairro ?? '',
    cidade: familia.cidade ?? '',
    setor: familia.setor ?? '',
    cep: familia.cep ?? '',
    telefone: familia.telefone ?? '',
    numero_moradores:
      familia.numeroMoradores != null ? String(familia.numeroMoradores) : '',
    numero_criancas:
      familia.numeroCriancas != null ? String(familia.numeroCriancas) : '',
    numero_idosos:
      familia.numeroIdosos != null ? String(familia.numeroIdosos) : '',
    numero_enfermos:
      familia.numeroEnfermos != null ? String(familia.numeroEnfermos) : '',
    numero_batizados:
      familia.numeroBatizados != null ? String(familia.numeroBatizados) : '',
    cargos: familia.cargos.join(', '),
    ministerio: familia.ministerio ?? '',
    situacao_religiosa: familia.situacaoReligiosa ?? '',
    situacao_economica: familia.situacaoEconomica ?? '',
    residencia: familia.residencia ?? '',
    criado_em: familia.criadoEm,
    atualizado_em: familia.atualizadoEm,
  }));

  const wsFamilias = XLSX.utils.json_to_sheet(linhas, {
    header: [...COLUNAS_FAMILIAS],
  });
  wsFamilias['!cols'] = [
    { wch: 38 }, // id
    { wch: 28 }, // nome
    { wch: 30 }, // endereco
    { wch: 12 }, // numero
    { wch: 20 }, // bairro
    { wch: 18 }, // cidade
    { wch: 15 }, // setor
    { wch: 12 }, // cep
    { wch: 17 }, // telefone
    { wch: 16 }, // numero_moradores
    { wch: 16 }, // numero_criancas
    { wch: 14 }, // numero_idosos
    { wch: 15 }, // numero_enfermos
    { wch: 16 }, // numero_batizados
    { wch: 32 }, // cargos
    { wch: 24 }, // ministerio
    { wch: 18 }, // situacao_religiosa
    { wch: 18 }, // situacao_economica
    { wch: 12 }, // residencia
    { wch: 26 }, // criado_em
    { wch: 26 }, // atualizado_em
  ];

  const wsLeiame = XLSX.utils.aoa_to_sheet(criarLinhasLeiame());
  wsLeiame['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 90 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, wsFamilias, NOME_ABA_FAMILIAS);
  XLSX.utils.book_append_sheet(workbook, wsLeiame, NOME_ABA_LEIAME);

  const arrayBuffer = XLSX.write(workbook, {
    type: 'array',
    bookType: 'xlsx',
  }) as ArrayBuffer;

  return new Uint8Array(arrayBuffer);
}

function localizarAbaFamilias(workbook: XLSX.WorkBook) {
  const sheetNames = workbook.SheetNames;
  if (sheetNames.length === 0) return null;

  const porNome = sheetNames.find(
    (name) => normalizarTextoComparacao(name) === 'familias'
  );
  if (porNome) return porNome;

  const primeiraNaoLeiame = sheetNames.find(
    (name) => normalizarTextoComparacao(name) !== 'leiame'
  );
  return primeiraNaoLeiame ?? sheetNames[0];
}

export function analisarPlanilhaBackup(
  dados: ArrayBuffer | Uint8Array,
  familiasAtuais: readonly Familia[]
): BackupImportPreview {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(dados, { type: 'array' });
  } catch {
    throw new Error('Não foi possível ler o arquivo selecionado como planilha Excel (.xlsx).');
  }

  const nomeAba = localizarAbaFamilias(workbook);
  if (!nomeAba) {
    throw new Error('A planilha selecionada não possui nenhuma aba.');
  }

  const sheet = workbook.Sheets[nomeAba];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  });

  if (rows.length === 0) {
    throw new Error('A planilha selecionada está vazia.');
  }

  const cabecalhoBruto = rows[0] ?? [];
  const indiceParaColuna = new Map<number, ColunaFamilia>();

  cabecalhoBruto.forEach((celula, idx) => {
    const chave = normalizarChaveCabecalho(String(celula ?? ''));
    const coluna = HEADER_ALIASES[chave];
    if (coluna && !Array.from(indiceParaColuna.values()).includes(coluna)) {
      indiceParaColuna.set(idx, coluna);
    }
  });

  const colunasEncontradas = new Set(indiceParaColuna.values());
  if (!colunasEncontradas.has('nome') || !colunasEncontradas.has('endereco')) {
    throw new Error(
      'Esta planilha não está no formato padrão de backup do aplicativo (colunas obrigatórias "nome" e "endereco" não encontradas).'
    );
  }

  const idsAtuais = new Set(familiasAtuais.map((familia) => familia.id));
  const idsNaPlanilha = new Set<string>();
  const validas: BackupImportRowValida[] = [];
  const invalidas: BackupImportRowInvalida[] = [];
  let totalLinhasLidas = 0;

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i] ?? [];
    const linhaNumero = i + 1;

    const valoresLinha = new Map<ColunaFamilia, string>();
    let linhaPossuiAlgumValor = false;

    for (const [colIdx, coluna] of indiceParaColuna.entries()) {
      const texto = String(row[colIdx] ?? '').trim();
      if (texto.length > 0) linhaPossuiAlgumValor = true;
      valoresLinha.set(coluna, texto);
    }

    if (!linhaPossuiAlgumValor) continue;
    totalLinhasLidas += 1;

    const getVal = (coluna: ColunaFamilia) => valoresLinha.get(coluna) ?? '';

    const idBruto = getVal('id');
    const nomeBruto = getVal('nome');
    const motivos: string[] = [];

    if (idBruto) {
      if (idsNaPlanilha.has(idBruto)) {
        motivos.push('O ID desta linha está duplicado na planilha.');
      } else {
        idsNaPlanilha.add(idBruto);
      }
    }

    const input: FamiliaInput = {
      nome: nomeBruto,
      endereco: getVal('endereco'),
      numero: getVal('numero') || null,
      bairro: getVal('bairro') || null,
      cidade: corresponderListaFixa(getVal('cidade'), CIDADES, LOCALIDADE_EXTRAS),
      cep: getVal('cep') || null,
      telefone: getVal('telefone') || null,
      numeroMoradores: getVal('numero_moradores') || null,
      numeroCriancas: getVal('numero_criancas') || null,
      numeroIdosos: getVal('numero_idosos') || null,
      numeroEnfermos: getVal('numero_enfermos') || null,
      numeroBatizados: getVal('numero_batizados') || null,
      cargos: parsearCargos(getVal('cargos')),
      ministerio: corresponderListaFixa(getVal('ministerio'), MINISTERIOS),
      situacaoReligiosa: corresponderListaFixa(
        getVal('situacao_religiosa'),
        SITUACOES_RELIGIOSAS
      ),
      situacaoEconomica: corresponderListaFixa(
        getVal('situacao_economica'),
        SITUACOES_ECONOMICAS
      ),
      residencia: corresponderListaFixa(getVal('residencia'), TIPOS_RESIDENCIA),
    };

    const validacao = validarFamilia(input);
    if (!validacao.success) {
      for (const erro of Object.values(validacao.errors)) {
        if (erro) motivos.push(erro);
      }
    }

    if (motivos.length > 0 || !validacao.success) {
      invalidas.push({
        linha: linhaNumero,
        nomeExibicao: nomeBruto || `Linha ${linhaNumero}`,
        motivos,
      });
      continue;
    }

    const acao: 'criar' | 'atualizar' =
      idBruto && idsAtuais.has(idBruto) ? 'atualizar' : 'criar';
    const criadoEmBruto = getVal('criado_em');
    const criadoEm =
      criadoEmBruto && !Number.isNaN(Date.parse(criadoEmBruto)) ? criadoEmBruto : null;

    validas.push({
      linha: linhaNumero,
      acao,
      item: {
        id: idBruto || Crypto.randomUUID(),
        ...validacao.data,
        criadoEm,
      },
    });
  }

  return {
    nomeAba,
    totalLinhasLidas,
    validas,
    novasCount: validas.filter((row) => row.acao === 'criar').length,
    atualizacoesCount: validas.filter((row) => row.acao === 'atualizar').length,
    invalidas,
  };
}
