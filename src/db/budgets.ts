import { getDatabase } from './database';
import type { Budget, BudgetPeriod, CurrencyCode } from '../types';
import { generateId } from '../utils/id';

interface BudgetRow {
  id: string;
  category_id: string;
  amount: number;
  spent: number;
  period: string;
  start_date: number;
  end_date: number;
  currency: string;
  alert_at: number;
  created_at: number;
  updated_at: number;
}

function rowToBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    categoryId: row.category_id,
    amount: row.amount,
    spent: row.spent,
    period: row.period as BudgetPeriod,
    startDate: row.start_date,
    endDate: row.end_date,
    currency: row.currency as CurrencyCode,
    alertAt: row.alert_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllBudgets(): Promise<Budget[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<BudgetRow>(
    'SELECT * FROM budgets ORDER BY created_at DESC'
  );
  return rows.map(rowToBudget);
}

export async function getActiveBudgets(now: number): Promise<Budget[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<BudgetRow>(
    'SELECT * FROM budgets WHERE start_date <= ? AND end_date >= ? ORDER BY created_at DESC',
    [now, now]
  );
  return rows.map(rowToBudget);
}

export async function createBudget(
  data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Budget> {
  const db = await getDatabase();
  const now = Date.now();
  const id = generateId('bgt');

  await db.runAsync(
    `INSERT INTO budgets (id, category_id, amount, spent, period, start_date, end_date, currency, alert_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.categoryId, data.amount, data.spent, data.period, data.startDate, data.endDate,
     data.currency, data.alertAt, now, now]
  );

  return { ...data, id, createdAt: now, updatedAt: now };
}

export async function updateBudget(
  id: string,
  data: Partial<Omit<Budget, 'id' | 'createdAt'>>
): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (data.amount !== undefined) { fields.push('amount = ?'); values.push(data.amount); }
  if (data.spent !== undefined) { fields.push('spent = ?'); values.push(data.spent); }
  if (data.alertAt !== undefined) { fields.push('alert_at = ?'); values.push(data.alertAt); }

  fields.push('updated_at = ?');
  values.push(now, id);

  await db.runAsync(`UPDATE budgets SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function refreshBudgetSpent(categoryId: string, startDate: number, endDate: number, budgetId: string): Promise<void> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE category_id = ? AND date >= ? AND date <= ? AND type = 'expense' AND status = 'completed'`,
    [categoryId, startDate, endDate]
  );
  await db.runAsync(
    'UPDATE budgets SET spent = ?, updated_at = ? WHERE id = ?',
    [row?.total ?? 0, Date.now(), budgetId]
  );
}

export async function deleteBudget(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM budgets WHERE id = ?', [id]);
}
