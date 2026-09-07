// Trigger a browser download for a URL (blob: or data:) entirely on the client.
// This synthesises an <a download> click — no server, no upload, no network.
export function triggerDownload(href: string, filename: string): void {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const clean = (s: string): string =>
  s
    .replace(/[^\p{L}\p{N}-]+/gu, '_') // keep letters, numbers and hyphens
    .replace(/^[_-]+|[_-]+$/g, '') // trim stray separators
    .slice(0, 60);

/**
 * Auto filename, e.g. Invoice_INV-0001_Acme_Corp.pdf. The buyer name is
 * dropped when empty so we never produce a dangling separator.
 */
export function invoiceFileName(invoiceNumber: string, buyerName: string, ext: string): string {
  const parts = ['Invoice', clean(invoiceNumber), clean(buyerName)].filter(Boolean);
  return `${parts.join('_')}.${ext}`;
}
