import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { space, type, useTheme } from '../../theme';

const SECTIONS = [
  {
    title: 'Editorial independence',
    body: 'BusinessDay\'s newsroom operates independently of commercial and advertising interests. Editorial decisions are made solely by journalists and editors.',
  },
  {
    title: 'Sourcing & verification',
    body: 'We attribute claims to named sources wherever possible, and disclose when a source has requested anonymity and why.',
  },
  {
    title: 'Masthead',
    body: 'BusinessDay Media Ltd. Editor-in-Chief and section editors are listed in the About screen.',
  },
];

export function EditorialStandardsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Screen header={<AppHeader variant="compact" title="Editorial standards" showBack />}>
      <View style={{ padding: space.lg, gap: space.xl }}>
        {SECTIONS.map((s) => (
          <View key={s.title}>
            <Text style={[type.sectionHeadline, { color: theme.ink }]}>{s.title}</Text>
            <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]}>{s.body}</Text>
          </View>
        ))}
        <View>
          <Text style={[type.sectionHeadline, { color: theme.ink }]}>Corrections policy</Text>
          <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]}>
            Errors are corrected transparently and promptly.{' '}
            <Text
              style={{ color: theme.accentDeep }}
              onPress={() => navigation.navigate('Corrections')}
              accessibilityRole="link"
            >
              See the public corrections log →
            </Text>
          </Text>
        </View>
      </View>
    </Screen>
  );
}
