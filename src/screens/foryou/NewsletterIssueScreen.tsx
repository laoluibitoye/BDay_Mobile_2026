import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'NewsletterIssue'>;

// No newsletter-issue backend exists yet — see ForYouScreen.tsx's Newsletters tab for the same note.
export function NewsletterIssueScreen({}: Props) {
  return (
    <Screen header={<AppHeader variant="compact" title="Newsletter" showBack />}>
      <FeedEmptyState title="Not available yet" message="Newsletter editions aren't available yet." />
    </Screen>
  );
}
