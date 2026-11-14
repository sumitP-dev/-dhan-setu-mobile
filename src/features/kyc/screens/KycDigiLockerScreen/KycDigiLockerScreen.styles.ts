import { StyleSheet } from 'react-native';

import { spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl },
  messages: { gap: spacing.md, marginTop: spacing.xl },
  list: { gap: spacing.lg, marginTop: spacing.xxl },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemText: { flex: 1, gap: spacing.xxs },
  privacy: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  privacyText: { flex: 1 },
  footer: { gap: spacing.sm },
});
