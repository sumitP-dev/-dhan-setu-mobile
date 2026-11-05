import { z } from 'zod';

/**
 * Client-side validation. Mirrors the backend's rules (app/common/validators.py) so
 * users see mistakes instantly; the backend still validates everything.
 */

const MOBILE_SEPARATORS = /[\s\-()]/g;
const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PASSWORD_BYTES = 72;

/** "+91 98765 43210", "09876543210", "919876543210" -> "9876543210"; null if invalid. */
export function normalizeIndianMobile(value: string): string | null {
  let digits = value.replace(MOBILE_SEPARATORS, '');
  if (digits.startsWith('+91')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }
  return INDIAN_MOBILE.test(digits) ? digits : null;
}

/** Bytes in UTF-8 (bcrypt on the backend reads at most 72 bytes). */
const utf8Length = (value: string) =>
  encodeURIComponent(value).replace(/%[0-9A-F]{2}/g, '_').length;

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Enter your email', abort: true })
  .regex(EMAIL, 'Enter a valid email')
  .transform(v => v.toLowerCase());

export const mobileSchema = z
  .string()
  .trim()
  .min(1, { message: 'Enter your mobile number', abort: true })
  .refine(
    v => normalizeIndianMobile(v) !== null,
    'Enter a valid 10-digit Indian mobile number',
  )
  .transform(v => normalizeIndianMobile(v) as string);

export const newPasswordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .refine(v => utf8Length(v) <= MAX_PASSWORD_BYTES, 'Password is too long')
  .refine(
    v => /\p{L}/u.test(v) && /\d/.test(v),
    'Include at least one letter and one number',
  );

export const fullNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Enter your full name', abort: true })
  .max(100, 'Name is too long');

export const otpCodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'Enter the 6-digit code');

/** Email or mobile number, normalised like the backend does. */
export const identifierSchema = z
  .string()
  .trim()
  .min(1, { message: 'Enter your email or mobile number', abort: true })
  .refine(
    v => (v.includes('@') ? EMAIL.test(v) : normalizeIndianMobile(v) !== null),
    'Enter a valid email or 10-digit mobile number',
  )
  .transform(v =>
    v.includes('@') ? v.toLowerCase() : (normalizeIndianMobile(v) as string),
  );

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, 'Enter your password'),
});

export const registerSchema = z.object({
  full_name: fullNameSchema,
  email: emailSchema,
  phone: mobileSchema,
  password: newPasswordSchema,
});

export const otpLoginSchema = z.object({ phone: mobileSchema });

export const otpVerifySchema = z.object({ code: otpCodeSchema });

export type LoginFormInput = z.input<typeof loginSchema>;
export type LoginFormValues = z.output<typeof loginSchema>;
export type RegisterFormInput = z.input<typeof registerSchema>;
export type RegisterFormValues = z.output<typeof registerSchema>;
export type OtpLoginFormInput = z.input<typeof otpLoginSchema>;
export type OtpLoginFormValues = z.output<typeof otpLoginSchema>;
