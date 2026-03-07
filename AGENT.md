# AGENT.md — Guidelines for AI Agents

## 1. Project Overview

A **Reveal.js 4.6.1** slide deck: *Understanding Artificial Intelligence* by Vincenzo Marafioti.
Six chapters + back matter + annex, four languages (EN / IT / FR / ES), dark theme.

**Stack:** Reveal.js · Vite · CSS custom properties · `data-i18n` key-based translations via `js/lang/*.js`

---

## 2. Project Structure

```
/
├── index.html                  ← compiled output (DO NOT hand-edit)
├── index.template.html         ← shell with <!-- @slides --> placeholder
├── package.json
├── vite.config.mjs
├── css/
│   ├── theme.css               ← design tokens + all component styles
│   ├── animations.css
│   ├── narration.css
│   └── slide-menu.css
├── js/
│   ├── slides.js               ← Reveal init + setLang() + buildCloud()
│   ├── animations.js
│   ├── filmstrip.js
│   ├── narration.js
│   ├── slide-menu.js
│   ├── version.js              ← { version, updated } auto-bumped by pre-commit
│   ├── lang/                   ← translation dictionaries (PRIMARY system)
│   │   ├── en.js  it.js  fr.js  es.js
│   └── notes/                  ← speaker notes by language
│       ├── en.js  it.js  fr.js  es.js
├── scripts/
│   ├── build-slides.mjs        ← compile / check / bootstrap
│   ├── extract-notes.js
│   ├── strip-notes.js
│   ├── wrap-tags.js
│   └── export-to-medium.js
│   └── setup-git-hooks.mjs
└── slides/                     ← one folder per chapter, alphabetically sorted
    ├── preface/        (01-cover, 02-how-to-use, 03-agenda)
    ├── chapter1/       (01-chapter-cover … 15-references)
    ├── chapter2/       (01-chapter-cover … 10-references)
    ├── chapter3/       (01-chapter-cover … 09-references)
    ├── chapter4/       (01-chapter-cover … 09-references)
    ├── chapter5/       (01-chapter-cover … 09-references)
    ├── chapter6/       (01-chapter-cover … 12-ai-use-cases-by-industry)
    ├── backmatter/     (01-cover … 05-closing)
    └── annex/          (01-annex-cover … 09-local-llms)
```

---

## 3. Translation System

### How it works

All visible text is translated at runtime via **key-based lookups** in external language files. Each translatable HTML element carries a `data-i18n="key"` attribute. The `setLang()` function in `js/slides.js` looks up the key in `window.LANG_XX` (loaded from `js/lang/*.js`).

```html
<h2 data-i18n="c2.s1.h2">Anatomy of a Prompt</h2>
```

```js
// js/lang/en.js
"c2.s1.h2": "Anatomy of a Prompt",

// js/lang/it.js
"c2.s1.h2": "Anatomia di un Prompt",

// js/lang/fr.js
"c2.s1.h2": "Anatomie d'un Prompt",

// js/lang/es.js
"c2.s1.h2": "Anatomía de un Prompt",
```

### Language files

| File | Global | Purpose |
|------|--------|---------|
| `js/lang/en.js` | `window.LANG_EN` | English strings |
| `js/lang/it.js` | `window.LANG_IT` | Italian strings |
| `js/lang/fr.js` | `window.LANG_FR` | French strings |
| `js/lang/es.js` | `window.LANG_ES` | Spanish strings |

Keys follow the convention `<section>.<element>` (e.g. `c1.s1.h2`, `agenda.c2.title`, `cover.h1`).

### Rules

- Every translatable element **must** have a `data-i18n` attribute with a unique key.
- The same key **must** exist in all four lang files (`en.js`, `it.js`, `fr.js`, `es.js`).
- Inline code, brand names, technical terms (e.g. "GPT-4o", "LangChain"), and content inside `.prompt-block` or `<code>` **do not** need translation.
- Use `&ldquo;` / `&rdquo;` for curly quotes in lang file values -- never raw Unicode curly quotes.

### Legacy: inline `data-*` attributes

Some older slides still use inline `data-en` / `data-it` / `data-fr` / `data-es` attributes. `setLang()` handles these for backward compatibility: elements **without** `data-i18n` fall back to reading `data-{lang}`. **New slides must use `data-i18n` keys exclusively.** Migrate inline attributes to the lang files when editing legacy slides.

### Speaker notes

Notes live in `js/notes/*.js` as `window.NOTES_XX` dictionaries keyed by the `<section id="...">`. The `<aside class="notes"></aside>` element must always be present in every slide, even if empty. the notes

---

## 4. Slide Anatomy

