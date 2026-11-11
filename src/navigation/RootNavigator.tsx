import React, { useEffect } from 'react';

import { LoadingView } from '../components';
import { bootstrap, useAppDispatch, useAppSelector } from '../store';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';

/**
 * Shows the signed-in or signed-out screens. Switching replaces the whole stack, so
 * after login the back button can't return to the login screens (and vice versa).
 */
export function RootNavigator() {
  const status = useAppSelector(s => s.auth.status);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(bootstrap());
  }, [dispatch]);

  if (status === 'loading') {
    return <LoadingView />;
  }
  return status === 'authenticated' ? <AppStack /> : <AuthStack />;
}
