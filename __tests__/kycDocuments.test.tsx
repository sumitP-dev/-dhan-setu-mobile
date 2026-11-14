import React from 'react';
import { Alert, AppState, Linking } from 'react-native';
import {
  act,
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from '@testing-library/react-native';

import App from '../App';
import type {
  DigiLockerSession,
  KycDetails,
  KycRead,
  User,
} from '../src/api/types';
import { queryClient } from '../src/api/queryClient';
import * as authApi from '../src/features/auth/api';
import * as kycApi from '../src/features/kyc/api';
import { normalizePan, panSchema } from '../src/features/kyc/schemas';
import { isDigiLockerReturn } from '../src/features/kyc/useDigiLockerReturn';
import { navigationRef } from '../src/navigation';
import { kycPromptStorage } from '../src/services/kycPromptStorage';
import { onboardingStorage } from '../src/services/onboardingStorage';
import { tokenStorage } from '../src/services/tokenStorage';
import { reset, store } from '../src/store';
import { formatCalendarDate } from '../src/utils/format';

jest.mock('../src/features/auth/api', () => ({
  getMe: jest.fn(),
  logout: jest.fn(),
}));
jest.mock('../src/features/kyc/api', () => ({
  getKyc: jest.fn(),
  startDigiLocker: jest.fn(),
  getDigiLocker: jest.fn(),
  submitPan: jest.fn(),
}));
const api = jest.mocked(kycApi);
const getMe = jest.mocked(authApi).getMe;

const USER: User = {
  id: 'u1',
  email: 'asha@example.com',
  phone: '+919876543210',
  full_name: 'Asha Verma',
  role: 'customer',
  status: 'active',
  kyc_status: 'not_submitted',
  created_at: '2026-10-31T10:00:00Z',
};

const NOT_STARTED: KycRead = {
  status: 'not_submitted',
  can_start: true,
  next_step: 'digilocker',
  details: null,
  rejection_reason: null,
  rejection_message: null,
};

const DETAILS: KycDetails = {
  name: 'Asha Verma',
  date_of_birth: '1994-05-17',
  birth_year: 1994,
  gender: 'F',
  address: '12 MG Road, Bengaluru, Karnataka 560001',
  aadhaar: 'XXXX XXXX 1234',
  pan: 'ABCXX1234F',
  pan_verified: true,
  pan_issue: null,
  pan_issue_message: null,
  selfie_verified: false,
  fetched_at: '2026-11-14T08:50:00Z',
};

const PAN_MISSING: KycDetails = {
  ...DETAILS,
  pan: null,
  pan_verified: false,
  pan_issue: 'pan_not_in_digilocker',
  pan_issue_message:
    'Your PAN isn’t in DigiLocker. Enter your PAN to continue.',
};

const inProgress = (details: KycDetails): KycRead => ({
  ...NOT_STARTED,
  status: 'in_progress',
  next_step: details.pan_verified ? 'selfie' : 'pan',
  details,
});

const SESSION: DigiLockerSession = {
  id: 'f2b8c1de-0000-4000-8000-000000000001',
  status: 'pending',
  consent_url: 'https://digilocker.example/consent/dls_abc',
  expires_at: '2026-11-14T09:15:00Z',
  failure_reason: null,
  failure_message: null,
};

function apiError(status: number, code: string, message: string) {
  return Object.assign(new Error(message), {
    isAxiosError: true,
    response: { status, data: { error: { code, message } } },
  });
}

// The app's live listeners, so tests can play "back from DigiLocker".
const urlListeners = new Set<(event: { url: string }) => void>();
const appStateListeners = new Set<(state: string) => void>();

const returnByLink = (url = 'dhansetu://kyc/digilocker?status=completed') =>
  act(async () => {
    urlListeners.forEach(listener => listener({ url }));
  });
const switchBackToApp = () =>
  act(async () => {
    appStateListeners.forEach(listener => listener('background'));
    appStateListeners.forEach(listener => listener('active'));
  });

const currentRoute = () => navigationRef.getCurrentRoute()?.name;
const routeNames = () =>
  navigationRef.getRootState()?.routes.map(route => route.name);
const inScreen = (testID: string) => within(screen.getByTestId(testID));

async function openKyc(kyc: KycRead = NOT_STARTED, user: User = USER) {
  await tokenStorage.setTokens({
    accessToken: 'access',
    refreshToken: 'refresh',
  });
  await onboardingStorage.markDone();
  await kycPromptStorage.markSeen(user.id);
  getMe.mockResolvedValue(user);
  api.getKyc.mockResolvedValue(kyc);
  await render(<App />);
  await screen.findByTestId('home-screen');
  await act(() => navigationRef.navigate('Kyc'));
  await screen.findByTestId('kyc-screen');
}

async function startDigiLocker() {
  const user = userEvent.setup();
  await openKyc();
  await user.press(screen.getByRole('button', { name: 'Start KYC' }));
  await screen.findByTestId('kyc-digilocker-screen');
  api.startDigiLocker.mockResolvedValue(SESSION);
  await user.press(
    screen.getByRole('button', { name: 'Continue to DigiLocker' }),
  );
  expect(
    await screen.findByRole('header', { name: 'Finish in DigiLocker' }),
  ).toBeOnTheScreen();
  return user;
}

beforeEach(async () => {
  jest.clearAllMocks();
  urlListeners.clear();
  appStateListeners.clear();
  jest.mocked(Linking.addEventListener).mockImplementation(((
    type: string,
    listener: (event: { url: string }) => void,
  ) => {
    if (type === 'url') {
      urlListeners.add(listener);
    }
    return { remove: () => urlListeners.delete(listener) };
  }) as never);
  jest.mocked(AppState.addEventListener).mockImplementation(((
    type: string,
    listener: (state: string) => void,
  ) => {
    if (type === 'change') {
      appStateListeners.add(listener);
    }
    return { remove: () => appStateListeners.delete(listener) };
  }) as never);
  jest.mocked(Linking.openURL).mockResolvedValue(undefined);
  await tokenStorage.clear();
  await onboardingStorage.reset();
  await kycPromptStorage.reset(USER.id);
  store.dispatch(reset());
  queryClient.clear();
});

describe('DigiLocker', () => {
  it('explains what is shared, opens DigiLocker, and on return shows the details', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();
    await openKyc();
    await user.press(screen.getByRole('button', { name: 'Start KYC' }));

    const intro = await screen.findByTestId('kyc-digilocker-screen');
    expect(
      within(intro).getByRole('header', { name: 'Aadhaar from DigiLocker' }),
    ).toBeOnTheScreen();
    expect(
      within(intro).getByText('Name, date of birth, gender, address and photo'),
    ).toBeOnTheScreen();

    api.startDigiLocker.mockResolvedValue(SESSION);
    await user.press(
      screen.getByRole('button', { name: 'Continue to DigiLocker' }),
    );
    expect(Linking.openURL).toHaveBeenCalledWith(SESSION.consent_url);
    await screen.findByRole('header', { name: 'Finish in DigiLocker' });

    api.getDigiLocker.mockResolvedValue({ ...SESSION, status: 'completed' });
    api.getKyc.mockResolvedValue(inProgress(DETAILS));
    await returnByLink();

    const details = await screen.findByTestId('kyc-details-screen');
    expect(api.getDigiLocker).toHaveBeenCalledWith(SESSION.id);
    expect(
      within(details).getByLabelText('Name: Asha Verma'),
    ).toBeOnTheScreen();
    expect(
      within(details).getByLabelText('Date of birth: 17 May 1994'),
    ).toBeOnTheScreen();
    expect(
      within(details).getByLabelText('Aadhaar: XXXX XXXX 1234'),
    ).toBeOnTheScreen();
    expect(
      within(details).getByLabelText('PAN: ABCXX1234F  ·  Verified'),
    ).toBeOnTheScreen();
    // DigiLocker is replaced, so back goes to the KYC screen.
    expect(routeNames()).toEqual(['Home', 'Kyc', 'KycDetails']);

    // The selfie step arrives in KM3.
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(alert).toHaveBeenCalledWith('Coming soon', expect.any(String));
  });

  it('trusts the server, not the link: still pending means keep waiting', async () => {
    const user = await startDigiLocker();
    api.getDigiLocker.mockResolvedValue(SESSION);

    await returnByLink('dhansetu://kyc/digilocker?status=completed');
    await waitFor(() => expect(api.getDigiLocker).toHaveBeenCalledTimes(1));
    expect(currentRoute()).toBe('KycDigiLocker');
    // A link-triggered check that's still pending stays quiet.
    expect(screen.queryByTestId('digilocker-note')).toBeNull();

    await user.press(screen.getByRole('button', { name: 'I’ve finished' }));
    expect(
      await screen.findByText(
        'DigiLocker hasn’t finished yet. Allow sharing there, then come back.',
      ),
    ).toBeOnTheScreen();

    await user.press(
      screen.getByRole('button', { name: 'Open DigiLocker again' }),
    );
    expect(Linking.openURL).toHaveBeenCalledTimes(2);
  });

  it('checks when they switch back to the app themselves', async () => {
    await startDigiLocker();
    api.getDigiLocker.mockResolvedValue({ ...SESSION, status: 'completed' });
    api.getKyc.mockResolvedValue(inProgress(DETAILS));

    await switchBackToApp();

    expect(await screen.findByTestId('kyc-details-screen')).toBeOnTheScreen();
  });

  it('ignores other links', async () => {
    await startDigiLocker();
    await returnByLink('dhansetu://kyc/digilockerx?status=completed');
    await returnByLink('https://evil.example/kyc/digilocker');
    expect(api.getDigiLocker).not.toHaveBeenCalled();
  });

  it('a refusal explains and lets them try again', async () => {
    const user = await startDigiLocker();
    api.getDigiLocker.mockResolvedValue({
      ...SESSION,
      status: 'denied',
      failure_reason: 'consent_denied',
      failure_message:
        'You didn’t allow sharing from DigiLocker. Try again to continue.',
    });

    await returnByLink('dhansetu://kyc/digilocker?status=denied');

    expect(
      await inScreen('digilocker-error').findByText(
        'You didn’t allow sharing from DigiLocker. Try again to continue.',
      ),
    ).toBeOnTheScreen();
    api.startDigiLocker.mockResolvedValue({ ...SESSION, id: 'second' });
    await user.press(screen.getByRole('button', { name: 'Try again' }));
    expect(api.startDigiLocker).toHaveBeenCalledTimes(2);
    expect(
      await screen.findByRole('header', { name: 'Finish in DigiLocker' }),
    ).toBeOnTheScreen();
  });

  it('shows why it couldn’t start (e.g. too many attempts)', async () => {
    const user = userEvent.setup();
    await openKyc();
    await user.press(screen.getByRole('button', { name: 'Start KYC' }));
    await screen.findByTestId('kyc-digilocker-screen');
    api.startDigiLocker.mockRejectedValue(
      apiError(
        429,
        'kyc_attempt_limit',
        'Too many attempts today. Try again tomorrow.',
      ),
    );

    await user.press(
      screen.getByRole('button', { name: 'Continue to DigiLocker' }),
    );

    expect(
      await screen.findByText('Too many attempts today. Try again tomorrow.'),
    ).toBeOnTheScreen();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });
});

