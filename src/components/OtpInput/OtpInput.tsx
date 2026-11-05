import React, { useRef, useState } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';

import { AppText } from '../AppText';
import { ErrorText } from '../ErrorText';
import { styles } from './OtpInput.styles';

export type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  autoFocus?: boolean;
  testID?: string;
};

/**
 * One-time code as separate boxes. A single hidden TextInput does the typing, so
 * paste, SMS autofill and backspace all work naturally.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  error,
  autoFocus = true,
  testID,
}: OtpInputProps) {
  const inputRef = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(false);
  const digits = value.split('');
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.boxes}
        onPress={() => inputRef.current?.focus()}
        accessibilityRole="none"
        importantForAccessibility="no-hide-descendants"
      >
        {Array.from({ length }, (_, i) => {
          const isActive = focused && i === activeIndex;
          return (
            <View
              key={i}
              style={[
                styles.box,
                digits[i] ? styles.boxFilled : null,
                isActive ? styles.boxActive : null,
                error ? styles.boxError : null,
              ]}
            >
              <AppText variant="h2">{digits[i] ?? ''}</AppText>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={text =>
          onChange(text.replace(/\D/g, '').slice(0, length))
        }
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        style={styles.hiddenInput}
        accessibilityLabel={`${length}-digit code`}
        testID={testID}
      />
      <ErrorText>{error}</ErrorText>
    </View>
  );
}
