import React from 'react';
import { View } from 'react-native';
import { styles } from './Divider.styles';

export function Divider({ inset = 0 }: { inset?: number }) {
  return <View style={[styles.divider, { marginLeft: inset }]} />;
}
