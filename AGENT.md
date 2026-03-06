# AGENT.md — AI Slides Project

This file is a working guide for any AI agent (GitHub Copilot, Cursor, Claude, etc.) that edits this project.
Read it before making any changes.

---

## Project overview

A **Reveal.js 4.6.1** presentation on Artificial Intelligence (6 chapters + Annex).
The source is split into HTML partials and compiled into the shipped `index.html` with **Vite**.

```
index.html          ← compiled output used by scripts / publishing
index.template.html ← source shell with the `<!-- @slides -->` placeholder
slides/
  preface.html      ← cover + reader guide + agenda
  chapter1.html     ← Chapter 1 slides
  chapter2.html     ← Chapter 2 slides
  chapter3.html     ← Chapter 3 slides
  chapter4.html     ← Chapter 4 slides
  chapter5.html     ← Chapter 5 slides
  chapter6.html     ← Chapter 6 slides
  annex.html        ← Annex + closing slides
css/
  theme.css         ← design tokens, layout classes, component styles
  animations.css    ← token-prediction, attention-heatmap, word-cloud
  narration.css     ← TTS panel styles
  slide-menu.css    ← side navigator panel styles
js/
  slides.js         ← Reveal.js init, setLang(), syncTagBars(), updateNotes()
  slide-menu.js     ← slide navigator with search (window.refreshSlideMenu)
  animations.js     ← interactive animations (token prediction, attention heatmap)
  narration.js      ← TTS narration engine
  filmstrip.js      ← filmstrip overview panel
  lang/
    en.js / it.js / fr.js / es.js   ← window.LANG_XX  objects (UI strings)
  notes/
    en.js / it.js / fr.js / es.js   ← window.NOTES_XX objects (speaker notes)
scripts/
  build-slides.mjs  ← bootstraps partials and compiles `index.template.html` → `index.html`
  setup-git-hooks.mjs ← installs the repo-managed pre-commit hook
  extract-notes.js  ← reads index.html, dumps speaker notes to stdout
  strip-notes.js    ← empties all <aside class="notes"> for public sharing
  wrap-tags.js      ← wraps bare chapter-tag + slide-tag pairs into .tag-bar
vite.config.mjs     ← Vite dev server config for serving the source template
.githooks/pre-commit ← updates `js/version.js` and recompiles `index.html`
```

### Editing rule

- Edit `index.template.html` and `slides/*.html`
- Do **not** hand-edit `index.html` unless you are intentionally patching compiled output
- Run `npm run build:index` after structural changes (the pre-commit hook does this automatically)

---

## Multilingual system — CRITICAL RULES

Every piece of user-visible text in `index.html` must carry **all four language attributes**:

```html
<p data-en="Hello world"
   data-it="Ciao mondo"
   data-fr="Bonjour monde"
   data-es="Hola mundo">Hello world</p>
```

### Rules that must never be broken

1. **All four attributes are required** — `data-en`, `data-it`, `data-fr`, `data-es`.  
   Missing one means that language silently shows the previous text.

2. **The visible text node (after `>`) must always match `data-en`.**  
   The page loads in English by default; the JS switcher (`setLang()`) overwrites it at runtime.

3. **`data-en` is the source of truth.** When editing content, edit `data-en` first then update the other three.
   For IT/FR/ES, mark untranslated new text with the same string as `data-en` — it is preferable to have English shown than no text at all.

4. **Never use bare hardcoded text** inside elements that the language switcher touches.  
   Exception: pure decorative/code content (`<code>`, `.prompt-block`, emoji).

---

## Slide structure — REQUIRED ANATOMY

Every content slide must follow this exact order:

```html
<section>
  <div class="eyebrow" data-en="…" data-it="…" data-fr="…" data-es="…">…</div>
  <div class="rule"></div>   <!-- optional horizontal rule -->
  <h2 data-en="…" data-it="…" data-fr="…" data-es="…">…</h2>

  <!-- content here -->

  <div class="key-insight fragment">   <!-- optional; always last content element -->
    <strong data-en="Label:" …>Label:</strong>
    <span data-en=" …" …> …</span>
  </div>

  <aside class="notes"></aside>   <!-- MUST be present, even if empty -->
  <div class="tag-bar">
    <span class="chapter-tag">Chapter N · Topic</span>
    <span class="slide-tag">NN / MM</span>   <!-- omit on chapter summary slides -->
  </div>
</section>
```

**Chapter divider slides** use a different structure:

```html
<section class="chapter-divider" id="chapter-N">
  <div class="cover-dot"></div>
  <div class="eyebrow" style="color:var(--ink-mute);" data-en="Chapter 0N" …>Chapter 0N</div>
  <div class="rule" style="margin:0 auto 28px;"></div>
  <h1 style="text-align:center;" data-en="Title" …>Title</h1>
  <p style="color:var(--ink-mid);max-width:520px;…" data-en="Hook sentence." …>Hook sentence.</p>
  <span class="chapter-tag" style="color:rgba(255,255,255,.25);">Topic Label</span>
  <aside class="notes"></aside>
</section>
```

### IDs used by agenda links — do not rename

