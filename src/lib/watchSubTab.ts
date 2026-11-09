// Lets GlobalTabBar (rendered once at the root, outside every screen — see its own comment) know
// which WatchListenScreen sub-tab is active, so it can auto-collapse itself over Shorts' full-bleed
// video without WatchListenScreen reaching up into root-level navigation state to do it. Same
// subscribe-to-a-module-store shape as tts.ts/GlobalAudioPlayer, for the same reason: the reader
// and the root bar need to agree on state that doesn't fit in React Navigation's own route state.
export type WatchSubTab = 'Shorts' | 'Videos' | null;

let current: WatchSubTab = null;
const listeners = new Set<(tab: WatchSubTab) => void>();

export function setActiveWatchSubTab(tab: WatchSubTab) {
  current = tab;
  listeners.forEach((l) => l(current));
}

export function getActiveWatchSubTab(): WatchSubTab {
  return current;
}

export function subscribeActiveWatchSubTab(cb: (tab: WatchSubTab) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
