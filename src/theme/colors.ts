/**
 * Colour palette. Screens and components use the semantic `colors` tokens below,
 * never raw hex values, so the whole app can be re-themed from this file.
 *
 * Contrast (WCAG AA needs 4.5:1 for normal text, 3:1 for icons and large shapes):
 * - brandStrong navy #002E6E is for button fills, headings on blue (13:1 with white).
 * - brand #0093D0 is for icons and highlights (3.5:1 on white).
 * - textLink #0072BC is for link text (5.1:1 on white).
 * - sky #00BAF2 is decorative only (large shapes, backgrounds). Never use it for text.
 */
const palette = {
  navy900: '#002E6E',
  navy950: '#001F4D',
  sky50: '#E6F7FD',
  sky100: '#B3E8FB',
  sky400: '#00BAF2',
  sky600: '#0093D0',
  blue700: '#0072BC',
  blue800: '#005A96',
  blue50: '#E6F1FA',

  emerald50: '#ECFDF5',
  emerald700: '#047857',

  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate900: '#0F172A',

  red50: '#FEF2F2',
  red600: '#DC2626',
  red700: '#B91C1C',
  amber50: '#FFFBEB',
  amber700: '#B45309',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const colors = {
  brand: palette.sky600,
  brandStrong: palette.navy900,
  brandPressed: palette.navy950,
  brandSoft: palette.sky50,
  brandMuted: palette.sky100,
  sky: palette.sky400,
  accent: palette.blue700,
  accentStrong: palette.blue800,
  accentSoft: palette.blue50,

  background: '#F5F8FC',
  surface: palette.white,
  surfaceMuted: palette.slate100,
  overlay: 'rgba(15, 23, 42, 0.5)',

  textPrimary: palette.slate900,
  textSecondary: palette.slate600,
  textMuted: palette.slate500,
  textPlaceholder: palette.slate400,
  textInverse: palette.white,
  textLink: palette.blue700,

  border: palette.slate200,
  borderStrong: palette.slate300,
  borderFocus: palette.sky600,

  // Status (text colour + soft background for banners and badges)
  success: palette.emerald700,
  successSoft: palette.emerald50,
  warning: palette.amber700,
  warningSoft: palette.amber50,
  danger: palette.red600,
  dangerPressed: palette.red700,
  dangerSoft: palette.red50,
  info: palette.blue700,
  infoSoft: palette.blue50,

  disabled: palette.slate200,
  disabledText: palette.slate400,
  ripple: 'rgba(15, 23, 42, 0.08)',
  rippleInverse: 'rgba(255, 255, 255, 0.24)',

  white: palette.white,
  black: palette.black,
  transparent: 'transparent',
} as const;

export type ColorName = keyof typeof colors;
