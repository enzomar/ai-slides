/* ═══════════════════════════════════════════════════════════
   AI SLIDES — Shared JavaScript
   Language switcher + Reveal.js init + utilities
   ═══════════════════════════════════════════════════════════ */

let currentLang = 'en';

function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b =>
    b.classList.toggle('active', b.textContent.trim().toLowerCase() === lang)
  );
  document.querySelectorAll('[data-' + lang + ']').forEach(el => {
    el.innerHTML = el.getAttribute('data-' + lang);
  });
  try { localStorage.setItem('ai-slides-lang', lang); } catch(e) {}
}

function initSlides(opts) {
  const plugins = [];
  if (typeof RevealNotes !== 'undefined') plugins.push(RevealNotes);
  if (typeof RevealMenu  !== 'undefined') plugins.push(RevealMenu);

  const defaults = {
    hash: true, progress: true, controls: true,
    transition: 'fade', transitionSpeed: 'slow',
    width: 1280, height: 720,
    margin: 0, center: false,
    plugins,
    menu: {
      side: 'left',
      width: 'normal',
      numbers: true,
      titleSelector: 'h1, h2',
      useTextContentForMissingTitles: true,
      hideMissingTitles: false,
      markers: true,
      keyboard: true,
      sticky: false,
      autoOpen: false,
      openButton: true,
      openSlideNumber: true,
      themes: false,
      transitions: false,
    }
  };

  // Wire the ☰ nav-bar link to native menu toggle
  const menuBtn = document.querySelector('.nav-bar a');
  if (menuBtn && menuBtn.textContent.trim() === '☰') {
    menuBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const menu = Reveal.getPlugin('menu');
        if (menu && menu.toggle) menu.toggle();
      } catch (err) { /* Reveal not ready yet */ }
    });
  }

  Reveal.initialize(Object.assign(defaults, opts || {})).then(() => {
    // ── Chapter-to-chapter navigation ──
    // On the last slide → right arrow goes to next chapter
    // On the first slide → left arrow goes to previous chapter
    const chapterOrder = [
      'index.html',
      'chapter1.html',
      'chapter2.html',
      'chapter3.html',
      'chapter4.html',
      'chapter5.html',
      'chapter6.html',
      'annex.html'
    ];
    const currentFile = location.pathname.split('/').pop() || 'index.html';
    const currentIdx  = chapterOrder.indexOf(currentFile);

    function getNextChapter() {
      return currentIdx >= 0 && currentIdx < chapterOrder.length - 1
        ? chapterOrder[currentIdx + 1] : null;
    }
    function getPrevChapter() {
      return currentIdx > 0 ? chapterOrder[currentIdx - 1] : null;
    }

    Reveal.on('slidechanged', evt => {
      const totalSlides = Reveal.getTotalSlides();
      const currentSlide = Reveal.getIndices().h;

      // Show/hide nav hints on last/first slides
      const navBar = document.querySelector('.nav-bar');
      if (navBar) {
        const nextLink = navBar.querySelector('a:last-child');
        const prevLink = navBar.querySelectorAll('a')[1];
        if (nextLink && currentSlide === totalSlides - 1) {
          nextLink.style.animation = 'pulse .8s ease-in-out 2';
        } else if (nextLink) {
          nextLink.style.animation = '';
        }
      }
    });

    // Listen for keyboard at document level to catch "beyond last slide" navigation
    document.addEventListener('keydown', evt => {
      const totalSlides = Reveal.getTotalSlides();
      const currentSlide = Reveal.getIndices().h;

      if ((evt.key === 'ArrowRight' || evt.key === 'Right') && currentSlide === totalSlides - 1) {
        const next = getNextChapter();
        if (next) { evt.preventDefault(); window.location.href = next; }
      }
      if ((evt.key === 'ArrowLeft' || evt.key === 'Left') && currentSlide === 0) {
        const prev = getPrevChapter();
        if (prev) { evt.preventDefault(); window.location.href = prev + '?last=1'; }
      }
    });

    // If we arrived via "prev" navigation, jump to last slide
    const params = new URLSearchParams(window.location.search);
    if (params.get('last') === '1') {
      const total = Reveal.getTotalSlides();
      Reveal.slide(total - 1);
      // Clean up the URL without reloading
      history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
  });

  // Restore saved language
  try {
    const saved = localStorage.getItem('ai-slides-lang');
    if (saved && ['en','it','fr','es'].includes(saved)) {
      setTimeout(() => setLang(saved), 100);
    }
  } catch(e) {}



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
