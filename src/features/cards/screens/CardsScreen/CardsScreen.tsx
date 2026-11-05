import React from 'react';

import { EmptyState, Screen } from '../../../../components';
import type { AppScreenProps } from '../../../../navigation/types';

export function CardsScreen(_: AppScreenProps<'Cards'>) {
  return (
    <Screen testID="cards-screen">
      <EmptyState
        icon="credit-card-outline"
        tone="brand"
        title="Cards are coming soon"
        message="Save your credit and debit cards and pay securely. Card numbers stay with the payment gateway, never on our servers."
      />
    </Screen>
  );
}
