import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { queryClient } from './src/api/queryClient';
import {
  RootNavigator,
  navigationRef,
  navigationTheme,
} from './src/navigation';
import { store } from './src/store';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer ref={navigationRef} theme={navigationTheme}>
            <StatusBar barStyle="dark-content" />
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
