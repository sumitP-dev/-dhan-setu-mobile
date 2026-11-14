import { Alert } from 'react-native';

import type { KycNextStep } from '../../api/types';

/**
 * Opens the next KYC step. The DigiLocker, PAN, selfie and submit screens arrive in
 * the next phases (KM2, KM3); until then this explains that.
 */
export function openKycStep(_step: KycNextStep) {
  Alert.alert(
    'Coming soon',
    'Identity verification through DigiLocker is being added in the next update.',
  );
}
