// ─────────────────────────────────────────────
// Stats Screen — 對應 ScreenStats
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGameStore } from '@/stores/gameStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabBar } from '@/components/layout/TabBar';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';

const CATS = [
  { n: 'Study',   v: 42, color: '#0D0D0D' },
  { n: 'Work',    v: 28, color: '#525252' },
  { n: 'Reading', v: 18, color: '#A3A3A3' },
  { n: 'Hobby',   v: 12, color: '#D4D4D4' },
];
const DAYS_14 = [3, 5, 2, 6, 4, 7, 5, 4, 6, 3, 5, 7, 5, 4];
const DMAX = Math.max(...DAYS_14);
// Distraction data 改從 store 的 HashMap 讀取
const FALLBACK_DISTRACTIONS = [
  { n: 'Phone',              v: 0.6 },
  { n: 'Wandering thoughts', v: 0.45 },
  { n: 'Tiredness',          v: 0.3 },
];

export default function StatsScreen() {
  const total = CATS.reduce((s, c) => s + c.v, 0);
  const getTopDistractions = useGameStore((s) => s.getTopDistractions);
  const topDistractions = getTopDistractions();
  // 有真實資料就用 HashMap 結果，否則用 fallback demo 資料
  const DISTRACTIONS = topDistractions.length > 0
    ? topDistractions.slice(0, 5).map((d) => ({ n: d.reason, v: d.pct }))
    : FALLBACK_DISTRACTIONS;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Stats" showBack />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Donut + Legend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Time by mission</Text>
          <View style={styles.donutRow}>
            {/* Simplified pie using stacked bars */}
            <View style={styles.donut}>
              <View style={styles.donutCenter}>
                <Text style={styles.donutHrs}>34h</Text>
                <Text style={styles.donutSub}>this week</Text>
              </View>
              {CATS.map((c) => (
                <View
                  key={c.n}
                  style={[styles.donutSlice, { height: `${(c.v / total) * 100}%`, backgroundColor: c.color }]}
                />
              ))}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              {CATS.map((c) => (
                <View key={c.n} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                  <Text style={{ flex: 1, fontSize: FontSize.sm }}>{c.n}</Text>
                  <Text style={[styles.legendVal]}>{c.v}h</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 14-day bar chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily focus · 14 days</Text>
          <View style={styles.bars}>
            {DAYS_14.map((h, i) => (
              <View key={i} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    { height: (h / DMAX) * 80, backgroundColor: i === DAYS_14.length - 1 ? Colors.primary : Colors.borderMid },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Top distractions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top distractions</Text>
          {DISTRACTIONS.map((d) => (
            <View key={d.n} style={{ marginBottom: Spacing.sm }}>
              <View style={styles.distRow}>
                <Text style={styles.distName}>{d.n}</Text>
                <Text style={styles.distPct}>{Math.round(d.v * 100)}%</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${d.v * 100}%` }]} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: Spacing.lg, gap: Spacing.sm },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },

  // Donut
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  donut: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    flexDirection: 'column',
    position: 'relative',
  },
  donutSlice: { width: '100%' },
  donutCenter: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    top: 28,
    left: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  donutHrs: { fontSize: 14, fontWeight: FontWeight.bold },
  donutSub: { fontSize: 8, color: Colors.textSecondary },
  legend: { flex: 1, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendVal: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  // Bar chart
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 90 },
  barCol: { flex: 1, alignItems: 'center' },
  bar: { width: '100%', borderRadius: 3 },

  // Distractions
  distRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  distName: { fontSize: FontSize.sm },
  distPct: { fontSize: FontSize.sm, color: Colors.textSecondary },
  track: { height: 6, borderRadius: 999, backgroundColor: Colors.border, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999 },

  borderMid: { borderColor: Colors.borderMid },
});
