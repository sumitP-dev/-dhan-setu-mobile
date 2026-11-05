import { createNavigationContainerRef } from '@react-navigation/native';

import type { AppStackParamList, AuthStackParamList } from './types';

/**
 * Navigation from outside React components (e.g. API interceptors) and in tests.
 * Inside screens, use the `navigation` prop instead.
 */
export const navigationRef = createNavigationContainerRef<
  AuthStackParamList & AppStackParamList
>();
