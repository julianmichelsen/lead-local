import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath);
}

export const db = new Database(path.join(dbPath, 'leadlocal.db'));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      cnpj TEXT UNIQUE NOT NULL,
      razao_social TEXT NOT NULL,
      nome_fantasia TEXT,
      municipio TEXT,
      uf TEXT,
      cnae_principal TEXT,
      cnae_descricao TEXT,
      situacao_cadastral TEXT,
      porte TEXT,
      data_inicio_atividade TEXT,
      telefone TEXT,
      email TEXT,
      site TEXT,
      score_inicial INTEGER DEFAULT 50,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS company_enrichment (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      source TEXT NOT NULL,
      raw_json TEXT,
      normalized_json TEXT,
      last_enriched_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS crm_leads (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      stage TEXT NOT NULL,
      owner_name TEXT,
      notes TEXT,
      next_action TEXT,
      score INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS crm_activities (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES crm_leads(id)
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_companies_municipio ON companies(municipio);
    CREATE INDEX IF NOT EXISTS idx_companies_uf ON companies(uf);
    CREATE INDEX IF NOT EXISTS idx_companies_cnae ON companies(cnae_principal);
    CREATE INDEX IF NOT EXISTS idx_companies_data_inicio ON companies(data_inicio_atividade);
    CREATE INDEX IF NOT EXISTS idx_companies_razao ON companies(razao_social);
    CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
  `);
}
