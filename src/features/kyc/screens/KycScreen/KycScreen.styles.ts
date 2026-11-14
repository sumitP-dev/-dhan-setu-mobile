import { StyleSheet } from 'react-native';

import { colors, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  status: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  statusText: { flex: 1, gap: spacing.xs },
  sectionTitle: { marginTop: spacing.xxl, marginBottom: spacing.md },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  stepDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  stepText: { flex: 1, gap: spacing.xxs },
  detailsRow: { marginTop: spacing.md },
  privacy: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  privacyText: { flex: 1 },
});
