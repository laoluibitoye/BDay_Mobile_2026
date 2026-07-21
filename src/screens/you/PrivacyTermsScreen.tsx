import React from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { space, type, useTheme } from '../../theme';

const SECTIONS = [
  {
    title: 'What we collect',
    body: 'Your email address, reading activity within the app (saved articles, followed topics), and device information needed to deliver the service — nothing beyond what is needed to run your account and personalize your feed.',
  },
  {
    title: 'How we use it',
    body: 'To operate your account, personalize your Today feed, process subscription payments, and send the notification categories you’ve opted into. We do not sell your data to third parties.',
  },
  {
    title: 'Your rights under NDPR',
    body: 'As a Nigerian Data Protection Regulation (NDPR) data subject, you can request a copy of your data or ask us to delete your account at any time from You → Account & Security.',
  },
  {
    title: 'Terms of use',
    body: 'By using BusinessDay Mobile, you agree not to redistribute premium content, to keep your account credentials secure, and to use the app in line with applicable Nigerian law.',
  },
];

// Prototype legal copy — placeholder text, not reviewed by counsel. Real policy content
// lands in Phase 2/3 per IMPLEMENTATION_PLAN.md's NDPR compliance NFR.
export function PrivacyTermsScreen() {
  const { theme } = useTheme();

  return (
    <Screen header={<AppHeader variant="compact" title="Privacy & Terms" showBack />}>
      <View style={{ padding: space.lg, gap: space.xl }}>
        <Text style={[type.caption, { color: theme.inkFaint }]}>
          PROTOTYPE COPY — NOT YET REVIEWED BY LEGAL COUNSEL
        </Text>
        {SECTIONS.map((s) => (
          <View key={s.title}>
            <Text style={[type.sectionHeadline, { color: theme.ink }]}>{s.title}</Text>
            <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]}>{s.body}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
