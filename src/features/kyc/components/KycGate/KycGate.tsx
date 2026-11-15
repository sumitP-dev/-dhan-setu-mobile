import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  EmptyState,
  type EmptyStateProps,
  Screen,
} from '../../../../components';
import type { KycRead, KycStatus } from '../../../../api/types';
import type { AppStackParamList } from '../../../../navigation/types';
import { useAppSelector } from '../../../../store';
import { useRefreshOnFocus } from '../../../../utils/useRefreshOnFocus';
import { useKyc } from '../../hooks';

/** Features that need a verified KYC (the backend refuses them otherwise). */
export type GatedFeature = 'cards' | 'upi' | 'bills';

const FEATURE_NAME: Record<GatedFeature, { title: string; inText: string }> = {
  cards: { title: 'Cards', inText: 'cards' },
  upi: { title: 'UPI', inText: 'UPI' },
  bills: { title: 'Bill payments', inText: 'bill payments' },
};

type LockedCopy = Pick<
  EmptyStateProps,
  'icon' | 'tone' | 'title' | 'message' | 'actionTitle'
>;

function lockedCopy(
  feature: GatedFeature,
  status: Exclude<KycStatus, 'verified'>,
  rejectionMessage: string | null | undefined,
): LockedCopy {
  const { title, inText } = FEATURE_NAME[feature];
  switch (status) {
    case 'in_progress':
      return {
        icon: 'lock-outline',
        tone: 'warning',
        title: `Finish KYC to use ${inText}`,
        message: 'You’re part-way through. Pick up where you left off.',
        actionTitle: 'Continue KYC',
      };
    case 'pending_review':
      return {
        icon: 'clock-outline',
        tone: 'info',
        title: 'KYC under review',
        message: `${title} will unlock as soon as your KYC is approved, usually in less than a day.`,
        actionTitle: 'View KYC status',
      };
    case 'rejected':
      return {
        icon: 'alert-circle-outline',
        tone: 'danger',
        title: 'KYC not approved',
        message:
          rejectionMessage ??
          'Your KYC couldn’t be approved. Start again, or contact support.',
        actionTitle: 'Start again',
      };
    default:
      return {
        icon: 'lock-outline',
        tone: 'warning',
        title: `Complete KYC to use ${inText}`,
        message: `RBI rules require KYC before you can use ${inText}. It takes about 2 minutes.`,
        actionTitle: 'Start KYC',
      };
  }
}

function Locked({
  feature,
  fallback,
}: {
  feature: GatedFeature;
  fallback: KycStatus;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  // The live status, so an approval unlocks the feature without restarting.
  const kyc = useKyc();
  useRefreshOnFocus(kyc.refetch);
  const current: Pick<KycRead, 'status' | 'rejection_message'> = kyc.data ?? {
    status: fallback,
    rejection_message: null,
  };
  if (current.status === 'verified') {
    // Just approved: useKyc updates the store, and the gate re-renders with the feature.
    return null;
  }
  const copy = lockedCopy(feature, current.status, current.rejection_message);
  return (
    <Screen testID="kyc-gate">
      <EmptyState {...copy} onAction={() => navigation.navigate('Kyc')} />
    </Screen>
  );
}

/**
 * Shows `children` only to KYC-verified users; everyone else sees why the feature is
 * locked and a way to their next KYC step. The backend enforces the same rule.
 */
export function KycGate({
  feature,
  children,
}: {
  feature: GatedFeature;
  children: React.ReactNode;
}) {
  const status = useAppSelector(s => s.auth.user?.kyc_status);
  if (status === 'verified') {
    return <>{children}</>;
  }
  return <Locked feature={feature} fallback={status ?? 'not_submitted'} />;
}

/** Wraps a screen in a KycGate (use at module level, not inside render). */
export function withKycGate<P extends object>(
  ScreenComponent: React.ComponentType<P>,
  feature: GatedFeature,
) {
  function Gated(props: P) {
    return (
      <KycGate feature={feature}>
        <ScreenComponent {...props} />
      </KycGate>
    );
  }
  Gated.displayName = `KycGated(${
    ScreenComponent.displayName ?? ScreenComponent.name
  })`;
  return Gated;
}
