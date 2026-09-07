import type { Buyer, Invoice, Seller } from '@/types/invoice';
import { computeTotals, formatMoney, lineTax, lineTaxable } from '@/lib/calc';
import { stateLabel } from '@/lib/states';

/**
 * On-screen HTML preview mirroring the PDF. Reads the same Invoice and derives
 * everything through computeTotals, so it recalculates on every edit.
 */
export function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const isGst = invoice.invoiceType === 'gst';
  const totals = computeTotals(invoice);
  const money = (n: number) => formatMoney(n, invoice.currency);
  const title = isGst ? 'TAX INVOICE' : 'BILL OF SUPPLY';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {invoice.seller.logo && (
            <img
              src={invoice.seller.logo}
              alt="Logo"
              className="h-12 w-12 rounded object-contain"
            />
          )}
          <div>
            <p className="text-lg font-bold text-slate-800">
              {invoice.seller.name || 'Your business'}
            </p>
            {invoice.seller.address && (
              <p className="max-w-xs whitespace-pre-line text-xs text-slate-500">
                {invoice.seller.address}
              </p>
            )}
            {invoice.seller.stateCode && (
              <p className="text-xs text-slate-500">{stateLabel(invoice.seller.stateCode)}</p>
            )}
            {isGst && invoice.seller.gstin && (
              <p className="text-xs text-slate-500">GSTIN: {invoice.seller.gstin}</p>
            )}
            {invoice.seller.pan && (
              <p className="text-xs text-slate-500">PAN: {invoice.seller.pan}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-brand-600">{title}</p>
          <p className="text-xs text-slate-400">#{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Meta strip */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 rounded-lg bg-slate-50 p-3 text-xs sm:grid-cols-4">
        <Meta label="Invoice date" value={invoice.invoiceDate} />
        <Meta label="Due date" value={invoice.dueDate} />
        <Meta label="Place of supply" value={stateLabel(invoice.placeOfSupplyCode) || '—'} />
        <Meta label="Payment terms" value={invoice.paymentTerms || '—'} />
      </div>

      {/* Parties */}
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <BuyerBlock label="Bill To" buyer={invoice.buyer} showGstin={isGst} />
        {invoice.buyer.shipToDifferent ? (
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Ship To</p>
            <p className="font-semibold">{invoice.buyer.shipTo.name || '—'}</p>
            {invoice.buyer.shipTo.address && (
              <p className="whitespace-pre-line text-slate-600">{invoice.buyer.shipTo.address}</p>
            )}
            {invoice.buyer.shipTo.stateCode && (
              <p className="text-slate-600">{stateLabel(invoice.buyer.shipTo.stateCode)}</p>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-400">
            <p className="uppercase tracking-wide">Tax type</p>
            <p className="mt-1 text-slate-600">
              {!isGst
                ? 'No GST (bill of supply)'
                : totals.isIntraState
                  ? 'Intra-state — CGST + SGST'
                  : 'Inter-state — IGST'}
            </p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead>
            <tr className="bg-brand-600 text-white">
              <th className="rounded-l px-2 py-2">Description</th>
              <th className="px-2 py-2">HSN/SAC</th>
              <th className="px-2 py-2 text-right">Qty</th>
              <th className="px-2 py-2 text-right">Rate</th>
              <th className="px-2 py-2 text-right">Disc</th>
              <th className="px-2 py-2 text-right">Taxable</th>
              {isGst && <th className="px-2 py-2 text-right">GST</th>}
              <th className="rounded-r px-2 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => {
              const tax = lineTax(item, isGst);
              const amount = lineTaxable(item) + tax;
              return (
                <tr key={item.id} className="border-b border-slate-100 align-top">
                  <td className="px-2 py-2">
                    {item.description || '—'}
                    {item.unit && <span className="ml-1 text-slate-400">/ {item.unit}</span>}
                  </td>
                  <td className="px-2 py-2 text-slate-500">{item.hsnSac || '—'}</td>
                  <td className="px-2 py-2 text-right">{item.quantity}</td>
                  <td className="px-2 py-2 text-right">{money(item.rate)}</td>
                  <td className="px-2 py-2 text-right">
                    {item.discountPct ? `${item.discountPct}%` : '—'}
                  </td>
                  <td className="px-2 py-2 text-right">{money(lineTaxable(item))}</td>
                  {isGst && (
                    <td className="px-2 py-2 text-right">
                      {item.gstRate}%<br />
                      <span className="text-slate-400">{money(tax)}</span>
                    </td>
                  )}
                  <td className="px-2 py-2 text-right font-medium">{money(amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-64 space-y-1">
          <Row label="Subtotal" value={money(totals.subtotal)} />
          {totals.totalDiscount > 0 && (
            <Row label="Total discount" value={`− ${money(totals.totalDiscount)}`} />
          )}
          <Row label="Taxable value" value={money(totals.taxableValue)} />
          {isGst && totals.isIntraState && (
            <>
              <Row label="CGST" value={money(totals.cgst)} />
              <Row label="SGST" value={money(totals.sgst)} />
            </>
          )}
          {isGst && !totals.isIntraState && <Row label="IGST" value={money(totals.igst)} />}
          {Math.abs(totals.roundOff) >= 0.005 && (
            <Row
              label="Round off"
              value={`${totals.roundOff >= 0 ? '+ ' : '− '}${money(Math.abs(totals.roundOff))}`}
            />
          )}
          <div className="mt-2 flex justify-between border-t border-slate-900 pt-2 text-base">
            <span className="font-bold">Grand Total</span>
            <span className="font-bold text-brand-600">{money(totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs">
        <span className="text-slate-400">Amount in words: </span>
        <span className="font-medium text-slate-700">{totals.amountInWords}</span>
      </div>

      {/* Footer: bank / notes / signatory */}
      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 text-xs sm:grid-cols-2">
        <div className="space-y-2">
          {hasBank(invoice.seller) && (
            <div>
              <p className="uppercase tracking-wide text-slate-400">Bank details</p>
              {invoice.seller.bank.accountName && <p>{invoice.seller.bank.accountName}</p>}
              {invoice.seller.bank.bankName && (
                <p className="text-slate-600">{invoice.seller.bank.bankName}</p>
              )}
              {invoice.seller.bank.accountNumber && (
                <p className="text-slate-600">A/C: {invoice.seller.bank.accountNumber}</p>
              )}
              {invoice.seller.bank.ifsc && (
                <p className="text-slate-600">IFSC: {invoice.seller.bank.ifsc}</p>
              )}
            </div>
          )}
          {invoice.notes && (
            <div>
              <p className="uppercase tracking-wide text-slate-400">Notes</p>
              <p className="whitespace-pre-line text-slate-600">{invoice.notes}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end justify-end text-right">
          <div className="mt-6 border-t border-slate-300 pt-1">
            <p className="text-slate-600">For {invoice.seller.name || 'Seller'}</p>
            <p className="mt-6 font-medium">
              {invoice.authorizedSignatory || 'Authorized Signatory'}
            </p>
          </div>
        </div>
      </div>

      {!isGst && (
        <p className="mt-3 text-center text-[10px] text-slate-400">
          Composition / unregistered taxable person — not eligible to collect GST.
        </p>
      )}
    </div>
  );
}

function hasBank(seller: Seller): boolean {
  const b = seller.bank;
  return Boolean(b.accountName || b.accountNumber || b.ifsc || b.bankName);
}

function BuyerBlock({
  label,
  buyer,
  showGstin,
}: {
  label: string;
  buyer: Buyer;
  showGstin: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-semibold">{buyer.name || '—'}</p>
      {buyer.address && <p className="whitespace-pre-line text-slate-600">{buyer.address}</p>}
      {buyer.stateCode && <p className="text-slate-600">{stateLabel(buyer.stateCode)}</p>}
      {showGstin && !buyer.isUnregistered && buyer.gstin && (
        <p className="text-slate-600">GSTIN: {buyer.gstin}</p>
      )}
      {buyer.isUnregistered && <p className="text-slate-400">Unregistered / B2C</p>}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-400">{label}</p>
      <p className="font-medium text-slate-700">{value}</p>
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
