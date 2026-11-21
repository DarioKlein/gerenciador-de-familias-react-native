import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import {
  BAIRROS_CATALOGO,
  obterSetorDaFamilia,
  type Cargo,
  type Cidade,
  type Ministerio,
  type SituacaoEconomica,
  type SituacaoReligiosa,
  type TipoResidencia,
} from '@/features/familias/constants';
import type {
  Familia,
  FamiliaDados,
  FamiliaFiltros,
  FamiliaInput,
} from '@/features/familias/types';
import { obterDigitosTelefone } from '@/features/familias/telefone';
import { validarFamiliaOuFalhar } from '@/features/familias/validation';

export type FamiliaImportacaoItem = FamiliaDados & {
  id: string;
  criadoEm?: string | null;
};

type FamiliaRow = {
  id: string;
  nome: string;
  endereco: string;
  cep: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: Cidade | null;
  telefone: string | null;
  numero_moradores: number | null;
  numero_criancas: number | null;
  numero_idosos: number | null;
  numero_enfermos: number | null;
  numero_batizados: number | null;
  ministerio: Ministerio | null;
  situacao_religiosa: SituacaoReligiosa | null;
  situacao_economica: SituacaoEconomica | null;
  residencia: TipoResidencia | null;
  criado_em: string;
  atualizado_em: string;
};

type CargoRow = {
  familia_id: string;
  cargo: Cargo;
};

const SELECT_FAMILIAS = `
  SELECT
    id,
    nome,
    endereco,
    cep,
    numero,
    bairro,
    cidade,
    telefone,
    numero_moradores,
    numero_criancas,
    numero_idosos,
    numero_enfermos,
    numero_batizados,
    ministerio,
    situacao_religiosa,
    situacao_economica,
    residencia,
    criado_em,
    atualizado_em
  FROM familias
`;

