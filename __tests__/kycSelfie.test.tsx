import React from 'react';
import {
  act,
  render,
  renderHook,
  screen,
  userEvent,
  within,
} from '@testing-library/react-native';

import App from '../App';
import { apiClient } from '../src/api/client';
import { queryClient } from '../src/api/queryClient';
import type {
  KycDetails,
  KycRead,
  SelfieSessionStart,
  User,
} from '../src/api/types';
import * as authApi from '../src/features/auth/api';
import * as kycApi from '../src/features/kyc/api';
import {
  SelfieSdkUnavailableError,
  useSelfieSdk,
} from '../src/features/kyc/selfieSdk';
import { navigationRef } from '../src/navigation';
import { kycPromptStorage } from '../src/services/kycPromptStorage';
import { onboardingStorage } from '../src/services/onboardingStorage';
import { tokenStorage } from '../src/services/tokenStorage';
import { reset, store } from '../src/store';

jest.mock('../src/features/auth/api', () => ({
  getMe: jest.fn(),
  logout: jest.fn(),
}));
jest.mock('../src/features/kyc/api', () => ({
  getKyc: jest.fn(),
  startSelfie: jest.fn(),
  getSelfie: jest.fn(),
  submitKyc: jest.fn(),
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
  kyc_status: 'in_progress',
  created_at: '2026-10-31T10:00:00Z',
};

const DETAILS: KycDetails = {
  name: 'Asha Verma',
  date_of_birth: '1994-05-17',
  birth_year: 1994,
  gender: 'F',
  address: '12 MG Road, Bengaluru',
  aadhaar: 'XXXX XXXX 1234',
  pan: 'ABCXX1234F',
  pan_verified: true,
  pan_issue: null,
  pan_issue_message: null,
  selfie_verified: false,
  fetched_at: '2026-11-14T08:50:00Z',
};

const SELFIE_NEXT: KycRead = {
  status: 'in_progress',
  can_start: true,
  next_step: 'selfie',
  details: DETAILS,
  rejection_reason: null,
  rejection_message: null,
};
const SUBMIT_NEXT: KycRead = {
  ...SELFIE_NEXT,
  next_step: 'submit',
  details: { ...DETAILS, selfie_verified: true },
};
const UNDER_REVIEW: KycRead = {
  ...SUBMIT_NEXT,
  status: 'pending_review',
  can_start: false,
  next_step: null,
};

const SELFIE: SelfieSessionStart = {
  id: 'a9d1c4e2-0000-4000-8000-000000000002',
  status: 'pending',
  failure_reason: null,
  failure_message: null,
  expires_at: '2026-11-14T09:15:00Z',
  sdk_token: 'tok_0123456789abcdef',
};

function apiError(status: number, code: string, message: string) {
  return Object.assign(new Error(message), {
    isAxiosError: true,
    response: { status, data: { error: { code, message } } },
  });
}

const routeNames = () =>
  navigationRef.getRootState()?.routes.map(route => route.name);

let devPost: jest.SpyInstance;

async function openSelfie(kyc: KycRead = SELFIE_NEXT) {
  const user = userEvent.setup();
  await tokenStorage.setTokens({
    accessToken: 'access',
    refreshToken: 'refresh',
  });
  await onboardingStorage.markDone();
  await kycPromptStorage.markSeen(USER.id);
  getMe.mockResolvedValue(USER);
  api.getKyc.mockResolvedValue(kyc);
  await render(<App />);
  await screen.findByTestId('home-screen');
  await act(() => navigationRef.navigate('Kyc'));
  await screen.findByTestId('kyc-screen');
  await user.press(screen.getByRole('button', { name: 'Continue' }));
  await screen.findByTestId('kyc-selfie-screen');
  return user;
}

/** Take selfie, then pick an outcome in the development stand-in for the SDK. */
async function takeSelfie(
  user: ReturnType<typeof userEvent.setup>,
  choice: string,
) {
  api.startSelfie.mockResolvedValue(SELFIE);
  await user.press(
    screen.getByRole('button', { name: /Take selfie|Try again/ }),
  );
  const sheet = await screen.findByTestId('dev-selfie-sheet');
  await user.press(within(sheet).getByRole('button', { name: choice }));
}

beforeEach(async () => {
  jest.clearAllMocks();
  devPost = jest.spyOn(apiClient, 'post').mockResolvedValue({ data: null });
  await tokenStorage.clear();
  await onboardingStorage.reset();
  store.dispatch(reset());
  queryClient.clear();
});

afterEach(() => {
  devPost.mockRestore();
});

describe('selfie', () => {
  it('passes, then review and submit puts the KYC under review', async () => {
    const user = await openSelfie();
    expect(
      screen.getByRole('header', { name: 'Take a live selfie' }),
    ).toBeOnTheScreen();

    api.getSelfie.mockResolvedValue({ ...SELFIE, status: 'completed' });
    api.getKyc.mockResolvedValue(SUBMIT_NEXT);
    await takeSelfie(user, 'Live selfie that matches');

    // The stand-in tells the fake provider; the app then asks the server.
    expect(devPost).toHaveBeenCalledWith(
      `/kyc/dev/selfie/${SELFIE.sdk_token}`,
      undefined,
      { params: { outcome: 'pass' } },
    );
    const review = await screen.findByTestId('kyc-review-screen');
    expect(api.getSelfie).toHaveBeenCalledWith(SELFIE.id);
    expect(routeNames()).toEqual(['Home', 'Kyc', 'KycReview']);
    expect(
      within(review).getByLabelText(
        'Live selfie: done. Matches your Aadhaar photo',
      ),
    ).toBeOnTheScreen();

    // Nothing is sent until they confirm.
    const submit = screen.getByRole('button', { name: 'Submit for review' });
    expect(submit).toBeDisabled();
    await user.press(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).toBeChecked();

    api.submitKyc.mockResolvedValue(UNDER_REVIEW);
    api.getKyc.mockResolvedValue(UNDER_REVIEW);
    await user.press(screen.getByRole('button', { name: 'Submit for review' }));

    expect(
      await screen.findByRole('header', { name: 'KYC under review' }),
    ).toBeOnTheScreen();
    expect(routeNames()).toEqual(['Home', 'Kyc']);
    expect(store.getState().auth.user?.kyc_status).toBe('pending_review');
  });

  it('a failed check explains why and offers to try again', async () => {
    const user = await openSelfie();
    const message = 'Your selfie doesn’t match your Aadhaar photo. Try again.';
    api.getSelfie.mockResolvedValue({
      ...SELFIE,
      status: 'failed',
      failure_reason: 'face_mismatch',
      failure_message: message,
    });

    await takeSelfie(user, 'Doesn’t match the Aadhaar photo');

    expect(await screen.findByText(message)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeOnTheScreen();
    expect(devPost).toHaveBeenCalledWith(expect.any(String), undefined, {
      params: { outcome: 'low_match' },
    });
  });

  it('cancelling the SDK goes back without checking', async () => {
    const user = await openSelfie();
    api.startSelfie.mockResolvedValue(SELFIE);
    await user.press(screen.getByRole('button', { name: 'Take selfie' }));
    const sheet = await screen.findByTestId('dev-selfie-sheet');

    await user.press(within(sheet).getByRole('button', { name: 'Cancel' }));

    expect(
      await screen.findByRole('button', { name: 'Take selfie' }),
    ).toBeOnTheScreen();
    expect(api.getSelfie).not.toHaveBeenCalled();
    expect(devPost).not.toHaveBeenCalled();
  });

  it('waits while the provider is still working', async () => {
    const user = await openSelfie();
    api.getSelfie
      .mockResolvedValueOnce(SELFIE)
      .mockResolvedValue({ ...SELFIE, status: 'completed' });
    api.getKyc.mockResolvedValue(SUBMIT_NEXT);

    await takeSelfie(user, 'Live selfie that matches');

    expect(
      await screen.findByTestId('kyc-review-screen', {}, { timeout: 3000 }),
    ).toBeOnTheScreen();
    expect(api.getSelfie).toHaveBeenCalledTimes(2);
  });

  it('after a few checks it lets them check again', async () => {
    const user = await openSelfie();
    api.getSelfie.mockResolvedValue(SELFIE);

    await takeSelfie(user, 'Live selfie that matches');

    expect(
      await screen.findByRole(
        'header',
        { name: 'Still checking' },
        { timeout: 4000 },
      ),
    ).toBeOnTheScreen();
    expect(api.getSelfie).toHaveBeenCalledTimes(3);

    api.getSelfie.mockResolvedValue({ ...SELFIE, status: 'completed' });
    api.getKyc.mockResolvedValue(SUBMIT_NEXT);
    await user.press(screen.getByRole('button', { name: 'Check again' }));
    expect(await screen.findByTestId('kyc-review-screen')).toBeOnTheScreen();
  });

  it('shows the attempt limit', async () => {
    const user = await openSelfie();
    api.startSelfie.mockRejectedValue(
      apiError(
        429,
        'selfie_attempt_limit',
        'Too many selfie attempts today. Try again tomorrow.',
      ),
    );

    await user.press(screen.getByRole('button', { name: 'Take selfie' }));

    expect(
      await screen.findByText(
        'Too many selfie attempts today. Try again tomorrow.',
      ),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('dev-selfie-sheet')).toBeNull();
  });

  it('release builds say the selfie isn’t available until the SDK is added', async () => {
    const { result } = await renderHook(() =>
      useSelfieSdk({ devStandIn: false }),
    );
    expect(result.current.sheet).toBeNull();
    await expect(result.current.run('tok')).rejects.toBeInstanceOf(
      SelfieSdkUnavailableError,
    );
  });
});

describe('submit', () => {
  it('a server refusal is shown', async () => {
    const user = userEvent.setup();
    await tokenStorage.setTokens({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    await onboardingStorage.markDone();
    await kycPromptStorage.markSeen(USER.id);
    getMe.mockResolvedValue(USER);
    api.getKyc.mockResolvedValue(SUBMIT_NEXT);
    await render(<App />);
    await screen.findByTestId('home-screen');
    await act(() => navigationRef.navigate('Kyc'));
    await user.press(
      await screen.findByRole('button', { name: 'Review and submit' }),
    );
    await screen.findByTestId('kyc-review-screen');
    api.submitKyc.mockRejectedValue(
      apiError(409, 'kyc_incomplete', 'Finish every KYC step first.'),
    );

    await user.press(screen.getByRole('checkbox'));
    await user.press(screen.getByRole('button', { name: 'Submit for review' }));

    expect(
      await screen.findByText('Finish every KYC step first.'),
    ).toBeOnTheScreen();
  });
});
