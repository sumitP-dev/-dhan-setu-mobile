import React from 'react';

import { AppText } from '../AppText';
import { Card } from '../Card';
import { IconBadge, type IconBadgeTone } from '../IconBadge';
import { type IconName } from '../Icon';
import { styles } from './ActionTile.styles';

export type ActionTileProps = {
  icon: IconName;
  title: string;
  subtitle?: string;
  tone?: IconBadgeTone;
  onPress: () => void;
  testID?: string;
};

export function ActionTile({
  icon,
  title,
  subtitle,
  tone = 'brand',
  onPress,
  testID,
}: ActionTileProps) {
  return (
    <Card
      onPress={onPress}
      style={styles.tile}
      accessibilityLabel={title}
      testID={testID}
    >
      <IconBadge icon={icon} tone={tone} />
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
