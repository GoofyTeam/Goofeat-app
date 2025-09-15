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
const HOUSEHOLD_KEY = 'current_household_id';

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

// Household persistence (web)
export async function setCurrentHouseholdIdStorage(id?: string) {
  if (hasLocalStorage) {
    if (id) globalThis.localStorage.setItem(HOUSEHOLD_KEY, id);
    else globalThis.localStorage.removeItem(HOUSEHOLD_KEY);
  }
}

export async function getCurrentHouseholdIdStorage(): Promise<string | undefined> {
  if (!hasLocalStorage) return undefined;
  const v = globalThis.localStorage.getItem(HOUSEHOLD_KEY);
  return v || undefined;
}
