import type { Invoice, InvoiceTotals, LineItem } from '@/types/invoice';
import { amountToWordsINR } from './numberToWords';

// --- Per-line derivations -------------------------------------------------

/** Gross before discount. */
export const lineGross = (item: LineItem): number => (item.quantity || 0) * (item.rate || 0);

export const lineDiscount = (item: LineItem): number =>
  (lineGross(item) * (item.discountPct || 0)) / 100;

/** Taxable value = gross − discount. GST is charged on this. */
export const lineTaxable = (item: LineItem): number => lineGross(item) - lineDiscount(item);

/** Tax amount for a line. Zero for a bill of supply. */
export const lineTax = (item: LineItem, gstApplicable: boolean): number =>
  gstApplicable ? (lineTaxable(item) * (item.gstRate || 0)) / 100 : 0;

// --- Intra vs inter-state -------------------------------------------------

/**
 * Intra-state (CGST + SGST) when the seller's state equals the place of supply,
 * inter-state (IGST) when they differ. If either is unset we can't determine
 * inter-state, so we default to intra-state.
 */
export function isIntraState(invoice: Invoice): boolean {
  const seller = invoice.seller.stateCode;
  const pos = invoice.placeOfSupplyCode;
  if (!seller || !pos) return true;
  return seller === pos;
}

// --- Totals ---------------------------------------------------------------

export function computeTotals(invoice: Invoice): InvoiceTotals {
  const gstApplicable = invoice.invoiceType === 'gst';
  const intra = isIntraState(invoice);

  let subtotal = 0;
  let totalDiscount = 0;
  let taxableValue = 0;
  let totalTax = 0;

  for (const item of invoice.items) {
    subtotal += lineGross(item);
    totalDiscount += lineDiscount(item);
    taxableValue += lineTaxable(item);
    totalTax += lineTax(item, gstApplicable);
  }

  const cgst = gstApplicable && intra ? totalTax / 2 : 0;
  const sgst = gstApplicable && intra ? totalTax / 2 : 0;
  const igst = gstApplicable && !intra ? totalTax : 0;

  const preRound = taxableValue + totalTax;
  const grandTotal = Math.round(preRound);
  const roundOff = grandTotal - preRound;

  return {
    subtotal,
    totalDiscount,
    taxableValue,
    cgst,
    sgst,
    igst,
    totalTax,
    roundOff,
    grandTotal,
    isIntraState: intra,
    amountInWords: amountToWordsINR(grandTotal),
  };
}

// --- Formatting -----------------------------------------------------------

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

/** Format a number as currency. Defaults to Indian Rupee grouping. */
export function formatMoney(amount: number, currency = 'INR'): string {
  const value = Number.isFinite(amount) ? amount : 0;
  if (currency === 'INR') return INR_FORMATTER.format(value);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
