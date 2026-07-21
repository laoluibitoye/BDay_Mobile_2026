import React, { createContext, useContext } from 'react';
import type { View } from 'react-native';

// Android-only plumbing: `BlurView`'s real native blur (`dimezisBlurViewSdk31Plus`) needs an
// explicit ref to the content view it should sample, unlike iOS's `UIVisualEffectView`, which
// blurs whatever's behind it automatically. `RootNavigator` wraps the whole app in a
// `BlurTargetView` and publishes its ref here so any glass surface (`GlobalTabBar`, `GlassSheet`)
// can consume it without prop-drilling through every screen in between.
const BlurTargetContext = createContext<React.RefObject<View | null> | undefined>(undefined);

export const BlurTargetProvider = BlurTargetContext.Provider;

export function useBlurTarget(): React.RefObject<View | null> | undefined {
  return useContext(BlurTargetContext);
}
