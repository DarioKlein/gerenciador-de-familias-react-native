import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_VERSION = 1;

const CREATE_SCHEMA_V1 = `
  CREATE TABLE IF NOT EXISTS familias (
    id TEXT PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
    endereco TEXT NOT NULL CHECK (length(trim(endereco)) > 0),
    numero TEXT,
    bairro TEXT,
    cidade TEXT CHECK (
      cidade IS NULL OR cidade IN (
        'Cândido Mota',
        'Alexandria',
        'Porto Almeida',
        'Frutal do Campo',
        'Guaripu'
      )
    ),
    telefone TEXT,
    cargo TEXT CHECK (
      cargo IS NULL OR cargo IN (
        'Auxiliar de jovens',
        'Administração',
        'Porteiro / Porteira',
        'Músico'
      )
    ),
    ministerio TEXT CHECK (
      ministerio IS NULL OR ministerio IN (
        'Cooperador de jovens',
        'Cooperador oficial',
        'Diácono',
        'Ancião',
        'Encarregado de orquestra'
      )
    ),
    situacao_religiosa TEXT CHECK (
      situacao_religiosa IS NULL OR situacao_religiosa IN (
        'Congrega',
        'Parado',
        'Enfermo',
        'Testemunhado',
        'Contato'
      )
    ),
    situacao_economica TEXT CHECK (
      situacao_economica IS NULL OR situacao_economica IN (
        'Aposentado',
        'Desempregado',
        'Registrado',
        'Encostado',
        'Autônomo'
      )
    ),
    residencia TEXT CHECK (
      residencia IS NULL OR residencia IN ('Própria', 'Alugada')
    ),
    criado_em TEXT NOT NULL CHECK (length(trim(criado_em)) > 0),
    atualizado_em TEXT NOT NULL CHECK (length(trim(atualizado_em)) > 0),
    CHECK (cargo IS NULL OR ministerio IS NULL)
  );

  CREATE INDEX IF NOT EXISTS idx_familias_nome ON familias (nome);
  CREATE INDEX IF NOT EXISTS idx_familias_bairro ON familias (bairro);
  CREATE INDEX IF NOT EXISTS idx_familias_cidade ON familias (cidade);
`;

export async function migrateDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion > DATABASE_VERSION) {
    throw new Error(
      `O banco está na versão ${currentVersion}, mas o aplicativo suporta até ${DATABASE_VERSION}.`
    );
  }

  if (currentVersion === 0) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(CREATE_SCHEMA_V1);
      await db.execAsync('PRAGMA user_version = 1;');
    });
  }
}
