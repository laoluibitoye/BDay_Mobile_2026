import React from 'react';
import { Switch, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { newsletters } from '../../data/mock';
import { useAppState } from '../../state/AppState';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'NewsletterIssue'>;

// The latest edition of a given newsletter — its content (like the newsletter list itself) is
// publisher-authored and would come from the WP dashboard, not be hand-written per app release.
export function NewsletterIssueScreen({ route }: Props) {
  const { theme } = useTheme();
  const { newsletterId } = route.params;
  const { subscribedNewsletterIds, toggleNewsletterSubscription } = useAppState();
  const newsletter = newsletters.find((n) => n.id === newsletterId);
  const subscribed = newsletter ? subscribedNewsletterIds.includes(newsletter.id) : false;

  if (!newsletter) {
    return (
      <Screen header={<AppHeader variant="compact" title="Newsletter" showBack />}>
        <Text style={[type.bodyUI, { color: theme.inkMuted, padding: space.lg }]}>Newsletter not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen header={<AppHeader variant="compact" title={newsletter.title} showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.mono, { color: theme.accentDeep }]}>{newsletter.sentAt.toUpperCase()}</Text>
        <Text style={[type.displayHeadline, { color: theme.ink, marginTop: space.xs }]}>
          {newsletter.latestEditionSubject}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: space.lg,
            padding: space.md,
            borderRadius: 12,
            backgroundColor: theme.bgCard,
            borderWidth: 1,
            borderColor: theme.rule,
          }}
        >
          <Text style={[type.bodyUI, { color: theme.ink }]}>
            {subscribed ? 'Subscribed' : 'Subscribe to get this in your inbox'}
          </Text>
          <Switch
            value={subscribed}
            onValueChange={() => toggleNewsletterSubscription(newsletter.id)}
            trackColor={{ true: theme.accent, false: theme.rule }}
            accessibilityLabel={subscribed ? `Unsubscribe from ${newsletter.title}` : `Subscribe to ${newsletter.title}`}
          />
        </View>

        <View style={{ marginTop: space.xl, gap: space.lg }}>
          {newsletter.latestEditionBody.map((paragraph, i) => (
            <Text key={i} style={[type.bodyReading, { color: theme.ink }]}>
              {paragraph}
            </Text>
          ))}
        </View>
      </View>
    </Screen>
  );
}
