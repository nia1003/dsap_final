// ─────────────────────────────────────────────
// Home Screen — 對應 ScreenHome
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabBar } from '@/components/layout/TabBar';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { useUserStore } from '@/stores/userStore';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, pet, stats } = useUserStore();

  const nickname = profile?.username ?? 'Mochi';
  const initial = nickname[0].toUpperCase();
  const xp = stats?.experience ?? 68;
  const level = stats?.level ?? 4;
  const nextLevelExp = stats?.nextLevelExp ?? 100;
  const xpPct = Math.min(100, (xp / nextLevelExp) * 100);
  const petKind = pet?.type ?? 'sprout';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.userPill}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.username}>{nickname}</Text>
          <Text style={styles.level}>Lv. {level}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={{ fontSize: 18 }}>🏆</Text>
        </TouchableOpacity>
      </View>

      {/* XP Bar */}
      <View style={styles.xpRow}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpLabel}>Level · XP</Text>
          <Text style={styles.xpLabel}>{xp}/{nextLevelExp}</Text>
        </View>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${xpPct}%` }]} />
        </View>
      </View>

      {/* Pet */}
      <View style={styles.petArea}>
        <PetAvatar petKind={petKind} size={240} animated />
      </View>

      {/* Action Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.push('/(app)/stats')}>
          <Text style={{ fontSize: 20 }}>📈</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(app)/missions')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Start focus</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.push('/(app)/farm')}>
          <Text style={{ fontSize: 20 }}>🌱</Text>
        </TouchableOpacity>
      </View>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  userPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  username: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  level: { fontSize: FontSize.sm, color: Colors.textSecondary },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderMid,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpRow: { paddingHorizontal: Spacing.lg, marginTop: Spacing.sm },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  xpTrack: { height: 6, borderRadius: 999, backgroundColor: Colors.border, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999 },
  petArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  circleBtn: {
    width: 52,
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderMid,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
