import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Invoice } from '@/types/invoice';
import { computeTotals, formatMoney, lineTax, lineTotal } from '@/lib/calc';

// @react-pdf uses its own StyleSheet (a subset of CSS) — this is deliberately
// separate from the Tailwind on-screen preview so the printed document can be
// tuned independently. Output is vector: crisp, selectable, small.
const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: '#1f2937',
    fontFamily: 'Helvetica',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  brand: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#4f46e5' },
  invoiceMeta: { textAlign: 'right' },
  metaLabel: { color: '#6b7280', fontSize: 9 },
  metaValue: { fontFamily: 'Helvetica-Bold', fontSize: 11 },
  partiesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 24 },
  partyBlock: { flex: 1 },
  partyLabel: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  partyName: { fontFamily: 'Helvetica-Bold', fontSize: 11, marginBottom: 2 },
  muted: { color: '#4b5563', lineHeight: 1.4 },
  table: { marginTop: 8 },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  colDesc: { flex: 3 },
  colHsn: { flex: 1 },
  colNum: { flex: 1, textAlign: 'right' },
  totalsWrap: { marginTop: 16, alignItems: 'flex-end' },
  totalsRow: {
    flexDirection: 'row',
    width: 220,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalsLabel: { color: '#4b5563' },
  grandRow: {
    flexDirection: 'row',
    width: 220,
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#111827',
  },
  grandLabel: { fontFamily: 'Helvetica-Bold', fontSize: 12 },
  grandValue: { fontFamily: 'Helvetica-Bold', fontSize: 12, color: '#4f46e5' },
  notes: { marginTop: 28, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 8,
  },
});

function PartyView({ label, party }: { label: string; party: Invoice['seller'] }) {
  return (
    <View style={styles.partyBlock}>
      <Text style={styles.partyLabel}>{label}</Text>
      <Text style={styles.partyName}>{party.name || '—'}</Text>
      {party.address ? <Text style={styles.muted}>{party.address}</Text> : null}
      {party.gstin ? <Text style={styles.muted}>GSTIN: {party.gstin}</Text> : null}
      {party.state ? <Text style={styles.muted}>{party.state}</Text> : null}
      {party.email ? <Text style={styles.muted}>{party.email}</Text> : null}
      {party.phone ? <Text style={styles.muted}>{party.phone}</Text> : null}
    </View>
  );
}

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const totals = computeTotals(invoice);
  const money = (n: number) => formatMoney(n, invoice.currency);

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>INVOICE</Text>
            <Text style={styles.muted}>{invoice.seller.name || 'Your business'}</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.metaLabel}>Invoice #</Text>
            <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
            <Text style={[styles.metaLabel, { marginTop: 6 }]}>Date</Text>
            <Text style={styles.muted}>{invoice.invoiceDate}</Text>
            <Text style={[styles.metaLabel, { marginTop: 6 }]}>Due</Text>
            <Text style={styles.muted}>{invoice.dueDate}</Text>
          </View>
        </View>

        <View style={styles.partiesRow}>
          <PartyView label="From" party={invoice.seller} />
          <PartyView label="Bill To" party={invoice.buyer} />
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colHsn}>HSN/SAC</Text>
            <Text style={styles.colNum}>Qty</Text>
            <Text style={styles.colNum}>Rate</Text>
            <Text style={styles.colNum}>GST %</Text>
            <Text style={styles.colNum}>Amount</Text>
          </View>
          {invoice.items.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <Text style={styles.colDesc}>{item.description || '—'}</Text>
              <Text style={styles.colHsn}>{item.hsnSac || '—'}</Text>
              <Text style={styles.colNum}>{item.quantity}</Text>
              <Text style={styles.colNum}>{money(item.unitPrice)}</Text>
              <Text style={styles.colNum}>{item.taxRate}%</Text>
              <Text style={styles.colNum}>{money(lineTotal(item) + lineTax(item))}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text>{money(totals.subtotal)}</Text>
          </View>
          {invoice.taxMode === 'intra' ? (
            <>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>CGST</Text>
                <Text>{money(totals.cgst)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>SGST</Text>
                <Text>{money(totals.sgst)}</Text>
              </View>
            </>
          ) : (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>IGST</Text>
              <Text>{money(totals.igst)}</Text>
            </View>
          )}
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>{money(totals.grandTotal)}</Text>
          </View>
        </View>

        {invoice.notes ? (
          <View style={styles.notes}>
            <Text style={styles.partyLabel}>Notes</Text>
            <Text style={styles.muted}>{invoice.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          Generated with AI with Ananya · Invoice Generator — 100% in your browser.
        </Text>
      </Page>
    </Document>
  );
}
