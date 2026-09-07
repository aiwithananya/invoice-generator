import { useRef, useState } from 'react';
import type { Invoice } from '@/types/invoice';
import { createEmptyInvoice } from '@/lib/sample';
import { useLocalStorageDraft } from '@/hooks/useLocalStorageDraft';
import { downloadInvoicePdf } from '@/pdf/downloadPdf';
import { downloadNodeAsImage, type ImageFormat } from '@/lib/imageExport';
import { invoiceFileName } from '@/lib/download';
import { clearAllLocalData } from '@/lib/storage';
import { InvoiceForm } from '@/components/InvoiceForm';
import { InvoicePreview } from '@/components/InvoicePreview';

type Busy = 'pdf' | ImageFormat | null;

export default function App() {
  const [invoice, setInvoice] = useState<Invoice>(() => createEmptyInvoice());
  const [busy, setBusy] = useState<Busy>(null);
  // Bumped on "Clear all data" to remount the form (resets local UI state such
  // as the auto-increment checkbox that reads from localStorage on mount).
  const [resetKey, setResetKey] = useState(0);
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

  const handleClearAll = () => {
    const ok = window.confirm(
      'Clear all data?\n\nThis wipes your saved draft, invoice counter, and preferences from this browser. This cannot be undone.',
    );
    if (!ok) return;
    clearAllLocalData();
    clearDraft();
    setInvoice(createEmptyInvoice());
    setResetKey((k) => k + 1);
  };

  const anyBusy = busy !== null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-semibold tracking-tight sm:text-lg">
              AI with Ananya <span className="text-brand-600">· Invoice Generator</span>
            </h1>
            <p className="text-xs text-slate-500">
              Free &amp; open-source · runs 100% in your browser
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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-2 text-xs text-slate-400">
          {lastSavedAt && (
            <span>
              Draft saved locally · {new Date(lastSavedAt).toLocaleString()} ·{' '}
              <button className="underline hover:text-slate-600" onClick={clearDraft}>
                clear draft
              </button>
            </span>
          )}
          <button
            className="ml-auto font-medium text-red-500 hover:text-red-700 hover:underline"
            onClick={handleClearAll}
          >
            Clear all data
          </button>
        </div>
      </header>

      {/* Side-by-side layout: Invoice Form | Invoice Preview */}
      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2">
        <section
          aria-label="Invoice Form"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Invoice Form
          </h2>
          <InvoiceForm key={resetKey} invoice={invoice} onChange={setInvoice} />
        </section>

        <section aria-label="Invoice Preview" className="lg:sticky lg:top-6 lg:self-start">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Invoice Preview
          </h2>
          <InvoicePreview ref={previewRef} invoice={invoice} />
        </section>
      </main>

      {/* Privacy notice */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700">
            <LockIcon />
            Your data never leaves your browser.
          </p>
          <p className="mx-auto mt-1 max-w-xl text-xs text-slate-500">
            No backend, no database, no tracking, no uploads. Everything — including PDF and image
            generation — happens on your device. Works offline once loaded.
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            Open-source · React + Vite + Tailwind · PDF via @react-pdf/renderer · images via
            html-to-image
          </p>
        </div>
      </footer>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 text-brand-600"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 1a4 4 0 0 0-4 4v2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1V5a4 4 0 0 0-4-4Zm2 6V5a2 2 0 1 0-4 0v2h4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
