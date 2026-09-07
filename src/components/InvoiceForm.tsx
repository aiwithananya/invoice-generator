import type { Invoice, LineItem, Party } from '@/types/invoice';
import { newId } from '@/lib/sample';

interface Props {
  invoice: Invoice;
  onChange: (invoice: Invoice) => void;
}

/**
 * Controlled form. Every edit produces a new Invoice object handed back to the
 * parent — the single source of truth lives in App's React state.
 */
export function InvoiceForm({ invoice, onChange }: Props) {
  const patch = (fields: Partial<Invoice>) => onChange({ ...invoice, ...fields });

  const patchParty = (key: 'seller' | 'buyer', fields: Partial<Party>) =>
    onChange({ ...invoice, [key]: { ...invoice[key], ...fields } });

  const patchItem = (id: string, fields: Partial<LineItem>) =>
    onChange({
      ...invoice,
      items: invoice.items.map((item) => (item.id === id ? { ...item, ...fields } : item)),
    });

  const addItem = () =>
    onChange({
      ...invoice,
      items: [
        ...invoice.items,
        { id: newId(), description: '', hsnSac: '', quantity: 1, unitPrice: 0, taxRate: 18 },
      ],
    });

  const removeItem = (id: string) =>
    onChange({ ...invoice, items: invoice.items.filter((item) => item.id !== id) });

  return (
    <div className="space-y-6">
      {/* Invoice meta */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <label className="field-label">Invoice #</label>
          <input
            className="field-input"
            value={invoice.invoiceNumber}
            onChange={(e) => patch({ invoiceNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Date</label>
          <input
            type="date"
            className="field-input"
            value={invoice.invoiceDate}
            onChange={(e) => patch({ invoiceDate: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Due date</label>
          <input
            type="date"
            className="field-input"
            value={invoice.dueDate}
            onChange={(e) => patch({ dueDate: e.target.value })}
          />
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <PartyFields
          title="From (Seller)"
          party={invoice.seller}
          onChange={(f) => patchParty('seller', f)}
        />
        <PartyFields
          title="Bill To (Buyer)"
          party={invoice.buyer}
          onChange={(f) => patchParty('buyer', f)}
        />
      </div>

      {/* Tax mode */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="field-label">GST type</label>
          <select
            className="field-input"
            value={invoice.taxMode}
            onChange={(e) => patch({ taxMode: e.target.value as Invoice['taxMode'] })}
          >
            <option value="intra">Intra-state (CGST + SGST)</option>
            <option value="inter">Inter-state (IGST)</option>
          </select>
        </div>
        <div>
          <label className="field-label">Currency</label>
          <select
            className="field-input"
            value={invoice.currency}
            onChange={(e) => patch({ currency: e.target.value })}
          >
            <option value="INR">INR ₹</option>
            <option value="USD">USD $</option>
            <option value="EUR">EUR €</option>
            <option value="GBP">GBP £</option>
          </select>
        </div>
      </div>

      {/* Line items */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="field-label mb-0">Line items</label>
          <button
            type="button"
            className="text-xs font-medium text-brand-600 hover:underline"
            onClick={addItem}
          >
            + Add item
          </button>
        </div>
        <div className="space-y-3">
          {invoice.items.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3">
              <input
                className="field-input mb-2"
                placeholder="Description"
                value={item.description}
                onChange={(e) => patchItem(item.id, { description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <input
                  className="field-input"
                  placeholder="HSN/SAC"
                  value={item.hsnSac}
                  onChange={(e) => patchItem(item.id, { hsnSac: e.target.value })}
                />
                <input
                  className="field-input"
                  type="number"
                  min={0}
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => patchItem(item.id, { quantity: Number(e.target.value) })}
                />
                <input
                  className="field-input"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Rate"
                  value={item.unitPrice}
                  onChange={(e) => patchItem(item.id, { unitPrice: Number(e.target.value) })}
                />
                <input
                  className="field-input"
                  type="number"
                  min={0}
                  placeholder="GST %"
                  value={item.taxRate}
                  onChange={(e) => patchItem(item.id, { taxRate: Number(e.target.value) })}
                />
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-2 text-sm text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                  onClick={() => removeItem(item.id)}
                  disabled={invoice.items.length === 1}
                  aria-label="Remove item"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="field-label">Notes / terms</label>
        <textarea
          className="field-input min-h-[72px]"
          value={invoice.notes}
          onChange={(e) => patch({ notes: e.target.value })}
        />
      </div>
    </div>
  );
}

function PartyFields({
  title,
  party,
  onChange,
}: {
  title: string;
  party: Party;
  onChange: (fields: Partial<Party>) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="field-label font-semibold text-slate-700">{title}</legend>
      <input
        className="field-input"
        placeholder="Name"
        value={party.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />
      <input
        className="field-input"
        placeholder="Address"
        value={party.address}
        onChange={(e) => onChange({ address: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          className="field-input"
          placeholder="GSTIN"
          value={party.gstin}
          onChange={(e) => onChange({ gstin: e.target.value })}
        />
        <input
          className="field-input"
          placeholder="State"
          value={party.state}
          onChange={(e) => onChange({ state: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          className="field-input"
          placeholder="Email"
          value={party.email}
          onChange={(e) => onChange({ email: e.target.value })}
        />
        <input
          className="field-input"
          placeholder="Phone"
          value={party.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
        />
      </div>
    </fieldset>
  );
}
