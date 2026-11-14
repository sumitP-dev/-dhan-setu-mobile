import { StyleSheet } from 'react-native';

import { spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.xxxl,
  },
  sectionTitle: { marginTop: spacing.xxxl, marginBottom: spacing.md },
  list: { gap: spacing.lg },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemText: { flex: 1, gap: spacing.xxs },
  privacy: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xxxl,
  },
  privacyText: { flex: 1 },
  footer: { gap: spacing.sm },
});
