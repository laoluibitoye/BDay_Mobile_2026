import React, { memo, useCallback, useMemo, useRef } from 'react';
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { radius, space, type, useTheme } from '../../theme';
import { MAX_QUERY_CHARS, type ChatMessage, type ChatState, type SiaChatEngine } from '../../lib/sia/engine';
import { parseMarkdown } from '../../lib/sia/markdown';
import { SiaMarkdown } from './SiaMarkdown';

// Same starter questions the website widget offers, plus the design spec's "Summarise this for me" quick action.
const ARTICLE_STARTERS = [
  'Summarise this for me',
  'What is the main takeaway or strategy here?',
  'How did we get here? Give me some background context.',
  'Who are the key players and stakeholders affected?',
];
const GENERAL_STARTERS = [
  'What are the key BusinessDay stories I need to know today?',
  "Give me a quick briefing on today's market-moving news.",
  'What major economic indicators or policies are in the news today?',
];

export const SIA_DISCLAIMER = 'Sia is an AI assistant; verify critical data independently.';

type Props = {
  engine: SiaChatEngine | null;
  state: ChatState;
  // null = not reading an article (a general chat).
  articleHeadline: string | null;
  onOpenArticle: (url: string) => void;
  onOpenLink: (url: string) => void;
  bottomInset: number;
};

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function Chip({ label, onPress, icon = 'arrow-right' }: { label: string; onPress: () => void; icon?: 'arrow-right' | 'refresh-cw' }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.chip, { borderColor: theme.rule, backgroundColor: pressed ? theme.accentTint : 'transparent' }]}
    >
      <Text style={[type.label, { color: theme.ink, flex: 1 }]}>{label}</Text>
      <Feather name={icon} size={16} color={theme.accentDeep} />
    </Pressable>
  );
}

type MessageProps = {
  message: ChatMessage;
  onOpenArticle: (url: string) => void;
  onOpenLink: (url: string) => void;
  onRetry: (id: string) => void;
};

