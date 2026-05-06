// ─────────────────────────────────────────────
// Mission List Screen — 對應 ScreenMissions
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/layout/AppHeader';
import { TabBar } from '@/components/layout/TabBar';
import { useGameStore } from '@/stores/gameStore';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';

// Fallback sample missions（API 未載入前）
const SAMPLE_MISSIONS = [
  { id: '1', title: 'Finish thesis chapter 3', tag: 'Study',   focus: '2h 15m', xp: 320 },
  { id: '2', title: 'Read "Deep Work" Ch.5',   tag: 'Reading', focus: '0h 45m', xp: 80  },
  { id: '3', title: 'Refactor checkout flow',  tag: 'Work',    focus: '4h 10m', xp: 540 },
  { id: '4', title: 'Practice piano scales',   tag: 'Hobby',   focus: '0h 20m', xp: 40  },
];

export default function MissionsScreen() {
  const router = useRouter();
  const { missions } = useGameStore();
  const [search, setSearch] = React.useState('');

  const list = missions.length > 0 ? missions : SAMPLE_MISSIONS as any;
  const filtered = search
    ? list.filter((m: any) => m.title.toLowerCase().includes(search.toLowerCase()))
    : list;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        title="Missions"
        showBack
        action={
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={{ fontSize: 16, marginRight: Spacing.xs }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search missions…"
          placeholderTextColor={Colors.textDisabled}
          value={search}
          onChangeText={setSearch}
        />
        <Text style={styles.sortBtn}>Sort ▾</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map((m: any) => (
          <TouchableOpacity
            key={m.id}
            style={styles.card}
            onPress={() => router.push({ pathname: '/(app)/missions/[id]', params: { id: m.id, title: m.title } })}
            activeOpacity={0.7}
          >
            <View style={styles.cardIcon}>
              <Text style={{ fontSize: 16 }}>📌</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={1}>{m.title}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.metaText}>{m.tag ?? 'Mission'}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>{m.focus ?? `${m.durationSeconds ?? 0}s`}</Text>
              </View>
            </View>
            <Text style={styles.xpBadge}>+{m.xp ?? m.reward?.experience ?? 0} XP</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    marginTop: Spacing.xs,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  sortBtn: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  cardMeta: { flexDirection: 'row', gap: Spacing.sm, marginTop: 2 },
  metaText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  metaDot: { fontSize: FontSize.sm, color: Colors.textSecondary },
  xpBadge: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.primaryMid },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: Colors.white, fontSize: 20, lineHeight: 24 },
});
