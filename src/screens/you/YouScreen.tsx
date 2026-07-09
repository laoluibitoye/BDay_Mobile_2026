import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { AppearanceRow } from '../../components/AppearanceRow';
import { MenuRow } from '../../components/MenuRow';
import { useAppState } from '../../state/AppState';
import { LANGUAGES } from '../../data/languages';
import { radius, space, type, useTheme } from '../../theme';

export function YouScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isSubscribed, savedArticleIds, language } = useAppState();
  const languageLabel = LANGUAGES.find((l) => l.code === language)?.label ?? language;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <AppHeader variant="compact" title="You" showBack rightAction={null} />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.md,
            marginTop: space.lg,
            padding: space.lg,
            borderRadius: radius.card,
            backgroundColor: isSubscribed ? theme.accentTint : theme.bgCard,
            borderWidth: 1,
            borderColor: theme.rule,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.ink,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={[type.label, { color: theme.bg }]}>AO</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[type.label, { color: theme.ink }]}>Ada Okafor</Text>
            <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>
              {isSubscribed ? 'Premium subscriber' : 'Free reader'}
            </Text>
          </View>
          {!isSubscribed && (
            <Text
              style={[type.label, { color: theme.accent }]}
              onPress={() => navigation.navigate('Paywall')}
            >
              Upgrade
            </Text>
          )}
        </View>

        <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.xl, marginBottom: space.xs }]}>
          LIBRARY
        </Text>
        <MenuRow
          icon="bookmark"
          label="Saved articles"
          value={`${savedArticleIds.length}`}
          onPress={() => navigation.navigate('Saved')}
        />
        <MenuRow icon="mail" label="Newsletters" onPress={() => navigation.navigate('Newsletters')} />
        <MenuRow icon="download" label="Downloads" onPress={() => navigation.navigate('Downloads')} />
        <MenuRow icon="clock" label="Reading history" onPress={() => navigation.navigate('ReadingHistory')} />

        <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.xl, marginBottom: space.xs }]}>
          ACCOUNT
        </Text>
        <MenuRow icon="user" label="Profile" onPress={() => navigation.navigate('Profile')} />
        <MenuRow
          icon="credit-card"
          label="Subscription"
          value={isSubscribed ? 'Premium' : 'Free'}
          onPress={() => navigation.navigate('ManageSubscription')}
        />
        <MenuRow icon="shield" label="Account & security" onPress={() => navigation.navigate('AccountSecurity')} />
        <MenuRow
          icon="bell"
          label="Notification preferences"
          onPress={() => navigation.navigate('NotificationPreferences')}
        />

        <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.xl, marginBottom: space.xs }]}>
          SETTINGS & SUPPORT
        </Text>
        <AppearanceRow />
        <MenuRow icon="sliders" label="Feed settings" onPress={() => navigation.navigate('FeedSettings')} />
        <MenuRow icon="globe" label="Language" value={languageLabel} onPress={() => navigation.navigate('Language')} />
        <MenuRow icon="eye" label="Accessibility" onPress={() => navigation.navigate('Accessibility')} />
        <MenuRow icon="wifi" label="Data & offline" onPress={() => navigation.navigate('DataOffline')} />
        <MenuRow icon="flag" label="Edition & region" onPress={() => navigation.navigate('EditionRegion')} />
        <MenuRow icon="help-circle" label="Help Center" onPress={() => navigation.navigate('HelpCenter')} />
        <MenuRow icon="file-text" label="Privacy & Terms" onPress={() => navigation.navigate('PrivacyTerms')} />
        <MenuRow
          icon="edit-3"
          label="Editorial standards"
          onPress={() => navigation.navigate('EditorialStandards')}
        />
        <MenuRow icon="alert-circle" label="Corrections" onPress={() => navigation.navigate('Corrections')} />
        <MenuRow icon="info" label="About" onPress={() => navigation.navigate('About')} />
      </ScrollView>
    </SafeAreaView>
  );
}
