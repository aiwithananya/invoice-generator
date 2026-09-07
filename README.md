# AI with Ananya · Invoice Generator

A **free, open-source, 100% browser-only** invoice generator for Indian businesses.
No backend. No database. No sign-up. **Your invoice data never leaves your device.**

## Why it's private by design

- **Everything is React state.** Invoice data lives only in memory while you work.
- **Opt-in local drafts.** The only persistence is an explicit **Save draft** button,
  which writes to your browser's `localStorage` — on your machine, nowhere else.
- **PDFs are built in your browser.** `@react-pdf/renderer` renders the invoice to a
  vector PDF in-memory and triggers a direct download. There is no upload step and no
  "download link" served from anywhere — the app makes **zero network requests** for
  your data.

## Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 5](https://vitejs.dev/) (static build — host it anywhere)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [@react-pdf/renderer](https://react-pdf.org/) for vector, print-quality PDFs
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
