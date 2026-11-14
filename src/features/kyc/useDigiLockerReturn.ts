import { useEffect, useRef } from 'react';
import { AppState, Linking } from 'react-native';

/** Where the backend sends the browser after DigiLocker (KYC_APP_RETURN_URL). */
export const DIGILOCKER_RETURN_URL = 'dhansetu://kyc/digilocker';

export const isDigiLockerReturn = (url: string) =>
  url === DIGILOCKER_RETURN_URL || url.startsWith(`${DIGILOCKER_RETURN_URL}?`);

/**
 * Calls `onReturn` when the user comes back from DigiLocker: through the
 * dhansetu:// link, or by switching back to the app themselves. The link only says
 * that they're back; the caller asks the server what happened.
 */
export function useDigiLockerReturn(onReturn: () => void, enabled: boolean) {
  const callback = useRef(onReturn);
  useEffect(() => {
    callback.current = onReturn;
  }, [onReturn]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const link = Linking.addEventListener('url', ({ url }) => {
      if (isDigiLockerReturn(url)) {
        callback.current();
      }
    });
    let previous = AppState.currentState;
    const appState = AppState.addEventListener('change', next => {
      if (previous !== 'active' && next === 'active') {
        callback.current();
      }
      previous = next;
    });
    return () => {
      link.remove();
      appState.remove();
    };
  }, [enabled]);
}