// Memoised: while an answer streams only the last message changes, so the rest of the thread doesn't re-render.
const SiaMessage = memo(function SiaMessage({ message, onOpenArticle, onOpenLink, onRetry }: MessageProps) {
  const { theme } = useTheme();
  const blocks = useMemo(
    () => (message.role === 'assistant' && message.status !== 'error' ? parseMarkdown(message.text) : []),
    [message.role, message.status, message.text],
  );

  if (message.role === 'user') {
    return (
      <View style={[styles.userBubble, { backgroundColor: theme.accentTint }]}>
        <Text selectable style={[type.bodyUI, { color: theme.ink }]}>
          {message.text}
        </Text>
      </View>
    );
  }

  const thinking = message.status === 'streaming' && message.text === '';
  return (
    <View style={[styles.botBubble, { backgroundColor: theme.bgCard, borderColor: theme.rule }]}>
      {thinking ? (
        <View style={styles.thinking} accessible accessibilityLabel="Sia is thinking">
          <ActivityIndicator size="small" color={theme.inkMuted} />
          <Text style={[type.caption, { color: theme.inkMuted }]}>Sia is thinking…</Text>
        </View>
      ) : message.status === 'error' ? (
        <Text style={[type.bodyUI, { color: theme.ink }]}>{message.text}</Text>
      ) : (
        <SiaMarkdown blocks={blocks} onOpenArticle={onOpenArticle} onOpenLink={onOpenLink} />
      )}

      {message.status === 'interrupted' && (
        <Text style={[type.caption, { color: theme.inkFaint, marginTop: space.sm }]}>This reply was interrupted.</Text>
      )}
      {(message.status === 'error' || message.status === 'interrupted') && !!message.retry && (
        <Pressable
          onPress={() => onRetry(message.id)}
          accessibilityRole="button"
          accessibilityLabel="Try again"
          style={styles.retry}
        >
          <Feather name="refresh-cw" size={14} color={theme.accentDeep} />
          <Text style={[type.label, { color: theme.accentDeep }]}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
});

export function SiaChat({ engine, state, articleHeadline, onOpenArticle, onOpenLink, bottomInset }: Props) {
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  // Follow the answer as it streams — unless the reader has scrolled up to re-read something.
  const stickToBottom = useRef(true);

  const send = useCallback(
    (text?: string) => {
      stickToBottom.current = true;
      void engine?.send(text);
    },
    [engine],
  );
  const retry = useCallback((id: string) => void engine?.retry(id), [engine]);
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    stickToBottom.current = contentSize.height - (contentOffset.y + layoutMeasurement.height) < 96;
  }, []);

  const hasMessages = state.messages.length > 0;
  const starters = articleHeadline ? ARTICLE_STARTERS : GENERAL_STARTERS;
  const showFollowups = !state.busy && state.followups.length > 0;
  const canSend = !!engine && state.ready && state.draft.trim().length > 0;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onScroll={onScroll}
        scrollEventThrottle={64}
        onContentSizeChange={() => {
          if (stickToBottom.current) scrollRef.current?.scrollToEnd({ animated: false });
        }}
      >
        {!hasMessages && (
          <View style={styles.empty}>
            <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
              <Text style={[type.label, { color: '#fff', fontSize: 20 }]}>S</Text>
            </View>
            <Text style={[type.sectionHeadline, { color: theme.ink, textAlign: 'center' }]}>Hi, I&apos;m Sia</Text>
            <Text style={[type.bodyUI, { color: theme.inkMuted, textAlign: 'center' }]}>
              {articleHeadline
                ? `Ask me anything about “${truncate(articleHeadline, 90)}”, or the reporting behind it.`
                : "Ask me about BusinessDay's reporting — I can summarise, add context, or find related stories."}
            </Text>
          </View>
        )}

        {!hasMessages && starters.map((starter) => <Chip key={starter} label={starter} onPress={() => send(starter)} />)}

        {state.messages.map((message) => (
          <SiaMessage key={message.id} message={message} onOpenArticle={onOpenArticle} onOpenLink={onOpenLink} onRetry={retry} />
        ))}

        {showFollowups && (
          <View style={{ gap: space.sm, marginTop: space.xs }}>
            <Text style={[type.mono, { color: theme.inkFaint, textTransform: 'uppercase' }]}>Explore next</Text>
            {state.followups.map((question) => (
              <Chip key={question} label={question} onPress={() => send(question)} />
            ))}
          </View>
        )}

        {hasMessages && !state.busy && (
          <Chip label="Start new conversation" icon="refresh-cw" onPress={() => engine?.newConversation()} />
        )}
      </ScrollView>

      {!!state.notice && (
        <Text
          accessibilityLiveRegion="polite"
          style={[type.caption, styles.notice, { color: theme.ink, backgroundColor: theme.accentTint }]}
        >
          {state.notice}
        </Text>
      )}

      <View style={[styles.inputRow, { borderTopColor: theme.rule, backgroundColor: theme.bg }]}>
        <TextInput
          value={state.draft}
          onChangeText={(text) => engine?.setDraft(text)}
          placeholder={articleHeadline ? 'Ask Sia about this article…' : 'Ask Sia a question…'}
          placeholderTextColor={theme.inkFaint}
          style={[styles.input, type.bodyUI, { color: theme.ink, borderColor: theme.rule, backgroundColor: theme.bgCard }]}
          multiline
          maxLength={MAX_QUERY_CHARS}
          // Return sends (a newline in a one-line question isn't useful); the send button does the same.
          submitBehavior="submit"
          returnKeyType="send"
          onSubmitEditing={() => send()}
          editable={!!engine && state.ready}
          accessibilityLabel="Ask Sia a question"
        />
        <Pressable
          onPress={state.busy ? () => engine?.stop() : () => send()}
          disabled={!state.busy && !canSend}
          accessibilityRole="button"
          accessibilityLabel={state.busy ? 'Stop answering' : 'Send question'}
          accessibilityState={{ disabled: !state.busy && !canSend }}
          style={[styles.send, { backgroundColor: theme.accent, opacity: !state.busy && !canSend ? 0.45 : 1 }]}
        >
          <Feather name={state.busy ? 'square' : 'send'} size={18} color="#fff" />
        </Pressable>
      </View>

      {/* Always shown: the model's own copy of this line is stripped, so this is the one place it lives. */}
      <Text style={[type.caption, styles.disclaimer, { color: theme.inkFaint, paddingBottom: Math.max(bottomInset, space.sm) }]}>
        {SIA_DISCLAIMER}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: space.lg, gap: space.md },
  empty: { alignItems: 'center', gap: space.sm, paddingVertical: space.lg },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  userBubble: { alignSelf: 'flex-end', maxWidth: '86%', padding: space.md, borderRadius: radius.button },
  botBubble: { alignSelf: 'flex-start', maxWidth: '100%', padding: space.md, borderWidth: 1, borderRadius: radius.button },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  retry: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44, marginTop: space.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.button,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
  },
  notice: { paddingVertical: space.sm, paddingHorizontal: space.lg, textAlign: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.md, borderTopWidth: 1 },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: radius.button,
    paddingHorizontal: space.md,
    paddingTop: space.sm + 2,
    paddingBottom: space.sm + 2,
  },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  disclaimer: { textAlign: 'center', paddingTop: space.sm, paddingHorizontal: space.lg },
});
