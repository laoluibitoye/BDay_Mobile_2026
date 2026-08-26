import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'Corrections'>;

// No corrections-log backend exists yet.
export function CorrectionsScreen({}: Props) {
  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="Corrections & editor's notes" showBack />}>
      <FeedEmptyState title="Not available yet" message="The corrections log isn't available yet." />
    </Screen>
  );
}
