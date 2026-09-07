import { pdf, type DocumentProps } from '@react-pdf/renderer';
import { createElement, type ReactElement } from 'react';
import type { Invoice } from '@/types/invoice';
import { InvoiceDocument } from './InvoiceDocument';

/**
 * Renders the invoice to a PDF Blob *entirely in the browser* and triggers a
 * direct file download via an object URL. No upload, no server round-trip —
 * the bytes are created in-memory and handed straight to the browser's
 * download mechanism.
 */
export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  // react-pdf's pdf() is typed to take a <Document> element; our component
  // returns one, so we assert the element type to satisfy the signature.
  const element = createElement(InvoiceDocument, { invoice }) as ReactElement<DocumentProps>;
  const blob = await pdf(element).toBlob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.invoiceNumber || 'invoice'}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the object URL on the next tick so the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
