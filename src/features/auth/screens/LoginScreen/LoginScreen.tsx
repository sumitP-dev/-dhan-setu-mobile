import React, { useState } from 'react';
import { View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { AppButton, Banner, FormInput, Screen } from '../../../../components';
import type { AuthScreenProps } from '../../../../navigation/types';
import {
  loginSchema,
  type LoginFormInput,
  type LoginFormValues,
} from '../../schemas';
import { getApiError } from '../../../../utils/apiError';
import { useLogin, useSendOtp } from '../../hooks';
import { AuthHeader } from '../AuthHeader';
import { otpVerifyParams } from '../constants';
import { TextLink } from '../TextLink';
import { styles } from './LoginScreen.styles';

export function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const [error, setError] = useState<string | null>(null);
  const loginMutation = useLogin();
  const sendOtpMutation = useSendOtp();
  const busy = loginMutation.isPending || sendOtpMutation.isPending;
  const { control, handleSubmit, setFocus } = useForm<
    LoginFormInput,
    unknown,
    LoginFormValues
  >({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = handleSubmit(async values => {
    setError(null);
    try {
      // On success the navigator switches to the signed-in screens.
      await loginMutation.mutateAsync(values);
    } catch (loginError) {
      const apiError = getApiError(loginError);
      const isPhone = !values.identifier.includes('@');
      if (apiError.code === 'phone_not_verified' && isPhone) {
        await startPhoneVerification(values.identifier);
      } else if (apiError.code === 'phone_not_verified') {
        setError(
          'Verify your mobile number to continue. Log in with your mobile number and we will text you a code.',
        );
      } else {
        setError(apiError.message);
      }
    }
  });

  /** The account exists but the number isn't verified yet: text a code and verify it. */
  const startPhoneVerification = async (phone: string) => {
    try {
      const otp = await sendOtpMutation.mutateAsync({
        phone,
        purpose: 'verify_phone',
      });
      navigation.navigate(
        'OtpVerify',
        otpVerifyParams(phone, 'verify_phone', otp),
      );
    } catch (otpError) {
      setError(getApiError(otpError).message);
    }
  };

  return (
    <Screen
      scroll
      testID="login-screen"
      footer={
        <>
          <AppButton title="Log in" onPress={() => onSubmit()} loading={busy} />
          <TextLink
            prompt="New to Dhan Setu?"
            action="Create account"
            onPress={() => navigation.replace('Register')}
          />
        </>
      }
    >
      <AuthHeader
        title="Welcome back"
        subtitle="Log in with your email or mobile number."
      />
      <View style={styles.form}>
        {error ? (
          <Banner tone="danger" message={error} testID="login-error" />
        ) : null}
        <FormInput
          control={control}
          name="identifier"
          label="Email or mobile number"
          leftIcon="account-outline"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => setFocus('password')}
          testID="login-identifier"
        />
        <FormInput
          control={control}
          name="password"
          label="Password"
          placeholder="Your password"
          leftIcon="lock-outline"
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={() => onSubmit()}
          testID="login-password"
        />
        <AppButton
          title="Log in with OTP instead"
          variant="ghost"
          size="sm"
          leftIcon="message-text-outline"
          onPress={() => navigation.navigate('OtpLogin')}
          disabled={busy}
          testID="login-with-otp"
        />
      </View>
    </Screen>
  );
}
