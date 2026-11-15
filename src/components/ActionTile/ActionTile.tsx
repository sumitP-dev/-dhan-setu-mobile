import React from 'react';
import { View } from 'react-native';

import { colors } from '../../theme';
import { AppText } from '../AppText';
import { Card } from '../Card';
import { IconBadge, type IconBadgeTone } from '../IconBadge';
import { Icon, type IconName } from '../Icon';
import { styles } from './ActionTile.styles';

export type ActionTileProps = {
  icon: IconName;
  title: string;
  subtitle?: string;
  tone?: IconBadgeTone;
  onPress: () => void;
  /** Shows a lock (e.g. until KYC is verified); the tile still opens to explain why. */
  locked?: boolean;
  testID?: string;
};

export function ActionTile({
  icon,
  title,
  subtitle,
  tone = 'brand',
  onPress,
  locked = false,
  testID,
}: ActionTileProps) {
  return (
    <Card
      onPress={onPress}
      style={styles.tile}
      accessibilityLabel={
        locked ? `${title}, locked until KYC is verified` : title
      }
      testID={testID}
    >
      <View style={styles.top}>
        <IconBadge icon={icon} tone={tone} />
        {locked ? (
          <Icon
            name="lock-outline"
            size={18}
            color={colors.textMuted}
            testID={testID ? `${testID}-lock` : undefined}
          />
        ) : null}
      </View>
      <AppText variant="title" numberOfLines={1}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="caption" color="textMuted" numberOfLines={2}>
          {subtitle}
        </AppText>
      ) : null}
    </Card>
  );
}
