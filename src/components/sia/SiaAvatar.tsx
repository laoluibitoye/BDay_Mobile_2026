import React from 'react';
import { Image, View } from 'react-native';

// The website widget's Sia avatar (the robot with the BD face), cropped to the head-and-shoulders window its
// circular avatars use and scaled down to 192px: assets/brand/sia-icon.jpg.
const SIA_ICON = require('../../../assets/brand/sia-icon.jpg');

type Props = {
  size: number;
  // An optional ring drawn around the icon, inside `size`.
  ring?: { width: number; color: string };
};

// Purely decorative: whatever it sits in carries the accessible name ("Ask Sia about this article", "Sia").
export function SiaAvatar({ size, ring }: Props) {
  const ringWidth = ring?.width ?? 0;
  const inner = size - ringWidth * 2;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: ring?.color, alignItems: 'center', justifyContent: 'center' }}
    >
      <Image source={SIA_ICON} style={{ width: inner, height: inner, borderRadius: inner / 2 }} />
    </View>
  );
}
