import { getApiError } from '../src/utils/apiError';
import {
  firstName,
  formatPaise,
  formatPhone,
  greeting,
} from '../src/utils/format';
import { formatCountdown } from '../src/utils/useCountdown';

describe('formatPaise', () => {
  it('formats integer paise as rupees with Indian grouping', () => {
    expect(formatPaise(123456)).toBe('₹1,234.56');
    expect(formatPaise(1234567890)).toBe('₹1,23,45,678.90');
    expect(formatPaise(0)).toBe('₹0.00');
  });
});

it('formatPhone', () => {
  expect(formatPhone('+919876543210')).toBe('+91 98765 43210');
  expect(formatPhone('9876543210')).toBe('+91 98765 43210');
  expect(formatPhone('123')).toBe('123');
});

it('firstName and greeting', () => {
  expect(firstName('  Asha  Verma ')).toBe('Asha');
  expect(greeting(new Date(2026, 0, 1, 9))).toBe('Good morning');
  expect(greeting(new Date(2026, 0, 1, 14))).toBe('Good afternoon');
  expect(greeting(new Date(2026, 0, 1, 20))).toBe('Good evening');
});

it('formatCountdown', () => {
  expect(formatCountdown(30)).toBe('0:30');
  expect(formatCountdown(75)).toBe('1:15');
});

describe('getApiError', () => {
  const axiosError = (response?: object) =>
    Object.assign(new Error('x'), { isAxiosError: true, response });

  it('reads the backend error shape', () => {
    const error = axiosError({
      status: 401,
      data: {
        error: {
          code: 'invalid_credentials',
          message: 'Invalid email/mobile or password',
        },
      },
    });
    expect(getApiError(error)).toEqual({
      code: 'invalid_credentials',
      message: 'Invalid email/mobile or password',
      status: 401,
    });
  });

  it('explains network failures', () => {
    const error = getApiError(axiosError());
    expect(error.code).toBe('network_error');
    expect(error.status).toBeUndefined();
  });

  it('never leaks unexpected payloads', () => {
    expect(
      getApiError(axiosError({ status: 500, data: '<html>' })),
    ).toMatchObject({
      code: 'unknown_error',
      status: 500,
    });
    expect(getApiError(new TypeError('boom')).code).toBe('unknown_error');
  });
});
