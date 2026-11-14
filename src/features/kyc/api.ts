import { apiClient } from '../../api/client';
import type {
  DigiLockerSession,
  KycRead,
  SelfieSession,
  SelfieSessionStart,
} from '../../api/types';

/** KYC endpoints (backend: app/modules/kyc/router.py). */

/** Status, the next step, and the details fetched so far. */
export async function getKyc(): Promise<KycRead> {
  const { data } = await apiClient.get<KycRead>('/kyc');
  return data;
}

/** Starts a DigiLocker session, or returns the one still open. */
export async function startDigiLocker(): Promise<DigiLockerSession> {
  const { data } = await apiClient.post<DigiLockerSession>('/kyc/digilocker');
  return data;
}

/** The session's outcome; the server checks with DigiLocker while it's open. */
export async function getDigiLocker(id: string): Promise<DigiLockerSession> {
  const { data } = await apiClient.get<DigiLockerSession>(
    `/kyc/digilocker/${encodeURIComponent(id)}`,
  );
  return data;
}

/** For a PAN that wasn't in DigiLocker (or didn't match). Returns the updated KYC. */
export async function submitPan(pan: string): Promise<KycRead> {
  const { data } = await apiClient.post<KycRead>('/kyc/pan', { pan });
  return data;
}

/** Starts a selfie session (or returns the open one) with a token for the selfie SDK. */
export async function startSelfie(): Promise<SelfieSessionStart> {
  const { data } = await apiClient.post<SelfieSessionStart>('/kyc/selfie');
  return data;
}

/** The selfie result; the server fetches it from the provider itself. */
export async function getSelfie(id: string): Promise<SelfieSession> {
  const { data } = await apiClient.get<SelfieSession>(
    `/kyc/selfie/${encodeURIComponent(id)}`,
  );
  return data;
}

/** Sends the KYC for review once every step is done. */
export async function submitKyc(): Promise<KycRead> {
  const { data } = await apiClient.post<KycRead>('/kyc/submit');
  return data;
}
