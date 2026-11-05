import React from 'react';
import { View } from 'react-native';

import { colors, sizes } from '../../theme';
import { Icon, type IconName } from '../Icon';
import { styles } from './IconBadge.styles';

export type IconBadgeTone =
  | 'brand'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

const TONES: Record<IconBadgeTone, { bg: string; fg: string }> = {
  brand: { bg: colors.brandSoft, fg: colors.brand },
  accent: { bg: colors.accentSoft, fg: colors.accent },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  info: { bg: colors.infoSoft, fg: colors.info },
  neutral: { bg: colors.surfaceMuted, fg: colors.textSecondary },
};

export type IconBadgeProps = {
  icon: IconName;
  tone?: IconBadgeTone;
  size?: number;
};

/** An icon on a soft tinted square. Used in tiles, list rows and empty states. */
export function IconBadge({ icon, tone = 'brand', size = 44 }: IconBadgeProps) {
  const t = TONES[tone];
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, backgroundColor: t.bg },
      ]}
    >
      <Icon
        name={icon}
        size={Math.round(size * 0.5) || sizes.iconMd}
        color={t.fg}
      />
    </View>
  );
}
