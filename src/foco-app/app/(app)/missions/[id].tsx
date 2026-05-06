// ─────────────────────────────────────────────
// Mission Detail + Timer Screen — 對應 ScreenMission + ScreenTimer
// ─────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/layout/AppHeader';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { useUserStore } from '@/stores/userStore';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';

const POMODORO = 25 * 60; // 25 分鐘

type Phase = 'detail' | 'timer' | 'accomplished';

export default function MissionScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const { pet } = useUserStore();
  const petKind = pet?.type ?? 'sprout';

  const [phase, setPhase] = useState<Phase>('detail');
  const [paused, setPaused] = useState(false);
  const [secs, setSecs] = useState(POMODORO);
  const pct = (secs / POMODORO) * 100;

  useEffect(() => {
    if (phase !== 'timer' || paused) return;
    const id = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) { clearInterval(id); setPhase('accomplished'); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, paused]);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  // ── Detail Phase ─────────────────────────────
  if (phase === 'detail') {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title={title ?? 'Mission'} showBack action={
          <TouchableOpacity><Text style={{ fontSize: 20 }}>⋯</Text></TouchableOpacity>
        } />
        <View style={{ flex: 1, paddingHorizontal: Spacing.lg }}>
          {/* Progress Ring placeholder */}
          <View style={styles.detailCard}>
            <Text style={styles.detailTag}>STUDY · DEEP FOCUS</Text>
            <Text style={styles.detailTitle}>{title ?? 'Mission'}</Text>
            {/* Circular progress (SVG-like in RN using View) */}
            <View style={styles.ringWrap}>
              <View style={styles.ring}>
                <View style={styles.ringInner}>
                  <Text style={styles.ringPct}>64%</Text>
                  <Text style={styles.ringMeta}>2h 15m / 3h 30m</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCard}>
              <Text style={styles.metaKey}>SESSIONS</Text>
              <Text style={styles.metaVal}>5</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaKey}>DISTRACTIONS</Text>
              <Text style={styles.metaVal}>3</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setPhase('timer')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>▶  Start timer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Timer Phase ──────────────────────────────
  if (phase === 'timer') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: Colors.white }]}>
        <AppHeader title="Focus" showBack />
        <View style={styles.timerArea}>
          <View style={styles.timerRing}>
            {/* Simplified ring indicator */}
            <View style={[styles.timerArc, { opacity: pct / 100 }]} />
            <View style={styles.timerPetWrap}>
              <PetAvatar petKind={petKind} size={160} animated />
            </View>
          </View>
          <Text style={styles.timerDigits}>{mm}:{ss}</Text>
          <Text style={styles.timerSub}>Pomodoro · stay with your pet</Text>
        </View>

        <View style={styles.timerActions}>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => router.back()}>
            <Text style={styles.ghostBtnText}>Give up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setPaused((p) => !p)}>
            <Text style={styles.primaryBtnText}>{paused ? 'Resume' : 'Pause'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => setPhase('accomplished')}>
            <Text style={styles.ghostBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Accomplished Phase ───────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Session complete" showBack />
      <View style={{ flex: 1, padding: Spacing.lg, alignItems: 'center' }}>
        <Text style={styles.acclTag}>MISSION ACCOMPLISHED</Text>
        <Text style={styles.acclXP}>+320 XP earned</Text>
        <Text style={styles.acclSub}>Your pet feels stronger.</Text>
        <View style={styles.acclPet}>
          <PetAvatar petKind={petKind} size={160} animated />
        </View>
        <View style={styles.metaGrid}>
          <View style={styles.metaCard}>
            <Text style={styles.metaKey}>FOCUS TIME</Text>
            <Text style={styles.metaVal}>25:00</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaKey}>DISTRACTIONS</Text>
            <Text style={styles.metaVal}>1</Text>
          </View>
        </View>
        {/* Rewards */}
        <View style={styles.rewardsCard}>
          <Text style={styles.rewardsTitle}>🎁 Rewards</Text>
          <View style={styles.rewardsList}>
            {[{ n: 'Sun shard', e: '☀️' }, { n: 'Mist drop', e: '💧' }, { n: 'Lucky leaf', e: '🍀' }].map((r) => (
              <View key={r.n} style={styles.rewardItem}>
                <Text style={{ fontSize: 26 }}>{r.e}</Text>
                <Text style={styles.rewardName}>{r.n}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={[styles.timerActions, { paddingBottom: Spacing.lg }]}>
        <TouchableOpacity style={styles.ghostBtn} onPress={() => router.push('/(app)/backpack')}>
          <Text style={styles.ghostBtnText}>🎒 Backpack</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(app)/home')}>
          <Text style={styles.primaryBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },

  // Detail
  detailCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  detailTag: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold, letterSpacing: 0.4 },
  detailTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginTop: 4, marginBottom: Spacing.md, textAlign: 'center' },
  ringWrap: { alignItems: 'center', justifyContent: 'center', width: 180, height: 180 },
  ring: { width: 160, height: 160, borderRadius: 80, borderWidth: 14, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  ringInner: { alignItems: 'center' },
  ringPct: { fontSize: 32, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  ringMeta: { fontSize: FontSize.xs, color: Colors.textSecondary },
  metaGrid: { flexDirection: 'row', gap: Spacing.sm },
  metaCard: { flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md },
  metaKey: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  metaVal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginTop: 2, color: Colors.textPrimary },

  // Timer
  timerArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  timerRing: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
  timerArc: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    borderWidth: 6, borderColor: Colors.primary,
  },
  timerPetWrap: { position: 'absolute' },
  timerDigits: { fontSize: 56, fontWeight: FontWeight.bold, letterSpacing: -2, color: Colors.textPrimary },
  timerSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  timerActions: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  primaryBtn: {
    flex: 2,
    height: 52,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  ghostBtn: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },

  // Accomplished
  acclTag: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium, letterSpacing: 0.4, marginTop: Spacing.sm },
  acclXP: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginTop: Spacing.xs },
  acclSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  acclPet: { height: 180, alignItems: 'center', justifyContent: 'center' },
  rewardsCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  rewardsTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  rewardsList: { flexDirection: 'row', gap: Spacing.sm },
  rewardItem: { flex: 1, backgroundColor: Colors.surfaceMuted, borderRadius: Radius.lg, padding: Spacing.sm, alignItems: 'center', gap: 4 },
  rewardName: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textAlign: 'center' },
});