### Content slide

```html
<!-- ══════════════════════ SLIDE N: TITLE ══════════════════════ -->
<section>
  <h2 data-i18n="cN.sM.h2">English Title</h2>

  <!-- main content -->

  <!-- optional; always last content element before tag-bar -->
  <div class="key-insight fragment">
    <strong data-i18n="cN.sM.insight.label">Key Insight:</strong>
    <span data-i18n="cN.sM.insight.text">Insight text here.</span>
  </div>

  <aside class="notes"></aside>

  <div class="tag-bar">
    <span class="chapter-tag" data-i18n="cN.tag">Chapter N · Topic</span>
    <span class="slide-tag">NN / MM</span>
  </div>
</section>
```

### Chapter divider slide

```html
<!-- chapterN.html -->   ← legacy boundary marker (first slide of each chapter only , remove it)

<!-- ══════════════════════ CHAPTER COVER ══════════════════════ -->
<section class="chapter-divider" id="chapter-N">
  <div class="cover-dot"></div>
  <h1 style="text-align:center;" data-i18n="cN.cover.h1">English Title</h1>
  <p style="color:var(--ink-mid);max-width:520px;font-size:.88rem;text-align:center;margin:0 auto;"
     data-i18n="cN.cover.p">English subtitle</p>
  <div class="tag-bar">
    <span class="chapter-tag" data-i18n="cN.cover.tag">Chapter N</span>
    <span class="slide-tag" style="color:rgba(255,255,255,.25);">01 / 06</span>
  </div>
  <aside class="notes"></aside>
</section>
```

### File naming

Files are numbered `NN-slug.html` and sorted alphabetically by the build system. The first file in each chapter folder must begin with the legacy boundary comment (e.g. `<!-- chapter1.html -->`).

---

## 5. Chapter IDs (do not rename)

| ID | Section |
|----|---------|
| `chapter-1` | Introduction / AI Fundamentals |
| `chapter-2` | Prompt Engineering |
| `chapter-3` | AI-Assisted Coding |
| `chapter-4` | RAG Architecture |
| `chapter-5` | AI Agents & MCP |
| `chapter-6` | Ethics & Future |
| `back-matter` | Back Matter (Wrapping Up) |
| `annex` | Annex / Additional Materials |

---

## 6. Mandatory Closing Slides per Chapter

Every chapter (chapter 1 through chapter 6) **must end with exactly these two slides**, in this order, as the final two files in the chapter folder:

### Penultimate slide — Key Takeaways

File name: `NN-key-takeaways.html` (second-to-last number in the chapter).

```html
<!-- ══════════════════════ KEY TAKEAWAYS ══════════════════════ -->
<section>
  <h2 data-i18n="cN.takeaways.h2">Key Takeaways</h2>

  <ul class="example-list">
    <li data-i18n="cN.takeaways.li1">First takeaway.</li>
    <li data-i18n="cN.takeaways.li2">Second takeaway.</li>
    <!-- add as many <li> items as needed -->
  </ul>

  <aside class="notes"></aside>

  <div class="tag-bar">
    <span class="chapter-tag" data-i18n="cN.tag">Chapter N · Topic</span>
    <span class="slide-tag">NN / MM</span>
  </div>
</section>
```

### Last slide — Sources & Further Reading

File name: `NN-references.html` (last number in the chapter).

```html
<!-- ══════════════════════ SOURCES & FURTHER READING ══════════ -->
<section>
  <h2 data-i18n="cN.refs.h2">Sources &amp; Further Reading</h2>

  <ul class="ref-list">
    <li data-i18n="cN.refs.li1">Author, <em>Title</em>, Year.</li>
    <!-- add as many <li> items as needed -->
  </ul>

  <aside class="notes"></aside>

  <div class="tag-bar">
    <span class="chapter-tag" data-i18n="cN.tag">Chapter N · Topic</span>
    <span class="slide-tag">NN / MM</span>
  </div>
</section>
```

### Rules

- These two slides are **required** in every chapter; do not omit either one.
- They must be the **last two slides** in the chapter folder (highest two sort numbers).
- Add all `data-i18n` keys to all four lang files (`en.js`, `it.js`, `fr.js`, `es.js`).
- Update `.slide-tag` numbers across the chapter after adding or removing slides.
- `back-matter` and `annex` sections are exempt from this requirement.

---

## 7. Global Tag Bar

A single **fixed** `<div id="global-tag-bar">` in `index.template.html` is positioned on the left side of the same row as the lang-bar. It is populated by `updateGlobalTagBar()` in `js/slides.js` on every `slidechanged` and `ready` event, and also after every `setLang()` call.

