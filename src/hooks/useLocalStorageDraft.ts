import { useCallback, useEffect, useState } from 'react';
import type { Invoice } from '@/types/invoice';

const STORAGE_KEY = 'aiwa.invoice.draft.v1';

/**
 * Opt-in draft persistence. NOTHING is written until the user explicitly
 * saves, and the only storage used is the browser's own localStorage —
 * no network, no server. Every access is wrapped in try/catch so private
 * windows or blocked storage degrade gracefully.
 */
export function useLocalStorageDraft() {
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { savedAt?: string };
        setHasSavedDraft(true);
        setLastSavedAt(parsed.savedAt ?? null);
      }
    } catch {
      // Storage unavailable (private mode, blocked) — behave as if no draft.
    }
  }, []);

  const saveDraft = useCallback((invoice: Invoice) => {
    try {
      const savedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt, invoice }));
      setHasSavedDraft(true);
      setLastSavedAt(savedAt);
      return true;
    } catch {
      return false;
    }
  }, []);

  const loadDraft = useCallback((): Invoice | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { invoice?: Invoice };
      return parsed.invoice ?? null;
    } catch {
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setHasSavedDraft(false);
    setLastSavedAt(null);
  }, []);

  return { hasSavedDraft, lastSavedAt, saveDraft, loadDraft, clearDraft };
}
