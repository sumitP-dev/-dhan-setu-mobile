import { StyleSheet } from 'react-native';

import { spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  body: { gap: spacing.xxl },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
