import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  Cargo,
  Cidade,
  Ministerio,
  SituacaoEconomica,
  SituacaoReligiosa,
  TipoResidencia,
} from '@/features/familias/constants';
import type {
  Familia,
  FamiliaFiltros,
  FamiliaInput,
} from '@/features/familias/types';
import { validarFamiliaOuFalhar } from '@/features/familias/validation';

type FamiliaRow = {
  id: string;
  nome: string;
  endereco: string;
  numero: string | null;
  bairro: string | null;
  cidade: Cidade | null;
  telefone: string | null;
  cargo: Cargo | null;
  ministerio: Ministerio | null;
  situacao_religiosa: SituacaoReligiosa | null;
  situacao_economica: SituacaoEconomica | null;
  residencia: TipoResidencia | null;
  criado_em: string;
  atualizado_em: string;
};

const SELECT_FAMILIAS = `
  SELECT
    id,
    nome,
    endereco,
    numero,
    bairro,
    cidade,
    telefone,
    cargo,
    ministerio,
    situacao_religiosa,
    situacao_economica,
    residencia,
    criado_em,
    atualizado_em
  FROM familias
`;

function mapFamilia(row: FamiliaRow): Familia {
  return {
    id: row.id,
    nome: row.nome,
    endereco: row.endereco,
    numero: row.numero,
    bairro: row.bairro,
    cidade: row.cidade,
    telefone: row.telefone,
    cargo: row.cargo,
    ministerio: row.ministerio,
    situacaoReligiosa: row.situacao_religiosa,
    situacaoEconomica: row.situacao_economica,
    residencia: row.residencia,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

function normalizarBusca(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

function correspondeAosFiltros(familia: Familia, filtros: FamiliaFiltros) {
  if (filtros.bairro && familia.bairro !== filtros.bairro) return false;
  if (filtros.cidade && familia.cidade !== filtros.cidade) return false;
  if (
    filtros.situacaoReligiosa &&
    familia.situacaoReligiosa !== filtros.situacaoReligiosa
  ) {
    return false;
  }
  if (
    filtros.situacaoEconomica &&
    familia.situacaoEconomica !== filtros.situacaoEconomica
  ) {
    return false;
  }

  const busca = filtros.busca ? normalizarBusca(filtros.busca) : '';
  if (!busca) return true;

  return [
    familia.nome,
    familia.endereco,
    familia.numero,
    familia.bairro,
    familia.cidade,
    familia.telefone,
  ].some((value) => value && normalizarBusca(value).includes(busca));
}

export function createFamiliasRepository(db: SQLiteDatabase) {
  async function buscarPorId(id: string) {
    const row = await db.getFirstAsync<FamiliaRow>(
      `${SELECT_FAMILIAS} WHERE id = ? LIMIT 1`,
      id
    );
    return row ? mapFamilia(row) : null;
  }

  return {
    async listar(filtros: FamiliaFiltros = {}) {
      const rows = await db.getAllAsync<FamiliaRow>(
        `${SELECT_FAMILIAS} ORDER BY nome COLLATE NOCASE ASC`
      );
      return rows.map(mapFamilia).filter((familia) => correspondeAosFiltros(familia, filtros));
    },

    buscarPorId,

    async contar() {
      const result = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) AS total FROM familias'
      );
      return result?.total ?? 0;
    },

    async listarBairros() {
      const rows = await db.getAllAsync<{ bairro: string }>(`
        SELECT DISTINCT bairro
        FROM familias
        WHERE bairro IS NOT NULL AND length(trim(bairro)) > 0
        ORDER BY bairro COLLATE NOCASE ASC
      `);
      return rows.map((row) => row.bairro);
    },

    async criar(input: FamiliaInput) {
      const data = validarFamiliaOuFalhar(input);
      const timestamp = new Date().toISOString();
      const familia: Familia = {
        id: Crypto.randomUUID(),
        ...data,
        criadoEm: timestamp,
        atualizadoEm: timestamp,
      };

      await db.runAsync(
        `INSERT INTO familias (
          id, nome, endereco, numero, bairro, cidade, telefone, cargo, ministerio,
          situacao_religiosa, situacao_economica, residencia, criado_em, atualizado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        familia.id,
        familia.nome,
        familia.endereco,
        familia.numero,
        familia.bairro,
        familia.cidade,
        familia.telefone,
        familia.cargo,
        familia.ministerio,
        familia.situacaoReligiosa,
        familia.situacaoEconomica,
        familia.residencia,
        familia.criadoEm,
        familia.atualizadoEm
      );

      return familia;
    },

    async atualizar(id: string, input: FamiliaInput) {
      const atual = await buscarPorId(id);
      if (!atual) return null;

      const data = validarFamiliaOuFalhar(input);
      const atualizadoEm = new Date().toISOString();

      await db.runAsync(
        `UPDATE familias SET
          nome = ?,
          endereco = ?,
          numero = ?,
          bairro = ?,
          cidade = ?,
          telefone = ?,
          cargo = ?,
          ministerio = ?,
          situacao_religiosa = ?,
          situacao_economica = ?,
          residencia = ?,
          atualizado_em = ?
        WHERE id = ?`,
        data.nome,
        data.endereco,
        data.numero,
        data.bairro,
        data.cidade,
        data.telefone,
        data.cargo,
        data.ministerio,
        data.situacaoReligiosa,
        data.situacaoEconomica,
        data.residencia,
        atualizadoEm,
        id
      );

      return {
        ...atual,
        ...data,
        atualizadoEm,
      };
    },

    async excluir(id: string) {
      const result = await db.runAsync('DELETE FROM familias WHERE id = ?', id);
      return result.changes > 0;
    },
  };
}

export type FamiliasRepository = ReturnType<typeof createFamiliasRepository>;
