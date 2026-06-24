import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import { ThemedView } from '../../src/components/ThemedView';
import { ThemedText } from '../../src/components/ThemedText';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { SummaryCard } from '../../src/components/SummaryCard';
import { useThemeColors } from '../../src/stores/useThemeStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useMonthlyStats, useCategoryStats, usePeriodTotals } from '../../src/hooks/useTransactions';
import { useCategories } from '../../src/hooks/useCategories';
import { formatCurrency } from '../../src/utils/currency';
import { getMonthRange, getMonthsInYear } from '../../src/utils/date';
import { COLORS } from '../../src/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;

type PeriodTab = 'month' | 'year';

const { start: monthStart, end: monthEnd } = getMonthRange();
const CURRENT_YEAR = new Date().getFullYear();
const MONTH_LABELS = getMonthsInYear(CURRENT_YEAR);

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { settings } = useSettingsStore();
  const [period, setPeriod] = useState<PeriodTab>('month');

  const { data: monthlyStats = [] } = useMonthlyStats(CURRENT_YEAR);
  const { data: categoryStats = [] } = useCategoryStats(monthStart, monthEnd, 'expense');
  const { data: totals } = usePeriodTotals(monthStart, monthEnd);
  const { data: categories = [] } = useCategories();

  const barData = useMemo(() => {
    const incomeByMonth = new Array(12).fill(0);
    const expenseByMonth = new Array(12).fill(0);
    for (const stat of monthlyStats) {
      const monthIdx = parseInt(stat.month.split('-')[1], 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        incomeByMonth[monthIdx] = stat.income;
        expenseByMonth[monthIdx] = stat.expense;
      }
    }
    return { incomeByMonth, expenseByMonth };
  }, [monthlyStats]);

  const categoryBreakdown = useMemo(() => {
    const totalSpent = categoryStats.reduce((acc, s) => acc + s.total, 0);
    return categoryStats.slice(0, 6).map((s) => {
      const cat = categories.find((c) => c.id === s.categoryId);
      return {
        ...s,
        name: cat?.name ?? 'Other',
        color: cat?.color ?? COLORS.primary,
        percentage: totalSpent > 0 ? (s.total / totalSpent) * 100 : 0,
      };
    });
  }, [categoryStats, categories]);

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => colors.textMuted,
    barPercentage: 0.6,
    propsForLabels: { fontSize: 10 },
  };

  return (
    <ThemedView style={[styles.fill, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <ThemedText variant="title">Analytics</ThemedText>
        </View>

        <SegmentedControl
          options={[{ label: 'This Month', value: 'month' }, { label: 'This Year', value: 'year' }]}
          value={period}
          onChange={(v) => setPeriod(v as PeriodTab)}
        />

        {totals ? (
          <SummaryCard
            income={totals.income}
            expense={totals.expense}
            currency={settings.currency}
            label="This Month"
          />
        ) : null}

        {/* Bar Chart */}
        {period === 'year' && (
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <ThemedText variant="label" style={styles.chartTitle}>Monthly Overview {CURRENT_YEAR}</ThemedText>
            <BarChart
              data={{
                labels: MONTH_LABELS,
                datasets: [{ data: barData.expenseByMonth.map((v) => Math.round(v)) }],
              }}
              width={CHART_WIDTH - 32}
              height={180}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars={false}
              withInnerLines={false}
              fromZero
              yAxisLabel=""
              yAxisSuffix=""
            />
          </View>
        )}

        {/* Category breakdown */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <ThemedText variant="label" style={styles.sectionTitle}>Top Spending Categories</ThemedText>
          {categoryBreakdown.length === 0 ? (
            <ThemedText variant="muted" style={styles.emptyText}>No expenses this month</ThemedText>
          ) : (
            categoryBreakdown.map((item) => (
              <View key={item.categoryId} style={styles.catRow}>
                <View style={styles.catLeft}>
                  <View style={[styles.catDot, { backgroundColor: item.color }]} />
                  <ThemedText style={styles.catName}>{item.name}</ThemedText>
                </View>
                <View style={styles.catRight}>
                  <ThemedText style={styles.catAmount}>
                    {formatCurrency(item.total, settings.currency)}
                  </ThemedText>
                  <ThemedText variant="subtle">{item.percentage.toFixed(1)}%</ThemedText>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  chartCard: { margin: 16, borderRadius: 16, padding: 16 },
  chartTitle: { marginBottom: 12 },
  chart: { borderRadius: 12, marginLeft: -8 },
  section: { margin: 16, borderRadius: 16, padding: 16 },
  sectionTitle: { marginBottom: 16 },
  emptyText: { textAlign: 'center', paddingVertical: 12 },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { fontWeight: '500' },
  catRight: { alignItems: 'flex-end' },
  catAmount: { fontWeight: '700' },
});
