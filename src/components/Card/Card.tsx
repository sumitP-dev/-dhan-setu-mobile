import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '../../theme';
import { styles } from './Card.styles';

export type CardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
};

/** White rounded surface. Pressable when onPress is given. */
export function Card({
  children,
  onPress,
  padded = true,
  style,
  accessibilityLabel,
  testID,
}: CardProps) {
  const cardStyle = [styles.card, padded ? styles.padded : null, style];

  if (!onPress) {
    return (
      <View style={cardStyle} testID={testID}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: colors.ripple }}
      style={({ pressed }) => [cardStyle, pressed ? styles.pressed : null]}
      testID={testID}
    >
      {children}
    </Pressable>
  );
}
