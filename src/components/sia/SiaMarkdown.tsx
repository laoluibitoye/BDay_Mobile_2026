import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fontFamily, radius, space, type, useTheme, type Theme } from '../../theme';
import type { Block, Inline } from '../../lib/sia/markdown';

type Props = {
  blocks: Block[];
  // A BusinessDay story: opens in the app's own reader.
  onOpenArticle: (url: string) => void;
  // Anything else (already restricted to https by the parser).
  onOpenLink: (url: string) => void;
};

type Ctx = Pick<Props, 'onOpenArticle' | 'onOpenLink'> & { theme: Theme };

const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });
const TABLE_COLUMN_WIDTH = 148;

function renderInlines(nodes: Inline[], ctx: Ctx, keyPrefix: string): React.ReactNode[] {
  return nodes.map((node, i) => {
    const key = `${keyPrefix}.${i}`;
    switch (node.t) {
      case 'text':
        return node.text;
      case 'br':
        return '\n';
      case 'strong':
        return (
          <Text key={key} style={{ fontFamily: fontFamily.uiBold }}>
            {renderInlines(node.children, ctx, key)}
          </Text>
        );
      case 'em':
        // Inter is loaded without an italic face, and iOS ignores fontStyle for a family that lacks one —
        // so emphasis is carried by weight as well, and still reads as emphasis where italics do render.
        return (
          <Text key={key} style={{ fontFamily: fontFamily.uiMedium, fontStyle: 'italic' }}>
            {renderInlines(node.children, ctx, key)}
          </Text>
        );
      case 'del':
        return (
          <Text key={key} style={{ textDecorationLine: 'line-through' }}>
            {renderInlines(node.children, ctx, key)}
          </Text>
        );
      case 'code':
        return (
          <Text key={key} style={{ fontFamily: MONO, fontSize: 13, backgroundColor: ctx.theme.bg }}>
            {node.text}
          </Text>
        );
      case 'link':
        return (
          <Text
            key={key}
            accessibilityRole="link"
            style={{ color: ctx.theme.accentDeep, textDecorationLine: 'underline' }}
            onPress={() => (node.kind === 'article' ? ctx.onOpenArticle(node.href) : ctx.onOpenLink(node.href))}
          >
            {renderInlines(node.children, ctx, key)}
          </Text>
        );
    }
  });
}

function displayUrl(href: string): string {
  return href.replace(/^https:\/\//, '');
}

function renderBlocks(blocks: Block[], ctx: Ctx, keyPrefix: string): React.ReactNode[] {
  const { theme } = ctx;
  return blocks.map((block, i) => {
    const key = `${keyPrefix}.${i}`;
    switch (block.t) {
      case 'paragraph':
        return (
          <Text key={key} selectable style={[type.bodyUI, { color: theme.ink }]}>
            {renderInlines(block.children, ctx, key)}
          </Text>
        );

      case 'heading':
        return (
          <Text
            key={key}
            accessibilityRole="header"
            style={[type.label, { fontFamily: fontFamily.uiBold, fontSize: block.depth <= 2 ? 16 : 15, lineHeight: 22, color: theme.ink, marginTop: space.xs }]}
          >
            {renderInlines(block.children, ctx, key)}
          </Text>
        );

      case 'list':
        return (
          <View key={key} style={{ gap: space.xs }}>
            {block.items.map((item, itemIndex) => (
              <View key={`${key}.${itemIndex}`} style={styles.listRow}>
                <Text style={[type.bodyUI, styles.listMarker, { color: theme.inkMuted }]}>
                  {block.ordered ? `${block.start + itemIndex}.` : '•'}
                </Text>
                <View style={styles.listBody}>{renderBlocks(item, ctx, `${key}.${itemIndex}`)}</View>
              </View>
            ))}
          </View>
        );

      case 'quote':
        return (
          <View key={key} style={[styles.quote, { borderLeftColor: theme.rule }]}>
            {renderBlocks(block.children, ctx, key)}
          </View>
        );

      case 'code':
        return (
          <View key={key} style={[styles.codeBlock, { backgroundColor: theme.bg, borderColor: theme.rule }]}>
            <Text selectable style={{ fontFamily: MONO, fontSize: 13, lineHeight: 19, color: theme.ink }}>
              {block.text.replace(/\n$/, '')}
            </Text>
          </View>
        );

      case 'table': {
        const rows = [block.header, ...block.rows];
        return (
          // Wide tables scroll sideways inside the bubble rather than squashing their columns.
          <ScrollView key={key} horizontal showsHorizontalScrollIndicator={false} style={[styles.table, { borderColor: theme.rule }]}>
            <View>
              {rows.map((row, rowIndex) => (
                <View
                  key={`${key}.r${rowIndex}`}
                  style={[styles.tableRow, rowIndex > 0 && { borderTopWidth: 1, borderTopColor: theme.rule }, rowIndex === 0 && { backgroundColor: theme.bg }]}
                >
                  {row.map((cell, cellIndex) => (
                    <View key={`${key}.r${rowIndex}.c${cellIndex}`} style={styles.tableCell}>
                      <Text
                        style={[type.caption, { color: theme.ink, lineHeight: 18 }, rowIndex === 0 && { fontFamily: fontFamily.uiBold }]}
                      >
                        {renderInlines(cell, ctx, `${key}.r${rowIndex}.c${cellIndex}`)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        );
      }

      case 'rule':
        return <View key={key} style={{ height: 1, backgroundColor: theme.rule, marginVertical: space.xs }} />;

      case 'sourceCard':
        return (
          <Pressable
            key={key}
            onPress={() => ctx.onOpenArticle(block.href)}
            accessibilityRole="link"
            accessibilityLabel={`Open story: ${block.title}`}
            style={({ pressed }) => [styles.card, { backgroundColor: pressed ? theme.accentTint : theme.bg, borderColor: theme.rule }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[type.label, { color: theme.ink }]} numberOfLines={3}>
                {block.title}
              </Text>
              <Text style={[type.caption, { color: theme.inkFaint, marginTop: 2 }]} numberOfLines={1}>
                {displayUrl(block.href)}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={theme.inkMuted} />
          </Pressable>
        );
    }
  });
}

// Sia's replies are parsed into a safe tree (lib/sia/markdown.ts) — this only ever draws that tree, so
// nothing a reply contains can run, load, or navigate anywhere it hasn't been vetted for.
export function SiaMarkdown({ blocks, onOpenArticle, onOpenLink }: Props) {
  const { theme } = useTheme();
  return <View style={{ gap: space.sm }}>{renderBlocks(blocks, { theme, onOpenArticle, onOpenLink }, 'md')}</View>;
}

const styles = StyleSheet.create({
  listRow: { flexDirection: 'row', gap: space.sm },
  listMarker: { minWidth: 18, textAlign: 'right' },
  listBody: { flex: 1, gap: space.xs },
  quote: { borderLeftWidth: 3, paddingLeft: space.md, gap: space.xs },
  codeBlock: { borderWidth: 1, padding: space.sm, borderRadius: radius.button },
  table: { borderWidth: 1, borderRadius: radius.button },
  tableRow: { flexDirection: 'row' },
  tableCell: { width: TABLE_COLUMN_WIDTH, paddingHorizontal: space.sm, paddingVertical: space.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderRadius: radius.button,
    padding: space.md,
    minHeight: 44,
  },
});
