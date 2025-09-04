// Cross-platform token storage with safe fallbacks.
// - Web: uses localStorage if available
// - Native: see storage.native.ts for SecureStore persistence

let memoryToken: string | undefined;

const hasLocalStorage = (() => {
  try {
    return typeof globalThis !== 'undefined' && !!globalThis.localStorage;
  } catch {
    return false;
  }
})();

const KEY = 'access_token';

export function setTokenStorage(token?: string) {
  memoryToken = token;
  if (hasLocalStorage) {
    if (token) globalThis.localStorage.setItem(KEY, token);
    else globalThis.localStorage.removeItem(KEY);
  }
}

export function getTokenStorage(): string | undefined {
  if (hasLocalStorage) {
    const v = globalThis.localStorage.getItem(KEY);
    if (v) memoryToken = v;
  }
  return memoryToken;
}

export function clearTokenStorage() {
  memoryToken = undefined;
  if (hasLocalStorage) {
    globalThis.localStorage.removeItem(KEY);
  }
}

// For API compatibility with native variant. No-op on web.
export async function ensureStorageHydrated(): Promise<void> {
  // Nothing to do; web reads from localStorage on-demand.
}
