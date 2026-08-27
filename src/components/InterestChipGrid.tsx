import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useInterestCategories } from '../hooks/useInterestCategories';
import { layout, radius, space, type, useTheme } from '../theme';

// Shared by every screen that lets a reader pick topics to follow (onboarding's InterestPicker,
// Settings > Interests, Settings > Feed Settings) — one real category list, one selection UI,
// so "following a topic" means the same real WordPress category everywhere in the app, matching
// the web reader SDK's interest-picker.ts.
export function InterestChipGrid({
  selectedIds,
  onToggle,
  maxCount,
}: {
  selectedIds: string[];
  onToggle: (id: string, name: string) => void;
  maxCount: number;
}) {
  const { theme } = useTheme();
  const { categories, loading } = useInterestCategories();
  // Counts only ids that match a real, currently-fetched category — a reader who followed
  // categories before this screen fetched real WP data (back when termId was a fake string like
  // "Banking") would otherwise sit permanently "at cap" with nothing visibly selected, since none
  // of those old ids can ever match a real numeric category id again.
  const validSelectedCount = categories.filter((c) => selectedIds.includes(c.id)).length;
  const atCap = validSelectedCount >= maxCount;

  if (loading) {
    return (
      <View style={{ paddingVertical: space.xl, alignItems: 'center' }}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <Text style={[type.bodyUI, { color: theme.inkMuted, marginTop: space.lg }]}>
        Couldn't load topics right now — try again later.
      </Text>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: layout.chipGap, marginTop: space.xl }}>
      {categories.map((category) => {
        const active = selectedIds.includes(category.id);
        const disabled = !active && atCap;
        return (
          <Pressable
            key={category.id}
            onPress={() => onToggle(category.id, category.name)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled }}
            style={{
              borderWidth: 1,
              borderRadius: radius.pill,
              paddingVertical: layout.chipPaddingV,
              paddingHorizontal: space.lg,
              opacity: disabled ? 0.4 : 1,
              borderColor: active ? theme.accent : theme.rule,
              backgroundColor: active ? theme.accentTint : theme.bgCard,
            }}
          >
            <Text style={[type.label, { color: active ? theme.accentDeep : theme.ink }]}>{category.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
