import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

// The app has no crash reporting wired up yet (no Sentry/Crashlytics), so a JS render exception
// in a production build previously just killed the app with zero information — this surfaces the
// actual error + component stack on screen instead, which is what field testers are hitting
// (e.g. reading an article) with no way to report what actually happened.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          {this.state.error.stack && <Text style={styles.stack}>{this.state.error.stack}</Text>}
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#111111', padding: 24, paddingTop: 72 },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  message: { color: '#FF7A66', fontSize: 15, marginBottom: 16 },
  stack: { color: '#8A8C82', fontSize: 11, fontFamily: 'monospace' },
});
