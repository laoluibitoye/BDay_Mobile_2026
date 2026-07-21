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
  scrollRef?: React.RefObject<ScrollView | null>;
};

export function Screen({ children, header, scroll = true, style, edges = ['top'], scrollRef }: Props) {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]} edges={edges}>
      {header}
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[{ paddingBottom: 120 }, style]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.flex}>
          <View style={[styles.flex, style]}>{children}</View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
