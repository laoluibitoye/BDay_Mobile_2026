import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { space, type, useTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { theme } = useTheme();

  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Onboarding'), 900);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.ink }]}>
      <Text style={[type.displayHeadline, { color: theme.bg }]}>BusinessDay</Text>
      <Text style={[type.mono, { color: theme.accent, marginTop: space.sm }]}>
        AFRICA’S BUSINESS INTELLIGENCE
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
