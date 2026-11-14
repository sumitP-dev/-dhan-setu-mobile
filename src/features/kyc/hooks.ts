import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAppDispatch, useAppSelector, userUpdated } from '../../store';
import { getDigiLocker, getKyc, startDigiLocker, submitPan } from './api';

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

export function useStartDigiLocker() {
  return useMutation({ mutationFn: () => startDigiLocker() });
}

/** Asks the server how the DigiLocker session went (never trusts the return link). */
export function useCheckDigiLocker() {
  return useMutation({ mutationFn: (id: string) => getDigiLocker(id) });
}

export function useSubmitPan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pan: string) => submitPan(pan),
    onSuccess: kyc => queryClient.setQueryData(kycQueryKey, kyc),
  });
}
