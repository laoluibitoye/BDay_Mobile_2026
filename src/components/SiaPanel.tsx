import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space, type, useTheme } from '../theme';

const FAB_SIZE = 52;

// design.md §6 "Sia chat panel" — floating widget (FAB), lower-right, above the tab bar. Show
// only for now, per explicit direction: no chat backend exists yet, so this doesn't pretend to
// answer — it just confirms the surface is coming, rather than faking responses.
export function SiaPanel({ articleHeadline }: { articleHeadline: string }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.fab, { bottom: insets.bottom + 96, backgroundColor: theme.accent, shadowColor: theme.ink }]}
        accessibilityRole="button"
        accessibilityLabel="Ask Sia about this article"
      >
        <Text style={[type.label, { color: '#FFFFFF', fontSize: 18 }]}>S</Text>
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close Sia" />
        <View style={styles.centerWrap}>
          <View style={[styles.card, { backgroundColor: theme.bg }]}>
            <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
              <Text style={[type.label, { color: '#fff' }]}>S</Text>
            </View>
            <Text style={[type.label, { color: theme.ink, marginTop: space.md }]}>Sia</Text>
            <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs, textAlign: 'center' }]}>
              Your AI reading assistant for "{articleHeadline}" is coming soon.
            </Text>
            <Pressable
              onPress={() => setOpen(false)}
              style={[styles.closeButton, { backgroundColor: theme.accentTint }]}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Feather name="x" size={16} color={theme.accentDeep} />
            </Pressable>
          </View>
        </View>
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
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17,17,17,0.4)' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  card: { borderRadius: radius.card * 1.5, padding: space.xl, alignItems: 'center', width: '100%', maxWidth: 320 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  closeButton: {
    marginTop: space.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
