import React, { useRef } from 'react';
import { View } from 'react-native';
import { BlurTargetView } from 'expo-blur';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { MainTabs } from './MainTabs';
import { GlobalTabBar } from '../components/GlobalTabBar';
import { BlurTargetProvider } from '../components/BlurTargetContext';

import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { AuthScreen } from '../screens/onboarding/AuthScreen';
import { AccountRecoveryScreen } from '../screens/onboarding/AccountRecoveryScreen';
import { PersonaSelectionScreen } from '../screens/onboarding/PersonaSelectionScreen';
import { InterestPickerScreen } from '../screens/onboarding/InterestPickerScreen';

import { ArticleReaderScreen } from '../screens/today/ArticleReaderScreen';
import { PaywallScreen } from '../screens/today/PaywallScreen';
import { BreakingNewsScreen } from '../screens/today/BreakingNewsScreen';

import { SearchScreen } from '../screens/explore/SearchScreen';
import { SectionFeedScreen } from '../screens/explore/SectionFeedScreen';
import { ColumnistPageScreen } from '../screens/explore/ColumnistPageScreen';

import { SubscriptionPlansScreen } from '../screens/you/SubscriptionPlansScreen';
import { ManageSubscriptionScreen } from '../screens/you/ManageSubscriptionScreen';
import { BillingHistoryScreen } from '../screens/you/BillingHistoryScreen';
import { NotificationPreferencesScreen } from '../screens/you/NotificationPreferencesScreen';
import { NotificationsScreen } from '../screens/you/NotificationsScreen';
import { ProfileScreen } from '../screens/you/ProfileScreen';
import { FeedSettingsScreen } from '../screens/you/FeedSettingsScreen';
import { AccessibilityScreen } from '../screens/you/AccessibilityScreen';
import { DataOfflineScreen } from '../screens/you/DataOfflineScreen';
import { EditionRegionScreen } from '../screens/you/EditionRegionScreen';
import { EditorialStandardsScreen } from '../screens/you/EditorialStandardsScreen';
import { CorrectionsScreen } from '../screens/you/CorrectionsScreen';
import { SettingsScreen } from '../screens/you/SettingsScreen';
import { LanguageScreen } from '../screens/you/LanguageScreen';
import { AccountSecurityScreen } from '../screens/you/AccountSecurityScreen';
import { HelpCenterScreen } from '../screens/you/HelpCenterScreen';
import { PrivacyTermsScreen } from '../screens/you/PrivacyTermsScreen';
import { AboutScreen } from '../screens/you/AboutScreen';
import { TodaysPaperScreen } from '../screens/you/TodaysPaperScreen';
import { NewsletterIssueScreen } from '../screens/foryou/NewsletterIssueScreen';

import { GamePlayScreen } from '../screens/games/GamePlayScreen';
import { MarketsScreen } from '../screens/markets/MarketsScreen';
import { MarketDetailScreen } from '../screens/markets/MarketDetailScreen';
import { WatchlistScreen } from '../screens/markets/WatchlistScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  // Android-only: glass surfaces' BlurView needs an explicit content view to sample for their
  // frosted-glass effect (unlike iOS's UIVisualEffectView, which blurs whatever's behind it
  // automatically) — `BlurTargetView` is a no-op plain View on iOS, so this wrapper is free there.
  // Published via `BlurTargetProvider` so `GlobalTabBar` and `GlassSheet` can consume it without
  // prop-drilling through every screen that renders one.
  const blurTarget = useRef<View>(null);

  return (
    <BlurTargetProvider value={blurTarget}>
    <View style={{ flex: 1 }}>
    <BlurTargetView ref={blurTarget} style={{ flex: 1 }}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="AccountRecovery" component={AccountRecoveryScreen} />
      <Stack.Screen name="PersonaSelection" component={PersonaSelectionScreen} />
      <Stack.Screen name="InterestPicker" component={InterestPickerScreen} />

      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />

      <Stack.Screen name="ArticleReader" component={ArticleReaderScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'transparentModal' }} />
      <Stack.Screen name="BreakingNews" component={BreakingNewsScreen} options={{ presentation: 'fullScreenModal' }} />

      <Stack.Screen name="Search" component={SearchScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />

      <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
      <Stack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
      <Stack.Screen name="BillingHistory" component={BillingHistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
      <Stack.Screen name="FeedSettings" component={FeedSettingsScreen} />
      <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
      <Stack.Screen name="DataOffline" component={DataOfflineScreen} />
      <Stack.Screen name="EditionRegion" component={EditionRegionScreen} />
      <Stack.Screen name="EditorialStandards" component={EditorialStandardsScreen} />
      <Stack.Screen name="Corrections" component={CorrectionsScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="PrivacyTerms" component={PrivacyTermsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />

      <Stack.Screen name="SectionFeed" component={SectionFeedScreen} />
      <Stack.Screen name="ColumnistPage" component={ColumnistPageScreen} />
      <Stack.Screen name="TodaysPaper" component={TodaysPaperScreen} />
      <Stack.Screen name="NewsletterIssue" component={NewsletterIssueScreen} />

      <Stack.Screen name="GamePlay" component={GamePlayScreen} />
      <Stack.Screen name="Markets" component={MarketsScreen} />
      <Stack.Screen name="MarketDetail" component={MarketDetailScreen} />
      <Stack.Screen name="Watchlist" component={WatchlistScreen} />
    </Stack.Navigator>
    </BlurTargetView>
    <GlobalTabBar />
    </View>
    </BlurTargetProvider>
  );
}
