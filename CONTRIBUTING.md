# Contributing

Thanks for your interest in improving the Invoice Generator! This is a small,
friendly, open-source project — contributions of all sizes are welcome.

## The one rule that matters most

**This app is, and must stay, 100% client-side.** Its whole promise is that a
user's invoice data never leaves their browser. Please do **not** add anything
that sends data over the network:

- no backend calls, `fetch`/`axios`/`XHR`/`WebSocket`/`sendBeacon`
- no analytics, telemetry, error tracking, or A/B tooling
- no remote fonts, scripts, or trackers
- no third-party embeds that phone home

PRs that break this will be asked to remove it before merge.

## Getting set up

```bash
git clone https://github.com/<your-username>/<repo>.git
cd <repo>
npm install
npm run dev
```

## Before you open a PR

Please make sure the project builds and is clean:

```bash
npm run build        # type-checks and builds
npm run lint         # ESLint, zero warnings allowed
npm run format       # Prettier
```

- Keep TypeScript strict — no `any` escapes where a real type will do.
- Match the existing style; Prettier settles formatting, so just run it.
- Keep pure logic (calculations, formatting, validation) in `src/lib/` with
  small, testable functions. UI goes in `src/components/`.
- If you touch GST calculations or the tax breakup, double-check the numbers by
  hand and describe your check in the PR.

## Reporting bugs and ideas

Open an issue with:

- what you did, what you expected, and what happened
- for calculation bugs: the exact inputs (amounts, GST rate, states) and the
  wrong vs. expected output
- a screenshot if it's a layout/rendering issue

## Scope and taste

Small, focused PRs are easiest to review. If you're planning a larger change
(new invoice fields, a different PDF layout, i18n, etc.), open an issue first so
we can agree on the approach before you spend time on it.

## A note on GST correctness

This tool helps people produce invoices; it is not tax advice. If you add or
change tax logic, please cite the rule you're implementing in the PR so
reviewers can verify it. When in doubt, prefer surfacing a number to the user
over silently guessing.

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](LICENSE) that covers this project.
