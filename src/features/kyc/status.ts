import type { IconBadgeTone, IconName } from '../../components';
import type { KycNextStep, KycRead, KycStatus } from '../../api/types';

/** How each KYC status reads to the user. */
export const KYC_STATUS: Record<
  KycStatus,
  {
    label: string;
    title: string;
    message: string;
    tone: IconBadgeTone;
    icon: IconName;
  }
> = {
  not_submitted: {
    label: 'Not submitted',
    title: 'Complete your KYC',
    message:
      'Verify your identity to use cards, UPI and bill payments. It takes about 2 minutes.',
    tone: 'warning',
    icon: 'card-account-details-outline',
  },
  in_progress: {
    label: 'In progress',
    title: 'Finish your KYC',
    message: 'You’re part-way through. Pick up where you left off.',
    tone: 'warning',
    icon: 'progress-check',
  },
  pending_review: {
    label: 'Pending approval',
    title: 'KYC under review',
    message:
      'We’re checking your details. This usually takes less than a day. You don’t need to do anything.',
    tone: 'info',
    icon: 'clock-outline',
  },
  verified: {
    label: 'Verified',
    title: 'KYC verified',
    message: 'You’re all set to use cards, UPI and bill payments.',
    tone: 'success',
    icon: 'check-decagram',
  },
  rejected: {
    label: 'Not approved',
    title: 'KYC not approved',
    message: 'Your KYC couldn’t be approved. Start again, or contact support.',
    tone: 'danger',
    icon: 'alert-circle-outline',
  },
};

/** The message for a status; a rejection uses the server's reason. */
export function kycMessage(kyc: Pick<KycRead, 'status' | 'rejection_message'>) {
  if (kyc.status === 'rejected' && kyc.rejection_message) {
    return kyc.rejection_message;
  }
  return KYC_STATUS[kyc.status].message;
}

/** The main button on the KYC screen, or null when there is nothing to do. */
export function kycAction(kyc: KycRead): string | null {
  if (!kyc.can_start) {
    return null;
  }
  switch (kyc.status) {
    case 'not_submitted':
      return 'Start KYC';
    case 'rejected':
      return 'Start again';
    case 'in_progress':
      return kyc.next_step === 'submit' ? 'Review and submit' : 'Continue';
    default:
      return null;
  }
}

export type KycStepState = 'done' | 'current' | 'todo';

export type KycStep = {
  key: Exclude<KycNextStep, 'submit'>;
  title: string;
  subtitle: string;
  icon: IconName;
  state: KycStepState;
};

const STEPS: Omit<KycStep, 'state'>[] = [
  {
    key: 'digilocker',
    title: 'Aadhaar from DigiLocker',
    subtitle: 'Share your Aadhaar securely from your DigiLocker account',
    icon: 'card-account-details-outline',
  },
  {
    key: 'pan',
    title: 'PAN',
    subtitle: 'Fetched from DigiLocker, or enter it yourself',
    icon: 'card-text-outline',
  },
  {
    key: 'selfie',
    title: 'Live selfie',
    subtitle: 'A quick selfie to match your Aadhaar photo',
    icon: 'face-recognition',
  },
];

/** The three steps, each done, current (the next one to do) or still to do. */
export function kycSteps(kyc: KycRead): KycStep[] {
  const allDone = kyc.status === 'pending_review' || kyc.status === 'verified';
  const done: Record<KycStep['key'], boolean> = {
    digilocker: allDone || kyc.details !== null,
    pan: allDone || Boolean(kyc.details?.pan_verified),
    selfie: allDone || Boolean(kyc.details?.selfie_verified),
  };
  // A rejection starts over, so nothing is current until they start again.
  const current = kyc.can_start ? kyc.next_step ?? 'digilocker' : null;
  return STEPS.map(step => ({
    ...step,
    state: done[step.key] ? 'done' : step.key === current ? 'current' : 'todo',
  }));
}
