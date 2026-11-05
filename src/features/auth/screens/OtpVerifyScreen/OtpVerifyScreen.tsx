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
import { getApiError } from '../../../../utils/apiError';
import { formatCountdown, useCountdown } from '../../../../utils/useCountdown';
import { useSendOtp, useVerifyOtp } from '../../hooks';
import { otpCodeSchema } from '../../schemas';
import { AuthHeader } from '../AuthHeader';
import { styles } from './OtpVerifyScreen.styles';

/** The backend's resend cooldown, used if the server didn't say. */
const DEFAULT_RESEND_SECONDS = 30;

/** Codes that are about the code itself, shown under the input instead of in a banner. */
const CODE_ERRORS = new Set(['invalid_otp', 'otp_attempts_exceeded']);

export function OtpVerifyScreen({
  navigation,
  route,
}: AuthScreenProps<'OtpVerify'>) {
  const { phone, purpose, resendAfter } = route.params;
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState(route.params.devOtp);
  const countdown = useCountdown(resendAfter ?? DEFAULT_RESEND_SECONDS);
  const verifyMutation = useVerifyOtp();
  const sendOtpMutation = useSendOtp();

  const onVerify = async () => {
    const result = otpCodeSchema.safeParse(code);
    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    setBannerError(null);
    try {
      // On success the navigator switches to the signed-in screens.
      await verifyMutation.mutateAsync({ phone, purpose, code: result.data });
    } catch (verifyError) {
      const apiError = getApiError(verifyError);
      if (CODE_ERRORS.has(apiError.code)) {
        setError(apiError.message);
      } else {
        setBannerError(apiError.message);
      }
    }
  };

  const onResend = async () => {
    setError(undefined);
    setBannerError(null);
    try {
      const otp = await sendOtpMutation.mutateAsync({ phone, purpose });
      setCode('');
      setDevOtp(otp.dev_otp);
      countdown.restart(otp.resend_after);
    } catch (sendError) {
      setBannerError(getApiError(sendError).message);
    }
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
          loading={verifyMutation.isPending}
        />
      }
    >
      <AuthHeader
        title={
          purpose === 'login' ? 'Enter your login code' : 'Verify your number'
        }
        subtitle={
          <>
            Enter the 6-digit code sent to{' '}
            <AppText variant="bodyMedium">{formatPhone(phone)}</AppText>
          </>
        }
      />
      <View style={styles.body}>
        {bannerError ? (
          <Banner tone="danger" message={bannerError} testID="otp-error" />
        ) : null}
        {__DEV__ && devOtp ? (
          <Banner
            tone="info"
            title="Development build"
            message={`Your code is ${devOtp}`}
            testID="otp-dev-code"
          />
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
              loading={sendOtpMutation.isPending}
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
