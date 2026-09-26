import AsyncStorage from '@react-native-async-storage/async-storage';
import { createConversationStore } from './history';

// The one on-device store for Sia conversations, shared by the chat hook and the sign-out cleanup so both
// see the same keys.
export const conversationStore = createConversationStore(AsyncStorage);
