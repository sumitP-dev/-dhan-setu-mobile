import type { ImageSourcePropType } from 'react-native';

/** 3D icons: Microsoft Fluent Emoji, MIT (see src/assets/images/onboarding/LICENSE.md). */
const art3d = {
  card: require('../../../../assets/images/onboarding/card.png'),
  phone: require('../../../../assets/images/onboarding/phone.png'),
  bolt: require('../../../../assets/images/onboarding/bolt.png'),
  receipt: require('../../../../assets/images/onboarding/receipt.png'),
  bulb: require('../../../../assets/images/onboarding/bulb.png'),
  shield: require('../../../../assets/images/onboarding/shield.png'),
} satisfies Record<string, ImageSourcePropType>;

export type Slide = {
  key: string;
  /** Optional big heading above the art: `lead` in dark text, `highlight` in brand blue. */
  heading?: { lead: string; highlight: string };
  title: string;
  body: string;
  /** 'mascot' plays the astronaut; otherwise one big 3D icon with two smaller ones floating around it. */
  art:
    | 'mascot'
    | {
        main: ImageSourcePropType;
        accents: [ImageSourcePropType, ImageSourcePropType];
      };
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
    art: { main: art3d.card, accents: [art3d.phone, art3d.bolt] },
  },
  {
    key: 'bills',
    title: 'Bills, sorted and secure',
    body: 'Pay electricity, mobile, DTH and more. Your card details are never stored on our servers.',
    art: { main: art3d.receipt, accents: [art3d.bulb, art3d.shield] },
  },
];
