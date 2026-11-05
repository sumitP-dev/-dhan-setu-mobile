import React from 'react';

import { AppText, type AppTextProps } from '../AppText';

/** Inline error message, announced by screen readers. */
export function ErrorText({
  children,
  ...rest
}: Omit<AppTextProps, 'variant' | 'color'>) {
  if (!children) {
    return null;
  }
  return (
    <AppText
      variant="caption"
      color="danger"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      {...rest}
    >
      {children}
    </AppText>
  );
}
