import React from 'react';
import { Text } from 'react-native';
import { act, screen } from '@testing-library/react-native';

import type { TokenPair, User } from '../src/api/types';
import * as authApi from '../src/features/auth/api';
import { onboardingStorage } from '../src/services/onboardingStorage';
import { tokenStorage } from '../src/services/tokenStorage';
import {
  bootstrap,
  logout,
  reset,
  setSession,
  setupStore,
  signedIn,
  useAppSelector,
} from '../src/store';
import { renderWithProviders } from '../testing/renderWithProviders';

jest.mock('../src/features/auth/api', () => ({
  getMe: jest.fn(),
  logout: jest.fn(),
}));
const api = jest.mocked(authApi);

const USER: User = {
  id: 'u1',
  email: 'asha@example.com',
  phone: '+919876543210',
  full_name: 'Asha Verma',
  role: 'customer',
  status: 'active',
  created_at: '2026-10-31T10:00:00Z',
};
const TOKENS: TokenPair = {
  access_token: 'access',
  refresh_token: 'refresh',
  token_type: 'bearer',
  expires_in: 900,
};

beforeEach(async () => {
  jest.clearAllMocks();
  await tokenStorage.clear();
  await onboardingStorage.reset();
});

describe('auth state', () => {
  it('starts loading, signed out, intro not done', () => {
    expect(setupStore().getState().auth).toEqual({
      status: 'loading',
      user: null,
      hasOnboarded: false,
    });
  });

  it('bootstrap with no saved session signs out', async () => {
    const store = setupStore();
    await store.dispatch(bootstrap());
    expect(store.getState().auth.status).toBe('unauthenticated');
    expect(api.getMe).not.toHaveBeenCalled();
  });

  it('setSession stores tokens in the keychain, not in Redux', async () => {
    const store = setupStore();
    await store.dispatch(setSession({ user: USER, tokens: TOKENS }));

    expect(store.getState().auth).toEqual({
      status: 'authenticated',
      user: USER,
      hasOnboarded: true,
    });
    expect(JSON.stringify(store.getState())).not.toContain('access');
    expect(await tokenStorage.getAccessToken()).toBe('access');
  });

  it('logout clears the session but keeps the intro done', async () => {
    api.logout.mockResolvedValue(undefined);
    const store = setupStore();
    await store.dispatch(setSession({ user: USER, tokens: TOKENS }));
    await store.dispatch(logout());

    expect(store.getState().auth).toEqual({
      status: 'unauthenticated',
      user: null,
      hasOnboarded: true,
    });
    expect(await tokenStorage.getTokens()).toBeNull();
  });

  it('reset returns to the launch state', () => {
    const store = setupStore();
    store.dispatch(signedIn(USER));
    store.dispatch(reset());
    expect(store.getState().auth.status).toBe('loading');
  });
});

describe('any component can read and update the store', () => {
  function Greeting() {
    const name = useAppSelector(s => s.auth.user?.full_name ?? 'nobody');
    return <Text testID="greeting">{name}</Text>;
  }

  it('reads preloaded state and re-renders on dispatch', async () => {
    const { store } = await renderWithProviders(<Greeting />, {
      preloadedState: {
        auth: { status: 'unauthenticated', user: null, hasOnboarded: true },
      },
    });
    expect(screen.getByTestId('greeting')).toHaveTextContent('nobody');

    await act(async () => {
      store.dispatch(signedIn(USER));
    });
    expect(screen.getByTestId('greeting')).toHaveTextContent('Asha Verma');
  });
});
