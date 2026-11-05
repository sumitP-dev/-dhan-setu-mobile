import React from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';

import { AppButton, AppTextInput, Banner, initialsOf } from '../src/components';

describe('AppButton', () => {
  it('calls onPress', async () => {
    const onPress = jest.fn();
    await render(<AppButton title="Pay" onPress={onPress} />);
    await userEvent.setup().press(screen.getByRole('button', { name: 'Pay' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled and busy while loading', async () => {
    const onPress = jest.fn();
    await render(<AppButton title="Pay" loading onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Pay' });

    await userEvent.setup().press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
    expect(button).toBeBusy();
    expect(screen.getByTestId('button-loading')).toBeOnTheScreen();
  });
});

describe('AppTextInput', () => {
  it('password fields can be shown and hidden', async () => {
    const user = userEvent.setup();
    await render(<AppTextInput label="Password" secureTextEntry testID="pw" />);
    expect(screen.getByTestId('pw')).toHaveProp('secureTextEntry', true);

    await user.press(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByTestId('pw')).toHaveProp('secureTextEntry', false);

    await user.press(screen.getByRole('button', { name: 'Hide password' }));
    expect(screen.getByTestId('pw')).toHaveProp('secureTextEntry', true);
  });

  it('shows the error instead of the hint', async () => {
    await render(
      <AppTextInput
        label="Email"
        hint="We never share it"
        error="Enter a valid email"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
    expect(screen.queryByText('We never share it')).toBeNull();
  });
});

it('Banner danger is announced as an alert', async () => {
  await render(<Banner tone="danger" message="Payment failed" />);
  expect(
    screen.getByRole('alert', { name: 'Payment failed' }),
  ).toBeOnTheScreen();
});

it('initialsOf', () => {
  expect(initialsOf('Asha Verma')).toBe('AV');
  expect(initialsOf('asha')).toBe('A');
  expect(initialsOf('Asha Kumari Verma')).toBe('AV');
  expect(initialsOf('   ')).toBe('?');
});
