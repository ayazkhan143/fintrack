import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('fintrack.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return db;
}

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT NOT NULL,
      parent_id TEXT,
      is_system INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      account_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      to_account_id TEXT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      note TEXT NOT NULL DEFAULT '',
      date INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      receipt_uri TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY NOT NULL,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL,
      spent REAL NOT NULL DEFAULT 0,
      period TEXT NOT NULL,
      start_date INTEGER NOT NULL,
      end_date INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      alert_at REAL NOT NULL DEFAULT 0.8,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recurring_transactions (
      id TEXT PRIMARY KEY NOT NULL,
      account_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      note TEXT NOT NULL DEFAULT '',
      frequency TEXT NOT NULL,
      next_due_date INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);
    CREATE INDEX IF NOT EXISTS idx_recurring_due ON recurring_transactions(next_due_date);
  `);
}
