import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { wpFlipbookReaderUrl } from '../../lib/api/wpClient';

type Props = NativeStackScreenProps<RootStackParamList, 'FlipBook'>;

// A signed edition PDF, read like a magazine — swipe/tap to turn pages, pinch to zoom, or just
// download. Points at the theme's own flipbook-reader.php over WebView rather than a native PDF
// viewer, so the website and the app share one page-flip implementation.
export function FlipBookScreen({ route }: Props) {
  const { pdfUrl } = route.params;
  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
      <AppHeader variant="compact" showBack />
      <WebView
        source={{ uri: wpFlipbookReaderUrl(pdfUrl) }}
        style={{ flex: 1, backgroundColor: '#1a1a1a' }}
        allowsInlineMediaPlayback
        originWhitelist={['*']}
      />
    </View>
  );
}
