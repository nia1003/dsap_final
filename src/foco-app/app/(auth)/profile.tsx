// ─────────────────────────────────────────────
// Profile Screen — 對應 ScreenProfile
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingHeader } from '@/components/layout/OnboardingHeader';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';

const ROLES = ['Student', 'Working pro', 'Creator', 'Other'];
const DISTRACTIONS = ['Phone', 'Social media', 'Wandering thoughts', 'Other people', 'Tiredness'];

export default function ProfileScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState('');
  const [pains, setPains] = useState<string[]>([]);

  const valid = nickname.trim().length >= 2 && role !== '';

  const togglePain = (d: string) => {
    setPains((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <OnboardingHeader step={2} />

          <Text style={styles.title}>Tell us about you</Text>
          <Text style={styles.sub}>Your pet will use your nickname.</Text>

          {/* Nickname */}
          <Text style={styles.label}>Nickname</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mochi"
            placeholderTextColor={Colors.textDisabled}
            value={nickname}
            onChangeText={setNickname}
          />

          {/* Role */}
          <Text style={[styles.label, { marginTop: Spacing.lg }]}>I'm mostly a…</Text>
          <View style={styles.chips}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, role === r && styles.chipSelected]}
                onPress={() => setRole(r)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, role === r && styles.chipTextSelected]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Distractions */}
          <Text style={[styles.label, { marginTop: Spacing.lg }]}>
            Biggest distraction <Text style={{ color: Colors.textDisabled }}>(optional)</Text>
          </Text>
          <View style={styles.chips}>
            {DISTRACTIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, pains.includes(d) && styles.chipSelected]}
                onPress={() => togglePain(d)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, pains.includes(d) && styles.chipTextSelected]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryBtn, !valid && styles.disabled]}
            disabled={!valid}
            onPress={() => router.push('/(auth)/pet')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { padding: Spacing.lg, paddingTop: Spacing.xl, flexGrow: 1 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  sub: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 22 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    paddingLeft: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.borderMid,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderMid,
    backgroundColor: Colors.white,
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  chipTextSelected: { color: Colors.white },
  footer: { padding: Spacing.lg, paddingTop: 0 },
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
