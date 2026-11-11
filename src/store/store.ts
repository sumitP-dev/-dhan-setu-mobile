import { configureStore } from '@reduxjs/toolkit';

import { setSessionExpiredHandler } from '../api/client';
import { clearSession } from './authSlice';
import { rootReducer, type RootState } from './rootReducer';

/** Builds a store. The app uses the single `store` below; tests build their own. */
export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export const store = setupStore();

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
export type { RootState };

// The API client ends the session when a token refresh is rejected.
setSessionExpiredHandler(() => {
  store.dispatch(clearSession());
});
