import { getCrashlytics, recordError } from '@react-native-firebase/crashlytics';

// React's ErrorBoundary (components/ErrorBoundary.tsx) only catches exceptions thrown during
// render — an exception thrown inside an event handler, a timer, or an unguarded .then() never
// reaches it, and React Native's default behavior for an uncaught JS exception in a release
// build is to fatally terminate the app with no on-screen trace at all (the native "app keeps
// stopping" dialog testers were seeing). This hooks the two places that class of crash actually
// surfaces so it's at least reported to Crashlytics before the app goes down, instead of vanishing.
export function installCrashReporting(): void {
  const instance = getCrashlytics();

  const previousHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    recordError(instance, error);
    previousHandler(error, isFatal);
  });

  const globalWithRejection = globalThis as unknown as {
    onunhandledrejection?: (event: { reason: unknown }) => void;
  };
  const previousRejectionHandler = globalWithRejection.onunhandledrejection;
  globalWithRejection.onunhandledrejection = (event) => {
    const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    recordError(instance, reason);
    previousRejectionHandler?.(event);
  };
}
