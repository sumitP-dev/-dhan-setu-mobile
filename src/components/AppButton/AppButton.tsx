import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, sizes, spacing, type ColorName } from '../../theme';
import { AppText } from '../AppText';
import { Icon, type IconName } from '../Icon';
import { styles } from './AppButton.styles';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type AppButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  style?: StyleProp<ViewStyle>;
};

type VariantStyle = {
  background: string;
  pressed: string;
  border: string;
  text: ColorName;
};

const VARIANTS: Record<ButtonVariant, VariantStyle> = {
  primary: {
    background: colors.brandStrong,
    pressed: colors.brandPressed,
    border: colors.brandStrong,
    text: 'textInverse',
  },
  secondary: {
    background: colors.brandSoft,
    pressed: colors.brandMuted,
    border: colors.brandSoft,
    text: 'brandStrong',
  },
  outline: {
    background: colors.surface,
    pressed: colors.surfaceMuted,
    border: colors.borderStrong,
    text: 'textPrimary',
  },
  ghost: {
    background: colors.transparent,
    pressed: colors.surfaceMuted,
    border: colors.transparent,
    text: 'brandStrong',
  },
  danger: {
    background: colors.danger,
    pressed: colors.dangerPressed,
    border: colors.danger,
    text: 'textInverse',
  },
};

const HEIGHTS: Record<ButtonSize, number> = {
  sm: sizes.buttonSm,
  md: sizes.buttonMd,
  lg: sizes.buttonLg,
};

export function AppButton({
  title,
  variant = 'primary',
  size = 'lg',
  loading = false,
  fullWidth = true,
  disabled,
  leftIcon,
  rightIcon,
  style,
  ...rest
}: AppButtonProps) {
  const v = VARIANTS[variant];
  const isDisabled = Boolean(disabled || loading);
  const textColor: ColorName =
    isDisabled && variant !== 'ghost' ? 'disabledText' : v.text;
  const iconColor = colors[textColor];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      android_ripple={{
        color:
          variant === 'primary' || variant === 'danger'
            ? colors.rippleInverse
            : colors.ripple,
      }}
      style={({ pressed }) => [
        styles.base,
        {
          height: HEIGHTS[size],
          backgroundColor:
            isDisabled && variant !== 'ghost'
              ? colors.disabled
              : pressed
              ? v.pressed
              : v.background,
          borderColor:
            isDisabled && variant !== 'ghost' ? colors.disabled : v.border,
          paddingHorizontal: size === 'sm' ? spacing.md : spacing.xl,
        },
        fullWidth ? styles.fullWidth : styles.auto,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} testID="button-loading" />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <Icon name={leftIcon} color={iconColor} /> : null}
          <AppText variant="button" color={textColor} numberOfLines={1}>
            {title}
          </AppText>
          {rightIcon ? <Icon name={rightIcon} color={iconColor} /> : null}
        </View>
      )}
    </Pressable>
  );
}
