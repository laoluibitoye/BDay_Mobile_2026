import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { getOffTheClock, type OffTheClockItem, type OffTheClockTab } from '../lib/api/offTheClock';
import { fontFamily, layout, radius, space, type, useTheme } from '../theme';
import { SectionLabel } from './SectionLabel';

// "Off the Clock" — an admin-editable set of lifestyle categories (Appearance -> BusinessDay
// Theme -> Off the Clock on the website), each rendered as its own tab: the category's latest
// post with a thumbnail, plus two more headline-only. Mirrors the website's own section exactly,
// down to reading the same admin-configured category list via the connector plugin. Renders
// nothing if no category in the list currently has any posts, same self-fetch/hide-on-empty
// pattern as MarketTickerStrip.tsx.
export function OffTheClockSection() {
  const { theme } = useTheme();
  const [tabs, setTabs] = useState<OffTheClockTab[] | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    getOffTheClock()
      .then((res) => setTabs(res.tabs))
      .catch(() => setTabs([]));
  }, []);

  if (!tabs || tabs.length === 0) return null;

  const tab = tabs[Math.min(active, tabs.length - 1)];
  const [lead, ...more] = tab.items;
  if (!lead) return null;

  const open = (item: OffTheClockItem) => void WebBrowser.openBrowserAsync(item.link);

  return (
    <View style={{ marginBottom: layout.sectionGap }}>
      <SectionLabel label="Off the Clock" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: space.md }}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {tabs.map((t, i) => {
            const isActive = i === active;
            return (
              <Pressable
                key={t.categorySlug}
                onPress={() => setActive(i)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                style={{
                  paddingVertical: space.xs,
                  paddingHorizontal: space.lg,
                  borderRadius: radius.pill,
                  backgroundColor: isActive ? theme.ink : theme.bgCard,
                  borderWidth: isActive ? 0 : 1,
                  borderColor: theme.rule,
                }}
              >
                <Text style={[type.label, { color: isActive ? theme.bg : theme.ink }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Pressable onPress={() => open(lead)} accessibilityRole="button">
        {lead.imageUrl && (
          <Image
            source={{ uri: lead.imageUrl }}
            style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: radius.card, marginBottom: space.sm }}
            resizeMode="cover"
          />
        )}
        <Text style={[type.sectionHeadline, { color: theme.ink }]} numberOfLines={3}>
          {lead.headline}
        </Text>
      </Pressable>

      {more.length > 0 && (
        <View style={{ marginTop: space.md, gap: space.sm }}>
          {more.map((item) => (
            <Pressable key={item.id} onPress={() => open(item)} accessibilityRole="button">
              {/* Bold + small, not type.bodyUI — a plain-weight body-sized title here would read as
                  the lead article's own body copy rather than a second, separate headline. */}
              <Text
                style={{ fontFamily: fontFamily.uiBold, fontSize: 13, lineHeight: 17, color: theme.ink }}
                numberOfLines={2}
              >
                {item.headline}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
