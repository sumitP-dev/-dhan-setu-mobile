import React, { useCallback, useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import {
  AppButton,
  AppText,
  Banner,
  Icon,
  IconBadge,
  Screen,
} from '../../../../components';
import type { DigiLockerSession } from '../../../../api/types';
import type { AppScreenProps } from '../../../../navigation/types';
import { colors } from '../../../../theme';
import { getApiError } from '../../../../utils/apiError';
import {
  kycQueryKey,
  useCheckDigiLocker,
  useStartDigiLocker,
} from '../../hooks';
import { useDigiLockerReturn } from '../../useDigiLockerReturn';
import { styles } from './KycDigiLockerScreen.styles';

const SHARED = [
  {
    icon: 'card-account-details-outline',
    title: 'Aadhaar',
    body: 'Name, date of birth, gender, address and photo',
  },
  {
    icon: 'card-text-outline',
    title: 'PAN',
    body: 'If it’s in your DigiLocker. If not, you can type it in next.',
  },
] as const;

const OPEN_FAILED =
  'Couldn’t open DigiLocker. Check that a browser is available and try again.';
const STILL_PENDING =
  'DigiLocker hasn’t finished yet. Allow sharing there, then come back.';

/**
 * Sends the user to DigiLocker in the browser to share their Aadhaar (and PAN),
 * then asks the server how it went when they come back.
 */
export function KycDigiLockerScreen({
  navigation,
}: AppScreenProps<'KycDigiLocker'>) {
  const queryClient = useQueryClient();
  const startMutation = useStartDigiLocker();
  const checkMutation = useCheckDigiLocker();
  const [session, setSession] = useState<DigiLockerSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const checking = useRef(false);

  const openConsent = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      setError(OPEN_FAILED);
    }
  };

  const start = async () => {
    setError(null);
    setNote(null);
    try {
      const started = await startMutation.mutateAsync();
      setSession(started);
      await openConsent(started.consent_url);
    } catch (startError) {
      const apiError = getApiError(startError);
      if (apiError.code === 'kyc_not_startable') {
        // Already submitted (e.g. from another device): show the latest status.
        queryClient.invalidateQueries({ queryKey: kycQueryKey });
      }
      setError(apiError.message);
    }
  };

  const check = useCallback(
    async ({ manual }: { manual: boolean }) => {
      if (!session || checking.current) {
        return;
      }
      checking.current = true;
      setError(null);
      try {
        const result = await checkMutation.mutateAsync(session.id);
        if (result.status === 'completed') {
          await queryClient.invalidateQueries({ queryKey: kycQueryKey });
          // Back to the details if they came from there, else in place of this screen.
          navigation.popTo('KycDetails');
        } else if (result.status === 'pending') {
          setNote(manual ? STILL_PENDING : null);
        } else {
          setSession(null);
          setNote(null);
          setError(
            result.failure_message ??
              'DigiLocker couldn’t complete. Try again.',
          );
        }
      } catch (checkError) {
        const apiError = getApiError(checkError);
        if (apiError.code === 'kyc_session_not_found') {
          setSession(null);
        }
        setError(apiError.message);
      } finally {
        checking.current = false;
      }
    },
    [checkMutation, navigation, queryClient, session],
  );

  useDigiLockerReturn(() => check({ manual: false }), session !== null);

  if (session) {
    return (
      <Screen
        scroll
        testID="kyc-digilocker-screen"
        footer={
          <View style={styles.footer}>
            <AppButton
              title="I’ve finished"
              onPress={() => check({ manual: true })}
              loading={checkMutation.isPending}
              fullWidth
              size="lg"
            />
            <AppButton
              title="Open DigiLocker again"
              variant="ghost"
              onPress={() => openConsent(session.consent_url)}
              fullWidth
            />
          </View>
        }
      >
        <View style={styles.hero}>
          <IconBadge icon="open-in-new" tone="info" size={72} />
          <AppText variant="h2" align="center" accessibilityRole="header">
            Finish in DigiLocker
          </AppText>
          <AppText variant="body" color="textSecondary" align="center">
            Log in to DigiLocker and allow sharing. You’ll come back here when
            you’re done.
          </AppText>
        </View>
        <View style={styles.messages}>
          {error ? (
            <Banner tone="danger" message={error} testID="digilocker-error" />
          ) : null}
          {note ? (
            <Banner tone="info" message={note} testID="digilocker-note" />
          ) : null}
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      testID="kyc-digilocker-screen"
      footer={
        <AppButton
          title={error ? 'Try again' : 'Continue to DigiLocker'}
          onPress={start}
          loading={startMutation.isPending}
          fullWidth
          size="lg"
        />
      }
    >
      <View style={styles.hero}>
        <IconBadge icon="shield-key-outline" tone="brand" size={72} />
        <AppText variant="h2" align="center" accessibilityRole="header">
          Aadhaar from DigiLocker
        </AppText>
        <AppText variant="body" color="textSecondary" align="center">
          You’ll log in to DigiLocker, the Government of India’s document
          wallet, and allow Dhan Setu to read:
        </AppText>
      </View>
      {error ? (
        <View style={styles.messages}>
          <Banner tone="danger" message={error} testID="digilocker-error" />
        </View>
      ) : null}
      <View style={styles.list}>
        {SHARED.map(item => (
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
          We keep only the last 4 digits of your Aadhaar, and never store your
          Aadhaar photo. Your details are encrypted.
        </AppText>
      </View>
    </Screen>
  );
}
