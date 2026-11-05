import React from 'react';
import { View } from 'react-native';

import { colors, type ColorName } from '../../theme';
import { AppText } from '../AppText';
import { Icon, type IconName } from '../Icon';
import { styles } from './Banner.styles';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<BannerTone, { bg: string; fg: ColorName; icon: IconName }> =
  {
    info: { bg: colors.infoSoft, fg: 'info', icon: 'information-outline' },
    success: {
      bg: colors.successSoft,
      fg: 'success',
      icon: 'check-circle-outline',
    },
    warning: { bg: colors.warningSoft, fg: 'warning', icon: 'alert-outline' },
    danger: {
      bg: colors.dangerSoft,
      fg: 'danger',
      icon: 'alert-circle-outline',
    },
  };

export type BannerProps = {
  tone?: BannerTone;
  title?: string;
  message: string;
  testID?: string;
};

/** Inline message box for errors, warnings and confirmations. */
export function Banner({ tone = 'info', title, message, testID }: BannerProps) {
  const t = TONES[tone];
  return (
    <View
      style={[styles.banner, { backgroundColor: t.bg }]}
      accessible
      accessibilityLabel={title ? `${title}. ${message}` : message}
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      <Icon name={t.icon} color={colors[t.fg]} />
      <View style={styles.text}>
        {title ? (
          <AppText variant="label" color={t.fg}>
            {title}
          </AppText>
        ) : null}
        <AppText variant="bodySmall" color={t.fg}>
          {message}
        </AppText>
      </View>
    </View>
  );
}
