// Read an image file into a base64 data URL, entirely in the browser.
// The resulting string is kept in React state (and optional local drafts) —
// it is never sent anywhere.

export const MAX_LOGO_BYTES = 500 * 1024; // 500 KB

export interface FileReadResult {
  dataUrl?: string;
  error?: string;
}

export function fileToDataUrl(file: File): Promise<FileReadResult> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve({ error: 'Please choose an image file.' });
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      resolve({ error: 'Logo must be under 500 KB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ dataUrl: String(reader.result) });
    reader.onerror = () => resolve({ error: 'Could not read that file.' });
    reader.readAsDataURL(file);
  });
}