It shows five fields in this order:

```
Chapter N · Chapter Title  ·  Slide Title  ·  N / ChTotal  ·  N / DeckTotal
```

| Span class | Content | Source |
|---|---|---|
| `.gtb-chapter` | Chapter name (e.g. `Chapter 2 · Prompt Engineering`) | `.chapter-tag` text of current slide |
| `.gtb-slug` | Slide title (italic) | `<h2>` or `<h1>` text of current slide |
| `.gtb-ch-count` | Position within chapter (`3 / 7`) | Computed by `buildChapterIndex()` |
| `.gtb-abs-count` | Absolute position in deck (`15 / 81`) | `Reveal.getSlidePastCount()` / `Reveal.getTotalSlides()` |

The `.gtb-sep` spans render the `·` separators; the one after `.gtb-chapter` (`slug-sep`) becomes `opacity:0` when there is no `<h2>`.

### Per-slide `.tag-bar`

Every slide HTML still contains a `.tag-bar` div with `.chapter-tag` and `.slide-tag` spans. These are **hidden globally** (`display: none !important` in CSS) — they serve only as data carriers for JS. Do not remove them.

```html
<div class="tag-bar">
  <span class="chapter-tag" data-i18n="cN.tag">Chapter N · Topic</span>
  <span class="slide-tag"></span>
</div>
```

- **`.chapter-tag`** — `data-i18n` key drives both i18n resolution and chapter grouping in `buildChapterIndex()`. Leave the key as-is.
- **`.slide-tag`** — can be left empty; it is no longer displayed.

### Rules

- Never remove `.tag-bar` from slides — it is the data source for the global bar.
- When adding a new chapter, use the same `cN.tag` key pattern so `buildChapterIndex()` groups correctly.
- The global bar is automatically hidden in PDF/print mode and on small screens (≤ 600 px).

### Jargon tooltips

Use `<abbr class="jargon" title="Full expansion">ACRONYM</abbr>` for any acronym that should show a tooltip. A JS tooltip (`#jargon-tip` div, appended to `<body>`) is used instead of a CSS `::after` pseudo-element to avoid Reveal.js viewport clipping.

```html
<abbr class="jargon" title="Retrieval-Augmented Generation">RAG</abbr>
```

---

## 8. Build System

The build script `scripts/build-slides.mjs` concatenates all slide partials (sorted per-folder) and injects them into `index.template.html` at the `<!-- @slides -->` marker.

| Command | What it does |
|---------|-------------|
| `npm run build:index` | Compile slide partials → `index.html` |
| `npm run check:index` | Verify `index.html` is up-to-date (exits 0 if "match") |
| `npm run dev` | Start Vite dev server |

The chapter order is defined in `SLIDE_SOURCE_GROUPS` inside `build-slides.mjs`:

> preface → chapter1 → chapter2 → chapter3 → chapter4 → chapter5 → chapter6 → backmatter → annex

### After any edit to slide files

```bash
npm run build:index && npm run check:index
```

---

## 9. Other Scripts

| Script | Purpose |
|--------|---------|
| `node scripts/export-to-medium.js` | Export slides as a Medium-ready markdown story |


---

## 10. UI Components

### Top-right toolbar (`.lang-bar`)

Fixed top-right bar with: **laser pointer** (⊹) · **language buttons** (EN IT FR ES) · **PDF export** (⬇ PDF) · **fullscreen** (⛶).

### Slide menu (`#slide-menu`)

Hamburger button (☰ Menu) bottom-left opens a collapsible panel with chapter headings, slide search, and direct navigation. Styled in `css/slide-menu.css`.

#### Menu integrity constraint

**The slide menu is the single navigation surface of the deck. It must always be a complete, accurate mirror of the deck structure — every top-level section and every individual slide must be reachable from the menu.** No section or slide may exist in `slides/` without a corresponding entry in the menu, and no menu entry may point to a section or slide that no longer exists.

The menu configuration lives in `js/slide-menu.js` in two structures:

1. **`MENU_I18N`** — chapter/section labels in all 4 languages (EN / IT / FR / ES). Each language has a `chapters` object mapping section IDs to display labels. **Every top-level section** — including `preface`, `chapter-1` through `chapter-6`, `back-matter`, and `annex` — must have an entry here in all four languages.
2. **`CHAPTERS`** — ordered array of `{ id, tag }` objects that defines which sections appear in the menu and in what order. The order must match `SLIDE_SOURCE_GROUPS` in `build-slides.mjs`. **Every section present in `SLIDE_SOURCE_GROUPS` must have a matching entry in `CHAPTERS`.**

