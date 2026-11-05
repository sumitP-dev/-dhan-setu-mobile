import { apiClient } from '../../api/client';
import type {
  AuthResponse,
  OtpPurpose,
  OtpSentResponse,
  RegisterResponse,
  User,
} from '../../api/types';

/** Auth endpoints (backend: app/modules/auth/router.py). Phones are 10 digits. */

export type RegisterRequest = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
};
export type LoginRequest = { identifier: string; password: string };
export type OtpSendRequest = { phone: string; purpose: OtpPurpose };
export type OtpVerifyRequest = OtpSendRequest & { code: string };

export async function register(
  body: RegisterRequest,
): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>(
    '/auth/register',
    body,
  );
  return data;
}

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', body);
  return data;
}

export async function sendOtp(body: OtpSendRequest): Promise<OtpSentResponse> {
  const { data } = await apiClient.post<OtpSentResponse>(
    '/auth/otp/send',
    body,
  );
  return data;
}

export async function verifyOtp(body: OtpVerifyRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/otp/verify', body);
  return data;
}

/** Revokes the refresh token (and its whole family) on the server. */
export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refresh_token: refreshToken });
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me');
  return data;
}
