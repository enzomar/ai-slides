#!/usr/bin/env node
/**
 * export-to-medium.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Converts the AI-Slides presentation into a Medium-ready story in Markdown.
 * Text is taken from data-en attributes so the output is always English.
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

const HTML_FILE    = path.join(__dirname, '..', 'index.html');
const includeNotes = !process.argv.includes('--no-notes');

const html = fs.readFileSync(HTML_FILE, 'utf8');

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Strip tags and decode common HTML entities. */
function strip(s) {
  return s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, '\u00a0')
    .replace(/\s+/g,    ' ')
    .trim();
}

/** Return the data-en value of the first match inside a string, or ''. */
function dataEn(s) {
  const m = s.match(/data-en="([\s\S]*?)(?<!\\)"/);
  return m ? strip(m[1]) : '';
}

/** Return ALL data-en values found inside a string, in order. */
function allDataEn(s) {
  const out = [];
  const re  = /data-en="([\s\S]*?)(?<!\\)"/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const t = strip(m[1]);
    if (t) out.push(t);
  }
  return out;
}

/** Extract <aside class="notes"> content (plain text). */
function notes(sec) {
  const m = sec.match(/<aside class="notes">([\s\S]*?)<\/aside>/);
  if (!m) return '';
  return strip(m[1]);
}

/** Extract the data-en from a specific tag name's first occurrence. */
function tagDataEn(sec, tag) {
  const re  = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m   = sec.match(re);
  if (!m) return '';
  return dataEn(m[0]) || strip(m[1]);
}

/** Split a section's HTML into sub-blocks by class name. */
function findBlocks(sec, className) {
  const re  = new RegExp(`class="${className}[^"]*"[\\s\\S]*?</div>`, 'g');
  return [...sec.matchAll(re)].map(m => m[0]);
}

