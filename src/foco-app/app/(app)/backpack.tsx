// ─────────────────────────────────────────────
// Backpack Screen — 對應 ScreenBackpack
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/layout/AppHeader';
import { useGameStore } from '@/stores/gameStore';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '@/constants/theme';

const SAMPLE_ITEMS = [
  { id: '1', e: '☀️', name: 'Sun shard',    quantity: 12 },
  { id: '2', e: '💧', name: 'Mist drop',    quantity: 8  },
  { id: '3', e: '🍀', name: 'Lucky leaf',   quantity: 5  },
  { id: '4', e: '🌸', name: 'Bloom petal',  quantity: 3  },
  { id: '5', e: '⭐', name: 'Stardust',     quantity: 22 },
  { id: '6', e: '🔥', name: 'Ember',        quantity: 4  },
  { id: '7', e: '🪶', name: 'Soft feather', quantity: 2  },
  { id: '8', e: '🎁', name: 'Mystery box',  quantity: 1  },
];

export default function BackpackScreen() {
  const { backpackItems } = useGameStore();
  const items = backpackItems.length > 0 ? backpackItems : SAMPLE_ITEMS as any;
  const totalQty = items.reduce((s: number, i: any) => s + (i.quantity ?? 0), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Backpack" showBack />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerLabel}>TOTAL ITEMS</Text>
          <Text style={styles.bannerCount}>{totalQty} collected</Text>
          <Text style={styles.bannerSub}>Feed your pet rewards to unlock new evolutions</Text>
        </View>

        {/* Item Grid */}
        <View style={styles.grid}>
          {items.map((it: any) => (
            <View key={it.id} style={styles.itemCard}>
              <View style={styles.itemIcon}>
                <Text style={{ fontSize: 22 }}>{it.e ?? '📦'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {it.name}
                </Text>
                <Text style={styles.itemQty}>×{it.quantity}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  banner: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.md,
  },
  bannerLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.4,
  },
  bannerCount: { fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white, marginTop: 4 },
  bannerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  itemCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  itemQty: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
