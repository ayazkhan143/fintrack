import { getDatabase } from './database';
import { adjustAccountBalance } from './accounts';
import type { Transaction, TransactionType, TransactionStatus, CurrencyCode } from '../types';
import { generateId } from '../utils/id';

interface TransactionRow {
  id: string;
  account_id: string;
  category_id: string;
  to_account_id: string | null;
  type: string;
  amount: number;
  currency: string;
  note: string;
  date: number;
  status: string;
  receipt_uri: string | null;
  tags: string;
  created_at: number;
  updated_at: number;
}

function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    accountId: row.account_id,
    categoryId: row.category_id,
    toAccountId: row.to_account_id,
    type: row.type as TransactionType,
    amount: row.amount,
    currency: row.currency as CurrencyCode,
    note: row.note,
    date: row.date,
    status: row.status as TransactionStatus,
    receiptUri: row.receipt_uri,
    tags: JSON.parse(row.tags) as string[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  dateFrom?: number;
  dateTo?: number;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
  const db = await getDatabase();
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (filters.accountId) { conditions.push('(account_id = ? OR to_account_id = ?)'); values.push(filters.accountId, filters.accountId); }
  if (filters.categoryId) { conditions.push('category_id = ?'); values.push(filters.categoryId); }
  if (filters.type) { conditions.push('type = ?'); values.push(filters.type); }
  if (filters.dateFrom) { conditions.push('date >= ?'); values.push(filters.dateFrom); }
  if (filters.dateTo) { conditions.push('date <= ?'); values.push(filters.dateTo); }
  if (filters.minAmount) { conditions.push('amount >= ?'); values.push(filters.minAmount); }
  if (filters.maxAmount) { conditions.push('amount <= ?'); values.push(filters.maxAmount); }
  if (filters.search) { conditions.push('(note LIKE ? OR tags LIKE ?)'); values.push(`%${filters.search}%`, `%${filters.search}%`); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const rows = await db.getAllAsync<TransactionRow>(
    `SELECT * FROM transactions ${where} ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  return rows.map(rowToTransaction);
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TransactionRow>('SELECT * FROM transactions WHERE id = ?', [id]);
  return row ? rowToTransaction(row) : null;
}

export async function createTransaction(
  data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Transaction> {
  const db = await getDatabase();
  const now = Date.now();
  const id = generateId('txn');

  await db.runAsync(
    `INSERT INTO transactions (id, account_id, category_id, to_account_id, type, amount, currency, note, date, status, receipt_uri, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.accountId, data.categoryId, data.toAccountId, data.type, data.amount, data.currency,
     data.note, data.date, data.status, data.receiptUri, JSON.stringify(data.tags), now, now]
  );

  if (data.status === 'completed') {
    if (data.type === 'expense') {
      await adjustAccountBalance(data.accountId, -data.amount);
    } else if (data.type === 'income') {
      await adjustAccountBalance(data.accountId, data.amount);
    } else if (data.type === 'transfer' && data.toAccountId) {
      await adjustAccountBalance(data.accountId, -data.amount);
      await adjustAccountBalance(data.toAccountId, data.amount);
    }
  }

  return { ...data, id, createdAt: now, updatedAt: now };
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.note !== undefined) { fields.push('note = ?'); values.push(data.note); }
  if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }
  if (data.receiptUri !== undefined) { fields.push('receipt_uri = ?'); values.push(data.receiptUri); }
  if (data.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(data.tags)); }
  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }

  fields.push('updated_at = ?');
  values.push(now, id);

  await db.runAsync(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  const tx = await getTransactionById(id);
  if (!tx || tx.status !== 'completed') {
    await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
    return;
  }

  // Reverse the balance change
  if (tx.type === 'expense') {
    await adjustAccountBalance(tx.accountId, tx.amount);
  } else if (tx.type === 'income') {
    await adjustAccountBalance(tx.accountId, -tx.amount);
  } else if (tx.type === 'transfer' && tx.toAccountId) {
    await adjustAccountBalance(tx.accountId, tx.amount);
    await adjustAccountBalance(tx.toAccountId, -tx.amount);
  }

  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function getMonthlyStats(year: number): Promise<{ month: string; income: number; expense: number }[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ month: string; income: number; expense: number }>(
    `SELECT
      strftime('%Y-%m', date / 1000, 'unixepoch') as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
     FROM transactions
     WHERE strftime('%Y', date / 1000, 'unixepoch') = ? AND status = 'completed'
     GROUP BY month ORDER BY month ASC`,
    [String(year)]
  );
  return rows;
}

export async function getCategoryStats(
  dateFrom: number,
  dateTo: number,
  type: TransactionType
): Promise<{ categoryId: string; total: number; count: number }[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ categoryId: string; total: number; count: number }>(
    `SELECT category_id as categoryId, SUM(amount) as total, COUNT(*) as count
     FROM transactions
     WHERE type = ? AND date >= ? AND date <= ? AND status = 'completed'
     GROUP BY category_id ORDER BY total DESC`,
    [type, dateFrom, dateTo]
  );
  return rows;
}

export async function getDailyStats(
  dateFrom: number,
  dateTo: number
): Promise<{ date: string; income: number; expense: number }[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ date: string; income: number; expense: number }>(
    `SELECT
      strftime('%Y-%m-%d', date / 1000, 'unixepoch') as date,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
     FROM transactions
     WHERE date >= ? AND date <= ? AND status = 'completed'
     GROUP BY date ORDER BY date ASC`,
    [dateFrom, dateTo]
  );
  return rows;
}

export async function getPeriodTotals(dateFrom: number, dateTo: number): Promise<{ income: number; expense: number }> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ income: number; expense: number }>(
    `SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
     FROM transactions WHERE date >= ? AND date <= ? AND status = 'completed'`,
    [dateFrom, dateTo]
  );
  return { income: row?.income ?? 0, expense: row?.expense ?? 0 };
}
