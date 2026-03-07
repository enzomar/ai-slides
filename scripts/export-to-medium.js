#!/usr/bin/env node
/**
 * export-to-medium.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Converts the AI-Slides presentation into a Medium-ready story in Markdown.
 *
 * Text is resolved in priority order:
 *   1. data-i18n key  → looked up in js/lang/en.js (LANG_EN)
 *   2. data-en attr   → legacy inline English strings
 *   3. inner text     → last resort plain text
 *
 * Usage:
 *   node scripts/export-to-medium.js            # includes speaker notes
 *   node scripts/export-to-medium.js --no-notes # slides only
 *   node scripts/export-to-medium.js > medium-story.md
 *
 * Output: Markdown that pastes cleanly into Medium or any Markdown editor.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT         = path.join(__dirname, '..');
const HTML_FILE    = path.join(ROOT, 'index.html');
const LANG_EN_FILE = path.join(ROOT, 'js', 'lang', 'en.js');
const includeNotes = !process.argv.includes('--no-notes');

// ─── Load English lang map ───────────────────────────────────────────────────

let LANG_EN = {};
try {
  const src = fs.readFileSync(LANG_EN_FILE, 'utf8');
  const m   = src.match(/window\.LANG_EN\s*=\s*(\{[\s\S]*?\});/);
  if (m) LANG_EN = new Function('return ' + m[1])();
} catch (e) {
  process.stderr.write('Warning: could not load js/lang/en.js — ' + e.message + '\n');
}

const html = fs.readFileSync(HTML_FILE, 'utf8');

// ─── Text helpers ────────────────────────────────────────────────────────────

/** Strip HTML tags and decode common entities; collapse whitespace. */
function strip(s) {
  return s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g,  "'")
    .replace(/&nbsp;/g, '\u00a0')
    .replace(/&ldquo;/g, '\u201c')
    .replace(/&rdquo;/g, '\u201d')
    .replace(/\s+/g,    ' ')
    .trim();
}

/**
 * Resolve the English text for a snippet of element HTML.
 * Priority: data-i18n key → data-en attr → inner text of first tag.
 */
function resolveText(elHtml) {
  const i18n = elHtml.match(/data-i18n="([^"]+)"/);
  if (i18n) {
    const val = LANG_EN[i18n[1]];
    if (val) return strip(val);
  }
  const en = elHtml.match(/data-en="([\s\S]*?)(?<!\\)"/);
  if (en) return strip(en[1]);
  const inner = elHtml.match(/>([\s\S]*?)<\//);
  return inner ? strip(inner[1]) : '';
}

/**
 * Find all translatable text values inside a block of HTML (document order).
 * Handles both data-i18n keys and legacy data-en attrs.
 */
function allTexts(block) {
  const out = [];
  const re  = /data-i18n="([^"]+)"|data-en="([\s\S]*?)(?<!\\)"/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    const t = m[1] ? strip(LANG_EN[m[1]] || '') : strip(m[2]);
    if (t) out.push(t);
  }
  return out;
}

/** Extract <aside class="notes"> content (plain text). */
function notes(sec) {
  const m = sec.match(/<aside class="notes">([\s\S]*?)<\/aside>/);
  if (!m || !m[1].trim()) return '';
  return strip(m[1]);
}

/** Resolve the text from the first occurrence of `tag` inside `sec`. */
function tagText(sec, tag) {
  const re = new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m  = sec.match(re);
  if (!m) return '';
  return resolveText(`<${tag}${m[1]}>${m[2]}</${tag}>`);
}

/** Extract <li> items using resolveText for each one. */
function listItems(sec) {
  return [...sec.matchAll(/<li([^>]*)>([\s\S]*?)<\/li>/gi)]
    .map(m => resolveText(`<li${m[1]}>${m[2]}</li>`))
    .filter(Boolean);
}

/** Strip <svg>…</svg> blocks so embedded data-en labels don't pollute text. */
function stripSvg(s) {
  return s.replace(/<svg[\s\S]*?<\/svg>/gi, '');
}

/** Extract all hyperlinks from a block of HTML as { text, href } objects. */
function extractLinks(block) {
  return [...block.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\/s\S]*?)<\/a>/gi)]
    .map(m => ({ href: m[1].trim(), text: strip(m[2]) }))
    .filter(l => l.href && l.href !== '#' && !l.href.startsWith('javascript') && l.text);
}

