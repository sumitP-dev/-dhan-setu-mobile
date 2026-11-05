import React from 'react';

import { EmptyState, Screen } from '../../../../components';
import type { AppScreenProps } from '../../../../navigation/types';

export function TransactionsScreen(_: AppScreenProps<'Transactions'>) {
  return (
    <Screen testID="transactions-screen">
      <EmptyState
        icon="swap-horizontal"
        tone="info"
        title="No transactions yet"
        message="Every card, UPI and bill payment you make will be listed here."
      />
    </Screen>
  );
}
