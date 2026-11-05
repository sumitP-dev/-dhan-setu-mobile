/* eslint-env jest */
/* Native modules don't exist in Jest; replace them with in-memory fakes. */
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

jest.mock('react-native-keychain', () => {
  const store = new Map();
  return {
    ACCESSIBLE: {
      WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
    },
    setGenericPassword: jest.fn(async (username, password, options) => {
      store.set(options?.service ?? 'default', { username, password });
      return { service: options?.service, storage: 'mock' };
    }),
    getGenericPassword: jest.fn(
      async options => store.get(options?.service ?? 'default') ?? false,
    ),
    resetGenericPassword: jest.fn(async options =>
      store.delete(options?.service ?? 'default'),
    ),
  };
});

// Lottie draws natively; in tests it is a plain View with play/pause stubs.
jest.mock('lottie-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const LottieView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      play: jest.fn(),
      pause: jest.fn(),
      reset: jest.fn(),
    }));
    return React.createElement(View, { testID: props.testID });
  });
  return { __esModule: true, default: LottieView };
});
