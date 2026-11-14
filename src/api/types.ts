/** Shapes of the backend's JSON responses (see the backend's /docs). */

export type UserRole = 'customer' | 'merchant' | 'admin';
export type UserStatus = 'pending_verification' | 'active' | 'blocked';
export type OtpPurpose = 'verify_phone' | 'login';
/** Cards, UPI and bill payments need "verified". */
export type KycStatus =
  | 'not_submitted' // not started, or skipped for later
  | 'in_progress' // documents fetched, not submitted yet
  | 'pending_review' // submitted, waiting for the Dhan Setu team
  | 'verified'
  | 'rejected'; // can start again

export type User = {
  id: string;
  email: string;
  phone: string; // E.164, e.g. +919876543210
  full_name: string;
  role: UserRole;
  status: UserStatus;
  kyc_status: KycStatus;
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

export type KycNextStep = 'digilocker' | 'pan' | 'selfie' | 'submit';
export type KycRejectionReason =
  | 'name_mismatch'
  | 'photo_mismatch'
  | 'document_issue'
  | 'other';

/** What DigiLocker returned, for the user to check. Aadhaar and PAN come masked. */
export type KycDetails = {
  name: string;
  date_of_birth: string | null; // YYYY-MM-DD
  birth_year: number;
  gender: 'M' | 'F' | 'T';
  address: string | null;
  aadhaar: string; // XXXX XXXX 1234
  pan: string | null; // ABCXX1234F
  pan_verified: boolean;
  pan_issue: string | null;
  pan_issue_message: string | null;
  selfie_verified: boolean;
  fetched_at: string;
};

/** GET /kyc */
export type KycRead = {
  status: KycStatus;
  /** True when the user can start or continue KYC (not while it's under review). */
  can_start: boolean;
  next_step: KycNextStep | null;
  details: KycDetails | null;
  /** Set while the status is "rejected". The message is safe to show. */
  rejection_reason?: KycRejectionReason | null;
  rejection_message?: string | null;
};

export type DigiLockerStatus =
  | 'pending' // the user hasn't finished in DigiLocker yet
  | 'completed'
  | 'denied' // the user refused to share
  | 'expired'
  | 'failed';

/** POST /kyc/digilocker, GET /kyc/digilocker/{id} */
export type DigiLockerSession = {
  id: string;
  status: DigiLockerStatus;
  /** Open in the browser: the user logs in to DigiLocker and allows sharing. */
  consent_url: string;
  expires_at: string;
  failure_reason: string | null;
  /** Safe to show. */
  failure_message: string | null;
};

/** Every backend error: {"error": {"code": "...", "message": "..."}} */
export type ApiErrorBody = { error: { code: string; message: string } };
