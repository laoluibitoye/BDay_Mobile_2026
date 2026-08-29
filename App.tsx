import React, { useCallback, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/theme';
import { useAppFonts } from './src/theme/useAppFonts';
import { AppStateProvider } from './src/state/AppState';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import { useDeepLinking } from './src/hooks/useDeepLinking';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { installCrashReporting } from './src/lib/crashReporting';

SplashScreen.preventAutoHideAsync().catch(() => {});
installCrashReporting();

export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();
  usePushNotifications();
  useDeepLinking();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppStateProvider>
            <NavigationContainer ref={navigationRef}>
              <StatusBar style="auto" />
              <RootNavigator />
            </NavigationContainer>
          </AppStateProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
