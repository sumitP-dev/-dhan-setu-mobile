import React, { useState } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, spacing } from '../../theme';
import { AppText } from '../AppText';
import { ErrorText } from '../ErrorText';
import { Icon, type IconName } from '../Icon';
import { styles } from './AppTextInput.styles';

export type AppTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: IconName;
  containerStyle?: StyleProp<ViewStyle>;
  ref?: React.Ref<TextInputInstance>;
};

/**
 * Text field with label, hint, error and focus states. Password fields
 * (secureTextEntry) get a show/hide toggle automatically.
 */
export function AppTextInput({
  label,
  error,
  hint,
  leftIcon,
  containerStyle,
  secureTextEntry,
  editable = true,
  onFocus,
  onBlur,
  ref,
  ...rest
}: AppTextInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isPassword = Boolean(secureTextEntry);

  const borderColor = error
    ? colors.danger
    : focused
    ? colors.borderFocus
    : colors.border;
  const iconColor = error
    ? colors.danger
    : focused
    ? colors.brand
    : colors.textMuted;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText variant="label" color="textSecondary">
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.field,
          {
            borderColor,
            backgroundColor: editable ? colors.surface : colors.surfaceMuted,
          },
          focused && !error ? styles.fieldFocused : null,
        ]}
      >
        {leftIcon ? <Icon name={leftIcon} color={iconColor} /> : null}
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.textPlaceholder}
          selectionColor={colors.brand}
          cursorColor={colors.brand}
          secureTextEntry={isPassword && hidden}
          editable={editable}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          maxFontSizeMultiplier={1.4}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setHidden(h => !h)}
            hitSlop={spacing.md}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Icon
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ErrorText>{error}</ErrorText>
      ) : hint ? (
        <AppText variant="caption" color="textMuted">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
