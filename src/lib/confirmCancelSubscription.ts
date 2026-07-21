import { Alert } from 'react-native';

// Shared confirmation so cancellation reads and behaves identically wherever it's triggered
// from (Subscription Plans, Manage Subscription) — previously each screen cancelled instantly
// on a single tap with no confirmation at all.
export function confirmCancelSubscription(onConfirm: () => void) {
  Alert.alert(
    'Cancel subscription?',
    "You'll keep Premium access until the end of the current billing period, then move to the free plan.",
    [
      { text: 'Keep subscription', style: 'cancel' },
      { text: 'Cancel subscription', style: 'destructive', onPress: onConfirm },
    ]
  );
}
