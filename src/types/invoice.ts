// Core domain types for a GST-compliant Indian tax invoice.
// Everything here lives only in React state (and, if the user opts in, their
// own browser's localStorage) — it is never serialised to any server.

/** Seller bank details printed for payment. */
export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

/** Fields shared by seller and buyer. `stateCode` is the GST state code. */
export interface Party {
  name: string;
  address: string;
  gstin: string;
  pan: string;
  stateCode: string;
  email: string;
  phone: string;
}

export interface Seller extends Party {
  /** Logo as a base64 data URL — held in the browser only, never uploaded. */
  logo: string | null;
  bank: BankDetails;
}

/** A separate ship-to address (used only when it differs from bill-to). */
export interface ShipTo {
  name: string;
  address: string;
  stateCode: string;
}

export interface Buyer extends Party {
  /** B2C / unregistered buyer — GSTIN is not required or shown. */
  isUnregistered: boolean;
  /** When true, a distinct Ship-To address is captured and shown. */
  shipToDifferent: boolean;
  shipTo: ShipTo;
}

export type GstRate = 0 | 5 | 12 | 18 | 28;

export interface LineItem {
  id: string;
  description: string;
  /** HSN (goods) or SAC (services) code. */
  hsnSac: string;
  quantity: number;
  /** Unit of measure, e.g. NOS, PCS, KG, HRS. */
  unit: string;
  rate: number;
  /** Per-line discount as a percentage of gross (qty × rate). */
  discountPct: number;
  /** GST rate applied to this line. Ignored for a bill of supply. */
  gstRate: GstRate;
}

/** GST invoice vs bill of supply (unregistered / composition / exempt). */
export type InvoiceType = 'gst' | 'bill_of_supply';

export interface Invoice {
  invoiceType: InvoiceType;
  invoiceNumber: string;
  /** ISO date strings (yyyy-mm-dd). */
  invoiceDate: string;
  dueDate: string;
  /** GST state code of the place of supply — drives intra vs inter-state tax. */
  placeOfSupplyCode: string;
  paymentTerms: string;
  currency: string;
  seller: Seller;
  buyer: Buyer;
  items: LineItem[];
  notes: string;
  authorizedSignatory: string;
}

/**
 * One row of the HSN/SAC-wise tax summary that a GST tax invoice must carry —
 * taxable value and CGST/SGST/IGST split, grouped by HSN/SAC and rate.
 */
export interface TaxBreakupRow {
  hsnSac: string;
  gstRate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
}

/** Derived totals — always computed from the invoice, never stored. */
export interface InvoiceTotals {
  /** Gross of qty × rate, before any discount. */
  subtotal: number;
  totalDiscount: number;
  /** subtotal − discount; the base GST is charged on. */
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  /** Rounding adjustment applied to reach a whole-rupee grand total. */
  roundOff: number;
  grandTotal: number;
  /** True when seller state == place of supply (CGST+SGST); false = IGST. */
  isIntraState: boolean;
  amountInWords: string;
}
