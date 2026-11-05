import React, { useEffect } from 'react';

import { LoadingView } from '../components';
import { useAuthStore } from '../store/authStore';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';

/**
 * Shows the signed-in or signed-out screens. Switching replaces the whole stack, so
 * after login the back button can't return to the login screens (and vice versa).
 */
export function RootNavigator() {
  const status = useAuthStore(s => s.status);
  const bootstrap = useAuthStore(s => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (status === 'loading') {
    return <LoadingView />;
  }
  return status === 'authenticated' ? <AppStack /> : <AuthStack />;
}
