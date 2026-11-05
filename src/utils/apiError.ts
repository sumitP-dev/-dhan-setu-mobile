import axios from 'axios';

import type { ApiErrorBody } from '../api/types';

export type ApiError = {
  /** Backend error code (e.g. "invalid_credentials"), or "network_error" / "unknown_error". */
  code: string;
  /** Message that is safe to show to the user. */
  message: string;
  /** HTTP status; undefined when the server could not be reached. */
  status?: number;
};

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  const error = (data as ApiErrorBody | undefined)?.error;
  return typeof error?.code === 'string' && typeof error?.message === 'string';
}

/** Turns anything thrown by an API call into one predictable shape. */
export function getApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (!error.response) {
      return {
        code: 'network_error',
        message:
          "Can't reach Dhan Setu. Check your internet connection and try again.",
      };
    }
    if (isApiErrorBody(error.response.data)) {
      return { ...error.response.data.error, status };
    }
    return {
      code: 'unknown_error',
      message: 'Something went wrong. Please try again.',
      status,
    };
  }
  return {
    code: 'unknown_error',
    message: 'Something went wrong. Please try again.',
  };
}
