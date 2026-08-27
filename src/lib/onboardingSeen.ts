import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'bd_has_seen_onboarding';

// Not sensitive, doesn't need SecureStore — just needs to survive app restarts so the value-prop
// carousel (OnboardingScreen) and, downstream, the interest picker only ever show once per
// install, not on every cold launch or every login. Separate concept from session/auth state:
// this tracks "has this device seen the welcome flow," not "is anyone logged in right now."
export async function hasSeenOnboarding(): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEY)) === '1';
}

export async function markOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, '1');
}
