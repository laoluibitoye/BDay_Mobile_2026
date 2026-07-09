import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

type Props = {
  children: React.ReactNode;
  header?: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function Screen({ children, header, scroll = true, style, edges = ['top'] }: Props) {
  const { theme } = useTheme();
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]} edges={edges}>
      {header}
      <Container
        style={styles.flex}
        contentContainerStyle={scroll ? [{ paddingBottom: 120 }, style] : undefined}
      >
        {scroll ? children : <View style={[styles.flex, style]}>{children}</View>}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
