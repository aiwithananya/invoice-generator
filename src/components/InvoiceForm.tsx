import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import type {
  BankDetails,
  Buyer,
  GstRate,
  Invoice,
  LineItem,
  Seller,
  ShipTo,
} from '@/types/invoice';
import { COMMON_UNITS, newLineItem } from '@/lib/sample';
import { INDIAN_STATES } from '@/lib/states';
import { lineTaxable } from '@/lib/calc';
import { fileToDataUrl } from '@/lib/file';
import { getAutoIncrementPref, nextInvoiceNumber, setAutoIncrementPref } from '@/lib/counter';
import { validateInvoice } from '@/lib/validation';

interface Props {
  invoice: Invoice;
  onChange: (invoice: Invoice) => void;
}

const GST_RATES: GstRate[] = [0, 3, 5, 12, 18, 28];

/** Parse a numeric input, treating empty as 0. */
const num = (v: string): number => (v === '' ? 0 : Number(v));

/**
 * Controlled form. Every edit produces a new Invoice object handed back to the
 * parent, so App's React state stays the single source of truth and the preview
 * recalculates on each keystroke.
 */
export function InvoiceForm({ invoice, onChange }: Props) {
  const isGst = invoice.invoiceType === 'gst';

  // Field-level validation. Errors surface once a field has a value (so format
  // mistakes show as you type) or once it's been blurred (so required-but-empty
  // fields don't shout on first load).
  const errors = validateInvoice(invoice);
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const markTouched = (id: string) => setTouched((prev) => new Set(prev).add(id));
  const errorFor = (id: string, hasValue: boolean): string | undefined =>
    touched.has(id) || hasValue ? errors[id] : undefined;

  const patch = (fields: Partial<Invoice>) => onChange({ ...invoice, ...fields });

  const patchSeller = (fields: Partial<Seller>) =>
    onChange({ ...invoice, seller: { ...invoice.seller, ...fields } });

  const patchBank = (fields: Partial<BankDetails>) =>
    onChange({
      ...invoice,
      seller: { ...invoice.seller, bank: { ...invoice.seller.bank, ...fields } },
    });

  const patchBuyer = (fields: Partial<Buyer>) =>
    onChange({ ...invoice, buyer: { ...invoice.buyer, ...fields } });

  const patchShipTo = (fields: Partial<ShipTo>) =>
    onChange({
      ...invoice,
      buyer: { ...invoice.buyer, shipTo: { ...invoice.buyer.shipTo, ...fields } },
    });

  const patchItem = (id: string, fields: Partial<LineItem>) =>
    onChange({
      ...invoice,
      items: invoice.items.map((item) => (item.id === id ? { ...item, ...fields } : item)),
    });

  const addItem = () => onChange({ ...invoice, items: [...invoice.items, newLineItem()] });

  const removeItem = (id: string) =>
    onChange({ ...invoice, items: invoice.items.filter((item) => item.id !== id) });

  return (
    <div className="space-y-6">
      <InvoiceTypeToggle
        value={invoice.invoiceType}
        onChange={(invoiceType) => patch({ invoiceType })}
      />

      {touched.size > 0 && Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {Object.keys(errors).length} field
          {Object.keys(errors).length > 1 ? 's need' : ' needs'} attention before this invoice is
          complete.
        </div>
      )}

      {/* --- Invoice meta --- */}
      <Section title="Invoice details">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <InvoiceNumberField
            value={invoice.invoiceNumber}
            onChange={(invoiceNumber) => patch({ invoiceNumber })}
            onBlur={() => markTouched('invoiceNumber')}
            error={errorFor('invoiceNumber', !!invoice.invoiceNumber)}
          />
          <LabeledInput
            label="Invoice date"
            type="date"
            value={invoice.invoiceDate}
            onChange={(v) => patch({ invoiceDate: v })}
            onBlur={() => markTouched('invoiceDate')}
            error={errorFor('invoiceDate', !!invoice.invoiceDate)}
          />
          <LabeledInput
            label="Due date"
            type="date"
            value={invoice.dueDate}
            onChange={(v) => patch({ dueDate: v })}
          />
          <StateSelect
            label="Place of supply"
            value={invoice.placeOfSupplyCode}
            onChange={(placeOfSupplyCode) => patch({ placeOfSupplyCode })}
            onBlur={() => markTouched('placeOfSupply')}
            error={errorFor('placeOfSupply', !!invoice.placeOfSupplyCode)}
          />
          <LabeledInput
            label="Payment terms"
            value={invoice.paymentTerms}
            onChange={(v) => patch({ paymentTerms: v })}
            placeholder="e.g. Net 30"
          />
        </div>
      </Section>

      {/* --- Seller --- */}
      <Section title="Seller (From)">
        <LogoUpload logo={invoice.seller.logo} onChange={(logo) => patchSeller({ logo })} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LabeledInput
            label="Business name"
            value={invoice.seller.name}
            onChange={(v) => patchSeller({ name: v })}
            onBlur={() => markTouched('seller.name')}
            error={errorFor('seller.name', !!invoice.seller.name)}
          />
          <StateSelect
            label="State"
            value={invoice.seller.stateCode}
            onChange={(stateCode) => patchSeller({ stateCode })}
          />
        </div>
        <LabeledInput
          label="Address"
          value={invoice.seller.address}
          onChange={(v) => patchSeller({ address: v })}
        />
        <div className="grid grid-cols-2 gap-3">
          {isGst && (
            <LabeledInput
              label="GSTIN"
              value={invoice.seller.gstin}
              onChange={(v) => patchSeller({ gstin: v.toUpperCase() })}
              placeholder="15-digit GSTIN"
              maxLength={15}
              onBlur={() => markTouched('seller.gstin')}
              error={errorFor('seller.gstin', !!invoice.seller.gstin)}
            />
          )}
          <LabeledInput
            label="PAN"
            value={invoice.seller.pan}
            onChange={(v) => patchSeller({ pan: v.toUpperCase() })}
            placeholder="10-char PAN"
            maxLength={10}
            onBlur={() => markTouched('seller.pan')}
            error={errorFor('seller.pan', !!invoice.seller.pan)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <LabeledInput
            label="Email"
            value={invoice.seller.email}
            onChange={(v) => patchSeller({ email: v })}
          />
          <LabeledInput
            label="Phone"
            value={invoice.seller.phone}
            onChange={(v) => patchSeller({ phone: v })}
          />
        </div>

        <p className="field-label mt-2 font-semibold text-slate-700">Bank details</p>
        <div className="grid grid-cols-2 gap-3">
          <LabeledInput
            label="Account name"
            value={invoice.seller.bank.accountName}
            onChange={(v) => patchBank({ accountName: v })}
          />
          <LabeledInput
            label="Bank name"
            value={invoice.seller.bank.bankName}
            onChange={(v) => patchBank({ bankName: v })}
          />
          <LabeledInput
            label="Account number"
            value={invoice.seller.bank.accountNumber}
            onChange={(v) => patchBank({ accountNumber: v })}
          />
          <LabeledInput
            label="IFSC"
            value={invoice.seller.bank.ifsc}
            onChange={(v) => patchBank({ ifsc: v.toUpperCase() })}
          />
        </div>
      </Section>

      {/* --- Buyer --- */}
      <Section title="Buyer (Bill to)">
        <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            checked={invoice.buyer.isUnregistered}
            onChange={(e) => patchBuyer({ isUnregistered: e.target.checked })}
          />
          Unregistered buyer / B2C (no GSTIN)
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LabeledInput
            label="Name"
            value={invoice.buyer.name}
            onChange={(v) => patchBuyer({ name: v })}
            onBlur={() => markTouched('buyer.name')}
            error={errorFor('buyer.name', !!invoice.buyer.name)}
          />
          <StateSelect
            label="State"
            value={invoice.buyer.stateCode}
            onChange={(stateCode) => patchBuyer({ stateCode })}
          />
        </div>
        <LabeledInput
          label="Address"
          value={invoice.buyer.address}
          onChange={(v) => patchBuyer({ address: v })}
        />
        <div className="grid grid-cols-2 gap-3">
          {isGst && !invoice.buyer.isUnregistered && (
            <LabeledInput
              label="GSTIN"
              value={invoice.buyer.gstin}
              onChange={(v) => patchBuyer({ gstin: v.toUpperCase() })}
              placeholder="15-digit GSTIN"
              maxLength={15}
              onBlur={() => markTouched('buyer.gstin')}
              error={errorFor('buyer.gstin', !!invoice.buyer.gstin)}
            />
          )}
          <LabeledInput
            label="PAN"
            value={invoice.buyer.pan}
            onChange={(v) => patchBuyer({ pan: v.toUpperCase() })}
            placeholder="10-char PAN"
            maxLength={10}
            onBlur={() => markTouched('buyer.pan')}
            error={errorFor('buyer.pan', !!invoice.buyer.pan)}
          />
          <LabeledInput
            label="Email"
            value={invoice.buyer.email}
            onChange={(v) => patchBuyer({ email: v })}
          />
          <LabeledInput
            label="Phone"
            value={invoice.buyer.phone}
            onChange={(v) => patchBuyer({ phone: v })}
          />
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            checked={invoice.buyer.shipToDifferent}
            onChange={(e) => patchBuyer({ shipToDifferent: e.target.checked })}
          />
          Ship to a different address
        </label>
        {invoice.buyer.shipToDifferent && (
          <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
            <LabeledInput
              label="Ship to — name"
              value={invoice.buyer.shipTo.name}
              onChange={(v) => patchShipTo({ name: v })}
            />
            <StateSelect
              label="Ship to — state"
              value={invoice.buyer.shipTo.stateCode}
              onChange={(stateCode) => patchShipTo({ stateCode })}
            />
            <div className="sm:col-span-2">
              <LabeledInput
                label="Ship to — address"
                value={invoice.buyer.shipTo.address}
                onChange={(v) => patchShipTo({ address: v })}
              />
            </div>
          </div>
        )}
      </Section>

      {/* --- Line items --- */}
      <Section
        title="Line items"
        right={
          <button
            type="button"
            className="text-xs font-medium text-brand-600 hover:underline"
            onClick={addItem}
          >
            + Add item
          </button>
        }
      >
        <div className="space-y-3">
          {invoice.items.map((item, index) => (
            <LineItemRow
              key={item.id}
              index={index}
              item={item}
              isGst={isGst}
              canRemove={invoice.items.length > 1}
              onChange={(fields) => patchItem(item.id, fields)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
        {errors['items'] && <p className="mt-2 text-[11px] text-red-600">{errors['items']}</p>}
      </Section>

      {/* --- Notes & signatory --- */}
      <Section title="Notes & sign-off">
        <div>
          <label className="field-label">Notes / terms</label>
          <textarea
            className="field-input min-h-[72px]"
            value={invoice.notes}
            onChange={(e) => patch({ notes: e.target.value })}
          />
        </div>
        <LabeledInput
          label="Authorized signatory"
          value={invoice.authorizedSignatory}
          onChange={(v) => patch({ authorizedSignatory: v })}
          placeholder="Name of the person signing"
        />
      </Section>
    </div>
  );
}

// --------------------------------------------------------------------------
// Sub-components
// --------------------------------------------------------------------------

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

interface LabeledInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function LabeledInput({ label, value, onChange, error, ...rest }: LabeledInputProps) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        className={`field-input ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

function StateSelect({
  label,
  value,
  onChange,
  onBlur,
  error,
}: {
  label: string;
  value: string;
  onChange: (code: string) => void;
  onBlur?: () => void;
  error?: string;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <select
        className={`field-input ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
      >
        <option value="">Select state…</option>
        {INDIAN_STATES.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name} ({s.code})
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

function InvoiceTypeToggle({
  value,
  onChange,
}: {
  value: Invoice['invoiceType'];
  onChange: (v: Invoice['invoiceType']) => void;
}) {
  const options: { key: Invoice['invoiceType']; label: string }[] = [
    { key: 'gst', label: 'GST Invoice' },
    { key: 'bill_of_supply', label: 'Bill of Supply (non-GST)' },
  ];
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`rounded-md px-3 py-1.5 font-medium transition ${
            value === opt.key
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function InvoiceNumberField({
  value,
  onChange,
  onBlur,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
}) {
  const [autoInc, setAutoInc] = useState<boolean>(() => getAutoIncrementPref());

  const toggleAuto = (checked: boolean) => {
    setAutoInc(checked);
    setAutoIncrementPref(checked);
    if (checked) onChange(nextInvoiceNumber());
  };

  return (
    <div>
      <label className="field-label">Invoice #</label>
      <div className="flex gap-1">
        <input
          className={`field-input ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
        />
        {autoInc && (
          <button
            type="button"
            className="shrink-0 rounded-md border border-slate-300 px-2 text-xs text-slate-600 hover:bg-slate-50"
            onClick={() => onChange(nextInvoiceNumber())}
            title="Get next number"
          >
            Next
          </button>
        )}
      </div>
      <label className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
        <input
          type="checkbox"
          className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          checked={autoInc}
          onChange={(e) => toggleAuto(e.target.checked)}
        />
        Auto-increment (saved on this device)
      </label>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

function LogoUpload({
  logo,
  onChange,
}: {
  logo: string | null;
  onChange: (logo: string | null) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    setError(null);
    if (!file) return;
    const { dataUrl, error: err } = await fileToDataUrl(file);
    if (err) setError(err);
    else if (dataUrl) onChange(dataUrl);
  };

  return (
    <div className="flex items-center gap-3">
      {logo ? (
        <img
          src={logo}
          alt="Logo preview"
          className="h-14 w-14 rounded border border-slate-200 object-contain"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded border border-dashed border-slate-300 text-[10px] text-slate-400">
          Logo
        </div>
      )}
      <div className="text-xs">
        <label className="btn-secondary cursor-pointer !px-3 !py-1.5">
          {logo ? 'Replace' : 'Upload logo'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
        {logo && (
          <button
            type="button"
            className="ml-2 text-slate-500 hover:text-red-600"
            onClick={() => onChange(null)}
          >
            Remove
          </button>
        )}
        <p className="mt-1 text-slate-400">Stored in your browser only · PNG/JPG · under 500 KB</p>
        {error && <p className="mt-0.5 text-red-600">{error}</p>}
      </div>
    </div>
  );
}

function LineItemRow({
  index,
  item,
  isGst,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  item: LineItem;
  isGst: boolean;
  canRemove: boolean;
  onChange: (fields: Partial<LineItem>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">Item {index + 1}</span>
        <button
          type="button"
          className="text-xs text-slate-400 hover:text-red-600 disabled:opacity-40"
          onClick={onRemove}
          disabled={!canRemove}
        >
          Remove
        </button>
      </div>
      <input
        className="field-input mb-2"
        placeholder="Description"
        value={item.description}
        onChange={(e) => onChange({ description: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <LabeledNarrow label="HSN/SAC">
          <input
            className="field-input"
            value={item.hsnSac}
            onChange={(e) => onChange({ hsnSac: e.target.value })}
          />
        </LabeledNarrow>
        <LabeledNarrow label="Qty">
          <input
            className="field-input"
            type="number"
            min={0}
            value={item.quantity}
            onChange={(e) => onChange({ quantity: num(e.target.value) })}
          />
        </LabeledNarrow>
        <LabeledNarrow label="Unit">
          <input
            className="field-input"
            list="unit-options"
            value={item.unit}
            onChange={(e) => onChange({ unit: e.target.value })}
          />
        </LabeledNarrow>
        <LabeledNarrow label="Rate">
          <input
            className="field-input"
            type="number"
            min={0}
            step="0.01"
            value={item.rate}
            onChange={(e) => onChange({ rate: num(e.target.value) })}
          />
        </LabeledNarrow>
        <LabeledNarrow label="Disc %">
          <input
            className="field-input"
            type="number"
            min={0}
            max={100}
            value={item.discountPct}
            onChange={(e) => onChange({ discountPct: num(e.target.value) })}
          />
        </LabeledNarrow>
        {isGst && (
          <LabeledNarrow label="GST %">
            <select
              className="field-input"
              value={item.gstRate}
              onChange={(e) => onChange({ gstRate: Number(e.target.value) as GstRate })}
            >
              {GST_RATES.map((r) => (
                <option key={r} value={r}>
                  {r}%
                </option>
              ))}
            </select>
          </LabeledNarrow>
        )}
        <LabeledNarrow label="Taxable value">
          <input
            className="field-input bg-slate-50 text-slate-500"
            value={lineTaxable(item).toFixed(2)}
            readOnly
            tabIndex={-1}
          />
        </LabeledNarrow>
      </div>
      <datalist id="unit-options">
        {COMMON_UNITS.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
    </div>
  );
}

function LabeledNarrow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-0.5 block text-[10px] uppercase tracking-wide text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}
