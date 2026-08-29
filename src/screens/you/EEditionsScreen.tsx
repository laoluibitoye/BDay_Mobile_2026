import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Linking, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { AppHeader } from '../../components/AppHeader';
import { FeedEmptyState } from '../../components/FeedEmptyState';
import { useAppState } from '../../state/AppState';
import {
  getEditionDownloadUrl,
  getEditionPublications,
  getEditionsForPublication,
  type EditionListing,
} from '../../lib/api/editions';
import { ApiError } from '../../lib/api/client';
import { radius, space, type, useTheme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'EEditions'>;

// Falls back to a titleized version of the slug for a publication term this map doesn't know
// about yet — the taxonomy is admin-editable on the theme (wp-admin → E-Editions → Publications),
// so a brand-new one shouldn't require an app update just to get a readable label.
const KNOWN_LABELS: Record<string, string> = {
  'e-paper': 'E-Paper',
  'she-means-business': 'She Means Business',
  'real-estate-digest': 'Real Estate Digest',
  weekender: 'Weekender',
};

function labelFor(slug: string): string {
  return KNOWN_LABELS[slug] ?? slug.split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// Browses the full E-Edition archive across every publication the theme's `bday_edition` CPT
// defines — Today's Paper's own inline date strip only ever covers the last 7 days of the single
// "e-paper" publication; this is the real, subscription-gated archive across all of them.
export function EEditionsScreen({ route }: Props) {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { authUser } = useAppState();
  const [publications, setPublications] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [activePublication, setActivePublication] = useState<string | null>(route.params?.publication ?? null);
  const [editions, setEditions] = useState<EditionListing[] | null>(null);
  const [editionsFailed, setEditionsFailed] = useState(false);
  const [downloadingDate, setDownloadingDate] = useState<string | null>(null);

  const loadPublications = () => {
    setFailed(false);
    getEditionPublications()
      .then((pubs) => {
        setPublications(pubs);
        setActivePublication((prev) => prev ?? pubs[0] ?? null);
      })
      .catch(() => setFailed(true));
  };

  useEffect(loadPublications, []);

  const loadEditions = () => {
    if (!activePublication) return;
    setEditionsFailed(false);
    setEditions(null);
    getEditionsForPublication(activePublication)
      .then(setEditions)
      .catch(() => setEditionsFailed(true));
  };

  useEffect(loadEditions, [activePublication]);

  const withSignedUrl = async (item: EditionListing, onReady: (url: string) => void) => {
    if (!activePublication) return;
    if (item.locked) {
      Alert.alert("Outside your plan's archive window", 'Upgrade your plan to open editions this far back.', [{ text: 'OK' }]);
      return;
    }
    setDownloadingDate(item.date);
    try {
      const { url } = await getEditionDownloadUrl(item.date, activePublication);
      onReady(url);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        Alert.alert("Outside your plan's archive window", 'Upgrade your plan to open editions this far back.');
      } else {
        Alert.alert('Something went wrong', "We couldn't open that edition. Please try again.");
      }
    } finally {
      setDownloadingDate(null);
    }
  };

  // No individual articles to read/mark for any publication but E-Paper (Today's Paper covers
  // that one already, separately) — every edition here is just a PDF, so tapping a row opens the
  // shared flip-through reader (see wpFlipbookReaderUrl) rather than a plain download. The
  // download icon stays as a direct secondary action for anyone who'd rather just have the file.
  const readEdition = (item: EditionListing) =>
    withSignedUrl(item, (url) => navigation.navigate('FlipBook', { pdfUrl: url }));

  const downloadEdition = (item: EditionListing) => withSignedUrl(item, (url) => void Linking.openURL(url));

  return (
    <Screen scroll={false} header={<AppHeader variant="compact" title="E-Editions" showBack />}>
      {!authUser ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState title="Sign in required" message="Sign in to browse and download E-Edition archives." />
        </View>
      ) : failed ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState title="Couldn't load publications" message="Check your connection and try again." onRetry={loadPublications} />
        </View>
      ) : publications === null ? null : publications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FeedEmptyState title="No editions yet" message="No E-Editions have been published yet." />
        </View>
      ) : (
        <>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={publications}
            keyExtractor={(p) => p}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.sm }}
            renderItem={({ item: pub }) => {
              const active = pub === activePublication;
              return (
                <Pressable
                  onPress={() => setActivePublication(pub)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={{
                    paddingVertical: space.xs,
                    paddingHorizontal: space.lg,
                    borderRadius: radius.pill,
                    backgroundColor: active ? theme.ink : theme.bgCard,
                    borderWidth: active ? 0 : 1,
                    borderColor: theme.rule,
                  }}
                >
                  <Text style={[type.label, { color: active ? theme.bg : theme.ink }]}>{labelFor(pub)}</Text>
                </Pressable>
              );
            }}
          />

          {editionsFailed ? (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <FeedEmptyState title="Couldn't load editions" message="Check your connection and try again." onRetry={loadEditions} />
            </View>
          ) : editions === null ? null : editions.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <FeedEmptyState title="No editions yet" message="No editions have been published for this title yet." />
            </View>
          ) : (
            <FlatList
              data={editions}
              keyExtractor={(e) => e.date}
              contentContainerStyle={{ padding: space.lg, paddingBottom: 140, gap: space.md }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => readEdition(item)}
                  disabled={downloadingDate === item.date}
                  accessibilityRole="button"
                  accessibilityLabel={`Read the ${formatDate(item.date)} edition`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.md,
                    padding: space.lg,
                    borderRadius: radius.card,
                    borderWidth: 1,
                    borderColor: theme.rule,
                    backgroundColor: theme.bgCard,
                    opacity: downloadingDate === item.date ? 0.6 : 1,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: item.locked ? theme.rule : theme.accentTint,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name={item.locked ? 'lock' : 'book-open'} size={18} color={item.locked ? theme.inkFaint : theme.accentDeep} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[type.label, { color: theme.ink }]}>{formatDate(item.date)}</Text>
                    {item.locked ? (
                      <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>Outside your plan's archive window</Text>
                    ) : (
                      <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>Tap to read · flip through like a magazine</Text>
                    )}
                  </View>
                  {!item.locked && (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        downloadEdition(item);
                      }}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Download the ${formatDate(item.date)} edition`}
                    >
                      <Feather name="download" size={18} color={theme.inkMuted} />
                    </Pressable>
                  )}
                </Pressable>
              )}
            />
          )}
        </>
      )}
    </Screen>
  );
}
