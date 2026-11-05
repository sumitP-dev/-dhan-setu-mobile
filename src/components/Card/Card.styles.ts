import { StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing } from '../../theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  padded: { padding: spacing.lg },
  pressed: { opacity: 0.92 },
});
