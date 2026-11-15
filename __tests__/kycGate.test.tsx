import React from 'react';
import {
  act,
  render,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native';

import App from '../App';
import { queryClient } from '../src/api/queryClient';
import type { KycRead, KycStatus, User } from '../src/api/types';
import * as authApi from '../src/features/auth/api';
import * as kycApi from '../src/features/kyc/api';
import { navigationRef } from '../src/navigation';
import { kycPromptStorage } from '../src/services/kycPromptStorage';
import { onboardingStorage } from '../src/services/onboardingStorage';
import { tokenStorage } from '../src/services/tokenStorage';
import { reset, store } from '../src/store';

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

const kycOf = (status: KycStatus, extra: Partial<KycRead> = {}): KycRead => ({
  status,
  can_start: status !== 'pending_review' && status !== 'verified',
  next_step: status === 'not_submitted' ? 'digilocker' : null,
  details: null,
  rejection_reason: null,
  rejection_message: null,
  ...extra,
});

const currentRoute = () => navigationRef.getCurrentRoute()?.name;

async function launch(status: KycStatus, kyc: KycRead = kycOf(status)) {
  await tokenStorage.setTokens({
    accessToken: 'access',
    refreshToken: 'refresh',
  });
  await onboardingStorage.markDone();
  await kycPromptStorage.markSeen(USER.id);
  getMe.mockResolvedValue({ ...USER, kyc_status: status });
  getKyc.mockResolvedValue(kyc);
  await render(<App />);
  await screen.findByTestId('home-screen');
}

beforeEach(async () => {
  jest.clearAllMocks();
  await tokenStorage.clear();
  await onboardingStorage.reset();
  await kycPromptStorage.reset(USER.id);
  store.dispatch(reset());
  queryClient.clear();
});

describe('features locked until KYC is verified', () => {
  it.each([
    ['tile-cards', 'cards-screen', 'Complete KYC to use cards'],
    ['tile-upi', 'upi-screen', 'Complete KYC to use UPI'],
    ['tile-bbps', 'bbps-screen', 'Complete KYC to use bill payments'],
  ])(
    '%s explains the lock and leads to KYC',
    async (tile, featureScreen, title) => {
      const user = userEvent.setup();
      await launch('not_submitted');
      expect(screen.getByTestId(`${tile}-lock`)).toBeOnTheScreen();

      await user.press(screen.getByTestId(tile));

      expect(
        await screen.findByRole('header', { name: title }),
      ).toBeOnTheScreen();
      expect(screen.queryByTestId(featureScreen)).toBeNull();

      await user.press(screen.getByRole('button', { name: 'Start KYC' }));
      expect(await screen.findByTestId('kyc-screen')).toBeOnTheScreen();
      expect(currentRoute()).toBe('Kyc');
    },
  );

  it('the tiles say they are locked', async () => {
    await launch('in_progress');
    expect(
      screen.getByLabelText('Cards, locked until KYC is verified'),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Transactions')).toBeOnTheScreen();
    expect(screen.queryByTestId('tile-transactions-lock')).toBeNull();
  });

  it('part-way through: continue KYC', async () => {
    const user = userEvent.setup();
    await launch('in_progress');
    await user.press(screen.getByTestId('tile-upi'));
    expect(
      await screen.findByRole('header', { name: 'Finish KYC to use UPI' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Continue KYC' }),
    ).toBeOnTheScreen();
  });

  it('under review: says when it unlocks', async () => {
    const user = userEvent.setup();
    await launch('pending_review');
    await user.press(screen.getByTestId('tile-cards'));
    expect(
      await screen.findByText(
        'Cards will unlock as soon as your KYC is approved, usually in less than a day.',
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'View KYC status' }),
    ).toBeOnTheScreen();
  });

  it('rejected: shows the reason', async () => {
    const user = userEvent.setup();
    const message = 'There was a problem with your documents. Start KYC again.';
    await launch(
      'rejected',
      kycOf('rejected', {
        rejection_reason: 'document_issue',
        rejection_message: message,
      }),
    );
    await user.press(screen.getByTestId('tile-bbps'));
    expect(await screen.findByText(message)).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Start again' }),
    ).toBeOnTheScreen();
  });

  it('an approval unlocks the feature without restarting', async () => {
    const user = userEvent.setup();
    await launch('pending_review');
    getKyc.mockResolvedValue(kycOf('verified'));
    queryClient.removeQueries({ queryKey: ['kyc'] });

    await user.press(screen.getByTestId('tile-cards'));

    expect(await screen.findByTestId('cards-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('kyc-gate')).toBeNull();
  });

  it('verified users go straight in, with no locks', async () => {
    const user = userEvent.setup();
    await launch('verified');
    expect(screen.queryByTestId('tile-cards-lock')).toBeNull();

    await user.press(screen.getByTestId('tile-cards'));
    expect(await screen.findByTestId('cards-screen')).toBeOnTheScreen();
  });
});

describe('server says kyc_required', () => {
  it('re-reads the KYC and locks the feature', async () => {
    const { apiClient } =
      jest.requireActual<typeof import('../src/api/client')>(
        '../src/api/client',
      );
    await launch('verified');
    await act(() => navigationRef.navigate('Cards'));
    expect(await screen.findByTestId('cards-screen')).toBeOnTheScreen();

    // e.g. an admin's decision the app hasn't seen yet.
    getKyc.mockResolvedValue(kycOf('rejected'));
    const adapter = apiClient.defaults.adapter;
    apiClient.defaults.adapter = async config => {
      throw Object.assign(new Error('HTTP 403'), {
        isAxiosError: true,
        config,
        response: {
          status: 403,
          statusText: '403',
          headers: {},
          config,
          data: {
            error: {
              code: 'kyc_required',
              message: 'Complete your KYC to use this feature.',
            },
          },
        },
      });
    };
    try {
      await act(async () => {
        await apiClient.get('/cards').catch(() => undefined);
      });
    } finally {
      apiClient.defaults.adapter = adapter;
    }

    await waitFor(() =>
      expect(store.getState().auth.user?.kyc_status).toBe('rejected'),
    );
    expect(
      await screen.findByRole('header', { name: 'KYC not approved' }),
    ).toBeOnTheScreen();
  });
});
