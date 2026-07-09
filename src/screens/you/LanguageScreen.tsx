import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { LANGUAGES } from '../../data/languages';
import { useAppState } from '../../state/AppState';
import { radius, space, type, useTheme } from '../../theme';

// Phase 1 prototype: selecting a language stores the preference and is wired through
// the article reader's "Translate" action (a stub — see ArticleReaderScreen), standing
// in for a real translation pipeline. Full app-wide localization is a later-phase concern
// per IMPLEMENTATION_PLAN.md's Localization Readiness NFR.
export function LanguageScreen() {
  const { theme } = useTheme();
  const { language, setLanguage } = useAppState();

  return (
    <Screen header={<AppHeader variant="compact" title="Language" showBack />}>
      <View style={{ padding: space.lg }}>
        <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
          Choose your reading language. Articles show a translated preview when this isn't English —
          full-article translation is coming in a later release.
        </Text>
        <View style={{ marginTop: space.xl }}>
          {LANGUAGES.map((l) => {
            const active = language === l.code;
            return (
              <Pressable
                key={l.code}
                onPress={() => setLanguage(l.code)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: space.md,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: active ? theme.accent : theme.rule,
                  backgroundColor: active ? theme.accentTint : theme.bgCard,
                  marginBottom: space.sm,
                }}
              >
                <View>
                  <Text style={[type.label, { color: active ? theme.accentDeep : theme.ink }]}>{l.label}</Text>
                  <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>{l.nativeLabel}</Text>
                </View>
                {active && <Feather name="check" size={20} color={theme.accentDeep} />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}
