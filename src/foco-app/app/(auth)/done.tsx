// ─────────────────────────────────────────────
// Done Screen — 對應 ScreenDone
// ─────────────────────────────────────────────
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

const SPARKLES = ['✨', '★', '✦', '✧', '⭐'];

export default function DoneScreen() {
  const router = useRouter();
  const glow = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.8, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, [glow]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Animated.View style={{ transform: [{ scale: glow }] }}>
            <PetAvatar petKind="sprout" size={200} animated />
          </Animated.View>

          {/* Sparkles */}
          <View style={styles.sparkleContainer} pointerEvents="none">
            {SPARKLES.map((s, i) => (
              <Text
                key={i}
                style={[styles.sparkle, { top: `${20 + (i * 10) % 40}%` as any, left: `${10 + i * 18}%` as any }]}
              >
                {s}
              </Text>
            ))}
          </View>

          <View style={styles.textGroup}>
            <Text style={styles.title}>Hi there —</Text>
            <Text style={styles.title}>meet your buddy</Text>
            <Text style={styles.sub}>
              Your first focus session unlocks their first growth stage. Ready?
            </Text>
            <Text style={styles.hint}>✦ Tap your pet to interact</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace('/(app)/home')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Start my first session</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    position: 'relative',
  },
  sparkleContainer: {
    position: 'absolute',
    width: '100%',
    height: '60%',
  },
  sparkle: { position: 'absolute', fontSize: 20 },
  textGroup: { alignItems: 'center', gap: Spacing.xs, maxWidth: 280 },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: 34,
    textAlign: 'center',
  },
  sub: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: Spacing.sm },
  hint: { fontSize: FontSize.sm, color: Colors.textDisabled, fontWeight: FontWeight.medium, marginTop: Spacing.xs },
  footer: { gap: Spacing.sm },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
