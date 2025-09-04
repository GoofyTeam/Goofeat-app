import * as SecureStore from 'expo-secure-store';

let memoryToken: string | undefined;
const KEY = 'access_token';
let hydrated = false;
let hydrating: Promise<void> | null = null;

export async function ensureStorageHydrated(): Promise<void> {
  if (hydrated) return;
  if (!hydrating) {
    hydrating = (async () => {
      try {
        const v = await SecureStore.getItemAsync(KEY);
        if (v) memoryToken = v;
      } catch {}
      hydrated = true;
      hydrating = null;
    })();
  }
  await hydrating;
}

export function getTokenStorage(): string | undefined {
  return memoryToken;
}

export function setTokenStorage(token?: string) {
  memoryToken = token;
  try {
    if (token) void SecureStore.setItemAsync(KEY, token, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    else void SecureStore.deleteItemAsync(KEY);
  } catch {}
}

export function clearTokenStorage() {
  memoryToken = undefined;
  try {
    void SecureStore.deleteItemAsync(KEY);
  } catch {}
}
