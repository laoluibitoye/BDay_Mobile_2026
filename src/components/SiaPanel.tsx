import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { radius, space, type, useTheme } from '../theme';

// design.md §6 "Sia chat panel" — inline, not a full-screen takeover.
// Phase 1 note: responses are canned/stubbed until Sia's backend API is confirmed (IMPLEMENTATION_PLAN.md §14.2).
export function SiaPanel({ articleHeadline }: { articleHeadline: string }) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<{ from: 'user' | 'sia'; text: string }[]>([]);
  const [draft, setDraft] = useState('');

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: 'user', text }]);
    setDraft('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: 'sia',
          text: `(Prototype response) Here's a quick take on "${articleHeadline}" — this is a placeholder until Sia's live backend is connected.`,
        },
      ]);
    }, 500);
  };

  return (
    <View style={[styles.panel, { backgroundColor: theme.bgCard, borderColor: theme.rule }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <Text style={[type.label, { color: '#fff' }]}>S</Text>
        </View>
        <Text style={[type.label, { color: theme.ink }]}>Sia</Text>
      </View>

      {messages.map((m, i) => (
        <View
          key={i}
          style={[
            styles.bubble,
            m.from === 'user'
              ? { alignSelf: 'flex-end', backgroundColor: theme.accentTint }
              : { alignSelf: 'flex-start', backgroundColor: theme.bgCard, borderWidth: 1, borderColor: theme.rule },
          ]}
        >
          <Text style={[type.bodyUI, { color: theme.ink }]}>{m.text}</Text>
        </View>
      ))}

      <Pressable
        style={[styles.chip, { borderColor: theme.rule }]}
        onPress={() => send('Summarise this for me')}
      >
        <Text style={[type.label, { color: theme.ink }]}>Summarise this for me</Text>
      </Pressable>

      <View style={[styles.inputRow, { borderColor: theme.rule }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask Sia about this article..."
          placeholderTextColor={theme.inkFaint}
          style={[type.bodyUI, { flex: 1, color: theme.ink }]}
          onSubmitEditing={() => send(draft)}
        />
        <Pressable onPress={() => send(draft)}>
          <Feather name="arrow-up-circle" size={22} color={theme.accent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: radius.card, padding: space.lg, marginTop: space.xl, gap: space.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.xs },
  avatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bubble: { borderRadius: radius.card, padding: space.md, maxWidth: '85%' },
  chip: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: radius.pill, paddingVertical: space.xs, paddingHorizontal: space.md },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    marginTop: space.xs,
  },
});
