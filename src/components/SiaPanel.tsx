import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space, type, useTheme } from '../theme';

const FAB_SIZE = 52;

// design.md §6 "Sia chat panel" — a floating widget (FAB → slide-up sheet), not an inline card
// taking up space in the article flow. Phase 1 note: responses are canned/stubbed until Sia's
// backend API is confirmed (IMPLEMENTATION_PLAN.md §14.2).
export function SiaPanel({ articleHeadline }: { articleHeadline: string }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
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
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.fab,
          { bottom: insets.bottom + 96, backgroundColor: theme.accent, shadowColor: theme.ink },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Ask Sia about this article"
      >
        <Text style={[type.label, { color: '#FFFFFF', fontSize: 18 }]}>S</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close Sia" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <View style={[styles.sheet, { backgroundColor: theme.bg, paddingBottom: insets.bottom + space.lg }]}>
            <View style={styles.grabber} />
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
                  <Text style={[type.label, { color: '#fff' }]}>S</Text>
                </View>
                <Text style={[type.label, { color: theme.ink }]}>Sia</Text>
              </View>
              <Pressable onPress={() => setOpen(false)} hitSlop={8} accessibilityLabel="Close">
                <Feather name="x" size={20} color={theme.inkMuted} />
              </Pressable>
            </View>

            <ScrollView style={styles.messages} contentContainerStyle={{ gap: space.sm }}>
              {messages.length === 0 && (
                <Text style={[type.bodyUI, { color: theme.inkMuted }]}>
                  Ask Sia about "{articleHeadline}" — get a quick summary or context.
                </Text>
              )}
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
            </ScrollView>

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
              <Pressable onPress={() => send(draft)} accessibilityRole="button" accessibilityLabel="Send message">
                <Feather name="arrow-up-circle" size={22} color={theme.accent} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: space.lg,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(17,17,17,0.4)' },
  sheetWrap: { justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.card * 1.5,
    borderTopRightRadius: radius.card * 1.5,
    padding: space.lg,
    maxHeight: '75%',
  },
  grabber: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: '#00000022', marginBottom: space.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  avatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  messages: { marginBottom: space.sm },
  bubble: { borderRadius: radius.card, padding: space.md, maxWidth: '85%' },
  chip: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: radius.pill, paddingVertical: space.xs, paddingHorizontal: space.md, marginBottom: space.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
});
