// ─────────────────────────────────────────────
// Consent Screen — 對應 ScreenConsent
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingHeader } from '@/components/layout/OnboardingHeader';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface ToggleRowProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  sub?: string;
}

function ToggleRow({ checked, onToggle, label, sub }: ToggleRowProps) {
  return (
    <>
      <TouchableOpacity style={styles.checkRow} onPress={onToggle} activeOpacity={0.7}>
        <View style={[styles.checkBox, checked && styles.checkBoxChecked]}>
          {checked && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.checkLabel}>{label}</Text>
          {sub && <Text style={styles.checkSub}>{sub}</Text>}
        </View>
      </TouchableOpacity>
      <View style={styles.divider} />
    </>
  );
}

export default function ConsentScreen() {
  const router = useRouter();
  const [tos, setTos] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [notifs, setNotifs] = useState(true);

  const valid = tos && privacy;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <OnboardingHeader step={4} />
          <Text style={styles.title}>A few quick things</Text>
          <Text style={styles.sub}>We keep your data minimal and yours.</Text>

          <View style={styles.toggleList}>
            <ToggleRow
              checked={tos}
              onToggle={() => setTos((v) => !v)}
              label="I agree to the Terms of Service"
            />
            <ToggleRow
              checked={privacy}
              onToggle={() => setPrivacy((v) => !v)}
              label="I agree to the Privacy Policy"
              sub="Required"
            />
            <ToggleRow
              checked={marketing}
              onToggle={() => setMarketing((v) => !v)}
              label="Send me weekly focus tips"
              sub="Optional"
            />
            <ToggleRow
              checked={notifs}
              onToggle={() => setNotifs((v) => !v)}
              label="Allow gentle focus reminders"
              sub="Optional"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, !valid && styles.disabled]}
          disabled={!valid}
          onPress={() => router.push('/(auth)/done')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Create my account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  sub: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 22 },
  toggleList: { borderTopWidth: 1, borderTopColor: Colors.border },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderMid,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkMark: { color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold },
  checkLabel: { fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 22 },
  checkSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 1 },
  divider: { height: 1, backgroundColor: Colors.border },
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
