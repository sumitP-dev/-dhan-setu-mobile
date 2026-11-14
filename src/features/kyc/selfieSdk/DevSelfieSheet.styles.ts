import { StyleSheet } from 'react-native';

import { colors, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warningSoft,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  choices: { gap: spacing.sm, marginTop: spacing.md },
});
