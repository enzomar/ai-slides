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

  // Refresh tag bar (chapter name may change per language)
  if (typeof Reveal !== 'undefined' && typeof Reveal.isReady === 'function' && Reveal.isReady()) {
    updateGlobalTagBar();
  }

  // Refresh slide menu translations
  if (typeof window.refreshSlideMenu === 'function') window.refreshSlideMenu();
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

/* ── REVEAL.JS INIT ──────────────────────────────────────── */
function initSlides(opts) {
  const plugins = [];
  if (typeof RevealNotes !== 'undefined') plugins.push(RevealNotes);

  const defaults = {
    hash: true, progress: false, controls: true,
    transition: 'fade', transitionSpeed: 'slow',
    slideNumber: false,
    width: 1280, height: 720,
    margin: 0, center: false,
    // PDF export: one page per slide, don't expand fragments into separate pages
    pdfSeparateFragments: false,
    pdfMaxPagesPerSlide: 1,
    plugins
  };

  Reveal.initialize(Object.assign(defaults, opts || {})).then(() => {
    // Populate version footer from js/version.js
    const vEl = document.getElementById('slide-version');
    if (vEl && window.AI_SLIDES_VERSION) {
      const { version, updated } = window.AI_SLIDES_VERSION;
      vEl.textContent = `Last Updated: ${updated}\u00a0\u00b7\u00a0v${version}`;
    }

    // Populate notes from external file for the current language
    updateNotes(currentLang);

    // ── Global tag bar ─────────────────────────────────────────────────────
    const pad = n => String(n).padStart(2, '0');

    // Authoritative chapter labels per language, keyed by the section's id.
    // Using a static lookup avoids reading .chapter-tag textContent, which gets
    // clobbered by setLang() because all chapter covers share the same auto-key
    // ("auto.01-chapter-cover.3") and lang files can only store one value for it.
    const CHAPTER_LABEL = {
      '': { // preface — section has no id
        en: 'A Visual Journey for Everyone',
        it: 'Un Viaggio Visivo per Tutti',
        fr: 'Un Voyage Visuel pour Tous',
        es: 'Un Viaje Visual para Todos'
      },
      'chapter-1': {
        en: 'Chapter 01 · Introductionals',
        it: 'Capitolo 01 · Introductionals',
        fr: 'Chapitre 01 · Introductionals',
        es: 'Capítulo 01 · Introductionals'
      },
      'chapter-2': {
        en: 'Chapter 02 · Prompt Engineering',
        it: 'Capitolo 02 · Prompt Engineering',
        fr: 'Chapitre 02 · Prompt Engineering',
        es: 'Capítulo 02 · Prompt Engineering'
      },
      'chapter-3': {
        en: 'Chapter 03 · AI-Assisted Coding',
        it: 'Capitolo 03 · AI-Assisted Coding',
        fr: 'Chapitre 03 · AI-Assisted Coding',
        es: 'Capítulo 03 · AI-Assisted Coding'
      },
      'chapter-4': {
        en: 'Chapter 04 · RAG Architecture',
        it: 'Capitolo 04 · RAG Architecture',
        fr: 'Chapitre 04 · RAG Architecture',
        es: 'Capítulo 04 · RAG Architecture'
      },
      'chapter-5': {
        en: 'Chapter 05 · AI Agents & MCP',
        it: 'Capitolo 05 · AI Agents & MCP',
        fr: 'Chapitre 05 · AI Agents & MCP',
        es: 'Capítulo 05 · AI Agents & MCP'
      },
      'chapter-6': {
        en: 'Chapter 06 · Ethics & Future',
        it: 'Capitolo 06 · Ethics & Future',
        fr: 'Chapitre 06 · Ethics & Future',
        es: 'Capítulo 06 · Ethics & Future'
      },
      'conclusion': {
        en: 'Conclusion',
        it: 'Conclusione',
        fr: 'Conclusion',
        es: 'Conclusión'
      },
      'annex': {
        en: 'Annex',
        it: 'Allegato',
        fr: 'Annexe',
        es: 'Anexo'
      }
    };

    window.updateGlobalTagBar = function updateGlobalTagBar() {
      const bar = document.getElementById('global-tag-bar');
      if (!bar) return;

      // getHorizontalSlides() returns the same flat array that getSlidePastCount()
      // iterates, so indices are guaranteed to match.
      const allSlides = Reveal.getHorizontalSlides();
      const total   = Reveal.getTotalSlides();
      const pastIdx = Reveal.getSlidePastCount();   // 0-based absolute index
      const absIdx  = pastIdx + 1;                  // 1-based

      // Walk backwards from current slide to find the nearest chapter boundary
      // (class "chapter-divider") or fall back to slide 0.
      let chapterStartIdx = 0;
      for (let i = pastIdx; i >= 0; i--) {
        if (i === 0 || allSlides[i]?.classList.contains('chapter-divider')) {
          chapterStartIdx = i;
          break;
        }
      }

      // Walk forwards to find the next chapter boundary (exclusive end).
      let chapterEndIdx = allSlides.length;
      for (let i = chapterStartIdx + 1; i < allSlides.length; i++) {
        if (allSlides[i]?.classList.contains('chapter-divider')) {
          chapterEndIdx = i;
          break;
        }
      }

      const chPos   = pastIdx - chapterStartIdx + 1;
      const chTotal = chapterEndIdx - chapterStartIdx;

      // Read chapter name from the static lookup table (keyed by section id).
      // This avoids reading .chapter-tag textContent, which gets clobbered by
      // setLang() because all chapter covers share the same auto-generated i18n
      // key ("auto.01-chapter-cover.3") and lang files can only store one value.
      const coverSlide  = allSlides[chapterStartIdx];
      const sectionId   = coverSlide?.id || '';
      const chapterText = CHAPTER_LABEL[sectionId]?.[currentLang]
                       ?? CHAPTER_LABEL[sectionId]?.en
                       ?? '';
      const dotIdx = chapterText.indexOf('·');
      let chNum, chName;
      if (dotIdx > -1) {
        chNum  = chapterText.slice(0, dotIdx).trim();
        chName = chapterText.slice(dotIdx + 1).trim();
      } else {
        chNum  = chapterText;
        chName = '';
      }
      // Zero-pad any number in the chapter prefix: "Chapter 2" → "Chapter 02"
      chNum = chNum.replace(/(\d+)/, n => pad(parseInt(n, 10)));

      bar.querySelector('.gtb-ch-num').textContent    = chNum;
      bar.querySelector('.gtb-ch-name').textContent   = chName;
      bar.querySelector('.gtb-ch-count').textContent  = `${pad(chPos)} / ${pad(chTotal)}`;
      bar.querySelector('.gtb-abs-count').textContent = `(${pad(absIdx)} / ${pad(total)})`;

      // Show/hide the name separator when chapter name is empty (preface, etc.)
      const nameSep = bar.querySelector('.name-sep');
      if (nameSep) nameSep.style.opacity = chName ? '' : '0';
    };

    Reveal.on('slidechanged', window.updateGlobalTagBar);
    window.updateGlobalTagBar();

    // Restore saved language after Reveal is ready
    try {
      const saved = localStorage.getItem('ai-slides-lang');
      if (saved && ['en','it','fr','es'].includes(saved)) {
        setLang(saved);
      }
    } catch(e) {}
  });
}

/* ── JARGON TOOLTIPS (body-level, avoids Reveal.js overflow clipping) ──────── */
(function setupJargonTooltips() {
  const tip = document.createElement('div');
  tip.id = 'jargon-tip';
  document.body.appendChild(tip);

  document.addEventListener('mouseover', e => {
    const abbr = e.target.closest('abbr.jargon');
    if (!abbr || !abbr.title) { tip.style.opacity = '0'; return; }
    tip.textContent = abbr.title;
    tip.style.opacity = '0'; // measure before showing
    requestAnimationFrame(() => {
      const r  = abbr.getBoundingClientRect();
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      let x = r.left + r.width / 2 - tw / 2;
      let y = r.top - th - 8;
      if (y < 4) y = r.bottom + 8;
      x = Math.max(4, Math.min(x, window.innerWidth - tw - 4));
      tip.style.left = x + 'px';
      tip.style.top  = y + 'px';
      tip.style.opacity = '1';
    });
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest('abbr.jargon')) tip.style.opacity = '0';
  });
}());

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
