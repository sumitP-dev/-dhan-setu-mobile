import { Platform } from 'react-native';

/**
 * Where the backend runs. The app only talks to it over HTTP; it never imports
 * backend code.
 *
 * - Android emulator: 10.0.2.2 is the emulator's alias for your computer's localhost.
 * - iOS simulator: shares the computer's network, so localhost works.
 * - Physical phone: use your computer's LAN IP (e.g. http://192.168.1.20:8000/api/v1).
 */
const DEV_API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000/api/v1',
  default: 'http://localhost:8000/api/v1',
});

// Set when there is a deployed backend.
const PROD_API_BASE_URL = 'https://api.dhansetu.example/api/v1';

export const env = {
  apiBaseUrl: __DEV__ ? DEV_API_BASE_URL : PROD_API_BASE_URL,
  apiTimeoutMs: 15_000,
} as const;
