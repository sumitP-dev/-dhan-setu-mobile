import React, { useState } from 'react';
import { View } from 'react-native';

import {
  AppButton,
  AppText,
  Banner,
  OtpInput,
  Screen,
} from '../../../../components';
import type { AuthScreenProps } from '../../../../navigation/types';
import { formatPhone } from '../../../../utils/format';
import { formatCountdown, useCountdown } from '../../../../utils/useCountdown';
import { otpCodeSchema } from '../../schemas';
import { AuthHeader } from '../AuthHeader';
import { NOT_CONNECTED_YET } from '../constants';
import { styles } from './OtpVerifyScreen.styles';

/** Matches the backend's resend cooldown. */
const RESEND_SECONDS = 30;

export function OtpVerifyScreen({
  navigation,
  route,
}: AuthScreenProps<'OtpVerify'>) {
  const { phone } = route.params;
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [notice, setNotice] = useState<string | null>(null);
  const countdown = useCountdown(RESEND_SECONDS);

  const onVerify = () => {
    const result = otpCodeSchema.safeParse(code);
    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    // Calls POST /auth/otp/verify once the API layer is added (Prompt 5).
    setNotice(NOT_CONNECTED_YET);
  };

  const onResend = () => {
    // Calls POST /auth/otp/send once the API layer is added (Prompt 5).
    setCode('');
    countdown.restart();
  };

  return (
    <Screen
      scroll
      testID="otp-screen"
      footer={
        <AppButton
          title="Verify"
          onPress={onVerify}
          disabled={code.length < 6}
        />
      }
    >
      <AuthHeader
        title="Verify your number"
        subtitle={
          <>
            Enter the 6-digit code sent to{' '}
            <AppText variant="bodyMedium">{formatPhone(phone)}</AppText>
          </>
        }
      />
      <View style={styles.body}>
        {notice ? (
          <Banner tone="info" message={notice} testID="otp-notice" />
        ) : null}
        <OtpInput
          value={code}
          onChange={value => {
            setCode(value);
            setError(undefined);
          }}
          error={error}
          testID="otp-input"
        />
        <View style={styles.actions}>
          {countdown.isDone ? (
            <AppButton
              title="Resend code"
              variant="ghost"
              size="sm"
              fullWidth={false}
              leftIcon="refresh"
              onPress={onResend}
            />
          ) : (
            <AppText
              variant="bodySmall"
              color="textMuted"
              testID="otp-countdown"
            >
              Resend code in {formatCountdown(countdown.remaining)}
            </AppText>
          )}
          <AppButton
            title="Change number"
            variant="ghost"
            size="sm"
            fullWidth={false}
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    </Screen>
  );
}
