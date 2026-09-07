import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Invoice } from '@/types/invoice';
import { computeTotals, formatMoney, lineTax, lineTaxable } from '@/lib/calc';
import { stateLabel } from '@/lib/states';

// @react-pdf uses its own StyleSheet (a CSS subset), kept separate from the
// Tailwind preview so the printed document can be tuned for A4. Output is
// vector: crisp, selectable, small.
const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, color: '#1f2937', fontFamily: 'Helvetica' },
  row: { flexDirection: 'row' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  logo: { width: 46, height: 46, objectFit: 'contain', marginRight: 8 },
  sellerName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111827' },
  title: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#4f46e5', textAlign: 'right' },
  muted: { color: '#4b5563', lineHeight: 1.4 },
  metaStrip: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    padding: 8,
    marginBottom: 14,
  },
  metaCell: { flex: 1 },
  label: { fontSize: 7, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 },
  partiesRow: { flexDirection: 'row', gap: 24, marginBottom: 14 },
  partyBlock: { flex: 1 },
  partyName: { fontFamily: 'Helvetica-Bold', fontSize: 10, marginBottom: 2 },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  colDesc: { flex: 3 },
  colHsn: { flex: 1.2 },
  colNum: { flex: 1, textAlign: 'right' },
  totalsWrap: { marginTop: 12, alignItems: 'flex-end' },
  totalsRow: {
    flexDirection: 'row',
    width: 230,
    justifyContent: 'space-between',
    paddingVertical: 1.5,
  },
  totalsLabel: { color: '#4b5563' },
  grandRow: {
    flexDirection: 'row',
    width: 230,
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#111827',
  },
  grandLabel: { fontFamily: 'Helvetica-Bold', fontSize: 11 },
  grandValue: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#4f46e5' },
  words: { marginTop: 8, backgroundColor: '#f1f5f9', borderRadius: 4, padding: 6 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  signBlock: { alignItems: 'flex-end', justifyContent: 'flex-end' },
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 32,
    right: 32,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 7,
  },
});

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const isGst = invoice.invoiceType === 'gst';
  const totals = computeTotals(invoice);
  const money = (n: number) => formatMoney(n, invoice.currency);
  const seller = invoice.seller;
  const buyer = invoice.buyer;
  const bank = seller.bank;
  const hasBank = Boolean(bank.accountName || bank.accountNumber || bank.ifsc || bank.bankName);

  return (
    <Document title={`${isGst ? 'Tax Invoice' : 'Bill of Supply'} ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.row}>
            {seller.logo ? <Image src={seller.logo} style={styles.logo} /> : null}
            <View>
              <Text style={styles.sellerName}>{seller.name || 'Your business'}</Text>
              {seller.address ? <Text style={styles.muted}>{seller.address}</Text> : null}
              {seller.stateCode ? (
                <Text style={styles.muted}>{stateLabel(seller.stateCode)}</Text>
              ) : null}
              {isGst && seller.gstin ? (
                <Text style={styles.muted}>GSTIN: {seller.gstin}</Text>
              ) : null}
              {seller.pan ? <Text style={styles.muted}>PAN: {seller.pan}</Text> : null}
            </View>
          </View>
          <View>
            <Text style={styles.title}>{isGst ? 'TAX INVOICE' : 'BILL OF SUPPLY'}</Text>
            <Text style={[styles.muted, { textAlign: 'right' }]}>#{invoice.invoiceNumber}</Text>
          </View>
        </View>

        {/* Meta strip */}
        <View style={styles.metaStrip}>
          <MetaCell label="Invoice date" value={invoice.invoiceDate} />
          <MetaCell label="Due date" value={invoice.dueDate} />
          <MetaCell label="Place of supply" value={stateLabel(invoice.placeOfSupplyCode) || '—'} />
          <MetaCell label="Payment terms" value={invoice.paymentTerms || '—'} />
        </View>

        {/* Parties */}
        <View style={styles.partiesRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.partyName}>{buyer.name || '—'}</Text>
            {buyer.address ? <Text style={styles.muted}>{buyer.address}</Text> : null}
            {buyer.stateCode ? (
              <Text style={styles.muted}>{stateLabel(buyer.stateCode)}</Text>
            ) : null}
            {isGst && !buyer.isUnregistered && buyer.gstin ? (
              <Text style={styles.muted}>GSTIN: {buyer.gstin}</Text>
            ) : null}
            {buyer.isUnregistered ? <Text style={styles.muted}>Unregistered / B2C</Text> : null}
          </View>
          <View style={styles.partyBlock}>
            {buyer.shipToDifferent ? (
              <>
                <Text style={styles.label}>Ship To</Text>
                <Text style={styles.partyName}>{buyer.shipTo.name || '—'}</Text>
                {buyer.shipTo.address ? (
                  <Text style={styles.muted}>{buyer.shipTo.address}</Text>
                ) : null}
                {buyer.shipTo.stateCode ? (
                  <Text style={styles.muted}>{stateLabel(buyer.shipTo.stateCode)}</Text>
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.label}>Tax type</Text>
                <Text style={styles.muted}>
                  {!isGst
                    ? 'No GST (bill of supply)'
                    : totals.isIntraState
                      ? 'Intra-state — CGST + SGST'
                      : 'Inter-state — IGST'}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Items table */}
        <View style={styles.tableHead}>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colHsn}>HSN/SAC</Text>
          <Text style={styles.colNum}>Qty</Text>
          <Text style={styles.colNum}>Rate</Text>
          <Text style={styles.colNum}>Disc</Text>
          <Text style={styles.colNum}>Taxable</Text>
          {isGst ? <Text style={styles.colNum}>GST</Text> : null}
          <Text style={styles.colNum}>Amount</Text>
        </View>
        {invoice.items.map((item) => {
          const tax = lineTax(item, isGst);
          return (
            <View style={styles.tableRow} key={item.id}>
              <Text style={styles.colDesc}>
                {item.description || '—'}
                {item.unit ? ` / ${item.unit}` : ''}
              </Text>
              <Text style={styles.colHsn}>{item.hsnSac || '—'}</Text>
              <Text style={styles.colNum}>{item.quantity}</Text>
              <Text style={styles.colNum}>{money(item.rate)}</Text>
              <Text style={styles.colNum}>{item.discountPct ? `${item.discountPct}%` : '—'}</Text>
              <Text style={styles.colNum}>{money(lineTaxable(item))}</Text>
              {isGst ? (
                <Text style={styles.colNum}>{`${item.gstRate}% (${money(tax)})`}</Text>
              ) : null}
              <Text style={styles.colNum}>{money(lineTaxable(item) + tax)}</Text>
            </View>
          );
        })}

        {/* Totals */}
        <View style={styles.totalsWrap}>
          <TotalsRow label="Subtotal" value={money(totals.subtotal)} />
          {totals.totalDiscount > 0 ? (
            <TotalsRow label="Total discount" value={`- ${money(totals.totalDiscount)}`} />
          ) : null}
          <TotalsRow label="Taxable value" value={money(totals.taxableValue)} />
          {isGst && totals.isIntraState ? (
            <>
              <TotalsRow label="CGST" value={money(totals.cgst)} />
              <TotalsRow label="SGST" value={money(totals.sgst)} />
            </>
          ) : null}
          {isGst && !totals.isIntraState ? (
            <TotalsRow label="IGST" value={money(totals.igst)} />
          ) : null}
          {Math.abs(totals.roundOff) >= 0.005 ? (
            <TotalsRow
              label="Round off"
              value={`${totals.roundOff >= 0 ? '+ ' : '- '}${money(Math.abs(totals.roundOff))}`}
            />
          ) : null}
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Grand Total</Text>
            <Text style={styles.grandValue}>{money(totals.grandTotal)}</Text>
          </View>
        </View>

        <View style={styles.words}>
          <Text style={styles.muted}>
            <Text style={styles.label}>Amount in words: </Text>
            {totals.amountInWords}
          </Text>
        </View>

        {/* Footer: bank / notes / signatory */}
        <View style={styles.footerRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            {hasBank ? (
              <View style={{ marginBottom: 6 }}>
                <Text style={styles.label}>Bank details</Text>
                {bank.accountName ? <Text style={styles.muted}>{bank.accountName}</Text> : null}
                {bank.bankName ? <Text style={styles.muted}>{bank.bankName}</Text> : null}
                {bank.accountNumber ? (
                  <Text style={styles.muted}>A/C: {bank.accountNumber}</Text>
                ) : null}
                {bank.ifsc ? <Text style={styles.muted}>IFSC: {bank.ifsc}</Text> : null}
              </View>
            ) : null}
            {invoice.notes ? (
              <View>
                <Text style={styles.label}>Notes</Text>
                <Text style={styles.muted}>{invoice.notes}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.signBlock}>
            <Text style={styles.muted}>For {seller.name || 'Seller'}</Text>
            <Text style={[styles.muted, { marginTop: 28 }]}>
              {invoice.authorizedSignatory || 'Authorized Signatory'}
            </Text>
          </View>
        </View>

        <Text style={styles.pageFooter} fixed>
          Generated with AI with Ananya · Invoice Generator — 100% in your browser.
        </Text>
      </Page>
    </Document>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaCell}>
      <Text style={styles.label}>{label}</Text>
      <Text style={{ fontFamily: 'Helvetica-Bold' }}>{value}</Text>
    </View>
  );
}

function TotalsRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.totalsRow}>
      <Text style={styles.totalsLabel}>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}
