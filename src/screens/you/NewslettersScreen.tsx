import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { newsletters } from '../../data/mock';
import { radius, space, type, useTheme } from '../../theme';

export function NewslettersScreen() {
  const { theme } = useTheme();

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="Newsletters" showBack />}>
      <FlatList
        style={{ flex: 1 }}
        data={newsletters}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        renderItem={({ item }) => (
          <View
            style={{
              padding: space.lg,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: theme.rule,
              backgroundColor: theme.bgCard,
              marginBottom: space.md,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[type.label, { color: theme.ink, flex: 1 }]}>{item.title}</Text>
              <Feather name="mail" size={16} color={theme.inkMuted} />
            </View>
            <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]}>{item.summary}</Text>
            <Text style={[type.mono, { color: theme.inkFaint, marginTop: space.sm }]}>{item.sentAt.toUpperCase()}</Text>
          </View>
        )}
      />
      <Pressable
        style={{
          position: 'absolute',
          bottom: space.xxl + 60,
          left: space.lg,
          right: space.lg,
          backgroundColor: theme.accent,
          borderRadius: radius.button,
          paddingVertical: space.md,
          alignItems: 'center',
        }}
      >
        <Text style={[type.label, { color: '#fff' }]}>Manage subscriptions</Text>
      </Pressable>
    </Screen>
  );
}
