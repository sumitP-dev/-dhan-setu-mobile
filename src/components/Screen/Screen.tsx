import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors } from '../../theme';
import { styles } from './Screen.styles';

export type ScreenProps = {
  children: React.ReactNode;
  /** Scrollable content (forms, long pages). */
  scroll?: boolean;
  /** Horizontal and vertical padding from the spacing scale. */
  padded?: boolean;
  /** Pinned to the bottom, above the keyboard (e.g. the main button). */
  footer?: React.ReactNode;
  /** Safe-area edges to pad. Screens with a navigation header leave out 'top'. */
  edges?: Edge[];
  background?: string;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Base layout for every screen: safe areas, background, keyboard handling, padding. */
export function Screen({
  children,
  scroll = false,
  padded = true,
  footer,
  edges = ['bottom'],
  background = colors.background,
  contentStyle,
  testID,
}: ScreenProps) {
  const padding = padded ? styles.padded : null;

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.root, { backgroundColor: background }]}
      testID={testID}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            style={styles.root}
            contentContainerStyle={[
              styles.scrollContent,
              padding,
              contentStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.root, padding, contentStyle]}>{children}</View>
        )}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
