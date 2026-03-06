/* ═══════════════════════════════════════════════════════════
   FILMSTRIP — Horizontal slide thumbnail strip
   Toggle with the ⊞ Overview button (bottom-left) or F key.
   Click any thumbnail to jump to that slide.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Chapter accent colours ───────────────────────────────── */
  const ACCENT = {
    'preface'  : '#3B82F6',
    'chapter-1': '#3B82F6',
    'chapter-2': '#A78BFA',
    'chapter-3': '#34D399',
    'chapter-4': '#FF6B3D',
    'chapter-5': '#FBBF24',
    'chapter-6': '#EF4444',
    'annex'    : '#6B7280',
  };
  const BKG = {
    'preface'  : 'rgba(59,130,246,.10)',
    'chapter-1': 'rgba(59,130,246,.10)',
    'chapter-2': 'rgba(167,139,250,.10)',
    'chapter-3': 'rgba(52,211,153,.10)',
    'chapter-4': 'rgba(255,107,61,.10)',
    'chapter-5': 'rgba(251,191,36,.10)',
    'chapter-6': 'rgba(239,68,68,.10)',
    'annex'    : 'rgba(107,114,128,.10)',
  };

  const CHAPTER_IDS = ['chapter-1','chapter-2','chapter-3','chapter-4','chapter-5','chapter-6','annex'];

  /* ── DOM refs ─────────────────────────────────────────────── */
  const $btn   = document.getElementById('fs-btn');
  const $panel = document.getElementById('fs-panel');
  const $strip = document.getElementById('fs-strip');
  if (!$btn || !$panel || !$strip) return;

  /* ── State ────────────────────────────────────────────────── */
  let open   = false;
  let built  = false;
  let thumbs = [];  // parallel array to Reveal slides

  /* ── Wait for Reveal to be ready ─────────────────────────── */
  function whenReady(fn) {
    if (typeof Reveal !== 'undefined' && Reveal.isReady && Reveal.isReady()) {
      fn();
      return;
    }
    // Reveal fires 'ready' on the .reveal element
    var el = document.querySelector('.reveal');
    if (el) el.addEventListener('ready', fn, { once: true });
    // Safety fallback
    setTimeout(function () {
      if (typeof Reveal !== 'undefined' && Reveal.isReady && Reveal.isReady()) fn();
    }, 1200);
  }

  /* ── Detect chapter for a section element ─────────────────── */
  function chapterOf(section) {
    var tag = section.querySelector('.chapter-tag');
    if (tag) {
      var txt = tag.textContent.toLowerCase();
      for (var i = 0; i < CHAPTER_IDS.length; i++) {
        var cid = CHAPTER_IDS[i];
        if (txt.indexOf(cid.replace('-', ' ')) !== -1 || txt.indexOf(cid) !== -1) return cid;
      }
    }
    if (section.id) {
      for (var j = 0; j < CHAPTER_IDS.length; j++) {
        if (section.id === CHAPTER_IDS[j]) return CHAPTER_IDS[j];
      }
    }
    return null;
  }

  /* ── Escape HTML ──────────────────────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Build thumbnails (once) ──────────────────────────────── */
  function build() {
    if (built) return;
    built = true;
    $strip.innerHTML = '';
    thumbs = [];

    var slides = Reveal.getSlides();
    var currentCh = 'preface';

    slides.forEach(function (section, idx) {
      var ch = chapterOf(section);
      if (ch) currentCh = ch;

      var color = ACCENT[currentCh] || '#3B82F6';
      var bkg   = BKG[currentCh]   || 'rgba(59,130,246,.10)';

      // Title: prefer h1/h2, fall back to eyebrow
      var h = section.querySelector('h1, h2');
      var title = h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
      if (!title) {
        var ew = section.querySelector('.eyebrow');
        title = ew ? ew.textContent.trim() : 'Slide ' + (idx + 1);
      }
      if (title.length > 44) title = title.slice(0, 42) + '…';

      // Small chapter tag label
      var tagEl   = section.querySelector('.chapter-tag, .tag-bar .chapter-tag');
      var chLabel = tagEl ? tagEl.textContent.trim() : '';
      // Shorten "Chapter N · Foo" → "Ch.N"
      chLabel = chLabel.replace(/Chapter\s+(\d+)[^·]*·?\s*/i, 'Ch.$1 · ').replace(/·\s*$/, '').trim();
      if (chLabel.length > 20) chLabel = chLabel.slice(0, 18) + '…';

      var thumb = document.createElement('button');
      thumb.className = 'fs-thumb';
      thumb.dataset.idx = String(idx);
      thumb.title = title;
      thumb.setAttribute('aria-label', 'Slide ' + (idx + 1) + ': ' + title);
      thumb.innerHTML =
        '<div class="fs-accent" style="background:' + color + '"></div>' +
        '<div class="fs-body" style="background:' + bkg + '">' +
          '<span class="fs-num">' + (idx + 1) + '</span>' +
          '<span class="fs-title">' + esc(title) + '</span>' +
          (chLabel ? '<span class="fs-ch" style="color:' + color + '">' + esc(chLabel) + '</span>' : '') +
        '</div>';

      thumb.addEventListener('click', function () {
        Reveal.slide(idx);
        closeFilmstrip();
      });

      $strip.appendChild(thumb);
      thumbs.push(thumb);
    });

    // Keep highlight in sync as user navigates normally
    Reveal.on('slidechanged', syncActive);
    syncActive();
  }

  /* ── Sync active highlight ────────────────────────────────── */
  function syncActive() {
    if (!thumbs.length) return;
    var idx = (Reveal.getIndices && Reveal.getIndices().h) || 0;
    thumbs.forEach(function (t, i) {
      t.classList.toggle('fs-active', i === idx);
    });
  }

  /* ── Scroll strip to the active thumbnail ─────────────────── */
  function scrollToActive() {
    if (!Reveal.getIndices) return;
    var idx = Reveal.getIndices().h || 0;
    var t = thumbs[idx];
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  /* ── Open / close ─────────────────────────────────────────── */
  function openFilmstrip() {
    whenReady(function () {
      build();
      open = true;
      $panel.classList.add('fs-open');
      $panel.setAttribute('aria-hidden', 'false');
      $btn.classList.add('fs-raised');        // CSS raises the button above the panel
      $btn.setAttribute('aria-expanded', 'true');
      setTimeout(scrollToActive, 90);
    });
  }

  function closeFilmstrip() {
    open = false;
    $panel.classList.remove('fs-open');
    $panel.setAttribute('aria-hidden', 'true');
    $btn.classList.remove('fs-raised');
    $btn.setAttribute('aria-expanded', 'false');
  }

  function toggleFilmstrip() { open ? closeFilmstrip() : openFilmstrip(); }

  /* ── Controls ─────────────────────────────────────────────── */
  $btn.addEventListener('click', toggleFilmstrip);

  // F key toggles (when not typing)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) { closeFilmstrip(); return; }
    if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      var tag = (document.activeElement || {}).tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') toggleFilmstrip();
    }
  });

  // Click on the panel backdrop (not on the strip) closes it
  $panel.addEventListener('click', function (e) {
    if (e.target === $panel) closeFilmstrip();
  });
})();
