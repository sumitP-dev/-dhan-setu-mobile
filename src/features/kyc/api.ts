import { apiClient } from '../../api/client';
import type { KycRead } from '../../api/types';

/** KYC endpoints (backend: app/modules/kyc/router.py). */

/** Status, the next step, and the details fetched so far. */
export async function getKyc(): Promise<KycRead> {
  const { data } = await apiClient.get<KycRead>('/kyc');
  return data;
}
