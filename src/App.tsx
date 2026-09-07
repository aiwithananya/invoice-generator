import { useState } from 'react';
import type { Invoice } from '@/types/invoice';
import { createEmptyInvoice } from '@/lib/sample';
import { useLocalStorageDraft } from '@/hooks/useLocalStorageDraft';
import { downloadInvoicePdf } from '@/pdf/downloadPdf';
import { InvoiceForm } from '@/components/InvoiceForm';
import { InvoicePreview } from '@/components/InvoicePreview';

export default function App() {
  const [invoice, setInvoice] = useState<Invoice>(() => createEmptyInvoice());
  const [downloading, setDownloading] = useState(false);
  const { hasSavedDraft, lastSavedAt, saveDraft, loadDraft, clearDraft } = useLocalStorageDraft();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadInvoicePdf(invoice);
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveDraft = () => {
    saveDraft(invoice);
  };

  const handleLoadDraft = () => {
    const draft = loadDraft();
    if (draft) setInvoice(draft);
  };

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
              <button className="btn-secondary" onClick={handleLoadDraft}>
                Load draft
              </button>
            )}
            <button className="btn-secondary" onClick={handleSaveDraft}>
              Save draft
            </button>
            <button className="btn-primary" onClick={handleDownload} disabled={downloading}>
              {downloading ? 'Preparing…' : 'Download PDF'}
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
          <InvoicePreview invoice={invoice} />
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-slate-400">
        No backend. No tracking. No uploads. Built with React + Vite + Tailwind +
        @react-pdf/renderer.
      </footer>
    </div>
  );
}
