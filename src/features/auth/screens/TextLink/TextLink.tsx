import React from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '../../../../components';
import { spacing } from '../../../../theme';
import { styles } from './TextLink.styles';

/** "Question? Action" row under auth forms. */
export function TextLink({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.row}>
      <AppText variant="bodySmall" color="textSecondary">
        {prompt}
      </AppText>
      <Pressable
        onPress={onPress}
        hitSlop={spacing.md}
        accessibilityRole="link"
        accessibilityLabel={action}
      >
        <AppText variant="label" color="textLink">
          {action}
        </AppText>
      </Pressable>
    </View>
  );
}
