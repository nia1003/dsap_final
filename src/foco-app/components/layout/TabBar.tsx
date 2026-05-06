// ─────────────────────────────────────────────
// TabBar — 底部 Tab 導航（Stats / Home / Farm）
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

const TABS = [
  { id: 'stats',   icon: '📊', label: 'Stats',  href: '/(app)/stats'  },
  { id: 'home',    icon: '🏠', label: 'Home',   href: '/(app)/home'   },
  { id: 'farm',    icon: '🌱', label: 'Farm',   href: '/(app)/farm'   },
] as const;

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const active = pathname.includes(tab.id);
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => router.push(tab.href as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingBottom: 22,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    opacity: 1,
  },
  icon: { fontSize: 22 },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.textPrimary,
  },
});
