import { getDatabase } from './database';
import { DEFAULT_SETTINGS } from '../constants';
import type { AppSettings } from '../types';

export async function getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  if (!row) return DEFAULT_SETTINGS[key];
  try {
    return JSON.parse(row.value) as AppSettings[K];
  } catch {
    return DEFAULT_SETTINGS[key];
  }
}

export async function setSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, JSON.stringify(value)]
  );
}

export async function getAllSettings(): Promise<AppSettings> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT * FROM settings');
  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    try {
      const key = row.key as keyof AppSettings;
      if (key in settings) {
        (settings as Record<string, unknown>)[key] = JSON.parse(row.value);
      }
    } catch {
      // Keep default if parse fails
    }
  }
  return settings;
}
