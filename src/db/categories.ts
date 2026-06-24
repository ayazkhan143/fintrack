import { getDatabase } from './database';
import { SYSTEM_CATEGORIES } from '../constants';
import type { Category, TransactionType } from '../types';
import { generateId } from '../utils/id';

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  parent_id: string | null;
  is_system: number;
}

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    type: row.type as TransactionType,
    parentId: row.parent_id,
    isSystem: row.is_system === 1,
  };
}

export async function seedCategories(): Promise<void> {
  const db = await getDatabase();
  const count = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories WHERE is_system = 1'
  );
  if ((count?.count ?? 0) > 0) return;

  for (const cat of SYSTEM_CATEGORIES) {
    await db.runAsync(
      'INSERT OR IGNORE INTO categories (id, name, icon, color, type, parent_id, is_system) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cat.id, cat.name, cat.icon, cat.color, cat.type, cat.parentId, 1]
    );
  }
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CategoryRow>(
    'SELECT * FROM categories ORDER BY is_system DESC, name ASC'
  );
  return rows.map(rowToCategory);
}

export async function getCategoriesByType(type: TransactionType): Promise<Category[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CategoryRow>(
    'SELECT * FROM categories WHERE type = ? ORDER BY is_system DESC, name ASC',
    [type]
  );
  return rows.map(rowToCategory);
}

export async function createCategory(
  data: Omit<Category, 'id' | 'isSystem'>
): Promise<Category> {
  const db = await getDatabase();
  const id = generateId('cat');
  await db.runAsync(
    'INSERT INTO categories (id, name, icon, color, type, parent_id, is_system) VALUES (?, ?, ?, ?, ?, ?, 0)',
    [id, data.name, data.icon, data.color, data.type, data.parentId]
  );
  return { ...data, id, isSystem: false };
}

export async function updateCategory(
  id: string,
  data: Partial<Pick<Category, 'name' | 'icon' | 'color'>>
): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: string[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
  if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }

  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND is_system = 0`, values);
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM categories WHERE id = ? AND is_system = 0', [id]);
}
