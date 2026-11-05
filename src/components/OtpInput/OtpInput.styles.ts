import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '../../theme';

export const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  boxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  box: {
    flex: 1,
    aspectRatio: 0.86,
    maxWidth: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { borderColor: colors.borderStrong },
  boxActive: { borderColor: colors.borderFocus, borderWidth: 1.5 },
  boxError: { borderColor: colors.danger },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
