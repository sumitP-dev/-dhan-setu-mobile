import React from 'react';
import { View } from 'react-native';

import { AppText } from '../../../../components';
import { styles } from './AuthHeader.styles';

export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <AppText variant="h1" accessibilityRole="header">
        {title}
      </AppText>
      <AppText variant="body" color="textSecondary">
        {subtitle}
      </AppText>
    </View>
  );
}
