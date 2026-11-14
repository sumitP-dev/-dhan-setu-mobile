import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BbpsHomeScreen } from '../features/bbps/screens';
import { CardsScreen } from '../features/cards/screens';
import { HomeScreen } from '../features/home/screens';
import {
  KycDetailsScreen,
  KycDigiLockerScreen,
  KycIntroScreen,
  KycPanScreen,
  KycScreen,
} from '../features/kyc/screens';
import { ProfileScreen } from '../features/profile/screens';
import { TransactionsScreen } from '../features/transactions/screens';
import { UpiHomeScreen } from '../features/upi/screens';
import { useAppSelector } from '../store';
import { stackScreenOptions } from './theme';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/** Opens on the KYC intro for someone who hasn't started KYC or seen the intro yet. */
export function AppStack() {
  const showKycIntro = useAppSelector(
    s => s.auth.user?.kyc_status === 'not_submitted' && !s.auth.kycPromptSeen,
  );
  return (
    <Stack.Navigator
      initialRouteName={showKycIntro ? 'KycIntro' : 'Home'}
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="KycIntro"
        component={KycIntroScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Kyc"
        component={KycScreen}
        options={{ title: 'KYC' }}
      />
      <Stack.Screen
        name="KycDigiLocker"
        component={KycDigiLockerScreen}
        options={{ title: 'DigiLocker' }}
      />
      <Stack.Screen
        name="KycDetails"
        component={KycDetailsScreen}
        options={{ title: 'Your details' }}
      />
      <Stack.Screen
        name="KycPan"
        component={KycPanScreen}
        options={{ title: 'PAN' }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Cards"
        component={CardsScreen}
        options={{ title: 'Cards' }}
      />
      <Stack.Screen
        name="Upi"
        component={UpiHomeScreen}
        options={{ title: 'UPI' }}
      />
      <Stack.Screen
        name="Bbps"
        component={BbpsHomeScreen}
        options={{ title: 'Pay bills' }}
      />
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: 'Transactions' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
}
