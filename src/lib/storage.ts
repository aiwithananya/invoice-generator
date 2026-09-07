// All localStorage keys this app writes are namespaced with this prefix, so we
// can wipe everything the app has stored without touching unrelated keys.
export const APP_STORAGE_PREFIX = 'aiwa.';

/** Remove every piece of app data this browser has stored. */
export function clearAllLocalData(): void {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(APP_STORAGE_PREFIX));
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Storage unavailable (private mode / blocked) — nothing to clear.
  }
}
