import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import { queryClient } from '../api/queryClient';
import type { TokenPair, User } from '../api/types';
import { getMe, logout as logoutRequest } from '../features/auth/api';
import { onboardingStorage } from '../services/onboardingStorage';
import { tokenStorage } from '../services/tokenStorage';
import { getApiError } from '../utils/apiError';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthState = {
  status: AuthStatus;
  user: User | null;
  /** Someone has registered or signed in on this device: skip the intro slides. */
  hasOnboarded: boolean;
};

const initialState: AuthState = {
  status: 'loading',
  user: null,
  hasOnboarded: false,
};

/** Who is signed in. The navigator shows the auth or app screens based on `status`. */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signedIn: (state, action: PayloadAction<User>) => {
      state.status = 'authenticated';
      state.user = action.payload;
    },
    signedOut: state => {
      state.status = 'unauthenticated';
      state.user = null;
    },
    userUpdated: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    onboardingLoaded: (state, action: PayloadAction<boolean>) => {
      state.hasOnboarded = action.payload;
    },
    /** Back to the app-launch state (tests use it to simulate a restart). */
    reset: () => initialState,
  },
});

export const { signedIn, signedOut, userUpdated, reset } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const completeOnboarding = createAsyncThunk(
  'auth/completeOnboarding',
  async (_: void, { dispatch }) => {
    await onboardingStorage.markDone();
    dispatch(authSlice.actions.onboardingLoaded(true));
  },
);

/** On app start: restore the session from the keychain, if there is one. */
export const bootstrap = createAsyncThunk(
  'auth/bootstrap',
  async (_: void, { dispatch }) => {
    const [tokens, hasOnboarded] = await Promise.all([
      tokenStorage.getTokens(),
      onboardingStorage.isDone(),
    ]);
    dispatch(authSlice.actions.onboardingLoaded(hasOnboarded));
    if (!tokens) {
      dispatch(signedOut());
      return;
    }
    if (!hasOnboarded) {
      // Signed in before this flag existed.
      await dispatch(completeOnboarding());
    }
    try {
      dispatch(signedIn(await getMe()));
    } catch (error) {
      // Only a rejected session (401) deletes the tokens. If the server was just
      // unreachable, they are kept so the next launch can restore the session.
      if (getApiError(error).status === 401) {
        await tokenStorage.clear();
      }
      dispatch(signedOut());
    }
  },
);

export const setSession = createAsyncThunk(
  'auth/setSession',
  async ({ user, tokens }: { user: User; tokens: TokenPair }, { dispatch }) => {
    await tokenStorage.setTokens({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
    await dispatch(completeOnboarding());
    dispatch(signedIn(user));
  },
);

/** Forgets the session on this device only (e.g. when the server rejected it). */
export const clearSession = createAsyncThunk(
  'auth/clearSession',
  async (_: void, { dispatch }) => {
    await tokenStorage.clear();
    queryClient.clear(); // drop the previous user's cached data
    dispatch(signedOut());
  },
);

/** Signs out on the server (best effort), then forgets the session on this device. */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_: void, { dispatch }) => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch {
        // Server unreachable: still sign out here; the refresh token expires on its own.
      }
    }
    await dispatch(clearSession());
  },
);
