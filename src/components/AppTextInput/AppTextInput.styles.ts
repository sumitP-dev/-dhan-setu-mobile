import { StyleSheet } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  container: { gap: spacing.xs + spacing.xxs },
  field: {
    minHeight: sizes.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + spacing.xxs,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  fieldFocused: { borderWidth: 1.5 },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
    includeFontPadding: false,
  },
});
