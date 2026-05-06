// ─────────────────────────────────────────────
// Farm Screen — 對應 ScreenFarm
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabBar } from '@/components/layout/TabBar';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { useUserStore } from '@/stores/userStore';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DATA  = [3, 5, 2, 6, 4, 7, 5];
const MAX   = Math.max(...DATA);

const STATS = [
  { k: 'Focus class', v: 'Sprite' },
  { k: 'Streak',      v: '12 days' },
  { k: 'Total focus', v: '34h 20m' },
  { k: 'Hatched',     v: 'Mar 14' },
];

export default function FarmScreen() {
  const router = useRouter();
  const { profile, pet } = useUserStore();
  const nickname = profile?.username ?? 'Mochi';
  const petKind  = pet?.type ?? 'sprout';

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        title="Farm"
        showBack
        action={
          <TouchableOpacity onPress={() => router.push('/(app)/backpack')}>
            <Text style={{ fontSize: 20 }}>🎒</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Pet Name & Level */}
        <View style={styles.nameRow}>
          <Text style={styles.petName}>{nickname}</Text>
          <Text style={styles.petSub}>Lv. 4 · Calm Sprite</Text>
        </View>

        {/* XP Bar */}
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: '78%' }]} />
        </View>

        {/* Pet Card */}
        <View style={styles.petCard}>
          <PetAvatar petKind={petKind} size={180} animated />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View key={s.k} style={styles.statCard}>
              <Text style={styles.statKey}>{s.k.toUpperCase()}</Text>
              <Text style={styles.statVal}>{s.v}</Text>
            </View>
          ))}
        </View>

        {/* Focus Bar Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Focus time · last 7 days</Text>
          <View style={styles.bars}>
            {DATA.map((h, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.bar, { height: (h / MAX) * 70 }]} />
                <Text style={styles.barLabel}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  nameRow: { alignItems: 'center', paddingVertical: Spacing.sm },
  petName: { fontSize: 22, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  petSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  xpTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  xpFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999 },
  petCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.md,
  },
  statKey: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  statVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: 2 },
  chartCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  chartTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, height: 90 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  bar: { width: '100%', borderRadius: 4, backgroundColor: Colors.primary },
  barLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
