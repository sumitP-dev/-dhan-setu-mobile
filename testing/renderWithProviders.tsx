import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { setupStore, type AppStore, type RootState } from '../src/store';

type Options = {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
};

/**
 * Renders a screen or component with its own Redux store, React Query client and
 * navigation container, so tests don't share state.
 */
export async function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState, store = setupStore(preloadedState) }: Options = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  const result = await render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>{ui}</NavigationContainer>
      </QueryClientProvider>
    </Provider>,
  );
  return { store, queryClient, ...result };
}
