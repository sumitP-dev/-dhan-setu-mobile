import React from 'react';
import { Alert } from 'react-native';
import {
  act,
  render,
  screen,
  userEvent,
  within,
} from '@testing-library/react-native';

import App from '../App';
import type { User } from '../src/api/types';
import { getMe } from '../src/features/auth/api';
import { navigationRef } from '../src/navigation';
import { tokenStorage } from '../src/services/tokenStorage';
import { useAuthStore } from '../src/store/authStore';

jest.mock('../src/features/auth/api', () => ({ getMe: jest.fn() }));
const mockGetMe = jest.mocked(getMe);

const USER: User = {
  id: 'u1',
  email: 'asha@example.com',
  phone: '+919876543210',
  full_name: 'Asha Verma',
  role: 'customer',
  status: 'active',
  created_at: '2026-10-31T10:00:00Z',
};

const currentRoute = () => navigationRef.getCurrentRoute()?.name;
const inScreen = (testID: string) => within(screen.getByTestId(testID));
const goBack = () => act(() => navigationRef.goBack());

async function renderSignedOut() {
  await render(<App />);
  await screen.findByTestId('welcome-screen');
}

/** Skip the intro slides to reach Create account / Log in. */
async function skipIntro(user: ReturnType<typeof userEvent.setup>) {
  await user.press(
    inScreen('welcome-screen').getByRole('button', { name: 'Skip' }),
  );
}

async function renderSignedIn() {
  await tokenStorage.setTokens({
    accessToken: 'access',
    refreshToken: 'refresh',
  });
  mockGetMe.mockResolvedValue(USER);
  await render(<App />);
  await screen.findByTestId('home-screen');
}

beforeEach(async () => {
  jest.clearAllMocks();
  await tokenStorage.clear();
  useAuthStore.setState({ status: 'loading', user: null });
});

describe('signed out', () => {
  it('starts on Welcome', async () => {
    await renderSignedOut();
    expect(currentRoute()).toBe('Welcome');
    expect(mockGetMe).not.toHaveBeenCalled();
  });

  it('intro slides: Next walks through, then Create account and Log in appear', async () => {
    const user = userEvent.setup();
    await renderSignedOut();
    const welcome = inScreen('welcome-screen');

    expect(welcome.getByTestId('welcome-mascot')).toBeOnTheScreen();
    expect(
      welcome.getByRole('header', { name: 'Welcome to\nDhan Setu' }),
    ).toBeOnTheScreen();
    expect(welcome.getByLabelText('Page 1 of 3')).toBeOnTheScreen();
    expect(
      welcome.queryByRole('button', { name: 'Create account' }),
    ).toBeNull();

    await user.press(welcome.getByRole('button', { name: 'Next' }));
    expect(welcome.getByLabelText('Page 2 of 3')).toBeOnTheScreen();

    await user.press(welcome.getByRole('button', { name: 'Next' }));
    expect(welcome.getByLabelText('Page 3 of 3')).toBeOnTheScreen();
    expect(welcome.queryByRole('button', { name: 'Skip' })).toBeNull();
    expect(welcome.queryByRole('button', { name: 'Next' })).toBeNull();
    expect(
      welcome.getByRole('button', { name: 'Create account' }),
    ).toBeOnTheScreen();
    expect(welcome.getByRole('link', { name: 'Log in' })).toBeOnTheScreen();
  });

  it('Welcome -> Register -> OTP -> back to Register', async () => {
    const user = userEvent.setup();
    await renderSignedOut();
    await skipIntro(user);

    await user.press(
      inScreen('welcome-screen').getByRole('button', {
        name: 'Create account',
      }),
    );
    expect(currentRoute()).toBe('Register');

    await user.type(screen.getByTestId('register-name'), 'Asha Verma');
    await user.type(screen.getByTestId('register-email'), 'Asha@Example.com');
    await user.type(screen.getByTestId('register-phone'), '98765 43210');
    await user.type(screen.getByTestId('register-password'), 'Secret123');
    await user.press(
      inScreen('register-screen').getByRole('button', { name: 'Continue' }),
    );

    expect(currentRoute()).toBe('OtpVerify');
    expect(navigationRef.getCurrentRoute()?.params).toEqual({
      phone: '9876543210',
      purpose: 'verify_phone',
    });
    expect(
      inScreen('otp-screen').getByText('+91 98765 43210'),
    ).toBeOnTheScreen();
    expect(screen.getByTestId('otp-countdown')).toHaveTextContent(
      /Resend code in 0:(30|29)/,
    );

    await user.press(
      inScreen('otp-screen').getByRole('button', { name: 'Change number' }),
    );
    expect(currentRoute()).toBe('Register');
  });

  it('Register shows errors and stays put when the form is invalid', async () => {
    const user = userEvent.setup();
    await renderSignedOut();
    await skipIntro(user);
    await user.press(screen.getByRole('button', { name: 'Create account' }));

    await user.type(screen.getByTestId('register-phone'), '12345');
    await user.type(screen.getByTestId('register-password'), 'password');
    await user.press(
      inScreen('register-screen').getByRole('button', { name: 'Continue' }),
    );

    const form = inScreen('register-screen');
    expect(await form.findByText('Enter your full name')).toBeOnTheScreen();
    expect(form.getByText('Enter your email')).toBeOnTheScreen();
    expect(
      form.getByText('Enter a valid 10-digit Indian mobile number'),
    ).toBeOnTheScreen();
    expect(
      form.getByText('Include at least one letter and one number'),
    ).toBeOnTheScreen();
    expect(currentRoute()).toBe('Register');
  });

  it('Login and Register links swap screens without growing the back stack', async () => {
    const user = userEvent.setup();
    await renderSignedOut();
    await skipIntro(user);

    await user.press(
      inScreen('welcome-screen').getByRole('link', { name: 'Log in' }),
    );
    expect(currentRoute()).toBe('Login');

    await user.press(
      inScreen('login-screen').getByRole('link', { name: 'Create account' }),
    );
    expect(currentRoute()).toBe('Register');

    await user.press(
      inScreen('register-screen').getByRole('link', { name: 'Log in' }),
    );
    expect(currentRoute()).toBe('Login');

    await goBack();
    expect(currentRoute()).toBe('Welcome');
    expect(navigationRef.canGoBack()).toBe(false);
  });

  it('Login validates input before submitting', async () => {
    const user = userEvent.setup();
    await renderSignedOut();
    await skipIntro(user);
    await user.press(screen.getByRole('link', { name: 'Log in' }));
    const login = () => inScreen('login-screen');

    await user.type(screen.getByTestId('login-identifier'), '12345');
    await user.press(login().getByRole('button', { name: 'Log in' }));
    expect(
      await login().findByText('Enter a valid email or 10-digit mobile number'),
    ).toBeOnTheScreen();
    expect(login().getByText('Enter your password')).toBeOnTheScreen();

    await user.clear(screen.getByTestId('login-identifier'));
    await user.type(screen.getByTestId('login-identifier'), '9876543210');
    await user.type(screen.getByTestId('login-password'), 'Secret123');
    await user.press(login().getByRole('button', { name: 'Log in' }));
    expect(await screen.findByTestId('login-notice')).toBeOnTheScreen();
  });

  it('OTP Verify button enables after 6 digits', async () => {
    const user = userEvent.setup();
    await renderSignedOut();
    await act(() =>
      navigationRef.navigate('OtpVerify', {
        phone: '9876543210',
        purpose: 'verify_phone',
      }),
    );
    const verify = () =>
      inScreen('otp-screen').getByRole('button', { name: 'Verify' });

    expect(verify()).toBeDisabled();
    await user.type(screen.getByTestId('otp-input'), '12ab3456');
    expect(screen.getByTestId('otp-input')).toHaveDisplayValue('123456');
    expect(verify()).toBeEnabled();

    await user.press(verify());
    expect(await screen.findByTestId('otp-notice')).toBeOnTheScreen();
  });
});

