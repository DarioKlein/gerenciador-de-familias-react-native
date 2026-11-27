import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_VERSION = 7;

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
        'Parado'
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

const MIGRATE_TO_V2 = `
  ALTER TABLE familias ADD COLUMN cep TEXT;
  CREATE INDEX IF NOT EXISTS idx_familias_cep ON familias (cep);

  CREATE TABLE IF NOT EXISTS ceps_cache (
    cep TEXT PRIMARY KEY NOT NULL,
    endereco TEXT NOT NULL,
    bairro TEXT,
    municipio TEXT NOT NULL,
    uf TEXT NOT NULL,
    atualizado_em TEXT NOT NULL
  );
`;

const MIGRATE_TO_V3 = `
  CREATE TABLE IF NOT EXISTS familia_cargos (
    familia_id TEXT NOT NULL,
    cargo TEXT NOT NULL CHECK (
      cargo IN (
        'Auxiliar de jovens',
        'Administração',
        'Porteiro / Porteira',
        'Músico'
      )
    ),
    PRIMARY KEY (familia_id, cargo),
    FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_familia_cargos_familia
    ON familia_cargos (familia_id);

  INSERT OR IGNORE INTO familia_cargos (familia_id, cargo)
    SELECT id, cargo
    FROM familias
    WHERE cargo IS NOT NULL;

  UPDATE familias
    SET cargo = NULL
    WHERE cargo IS NOT NULL;
`;

const MIGRATE_TO_V4 = `
  ALTER TABLE familias ADD COLUMN numero_moradores INTEGER CHECK (numero_moradores IS NULL OR numero_moradores >= 0);
  ALTER TABLE familias ADD COLUMN numero_criancas INTEGER CHECK (numero_criancas IS NULL OR numero_criancas >= 0);
  ALTER TABLE familias ADD COLUMN numero_idosos INTEGER CHECK (numero_idosos IS NULL OR numero_idosos >= 0);
  ALTER TABLE familias ADD COLUMN numero_enfermos INTEGER CHECK (numero_enfermos IS NULL OR numero_enfermos >= 0);
  ALTER TABLE familias ADD COLUMN numero_batizados INTEGER CHECK (numero_batizados IS NULL OR numero_batizados >= 0);

  UPDATE familias
    SET situacao_religiosa = NULL
    WHERE situacao_religiosa IS NOT NULL
      AND situacao_religiosa NOT IN ('Congrega', 'Parado');
`;

const MIGRATE_TO_V5 = `
  CREATE TABLE IF NOT EXISTS familia_cargos_nova (
    familia_id TEXT NOT NULL,
    cargo TEXT NOT NULL CHECK (
      cargo IN (
        'Auxiliar de jovens',
        'Administração',
        'Porteiro(a)',
        'Músico',
        'Organista',
        'Auxiliar do som'
      )
    ),
    PRIMARY KEY (familia_id, cargo),
    FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE
  );

  INSERT OR IGNORE INTO familia_cargos_nova (familia_id, cargo)
    SELECT
      familia_id,
      CASE
        WHEN cargo = 'Porteiro / Porteira' THEN 'Porteiro(a)'
        ELSE cargo
      END
    FROM familia_cargos;

  DROP TABLE familia_cargos;
  ALTER TABLE familia_cargos_nova RENAME TO familia_cargos;

  CREATE INDEX IF NOT EXISTS idx_familia_cargos_familia
    ON familia_cargos (familia_id);
`;

const MIGRATE_TO_V6 = `
  CREATE TABLE IF NOT EXISTS familias_nova (
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
    cargo TEXT,
    ministerio TEXT CHECK (
      ministerio IS NULL OR ministerio IN (
        'Cooperador de jovens',
        'Cooperador oficial',
        'Diácono',
        'Ancião',
        'Encarregado de orquestra',
        'Irmã da obra da piedade'
      )
    ),
    situacao_religiosa TEXT CHECK (
      situacao_religiosa IS NULL OR situacao_religiosa IN (
        'Congrega',
        'Parado'
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
    cep TEXT,
    numero_moradores INTEGER CHECK (numero_moradores IS NULL OR numero_moradores >= 0),
    numero_criancas INTEGER CHECK (numero_criancas IS NULL OR numero_criancas >= 0),
    numero_idosos INTEGER CHECK (numero_idosos IS NULL OR numero_idosos >= 0),
    numero_enfermos INTEGER CHECK (numero_enfermos IS NULL OR numero_enfermos >= 0),
    numero_batizados INTEGER CHECK (numero_batizados IS NULL OR numero_batizados >= 0)
  );

  INSERT INTO familias_nova (
    id, nome, endereco, numero, bairro, cidade, telefone, cargo, ministerio,
    situacao_religiosa, situacao_economica, residencia, criado_em, atualizado_em,
    cep, numero_moradores, numero_criancas, numero_idosos, numero_enfermos, numero_batizados
  )
    SELECT
      id, nome, endereco, numero, bairro, cidade, telefone, cargo, ministerio,
      situacao_religiosa, situacao_economica, residencia, criado_em, atualizado_em,
      cep, numero_moradores, numero_criancas, numero_idosos, numero_enfermos, numero_batizados
    FROM familias;

  DROP TABLE familias;
  ALTER TABLE familias_nova RENAME TO familias;

  CREATE INDEX IF NOT EXISTS idx_familias_nome ON familias (nome);
  CREATE INDEX IF NOT EXISTS idx_familias_bairro ON familias (bairro);
  CREATE INDEX IF NOT EXISTS idx_familias_cidade ON familias (cidade);
  CREATE INDEX IF NOT EXISTS idx_familias_cep ON familias (cep);
`;

const MIGRATE_TO_V7 = `
  ALTER TABLE familias ADD COLUMN ultima_visita TEXT;
`;

export async function migrateDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = result?.user_version ?? 0;

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
    currentVersion = 1;
  }

  if (currentVersion === 1) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATE_TO_V2);
      await db.execAsync('PRAGMA user_version = 2;');
    });
    currentVersion = 2;
  }

  if (currentVersion === 2) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATE_TO_V3);
      await db.execAsync('PRAGMA user_version = 3;');
    });
    currentVersion = 3;
  }

  if (currentVersion === 3) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATE_TO_V4);
      await db.execAsync('PRAGMA user_version = 4;');
    });
    currentVersion = 4;
  }

  if (currentVersion === 4) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATE_TO_V5);
      await db.execAsync('PRAGMA user_version = 5;');
    });
    currentVersion = 5;
  }

  if (currentVersion === 5) {
    await db.execAsync('PRAGMA foreign_keys = OFF;');
    try {
      await db.withTransactionAsync(async () => {
        await db.execAsync(MIGRATE_TO_V6);
        await db.execAsync('PRAGMA user_version = 6;');
      });
      currentVersion = 6;
    } finally {
      await db.execAsync('PRAGMA foreign_keys = ON;');
    }
  }

  if (currentVersion === 6) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATE_TO_V7);
      await db.execAsync('PRAGMA user_version = 7;');
    });
  }
}
