// ─────────────────────────────────────────────
// Welcome Screen — 對應 ScreenWelcome
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <PetAvatar petKind="sprout" size={220} />
          <View style={styles.textGroup}>
            <Text style={styles.brand}>FOCO</Text>
            <Text style={styles.tagline}>Focus together, grow together</Text>
            <Text style={styles.sub}>
              Hatch a tiny companion that grows when you focus.{'\n'}
              Get distracted, and so do they.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Get started</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ghostBtn} activeOpacity={0.7}>
            <Text style={styles.ghostBtnIcon}>🍎</Text>
            <Text style={styles.ghostBtnText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ghostBtn} activeOpacity={0.7}>
            <Text style={styles.ghostBtnIcon}>G</Text>
            <Text style={styles.ghostBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  textGroup: { alignItems: 'center', gap: Spacing.sm, maxWidth: 300 },
  brand: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.semibold,
    letterSpacing: -1.6,
    color: Colors.primary,
  },
  tagline: {
    fontSize: 22,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  sub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: { gap: Spacing.sm },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderMid,
    backgroundColor: Colors.white,
  },
  ghostBtnIcon: { fontSize: 18, fontWeight: FontWeight.bold },
  ghostBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
});
