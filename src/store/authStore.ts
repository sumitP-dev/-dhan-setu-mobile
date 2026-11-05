import { create } from 'zustand';

import { setSessionExpiredHandler } from '../api/client';
import { queryClient } from '../api/queryClient';
import type { TokenPair, User } from '../api/types';
import { getMe, logout as logoutRequest } from '../features/auth/api';
import { tokenStorage } from '../services/tokenStorage';
import { getApiError } from '../utils/apiError';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: User | null;
  /** On app start: restore the session from the keychain, if there is one. */
  bootstrap: () => Promise<void>;
  setSession: (user: User, tokens: TokenPair) => Promise<void>;
  setUser: (user: User) => void;
  /** Signs out on the server (best effort), then forgets the session on this device. */
  logout: () => Promise<void>;
  /** Forgets the session on this device only (e.g. when the server rejected it). */
  clearSession: () => Promise<void>;
};

/** Who is signed in. The navigator shows the auth or app screens based on `status`. */
export const useAuthStore = create<AuthState>((set, get) => ({
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

  logout: async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch {
        // Server unreachable: still sign out here; the refresh token expires on its own.
      }
    }
    await get().clearSession();
  },

  clearSession: async () => {
    await tokenStorage.clear();
    queryClient.clear(); // drop the previous user's cached data
    set({ status: 'unauthenticated', user: null });
  },
}));

// The API client ends the session when a token refresh is rejected.
setSessionExpiredHandler(() => {
  useAuthStore.getState().clearSession();
});
