import React from 'react';
import { View } from 'react-native';

import { styles } from './PageDots.styles';

export type PageDotsProps = {
  count: number;
  index: number;
  testID?: string;
};

export function PageDots({ count, index, testID }: PageDotsProps) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Page ${index + 1} of ${count}`}
      testID={testID}
    >
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.dot, i === index && styles.active]} />
      ))}
    </View>
  );
}
