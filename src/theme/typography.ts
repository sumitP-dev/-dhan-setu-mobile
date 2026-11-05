import type { TextStyle } from 'react-native';

/**
 * Inter, bundled in android/app/src/main/assets/fonts and ios/DhanSetu/Fonts (listed in
 * Info.plist UIAppFonts). Each weight is a separate font family (the font's PostScript
 * name, which iOS needs), so always pick the family instead of setting fontWeight.
 */
export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
} as const;

type Variant = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing'
>;

const variant = (
  fontFamily: string,
  fontSize: number,
  lineHeight: number,
  letterSpacing = 0,
): Variant => ({ fontFamily, fontSize, lineHeight, letterSpacing });

/** The only text styles in the app. Use through <AppText variant="...">. */
export const typography = {
  display: variant(fonts.bold, 32, 40, -0.6),
  h1: variant(fonts.bold, 26, 34, -0.4),
  h2: variant(fonts.semibold, 22, 30, -0.3),
  h3: variant(fonts.semibold, 18, 26, -0.2),
  title: variant(fonts.semibold, 16, 24),
  body: variant(fonts.regular, 15, 22),
  bodyMedium: variant(fonts.medium, 15, 22),
  bodySmall: variant(fonts.regular, 13, 18),
  label: variant(fonts.medium, 13, 18, 0.1),
  caption: variant(fonts.regular, 12, 16),
  overline: variant(fonts.semibold, 11, 16, 0.8),
  button: variant(fonts.semibold, 15, 20, 0.2),
  // Money: tabular figures so digits line up in lists.
  amount: variant(fonts.bold, 28, 36, -0.5),
} as const;

export type TypographyVariant = keyof typeof typography;
