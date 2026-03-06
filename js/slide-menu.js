/* ═══════════════════════════════════════════════════════════
   CUSTOM SLIDE MENU — Chapter-grouped navigation + search
   ═══════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  const overlay = document.getElementById('slide-menu-overlay');
  const menu    = document.getElementById('slide-menu');
  const toggle  = document.getElementById('sm-toggle');
  const closeBtn= document.getElementById('sm-close');
  const search  = document.getElementById('sm-search');
  const list    = document.getElementById('sm-list');

  let menuOpen = false;
  let slideData = []; // { idx, title, chapter, chapterLabel }

  /* ── Chapter mapping ──────────────────────────────────────── */
  const CHAPTERS = [
    { id: 'chapter-1', label: '01 — Introduction',       tag: 'Chapter 1 · Introduction' },
    { id: 'chapter-2', label: '02 — Prompt Engineering',  tag: 'Chapter 2 · Prompt Engineering' },
    { id: 'chapter-3', label: '03 — AI-Assisted Coding',  tag: 'Chapter 3 · AI-Assisted Coding' },
    { id: 'chapter-4', label: '04 — RAG Architecture',    tag: 'Chapter 4 · RAG Architecture' },
    { id: 'chapter-5', label: '05 — AI Agents & MCP',     tag: 'Chapter 5 · AI Agents & MCP' },
    { id: 'chapter-6', label: '06 — Ethics & Governance',  tag: 'Chapter 6 · Ethics & Governance' },
    { id: 'annex',     label: 'Annex',                    tag: 'Annex' },
  ];

  function getChapterForSlide(section) {
    // Check chapter-tag span
    const tag = section.querySelector('.chapter-tag');
    if (tag) {
      const text = tag.textContent.trim();
      for (const ch of CHAPTERS) {
        if (text.includes(ch.tag) || text.includes(ch.id.replace('-', ' '))) return ch;
      }
    }
    // Check id
    if (section.id) {
      for (const ch of CHAPTERS) { if (section.id === ch.id) return ch; }
    }
    return null;
  }

  /* ── Build slide data from Reveal ─────────────────────────── */
  function collectSlides() {
    if (typeof Reveal === 'undefined') return;
    slideData = [];
    const slides = Reveal.getSlides();
    let currentChapter = { id: 'preface', label: 'Preface', tag: '' };

    slides.forEach((section, idx) => {
      // Check if this slide starts a new chapter
      const ch = getChapterForSlide(section);
      if (ch) currentChapter = ch;

      // Get title
      const h = section.querySelector('h1, h2');
      let title = h ? h.textContent.trim() : '';
      if (!title) {
        const eyebrow = section.querySelector('.eyebrow');
        if (eyebrow) title = eyebrow.textContent.trim();
      }
      if (!title) title = 'Slide ' + (idx + 1);
      // Truncate long titles
      if (title.length > 60) title = title.substring(0, 57) + '…';

      slideData.push({
        idx,
        title,
        chapter: currentChapter.id,
        chapterLabel: currentChapter.label,
        isChapterDivider: section.classList.contains('chapter-divider'),
      });
    });
  }

  /* ── Render ───────────────────────────────────────────────── */
  function renderMenu(filter) {
    list.innerHTML = '';
    const currentIdx = Reveal.getIndices().h;
    const query = (filter || '').toLowerCase().trim();

    // Group by chapter
    const groups = new Map();
    slideData.forEach(s => {
      if (!groups.has(s.chapter)) groups.set(s.chapter, { label: s.chapterLabel, slides: [] });
      groups.get(s.chapter).slides.push(s);
    });

    let anyResults = false;

    groups.forEach((group, chapterId) => {
      const filtered = query
        ? group.slides.filter(s => s.title.toLowerCase().includes(query))
        : group.slides;

      if (!filtered.length) return;
      anyResults = true;

      const chDiv = document.createElement('div');
      chDiv.className = 'sm-chapter';
      // Collapse groups that don't contain the current slide (unless searching)
      const hasActive = filtered.some(s => s.idx === currentIdx);
      if (!hasActive && !query) chDiv.classList.add('collapsed');

      // Chapter header
      const head = document.createElement('div');
      head.className = 'sm-chapter-head';
      head.innerHTML = '<span class="sm-chapter-arrow">▼</span>'
        + '<span class="sm-chapter-label">' + escHtml(group.label) + '</span>'
        + '<span class="sm-chapter-count">' + filtered.length + '</span>';
      head.addEventListener('click', () => chDiv.classList.toggle('collapsed'));
      chDiv.appendChild(head);

      // Slides container
      const slidesDiv = document.createElement('div');
      slidesDiv.className = 'sm-chapter-slides';

      filtered.forEach(s => {
        const item = document.createElement('div');
        item.className = 'sm-slide' + (s.idx === currentIdx ? ' active' : '');
        const titleHtml = query ? highlightMatch(s.title, query) : escHtml(s.title);
        item.innerHTML = '<span class="sm-slide-num">' + (s.idx + 1) + '</span>'
          + '<span class="sm-slide-title">' + titleHtml + '</span>';
        item.addEventListener('click', () => {
          Reveal.slide(s.idx);
          closeMenu();
        });
        slidesDiv.appendChild(item);
      });

      chDiv.appendChild(slidesDiv);
      list.appendChild(chDiv);
    });

    if (!anyResults) {
      list.innerHTML = '<div class="sm-no-results">No slides matching "' + escHtml(query) + '"</div>';
    }
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx < 0) return escHtml(text);
    return escHtml(text.substring(0, idx))
      + '<mark>' + escHtml(text.substring(idx, idx + query.length)) + '</mark>'
      + escHtml(text.substring(idx + query.length));
  }

  /* ── Open / Close ─────────────────────────────────────────── */
  function openMenu() {
    collectSlides();
    renderMenu('');
    search.value = '';
    menuOpen = true;
    overlay.classList.add('open');
    menu.classList.add('open');
    setTimeout(() => search.focus(), 300);
  }

  function closeMenu() {
    menuOpen = false;
    overlay.classList.remove('open');
    menu.classList.remove('open');
  }

  function toggleMenu() { menuOpen ? closeMenu() : openMenu(); }

  /* ── Events ───────────────────────────────────────────────── */
  toggle.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);
  closeBtn.addEventListener('click', closeMenu);

  search.addEventListener('input', () => renderMenu(search.value));
  search.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') { closeMenu(); e.stopPropagation(); }
    if (e.code === 'Enter') {
      // Jump to first visible slide
      const first = list.querySelector('.sm-slide');
      if (first) first.click();
    }
  });

  // Global shortcut: / to open the slide menu
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Slash' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      toggleMenu();
    }
    if (e.code === 'Escape' && menuOpen) {
      closeMenu();
    }
  });

  // Re-render on slide change to update active
  document.addEventListener('DOMContentLoaded', () => {
    const interval = setInterval(() => {
      if (typeof Reveal !== 'undefined' && Reveal.isReady && Reveal.isReady()) {
        clearInterval(interval);
        Reveal.on('slidechanged', () => {
          if (menuOpen) renderMenu(search.value);
        });
      }
    }, 200);
  });
})();
