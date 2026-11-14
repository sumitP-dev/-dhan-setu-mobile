/**
 * How a selfie SDK run ended, from the app's side. It never says whether the selfie
 * passed: the provider tells the backend, and the app asks the backend.
 */
export type SelfieSdkOutcome = 'finished' | 'cancelled';

export class SelfieSdkUnavailableError extends Error {
  constructor() {
    super('The selfie check isn’t available in this version of the app yet.');
    this.name = 'SelfieSdkUnavailableError';
  }
}
