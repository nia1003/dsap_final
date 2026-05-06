// ─────────────────────────────────────────────
// Design Token — 對應 FOCO Aura Farming 原始設計稿
// ─────────────────────────────────────────────

export const Colors = {
  // Brand (黑色極簡風格)
  primary: '#0D0D0D',
  primaryMid: '#525252',
  primaryLight: '#A3A3A3',
  primaryPale: '#D4D4D4',

  // Surfaces
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceMuted: '#FAFAFA',

  // Borders
  border: '#F0F0F0',
  borderMid: '#E5E5E5',

  // Text
  textPrimary: '#18181B',
  textSecondary: '#737373',
  textDisabled: '#A3A3A3',
  textOnPrimary: '#FFFFFF',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 16,
  full: 9999,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 19,
  xxl: 26,
  display: 40,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};
