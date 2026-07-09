import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../navigation/types';
import { personas } from '../../data/mock';
import { Button } from '../../components/Button';
import { radius, space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonaSelection'>;

export function PersonaSelectionScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[type.articleHeadline, { color: theme.ink }]}>Which best describes you?</Text>
      <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.xs }]}>
        We'll use this to prioritize what shows up first — you can change it later.
      </Text>

      <View style={{ marginTop: space.xl, gap: space.md }}>
        {personas.map((p) => {
          const active = selected === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelected(p.id)}
              style={[
                styles.card,
                {
                  borderColor: active ? theme.accent : theme.rule,
                  backgroundColor: active ? theme.accentTint : theme.bgCard,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { color: theme.ink }]}>{p.label}</Text>
                <Text style={[type.caption, { color: theme.inkMuted, marginTop: 2 }]}>{p.description}</Text>
              </View>
              {active && <Feather name="check-circle" size={20} color={theme.accent} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button label="Continue" onPress={() => navigation.navigate('InterestPicker')} fullWidth />
        <Text
          style={[type.caption, { color: theme.inkMuted, textAlign: 'center', marginTop: space.md }]}
          onPress={() => navigation.navigate('InterestPicker')}
        >
          Skip for now
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: space.xl, paddingTop: space.huge },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: space.lg,
  },
  footer: { marginTop: space.xl },
});