#### Required menu actions

Whenever you make **any** structural change to the deck, update the menu accordingly:

| Change | Required menu update |
|--------|----------------------|
| **Create a chapter / section** | Add to `MENU_I18N.*.chapters` in all 4 languages; add `{ id, tag }` to `CHAPTERS` in the correct position; add the folder to `SLIDE_SOURCE_GROUPS` |
| **Remove a chapter / section** | Remove from `MENU_I18N.*.chapters` in all 4 languages; remove from `CHAPTERS`; remove from `SLIDE_SOURCE_GROUPS` |
| **Rename a chapter / section** | Update the label in `MENU_I18N.*.chapters` for all 4 languages; update `tag` in `CHAPTERS` |
| **Add a slide** | The menu reads slide titles live from rendered `h1`/`h2` content — no extra config needed; `.slide-tag` numbers update automatically at runtime |
| **Remove a slide** | Same — `.slide-tag` numbers update automatically at runtime |
| **Change a slide title** | Update the `h1`/`h2` fallback text and all four lang file values for the shared key; the menu picks up the change automatically |

#### Completeness rules

- The menu must list **all** sections in the same order as `SLIDE_SOURCE_GROUPS`: preface → chapter1 → chapter2 → chapter3 → chapter4 → chapter5 → chapter6 → backmatter → annex.
- Every slide inside a section must be reachable by navigating to that section's group in the menu. Slide titles are read live from the rendered `h1`/`h2` — ensure every slide has a non-empty heading.
- Chapter-divider slides (`.chapter-divider`) count as the first navigable slide of their chapter and must be included in the slide count shown in the menu.
- There must be **no orphan slides** (slides that exist in `slides/` but whose chapter has no `CHAPTERS` entry) and **no ghost entries** (entries in `CHAPTERS` that reference a section ID with no slides on disk).

#### Verification checklist (run after every structural change)

1. `npm run build:index && npm run check:index`
2. Open the slide menu (press `/` or click ☰ Menu)
3. Confirm every top-level section appears as a collapsible group
4. Confirm each group lists the correct slides in the correct order
5. Confirm slide counts in group headers match the actual number of slides per chapter
6. Click at least one slide link per group and confirm navigation lands on the correct slide
7. Switch to each language (EN / IT / FR / ES) and confirm all group labels translate correctly


### Filmstrip overview (`#fs-panel`)

Bottom bar with slide thumbnails. Toggle via ⊞ Overview button or `O` key.

### Narration player (`#narr-player`)

Bottom bar with play/pause/stop, speed, volume, notes toggle, and voice picker. Uses browser TTS. Styled in `css/narration.css`.

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `L` | Toggle laser pointer |
| `F` | Toggle fullscreen |
| `O` | Toggle filmstrip overview |
| `N` | Play/pause narration |
| `/` | Open slide menu |
| `Esc` | Close menus / stop narration |

---

## 11. CSS Design Tokens

Defined in `:root` in `css/theme.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#1C1C1E` | Page background |
| `--bg-card` | `#2C2C2E` | Card background |
| `--bg-elev` | `#3A3A3C` | Elevated surface |
| `--ink` | `#F5F5F7` | Primary text |
| `--ink-mid` | `#A1A1A6` | Secondary text |
| `--ink-mute` | `#8E8E93` | Muted text |
| `--accent` | `#3B82F6` | Blue — primary accent |
| `--accent2` | `#FF6B3D` | Orange — secondary accent |
| `--green` | `#34D399` | Green |
| `--purple` | `#A78BFA` | Purple |
| `--amber` | `#FBBF24` | Amber |
| `--rule` | `rgba(255,255,255,.08)` | Divider lines |
| `--border` | `rgba(255,255,255,.12)` | Card borders |
| `--serif` | DM Serif Display | Headings |
| `--sans` | DM Sans | Body text |
| `--mono` | DM Mono | Code / labels |

---

## 12. Component Classes

### Layout

| Class | Description |
|-------|-------------|
| `.two-col` | 2-column grid |
| `.three-col` | 3-column grid |
| `.flow-row` | Horizontal flex row (diagram steps) |
| `.flow-box` | Step box inside a flow row. Colour modifiers: `.blue` `.green` `.purple` `.amber` `.red` `.dark` |
| `.flow-arrow` | Arrow `→` between flow boxes |

### Cards & badges

| Class | Description |
|-------|-------------|
| `.model-card` | Bordered card with hover lift |
| `.badge` | Inline pill label. Modifiers: `.badge-det` (blue) `.badge-green` `.badge-purple` `.badge-prob` (orange) `.badge-amber` |
| `.key-insight` | Highlight box (blue left border). Always last content before `.tag-bar` |

