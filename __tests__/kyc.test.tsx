import React from 'react';
import {
  act,
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from '@testing-library/react-native';

import App from '../App';
import type { KycRead, User } from '../src/api/types';
import * as authApi from '../src/features/auth/api';
import * as kycApi from '../src/features/kyc/api';
import { navigationRef } from '../src/navigation';
import { kycPromptStorage } from '../src/services/kycPromptStorage';
import { onboardingStorage } from '../src/services/onboardingStorage';
import { tokenStorage } from '../src/services/tokenStorage';
import { reset, store } from '../src/store';
import { queryClient } from '../src/api/queryClient';

jest.mock('../src/features/auth/api', () => ({
  getMe: jest.fn(),
  logout: jest.fn(),
}));
jest.mock('../src/features/kyc/api', () => ({ getKyc: jest.fn() }));
const getMe = jest.mocked(authApi).getMe;
const getKyc = jest.mocked(kycApi).getKyc;

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

const DETAILS: NonNullable<KycRead['details']> = {
  name: 'ASHA VERMA',
  date_of_birth: '1994-05-17',
  birth_year: 1994,
  gender: 'F',
  address: 'Pune',
  aadhaar: 'XXXX XXXX 1234',
  pan: null,
  pan_verified: false,
  pan_issue: null,
  pan_issue_message: null,
  selfie_verified: false,
  fetched_at: '2026-11-12T08:50:00Z',
};

const currentRoute = () => navigationRef.getCurrentRoute()?.name;
const inScreen = (testID: string) => within(screen.getByTestId(testID));

async function launch(user: User, kyc: KycRead = NOT_STARTED) {
  await tokenStorage.setTokens({
    accessToken: 'access',
    refreshToken: 'refresh',
  });
  await onboardingStorage.markDone();
  getMe.mockResolvedValue(user);
  getKyc.mockResolvedValue(kyc);
  await render(<App />);
}

/** Launch again, as after closing and reopening the app. */
async function relaunch(user: User, kyc?: KycRead) {
  screen.unmount();
  store.dispatch(reset());
  queryClient.clear();
  await launch(user, kyc);
}

beforeEach(async () => {
  jest.clearAllMocks();
  await tokenStorage.clear();
  await onboardingStorage.reset();
  await kycPromptStorage.reset(USER.id);
  store.dispatch(reset());
  queryClient.clear();
});

describe('KYC intro after sign-up', () => {
  it('opens first for someone who hasn’t started KYC; Skip goes Home and it doesn’t come back', async () => {
    const user = userEvent.setup();
    await launch(USER);

    expect(await screen.findByTestId('kyc-intro-screen')).toBeOnTheScreen();
    expect(
      screen.getByRole('header', { name: 'Verify your identity' }),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Skip for now' }));

    expect(await screen.findByTestId('home-screen')).toBeOnTheScreen();
    expect(navigationRef.canGoBack()).toBe(false);
    // Skipped KYC is still offered on Home.
    expect(
      await inScreen('home-screen').findByText('Complete your KYC'),
    ).toBeOnTheScreen();

    await relaunch(USER);
    expect(await screen.findByTestId('home-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('kyc-intro-screen')).toBeNull();
  });

  it('Verify now opens KYC, and back goes Home (not the intro)', async () => {
    const user = userEvent.setup();
    await launch(USER);
    await screen.findByTestId('kyc-intro-screen');

    await user.press(screen.getByRole('button', { name: 'Verify now' }));

    expect(await screen.findByTestId('kyc-screen')).toBeOnTheScreen();
    expect(currentRoute()).toBe('Kyc');
    await act(() => navigationRef.goBack());
    expect(currentRoute()).toBe('Home');
    expect(navigationRef.canGoBack()).toBe(false);
  });

  it('isn’t shown to someone who has already started KYC', async () => {
    await launch(
      { ...USER, kyc_status: 'in_progress' },
      {
        ...NOT_STARTED,
        status: 'in_progress',
        next_step: 'pan',
        details: DETAILS,
      },
    );
    expect(await screen.findByTestId('home-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('kyc-intro-screen')).toBeNull();
  });
});

describe('KYC status', () => {
  beforeEach(async () => {
    await kycPromptStorage.markSeen(USER.id);
  });

  it('Home banner opens the KYC screen with the three steps', async () => {
    const user = userEvent.setup();
    await launch(USER);

    await user.press(await screen.findByTestId('kyc-banner'));

    const kyc = await screen.findByTestId('kyc-screen');
    expect(
      within(kyc).getByLabelText('Step 1, Aadhaar from DigiLocker: Next'),
    ).toBeOnTheScreen();
    expect(within(kyc).getByLabelText('Step 2, PAN: To do')).toBeOnTheScreen();
    expect(
      within(kyc).getByLabelText('Step 3, Live selfie: To do'),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Start KYC' }));
    expect(
      await screen.findByTestId('kyc-digilocker-screen'),
    ).toBeOnTheScreen();
    expect(currentRoute()).toBe('KycDigiLocker');
  });

  it('part-way through: done steps are ticked and the button continues', async () => {
    const user = userEvent.setup();
    await launch(
      { ...USER, kyc_status: 'in_progress' },
      {
        ...NOT_STARTED,
        status: 'in_progress',
        next_step: 'selfie',
        details: { ...DETAILS, pan: 'ABCXX1234F', pan_verified: true },
      },
    );

    expect(
      await inScreen('home-screen').findByText('Finish your KYC'),
    ).toBeOnTheScreen();
    await user.press(screen.getByTestId('kyc-banner'));

    const kyc = await screen.findByTestId('kyc-screen');
    expect(
      within(kyc).getByLabelText('Step 1, Aadhaar from DigiLocker: Done'),
    ).toBeOnTheScreen();
    expect(within(kyc).getByLabelText('Step 2, PAN: Done')).toBeOnTheScreen();
    expect(
      within(kyc).getByLabelText('Step 3, Live selfie: Next'),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeOnTheScreen();
  });

  it('under review: says so, with nothing to do', async () => {
    const user = userEvent.setup();
    await launch(
      { ...USER, kyc_status: 'pending_review' },
      {
        ...NOT_STARTED,
        status: 'pending_review',
        can_start: false,
        next_step: null,
        details: { ...DETAILS, pan_verified: true, selfie_verified: true },
      },
    );

    await user.press(await screen.findByTestId('kyc-banner'));

    const kyc = await screen.findByTestId('kyc-screen');
    expect(
      within(kyc).getByRole('header', { name: 'KYC under review' }),
    ).toBeOnTheScreen();
    expect(
      within(kyc).getByLabelText('Step 3, Live selfie: Done'),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /Start|Continue/ })).toBeNull();
  });

  it('rejected: shows the reason and lets them start again', async () => {
    const user = userEvent.setup();
    const message =
      'The name on your documents doesn’t match your account. Start KYC again.';
    await launch(
      { ...USER, kyc_status: 'rejected' },
      {
        ...NOT_STARTED,
        status: 'rejected',
        rejection_reason: 'name_mismatch',
        rejection_message: message,
      },
    );

    expect(await inScreen('home-screen').findByText(message)).toBeOnTheScreen();
    await user.press(screen.getByTestId('kyc-banner'));
    expect(await inScreen('kyc-screen').findByText(message)).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Start again' }),
    ).toBeOnTheScreen();
  });

  it('verified: no banner, and no need to ask the server', async () => {
    await launch({ ...USER, kyc_status: 'verified' });
    await screen.findByTestId('home-screen');
    expect(screen.queryByTestId('kyc-banner')).toBeNull();
    expect(getKyc).not.toHaveBeenCalled();
  });

  it('an approval on the server updates the app (banner gone, Profile says Verified)', async () => {
    const user = userEvent.setup();
    await launch(
      { ...USER, kyc_status: 'pending_review' },
      { ...NOT_STARTED, status: 'verified', can_start: false, next_step: null },
    );
    await screen.findByTestId('home-screen');

    await waitFor(() => expect(screen.queryByTestId('kyc-banner')).toBeNull());
    expect(store.getState().auth.user?.kyc_status).toBe('verified');

    await user.press(screen.getByRole('button', { name: 'Open profile' }));
    const row = await screen.findByTestId('profile-kyc');
    expect(within(row).getByText('Verified')).toBeOnTheScreen();
  });

  it('Profile shows the KYC status and opens the KYC screen', async () => {
    const user = userEvent.setup();
    await launch(USER);
    await user.press(
      await screen.findByRole('button', { name: 'Open profile' }),
    );

    const row = await screen.findByTestId('profile-kyc');
    expect(within(row).getByText('Not submitted')).toBeOnTheScreen();
    await user.press(row);
    expect(await screen.findByTestId('kyc-screen')).toBeOnTheScreen();
  });

  it('a failed load explains and can retry', async () => {
    const user = userEvent.setup();
    await launch(USER);
    await screen.findByTestId('home-screen');
    getKyc.mockRejectedValue(
      Object.assign(new Error('down'), {
        isAxiosError: true,
        response: {
          status: 503,
          data: {
            error: { code: 'unavailable', message: 'Try again shortly.' },
          },
        },
      }),
    );
    queryClient.removeQueries({ queryKey: ['kyc'] });

    await act(() => navigationRef.navigate('Kyc'));

    // A server error is retried once (after a second) before the screen gives up.
    expect(
      await screen.findByText('Couldn’t load your KYC', {}, { timeout: 4000 }),
    ).toBeOnTheScreen();
    expect(screen.getByText('Try again shortly.')).toBeOnTheScreen();

    getKyc.mockResolvedValue(NOT_STARTED);
    await user.press(screen.getByRole('button', { name: 'Try again' }));
    expect(
      await inScreen('kyc-screen').findByRole('header', {
        name: 'Complete your KYC',
      }),
    ).toBeOnTheScreen();
  });
});
