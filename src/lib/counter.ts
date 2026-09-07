// Invoice-number auto-increment. The counter and the user's auto-increment
// preference live ONLY in this browser's localStorage — nothing is uploaded.

const COUNTER_KEY = 'aiwa.invoice.counter';
const PREF_KEY = 'aiwa.invoice.autoIncrement';
const PREFIX = 'INV-';
const PAD = 4;

const format = (n: number): string => `${PREFIX}${String(n).padStart(PAD, '0')}`;

/** Read the last-used counter value (0 if none / storage unavailable). */
export function peekCounter(): number {
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

/** Increment the stored counter and return the next formatted invoice number. */
export function nextInvoiceNumber(): string {
  const next = peekCounter() + 1;
  try {
    localStorage.setItem(COUNTER_KEY, String(next));
  } catch {
    // Storage blocked — still return a sensible number for this session.
  }
  return format(next);
}

export function getAutoIncrementPref(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAutoIncrementPref(enabled: boolean): void {
  try {
    localStorage.setItem(PREF_KEY, String(enabled));
  } catch {
    // ignore
  }
}
