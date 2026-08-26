import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { CaptchaConfig } from '../lib/api/publicConfig';
import { space, type, useTheme } from '../theme';

const EXPIRED_MESSAGE = '__EXPIRED__';

// Sent back to the RN side via `window.ReactNativeWebView.postMessage`. Mirrors the two provider
// branches in sdk/src/captcha.ts (the web SDK's own captcha mounting logic) — reCAPTCHA and
// Turnstile have different script URLs/render APIs but the same "callback gets a token" shape.
function buildHtml(provider: CaptchaConfig['provider'], siteKey: string): string {
  if (provider === 'recaptcha') {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>body{margin:0;display:flex;justify-content:center;background:transparent;}</style>
      <script src="https://www.google.com/recaptcha/api.js?render=explicit" async defer></script>
    </head><body>
      <div id="captcha"></div>
      <script>
        window.onload = function poll() {
          if (window.grecaptcha && window.grecaptcha.render) {
            window.grecaptcha.render('captcha', {
              sitekey: '${siteKey}',
              callback: function (token) { window.ReactNativeWebView.postMessage(token); },
              'expired-callback': function () { window.ReactNativeWebView.postMessage('${EXPIRED_MESSAGE}'); }
            });
          } else {
            setTimeout(poll, 100);
          }
        };
      </script>
    </body></html>`;
  }

  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>body{margin:0;display:flex;justify-content:center;background:transparent;}</style>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  </head><body>
    <div id="captcha"></div>
    <script>
      window.onload = function poll() {
        if (window.turnstile && window.turnstile.render) {
          window.turnstile.render('#captcha', {
            sitekey: '${siteKey}',
            callback: function (token) { window.ReactNativeWebView.postMessage(token); },
            'expired-callback': function () { window.ReactNativeWebView.postMessage('${EXPIRED_MESSAGE}'); }
          });
        } else {
          setTimeout(poll, 100);
        }
      };
    </script>
  </body></html>`;
}

export function CaptchaWidget({
  provider,
  siteKey,
  onToken,
  onExpire,
}: {
  provider: CaptchaConfig['provider'];
  siteKey: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
}) {
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false);

  const handleMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    if (data === EXPIRED_MESSAGE) {
      onExpire?.();
      return;
    }
    if (data) {
      onToken(data);
    }
  };

  if (failed) {
    return (
      <Text style={[type.bodyUI, { color: theme.marketDown }]}>
        Couldn't load verification. Check your connection.
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: buildHtml(provider, siteKey), baseUrl: process.env.EXPO_PUBLIC_WP_BASE_URL }}
        onMessage={handleMessage}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
        scrollEnabled={false}
        style={styles.webview}
        // The widget itself paints a transparent background — without this the WebView shows an
        // opaque white/black rectangle while the challenge script is still loading.
        backgroundColor="transparent"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 76, marginTop: space.sm },
  webview: { flex: 1, backgroundColor: 'transparent' },
});
