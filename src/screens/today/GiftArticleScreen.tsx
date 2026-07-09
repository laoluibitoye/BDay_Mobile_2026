import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { GlassSheet } from '../../components/GlassSheet';
import { articles, breakingArticle } from '../../data/mock';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GiftArticle'>;
const allArticles = [...articles, breakingArticle];

// design.md §4 "Gift-article sheet" — same transparentModal + glass treatment as Paywall.
export function GiftArticleScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const article = allArticles.find((a) => a.id === route.params.articleId) ?? articles[0];

  return (
    <View style={styles.container}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => navigation.goBack()} />
      <GlassSheet style={styles.sheet}>
        {sent ? (
          <View style={{ alignItems: 'center', paddingVertical: space.lg }}>
            <Feather name="gift" size={32} color={theme.accent} />
            <Text style={[type.sectionHeadline, { color: theme.ink, marginTop: space.md }]}>Gift sent</Text>
            <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs, textAlign: 'center' }]}>
              {email || 'Your recipient'} can read this article free, no subscription required.
            </Text>
            <View style={{ marginTop: space.xl, alignSelf: 'stretch' }}>
              <Button label="Done" onPress={() => navigation.goBack()} fullWidth />
            </View>
          </View>
        ) : (
          <>
            <Text style={[type.articleHeadline, { color: theme.ink }]}>Gift this article</Text>
            <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.sm }]} numberOfLines={2}>
              {article.headline}
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Recipient's email"
              placeholderTextColor={theme.inkFaint}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { borderColor: theme.rule, color: theme.ink }]}
            />
            <View style={{ marginTop: space.lg, gap: space.md }}>
              <Button label="Send gift link" onPress={() => setSent(true)} fullWidth />
              <Pressable onPress={() => navigation.goBack()}>
                <Text style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center' }]}>Cancel</Text>
              </Pressable>
            </View>
            <Text style={[type.mono, { color: theme.inkFaint, textAlign: 'center', marginTop: space.lg }]}>
              PREMIUM SUBSCRIBERS GET 5 GIFT ARTICLES A MONTH
            </Text>
          </>
        )}
      </GlassSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17,17,17,0.45)' },
  sheet: { padding: space.xl, paddingBottom: space.xxxl },
  input: {
    borderWidth: 1,
    borderRadius: radius.button,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    marginTop: space.lg,
  },
});
