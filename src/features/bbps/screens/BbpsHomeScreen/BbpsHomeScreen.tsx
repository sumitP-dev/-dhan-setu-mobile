import React from 'react';

import { EmptyState, Screen } from '../../../../components';
import type { AppScreenProps } from '../../../../navigation/types';

export function BbpsHomeScreen(_: AppScreenProps<'Bbps'>) {
  return (
    <Screen testID="bbps-screen">
      <EmptyState
        icon="receipt-text-outline"
        tone="warning"
        title="Bill payments are coming soon"
        message="Pay electricity, mobile, broadband, DTH and other bills through Bharat BillPay."
      />
    </Screen>
  );
}
