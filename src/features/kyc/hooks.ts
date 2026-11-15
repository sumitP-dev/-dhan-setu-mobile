import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { setKycRequiredHandler } from '../../api/client';
import { useAppDispatch, useAppSelector, userUpdated } from '../../store';
import {
  getDigiLocker,
  getKyc,
  getSelfie,
  startDigiLocker,
  startSelfie,
  submitKyc,
  submitPan,
} from './api';

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

export function useStartSelfie() {
  return useMutation({ mutationFn: () => startSelfie() });
}

/** Asks the server for the selfie result (the app never reports it). */
export function useCheckSelfie() {
  return useMutation({ mutationFn: (id: string) => getSelfie(id) });
}

export function useSubmitKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submitKyc(),
    onSuccess: kyc => queryClient.setQueryData(kycQueryKey, kyc),
  });
}

/**
 * When the server refuses a request with "kyc_required" (e.g. the app still thought
 * the user was verified), re-reads the KYC so the store, and the gates, catch up.
 * Mounted once for signed-in users (AppStack).
 */
export function useKycRequiredSync() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const latestUser = useRef(user);
  useEffect(() => {
    latestUser.current = user;
  }, [user]);

  useEffect(() => {
    setKycRequiredHandler(() => {
      queryClient
        .fetchQuery({ queryKey: kycQueryKey, queryFn: getKyc, staleTime: 0 })
        .then(kyc => {
          const current = latestUser.current;
          if (current && current.kyc_status !== kyc.status) {
            dispatch(userUpdated({ ...current, kyc_status: kyc.status }));
          }
        })
        .catch(() => {
          // The next screen that reads the KYC will try again.
        });
    });
    return () => setKycRequiredHandler(() => {});
  }, [dispatch, queryClient]);
}
