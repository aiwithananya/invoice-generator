import type { Invoice } from '@/types/invoice';

// GSTIN: 2-digit state code, 5 letters (PAN block), 4 digits, 1 letter,
// 1 entity char, literal 'Z', 1 checksum char. e.g. 27ABCDE1234F1Z5
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;

// PAN: 5 letters, 4 digits, 1 letter. e.g. ABCDE1234F
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const isValidGstin = (value: string): boolean =>
  GSTIN_REGEX.test(value.trim().toUpperCase());

export const isValidPan = (value: string): boolean => PAN_REGEX.test(value.trim().toUpperCase());

/** Map of field id -> human error message. Empty means the invoice is valid. */
export type FieldErrors = Record<string, string>;

/**
 * Validate an invoice for GST correctness and required fields. Returns a flat
 * map keyed by stable field ids the form uses to show inline messages.
 */
export function validateInvoice(inv: Invoice): FieldErrors {
  const e: FieldErrors = {};
  const gst = inv.invoiceType === 'gst';

  // Required meta
  if (!inv.invoiceNumber.trim()) e['invoiceNumber'] = 'Invoice number is required';
  if (!inv.invoiceDate) e['invoiceDate'] = 'Invoice date is required';
  if (!inv.placeOfSupplyCode) e['placeOfSupply'] = 'Place of supply is required';

  // Required parties
  if (!inv.seller.name.trim()) e['seller.name'] = 'Seller name is required';
  if (!inv.buyer.name.trim()) e['buyer.name'] = 'Buyer name is required';

  // GSTIN (only meaningful on a GST invoice)
  if (gst) {
    if (!inv.seller.gstin.trim()) {
      e['seller.gstin'] = 'Seller GSTIN is required for a GST invoice';
    } else if (!isValidGstin(inv.seller.gstin)) {
      e['seller.gstin'] = 'Invalid GSTIN — expected e.g. 27ABCDE1234F1Z5';
    } else if (inv.seller.stateCode && inv.seller.gstin.slice(0, 2) !== inv.seller.stateCode) {
      e['seller.gstin'] = 'GSTIN state code does not match the selected seller state';
    }

    if (!inv.buyer.isUnregistered) {
      if (!inv.buyer.gstin.trim()) {
        e['buyer.gstin'] = 'Buyer GSTIN is required (or tick “Unregistered / B2C”)';
      } else if (!isValidGstin(inv.buyer.gstin)) {
        e['buyer.gstin'] = 'Invalid GSTIN — expected e.g. 29ABCDE1234F1Z5';
      } else if (inv.buyer.stateCode && inv.buyer.gstin.slice(0, 2) !== inv.buyer.stateCode) {
        e['buyer.gstin'] = 'GSTIN state code does not match the selected buyer state';
      }
    }
  }

  // PAN is optional, but if present it must be well-formed
  if (inv.seller.pan.trim() && !isValidPan(inv.seller.pan)) {
    e['seller.pan'] = 'Invalid PAN — expected e.g. ABCDE1234F';
  }
  if (inv.buyer.pan.trim() && !isValidPan(inv.buyer.pan)) {
    e['buyer.pan'] = 'Invalid PAN — expected e.g. ABCDE1234F';
  }

  // At least one usable line item
  const hasUsableItem = inv.items.some((i) => i.description.trim() && i.quantity > 0 && i.rate > 0);
  if (!hasUsableItem) {
    e['items'] = 'Add at least one item with a description, quantity and rate';
  }

  return e;
}
