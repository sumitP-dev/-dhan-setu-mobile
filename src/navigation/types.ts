import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { OtpPurpose } from '../api/types';

/** Screens shown while signed out. */
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OtpVerify: { phone: string; purpose: OtpPurpose };
};

/** Screens shown while signed in. */
export type AppStackParamList = {
  Home: undefined;
  Cards: undefined;
  Upi: undefined;
  Bbps: undefined;
  Transactions: undefined;
  Profile: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;
export type AppScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;
