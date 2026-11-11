import * as Keychain from 'react-native-keychain';

/**
 * Remembers that someone has registered or signed in on this device, so the intro
 * slides only show on a fresh install. Logging out doesn't clear it.
 */
const SERVICE = 'com.dhansetu.app.onboarding';
const ACCOUNT = 'dhan-setu';
const DONE = 'done';

export const onboardingStorage = {
  async isDone(): Promise<boolean> {
    try {
      const entry = await Keychain.getGenericPassword({ service: SERVICE });
      return entry !== false && entry.password === DONE;
    } catch {
      return false;
    }
  },

  async markDone(): Promise<void> {
    try {
      await Keychain.setGenericPassword(ACCOUNT, DONE, {
        service: SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch {
      // Not critical: the worst case is seeing the intro again.
    }
  },

  /** Tests only. */
  async reset(): Promise<void> {
    await Keychain.resetGenericPassword({ service: SERVICE });
  },
};
