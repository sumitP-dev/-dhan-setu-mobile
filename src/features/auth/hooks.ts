import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '../../store/authStore';
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
  const setSession = useAuthStore(s => s.setSession);
  return useMutation({
    mutationFn: (body: LoginRequest) => login(body),
    onSuccess: ({ user, tokens }) => setSession(user, tokens),
  });
}

/** Creates a pending account and texts a verify_phone code. Doesn't sign in. */
export function useRegister() {
  return useMutation({
    mutationFn: (body: RegisterRequest) => register(body),
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (body: OtpSendRequest) => sendOtp(body),
  });
}

export function useVerifyOtp() {
  const setSession = useAuthStore(s => s.setSession);
  return useMutation({
    mutationFn: (body: OtpVerifyRequest) => verifyOtp(body),
    onSuccess: ({ user, tokens }) => setSession(user, tokens),
  });
}
