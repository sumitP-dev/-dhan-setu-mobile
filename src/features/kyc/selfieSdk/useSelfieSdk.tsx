import React, { useCallback, useRef, useState } from 'react';

import { apiClient } from '../../../api/client';
import { DevSelfieSheet, type DevSelfieChoice } from './DevSelfieSheet';
import { SelfieSdkUnavailableError, type SelfieSdkOutcome } from './types';

type Pending = {
  token: string;
  resolve: (outcome: SelfieSdkOutcome) => void;
  reject: (error: unknown) => void;
};

/**
 * Runs the selfie SDK with the token from POST /kyc/selfie. The provider isn't chosen
 * yet, so development builds show a stand-in (DevSelfieSheet) and release builds say
 * the step isn't available. The provider's SDK replaces this hook's body; screens
 * only use `run` and render `sheet`.
 */
export function useSelfieSdk({ devStandIn = __DEV__ } = {}) {
  const pending = useRef<Pending | null>(null);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    (token: string) =>
      new Promise<SelfieSdkOutcome>((resolve, reject) => {
        if (!devStandIn) {
          reject(new SelfieSdkUnavailableError());
          return;
        }
        pending.current = { token, resolve, reject };
        setVisible(true);
      }),
    [devStandIn],
  );

  const finish = (settle: (current: Pending) => void) => {
    const current = pending.current;
    pending.current = null;
    setVisible(false);
    setBusy(false);
    if (current) {
      settle(current);
    }
  };

  const choose = async (choice: DevSelfieChoice) => {
    const current = pending.current;
    if (!current) {
      return;
    }
    setBusy(true);
    try {
      await apiClient.post(
        `/kyc/dev/selfie/${encodeURIComponent(current.token)}`,
        undefined,
        { params: { outcome: choice } },
      );
      finish(p => p.resolve('finished'));
    } catch (error) {
      finish(p => p.reject(error));
    }
  };

  const sheet = devStandIn ? (
    <DevSelfieSheet
      visible={visible}
      busy={busy}
      onChoose={choose}
      onCancel={() => finish(p => p.resolve('cancelled'))}
    />
  ) : null;

  return { run, sheet };
}
