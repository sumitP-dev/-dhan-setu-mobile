import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BbpsHomeScreen } from '../features/bbps/screens';
import { CardsScreen } from '../features/cards/screens';
import { HomeScreen } from '../features/home/screens';
import { ProfileScreen } from '../features/profile/screens';
import { TransactionsScreen } from '../features/transactions/screens';
import { UpiHomeScreen } from '../features/upi/screens';
import { stackScreenOptions } from './theme';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={stackScreenOptions}>
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