describe('PAN', () => {
  async function openPan() {
    const user = userEvent.setup();
    await openKyc(inProgress(PAN_MISSING), {
      ...USER,
      kyc_status: 'in_progress',
    });
    await user.press(screen.getByRole('button', { name: 'Continue' }));

    const details = await screen.findByTestId('kyc-details-screen');
    expect(
      within(details).getByText(PAN_MISSING.pan_issue_message as string),
    ).toBeOnTheScreen();
    expect(
      within(details).getByLabelText('PAN: Not added yet'),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Enter PAN' }));
    await screen.findByTestId('kyc-pan-screen');
    return user;
  }

  it('checks the format before sending it', async () => {
    const user = await openPan();

    await user.type(screen.getByTestId('kyc-pan-input'), 'ABC12');
    await user.press(screen.getByRole('button', { name: 'Verify PAN' }));
    expect(
      await screen.findByText('Enter a valid PAN, like ABCPE1234F'),
    ).toBeOnTheScreen();

    await user.clear(screen.getByTestId('kyc-pan-input'));
    await user.type(screen.getByTestId('kyc-pan-input'), 'ABCCE1234F');
    await user.press(screen.getByRole('button', { name: 'Verify PAN' }));
    expect(
      await screen.findByText('Use your personal PAN (the 4th letter is P)'),
    ).toBeOnTheScreen();
    expect(api.submitPan).not.toHaveBeenCalled();
  });

  it('a mismatch is explained; a match returns to the details, verified', async () => {
    const user = await openPan();
    const mismatch = 'The name on your PAN doesn’t match your Aadhaar.';
    api.submitPan.mockResolvedValueOnce(
      inProgress({
        ...PAN_MISSING,
        pan: 'XYZXX9876K',
        pan_issue: 'pan_name_mismatch',
        pan_issue_message: mismatch,
      }),
    );

    await user.type(screen.getByTestId('kyc-pan-input'), 'xyzpk 9876k');
    await user.press(screen.getByRole('button', { name: 'Verify PAN' }));

    expect(api.submitPan).toHaveBeenCalledWith('XYZPK9876K');
    expect(
      await inScreen('kyc-pan-error').findByText(mismatch),
    ).toBeOnTheScreen();
    expect(currentRoute()).toBe('KycPan');

    api.submitPan.mockResolvedValueOnce(inProgress(DETAILS));
    await user.clear(screen.getByTestId('kyc-pan-input'));
    await user.type(screen.getByTestId('kyc-pan-input'), 'ABCPV1234F');
    await user.press(screen.getByRole('button', { name: 'Verify PAN' }));

    const details = await screen.findByTestId('kyc-details-screen');
    expect(
      within(details).getByLabelText('PAN: ABCXX1234F  ·  Verified'),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('kyc-pan-issue')).toBeNull();
    expect(routeNames()).toEqual(['Home', 'Kyc', 'KycDetails']);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeOnTheScreen();
  });

  it('shows the attempt limit', async () => {
    const user = await openPan();
    api.submitPan.mockRejectedValue(
      apiError(
        429,
        'pan_attempt_limit',
        'Too many PAN attempts. Contact support.',
      ),
    );

    await user.type(screen.getByTestId('kyc-pan-input'), 'ABCPV1234F');
    await user.press(screen.getByRole('button', { name: 'Verify PAN' }));

    expect(
      await screen.findByText('Too many PAN attempts. Contact support.'),
    ).toBeOnTheScreen();
  });
});

describe('helpers', () => {
  it('normalises and validates PANs like the backend', () => {
    expect(normalizePan(' abcpe 1234f ')).toBe('ABCPE1234F');
    expect(panSchema.safeParse('abcpe1234f').data).toBe('ABCPE1234F');
    expect(panSchema.safeParse('ABCDE1234F').success).toBe(false); // D isn't a holder type
    expect(panSchema.safeParse('ABCCE1234F').success).toBe(false); // a company
    expect(panSchema.safeParse('ABCPE12345').success).toBe(false);
  });

  it('recognises only the DigiLocker return link', () => {
    expect(isDigiLockerReturn('dhansetu://kyc/digilocker')).toBe(true);
    expect(isDigiLockerReturn('dhansetu://kyc/digilocker?status=denied')).toBe(
      true,
    );
    expect(isDigiLockerReturn('dhansetu://kyc/digilockerx')).toBe(false);
    expect(
      isDigiLockerReturn('https://x.example/dhansetu://kyc/digilocker'),
    ).toBe(false);
  });

  it('formats calendar dates without time zone shifts', () => {
    expect(formatCalendarDate('1994-05-17')).toBe('17 May 1994');
    expect(formatCalendarDate('2000-01-01')).toBe('1 Jan 2000');
    expect(formatCalendarDate('not a date')).toBe('not a date');
  });
});
