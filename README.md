# AI with Ananya · Invoice Generator

A **free, open-source, 100% browser-only** GST invoice generator for Indian businesses.
No backend. No database. No sign-up. **Your invoice data never leaves your device.**

## GST features

- **Tax Invoice** and **Bill of Supply** (non-GST / unregistered / composition) modes.
- **CGST + SGST vs IGST is derived automatically** from the seller's state and the
  place of supply (both picked from the 36 GST state codes) — intra-state splits into
  CGST + SGST, inter-state charges a single IGST.
- Seller & buyer details: name, address, **GSTIN**, **PAN**, state, email, phone;
  seller **logo** (base64, in-browser only) and **bank details** (A/C name, number, IFSC).
- Buyer extras: **Bill-to / Ship-to** toggle and an **Unregistered / B2C** checkbox that
  drops the GSTIN requirement.
- Line items: description, **HSN/SAC**, qty, unit, rate, **discount %**, auto-calculated
  taxable value, and a **0/5/12/18/28** GST-rate dropdown.
- Totals: subtotal, total discount, taxable value, CGST/SGST/IGST, **round-off**, grand
  total, and **grand total in words** (Indian lakh/crore system).
- Notes/terms and an **authorized signatory** line.
- **Invoice-number auto-increment** (counter kept in `localStorage`, on-device only).

## Why it's private by design

- **Everything is React state.** Invoice data lives only in memory while you work.
- **Opt-in local drafts.** The only persistence is an explicit **Save draft** button,
  which writes to your browser's `localStorage` — on your machine, nowhere else.
- **PDFs are built in your browser.** `@react-pdf/renderer` renders the invoice to a
  vector PDF in-memory and triggers a direct download. There is no upload step and no
  "download link" served from anywhere — the app makes **zero network requests** for
  your data.
- **Image export is in-browser too.** "PNG" / "JPG" rasterise the on-screen invoice with
  `html-to-image` (DOM → canvas → data URL) for easy sharing on WhatsApp — again, no
  network. Files are auto-named `Invoice_<number>_<buyer>.<ext>`.
- **No network code, by audit.** The source contains no `fetch`, `axios`, `XMLHttpRequest`,
  `WebSocket`, `sendBeacon`, or analytics — nothing that could send your data anywhere.
- **You can wipe everything.** A **Clear all data** button removes every `aiwa.*` key this
  app stored in `localStorage` (draft, invoice counter, preferences) in one click.

## Works offline (installable PWA)

Once the page has loaded once, a service worker precaches the entire app shell — so it
runs **fully offline** and can be **installed** to your home screen / desktop (look for the
browser's "Install app" option). Because the app never needed the network for your data in
the first place, everything — editing, calculations, PDF and image export — keeps working
with no internet. The service worker only caches the app's own static files; it never
sends anything out.

## Validation

Inline, as-you-go checks: **GSTIN** and **PAN** format (regex), required fields, and a
soft warning when a GSTIN's leading state code doesn't match the selected state. Errors
appear once a field has a value or after you leave it empty — never a wall of red on load.

## Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 5](https://vitejs.dev/) (static build — host it anywhere)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [@react-pdf/renderer](https://react-pdf.org/) for vector, print-quality PDFs
- [html-to-image](https://github.com/bubkoo/html-to-image) for PNG/JPEG export
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for the offline service worker
- ESLint + Prettier

## Why `@react-pdf/renderer` and not `jspdf + html2canvas`?

`jspdf + html2canvas` rasterises the page into an image — fuzzy text, no selectable
content, large files, awkward page breaks. `@react-pdf/renderer` builds a real vector
PDF from a layout engine: crisp, selectable text, small files, and precise control over
the invoice table. The on-screen preview (`InvoicePreview`) and the PDF document
(`InvoiceDocument`) are separate implementations that read the same `Invoice` object,
so each can be tuned for its medium.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL.

### Scripts

| Script             | What it does                          |
| ------------------ | ------------------------------------- |
| `npm run dev`      | Start the Vite dev server             |
| `npm run build`    | Type-check and build a static bundle  |
| `npm run preview`  | Preview the production build          |
| `npm run lint`     | Run ESLint                            |
| `npm run format`   | Format with Prettier                  |

## Project structure

```
src/
  components/
    InvoiceForm.tsx      # Controlled form — the editing surface
    InvoicePreview.tsx   # Live on-screen preview (HTML/Tailwind)
  pdf/
    InvoiceDocument.tsx  # The @react-pdf document (print layout)
    downloadPdf.ts       # In-browser render → Blob → download
  hooks/
    useLocalStorageDraft.ts  # Opt-in, on-device draft persistence
  lib/
    calc.ts              # Pure totals + currency formatting
    sample.ts            # Starter invoice + id helper
  types/
    invoice.ts           # Domain types
  App.tsx                # Side-by-side shell: Form | Preview
```

## Deploy

`npm run build` produces a fully static `dist/` folder — deploy it to GitHub Pages,
Netlify, Cloudflare Pages, or any static host. There is nothing to run server-side.

## License

MIT — do what you like, no warranty.
