import type { Buyer, Invoice, LineItem, Seller } from '@/types/invoice';

/** Stable, unique id for line items. */
export const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const today = new Date().toISOString().slice(0, 10);
const plus30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export function newLineItem(): LineItem {
  return {
    id: newId(),
    description: '',
    hsnSac: '',
    quantity: 1,
    unit: 'NOS',
    rate: 0,
    discountPct: 0,
    gstRate: 18,
  };
}

function emptySeller(): Seller {
  return {
    name: '',
    address: '',
    gstin: '',
    pan: '',
    stateCode: '',
    email: '',
    phone: '',
    logo: null,
    bank: { accountName: '', accountNumber: '', ifsc: '', bankName: '' },
  };
}

function emptyBuyer(): Buyer {
  return {
    name: '',
    address: '',
    gstin: '',
    pan: '',
    stateCode: '',
    email: '',
    phone: '',
    isUnregistered: false,
    shipToDifferent: false,
    shipTo: { name: '', address: '', stateCode: '' },
  };
}

/** Starter invoice so the preview isn't empty on first load. */
export function createEmptyInvoice(): Invoice {
  return {
    invoiceType: 'gst',
    invoiceNumber: 'INV-0001',
    invoiceDate: today,
    dueDate: plus30,
    placeOfSupplyCode: '',
    paymentTerms: 'Net 30',
    currency: 'INR',
    seller: emptySeller(),
    buyer: emptyBuyer(),
    items: [newLineItem()],
    notes: 'Payment due within 30 days. Thank you for your business.',
    authorizedSignatory: '',
  };
}

/** Common units of measure offered as a datalist in the line-item editor. */
export const COMMON_UNITS = ['NOS', 'PCS', 'KG', 'GM', 'LTR', 'MTR', 'HRS', 'DAY', 'BOX', 'SET'];
