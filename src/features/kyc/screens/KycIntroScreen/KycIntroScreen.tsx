import React from 'react';
import { View } from 'react-native';

import {
  AppButton,
  AppText,
  Icon,
  IconBadge,
  Screen,
} from '../../../../components';
import type { AppScreenProps } from '../../../../navigation/types';
import { markKycPromptSeen, useAppDispatch } from '../../../../store';
import { colors } from '../../../../theme';
import { styles } from './KycIntroScreen.styles';

const NEEDS = [
  {
    icon: 'card-account-details-outline',
    title: 'Aadhaar',
    body: 'Shared from your DigiLocker account',
  },
  {
    icon: 'card-text-outline',
    title: 'PAN',
    body: 'Usually fetched from DigiLocker too',
  },
  {
    icon: 'face-recognition',
    title: 'A live selfie',
    body: 'To confirm it’s really you',
  },
] as const;

/**
 * Shown right after sign-up. KYC is needed for cards, UPI and bill payments, but the
 * user can skip and do it later from Home or Profile.
 */
export function KycIntroScreen({ navigation }: AppScreenProps<'KycIntro'>) {
  const dispatch = useAppDispatch();

  const skip = () => {
    dispatch(markKycPromptSeen());
    navigation.replace('Home');
  };

  const start = () => {
    dispatch(markKycPromptSeen());
    // Home underneath, so back from KYC lands on Home rather than this intro.
    navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'Kyc' }] });
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      scroll
      testID="kyc-intro-screen"
      footer={
        <View style={styles.footer}>
          <AppButton title="Verify now" onPress={start} fullWidth size="lg" />
          <AppButton
            title="Skip for now"
            variant="ghost"
            onPress={skip}
            fullWidth
          />
        </View>
      }
    >
      <View style={styles.hero}>
        <IconBadge icon="shield-account-outline" tone="brand" size={80} />
        <AppText variant="h1" align="center" accessibilityRole="header">
          Verify your identity
        </AppText>
        <AppText variant="body" color="textSecondary" align="center">
          RBI rules require KYC before you can use cards, UPI and bill payments.
          It takes about 2 minutes.
        </AppText>
      </View>

      <AppText variant="overline" color="textMuted" style={styles.sectionTitle}>
        YOU’LL NEED
      </AppText>
      <View style={styles.list}>
        {NEEDS.map(item => (
          <View key={item.title} style={styles.item}>
            <IconBadge icon={item.icon} tone="neutral" size={40} />
            <View style={styles.itemText}>
              <AppText variant="bodyMedium">{item.title}</AppText>
              <AppText variant="caption" color="textMuted">
                {item.body}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.privacy}>
        <Icon name="lock-outline" size={16} color={colors.textMuted} />
        <AppText variant="caption" color="textMuted" style={styles.privacyText}>
          We never store your full Aadhaar number or your Aadhaar photo. Your
          details are encrypted.
        </AppText>
      </View>
    </Screen>
  );
}
