import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import { apiClient, setSessionExpiredHandler } from '../src/api/client';
import { tokenStorage } from '../src/services/tokenStorage';

/** A fake server: each test decides how it answers. */
type Handler = (config: InternalAxiosRequestConfig) => {
  status: number;
  data?: unknown;
};

let handler: Handler;
const calls: { url?: string; auth?: string }[] = [];

const adapter: AxiosAdapter = async config => {
  calls.push({
    url: config.url,
    auth: config.headers.Authorization as string | undefined,
  });
  const { status, data } = handler(config);
  const response = {
    status,
    statusText: String(status),
    data,
    headers: {},
    config,
  } as AxiosResponse;
  if (status >= 400) {
    throw Object.assign(new Error(`HTTP ${status}`), {
      isAxiosError: true,
      config,
      response,
    });
  }
  return response;
};

const NEW_TOKENS = {
  access_token: 'access-2',
  refresh_token: 'refresh-2',
  token_type: 'bearer',
  expires_in: 900,
};

const sessionExpired = jest.fn();

beforeAll(() => {
  apiClient.defaults.adapter = adapter;
  setSessionExpiredHandler(sessionExpired);
});

beforeEach(async () => {
  calls.length = 0;
  sessionExpired.mockClear();
  await tokenStorage.setTokens({
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
  });
});

it('sends the access token', async () => {
  handler = () => ({ status: 200, data: { ok: true } });
  await apiClient.get('/users/me');
  expect(calls[0].auth).toBe('Bearer access-1');
});

it('on 401 refreshes once, saves the new tokens and retries', async () => {
  handler = config => {
    if (config.url === '/auth/refresh') {
      return { status: 200, data: NEW_TOKENS };
    }
    return config.headers.Authorization === 'Bearer access-2'
      ? { status: 200, data: { ok: true } }
      : { status: 401 };
  };

  const { data } = await apiClient.get('/users/me');

  expect(data).toEqual({ ok: true });
  expect(calls.map(c => c.url)).toEqual([
    '/users/me',
    '/auth/refresh',
    '/users/me',
  ]);
  expect(await tokenStorage.getTokens()).toEqual({
    accessToken: 'access-2',
    refreshToken: 'refresh-2',
  });
});

it('requests that fail together share one refresh call', async () => {
  handler = config => {
    if (config.url === '/auth/refresh') {
      return { status: 200, data: NEW_TOKENS };
    }
    return config.headers.Authorization === 'Bearer access-2'
      ? { status: 200, data: config.url }
      : { status: 401 };
  };

  const results = await Promise.all([
    apiClient.get('/a'),
    apiClient.get('/b'),
    apiClient.get('/c'),
  ]);

  expect(results.map(r => r.data)).toEqual(['/a', '/b', '/c']);
  expect(calls.filter(c => c.url === '/auth/refresh')).toHaveLength(1);
});

it('a rejected refresh ends the session', async () => {
  handler = () => ({ status: 401 });

  await expect(apiClient.get('/users/me')).rejects.toMatchObject({
    response: { status: 401 },
  });

  expect(await tokenStorage.getTokens()).toBeNull();
  expect(sessionExpired).toHaveBeenCalledTimes(1);
});

it('a network error during refresh keeps the tokens', async () => {
  handler = config => {
    if (config.url === '/auth/refresh') {
      throw Object.assign(new Error('Network Error'), {
        isAxiosError: true,
        config,
      });
    }
    return { status: 401 };
  };

  await expect(apiClient.get('/users/me')).rejects.toThrow('Network Error');

  expect(await tokenStorage.getTokens()).not.toBeNull();
  expect(sessionExpired).not.toHaveBeenCalled();
});

it('never refreshes for /auth/* calls', async () => {
  handler = () => ({ status: 401 });

  await expect(
    apiClient.post('/auth/login', { identifier: 'x', password: 'y' }),
  ).rejects.toMatchObject({ response: { status: 401 } });

  expect(calls.map(c => c.url)).toEqual(['/auth/login']);
  expect(sessionExpired).not.toHaveBeenCalled();
});
