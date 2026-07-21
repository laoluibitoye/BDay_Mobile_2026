import React from 'react';
import { Image, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { MenuRow } from '../../components/MenuRow';
import { space, type, useTheme } from '../../theme';

export function AboutScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Screen header={<AppHeader variant="compact" title="About" showBack />}>
      <View style={{ padding: space.lg, alignItems: 'center' }}>
        <Image
          source={require('../../../assets/brand/bd-icon.png')}
          style={{ width: 64, height: 64, borderRadius: 16 }}
          resizeMode="contain"
        />
        <Text style={[type.sectionHeadline, { color: theme.ink, marginTop: space.md }]}>BusinessDay Mobile</Text>
        <Text style={[type.mono, { color: theme.inkFaint, marginTop: 2 }]}>v1.0.0 (prototype)</Text>
        <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.md, textAlign: 'center' }]}>
          Africa's business daily — credible journalism, live market data, and a daily briefing worth ten minutes.
        </Text>
      </View>

      <View style={{ padding: space.lg, paddingTop: 0 }}>
        <MenuRow icon="edit-3" label="Editorial standards" onPress={() => navigation.navigate('EditorialStandards')} />
        <MenuRow icon="alert-circle" label="Corrections" onPress={() => navigation.navigate('Corrections')} />
        <MenuRow icon="file-text" label="Privacy & Terms" onPress={() => navigation.navigate('PrivacyTerms')} />
        <MenuRow icon="help-circle" label="Help Center" onPress={() => navigation.navigate('HelpCenter')} />
      </View>

      <Text style={[type.caption, { color: theme.inkFaint, textAlign: 'center', marginTop: space.lg }]}>
        © {new Date().getFullYear()} BusinessDay Media Ltd.
      </Text>
    </Screen>
  );
}
