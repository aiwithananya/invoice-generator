import { useRef, useState } from 'react';
import type { Invoice } from '@/types/invoice';
import { createEmptyInvoice } from '@/lib/sample';
import { useLocalStorageDraft } from '@/hooks/useLocalStorageDraft';
import { downloadInvoicePdf } from '@/pdf/downloadPdf';
import { downloadNodeAsImage, type ImageFormat } from '@/lib/imageExport';
import { invoiceFileName } from '@/lib/download';
import { InvoiceForm } from '@/components/InvoiceForm';
import { InvoicePreview } from '@/components/InvoicePreview';

type Busy = 'pdf' | ImageFormat | null;

export default function App() {
  const [invoice, setInvoice] = useState<Invoice>(() => createEmptyInvoice());
  const [busy, setBusy] = useState<Busy>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { hasSavedDraft, lastSavedAt, saveDraft, loadDraft, clearDraft } = useLocalStorageDraft();

  const handleDownloadPdf = async () => {
    setBusy('pdf');
    try {
      await downloadInvoicePdf(invoice);
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadImage = async (format: ImageFormat) => {
    if (!previewRef.current) return;
    setBusy(format);
    try {
      const ext = format === 'jpeg' ? 'jpg' : 'png';
      await downloadNodeAsImage(previewRef.current, {
        format,
        filename: invoiceFileName(invoice.invoiceNumber, invoice.buyer.name, ext),
      });
    } finally {
      setBusy(null);
    }
  };

  const handleSaveDraft = () => saveDraft(invoice);

  const handleLoadDraft = () => {
    const draft = loadDraft();
    if (draft) setInvoice(draft);
  };

  const anyBusy = busy !== null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              AI with Ananya <span className="text-brand-600">· Invoice Generator</span>
            </h1>
            <p className="text-xs text-slate-500">
              Free &amp; open-source · runs 100% in your browser · your data never leaves this
              device
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hasSavedDraft && (
              <button className="btn-secondary" onClick={handleLoadDraft} disabled={anyBusy}>
                Load draft
              </button>
            )}
            <button className="btn-secondary" onClick={handleSaveDraft} disabled={anyBusy}>
              Save draft
            </button>

            {/* Image export for WhatsApp / messaging */}
            <div className="inline-flex overflow-hidden rounded-md border border-slate-300">
              <button
                className="bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                onClick={() => handleDownloadImage('png')}
                disabled={anyBusy}
                title="Download as PNG image (great for WhatsApp)"
              >
                {busy === 'png' ? 'Rendering…' : 'PNG'}
              </button>
              <button
                className="border-l border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                onClick={() => handleDownloadImage('jpeg')}
                disabled={anyBusy}
                title="Download as JPEG image (great for WhatsApp)"
              >
                {busy === 'jpeg' ? 'Rendering…' : 'JPG'}
              </button>
            </div>

            <button className="btn-primary" onClick={handleDownloadPdf} disabled={anyBusy}>
              {busy === 'pdf' ? 'Preparing…' : 'Download Invoice (PDF)'}
            </button>
          </div>
        </div>
        {lastSavedAt && (
          <div className="mx-auto max-w-7xl px-4 pb-2 text-xs text-slate-400">
            Draft saved locally · {new Date(lastSavedAt).toLocaleString()} ·{' '}
            <button className="underline hover:text-slate-600" onClick={clearDraft}>
              clear
            </button>
          </div>
        )}
      </header>

      {/* Side-by-side layout: Invoice Form | Invoice Preview */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2">
        <section
          aria-label="Invoice Form"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Invoice Form
          </h2>
          <InvoiceForm invoice={invoice} onChange={setInvoice} />
        </section>

        <section aria-label="Invoice Preview" className="lg:sticky lg:top-6 lg:self-start">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Invoice Preview
          </h2>
          <InvoicePreview ref={previewRef} invoice={invoice} />
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-slate-400">
        No backend. No tracking. No uploads. PDF via @react-pdf/renderer, images via html-to-image —
        all in your browser.
      </footer>
    </div>
  );
}
