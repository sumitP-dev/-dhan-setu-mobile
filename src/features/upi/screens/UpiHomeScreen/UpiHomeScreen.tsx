import React from 'react';

import { EmptyState, Screen } from '../../../../components';
import type { AppScreenProps } from '../../../../navigation/types';

export function UpiHomeScreen(_: AppScreenProps<'Upi'>) {
  return (
    <Screen testID="upi-screen">
      <EmptyState
        icon="lightning-bolt"
        tone="accent"
        title="UPI is coming soon"
        message="Pay any UPI ID, scan QR codes and pay with your favourite UPI app."
      />
    </Screen>
  );
}
