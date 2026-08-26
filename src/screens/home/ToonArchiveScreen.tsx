import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { getToons, type ToonItem } from '../../lib/api/toons';
import { space, type, useTheme } from '../../theme';

const COLUMNS = 2;

// Past editions of the real `cartoons` CPT — same content archive-cartoons.php shows on the
// website, via businessday-app-connector's /toons route.
export function ToonArchiveScreen() {
  const { theme } = useTheme();
  const [items, setItems] = useState<ToonItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [viewing, setViewing] = useState<ToonItem | null>(null);

  const load = () => {
    setFailed(false);
    getToons()
      .then((res) => setItems(res.items))
      .catch(() => setFailed(true));
  };

  useEffect(load, []);

  return (
    <Screen header={<AppHeader variant="compact" title="Toon of the Day" showBack />}>
      {failed ? (
        <FeedEmptyState title="Couldn't load cartoons" message="Check your connection and try again." onRetry={load} />
      ) : items === null ? null : items.length === 0 ? (
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
                <Image source={{ uri: item.imageUrl }} style={{ aspectRatio: 1, borderRadius: 8, backgroundColor: theme.bgCard }} />
              ) : (
                <View style={{ aspectRatio: 1, borderRadius: 8, backgroundColor: theme.bgCard }} />
              )}
              <Text style={[type.caption, { color: theme.inkMuted, marginTop: space.xs }]} numberOfLines={2}>
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
