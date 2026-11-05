import React from 'react';
import { Pressable, View } from 'react-native';

import { colors } from '../../theme';
import { AppText } from '../AppText';
import { IconBadge, type IconBadgeTone } from '../IconBadge';
import { Icon, type IconName } from '../Icon';
import { styles } from './ListRow.styles';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  tone?: IconBadgeTone;
  destructive?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
  testID?: string;
};

/** Settings-style row: icon, title, optional subtitle and chevron. */
export function ListRow({
  title,
  subtitle,
  icon,
  tone = 'neutral',
  destructive = false,
  showChevron = true,
  onPress,
  testID,
}: ListRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={title}
      android_ripple={{ color: colors.ripple }}
      style={styles.row}
      testID={testID}
    >
      {icon ? (
        <IconBadge icon={icon} tone={destructive ? 'danger' : tone} size={36} />
      ) : null}
      <View style={styles.text}>
        <AppText
          variant="bodyMedium"
          color={destructive ? 'danger' : 'textPrimary'}
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {onPress && showChevron && !destructive ? (
        <Icon name="chevron-right" color={colors.textPlaceholder} />
      ) : null}
    </Pressable>
  );
}
