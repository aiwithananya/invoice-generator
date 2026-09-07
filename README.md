# AI with Ananya · Invoice Generator

A **free, open-source, 100% browser-only** GST invoice generator for Indian businesses.
Create a professional tax invoice, watch it update live, and download it as a PDF or an
image — all without your data ever leaving your device.

> **Privacy in one line:** there is no backend, no database, no sign-up, and no tracking.
> Every invoice you type stays in your browser.

## Screenshot

<!-- Replace with a real screenshot: save one to docs/screenshot.png -->
![Invoice Generator — form on the left, live preview on the right](docs/screenshot.png)

_Placeholder — drop a screenshot at `docs/screenshot.png` (form on the left, live preview
on the right)._

## What it does

- **GST Tax Invoice** and **Bill of Supply** (non-GST / unregistered / composition) modes.
- **Automatic CGST + SGST vs IGST** — derived from the seller's state and the place of
  supply (36 GST state codes built in): same state splits into CGST + SGST, different
  states charge a single IGST.
- **Full seller & buyer details** — name, address, GSTIN, PAN, state, email, phone; a
  seller **logo** and **bank details**; a **Bill-to / Ship-to** toggle and an
  **Unregistered / B2C** option.
- **Repeatable line items** — description, HSN/SAC, qty, unit, rate, discount %,
  auto-calculated taxable value, and a 0/5/12/18/28 GST-rate picker.
- **Correct totals** — subtotal, discount, taxable value, an HSN-wise **tax summary
  table**, round-off, grand total, and **grand total in words** (Indian lakh/crore).
- **Live preview** that recalculates on every keystroke and mirrors the printed layout.
- **Download** as a vector **PDF** or as a **PNG/JPEG** image (handy for WhatsApp),
  auto-named `Invoice_<number>_<buyer>.<ext>`.
- **Inline validation** for GSTIN/PAN format and required fields.
- **Optional local draft** (Save draft) and invoice-number **auto-increment**, both stored
  only in your browser.
- **Installable PWA** that works fully **offline** once loaded.

## Privacy guarantee

This is the whole point of the project:

- **No backend.** There is no server that receives your data. The app is a set of static
  files.
- **No database.** Nothing is stored anywhere except, optionally, your own browser's
  `localStorage` (only when you click **Save draft** or enable auto-increment).
- **No tracking, no analytics, no error reporting.** There is no Google Analytics, no
  Sentry, no telemetry, no cookies, no third-party scripts of any kind.
- **All processing is local.** Invoice data lives in React state. **PDF generation**
  (`@react-pdf/renderer`) and **image generation** (`html-to-image`) both run entirely in
  your browser and hand the file straight to the browser's download — there is no upload
  and no "download link" served from anywhere.
- **The code makes zero network requests for your data**, by design and by audit — the
  source contains no `fetch`, `axios`, `XMLHttpRequest`, `WebSocket`, or `sendBeacon`.
- **You can wipe everything** with the **Clear all data** button, and the app keeps working
  with no internet at all.

Don't take our word for it — the source is small and readable, and you can watch the
Network tab stay empty while you use it.

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 5](https://vitejs.dev/) — static build, host it anywhere
- [Tailwind CSS 3](https://tailwindcss.com/)
- [@react-pdf/renderer](https://react-pdf.org/) — vector, print-quality PDFs
- [html-to-image](https://github.com/bubkoo/html-to-image) — PNG/JPEG export
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) — offline service worker + install
- ESLint + Prettier

## Run it locally

You'll need [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

### Other scripts

| Script                 | What it does                         |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start the Vite dev server            |
| `npm run build`        | Type-check and build to `dist/`      |
| `npm run preview`      | Preview the production build locally |
| `npm run lint`         | Run ESLint                           |
| `npm run format`       | Format with Prettier                 |

## Deploy your own copy (free)

Because the build output is just static files, you can host it anywhere for free.

### Option A — GitHub Pages (automated)

This repo includes a workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
that builds and publishes on every push to `main`.

1. Fork or push this repo to your GitHub account.
2. In your repo: **Settings → Pages → Build and deployment → Source = "GitHub Actions"**.
3. Push to `main` (or run the workflow from the **Actions** tab).

Your app goes live at `https://<your-username>.github.io/<repo>/`. The workflow sets Vite's
`base` to `/<repo>/` automatically, so all assets and the service worker resolve correctly
on the sub-path.

> Using a `username.github.io` user/org repo (served from the domain root)? Set
> `BASE_PATH` to `/` in the workflow's Build step.

### Option B — Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`.
   (Vercel serves from the domain root, so no `base` change is needed.)
3. Deploy.

Netlify, Cloudflare Pages, or any static host works the same way: build with `npm run
build` and serve the `dist/` folder.

## A note on GST compliance

This tool is provided **for convenience** to help you produce good-looking, well-structured
invoices. It is **not tax or legal advice and not a substitute for a qualified accountant or
tax professional.** GST rules — rates, HSN/SAC classification, place-of-supply, reverse
charge, e-invoicing/IRN requirements, and more — change and depend on your specific
circumstances. Please verify the details and consult an accountant before relying on any
invoice for filing or compliance. The software is provided "as is", without warranty (see
[LICENSE](LICENSE)).

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). The one hard rule:
**it must stay 100% client-side** (no backends, no trackers).

## License

[MIT](LICENSE) © Ananya Garg
