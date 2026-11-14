import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { OtpPurpose } from '../api/types';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OtpLogin: undefined;
  OtpVerify: {
    /** 10 digits, e.g. "9876543210". */
    phone: string;
    purpose: OtpPurpose;
    /** Seconds before "Resend code" unlocks (from the server's resend_after). */
    resendAfter?: number;
    /** The code itself, only when the backend runs with DEBUG=true. Shown in __DEV__. */
    devOtp?: string;
  };
};

export type AppStackParamList = {
  /** Shown once after sign-up (and to anyone who hasn't started KYC), with Skip. */
  KycIntro: undefined;
  Kyc: undefined;
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
