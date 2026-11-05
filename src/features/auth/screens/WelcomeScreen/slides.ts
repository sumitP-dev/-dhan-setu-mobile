import type { IconName } from '../../../../components';

export type Slide = {
  key: string;
  /** Optional big heading above the art: `lead` in dark text, `highlight` in brand blue. */
  heading?: { lead: string; highlight: string };
  title: string;
  body: string;
  /** 'mascot' plays the astronaut animation; otherwise a main icon with two small badges. */
  art: 'mascot' | { main: IconName; badges: [IconName, IconName] };
};

export const SLIDES: Slide[] = [
  {
    key: 'welcome',
    heading: { lead: 'Welcome to', highlight: 'Dhan Setu' },
    title: 'Payments, made simple',
    body: 'Cards, UPI and bills in one secure app.',
    art: 'mascot',
  },
  {
    key: 'pay',
    title: 'Pay by card or UPI',
    body: 'Use your saved credit and debit cards, or send money to any UPI ID in seconds.',
    art: {
      main: 'credit-card-outline',
      badges: ['lightning-bolt', 'swap-horizontal'],
    },
  },
  {
    key: 'bills',
    title: 'Bills, sorted and secure',
    body: 'Pay electricity, mobile, DTH and more. Your card details are never stored on our servers.',
    art: {
      main: 'receipt-text-outline',
      badges: ['shield-check-outline', 'lock-outline'],
    },
  },
];
