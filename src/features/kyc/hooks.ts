import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAppDispatch, useAppSelector, userUpdated } from '../../store';
import { getKyc } from './api';

export const kycQueryKey = ['kyc'] as const;

/**
 * The user's KYC. Keeps `user.kyc_status` in the store in step with the server,
 * so screens that only read the store (and later the feature gates) see changes
 * such as an approval.
 */
export function useKyc({ enabled = true }: { enabled?: boolean } = {}) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const query = useQuery({ queryKey: kycQueryKey, queryFn: getKyc, enabled });

  const serverStatus = query.data?.status;
  useEffect(() => {
    if (user && serverStatus && serverStatus !== user.kyc_status) {
      dispatch(userUpdated({ ...user, kyc_status: serverStatus }));
    }
  }, [dispatch, user, serverStatus]);

  return query;
}