function mapFamilia(row: FamiliaRow, cargos: Cargo[]): Familia {
  return {
    id: row.id,
    nome: row.nome,
    endereco: row.endereco,
    cep: row.cep,
    numero: row.numero,
    bairro: row.bairro,
    cidade: row.cidade,
    setor: obterSetorDaFamilia({ cidade: row.cidade, bairro: row.bairro }),
    telefone: row.telefone,
    numeroMoradores: row.numero_moradores,
    numeroCriancas: row.numero_criancas,
    numeroIdosos: row.numero_idosos,
    numeroEnfermos: row.numero_enfermos,
    numeroBatizados: row.numero_batizados,
    cargos,
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

export function correspondeAosFiltros(familia: Familia, filtros: FamiliaFiltros) {
  if (filtros.setor && familia.setor !== filtros.setor) return false;
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

  const buscaNumerica = /^[\d\s()+-]+$/.test(busca)
    ? obterDigitosTelefone(busca)
    : '';
  if (
    buscaNumerica &&
    familia.telefone &&
    obterDigitosTelefone(familia.telefone).includes(buscaNumerica)
  ) {
    return true;
  }

  return [familia.nome, familia.telefone].some(
    (value) => value && normalizarBusca(value).includes(busca)
  );
}

export function createFamiliasRepository(db: SQLiteDatabase) {
  async function buscarCargosPorFamilia(id: string) {
    const rows = await db.getAllAsync<CargoRow>(
      `SELECT familia_id, cargo
       FROM familia_cargos
       WHERE familia_id = ?
       ORDER BY cargo COLLATE NOCASE ASC`,
      id
    );
    return rows.map((row) => row.cargo);
  }

  async function substituirCargos(id: string, cargos: Cargo[]) {
    await db.runAsync('DELETE FROM familia_cargos WHERE familia_id = ?', id);
    for (const cargo of cargos) {
      await db.runAsync(
        'INSERT INTO familia_cargos (familia_id, cargo) VALUES (?, ?)',
        id,
        cargo
      );
    }
  }

  async function buscarPorId(id: string) {
    const [row, cargos] = await Promise.all([
      db.getFirstAsync<FamiliaRow>(`${SELECT_FAMILIAS} WHERE id = ? LIMIT 1`, id),
      buscarCargosPorFamilia(id),
    ]);
    return row ? mapFamilia(row, cargos) : null;
  }

  return {
    async listar(filtros: FamiliaFiltros = {}) {
      const [rows, cargoRows] = await Promise.all([
        db.getAllAsync<FamiliaRow>(
          `${SELECT_FAMILIAS} ORDER BY nome COLLATE NOCASE ASC`
        ),
        db.getAllAsync<CargoRow>(
          `SELECT familia_id, cargo
           FROM familia_cargos
           ORDER BY cargo COLLATE NOCASE ASC`
        ),
      ]);
      const cargosPorFamilia = new Map<string, Cargo[]>();
      for (const cargoRow of cargoRows) {
        const cargos = cargosPorFamilia.get(cargoRow.familia_id) ?? [];
        cargos.push(cargoRow.cargo);
        cargosPorFamilia.set(cargoRow.familia_id, cargos);
      }

      return rows
        .map((row) => mapFamilia(row, cargosPorFamilia.get(row.id) ?? []))
        .filter((familia) => correspondeAosFiltros(familia, filtros));
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
      const unicos = new Map<string, string>();
      for (const row of rows) {
        const chave = normalizarBusca(row.bairro);
        if (!unicos.has(chave)) unicos.set(chave, row.bairro);
      }
      for (const bairro of BAIRROS_CATALOGO) {
        const chave = normalizarBusca(bairro);
        if (!unicos.has(chave)) unicos.set(chave, bairro);
      }
      return Array.from(unicos.values()).sort((a, b) =>
        a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
      );
    },

    async criar(input: FamiliaInput) {
      const data = validarFamiliaOuFalhar(input);
      const timestamp = new Date().toISOString();
      const familia: Familia = {
        id: Crypto.randomUUID(),
        ...data,
        setor: obterSetorDaFamilia({ cidade: data.cidade, bairro: data.bairro }),
        criadoEm: timestamp,
        atualizadoEm: timestamp,
      };

      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO familias (
            id, nome, endereco, cep, numero, bairro, cidade, telefone,
            numero_moradores, numero_criancas, numero_idosos, numero_enfermos, numero_batizados,
            cargo, ministerio, situacao_religiosa, situacao_economica, residencia,
            criado_em, atualizado_em
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          familia.id,
          familia.nome,
          familia.endereco,
          familia.cep,
          familia.numero,
          familia.bairro,
          familia.cidade,
          familia.telefone,
          familia.numeroMoradores,
          familia.numeroCriancas,
          familia.numeroIdosos,
          familia.numeroEnfermos,
          familia.numeroBatizados,
          null,
          familia.ministerio,
          familia.situacaoReligiosa,
          familia.situacaoEconomica,
          familia.residencia,
          familia.criadoEm,
          familia.atualizadoEm
        );
        await substituirCargos(familia.id, familia.cargos);
      });

      return familia;
    },

    async atualizar(id: string, input: FamiliaInput) {
      const atual = await buscarPorId(id);
      if (!atual) return null;

      const data = validarFamiliaOuFalhar(input);
      const atualizadoEm = new Date().toISOString();

      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `UPDATE familias SET
            nome = ?,
            endereco = ?,
            cep = ?,
            numero = ?,
            bairro = ?,
            cidade = ?,
            telefone = ?,
            numero_moradores = ?,
            numero_criancas = ?,
            numero_idosos = ?,
            numero_enfermos = ?,
            numero_batizados = ?,
            ministerio = ?,
            situacao_religiosa = ?,
            situacao_economica = ?,
            residencia = ?,
            atualizado_em = ?
          WHERE id = ?`,
          data.nome,
          data.endereco,
          data.cep,
          data.numero,
          data.bairro,
          data.cidade,
          data.telefone,
          data.numeroMoradores,
          data.numeroCriancas,
          data.numeroIdosos,
          data.numeroEnfermos,
          data.numeroBatizados,
          data.ministerio,
          data.situacaoReligiosa,
          data.situacaoEconomica,
          data.residencia,
          atualizadoEm,
          id
        );
        await substituirCargos(id, data.cargos);
      });

      return {
        ...atual,
        ...data,
        setor: obterSetorDaFamilia({ cidade: data.cidade, bairro: data.bairro }),
        atualizadoEm,
      };
    },

    async excluir(id: string) {
      const result = await db.runAsync('DELETE FROM familias WHERE id = ?', id);
      return result.changes > 0;
    },

    async importarLote(itens: readonly FamiliaImportacaoItem[]) {
      let criados = 0;
      let atualizados = 0;

      await db.withTransactionAsync(async () => {
        const existentesRows = await db.getAllAsync<{ id: string }>(
          'SELECT id FROM familias'
        );
        const idsExistentes = new Set(existentesRows.map((row) => row.id));

        for (const item of itens) {
          const data = validarFamiliaOuFalhar(item);
          const agora = new Date().toISOString();

          if (idsExistentes.has(item.id)) {
            await db.runAsync(
              `UPDATE familias SET
                nome = ?,
                endereco = ?,
                cep = ?,
                numero = ?,
                bairro = ?,
                cidade = ?,
                telefone = ?,
                numero_moradores = ?,
                numero_criancas = ?,
                numero_idosos = ?,
                numero_enfermos = ?,
                numero_batizados = ?,
                ministerio = ?,
                situacao_religiosa = ?,
                situacao_economica = ?,
                residencia = ?,
                atualizado_em = ?
              WHERE id = ?`,
              data.nome,
              data.endereco,
              data.cep,
              data.numero,
              data.bairro,
              data.cidade,
              data.telefone,
              data.numeroMoradores,
              data.numeroCriancas,
              data.numeroIdosos,
              data.numeroEnfermos,
              data.numeroBatizados,
              data.ministerio,
              data.situacaoReligiosa,
              data.situacaoEconomica,
              data.residencia,
              agora,
              item.id
            );
            await substituirCargos(item.id, data.cargos);
            atualizados += 1;
          } else {
            const criadoEmValido =
              item.criadoEm && !Number.isNaN(Date.parse(item.criadoEm))
                ? item.criadoEm
                : agora;

            await db.runAsync(
              `INSERT INTO familias (
                id, nome, endereco, cep, numero, bairro, cidade, telefone,
                numero_moradores, numero_criancas, numero_idosos, numero_enfermos, numero_batizados,
                cargo, ministerio, situacao_religiosa, situacao_economica, residencia,
                criado_em, atualizado_em
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              item.id,
              data.nome,
              data.endereco,
              data.cep,
              data.numero,
              data.bairro,
              data.cidade,
              data.telefone,
              data.numeroMoradores,
              data.numeroCriancas,
              data.numeroIdosos,
              data.numeroEnfermos,
              data.numeroBatizados,
              null,
              data.ministerio,
              data.situacaoReligiosa,
              data.situacaoEconomica,
              data.residencia,
              criadoEmValido,
              agora
            );
            await substituirCargos(item.id, data.cargos);
            idsExistentes.add(item.id);
            criados += 1;
          }
        }
      });

      return { criados, atualizados };
    },
  };
}

export type FamiliasRepository = ReturnType<typeof createFamiliasRepository>;