/** True when a slide should be skipped entirely. */
function shouldSkip(sec) {
  const noSvg   = stripSvg(sec);
  const heading = tagText(noSvg, 'h2') || tagText(noSvg, 'h1');

  const SKIP_HEADINGS = [
    /^How to Use/i,
    /^What We.ll Cover/i,
    /^Reader.?s Guide/i,
    /^Agenda/i,
  ];
  if (SKIP_HEADINGS.some(re => re.test(heading))) return true;
  return false;
}

// ─── Chapter display names ───────────────────────────────────────────────────

const CHAPTER_NAMES = {
  'chapter-1':  'Chapter 01 · Introduction',
  'chapter-2':  'Chapter 02 · Prompt Engineering',
  'chapter-3':  'Chapter 03 · AI-Assisted Coding',
  'chapter-4':  'Chapter 04 · RAG Architecture',
  'chapter-5':  'Chapter 05 · AI Agents & MCP',
  'chapter-6':  'Chapter 06 · Ethics & Future',
  'conclusion': 'Conclusion',
  'annex':      'Annex',
};

// ─── Parse slides ────────────────────────────────────────────────────────────

const rawSections = html.split(/(?=<section\b)/g).filter(s => s.trim().startsWith('<section'));

const out  = [];
// Collected references: { chapter, links[] }
const refs = [];
let   currentChapter = '';

function push(s) { out.push(s); }
function line()  { out.push('');  }

