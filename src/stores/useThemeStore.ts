import { create } from 'zustand';
import { useColorScheme } from 'react-native';
import { COLORS } from '../constants';
import type { ThemeMode } from '../types';

type ThemeColors = typeof COLORS.dark;

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  setMode: (mode) => set({ mode }),
}));

export function useThemeColors(): ThemeColors & { isDark: boolean } {
  const mode = useThemeStore((s) => s.mode);
  const systemScheme = useColorScheme();
  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  return { ...(isDark ? COLORS.dark : COLORS.light), isDark };
}