| ID | Slide |
|----|-------|
| `chapter-1` | Introduction |
| `chapter-2` | Prompt Engineering |
| `chapter-3` | AI-Assisted Coding |
| `chapter-4` | RAG Architecture |
| `chapter-5` | AI Agents & MCP |
| `chapter-6` | Ethics & Future |
| `annex` | Annex / Additional Materials |

---

## CSS design tokens and component classes

Design tokens live in `css/theme.css` as CSS custom properties on `:root`.

| Token | Purpose |
|-------|---------|
| `--accent` | Blue (#3B82F6) |
| `--green` | Green (#34D399) |
| `--purple` | Purple (#A78BFA) |
| `--accent2` | Orange/Red (#FF6B3D) |
| `--amber` | Amber (#FBB724) |
| `--ink-mid` | Mid-tone text |
| `--ink-mute` | Muted text |
| `--mono` | Monospace font stack |
| `--sans` | Sans-serif font stack |

### Layout classes

| Class | Description |
|-------|-------------|
| `.two-col` | 2-column grid |
| `.three-col` | 3-column grid |
| `.flow-row` | Horizontal flex row (diagram steps) |
| `.flow-box` | Step box inside a flow row (modifiers: `.blue`, `.green`, `.purple`, `.amber`, `.dark`) |
| `.flow-arrow` | Arrow `→` between flow boxes |

### Content component classes

| Class | Description |
|-------|-------------|
| `.model-card` | Bordered card with subtle background |
| `.key-insight` | Highlight box, typically last content before tag-bar |
| `.eyebrow` | Small uppercase label above heading |
| `.rule` | Horizontal divider line |
| `.badge` | Inline pill label. Modifiers: `.badge-det` (blue), `.badge-green`, `.badge-purple`, `.badge-prob` (orange) |
| `.prompt-block` | Code/prompt block with monospace styling. Inners: `.role`, `.highlight` |
| `.example-list` | Styled `<ul>` for bullet points |
| `.ref-list` | Styled `<ul>` for reference lists |
| `.step-list` | Numbered step list |
| `.param-grid` / `.param-card` | Parameter description grid |
| `.tag-bar` | Bottom footer bar containing `.chapter-tag` and `.slide-tag` |

---

## Comment conventions in slide partials / compiled HTML

Major structural boundaries use this pattern:

```html
<!-- ══════════════════════ CHAPTER COVER ══════════════════════ -->
<!-- ══════════════════════ SLIDE 1: TITLE ══════════════════════ -->
<!-- ══════════════════════ REFERENCES ══════════════════════ -->
<!-- ══════════════════════ CHAPTER N SUMMARY ══════════════════════ -->
<!-- chapter4.html -->   ← legacy boundary markers, do not remove
```

These legacy markers now live inside the relevant files in `slides/` and are preserved in the compiled `index.html`.

---

## Slide numbering

Slide tags use the format `"NN / MM"` (e.g. `"03 / 07"`).  
When a slide is **added or removed** from a chapter, update all `slide-tag` values in that chapter to keep the count accurate.

Chapter summary slides (added before each References slide) intentionally **omit the slide-tag** — they are transition slides, not counted in the main lecture sequence.

---

## Scripts

Run from the project root:

```bash
npm run dev                        # serve the source template through Vite
npm run build:index                # compile partials into index.html
node scripts/build-slides.mjs bootstrap   # one-time split from compiled index.html
node scripts/extract-notes.js         # Prints speaker notes summary to stdout
node scripts/strip-notes.js           # Empties all <aside class="notes"> in-place
node scripts/wrap-tags.js             # Wraps bare chapter-tag+slide-tag into .tag-bar
```

`extract-notes.js` still reads the compiled `index.html`.
`strip-notes.js` and `wrap-tags.js` now mutate the source partials and rebuild `index.html` automatically.

---

## Version file

`js/version.js` exports `window.AI_SLIDES_VERSION`:

```js
window.AI_SLIDES_VERSION = { version: "2.0", updated: "March 2026" };
```

`index.html` reads this to render the cover footer:

```html
<p id="slide-version" style="…">Last Updated: March 2026 · v2.0</p>
<script src="js/version.js"></script>
```

The repo-managed pre-commit hook at `.githooks/pre-commit` updates `updated` to the current month/year and recompiles `index.html` automatically on every commit.

---

## What can break — checklist before committing

- [ ] Every new/edited element with visible text has all four `data-XX` attributes
- [ ] The visible text node matches `data-en`
- [ ] New slides end with `<aside class="notes"></aside>` + `.tag-bar`
- [ ] Slide numbers (`slide-tag`) are correct for the chapter
- [ ] Chapter divider `id` attributes are unchanged
- [ ] No bare hardcoded text outside `.prompt-block` or `<code>` elements
- [ ] `js/version.js` is up to date if a meaningful content change was made
- [ ] `scripts/wrap-tags.js` was run if any new bare `chapter-tag`/`slide-tag` pairs were added outside a `.tag-bar`
- [ ] `npm run build:index` succeeds after editing `index.template.html` or anything under `slides/`
