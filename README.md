# Log Triage Sandbox (TypeScript)

A small, repo-ready sandbox to parse mixed logs, apply rules, and produce reports. No backend. Perfect for GitHub Pages.

## Features
- Parse JSON and text logs (`[ts] [LEVEL] service: msg`).
- Rules JSON (`where` + `action`) with buckets, tags, severity bump, drop.
- Outputs: `out/triage.json`, `out/triage.md`, and HTML report to `docs/`.
- Sample logs and rules included.
- CI workflow + tests (Vitest).

## Quickstart
```bash
npm i
npm run build
npm run triage
npm run report
# open docs/index.html
