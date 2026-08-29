import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { SectionLabel } from './SectionLabel';
import { getToons, type ToonItem } from '../lib/api/toons';
import { layout, radius, space, type, useTheme } from '../theme';

// The real `cartoons` CPT's latest post — same "Toon of the Day" the website's homepage shows.
// Renders nothing if there's no cartoon published yet, same self-fetch/hide-on-empty pattern as
// MarketTickerStrip.tsx.
export function ToonOfTheDayCard() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [toon, setToon] = useState<ToonItem | null | undefined>(undefined);
  const [viewing, setViewing] = useState(false);

  useEffect(() => {
    getToons()
      .then((res) => setToon(res.items[0] ?? null))
      .catch(() => setToon(null));
  }, []);

  if (!toon) return null;

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      <SectionLabel label="Toon of the Day" actionLabel="See all →" onPressAction={() => navigation.navigate('ToonArchive')} />
      <Pressable
        onPress={() => setViewing(true)}
        accessibilityRole="button"
        accessibilityLabel={toon.title}
        style={{ borderRadius: radius.card, overflow: 'hidden', backgroundColor: theme.bgCard }}
      >
        {toon.imageUrl && <Image source={{ uri: toon.imageUrl }} style={{ width: '100%', aspectRatio: 4 / 3 }} resizeMode="cover" />}
        <Text style={[type.sectionHeadline, { color: theme.ink, padding: space.sm }]} numberOfLines={1}>
          {toon.title}
        </Text>
      </Pressable>

      {/* Same full-screen viewer pattern as ToonArchiveScreen — tapping the cartoon itself should
          show the cartoon, not jump to the archive; "See all" above is the only way there. */}
      <Modal visible={viewing} transparent animationType="fade" onRequestClose={() => setViewing(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' }}>
          <Pressable
            onPress={() => setViewing(false)}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={{ position: 'absolute', top: 56, right: space.lg, zIndex: 1, padding: space.sm }}
          >
            <Feather name="x" size={28} color="#FFFFFF" />
          </Pressable>
          {toon.imageUrl && (
            <Image source={{ uri: toon.imageUrl }} style={{ width: '100%', height: '70%' }} resizeMode="contain" />
          )}
          <Text style={[type.bodyUI, { color: '#FFFFFF', padding: space.lg, textAlign: 'center' }]}>{toon.title}</Text>
        </View>
      </Modal>
    </View>
  );
}
