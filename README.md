# Understanding Artificial Intelligence
### My hands-on journey through modern AI — from fundamentals to autonomous agents

An interactive slide presentation built with [Reveal.js](https://revealjs.com/), covering AI fundamentals through to ethics and future trends — available in four languages.

**Author:** Vincenzo Marafioti · [LinkedIn](https://www.linkedin.com/in/vincenzo-marafioti/)

---

## Contents

| Section | Topics |
|---------|--------|
| **Chapter 01 · AI Fundamentals** | What is AI, history, key concepts |
| **Chapter 02 · Prompt Engineering** | Anatomy of a prompt, patterns, best practices |
| **Chapter 03 · AI-Assisted Coding** | Vibe coding, tools, workflows |
| **Chapter 04 · RAG Architecture** | Retrieval-Augmented Generation, embeddings, pipelines |
| **Chapter 05 · AI Agents & MCP** | Agents, Model Context Protocol, orchestration |
| **Chapter 06 · Ethics & Future** | Bias, governance, AI futures, industry use cases |
| **Conclusion** | Key insights recap and learning resources |
| **Annex** | Glossary, prompt cheatsheet, local LLMs, and more |

---

## Languages

Switch language at runtime using the menu (☰). Supported:

- 🇬🇧 English
- 🇮🇹 Italiano
- 🇫🇷 Français
- 🇪🇸 Español

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build:index    # compile slides/*/  →  index.html
npm run check:index    # verify build output is consistent
```

---

## Project Structure

```
index.html              ← compiled output (do not edit by hand)
index.template.html     ← shell template with <!-- @slides --> placeholder
css/
  theme.css             ← design tokens and component styles
  animations.css
  narration.css
  slide-menu.css
js/
  version.js            ← auto-updated on every commit (version + date)
  slides.js             ← Reveal.js init, language switching, global tag bar
  slide-menu.js         ← chapter navigation menu
  filmstrip.js          ← slide filmstrip panel
  narration.js          ← AI-narration controls
  lang/                 ← translation dictionaries (en / it / fr / es)
  notes/                ← speaker notes by language
scripts/
  build-slides.mjs      ← build, check, and bootstrap tooling
  export-to-medium.js   ← export deck to Medium-ready Markdown
  extract-notes.js      ← extract speaker notes
  strip-notes.js        ← remove notes from output
slides/
  preface/
  chapter1/ … chapter6/
  conclusion/
  annex/
.githooks/
  pre-commit            ← auto-bumps version, compiles index.html, exports MD + PDF
```

---

## Utility Scripts

### Export to Medium

Convert the presentation to a Markdown article suitable for pasting into [Medium](https://medium.com/):

```bash
npm run export:medium                          # save to export/medium.md
node scripts/export-to-medium.js              # includes speaker notes
node scripts/export-to-medium.js --no-notes   # slides only
```

### Export to PDF

Requires the dev server to be running (`npm run dev` in a separate terminal):

```bash
npm run export:pdf     # → export/ai-slides.pdf  (1920×1080)
```

Uses [DeckTape](https://github.com/astefanutti/decktape) via `npx` — no global install required.

### Extract speaker notes

```bash
node scripts/extract-notes.js
```

---

## Pre-commit Pipeline

The `.githooks/pre-commit` hook runs automatically on every `git commit`:

1. **Version bump** — updates the `updated` date in `js/version.js` to the current month/year and stages it.
2. **Compile** — runs `npm run build:index` to regenerate `index.html` from all slide partials and stages it.
3. **Medium export** — regenerates `export/medium.md` and stages it.
4. **PDF export** — if `npx` is available, spins up a temporary Vite server, runs DeckTape, and stages `export/ai-slides.pdf`.

The hook is installed automatically by `npm install` via the `prepare` script.

---

## Translation System

Text is resolved at runtime via `data-i18n` keys:

```html
<h2 data-i18n="c2.s1.h2">Anatomy of a Prompt</h2>
```

Keys are defined in `js/lang/en.js`, `it.js`, `fr.js`, and `es.js`. Every key must exist in all four files.

Legacy slides use inline `data-en` / `data-it` / `data-fr` / `data-es` attributes — these are supported for backward compatibility but new slides must use `data-i18n`.

---

## License

© Vincenzo Marafioti. All rights reserved. May be shared freely with attribution.
