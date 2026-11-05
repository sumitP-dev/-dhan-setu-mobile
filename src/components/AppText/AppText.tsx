import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import {
  colors,
  typography,
  type ColorName,
  type TypographyVariant,
} from '../../theme';
import { styles } from './AppText.styles';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorName;
  align?: TextStyle['textAlign'];
};

/** All text in the app goes through this, so fonts and sizes stay consistent. */
export function AppText({
  variant = 'body',
  color = 'textPrimary',
  align,
  style,
  maxFontSizeMultiplier = 1.4,
  ...rest
}: AppTextProps) {
  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        styles.base,
        typography[variant],
        { color: colors[color] },
        align ? { textAlign: align } : null,
        variant === 'amount' ? styles.tabular : null,
        style,
      ]}
      {...rest}
    />
  );
}
