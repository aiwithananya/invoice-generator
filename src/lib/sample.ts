import type { Invoice } from '@/types/invoice';

/** A tiny helper so line items always get a stable, unique id. */
export const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const today = new Date().toISOString().slice(0, 10);
const plus30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

/** Starter invoice so the preview isn't empty on first load. */
export function createEmptyInvoice(): Invoice {
  return {
    invoiceNumber: 'INV-0001',
    invoiceDate: today,
    dueDate: plus30,
    currency: 'INR',
    taxMode: 'intra',
    seller: {
      name: '',
      address: '',
      gstin: '',
      state: '',
      email: '',
      phone: '',
    },
    buyer: {
      name: '',
      address: '',
      gstin: '',
      state: '',
      email: '',
      phone: '',
    },
    items: [
      {
        id: newId(),
        description: '',
        hsnSac: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 18,
      },
    ],
    notes: 'Payment due within 30 days. Thank you for your business.',
  };
}
