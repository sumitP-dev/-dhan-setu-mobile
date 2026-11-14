import React from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Icon, IconBadge } from '../../../../components';
import type { KycRead, KycStatus } from '../../../../api/types';
import { colors } from '../../../../theme';
import { KYC_STATUS, kycMessage } from '../../status';
import { styles } from './KycBanner.styles';

const CTA: Partial<Record<KycStatus, string>> = {
  not_submitted: 'Start KYC',
  in_progress: 'Continue',
  rejected: 'Start again',
  pending_review: 'View status',
};

/** KYC status on Home. Hidden once verified. */
export function KycBanner({
  kyc,
  onPress,
}: {
  kyc: Pick<KycRead, 'status' | 'rejection_message'>;
  onPress: () => void;
}) {
  if (kyc.status === 'verified') {
    return null;
  }
  const copy = KYC_STATUS[kyc.status];
  const message = kycMessage(kyc);
  const cta = CTA[kyc.status];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${copy.title}. ${message}`}
      accessibilityHint={cta}
      android_ripple={{ color: colors.ripple }}
      style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
      testID="kyc-banner"
    >
      <IconBadge icon={copy.icon} tone={copy.tone} size={40} />
      <View style={styles.text}>
        <AppText variant="title">{copy.title}</AppText>
        <AppText variant="bodySmall" color="textSecondary">
          {message}
        </AppText>
        {cta ? (
          <View style={styles.cta}>
            <AppText variant="label" color="textLink">
              {cta}
            </AppText>
            <Icon name="arrow-right" size={14} color={colors.textLink} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
