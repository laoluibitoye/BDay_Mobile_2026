import React from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { space, type, useTheme } from '../../theme';

const SECTIONS = [
  {
    title: 'About this policy',
    body: 'BusinessDay provides BusinessDay Mobile as a free service. This page explains what personal information we collect when you use the app, how we use it, and your rights over it. By using the app, you agree to the collection and use of information as described here — we do not sell or share your information except as set out below.',
  },
  {
    title: 'Information we collect',
    body: 'To give you a better experience, we may ask for certain personally identifiable information, such as your email address and reading activity within the app (saved articles, followed topics). We also automatically collect Log Data whenever the app errors — your device’s IP address, device name, operating system version, app configuration, and the time and date of use.',
  },
  {
    title: 'Cookies and third-party services',
    body: 'The app itself does not use cookies, but it relies on third-party services — including Google Play Services — that may use cookies or similar identifiers to collect information and improve their own services. Some of these third parties may have access to your personal information solely to perform tasks on our behalf; they are not permitted to use it for any other purpose.',
  },
  {
    title: 'Security',
    body: 'We use commercially reasonable measures to protect the personal information you share with us. No method of transmission over the internet or electronic storage is ever 100% secure, so we can’t guarantee absolute security.',
  },
  {
    title: 'Links to other sites',
    body: 'The app may link out to other websites. We don’t operate those sites and aren’t responsible for their content or privacy practices — please review their own policies before sharing information with them.',
  },
  {
    title: 'Children’s privacy',
    body: 'BusinessDay Mobile is not directed at anyone under 13, and we do not knowingly collect personal information from children under 13. If we learn that a child has provided us with personal information, we delete it. Parents or guardians who believe their child has done so can contact us using the details below.',
  },
  {
    title: 'Your rights under NDPR',
    body: 'As a Nigerian Data Protection Regulation (NDPR) data subject, you can request a copy of your data or ask us to delete your account at any time from You → Account & Security.',
  },
  {
    title: 'Changes to this policy',
    body: 'We may update this policy from time to time. Continued use of the app after a change means you accept the update — check back here periodically.',
  },
  {
    title: 'Contact us',
    body: 'Questions or concerns about this policy can be sent to digital@businessday.ng.',
  },
  {
    title: 'Terms of use',
    body: 'By using BusinessDay Mobile, you agree not to redistribute premium content, to keep your account credentials secure, and to use the app in line with applicable Nigerian law.',
  },
];

// Privacy sections above are adapted from BusinessDay's own published app privacy policy
// (businessday.ng/app-privacy-policy/), not fabricated — restructured for this screen and with
// an NDPR data-subject-rights section added, since the source page predates NDPR-specific
// language. "Terms of use" has no equivalent published source and stays generic boilerplate
// pending a legal red-line (launch-blocker decision "privacy-terms-copy", Option B) — flag that
// section specifically if/when counsel reviews this screen, not the privacy sections above it.
export function PrivacyTermsScreen() {
  const { theme } = useTheme();

  return (
    <Screen header={<AppHeader variant="compact" title="Privacy & Terms" showBack />}>
      <View style={{ padding: space.lg, gap: space.xl }}>
        <Text style={[type.caption, { color: theme.inkFaint }]}>Last updated September 2026</Text>
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
