import axios from 'axios';

import { env } from '../config/env';
import { tokenStorage } from '../services/tokenStorage';

/**
 * The one HTTP client for the backend. Feature api.ts files use this, never axios directly.
 * Token refresh on 401 is added with the auth flow (Prompt 5).
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async config => {
  const accessToken = await tokenStorage.getAccessToken();
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
