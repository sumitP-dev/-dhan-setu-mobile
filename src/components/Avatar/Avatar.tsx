import React from 'react';
import { View } from 'react-native';

import { AppText } from '../AppText';
import { styles } from './Avatar.styles';

export type AvatarProps = { name: string; size?: number };

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = 44 }: AvatarProps) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      accessibilityLabel={name}
    >
      <AppText variant={size >= 56 ? 'h3' : 'title'} color="brandStrong">
        {initialsOf(name)}
      </AppText>
    </View>
  );
}
