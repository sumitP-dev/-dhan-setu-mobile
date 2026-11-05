import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import {
  MaterialDesignIcons,
  type MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons/static';

import { colors, sizes } from '../../theme';

/** Any Material Design Icons name. Browse them at https://pictogrammers.com/library/mdi/ */
export type IconName = MaterialDesignIconsIconName;

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  testID?: string;
};

/**
 * Every icon in the app goes through this. Icons are decorative, so screen readers
 * skip them; put the label on the button or row around the icon instead.
 */
export function Icon({
  name,
  size = sizes.iconMd,
  color = colors.textPrimary,
  style,
  testID,
}: IconProps) {
  return (
    <MaterialDesignIcons
      name={name}
      size={size}
      color={color}
      style={style}
      allowFontScaling={false}
      accessible={false}
      importantForAccessibility="no"
      testID={testID}
    />
  );
}
