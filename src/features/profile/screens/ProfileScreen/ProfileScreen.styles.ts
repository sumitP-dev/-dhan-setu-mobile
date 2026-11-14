import { StyleSheet } from 'react-native';

import { spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  identity: {
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  identityText: { gap: spacing.xs },
  section: { marginTop: spacing.xl },
  logout: { marginTop: spacing.xl },
});
