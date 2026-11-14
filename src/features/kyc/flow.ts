import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { KycNextStep } from '../../api/types';
import type { AppStackParamList } from '../../navigation/types';

/** Opens the screen for the next KYC step. */
export function useOpenKycStep() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  return useCallback(
    (step: KycNextStep) => {
      switch (step) {
        case 'digilocker':
          navigation.navigate('KycDigiLocker');
          return;
        case 'pan':
          // The details screen says what went wrong with the PAN, then asks for it.
          navigation.navigate('KycDetails');
          return;
        case 'selfie':
          navigation.navigate('KycSelfie');
          return;
        case 'submit':
          navigation.navigate('KycReview');
          return;
      }
    },
    [navigation],
  );
}
