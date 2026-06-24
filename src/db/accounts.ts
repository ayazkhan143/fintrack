import { getDatabase } from './database';
import type { Account, AccountType, CurrencyCode } from '../types';
import { generateId } from '../utils/id';

interface AccountRow {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  is_default: number;
  created_at: number;
  updated_at: number;
}

function rowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type as AccountType,
    balance: row.balance,
    currency: row.currency as CurrencyCode,
    color: row.color,
    icon: row.icon,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllAccounts(): Promise<Account[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<AccountRow>(
    'SELECT * FROM accounts ORDER BY is_default DESC, created_at ASC'
  );
  return rows.map(rowToAccount);
}

export async function getAccountById(id: string): Promise<Account | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<AccountRow>('SELECT * FROM accounts WHERE id = ?', [id]);
  return row ? rowToAccount(row) : null;
}

export async function createAccount(
  data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Account> {
  const db = await getDatabase();
  const now = Date.now();
  const id = generateId('acc');

  if (data.isDefault) {
    await db.runAsync('UPDATE accounts SET is_default = 0');
  }

  await db.runAsync(
    `INSERT INTO accounts (id, name, type, balance, currency, color, icon, is_default, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.name, data.type, data.balance, data.currency, data.color, data.icon, data.isDefault ? 1 : 0, now, now]
  );

  return { ...data, id, createdAt: now, updatedAt: now };
}

export async function updateAccount(
  id: string,
  data: Partial<Omit<Account, 'id' | 'createdAt'>>
): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();

  if (data.isDefault) {
    await db.runAsync('UPDATE accounts SET is_default = 0 WHERE id != ?', [id]);
  }

  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
  if (data.balance !== undefined) { fields.push('balance = ?'); values.push(data.balance); }
  if (data.currency !== undefined) { fields.push('currency = ?'); values.push(data.currency); }
  if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
  if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
  if (data.isDefault !== undefined) { fields.push('is_default = ?'); values.push(data.isDefault ? 1 : 0); }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function adjustAccountBalance(
  id: string,
  delta: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE accounts SET balance = balance + ?, updated_at = ? WHERE id = ?',
    [delta, Date.now(), id]
  );
}

export async function deleteAccount(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
}

export async function getTotalBalance(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(balance), 0) as total FROM accounts'
  );
  return row?.total ?? 0;
}
