import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { MainTabs } from './MainTabs';

import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { AuthScreen } from '../screens/onboarding/AuthScreen';
import { AccountRecoveryScreen } from '../screens/onboarding/AccountRecoveryScreen';
import { PersonaSelectionScreen } from '../screens/onboarding/PersonaSelectionScreen';
import { InterestPickerScreen } from '../screens/onboarding/InterestPickerScreen';

import { ArticleReaderScreen } from '../screens/today/ArticleReaderScreen';
import { PaywallScreen } from '../screens/today/PaywallScreen';
import { BreakingNewsScreen } from '../screens/today/BreakingNewsScreen';
import { GiftArticleScreen } from '../screens/today/GiftArticleScreen';

import { SearchScreen } from '../screens/explore/SearchScreen';
import { SectionFeedScreen } from '../screens/explore/SectionFeedScreen';
import { ColumnistPageScreen } from '../screens/explore/ColumnistPageScreen';

import { SavedScreen } from '../screens/you/SavedScreen';
import { DownloadsScreen } from '../screens/you/DownloadsScreen';
import { ReadingHistoryScreen } from '../screens/you/ReadingHistoryScreen';
import { NewslettersScreen } from '../screens/you/NewslettersScreen';
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
import { YouScreen } from '../screens/you/YouScreen';
import { LanguageScreen } from '../screens/you/LanguageScreen';

import { GamePlayScreen } from '../screens/games/GamePlayScreen';
import { WatchlistScreen } from '../screens/markets/WatchlistScreen';

import {
  AboutScreen,
  AccountSecurityScreen,
  HelpCenterScreen,
  PrivacyTermsScreen,
  TodaysPaperScreen,
} from '../screens/StubScreens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="AccountRecovery" component={AccountRecoveryScreen} />
      <Stack.Screen name="PersonaSelection" component={PersonaSelectionScreen} />
      <Stack.Screen name="InterestPicker" component={InterestPickerScreen} />

      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="You" component={YouScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />

      <Stack.Screen name="ArticleReader" component={ArticleReaderScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'transparentModal' }} />
      <Stack.Screen name="GiftArticle" component={GiftArticleScreen} options={{ presentation: 'transparentModal' }} />
      <Stack.Screen name="BreakingNews" component={BreakingNewsScreen} options={{ presentation: 'fullScreenModal' }} />

      <Stack.Screen name="Search" component={SearchScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />

      <Stack.Screen name="Saved" component={SavedScreen} />
      <Stack.Screen name="Downloads" component={DownloadsScreen} />
      <Stack.Screen name="ReadingHistory" component={ReadingHistoryScreen} />
      <Stack.Screen name="Newsletters" component={NewslettersScreen} />
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

      <Stack.Screen name="GamePlay" component={GamePlayScreen} />
      <Stack.Screen name="Watchlist" component={WatchlistScreen} />
    </Stack.Navigator>
  );
}
