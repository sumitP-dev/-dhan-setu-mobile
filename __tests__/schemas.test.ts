import {
  identifierSchema,
  loginSchema,
  newPasswordSchema,
  normalizeIndianMobile,
  otpCodeSchema,
  registerSchema,
} from '../src/features/auth/schemas';

describe('normalizeIndianMobile (same rules as the backend)', () => {
  it.each([
    '9876543210',
    '+91 98765 43210',
    '919876543210',
    '09876543210',
    '98765-43210',
  ])('accepts %s', input =>
    expect(normalizeIndianMobile(input)).toBe('9876543210'),
  );

  it.each(['12345', '5876543210', '98765432101', 'abcdefghij', ''])(
    'rejects %s',
    input => expect(normalizeIndianMobile(input)).toBeNull(),
  );
});

describe('identifier', () => {
  it('lower-cases emails and normalises phones', () => {
    expect(identifierSchema.parse(' Asha@Example.com ')).toBe(
      'asha@example.com',
    );
    expect(identifierSchema.parse('+91 98765 43210')).toBe('9876543210');
  });

  it('rejects anything else', () => {
    expect(identifierSchema.safeParse('asha@').success).toBe(false);
    expect(identifierSchema.safeParse('12345').success).toBe(false);
  });
});

describe('new password', () => {
  it.each([
    ['Secret123', true],
    ['short1', false],
    ['password', false],
    ['12345678', false],
    ['पासवर्ड123', true], // letters in any script count
    ['a1' + 'é'.repeat(36), false], // 74 bytes in UTF-8: over bcrypt's 72-byte limit
  ])('%s -> valid: %s', (password, valid) => {
    expect(newPasswordSchema.safeParse(password).success).toBe(valid);
  });
});

it('otp must be exactly 6 digits', () => {
  expect(otpCodeSchema.safeParse('123456').success).toBe(true);
  for (const bad of ['12345', '1234567', '12345a', '']) {
    expect(otpCodeSchema.safeParse(bad).success).toBe(false);
  }
});

it('register form output matches what the API expects', () => {
  const values = registerSchema.parse({
    full_name: '  Asha Verma ',
    email: 'Asha@Example.com',
    phone: '+91 98765 43210',
    password: 'Secret123',
  });
  expect(values).toEqual({
    full_name: 'Asha Verma',
    email: 'asha@example.com',
    phone: '9876543210',
    password: 'Secret123',
  });
});

it('login requires both fields', () => {
  const result = loginSchema.safeParse({ identifier: '', password: '' });
  expect(result.success).toBe(false);
  expect(result.error?.issues.map(i => i.path[0])).toEqual([
    'identifier',
    'password',
  ]);
});

it('an empty required field reports one problem, not two', () => {
  const result = registerSchema.safeParse({
    full_name: '',
    email: '',
    phone: '',
    password: 'Secret123',
  });
  expect(result.error?.issues.map(i => [i.path[0], i.message])).toEqual([
    ['full_name', 'Enter your full name'],
    ['email', 'Enter your email'],
    ['phone', 'Enter your mobile number'],
  ]);
});
