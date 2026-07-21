import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { notifications } from '../../data/mock';
import { useAppState } from '../../state/AppState';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { readNotificationIds, markNotificationRead, markAllNotificationsRead } = useAppState();
  const hasUnread = notifications.some((n) => !readNotificationIds.includes(n.id));

  return (
    <Screen
      scroll={false}
      header={
        <AppHeader
          variant="compact"
          title="Notifications"
          showBack
          rightAction={{
            icon: 'sliders',
            onPress: () => navigation.navigate('NotificationPreferences'),
            accessibilityLabel: 'Notification preferences',
          }}
        />
      }
    >
      {hasUnread && (
        <Pressable
          onPress={() => markAllNotificationsRead(notifications.map((n) => n.id))}
          hitSlop={8}
          accessibilityRole="button"
          style={{ alignSelf: 'flex-end', paddingHorizontal: space.lg, paddingTop: space.sm }}
        >
          <Text style={[type.label, { color: theme.accentDeep }]}>Mark all read</Text>
        </Pressable>
      )}
      <FlatList
        style={{ flex: 1 }}
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>No notifications yet.</Text>
        }
        renderItem={({ item }) => {
          const isUnread = !readNotificationIds.includes(item.id);
          return (
            <Pressable
              onPress={() => {
                markNotificationRead(item.id);
                if (item.articleId) navigation.navigate('ArticleReader', { articleId: item.articleId });
              }}
              accessibilityRole="button"
              accessibilityLabel={`${item.category}, ${item.title}${isUnread ? ', unread' : ''}`}
              style={{
                flexDirection: 'row',
                gap: space.md,
                paddingVertical: space.md,
                borderBottomWidth: 1,
                borderColor: theme.rule,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isUnread ? theme.accent : 'transparent',
                  marginTop: 6,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[type.mono, { color: theme.accentDeep }]}>{item.category.toUpperCase()}</Text>
                <Text style={[type.label, { color: theme.ink, marginTop: 2 }]}>{item.title}</Text>
                <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: 2 }]}>{item.body}</Text>
                <Text style={[type.caption, { color: theme.inkFaint, marginTop: 4 }]}>{item.receivedAt}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
