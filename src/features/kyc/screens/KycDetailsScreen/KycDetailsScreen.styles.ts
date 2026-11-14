import { StyleSheet } from 'react-native';

import { colors, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  lead: { marginTop: spacing.xs },
  banner: { marginTop: spacing.xl },
  card: { marginTop: spacing.xl },
  row: {
    gap: spacing.xxs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  note: { marginTop: spacing.xl, marginBottom: spacing.sm },
});
