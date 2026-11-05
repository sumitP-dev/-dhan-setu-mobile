import type { OtpPurpose, OtpSentResponse } from '../../../api/types';
import type { AuthStackParamList } from '../../../navigation/types';

/** Builds the OtpVerify screen's params from the server's "code sent" response. */
export function otpVerifyParams(
  phone: string,
  purpose: OtpPurpose,
  otp: OtpSentResponse,
): AuthStackParamList['OtpVerify'] {
  return {
    phone,
    purpose,
    resendAfter: otp.resend_after,
    devOtp: otp.dev_otp,
  };
}
