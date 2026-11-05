import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  greeting: { flex: 1, gap: spacing.xxs },
  hero: {
    backgroundColor: colors.brandStrong,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: { marginTop: spacing.xxxl, marginBottom: spacing.md },
  grid: { gap: spacing.md },
  gridRow: { flexDirection: 'row', gap: spacing.md },
  recent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  recentText: { flex: 1, gap: spacing.xxs },
});
