import { DefaultTheme, type Theme } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors, fonts, typography } from '../theme';

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.brand,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.danger,
  },
  // The family carries the weight (see theme/typography.ts), so fontWeight stays normal.
  fonts: {
    regular: { fontFamily: fonts.regular, fontWeight: 'normal' },
    medium: { fontFamily: fonts.medium, fontWeight: 'normal' },
    bold: { fontFamily: fonts.semibold, fontWeight: 'normal' },
    heavy: { fontFamily: fonts.bold, fontWeight: 'normal' },
  },
};

export const stackScreenOptions: NativeStackNavigationOptions = {
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: { fontFamily: typography.title.fontFamily, fontSize: 17 },
  headerTitleAlign: 'center',
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right',
};
