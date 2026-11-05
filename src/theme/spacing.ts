/** 4-point spacing scale. Use these for every margin, padding and gap. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Standard heights so buttons and inputs line up across screens. */
export const sizes = {
  buttonSm: 40,
  buttonMd: 48,
  buttonLg: 56,
  input: 52,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  touchTarget: 44,
} as const;

export type SpacingName = keyof typeof spacing;
