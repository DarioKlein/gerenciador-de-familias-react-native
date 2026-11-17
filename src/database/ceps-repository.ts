import type { SQLiteDatabase } from 'expo-sqlite';

import { formatarCep, type EnderecoCep } from '@/features/familias/cep';
import { MUNICIPIO_OFICIAL, UF_OFICIAL } from '@/features/familias/constants';

type CepCacheRow = {
  cep: string;
  endereco: string;
  bairro: string | null;
  municipio: string;
  uf: string;
};

function mapEndereco(row: CepCacheRow): EnderecoCep {
  return {
    cep: row.cep,
    endereco: row.endereco,
    bairro: row.bairro,
    municipio: row.municipio,
    uf: row.uf,
  };
}

function normalizar(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export function createCepsRepository(db: SQLiteDatabase) {
  async function salvar(endereco: EnderecoCep) {
    await db.runAsync(
      `INSERT INTO ceps_cache (cep, endereco, bairro, municipio, uf, atualizado_em)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(cep) DO UPDATE SET
         endereco = excluded.endereco,
         bairro = excluded.bairro,
         municipio = excluded.municipio,
         uf = excluded.uf,
         atualizado_em = excluded.atualizado_em`,
      endereco.cep,
      endereco.endereco,
      endereco.bairro,
      endereco.municipio,
      endereco.uf,
      new Date().toISOString()
    );
  }

  return {
    async buscarPorCep(cep: string) {
      const row = await db.getFirstAsync<CepCacheRow>(
        `SELECT cep, endereco, bairro, municipio, uf
         FROM ceps_cache
         WHERE cep = ?
         LIMIT 1`,
        formatarCep(cep)
      );
      return row ? mapEndereco(row) : null;
    },

    async buscarPorEndereco(endereco: string) {
      const rows = await db.getAllAsync<CepCacheRow>(
        `SELECT cep, endereco, bairro, municipio, uf
         FROM ceps_cache
         WHERE municipio = ? AND uf = ?
         ORDER BY endereco COLLATE NOCASE ASC`,
        MUNICIPIO_OFICIAL,
        UF_OFICIAL
      );
      const query = normalizar(endereco);
      return rows
        .filter((row) => normalizar(row.endereco).includes(query))
        .map(mapEndereco);
    },

    salvar,

    async salvarVarios(enderecos: EnderecoCep[]) {
      await db.withTransactionAsync(async () => {
        for (const endereco of enderecos) await salvar(endereco);
      });
    },
  };
}

export type CepsRepository = ReturnType<typeof createCepsRepository>;
