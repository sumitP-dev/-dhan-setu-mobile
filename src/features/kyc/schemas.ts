import { z } from 'zod';

/**
 * Mirrors the backend's PAN rules (app/modules/kyc/provider/base.py); the backend
 * still checks everything, including with the Income Tax Department.
 */
const PAN = /^[A-Z]{3}[ABCFGHJLPT][A-Z][0-9]{4}[A-Z]$/;

/** "abcpe 1234f" -> "ABCPE1234F" */
export const normalizePan = (value: string) =>
  value.replace(/\s/g, '').toUpperCase();

export const panSchema = z
  .string()
  .transform(normalizePan)
  .pipe(
    z
      .string()
      .min(1, { message: 'Enter your PAN', abort: true })
      .regex(PAN, {
        message: 'Enter a valid PAN, like ABCPE1234F',
        abort: true,
      })
      .refine(v => v[3] === 'P', 'Use your personal PAN (the 4th letter is P)'),
  );

export const panFormSchema = z.object({ pan: panSchema });

export type PanFormInput = z.input<typeof panFormSchema>;
export type PanFormValues = z.output<typeof panFormSchema>;
