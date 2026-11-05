import React from 'react';
import { View } from 'react-native';

import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { IconBadge, type IconBadgeTone } from '../IconBadge';
import { type IconName } from '../Icon';
import { styles } from './EmptyState.styles';

export type EmptyStateProps = {
  icon: IconName;
  title: string;
  message: string;
  tone?: IconBadgeTone;
  actionTitle?: string;
  onAction?: () => void;
};

/** Centered icon + message for empty lists and features not built yet. */
export function EmptyState({
  icon,
  title,
  message,
  tone = 'brand',
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <IconBadge icon={icon} tone={tone} size={72} />
      <View style={styles.text}>
        <AppText variant="h3" align="center">
          {title}
        </AppText>
        <AppText variant="body" color="textSecondary" align="center">
          {message}
        </AppText>
      </View>
      {actionTitle && onAction ? (
        <AppButton
          title={actionTitle}
          onPress={onAction}
          variant="secondary"
          fullWidth={false}
        />
      ) : null}
    </View>
  );
}
