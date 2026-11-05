import { apiClient } from '../../api/client';
import type { User } from '../../api/types';

/** Auth endpoints. Login, register and OTP calls are added in Prompt 5. */

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me');
  return data;
}
