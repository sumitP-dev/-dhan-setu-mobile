import { combineReducers } from '@reduxjs/toolkit';

import { authReducer } from './authSlice';

/**
 * Every slice of app state, in one place. A new feature adds its slice here, e.g.
 * `cards: cardsReducer`. Data from the backend stays in React Query, not Redux.
 */
export const rootReducer = combineReducers({
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
