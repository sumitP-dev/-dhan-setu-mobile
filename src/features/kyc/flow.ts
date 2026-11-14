import { useCallback } from 'react';
import { Alert } from 'react-native';
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
        default:
          // The selfie and submit screens arrive in KM3.
          Alert.alert(
            'Coming soon',
            'The live selfie step is being added in the next update.',
          );
      }
    },
    [navigation],
  );
}
