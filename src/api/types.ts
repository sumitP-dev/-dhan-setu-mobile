/** Shapes of the backend's JSON responses (see the backend's /docs). */

export type UserRole = 'customer' | 'merchant' | 'admin';
export type UserStatus = 'pending_verification' | 'active' | 'blocked';
export type OtpPurpose = 'verify_phone' | 'login';

export type User = {
  id: string;
  email: string;
  phone: string; // E.164, e.g. +919876543210
  full_name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string; // ISO 8601
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number; // seconds
};

export type AuthResponse = { user: User; tokens: TokenPair };

export type OtpSentResponse = {
  message: string;
  expires_in: number;
  resend_after: number;
  dev_otp?: string; // only when the backend runs with DEBUG=true
};

export type RegisterResponse = { user: User; otp: OtpSentResponse };

/** Every backend error: {"error": {"code": "...", "message": "..."}} */
export type ApiErrorBody = { error: { code: string; message: string } };
