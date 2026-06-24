import { getDatabase } from './database';
import type { RecurringTransaction, TransactionType, CurrencyCode } from '../types';
import { generateId } from '../utils/id';

interface RecurringRow {
  id: string;
  account_id: string;
  category_id: string;
  type: string;
  amount: number;
  currency: string;
  note: string;
  frequency: string;
  next_due_date: number;
  is_active: number;
  created_at: number;
  updated_at: number;
}

type RecurringFrequency = RecurringTransaction['frequency'];

function rowToRecurring(row: RecurringRow): RecurringTransaction {
  return {
    id: row.id,
    accountId: row.account_id,
    categoryId: row.category_id,
    type: row.type as TransactionType,
    amount: row.amount,
    currency: row.currency as CurrencyCode,
    note: row.note,
    frequency: row.frequency as RecurringFrequency,
    nextDueDate: row.next_due_date,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllRecurring(): Promise<RecurringTransaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RecurringRow>(
    'SELECT * FROM recurring_transactions ORDER BY next_due_date ASC'
  );
  return rows.map(rowToRecurring);
}

export async function getActiveRecurring(): Promise<RecurringTransaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RecurringRow>(
    'SELECT * FROM recurring_transactions WHERE is_active = 1 ORDER BY next_due_date ASC'
  );
  return rows.map(rowToRecurring);
}

export async function createRecurring(
  data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RecurringTransaction> {
  const db = await getDatabase();
  const now = Date.now();
  const id = generateId('rec');
  await db.runAsync(
    `INSERT INTO recurring_transactions
     (id, account_id, category_id, type, amount, currency, note, frequency, next_due_date, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.accountId, data.categoryId, data.type, data.amount, data.currency,
     data.note, data.frequency, data.nextDueDate, data.isActive ? 1 : 0, now, now]
  );
  return { ...data, id, createdAt: now, updatedAt: now };
}

export async function updateRecurringNextDue(id: string, nextDueDate: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE recurring_transactions SET next_due_date = ?, updated_at = ? WHERE id = ?',
    [nextDueDate, Date.now(), id]
  );
}

export async function toggleRecurring(id: string, isActive: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE recurring_transactions SET is_active = ?, updated_at = ? WHERE id = ?',
    [isActive ? 1 : 0, Date.now(), id]
  );
}

export async function deleteRecurring(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM recurring_transactions WHERE id = ?', [id]);
}