/** Extract <li> items (data-en or inner text). */
function listItems(sec) {
  return [...sec.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map(m => dataEn(m[0]) || strip(m[1]))
    .filter(Boolean);
}

/** True when a slide should be skipped entirely. */
function shouldSkip(sec, id) {
  // Strip SVG content before heading checks to avoid false positives
  const noSvg = sec.replace(/<svg[\s\S]*?<\/svg>/gi, '');

  const h1 = tagDataEn(noSvg, 'h1') || '';
  const h2 = tagDataEn(noSvg, 'h2') || '';
  const heading = h1 || h2;

  const SKIP_HEADINGS = [
    /^How to Use/i,
    /^Sources? &|^Sources? and|^Further Reading|^References?$/i,
    /^What We.ll Cover/i,
    /^Reader.?s Guide/i,
    /^Agenda/i,
  ];
  if (SKIP_HEADINGS.some(re => re.test(heading))) return true;
  if (/class="ref-list"/.test(sec)) return true;
  return false;
}

/** Strip <svg>…</svg> blocks so their embedded data-en labels don't pollute text. */
function stripSvg(s) {
  return s.replace(/<svg[\s\S]*?<\/svg>/gi, '');
}

// ─── parse slides ─────────────────────────────────────────────────────────────

// Split on opening <section tags (keep the rest of each tag's attributes)
const rawSections = html.split(/(?=<section\b)/g).filter(s => s.trim().startsWith('<section'));

const out = [];

function push(s) { out.push(s); }
function line()  { out.push(''); }

rawSections.forEach((sec) => {
  // Classify the slide
  const attrs           = sec.match(/^<section([^>]*)>/)?.[1] ?? '';
  const isChapterDiv    = /class="chapter-divider"/.test(attrs);
  const isCoverSlide    = /class="cover-slide"/.test(attrs);
  const idMatch         = attrs.match(/id="([^"]+)"/);
  const id              = idMatch ? idMatch[1] : '';

  if (shouldSkip(sec, id)) return;

  // ── COVER ──────────────────────────────────────────────────────
  if (isCoverSlide) {
    push('# Understanding Artificial Intelligence');
    push('### A Visual Journey for Everyone');
    line();
    push('*By Vincenzo Marafioti · [linkedin.com/in/vincenzo-marafioti](https://www.linkedin.com/in/vincenzo-marafioti/)*');
    line();
    // subtitle paragraph
    const sub = tagDataEn(sec, 'p');
    if (sub) { push(sub); line(); }
    // Chapter dividers each emit their own ---; no extra one needed here
    return;
  }

  // ── CHAPTER DIVIDER ────────────────────────────────────────────
  if (isChapterDiv) {
    line();
    const chapterLabel  = dataEn(sec.match(/class="eyebrow"[^>]*>([\s\S]*?)<\/div>/)?.[0] || '');
    const chapterTitle  = tagDataEn(sec, 'h1') || tagDataEn(sec, 'h2');
    const hook          = (() => {
      // first <p> with substantial data-en
      const pMatches    = [...sec.matchAll(/<p[^>]+data-en="([^"]+)"/g)];
      for (const pm of pMatches) {
        const t = strip(pm[1]);
        if (t.length > 40) return t;
      }
      return '';
    })();

    push('---');
    line();
    if (chapterLabel) push(`> *${chapterLabel}*`);
    push(`## ${chapterTitle}`);
    line();
    if (hook) { push(hook); line(); }
    return;
  }

  // ── REGULAR SLIDE ──────────────────────────────────────────────

  // Strip SVG content so its embedded data-en labels don't pollute extraction
  const ss = stripSvg(sec);

  // Title
  const heading = tagDataEn(ss, 'h2') || tagDataEn(ss, 'h1');
  if (!heading) return; // skip slides with no real title

  push(`### ${heading}`);
  line();

  // ── Sub-headings / eyebrow (only non-"Slide N" ones)
  // (skipped — those are slide numbers, not content)

  // ── Timeline items (.tl-item: year + h4 title + description p) ─
  const tlItems = [...ss.matchAll(/<div class="tl-item">([\s\S]*?)(?=<div class="tl-item"|<\/div>\s*<\/div>\s*<\/div>)/g)];
  if (tlItems.length) {
    tlItems.forEach(ti => {
      const yearEl = ti[0].match(/<div class="tl-year[^"]*">([^<]+)<\/div>/);
      const year   = yearEl ? yearEl[1].trim() : '';
      const label  = tagDataEn(ti[0], 'h4');
      const desc   = (() => {
        const pm = ti[0].match(/<p[^>]+data-en="([^"]+)"/);
        return pm ? strip(pm[1]) : '';
      })();
      if (label) push(`- **${year ? year + ' — ' : ''}${label}**: ${desc}`);
    });
    line();
  }

  // ── Model cards: badge label + items ───────────────────────────
  const modelCards = [...ss.matchAll(/class="model-card"[\s\S]*?(?=class="model-card"|<aside|<div class="tag-bar|<\/section)/g)];
  if (modelCards.length > 1) {
    modelCards.forEach(mc => {
      const badge = dataEn(mc[0].match(/class="badge[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[0] || '');
      const label = dataEn(mc[0].match(/class="label"[^>]*>([\s\S]*?)<\/div>/)?.[0] || '');
      const items = listItems(mc[0]);

      if (items.length === 0 && !label) return; // skip empty badge-only cards
      if (badge) push(`**${badge}**`);
      if (label) push(label);
      if (items.length) {
        items.forEach(i => push(`- ${i}`));
      }
      line();
    });
  } else {
    // Single-card or no model-card: just extract list items from the slide
    const items = listItems(ss);
    if (items.length) {
      items.forEach(i => push(`- ${i}`));
      line();
    }
  }

  // ── Flow rows / flow boxes ──────────────────────────────────────
  const flowBoxes = [...ss.matchAll(/class="flow-box"[^>]*>([\s\S]*?)<\/div>/g)]
    .map(m => dataEn(m[0]) || strip(m[1]))
    .filter(Boolean);
  if (flowBoxes.length) {
    push(flowBoxes.join(' → '));
    line();
  }

  // ── Prompt blocks ───────────────────────────────────────────────
  const promptBlocks = [...ss.matchAll(/class="prompt-block"[^>]*>([\s\S]*?)<\/div>/g)];
  promptBlocks.forEach(pb => {
    const texts = allDataEn(pb[0]);
    if (texts.length) {
      push('```');
      texts.forEach(t => push(t));
      push('```');
      line();
    }
  });

  // ── Standalone paragraphs (not inside model-card / tag-bar) ─────
  // Pull <p> tags with data-en that have substantial content
  const pMatches = [...ss.matchAll(/<p[^>]+data-en="([^"]+)"[^>]*>/g)];
  pMatches.forEach(pm => {
    const t = strip(pm[1]);
    // Skip short labels, slide-number-like strings, and tag content
    if (t.length < 20) return;
    // Skip if already captured as hook/heading
    if (t === heading)  return;
    // Skip copyright / version lines
    if (/Last Updated|may be shared|attribution/i.test(t)) return;
    push(t);
    line();
  });

  // ── Key insights (blockquotes) ──────────────────────────────────
  const insightBlocks = [...ss.matchAll(/class="key-insight[^"]*"[^>]*>([\s\S]*?)<\/div>/g)];
  insightBlocks.forEach(ib => {
    const texts = allDataEn(ib[0]);
    if (texts.length) {
      push(`> **${texts[0]}** ${texts.slice(1).join(' ')}`);
      line();
    }
  });

  // ── Speaker notes ───────────────────────────────────────────────
  if (includeNotes) {
    const n = notes(sec);
    if (n && n.length > 10) {
      push(`*${n}*`);
      line();
    }
  }
});

// ─── output ──────────────────────────────────────────────────────────────────

out.push('');
out.push('---');
out.push('');
out.push('*This article was generated from the "Understanding Artificial Intelligence" slide guide by Vincenzo Marafioti. The full interactive presentation is publicly available on GitHub.*');

console.log(out.join('\n'));
