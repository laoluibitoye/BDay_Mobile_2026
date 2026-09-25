import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { FeedLoadingState } from '../../components/FeedLoadingState';
import { getToons, type ToonItem } from '../../lib/api/toons';
import { isConnectivityError, CONNECTIVITY_ERROR_COPY } from '../../lib/api/errors';
import { radius, space, type, useTheme } from '../../theme';

const COLUMNS = 2;

// Past editions of the real `cartoons` CPT — same content archive-cartoons.php shows on the
// website, via businessday-app-connector's /toons route.
export function ToonArchiveScreen() {
  const { theme } = useTheme();
  const [items, setItems] = useState<ToonItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [offline, setOffline] = useState(false);
  const [viewing, setViewing] = useState<ToonItem | null>(null);

  const load = () => {
    setFailed(false);
    getToons()
      .then((res) => setItems(res.items))
      .catch((err) => {
        setFailed(true);
        setOffline(isConnectivityError(err));
      });
  };

  useEffect(load, []);

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="Toon of the Day" showBack />}>
      {failed ? (
        offline ? (
          <FeedEmptyState {...CONNECTIVITY_ERROR_COPY} onRetry={load} />
        ) : (
          <FeedEmptyState title="Couldn't load cartoons" message="Something went wrong on our end. Try again shortly." onRetry={load} />
        )
      ) : items === null ? (
        <FeedLoadingState />
      ) : items.length === 0 ? (
        <FeedEmptyState title="Nothing here yet" message="No cartoons have been published yet." />
      ) : (
        <FlatList
          data={items}
          numColumns={COLUMNS}
          contentContainerStyle={{ padding: space.md, paddingBottom: 140 }}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setViewing(item)}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              style={{ flex: 1, margin: space.xs }}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={{ aspectRatio: 1, borderRadius: radius.button, backgroundColor: theme.bgCard }} />
              ) : (
                <View style={{ aspectRatio: 1, borderRadius: radius.button, backgroundColor: theme.bgCard }} />
              )}
              <Text
                style={[type.sectionHeadline, { color: theme.ink, marginTop: space.xs, fontSize: 15, lineHeight: 19 }]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </Pressable>
          )}
        />
      )}

      <Modal visible={!!viewing} transparent animationType="fade" onRequestClose={() => setViewing(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' }}>
          <Pressable
            onPress={() => setViewing(null)}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={{ position: 'absolute', top: 56, right: space.lg, zIndex: 1, padding: space.sm }}
          >
            <Feather name="x" size={28} color="#FFFFFF" />
          </Pressable>
          {viewing?.imageUrl && (
            <Image source={{ uri: viewing.imageUrl }} style={{ width: '100%', height: '70%' }} resizeMode="contain" />
          )}
          {viewing && (
            <Text style={[type.bodyUI, { color: '#FFFFFF', padding: space.lg, textAlign: 'center' }]}>{viewing.title}</Text>
          )}
        </View>
      </Modal>
    </Screen>
  );
}