describe('signed in', () => {
  it('restores the session and opens Home', async () => {
    await renderSignedIn();
    expect(currentRoute()).toBe('Home');
    expect(screen.getByText('Asha')).toBeOnTheScreen();
    expect(navigationRef.canGoBack()).toBe(false);
  });

  it.each([
    ['tile-cards', 'Cards', 'cards-screen'],
    ['tile-upi', 'Upi', 'upi-screen'],
    ['tile-bbps', 'Bbps', 'bbps-screen'],
    ['tile-transactions', 'Transactions', 'transactions-screen'],
    ['home-profile-button', 'Profile', 'profile-screen'],
  ])(
    'Home %s opens %s and back returns Home',
    async (button, route, screenId) => {
      const user = userEvent.setup();
      await renderSignedIn();

      await user.press(screen.getByTestId(button));
      expect(currentRoute()).toBe(route);
      expect(screen.getByTestId(screenId)).toBeOnTheScreen();

      await goBack();
      expect(currentRoute()).toBe('Home');
    },
  );

  it('Profile shows the user and logs out to Welcome', async () => {
    const user = userEvent.setup();
    const alert = jest.spyOn(Alert, 'alert');
    await renderSignedIn();
    await user.press(screen.getByTestId('home-profile-button'));

    const profile = inScreen('profile-screen');
    expect(profile.getByText('asha@example.com')).toBeOnTheScreen();
    expect(profile.getByText('+91 98765 43210')).toBeOnTheScreen();

    await user.press(screen.getByTestId('logout-button'));
    const buttons = alert.mock.calls[0][2] ?? [];
    await act(async () => buttons.find(b => b.text === 'Log out')?.onPress?.());

    expect(await screen.findByTestId('welcome-screen')).toBeOnTheScreen();
    expect(currentRoute()).toBe('Welcome');
    expect(navigationRef.canGoBack()).toBe(false);
    expect(await tokenStorage.getTokens()).toBeNull();
  });
});

describe('session restore', () => {
  it('a rejected session (401) clears tokens and shows Welcome', async () => {
    await tokenStorage.setTokens({ accessToken: 'old', refreshToken: 'old' });
    mockGetMe.mockRejectedValue(
      Object.assign(new Error('401'), {
        isAxiosError: true,
        response: { status: 401, data: {} },
      }),
    );

    await render(<App />);

    expect(await screen.findByTestId('welcome-screen')).toBeOnTheScreen();
    expect(await tokenStorage.getTokens()).toBeNull();
  });

  it('server unreachable keeps tokens for the next launch', async () => {
    await tokenStorage.setTokens({ accessToken: 'a', refreshToken: 'r' });
    mockGetMe.mockRejectedValue(
      Object.assign(new Error('Network Error'), { isAxiosError: true }),
    );

    await render(<App />);

    expect(await screen.findByTestId('welcome-screen')).toBeOnTheScreen();
    expect(await tokenStorage.getTokens()).not.toBeNull();
  });
});
