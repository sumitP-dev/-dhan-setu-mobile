import React, { useState } from 'react';
import { View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import {
  AppButton,
  AppText,
  Banner,
  Icon,
  IconBadge,
  Screen,
} from '../../../../components';
import type { SelfieSession } from '../../../../api/types';
import type { AppScreenProps } from '../../../../navigation/types';
import { colors } from '../../../../theme';
import { getApiError } from '../../../../utils/apiError';
import { kycQueryKey, useCheckSelfie, useStartSelfie } from '../../hooks';
import { SelfieSdkUnavailableError, useSelfieSdk } from '../../selfieSdk';
import { styles } from './KycSelfieScreen.styles';

const TIPS = [
  { icon: 'white-balance-sunny', text: 'Find good, even light' },
  { icon: 'glasses', text: 'Take off glasses, a mask or a cap' },
  { icon: 'account-outline', text: 'Only you in the picture' },
] as const;

/** The provider may need a moment after the SDK closes. */
export const SELFIE_CHECKS = 3;
export const SELFIE_CHECK_DELAY_MS = 1000;
const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

type Phase = 'ready' | 'running' | 'checking' | 'still_checking';

/**
 * The live selfie: runs the selfie SDK, then asks the server for the result (liveness
 * and the match with the Aadhaar photo). The app never decides whether it passed.
 */
export function KycSelfieScreen({ navigation }: AppScreenProps<'KycSelfie'>) {
  const queryClient = useQueryClient();
  const startMutation = useStartSelfie();
  const checkMutation = useCheckSelfie();
  const sdk = useSelfieSdk();
  const [phase, setPhase] = useState<Phase>('ready');
  const [selfieId, setSelfieId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const passed = async () => {
    await queryClient.invalidateQueries({ queryKey: kycQueryKey });
    navigation.replace('KycReview');
  };

  const settle = async (result: SelfieSession) => {
    if (result.status === 'completed') {
      await passed();
      return;
    }
    setSelfieId(null);
    setPhase('ready');
    setError(
      result.failure_message ??
        'The selfie check couldn’t complete. Try again.',
    );
  };

  const check = async (id: string) => {
    setPhase('checking');
    setError(null);
    try {
      for (let attempt = 1; attempt <= SELFIE_CHECKS; attempt += 1) {
        const result = await checkMutation.mutateAsync(id);
        if (result.status !== 'pending') {
          await settle(result);
          return;
        }
        if (attempt < SELFIE_CHECKS) {
          await wait(SELFIE_CHECK_DELAY_MS);
        }
      }
      setPhase('still_checking');
    } catch (checkError) {
      setPhase('still_checking');
      setError(getApiError(checkError).message);
    }
  };

  const start = async () => {
    setError(null);
    try {
      const started = await startMutation.mutateAsync();
      setSelfieId(started.id);
      setPhase('running');
      const outcome = await sdk.run(started.sdk_token);
      if (outcome === 'cancelled') {
        setPhase('ready');
        return;
      }
      await check(started.id);
    } catch (startError) {
      setPhase('ready');
      if (startError instanceof SelfieSdkUnavailableError) {
        setError(startError.message);
        return;
      }
      const apiError = getApiError(startError);
      if (apiError.code === 'selfie_already_verified') {
        await passed();
        return;
      }
      if (apiError.code === 'kyc_selfie_not_expected') {
        queryClient.invalidateQueries({ queryKey: kycQueryKey });
      }
      setError(apiError.message);
    }
  };

  if (phase === 'checking' || phase === 'still_checking') {
    const still = phase === 'still_checking';
    return (
      <Screen
        scroll
        testID="kyc-selfie-screen"
        footer={
          still && selfieId ? (
            <AppButton
              title="Check again"
              onPress={() => check(selfieId)}
              fullWidth
              size="lg"
            />
          ) : undefined
        }
      >
        <View style={styles.hero}>
          <IconBadge icon="timer-sand" tone="info" size={72} />
          <AppText variant="h2" align="center" accessibilityRole="header">
            {still ? 'Still checking' : 'Checking your selfie'}
          </AppText>
          <AppText variant="body" color="textSecondary" align="center">
            {still
              ? 'This is taking longer than usual. Check again in a moment.'
              : 'Matching it with your Aadhaar photo…'}
          </AppText>
        </View>
        {error ? (
          <View style={styles.messages}>
            <Banner tone="danger" message={error} testID="selfie-error" />
          </View>
        ) : null}
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      testID="kyc-selfie-screen"
      footer={
        <AppButton
          title={error ? 'Try again' : 'Take selfie'}
          onPress={start}
          loading={startMutation.isPending || phase === 'running'}
          fullWidth
          size="lg"
        />
      }
    >
      <View style={styles.hero}>
        <IconBadge icon="face-recognition" tone="brand" size={72} />
        <AppText variant="h2" align="center" accessibilityRole="header">
          Take a live selfie
        </AppText>
        <AppText variant="body" color="textSecondary" align="center">
          We’ll check it’s really you by matching it with your Aadhaar photo.
        </AppText>
      </View>
      {error ? (
        <View style={styles.messages}>
          <Banner tone="danger" message={error} testID="selfie-error" />
        </View>
      ) : null}
      <View style={styles.list}>
        {TIPS.map(tip => (
          <View key={tip.text} style={styles.item}>
            <IconBadge icon={tip.icon} tone="neutral" size={40} />
            <AppText variant="body" style={styles.itemText}>
              {tip.text}
            </AppText>
          </View>
        ))}
      </View>
      <View style={styles.privacy}>
        <Icon name="lock-outline" size={16} color={colors.textMuted} />
        <AppText variant="caption" color="textMuted" style={styles.privacyText}>
          Dhan Setu doesn’t store your selfie. We keep only the result of the
          check.
        </AppText>
      </View>
      {sdk.sheet}
    </Screen>
  );
}
