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
import { AuthHeader } from '../AuthHeader';
import { NOT_CONNECTED_YET } from '../constants';
import { TextLink } from '../TextLink';
import { styles } from './LoginScreen.styles';

export function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const [notice, setNotice] = useState<string | null>(null);
  const { control, handleSubmit, setFocus } = useForm<
    LoginFormInput,
    unknown,
    LoginFormValues
  >({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = handleSubmit(() => {
    // Calls POST /auth/login once the API layer is added (Prompt 5).
    setNotice(NOT_CONNECTED_YET);
  });

  return (
    <Screen
      scroll
      testID="login-screen"
      footer={
        <>
          <AppButton title="Log in" onPress={() => onSubmit()} />
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
        {notice ? (
          <Banner tone="info" message={notice} testID="login-notice" />
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
      </View>
    </Screen>
  );
}
