import { StyleSheet } from 'react-native';

import { radius, spacing } from '../../theme';

export const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md + spacing.xxs,
    borderRadius: radius.md,
    alignItems: 'flex-start',
  },
  text: { flex: 1, gap: spacing.xxs },
});