rawSections.forEach(sec => {
  const attrs        = sec.match(/^<section([^>]*)>/)?.[1] ?? '';
  const isChapterDiv = /class="chapter-divider"/.test(attrs);
  const isCoverSlide = /class="cover-slide"/.test(attrs);
  const idMatch      = attrs.match(/id="([^"]+)"/);
  const id           = idMatch ? idMatch[1] : '';

  if (shouldSkip(sec)) return;

  // ── DECK COVER (preface) ──────────────────────────────────────
  if (isCoverSlide) {
    push('# Understanding Artificial Intelligence');
    push('### A Visual Journey for Everyone');
    line();
    push('*By Vincenzo Marafioti · [linkedin.com/in/vincenzo-marafioti](https://www.linkedin.com/in/vincenzo-marafioti/)*');
    line();
    const sub = tagText(sec, 'p');
    if (sub) { push(sub); line(); }
    return;
  }

  // ── CHAPTER DIVIDER ───────────────────────────────────────────
  if (isChapterDiv) {
    currentChapter = CHAPTER_NAMES[id] || tagText(sec, 'h1') || id;
    line();
    push('---');
    line();

    const chapterName = currentChapter;
    const hook = (() => {
      for (const pm of sec.matchAll(/<p([^>]*)>([\s\S]*?)<\/p>/gi)) {
        const t = resolveText(`<p${pm[1]}>${pm[2]}</p>`);
        if (t.length > 40) return t;
      }
      return '';
    })();

    push(`## ${chapterName}`);
    line();
    if (hook) { push(hook); line(); }
    return;
  }

  // ── REFERENCE / RESOURCE SLIDE ─────────────────────────────────
  if (/class="ref-list"/.test(sec)) {
    const links = extractLinks(sec);
    if (links.length) refs.push({ chapter: currentChapter, links });
    return;
  }

  // ── REGULAR SLIDE ─────────────────────────────────────────────

  const ss      = stripSvg(sec);
  const heading = tagText(ss, 'h2') || tagText(ss, 'h1');
  if (!heading) return;

  push(`### ${heading}`);
  line();

  // ── Timeline items (.tl-item) ────────────────────────────────
  const tlItems = [...ss.matchAll(/<div class="tl-item">([\s\S]*?)(?=<div class="tl-item"|<\/div>\s*<\/div>\s*<\/div>)/g)];
  if (tlItems.length) {
    tlItems.forEach(ti => {
      const yearEl = ti[0].match(/<div class="tl-year[^"]*">([^<]+)<\/div>/);
      const year   = yearEl ? yearEl[1].trim() : '';
      const label  = tagText(ti[0], 'h4');
      const desc   = (() => {
        const pm = ti[0].match(/<p([^>]*)>([\s\S]*?)<\/p>/i);
        return pm ? resolveText(`<p${pm[1]}>${pm[2]}</p>`) : '';
      })();
      if (label) push(`- **${year ? year + ' — ' : ''}${label}**: ${desc}`);
    });
    line();
  }

  // ── Model cards ───────────────────────────────────────────────
  const modelCards = [...ss.matchAll(/class="model-card"[\s\S]*?(?=class="model-card"|<aside|<div class="tag-bar|<\/section)/g)];
  if (modelCards.length > 1) {
    modelCards.forEach(mc => {
      const badgeM = mc[0].match(/class="badge[^"]*"([^>]*)>([\s\S]*?)<\/div>/);
      const badge  = badgeM ? resolveText(`<div class="badge"${badgeM[1]}>${badgeM[2]}</div>`) : '';
      const labelM = mc[0].match(/class="label"([^>]*)>([\s\S]*?)<\/div>/);
      const label  = labelM ? resolveText(`<div class="label"${labelM[1]}>${labelM[2]}</div>`) : '';
      const items  = listItems(mc[0]);
      if (!badge && !label && !items.length) return;
      if (badge) push(`**${badge}**`);
      if (label) push(label);
      items.forEach(i => push(`- ${i}`));
      line();
    });
  } else {
    const items = listItems(ss);
    if (items.length) {
      items.forEach(i => push(`- ${i}`));
      line();
    }
  }

  // ── Flow boxes ────────────────────────────────────────────────
  const flowBoxes = [...ss.matchAll(/class="flow-box"([^>]*)>([\s\S]*?)<\/div>/g)]
    .map(m => resolveText(`<div class="flow-box"${m[1]}>${m[2]}</div>`))
    .filter(Boolean);
  if (flowBoxes.length) {
    push(flowBoxes.join(' → '));
    line();
  }

  // ── Prompt blocks ─────────────────────────────────────────────
  const promptBlocks = [...ss.matchAll(/class="prompt-block"([^>]*)>([\s\S]*?)<\/div>/g)];
  promptBlocks.forEach(pb => {
    const texts = allTexts(pb[0]);
    if (texts.length) {
      push('```');
      texts.forEach(t => push(t));
      push('```');
      line();
    }
  });

  // ── Standalone paragraphs ─────────────────────────────────────
  for (const pm of ss.matchAll(/<p([^>]*)>([\s\S]*?)<\/p>/gi)) {
    const t = resolveText(`<p${pm[1]}>${pm[2]}</p>`);
    if (t.length < 20)                                       continue;
    if (t === heading)                                       continue;
    if (/Last Updated|may be shared|attribution/i.test(t))  continue;
    push(t);
    line();
  }

  // ── Key insights (blockquotes) ────────────────────────────────
  const insightBlocks = [...ss.matchAll(/class="key-insight[^"]*"([^>]*)>([\s\S]*?)<\/div>/g)];
  insightBlocks.forEach(ib => {
    const texts = allTexts(ib[0]);
    if (texts.length) {
      push(`> **${texts[0]}** ${texts.slice(1).join(' ')}`);
      line();
    }
  });

  // ── Speaker notes ─────────────────────────────────────────────
  if (includeNotes) {
    const n = notes(sec);
    if (n && n.length > 10) {
      push(`*${n}*`);
      line();
    }
  }
});

// ─── References & Further Reading ───────────────────────────────────────────

if (refs.length) {
  out.push('');
  out.push('---');
  out.push('');
  out.push('## References & Further Reading');
  out.push('');
  // Deduplicate across chapters by href
  const seen   = new Set();
  let lastChap = '';
  refs.forEach(({ chapter, links }) => {
    links.forEach(({ href, text }) => {
      if (seen.has(href)) return;
      seen.add(href);
      if (chapter !== lastChap) {
        out.push('');
        out.push(`**${chapter}**`);
        out.push('');
        lastChap = chapter;
      }
      out.push(`- [${text}](${href})`);
    });
  });
}

// ─── Closing ─────────────────────────────────────────────────────────────────

out.push('');
out.push('---');
out.push('');
out.push('*This article was drawn from the "Understanding Artificial Intelligence" slide guide by Vincenzo Marafioti — six chapters of hands-on AI experience, shared openly. The full interactive presentation is publicly available on GitHub.*');

console.log(out.join('\n'));
