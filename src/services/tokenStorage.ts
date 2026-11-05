import * as Keychain from 'react-native-keychain';

/**
 * Tokens live only in the device keychain (Android Keystore), never AsyncStorage.
 * A memory copy avoids a keychain read on every API request.
 */
export type StoredTokens = { accessToken: string; refreshToken: string };

const SERVICE = 'com.dhansetu.app.auth';
const ACCOUNT = 'dhan-setu';

let cache: StoredTokens | null | undefined; // undefined = not loaded yet

async function load(): Promise<StoredTokens | null> {
  if (cache !== undefined) {
    return cache;
  }
  try {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE });
    cache = credentials
      ? (JSON.parse(credentials.password) as StoredTokens)
      : null;
  } catch {
    // Unreadable entry (e.g. after a device restore): treat as signed out.
    cache = null;
  }
  return cache;
}

export const tokenStorage = {
  async getTokens(): Promise<StoredTokens | null> {
    return load();
  },

  async getAccessToken(): Promise<string | null> {
    return (await load())?.accessToken ?? null;
  },

  async getRefreshToken(): Promise<string | null> {
    return (await load())?.refreshToken ?? null;
  },

  async setTokens(tokens: StoredTokens): Promise<void> {
    await Keychain.setGenericPassword(ACCOUNT, JSON.stringify(tokens), {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    cache = tokens;
  },

  async clear(): Promise<void> {
    cache = null;
    await Keychain.resetGenericPassword({ service: SERVICE });
  },
};
