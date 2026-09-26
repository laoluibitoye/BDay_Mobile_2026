import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as StoreReview from 'expo-store-review';

const IOS_APP_ID = '6748347942';
const ANDROID_PACKAGE = 'bdnews.businessday.bdtech';
const FEEDBACK_EMAIL = 'digital@businessday.ng';

const FINISHED_COUNT_KEY = 'bd:rating:finishedArticles';
const LAST_PROMPT_KEY = 'bd:rating:lastPromptAt';

// Ask only after a reader has actually finished a handful of articles (a positive moment), and
// never more than once per cooldown. The OS rate-limits the native sheet on its own too (Apple
// allows ~3 per 365 days and may silently show nothing), which is why the manual "Rate the app"
// row in About exists as well.
const ARTICLES_BEFORE_PROMPT = 5;
const PROMPT_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;

export async function recordFinishedArticleAndMaybePrompt(): Promise<void> {
  try {
    const finished = (parseInt((await AsyncStorage.getItem(FINISHED_COUNT_KEY)) ?? '0', 10) || 0) + 1;
    await AsyncStorage.setItem(FINISHED_COUNT_KEY, String(finished));
    if (finished < ARTICLES_BEFORE_PROMPT) return;

    const lastPromptAt = parseInt((await AsyncStorage.getItem(LAST_PROMPT_KEY)) ?? '0', 10) || 0;
    if (Date.now() - lastPromptAt < PROMPT_COOLDOWN_MS) return;

    if (!(await StoreReview.isAvailableAsync()) || !(await StoreReview.hasAction())) return;

    await AsyncStorage.multiSet([
      [LAST_PROMPT_KEY, String(Date.now())],
      [FINISHED_COUNT_KEY, '0'],
    ]);
    await StoreReview.requestReview();
  } catch {
    // A rating prompt must never surface an error to a reader mid-article.
  }
}

export function openStoreReviewPage(): void {
  const url =
    Platform.OS === 'ios'
      ? `itms-apps://itunes.apple.com/app/id${IOS_APP_ID}?action=write-review`
      : `market://details?id=${ANDROID_PACKAGE}`;
  const webFallback =
    Platform.OS === 'ios'
      ? `https://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`
      : `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  Linking.openURL(url).catch(() => Linking.openURL(webFallback).catch(() => undefined));
}

export function openFeedbackEmail(): void {
  const version = Constants.expoConfig?.version ?? 'unknown';
  const subject = encodeURIComponent('BusinessDay app feedback');
  const body = encodeURIComponent(`\n\n---\nApp version: ${version}\nPlatform: ${Platform.OS} ${Platform.Version}`);
  Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`).catch(() =>
    Alert.alert('Unable to open mail app', `Please email ${FEEDBACK_EMAIL} directly.`)
  );
}
