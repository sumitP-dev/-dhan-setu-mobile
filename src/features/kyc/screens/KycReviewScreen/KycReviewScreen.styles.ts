import { StyleSheet } from 'react-native';

import { colors, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  lead: { marginTop: spacing.xs },
  banner: { marginTop: spacing.xl },
  card: { marginTop: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowText: { flex: 1, gap: spacing.xxs },
  confirm: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  confirmText: { flex: 1 },
});
