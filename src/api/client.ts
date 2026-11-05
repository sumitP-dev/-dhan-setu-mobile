import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { env } from '../config/env';
import { tokenStorage } from '../services/tokenStorage';
import type { TokenPair } from './types';

/**
 * The one HTTP client for the backend. Feature api.ts files use this, never axios directly.
 *
 * - Adds the access token to every request.
 * - On a 401 it refreshes the tokens once (shared by every request that failed at the
 *   same time), then retries the request. If the refresh is rejected, the session is over:
 *   tokens are cleared and the app returns to the signed-out screens.
 * - /auth/* calls are never refreshed (a 401 there means wrong password, bad token, etc.).
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let onSessionExpired: () => void = () => {};

/** Called by the auth store so the client can sign the user out without importing it. */
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

let refreshInFlight: Promise<string> | null = null;

/** One refresh at a time; everyone waiting gets the same new access token. */
function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new SessionExpiredError();
      }
      try {
        // Uses the same instance, but /auth/* is skipped by the 401 handler below.
        const { data } = await apiClient.post<TokenPair>('/auth/refresh', {
          refresh_token: refreshToken,
        });
        await tokenStorage.setTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        });
        return data.access_token;
      } catch (error) {
        // A rejected refresh token ends the session. A network error doesn't: the
        // tokens are kept and the original request just fails.
        const status = (error as AxiosError).response?.status;
        if (status === 401 || status === 403) {
          throw new SessionExpiredError();
        }
        throw error;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

class SessionExpiredError extends Error {}

apiClient.interceptors.request.use(async config => {
  const accessToken = await tokenStorage.getAccessToken();
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetryableConfig | undefined;
  const isAuthCall = config?.url?.startsWith('/auth/') ?? false;

  if (
    error.response?.status !== 401 ||
    !config ||
    isAuthCall ||
    config._retried
  ) {
    throw error;
  }

  config._retried = true;
  try {
    // If another request already refreshed while this one was in flight, reuse that token.
    const current = await tokenStorage.getAccessToken();
    const sent = String(config.headers.Authorization ?? '');
    const accessToken =
      current && sent !== `Bearer ${current}`
        ? current
        : await refreshAccessToken();
    config.headers.Authorization = `Bearer ${accessToken}`;
  } catch (refreshError) {
    if (refreshError instanceof SessionExpiredError) {
      await tokenStorage.clear();
      onSessionExpired();
      throw error; // the original 401
    }
    throw refreshError;
  }
  return apiClient(config);
});
