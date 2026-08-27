import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { ListRow } from '../../components/ListRow';
import { deleteComment, getMyComments, type MyCommentView } from '../../lib/api/comments';
import { space, type, useTheme } from '../../theme';

// Web equivalent: my-account.ts's renderCommentsTab, the "your own comments" half of it —
// CommentNotificationsScreen already covers the "replies to your comments" half.
export function MyCommentsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [comments, setComments] = useState<MyCommentView[] | null>(null);

  const load = useCallback(() => {
    getMyComments()
      .then((page) => setComments(page.comments))
      .catch(() => setComments([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = (comment: MyCommentView) => {
    Alert.alert('Delete comment?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setComments((prev) => (prev ? prev.filter((c) => c.id !== comment.id) : prev));
          try {
            await deleteComment(comment.id);
          } catch {
            load();
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="My comments" showBack />}>
      <FlatList
        style={{ flex: 1 }}
        data={comments ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
            {comments === null ? 'Loading…' : "You haven't posted any comments yet."}
          </Text>
        }
        renderItem={({ item }) => (
          <ListRow
            title={item.body}
            meta={new Date(item.createdAt).toLocaleDateString()}
            onPress={() => navigation.navigate('ArticleReader', { articleId: item.postId })}
            accessibilityLabel={item.body}
            rightElement={
              <Pressable
                onPress={() => confirmDelete(item)}
                accessibilityRole="button"
                accessibilityLabel="Delete comment"
                hitSlop={8}
              >
                <Feather name="trash-2" size={18} color={theme.inkFaint} />
              </Pressable>
            }
          />
        )}
      />
    </Screen>
  );
}
