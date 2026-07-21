import React, { useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { MenuRow } from '../../components/MenuRow';
import { SectionLabel } from '../../components/SectionLabel';
import { radius, space, type, useTheme } from '../../theme';

const FAQS = [
  {
    q: 'How do I unlock premium articles?',
    a: 'Free readers get 3 premium articles a month. After that, subscribe from You → Subscription to unlock unlimited reading.',
  },
  {
    q: 'Can I read saved articles offline?',
    a: 'Yes — tap the bookmark icon on any article, then download it from the article screen so it stays available with no connection. Manage downloads from You → Downloads.',
  },
  {
    q: 'How do I change which topics show in Today?',
    a: 'Go to You → Feed settings and toggle the topics you want to follow. Changes apply immediately.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: "Go to You → Subscription → Manage subscription → Cancel subscription. You'll keep Premium access until the end of the current billing period.",
  },
  {
    q: 'Why am I not receiving notifications?',
    a: 'Check You → Notification preferences to confirm the category is on, and check your device Settings to confirm BusinessDay has notification permission.',
  },
];

export function HelpCenterScreen() {
  const { theme } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Screen header={<AppHeader variant="compact" title="Help Center" showBack />}>
      <View style={{ padding: space.lg }}>
        <SectionLabel label="Frequently asked" />
        {FAQS.map((item, i) => {
          const open = openIndex === i;
          return (
            <Pressable
              key={item.q}
              onPress={() => setOpenIndex(open ? null : i)}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              style={{
                borderWidth: 1,
                borderColor: theme.rule,
                borderRadius: radius.card,
                padding: space.lg,
                marginBottom: space.md,
                backgroundColor: theme.bgCard,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
                <Text style={[type.label, { color: theme.ink, flex: 1 }]}>{item.q}</Text>
                <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.inkFaint} />
              </View>
              {open && (
                <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]}>{item.a}</Text>
              )}
            </Pressable>
          );
        })}

        <View style={{ marginTop: space.xl }}>
          <SectionLabel label="Still need help" />
        </View>
        <MenuRow
          icon="mail"
          label="Email support"
          value="support@businessday.ng"
          onPress={() =>
            Linking.openURL('mailto:support@businessday.ng').catch(() =>
              Alert.alert('Unable to open mail app')
            )
          }
        />
        <MenuRow icon="message-circle" label="Live chat" value="Coming soon" disabled />
      </View>
    </Screen>
  );
}
