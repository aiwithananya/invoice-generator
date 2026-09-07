import type { Invoice } from '@/types/invoice';
import { computeTotals, formatMoney, lineTax, lineTotal } from '@/lib/calc';

/**
 * On-screen HTML preview that mirrors the PDF layout. This is intentionally a
 * separate implementation from the @react-pdf document — the DOM preview can use
 * full Tailwind, while the PDF is tuned for print. Both read the same Invoice.
 */
export function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const totals = computeTotals(invoice);
  const money = (n: number) => formatMoney(n, invoice.currency);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-brand-600">INVOICE</p>
          <p className="text-sm text-slate-500">{invoice.seller.name || 'Your business'}</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-xs text-slate-400">Invoice #</p>
          <p className="font-semibold">{invoice.invoiceNumber}</p>
          <p className="mt-1 text-xs text-slate-400">Date</p>
          <p className="text-slate-600">{invoice.invoiceDate}</p>
          <p className="mt-1 text-xs text-slate-400">Due</p>
          <p className="text-slate-600">{invoice.dueDate}</p>
        </div>
      </div>

      {/* Parties */}
      <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
        <PartyBlock label="From" party={invoice.seller} />
        <PartyBlock label="Bill To" party={invoice.buyer} />
      </div>

      {/* Items */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-brand-600 text-xs text-white">
              <th className="rounded-l px-2 py-2">Description</th>
              <th className="px-2 py-2">HSN/SAC</th>
              <th className="px-2 py-2 text-right">Qty</th>
              <th className="px-2 py-2 text-right">Rate</th>
              <th className="px-2 py-2 text-right">GST %</th>
              <th className="rounded-r px-2 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="px-2 py-2">{item.description || '—'}</td>
                <td className="px-2 py-2 text-slate-500">{item.hsnSac || '—'}</td>
                <td className="px-2 py-2 text-right">{item.quantity}</td>
                <td className="px-2 py-2 text-right">{money(item.unitPrice)}</td>
                <td className="px-2 py-2 text-right">{item.taxRate}%</td>
                <td className="px-2 py-2 text-right">{money(lineTotal(item) + lineTax(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-56 space-y-1 text-sm">
          <Row label="Subtotal" value={money(totals.subtotal)} />
          {invoice.taxMode === 'intra' ? (
            <>
              <Row label="CGST" value={money(totals.cgst)} />
              <Row label="SGST" value={money(totals.sgst)} />
            </>
          ) : (
            <Row label="IGST" value={money(totals.igst)} />
          )}
          <div className="mt-2 flex justify-between border-t border-slate-900 pt-2">
            <span className="font-bold">Total</span>
            <span className="font-bold text-brand-600">{money(totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-6 border-t border-slate-100 pt-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Notes</p>
          <p className="text-slate-600">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}

function PartyBlock({ label, party }: { label: string; party: Invoice['seller'] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-semibold">{party.name || '—'}</p>
      {party.address && <p className="text-slate-600">{party.address}</p>}
      {party.gstin && <p className="text-slate-600">GSTIN: {party.gstin}</p>}
      {party.state && <p className="text-slate-600">{party.state}</p>}
      {party.email && <p className="text-slate-600">{party.email}</p>}
      {party.phone && <p className="text-slate-600">{party.phone}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}
