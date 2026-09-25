import { Platform } from 'react-native';

// react-native-youtube-iframe drives its player by postMessage-ing play/pause/mute commands into
// the player page, which listens with `window.addEventListener('message', ...)`.
//
// Bug found live on Android: those commands never arrived, so a `play` prop change did nothing and
// the hero video sat on YouTube's own thumbnail + "Watch on YouTube" overlay (the player reported
// ready, but no state change ever followed). react-native-webview delivers postMessage differently
// per platform — iOS dispatches a bubbling event on `window`, Android dispatches a NON-bubbling
// `MessageEvent` on `document` (RNCWebViewManagerImpl.kt), which a `window` listener never sees.
//
// This forwards Android's document-level message on to `window` so the library's listener fires.
// It re-dispatches on `window` (not `document`), so it can't loop, and it's not applied on iOS
// where the event already lands on `window`.
const ANDROID_MESSAGE_BRIDGE = `
  document.addEventListener('message', function (e) {
    window.dispatchEvent(new MessageEvent('message', { data: e.data }));
  });
  true;
`;

export const youtubeWebViewProps =
  Platform.OS === 'android' ? { injectedJavaScriptBeforeContentLoaded: ANDROID_MESSAGE_BRIDGE } : {};
