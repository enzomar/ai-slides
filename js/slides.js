/* ═══════════════════════════════════════════════════════════
   AI SLIDES — Shared JavaScript
   Language switcher + Reveal.js init + utilities
   Single-file merged presentation edition
   ═══════════════════════════════════════════════════════════ */

let currentLang = 'en';

/* ── LANGUAGE SWITCHER ───────────────────────────────────── */
function setLang(lang) {
  currentLang = lang;

  // Update active button state
  document.querySelectorAll('.lang-btn').forEach(b =>
    b.classList.toggle('active', b.textContent.trim().toLowerCase() === lang)
  );

  // Try external lang file first (window.LANG_XX), fall back to data-{lang} attributes
  const langObj = window['LANG_' + lang.toUpperCase()];

  if (langObj) {
    // data-i18n key lookup from external language file
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (langObj[key] !== undefined) el.innerHTML = langObj[key];
    });
    // Also update any remaining data-{lang} elements for compatibility
    document.querySelectorAll('[data-' + lang + ']').forEach(el => {
      if (!el.dataset.i18n) el.innerHTML = el.getAttribute('data-' + lang);
    });
  } else {
    // Fallback: inline data-{lang} attributes
    document.querySelectorAll('[data-' + lang + ']').forEach(el => {
      el.innerHTML = el.getAttribute('data-' + lang);
    });
  }

  try { localStorage.setItem('ai-slides-lang', lang); } catch(e) {}

  // Update speaker notes from external NOTES_XX files
  updateNotes(lang);

  // Sync tag-bar slide-tags with eyebrow text
  syncTagBars();
}

/* ── SPEAKER NOTES LOADER ────────────────────────────────── */
/**
 * Populates every <aside class="notes"> from the external
 * window.NOTES_XX object (loaded via js/notes/*.js).
 * Key lookup: slide.id  →  fallback "slide-{index}".
 * Called on init and every language switch.
 */
function updateNotes(lang) {
  const notesObj = window['NOTES_' + lang.toUpperCase()];
  if (!notesObj) return;
  if (typeof Reveal === 'undefined' || !Reveal.isReady || !Reveal.isReady()) return;

  const slides = Reveal.getSlides();
  slides.forEach((section, idx) => {
    const key = section.id || ('slide-' + idx);
    const text = notesObj[key];
    if (text === undefined) return;

    let aside = section.querySelector('aside.notes');
    if (!aside) {
      aside = document.createElement('aside');
      aside.className = 'notes';
      section.appendChild(aside);
    }
    aside.textContent = text;
  });
}

/* ── TAG-BAR SYNC ────────────────────────────────────────── */
/**
 * Copies each slide's .eyebrow text into the .slide-tag inside
 * the .tag-bar, so the bar reads e.g.
 *   "Chapter 1 · Introduction · Slide 07 · Comparison"
 * Called on init and every language switch.
 */
function syncTagBars() {
  document.querySelectorAll('.tag-bar').forEach(bar => {
    const section = bar.closest('section');
    if (!section) return;
    const eyebrow = section.querySelector('.eyebrow');
    const slideTag = bar.querySelector('.slide-tag');
    if (eyebrow && slideTag) {
      slideTag.textContent = eyebrow.textContent;
      eyebrow.style.display = 'none';  // avoid duplicate text
    }
  });
}

/* ── REVEAL.JS INIT ──────────────────────────────────────── */
function initSlides(opts) {
  const plugins = [];
  if (typeof RevealNotes !== 'undefined') plugins.push(RevealNotes);

  const defaults = {
    hash: true, progress: true, controls: true,
    transition: 'fade', transitionSpeed: 'slow',
    width: 1280, height: 720,
    margin: 0, center: false,
    plugins
  };

  Reveal.initialize(Object.assign(defaults, opts || {})).then(() => {
    // Populate notes from external file for the current language
    updateNotes(currentLang);

    // Sync tag-bar slide-tags with eyebrow content
    syncTagBars();

    // Restore saved language after Reveal is ready
    try {
      const saved = localStorage.getItem('ai-slides-lang');
      if (saved && ['en','it','fr','es'].includes(saved)) {
        setLang(saved);
      }
    } catch(e) {}
  });
}

/* ── WORD CLOUD BUILDER ─────────────────────────────────── */
function buildCloud(containerId, tasks, colors) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.innerHTML = '';
  const W = wrap.offsetWidth || 900, H = wrap.offsetHeight || 320;
  const placed = [];
  tasks.sort(() => Math.random() - .5);

  tasks.forEach(t => {
    const el = document.createElement('span');
    el.className = 'cloud-word';
    el.textContent = t.text;
    const fs = 11 + t.size * 9;
    el.style.fontSize = fs + 'px';
    el.style.color = colors[t.cat] || '#333';
    el.style.opacity = 0.6 + t.size * 0.18;
    wrap.appendChild(el);

    const ew = el.offsetWidth, eh = el.offsetHeight;
    let x, y, attempts = 0, ok = false;
    while (!ok && attempts < 400) {
      x = Math.random() * (W - ew);
      y = Math.random() * (H - eh);
      ok = placed.every(p =>
        !(x < p.x + p.w + 12 && x + ew + 12 > p.x && y < p.y + p.h + 8 && y + eh + 8 > p.y)
      );
      attempts++;
    }
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    placed.push({x, y, w: ew, h: eh});
  });
}
