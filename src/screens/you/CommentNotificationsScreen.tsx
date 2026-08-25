import React, { useEffect } from 'react';
import { FlatList, Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { ListRow } from '../../components/ListRow';
import { useCommentNotifications, invalidateCommentNotificationsCache } from '../../hooks/useCommentNotifications';
import { markCommentNotificationsRead } from '../../lib/api/comments';
import { space, type, useTheme } from '../../theme';

// Reader-requested: "getting notifications of other users' comments to their own comment" — one
// row per reply, newest first. Marks everything read on open, same pattern as my-account.ts's
// Comments tab on the web SDK.
export function CommentNotificationsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const rows = useCommentNotifications();

  useEffect(() => {
    markCommentNotificationsRead()
      .then(invalidateCommentNotificationsCache)
      .catch(() => undefined);
  }, []);

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="Comment replies" showBack />}>
      <FlatList
        style={{ flex: 1 }}
        data={rows ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
            {rows === null ? 'Loading…' : 'No replies yet — when someone replies to your comment, it shows up here.'}
          </Text>
        }
        renderItem={({ item }) => (
          <ListRow
            title={`${item.replyAuthor} replied to your comment`}
            subtitle={item.commentBody}
            meta={new Date(item.createdAt).toLocaleDateString()}
            onPress={() => navigation.navigate('ArticleReader', { articleId: item.postId })}
            accessibilityLabel={`${item.replyAuthor} replied: ${item.commentBody}`}
          />
        )}
      />
    </Screen>
  );
}
