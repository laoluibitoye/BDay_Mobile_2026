// On-device persistence for Sia conversations, so reopening the panel on an article picks up where the
// reader left off. Keyed by reader AND article: one reader's chats can never be shown to another who signs in
// on the same phone, and each article keeps its own thread (its own "what does this mean?" context).
//
// The storage is injected (AsyncStorage in the app, an in-memory map in tests) so the rules below — caps,
// expiry, validation, per-reader keys — are testable without a device. Nothing here throws: a full disk or a
// corrupted entry just means there's no saved conversation, never a broken panel.

export type StoredMessage = { role: 'user' | 'assistant'; text: string };
export type StoredConversation = { sessionId: string; updatedAt: number; messages: StoredMessage[] };

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<readonly string[]>;
  multiRemove(keys: readonly string[]): Promise<void>;
}

const PREFIX = 'sia_chat_v1:';
export const MAX_STORED_MESSAGES = 20; // ten exchanges — plenty of context, bounded storage
export const CONVERSATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_STORED_MESSAGE_CHARS = 8000;

export function conversationKey(userId: string, articleKey: string): string {
  return `${PREFIX}${userId}:${articleKey}`;
}

function isStoredMessage(value: unknown): value is StoredMessage {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (v.role === 'user' || v.role === 'assistant') && typeof v.text === 'string' && v.text.length > 0;
}

export function createConversationStore(storage: KeyValueStorage, now: () => number = Date.now) {
  async function read(key: string): Promise<StoredConversation | null> {
    let raw: string | null;
    try {
      raw = await storage.getItem(key);
    } catch {
      return null;
    }
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as Partial<StoredConversation>;
      const messages = Array.isArray(parsed.messages) ? parsed.messages.filter(isStoredMessage) : [];
      if (typeof parsed.sessionId !== 'string' || typeof parsed.updatedAt !== 'number' || messages.length === 0) {
        await storage.removeItem(key).catch(() => undefined);
        return null;
      }
      if (now() - parsed.updatedAt > CONVERSATION_TTL_MS) {
        await storage.removeItem(key).catch(() => undefined);
        return null;
      }
      return { sessionId: parsed.sessionId, updatedAt: parsed.updatedAt, messages };
    } catch {
      await storage.removeItem(key).catch(() => undefined);
      return null;
    }
  }

  return {
    load(userId: string, articleKey: string): Promise<StoredConversation | null> {
      return read(conversationKey(userId, articleKey));
    },

    async save(userId: string, articleKey: string, conversation: { sessionId: string; messages: StoredMessage[] }): Promise<void> {
      const messages = conversation.messages
        .filter(isStoredMessage)
        .slice(-MAX_STORED_MESSAGES)
        .map((m) => ({ role: m.role, text: m.text.slice(0, MAX_STORED_MESSAGE_CHARS) }));
      const key = conversationKey(userId, articleKey);
      try {
        if (messages.length === 0) {
          await storage.removeItem(key);
          return;
        }
        const value: StoredConversation = { sessionId: conversation.sessionId, updatedAt: now(), messages };
        await storage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage full/unavailable: this conversation just won't survive a restart.
      }
    },

    async clear(userId: string, articleKey: string): Promise<void> {
      await storage.removeItem(conversationKey(userId, articleKey)).catch(() => undefined);
    },

    // Signing out: chat content shouldn't linger on a phone the reader may hand to someone else.
    async clearAll(): Promise<void> {
      try {
        const keys = (await storage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
        if (keys.length > 0) await storage.multiRemove(keys);
      } catch {
        // best effort
      }
    },

    // Drops conversations past their lifetime (read() removes each expired one it touches).
    async prune(): Promise<void> {
      try {
        const keys = (await storage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
        await Promise.all(keys.map((k) => read(k)));
      } catch {
        // best effort
      }
    },
  };
}

export type ConversationStore = ReturnType<typeof createConversationStore>;
