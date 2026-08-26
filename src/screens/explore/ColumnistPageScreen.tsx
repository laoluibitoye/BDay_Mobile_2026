import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'ColumnistPage'>;

// No author-archive endpoint exists on the WordPress site yet — this used to render a fake
// bio/avatar and byline archive from the 4 hardcoded mock authors, which never matched real
// WP article authors anyway.
export function ColumnistPageScreen({}: Props) {
  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="Columnist" showBack />}>
      <FeedEmptyState title="Not available yet" message="Columnist pages aren't available yet." />
    </Screen>
  );
}
