// Core domain types for an Indian GST-style invoice.
// Everything here lives only in React state (and optionally localStorage) —
// it is never serialised to any server.

export interface Party {
  /** Business / person name. */
  name: string;
  address: string;
  /** GST Identification Number (15 chars). Optional for unregistered parties. */
  gstin: string;
  /** State — matters for CGST/SGST vs IGST determination. */
  state: string;
  email: string;
  phone: string;
}

export interface LineItem {
  id: string;
  description: string;
  /** HSN (goods) or SAC (services) code. */
  hsnSac: string;
  quantity: number;
  unitPrice: number;
  /** GST rate applied to this line, as a percentage (e.g. 18 for 18%). */
  taxRate: number;
}

export interface Invoice {
  invoiceNumber: string;
  /** ISO date string (yyyy-mm-dd). */
  invoiceDate: string;
  dueDate: string;
  seller: Party;
  buyer: Party;
  items: LineItem[];
  /** Free-text notes / terms shown at the foot of the invoice. */
  notes: string;
  currency: string;
  /**
   * Intra-state (CGST + SGST) when seller and buyer are in the same state,
   * inter-state (IGST) otherwise. Auto-derived, but overridable in the form.
   */
  taxMode: 'intra' | 'inter';
}

/** Derived totals — computed, never stored. */
export interface InvoiceTotals {
  subtotal: number;
  totalTax: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
}
