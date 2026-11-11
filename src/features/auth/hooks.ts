import { useMutation } from '@tanstack/react-query';

import { completeOnboarding, setSession, useAppDispatch } from '../../store';
import {
  login,
  register,
  sendOtp,
  verifyOtp,
  type LoginRequest,
  type OtpSendRequest,
  type OtpVerifyRequest,
  type RegisterRequest,
} from './api';

/** Logs in; on success the navigator switches to the signed-in screens. */
export function useLogin() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (body: LoginRequest) => login(body),
    onSuccess: ({ user, tokens }) => dispatch(setSession({ user, tokens })),
  });
}

/** Creates a pending account and texts a verify_phone code. Doesn't sign in. */
export function useRegister() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (body: RegisterRequest) => register(body),
    onSuccess: () => dispatch(completeOnboarding()),
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (body: OtpSendRequest) => sendOtp(body),
  });
}

export function useVerifyOtp() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (body: OtpVerifyRequest) => verifyOtp(body),
    onSuccess: ({ user, tokens }) => dispatch(setSession({ user, tokens })),
  });
}
