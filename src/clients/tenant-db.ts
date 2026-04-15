import Database from 'better-sqlite3';
import path from 'node:path';
import { logger } from '../logger.js';

export type Tenant = {
  id: number;
  name: string;
  token: string;
  supabase_url: string;
  supabase_key: string;
  storage_bucket: string;
  storage_folder: string;
  active: number;
  created_at: string;
};

const DB_PATH = path.resolve(process.cwd(), 'data', 'tenants.db');

let db: Database.Database;

export function initTenantDb(): void {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      supabase_url TEXT NOT NULL,
      supabase_key TEXT NOT NULL,
      storage_bucket TEXT NOT NULL DEFAULT 'pdfs',
      storage_folder TEXT NOT NULL DEFAULT 'generated',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  logger.info({ path: DB_PATH }, 'Tenant database initialized');
}

export function findTenantByToken(token: string): Tenant | undefined {
  const stmt = db.prepare('SELECT * FROM tenants WHERE token = ?');
  return stmt.get(token) as Tenant | undefined;
}

export function createTenant(data: {
  name: string;
  token: string;
  supabase_url: string;
  supabase_key: string;
  storage_bucket?: string;
  storage_folder?: string;
}): Tenant {
  const stmt = db.prepare(`
    INSERT INTO tenants (name, token, supabase_url, supabase_key, storage_bucket, storage_folder)
    VALUES (@name, @token, @supabase_url, @supabase_key, @storage_bucket, @storage_folder)
  `);

  const result = stmt.run({
    name: data.name,
    token: data.token,
    supabase_url: data.supabase_url,
    supabase_key: data.supabase_key,
    storage_bucket: data.storage_bucket ?? 'pdfs',
    storage_folder: data.storage_folder ?? 'generated',
  });

  return findTenantByToken(data.token)!;
}

export function listTenants(): Tenant[] {
  const stmt = db.prepare('SELECT * FROM tenants ORDER BY created_at DESC');
  return stmt.all() as Tenant[];
}

export function revokeTenant(token: string): boolean {
  const stmt = db.prepare('UPDATE tenants SET active = 0 WHERE token = ?');
  const result = stmt.run(token);
  return result.changes > 0;
}

export function getDb(): Database.Database {
  return db;
}
