import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '../../theme';
import { styles } from './LoadingView.styles';

export function LoadingView({ testID = 'loading-view' }: { testID?: string }) {
  return (
    <View style={styles.container} testID={testID}>
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );
}
