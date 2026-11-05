import { create } from 'zustand';

import type { TokenPair, User } from '../api/types';
import { getMe } from '../features/auth/api';
import { tokenStorage } from '../services/tokenStorage';
import { getApiError } from '../utils/apiError';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: User | null;
  /** On app start: restore the session from the keychain, if there is one. */
  bootstrap: () => Promise<void>;
  /** After a successful login / OTP verification. */
  setSession: (user: User, tokens: TokenPair) => Promise<void>;
  setUser: (user: User) => void;
  /** Forget the session on this device. (Server-side logout is added in Prompt 5.) */
  clearSession: () => Promise<void>;
};

/** Who is signed in. The navigator shows the auth or app screens based on `status`. */
export const useAuthStore = create<AuthState>(set => ({
  status: 'loading',
  user: null,

  bootstrap: async () => {
    const tokens = await tokenStorage.getTokens();
    if (!tokens) {
      set({ status: 'unauthenticated', user: null });
      return;
    }
    try {
      const user = await getMe();
      set({ status: 'authenticated', user });
    } catch (error) {
      // Only a rejected session (401) deletes the tokens. If the server was just
      // unreachable, they are kept so the next launch can restore the session.
      if (getApiError(error).status === 401) {
        await tokenStorage.clear();
      }
      set({ status: 'unauthenticated', user: null });
    }
  },

  setSession: async (user, tokens) => {
    await tokenStorage.setTokens({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
    set({ status: 'authenticated', user });
  },

  setUser: user => set({ user }),

  clearSession: async () => {
    await tokenStorage.clear();
    set({ status: 'unauthenticated', user: null });
  },
}));
