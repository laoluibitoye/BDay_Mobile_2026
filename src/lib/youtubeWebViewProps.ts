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

// Bug found live: the Shorts feed's video rendered pillarboxed inside a small 16:9 box pinned to
// the top of the screen, with the (correctly full-screen) static thumbnail Image showing straight
// through the rest of the WebView underneath it — the WebView itself fills the screen fine, but
// react-native-youtube-iframe's local player template hard-codes its video container to a
// responsive 16:9 embed via the classic `padding-bottom: 56.25%` CSS trick (PlayerScripts.js),
// regardless of the `height`/`width` props passed in. That's the right behavior for a normal
// horizontal embed (see HeroArticleCard.tsx, which relies on exactly that 16:9 box) but wrong for
// a full-bleed *vertical* Shorts player. This overrides that one rule once the player page has
// loaded so the video fills the real device height instead — apply this only where a full-bleed
// vertical player is actually wanted (ShortsScreen), never on a normal 16:9 embed.
const FILL_SCREEN_CSS = `
  (function () {
    var style = document.createElement('style');
    style.textContent = '.container { height: 100vh !important; padding-bottom: 0 !important; }';
    document.head.appendChild(style);
  })();
  true;
`;

export const fullBleedYoutubeWebViewProps = { injectedJavaScript: FILL_SCREEN_CSS };
