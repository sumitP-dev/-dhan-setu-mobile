import React, { useState } from 'react';
import { View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { AppButton, Banner, FormInput, Screen } from '../../../../components';
import type { AuthScreenProps } from '../../../../navigation/types';
import { getApiError } from '../../../../utils/apiError';
import { useSendOtp } from '../../hooks';
import {
  otpLoginSchema,
  type OtpLoginFormInput,
  type OtpLoginFormValues,
} from '../../schemas';
import { AuthHeader } from '../AuthHeader';
import { otpVerifyParams } from '../constants';
import { TextLink } from '../TextLink';
import { styles } from './OtpLoginScreen.styles';

/**
 * Log in with a code texted to the mobile number. The server answers the same way
 * whether or not the number is registered, so the app always moves on to the code screen.
 */
export function OtpLoginScreen({ navigation }: AuthScreenProps<'OtpLogin'>) {
  const [error, setError] = useState<string | null>(null);
  const sendOtpMutation = useSendOtp();
  const { control, handleSubmit } = useForm<
    OtpLoginFormInput,
    unknown,
    OtpLoginFormValues
  >({
    resolver: zodResolver(otpLoginSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = handleSubmit(async ({ phone }) => {
    setError(null);
    try {
      const otp = await sendOtpMutation.mutateAsync({
        phone,
        purpose: 'login',
      });
      navigation.navigate('OtpVerify', otpVerifyParams(phone, 'login', otp));
    } catch (sendError) {
      setError(getApiError(sendError).message);
    }
  });

  return (
    <Screen
      scroll
      testID="otp-login-screen"
      footer={
        <>
          <AppButton
            title="Send code"
            onPress={() => onSubmit()}
            loading={sendOtpMutation.isPending}
          />
          <TextLink
            prompt="Prefer your password?"
            action="Log in with password"
            onPress={() => navigation.goBack()}
          />
        </>
      }
    >
      <AuthHeader
        title="Log in with OTP"
        subtitle="We'll text a 6-digit code to your registered mobile number."
      />
      <View style={styles.form}>
        {error ? (
          <Banner tone="danger" message={error} testID="otp-login-error" />
        ) : null}
        <FormInput
          control={control}
          name="phone"
          label="Mobile number"
          leftIcon="phone-outline"
          autoComplete="tel"
          textContentType="telephoneNumber"
          keyboardType="phone-pad"
          returnKeyType="go"
          onSubmitEditing={() => onSubmit()}
          testID="otp-login-phone"
        />
      </View>
    </Screen>
  );
}
