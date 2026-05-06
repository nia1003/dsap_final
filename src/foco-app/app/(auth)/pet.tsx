// ─────────────────────────────────────────────
// Pet Screen — 對應 ScreenPet
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingHeader } from '@/components/layout/OnboardingHeader';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/constants/theme';

const PETS = [
  { kind: 'cat',     name: 'Cat',     vibe: 'Calm & graceful',  emoji: '🐱' },
  { kind: 'bunny',   name: 'Bunny',   vibe: 'Curious & dreamy', emoji: '🐰' },
  { kind: 'hamster', name: 'Hamster', vibe: 'Playful & warm',   emoji: '🐹' },
  { kind: 'fox',     name: 'Fox',     vibe: 'Bold & clever',    emoji: '🦊' },
] as const;

export default function PetScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>('');

  const selectedPet = PETS.find((p) => p.kind === selected);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.scrollArea}>
          <OnboardingHeader step={3} />
          <Text style={styles.title}>Pick your starter pet</Text>
          <Text style={styles.sub}>You can grow more later. Choose the vibe that suits you today.</Text>

          <View style={styles.grid}>
            {PETS.map((p) => (
              <TouchableOpacity
                key={p.kind}
                style={[styles.card, selected === p.kind && styles.cardSelected]}
                onPress={() => setSelected(p.kind)}
                activeOpacity={0.8}
              >
                <View style={styles.cardPet}>
                  <PetAvatar petKind={p.kind} size={80} animated={false} />
                </View>
                <Text style={styles.petName}>{p.name}</Text>
                <Text style={styles.petVibe}>{p.vibe}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryBtn, !selected && styles.disabled]}
            disabled={!selected}
            onPress={() => router.push('/(auth)/consent')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {selectedPet ? `Hatch ${selectedPet.name}` : 'Choose one'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.lg },
  scrollArea: { flex: 1, paddingTop: Spacing.xl },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  sub: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  card: {
    width: '48%',
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceMuted,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    ...Shadow.md,
  },
  cardPet: { height: 100, alignItems: 'center', justifyContent: 'center' },
  petName: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginTop: Spacing.xs },
  petVibe: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  footer: { paddingBottom: Spacing.lg, paddingTop: Spacing.md },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  disabled: { opacity: 0.4 },
});
