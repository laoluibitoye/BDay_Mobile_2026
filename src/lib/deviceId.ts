import * as SecureStore from 'expo-secure-store';
import { randomUUID } from 'expo-crypto';

const STORAGE_KEY = 'bd_device_id';

let cached: string | null = null;

// AeroPaywall's entitlement endpoint requires `X-Device-Id` on every request, logged in or not
// (IMPLEMENTATION_PLAN.md §9.2) — it's how guest metering works before a reader ever creates an
// account. Generated once per install and persisted, not regenerated per session.
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;

  const existing = await SecureStore.getItemAsync(STORAGE_KEY);
  if (existing) {
    cached = existing;
    return existing;
  }

  const id = randomUUID();
  await SecureStore.setItemAsync(STORAGE_KEY, id);
  cached = id;
  return id;
}
