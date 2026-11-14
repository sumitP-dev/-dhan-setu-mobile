import * as Keychain from 'react-native-keychain';

/**
 * Remembers, per user on this device, that the KYC intro was shown (started or
 * skipped), so it appears once after sign-up rather than on every launch. A skipped
 * KYC is still offered from the Home banner and Profile.
 */
const SERVICE_PREFIX = 'com.dhansetu.app.kyc-prompt.';
const ACCOUNT = 'dhan-setu';
const SEEN = 'seen';

const service = (userId: string) => `${SERVICE_PREFIX}${userId}`;

export const kycPromptStorage = {
  async isSeen(userId: string): Promise<boolean> {
    try {
      const entry = await Keychain.getGenericPassword({
        service: service(userId),
      });
      return entry !== false && entry.password === SEEN;
    } catch {
      // Can't tell: don't nag. The Home banner still offers KYC.
      return true;
    }
  },

  async markSeen(userId: string): Promise<void> {
    try {
      await Keychain.setGenericPassword(ACCOUNT, SEEN, {
        service: service(userId),
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch {
      // Not critical: the worst case is seeing the intro once more.
    }
  },

  /** Tests only. */
  async reset(userId: string): Promise<void> {
    await Keychain.resetGenericPassword({ service: service(userId) });
  },
};
