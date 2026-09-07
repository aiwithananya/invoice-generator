import type { Invoice, InvoiceTotals, LineItem } from '@/types/invoice';

export const lineTotal = (item: LineItem): number => item.quantity * item.unitPrice;

export const lineTax = (item: LineItem): number => (lineTotal(item) * item.taxRate) / 100;

/**
 * Pure totals calculator. CGST/SGST split for intra-state, single IGST for
 * inter-state — matching how Indian GST invoices present tax.
 */
export function computeTotals(invoice: Invoice): InvoiceTotals {
  const subtotal = invoice.items.reduce((sum, item) => sum + lineTotal(item), 0);
  const totalTax = invoice.items.reduce((sum, item) => sum + lineTax(item), 0);

  const isIntra = invoice.taxMode === 'intra';
  const cgst = isIntra ? totalTax / 2 : 0;
  const sgst = isIntra ? totalTax / 2 : 0;
  const igst = isIntra ? 0 : totalTax;

  return {
    subtotal,
    totalTax,
    cgst,
    sgst,
    igst,
    grandTotal: subtotal + totalTax,
  };
}

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

/** Format a number as currency. Defaults to Indian Rupee grouping. */
export function formatMoney(amount: number, currency = 'INR'): string {
  if (currency === 'INR') return INR_FORMATTER.format(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}
