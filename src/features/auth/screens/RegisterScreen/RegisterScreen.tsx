import React, { useState } from 'react';
import { View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  AppButton,
  AppText,
  Banner,
  FormInput,
  Screen,
} from '../../../../components';
import type { AuthScreenProps } from '../../../../navigation/types';
import {
  registerSchema,
  type RegisterFormInput,
  type RegisterFormValues,
} from '../../schemas';
import { getApiError } from '../../../../utils/apiError';
import { useRegister } from '../../hooks';
import { AuthHeader } from '../AuthHeader';
import { otpVerifyParams } from '../constants';
import { TextLink } from '../TextLink';
import { styles } from './RegisterScreen.styles';

export function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const [error, setFormError] = useState<string | null>(null);
  const registerMutation = useRegister();
  const { control, handleSubmit, setFocus, setError } = useForm<
    RegisterFormInput,
    unknown,
    RegisterFormValues
  >({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', email: '', phone: '', password: '' },
  });

  const onSubmit = handleSubmit(async values => {
    setFormError(null);
    try {
      const { otp } = await registerMutation.mutateAsync(values);
      navigation.navigate(
        'OtpVerify',
        otpVerifyParams(values.phone, 'verify_phone', otp),
      );
    } catch (registerError) {
      const apiError = getApiError(registerError);
      if (apiError.code === 'email_taken') {
        setError('email', { message: apiError.message }, { shouldFocus: true });
      } else if (apiError.code === 'phone_taken') {
        setError('phone', { message: apiError.message }, { shouldFocus: true });
      } else {
        setFormError(apiError.message);
      }
    }
  });

  return (
    <Screen
      scroll
      testID="register-screen"
      footer={
        <>
          <AppButton
            title="Continue"
            onPress={() => onSubmit()}
            loading={registerMutation.isPending}
          />
          <TextLink
            prompt="Already have an account?"
            action="Log in"
            onPress={() => navigation.replace('Login')}
          />
        </>
      }
    >
      <AuthHeader
        title="Create your account"
        subtitle="It takes a minute. We'll verify your mobile number next."
      />
      <View style={styles.form}>
        {error ? (
          <Banner tone="danger" message={error} testID="register-error" />
        ) : null}
        <FormInput
          control={control}
          name="full_name"
          label="Full name"
          placeholder="As on your bank account"
          leftIcon="account-outline"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => setFocus('email')}
          testID="register-name"
        />
        <FormInput
          control={control}
          name="email"
          label="Email"
          leftIcon="email-outline"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => setFocus('phone')}
          testID="register-email"
        />
        <FormInput
          control={control}
          name="phone"
          label="Mobile number"
          hint="We'll text a 6-digit code to this number"
          leftIcon="phone-outline"
          autoComplete="tel"
          textContentType="telephoneNumber"
          keyboardType="phone-pad"
          returnKeyType="next"
          onSubmitEditing={() => setFocus('password')}
          testID="register-phone"
        />
        <FormInput
          control={control}
          name="password"
          label="Password"
          placeholder="Create a password"
          hint="At least 8 characters, with a letter and a number"
          leftIcon="lock-outline"
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={() => onSubmit()}
          testID="register-password"
        />
        <AppText variant="caption" color="textMuted" align="center">
          By continuing you agree to Dhan Setu's Terms and Privacy Policy.
        </AppText>
      </View>
    </Screen>
  );
}
