import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

// Lets components outside the navigator tree (GlobalTabBar, rendered as a sibling of
// Stack.Navigator rather than a screen inside it) still read navigation state and navigate,
// since the `useNavigation`/`useNavigationState` hooks only work inside a Navigator's own
// React context.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
