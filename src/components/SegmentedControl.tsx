import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColors } from '../stores/useThemeStore';
import { COLORS } from '../constants';
import { hapticLight } from '../utils/haptics';

interface SegmentOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceAlt }]}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.segment,
              isActive && [styles.activeSegment, { backgroundColor: colors.surface }],
            ]}
            onPress={async () => {
              await hapticLight();
              onChange(option.value);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={option.label}
          >
            <ThemedText
              style={[
                styles.label,
                isActive ? { color: COLORS.primary, fontWeight: '700' } : { color: colors.textMuted },
              ]}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginHorizontal: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeSegment: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  label: { fontSize: 14 },
});
