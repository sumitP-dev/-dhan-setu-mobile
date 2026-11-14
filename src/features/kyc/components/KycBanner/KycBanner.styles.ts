import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    marginTop: spacing.xxl,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  text: { flex: 1, gap: spacing.xs },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
