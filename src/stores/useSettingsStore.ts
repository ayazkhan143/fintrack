import { create } from 'zustand';
import { getAllSettings, setSetting } from '../db/settings';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;
  load: () => Promise<void>;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  load: async () => {
    const settings = await getAllSettings();
    set({ settings, isLoaded: true });
  },

  update: async (key, value) => {
    await setSetting(key, value);
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
  },
}));

export function useSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
  return useSettingsStore((s) => s.settings[key]);
}

export function useDefaultCurrency() {
  return useSettingsStore((s) => s.settings.currency);
}
