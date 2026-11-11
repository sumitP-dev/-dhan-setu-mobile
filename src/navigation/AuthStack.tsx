import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  LoginScreen,
  OtpLoginScreen,
  OtpVerifyScreen,
  RegisterScreen,
  WelcomeScreen,
} from '../features/auth/screens';
import { useAppSelector } from '../store';
import { stackScreenOptions } from './theme';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** The intro slides show only until someone registers or signs in on this device. */
export function AuthStack() {
  const hasOnboarded = useAppSelector(s => s.auth.hasOnboarded);
  return (
    <Stack.Navigator
      initialRouteName={hasOnboarded ? 'Login' : 'Welcome'}
      screenOptions={{ ...stackScreenOptions, title: '' }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OtpLogin" component={OtpLoginScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
    </Stack.Navigator>
  );
}