### Text & lists

| Class | Description |
|-------|-------------|
| `.prompt-block` | Dark code/prompt block. Inner: `.role` `.highlight` `.comment` |
| `.example-list` | Styled `<ul>` with arrow bullets |
| `.ref-list` | Reference list (smaller, monospace) |
| `.step-list` | Numbered step list with `.step-num` circles |

### Slide chrome

| Class | Description |
|-------|-------------|
| `.tag-bar` | Top-of-slide one-line bar: chapter · slide title · slide count (see §7) |
| `.sh-chapter` | Chapter number + name segment inside `.tag-bar` |
| `.sh-title` | Current slide title segment inside `.tag-bar` |
| `.sh-count` | Slide X / Total segment inside `.tag-bar` |
| `.sh-sep` | Separator dot between segments inside `.tag-bar` |
| `.tag-bar` | Bottom-left bar containing `.chapter-tag` and optional `.slide-tag` |
| `.chapter-tag` | Chapter + topic label |
| `.slide-tag` | Slide number (e.g. `03 / 08`). Omit on summary slides. |
| `.cover-slide` | Class for title/closing slides (dark bg, centred) |
| `.chapter-divider` | Class for chapter cover slides (dark bg, centred) |
| `.cover-dot` | Decorative radial gradient circle |

### Specialised

| Class | Description |
|-------|-------------|
| `.arch-diagram` / `.arch-box` | Architecture diagrams. Box colours: `.input` `.embed` `.attn` `.ffn` `.norm` `.output` |
| `.timeline` / `.tl-item` / `.tl-card` | Horizontal timeline |
| `.param-grid` / `.param-card` | Parameter description grid |
| `.hw-grid` / `.hw-card` | Hardware comparison grid |
| `.eco-map` / `.eco-row` / `.eco-card` | AI ecosystem map. Colours: `.eco-c-blue` `.eco-c-green` `.eco-c-purple` `.eco-c-red` `.eco-c-amber` |
| `abbr.jargon` | Tooltip on hover (uses `title` attr) |

---

## 13. What Agents May / May Not Do

### Allowed

- Create, edit, or delete slide files under `slides/`
- Add `data-i18n` keys and corresponding entries in all four `js/lang/*.js` files
- Add entries to `js/notes/*.js`
- Add new CSS classes to `theme.css`
- Update `MENU_I18N` and `CHAPTERS` in `js/slide-menu.js` whenever chapters are created, removed, or renamed
- Run `npm run build:index` and `npm run check:index`

### Not allowed

- Hand-edit `index.html` (it is generated)
- Remove or rename chapter IDs (`chapter-1` through `chapter-6`, `annex`, `back-matter`)
- Remove `<aside class="notes"></aside>` from any slide
- Use curly/smart quotes in HTML or lang file values
- Add a `data-i18n` key without adding it to **all four** lang files
- Add new inline `data-en`/`data-it`/`data-fr`/`data-es` attributes (use `data-i18n` + lang files instead)

---

## 14. Adding or Changing Slides

1. Create `slides/<chapter>/NN-slug.html` (number determines sort order)
2. Add a `.tag-bar` bar as the **first child** of `<section>` (skip on `.chapter-divider` and `.cover-slide`)
4. Add the corresponding key + string to **all four** lang files (`js/lang/en.js`, `it.js`, `fr.js`, `es.js`)
5. Include `<aside class="notes"></aside>` (even if empty)
6. End with `.tag-bar` containing `.chapter-tag` (and `.slide-tag` if applicable)
7. Update `.slide-tag` and `.sh-count` numbers in the chapter to keep them sequential
8. Ensure the chapter ends with a **Key Takeaways** slide followed by a **Sources & Further Reading** slide (see §6)
9. If a slide title changes, update both the HTML fallback text and the matching values in all four lang files
10. If a chapter/section is created, removed, or renamed — or if any slide is added or removed — apply **all** required menu updates described in §10 (Menu integrity constraint) and run the full verification checklist
11. Run `npm run build:index && npm run check:index`
12. Open the slide menu and confirm every section is listed, every slide is reachable, slide counts are correct, and all four language labels render correctly

---

## 15. Pre-Commit Hook

`.githooks/pre-commit` auto-updates the `updated` field in `js/version.js` and recompiles `index.html` on every commit.

---

## 16. Print / PDF

Append `?print-pdf` to the URL, then `Cmd+P → Save as PDF`. The CSS `@media print` section in `theme.css` handles A4 landscape layout with proper scaling (1280×720 → 0.877× into A4).