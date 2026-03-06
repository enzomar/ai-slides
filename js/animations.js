/* ═══════════════════════════════════════════════════════════
   AI SLIDES — Animated Diagrams Engine
   Self-building WOW-effect diagrams triggered by Reveal.js
   ═══════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────
   1. TOKEN PREDICTION
   ────────────────────────────────────────────────────────── */
function animTokenPrediction(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const words = ['The', 'cat', 'sat', 'on', 'the'];
  const predictions = [
    { word: 'mat',   pct: 40, color: 'var(--accent)' },
    { word: 'floor', pct: 28, color: 'rgba(27,94,255,.4)' },
    { word: 'chair', pct: 15, color: 'rgba(27,94,255,.25)' },
    { word: 'sofa',  pct: 9,  color: 'rgba(27,94,255,.15)' },
    { word: 'rug',   pct: 8,  color: 'rgba(27,94,255,.10)' },
  ];

  // Build DOM
  el.innerHTML = '';
  el.className = 'anim-token-prediction';

  // Sentence row
  const sentRow = document.createElement('div');
  sentRow.className = 'anim-sentence';
  words.forEach(w => {
    const chip = document.createElement('span');
    chip.className = 'anim-word';
    chip.textContent = w;
    sentRow.appendChild(chip);
  });
  // Cursor placeholder
  const cursorChip = document.createElement('span');
  cursorChip.className = 'anim-word';
  cursorChip.textContent = '▌';
  sentRow.appendChild(cursorChip);
  // Predicted word (hidden initially)
  const predChip = document.createElement('span');
  predChip.className = 'anim-word';
  predChip.textContent = predictions[0].word;
  predChip.style.display = 'none';
  sentRow.appendChild(predChip);
  el.appendChild(sentRow);

  // Connector
  const conn = document.createElement('div');
  conn.className = 'anim-connector';
  el.appendChild(conn);

  // Probability chart
  const chart = document.createElement('div');
  chart.className = 'anim-prob-chart';
  predictions.forEach(p => {
    const bar = document.createElement('div');
    bar.className = 'anim-prob-bar';
    const fill = document.createElement('div');
    fill.className = 'anim-prob-bar-fill';
    fill.style.background = p.color;
    const pctLabel = document.createElement('span');
    pctLabel.className = 'bar-pct';
    pctLabel.textContent = p.pct + '%';
    pctLabel.style.color = p.pct > 50 ? 'var(--accent)' : 'var(--ink-mute)';
    fill.appendChild(pctLabel);
    const label = document.createElement('div');
    label.className = 'anim-prob-bar-label';
    label.textContent = p.word;
    bar.appendChild(fill);
    bar.appendChild(label);
    chart.appendChild(bar);
  });
  el.appendChild(chart);

  // Animation state
  let step = -1;
  const wordEls = sentRow.querySelectorAll('.anim-word');
  const barFills = chart.querySelectorAll('.anim-prob-bar-fill');

  el._totalSteps = words.length + 3; // words + cursor + bars + prediction
  el._reset = () => {
    step = -1;
    wordEls.forEach(w => { w.classList.remove('visible','context','cursor','predicted'); w.style.display = ''; });
    predChip.style.display = 'none';
    cursorChip.style.display = '';
    conn.classList.remove('visible');
    chart.classList.remove('visible');
    barFills.forEach(f => { f.style.height = '0'; f.classList.remove('grow','winner'); });
  };

  el._advance = () => {
    step++;
    if (step < words.length) {
      // Reveal words one by one
      wordEls[step].classList.add('visible');
      if (step === words.length - 1) {
        // Highlight context word
        wordEls[step].classList.add('context');
      }
    } else if (step === words.length) {
      // Show cursor
      cursorChip.classList.add('visible', 'cursor');
    } else if (step === words.length + 1) {
      // Show probability bars
      conn.classList.add('visible');
      chart.classList.add('visible');
      setTimeout(() => {
        barFills.forEach((f, i) => {
          f.style.height = Math.max(predictions[i].pct * 1.3, 8) + 'px';
          f.classList.add('grow');
          if (i === 0) f.classList.add('winner');
        });
      }, 200);
    } else if (step === words.length + 2) {
      // Prediction lands
      cursorChip.style.display = 'none';
      predChip.style.display = '';
      predChip.classList.add('visible', 'predicted');
    }
  };
}

/* ──────────────────────────────────────────────────────────
   2. ATTENTION HEATMAP
   ────────────────────────────────────────────────────────── */
function animAttentionHeatmap(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
  // Attention weights (simplified — each row = how much that token attends to others)
  const weights = [
    [.8, .05,.02,.02,.08,.03],
    [.1, .6, .05,.05,.05,.15],
    [.05,.3, .4, .1, .05,.1 ],
    [.02,.05,.15,.5, .08,.2 ],
    [.3, .02,.02,.05,.5, .11],
    [.05,.15,.1, .2, .1, .4 ],
  ];

  el.innerHTML = '';
  el.className = 'anim-attention';

  // Description
  const desc = document.createElement('div');
  desc.className = 'anim-attn-desc';
  desc.textContent = 'Self-Attention: each word looks at every other word to understand context';
  el.appendChild(desc);

  // Grid with headers
  const gridWrap = document.createElement('div');
  gridWrap.style.display = 'flex'; gridWrap.style.gap = '0';

  // Row headers column
  const rowHeaders = document.createElement('div');
  rowHeaders.style.display = 'flex'; rowHeaders.style.flexDirection = 'column';
  rowHeaders.style.gap = '3px'; rowHeaders.style.paddingTop = '35px';
  tokens.forEach(t => {
    const h = document.createElement('div');
    h.className = 'anim-attn-header row-header';
    h.textContent = t;
    h.style.height = '56px'; h.style.display = 'flex';
    h.style.alignItems = 'center'; h.style.justifyContent = 'flex-end';
    rowHeaders.appendChild(h);
  });
  gridWrap.appendChild(rowHeaders);

  // Grid body (column headers + cells)
  const gridBody = document.createElement('div');

  // Column headers
  const colRow = document.createElement('div');
  colRow.style.display = 'grid';
  colRow.style.gridTemplateColumns = `repeat(${tokens.length}, 56px)`;
  colRow.style.gap = '3px'; colRow.style.marginBottom = '3px';
  tokens.forEach(t => {
    const h = document.createElement('div');
    h.className = 'anim-attn-header';
    h.textContent = t;
    colRow.appendChild(h);
  });
  gridBody.appendChild(colRow);

  // Heat cells
  const grid = document.createElement('div');
  grid.className = 'anim-attn-grid';
  grid.style.gridTemplateColumns = `repeat(${tokens.length}, 56px)`;
  grid.style.position = 'relative';

  const cells = [];
  weights.forEach((row, ri) => {
    row.forEach((w, ci) => {
      const cell = document.createElement('div');
      cell.className = 'anim-attn-cell';
      cell.textContent = Math.round(w * 100);
      cell.dataset.row = ri;
      cell.dataset.col = ci;
      cell.dataset.weight = w;
      grid.appendChild(cell);
      cells.push(cell);
    });
  });

  // Scan line
  const scanline = document.createElement('div');
  scanline.className = 'anim-attn-scanline';
  grid.appendChild(scanline);

  gridBody.appendChild(grid);
  gridWrap.appendChild(gridBody);
  el.appendChild(gridWrap);

  // Animation state
  let currentRow = -1;
  el._totalSteps = tokens.length + 1; // one per row + final

  el._reset = () => {
    currentRow = -1;
    cells.forEach(c => c.classList.remove('lit','lit-high','lit-med','lit-low'));
    scanline.classList.remove('active');
    desc.classList.remove('visible');
  };

  el._advance = () => {
    currentRow++;
    if (currentRow === 0) {
      desc.classList.add('visible');
    }
    if (currentRow < tokens.length) {
      // Light up one row
      scanline.classList.add('active');
      scanline.style.top = (currentRow * 59 + 0) + 'px';

      cells.forEach(c => {
        if (parseInt(c.dataset.row) === currentRow) {
          const w = parseFloat(c.dataset.weight);
          c.classList.add('lit');
          if (w >= 0.4)      c.classList.add('lit-high');
          else if (w >= 0.15) c.classList.add('lit-med');
          else                c.classList.add('lit-low');
        }
      });
    } else {
      // Final step: hide scanline, all cells revealed
      scanline.classList.remove('active');
    }
  };
}

/* ──────────────────────────────────────────────────────────
   3. RAG FLOW
   ────────────────────────────────────────────────────────── */
function animRagFlow(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const stages = [
    { cls: 'docs',    icon: '📄', label: 'Documents', sub: 'PDFs, APIs, DBs' },
    { cls: 'chunk',   icon: '✂️',  label: 'Chunking',  sub: 'Split into pieces' },
    { cls: 'embed',   icon: '🔢', label: 'Embedding', sub: 'Text → Vectors' },
    { cls: 'vectordb',icon: '🗄️',  label: 'Vector DB', sub: 'Store & Index' },
  ];
  const queryStages = [
    { cls: 'query',   icon: '❓', label: 'User Query', sub: 'Natural language' },
    { cls: 'retrieve',icon: '🔍', label: 'Retrieve',   sub: 'Top-K similar' },
    { cls: 'llm',     icon: '🧠', label: 'LLM + Context', sub: 'Generate answer' },
    { cls: 'answer',  icon: '✅', label: 'Answer',     sub: 'Grounded response' },
  ];

  el.innerHTML = '';
  el.className = 'anim-rag-flow';

  // Row 1: Ingestion pipeline
  const row1Label = document.createElement('div');
  row1Label.style.cssText = 'font-family:var(--mono);font-size:.6rem;text-transform:uppercase;letter-spacing:.14em;color:var(--ink-mute);margin-bottom:6px;';
  row1Label.textContent = '① INGESTION PIPELINE';
  row1Label.style.opacity = '0';
  row1Label.style.transition = 'opacity .5s';
  el.appendChild(row1Label);

  const row1 = document.createElement('div');
  row1.className = 'anim-rag-row';
  const row1Elements = [];
  stages.forEach((s, i) => {
    const node = document.createElement('div');
    node.className = 'anim-rag-node';
    node.innerHTML = `<div class="anim-rag-box ${s.cls}">
      <div class="anim-rag-icon">${s.icon}</div>
      <div style="font-weight:600;">${s.label}</div>
      <div class="anim-rag-label">${s.sub}</div>
    </div>`;
    row1.appendChild(node);
    row1Elements.push(node);

    if (i < stages.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'anim-rag-arrow';
      row1.appendChild(arrow);
      row1Elements.push(arrow);
    }
  });
  el.appendChild(row1);

  // Vertical connector
  const vArrow = document.createElement('div');
  vArrow.className = 'anim-rag-arrow down';
  el.appendChild(vArrow);

  // Row 2 label
  const row2Label = document.createElement('div');
  row2Label.style.cssText = 'font-family:var(--mono);font-size:.6rem;text-transform:uppercase;letter-spacing:.14em;color:var(--ink-mute);margin-bottom:6px;';
  row2Label.textContent = '② QUERY PIPELINE';
  row2Label.style.opacity = '0';
  row2Label.style.transition = 'opacity .5s';
  el.appendChild(row2Label);

  // Row 2: Query pipeline
  const row2 = document.createElement('div');
  row2.className = 'anim-rag-row';
  const row2Elements = [];
  queryStages.forEach((s, i) => {
    const node = document.createElement('div');
    node.className = 'anim-rag-node';
    node.innerHTML = `<div class="anim-rag-box ${s.cls}">
      <div class="anim-rag-icon">${s.icon}</div>
      <div style="font-weight:600;">${s.label}</div>
      <div class="anim-rag-label">${s.sub}</div>
    </div>`;
    row2.appendChild(node);
    row2Elements.push(node);

    if (i < queryStages.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'anim-rag-arrow';
      row2.appendChild(arrow);
      row2Elements.push(arrow);
    }
  });
  el.appendChild(row2);

  // All elements to animate in sequence
  const allElements = [];
  // Step 0: row1 label
  allElements.push([row1Label]);
  // Steps 1-7: row1 nodes and arrows
  row1Elements.forEach(e => allElements.push([e]));
  // Step 8: vertical arrow
  allElements.push([vArrow]);
  // Step 9: row2 label
  allElements.push([row2Label]);
  // Steps 10-16: row2 nodes and arrows
  row2Elements.forEach(e => allElements.push([e]));

  let step = -1;
  el._totalSteps = allElements.length;

  el._reset = () => {
    step = -1;
    [...row1Elements, ...row2Elements, vArrow].forEach(e => {
      e.classList.remove('visible');
    });
    row1Label.style.opacity = '0';
    row2Label.style.opacity = '0';
  };

  el._advance = () => {
    step++;
    if (step < allElements.length) {
      allElements[step].forEach(e => {
        if (e.style && e.textContent.includes('PIPELINE')) {
          e.style.opacity = '1';
        } else {
          e.classList.add('visible');
        }
      });
    }
  };
}

/* ──────────────────────────────────────────────────────────
   4. AGENT LOOP
   ────────────────────────────────────────────────────────── */
function animAgentLoop(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = '';
  el.className = 'anim-agent-loop';
  el.style.position = 'relative';

  // Background dots
  const bgDots = document.createElement('div');
  bgDots.className = 'anim-bg-dots';
  for (let i = 0; i < 15; i++) {
    const dot = document.createElement('div');
    dot.className = 'anim-bg-dot';
    dot.style.left = Math.random() * 100 + '%';
    dot.style.top = Math.random() * 100 + '%';
    dot.style.animationDelay = (Math.random() * 4) + 's';
    bgDots.appendChild(dot);
  }
  el.appendChild(bgDots);

  // Central brain
  const brain = document.createElement('div');
  brain.className = 'anim-agent-brain';
  brain.innerHTML = '<div class="brain-icon">🧠</div><div>LLM</div><div class="brain-label">Agent Core</div>';
  el.appendChild(brain);

  // Orbit ring
  const ring = document.createElement('div');
  ring.className = 'anim-orbit-ring';
  ring.style.left = 'calc(50% - 160px)';
  ring.style.top = 'calc(50% - 160px)';
  el.appendChild(ring);

  // Orbit dot
  const orbitDot = document.createElement('div');
  orbitDot.className = 'anim-orbit-dot';
  el.appendChild(orbitDot);

  // Loop steps: Think, Act, Observe — positioned around the circle
  const loopSteps = [
    { cls: 'think',  icon: '💭', text: 'Think',   sub: 'Plan next action', angle: -90, dist: 190 },
    { cls: 'act',    icon: '⚡', text: 'Act',     sub: 'Execute tool call', angle: 30, dist: 190 },
    { cls: 'observe',icon: '👁️', text: 'Observe', sub: 'Read result',      angle: 150, dist: 190 },
  ];

  const stepEls = [];
  loopSteps.forEach(s => {
    const step = document.createElement('div');
    step.className = 'anim-loop-step';
    const rad = s.angle * Math.PI / 180;
    const x = Math.cos(rad) * s.dist;
    const y = Math.sin(rad) * s.dist;
    step.style.left = `calc(50% + ${x}px - 60px)`;
    step.style.top = `calc(50% + ${y}px - 40px)`;
    step.innerHTML = `<div class="anim-loop-box ${s.cls}">
      <span class="anim-loop-icon">${s.icon}</span>
      ${s.text}
      <div style="font-size:.6rem;opacity:.7;margin-top:2px;">${s.sub}</div>
    </div>`;
    el.appendChild(step);
    stepEls.push(step);
  });

  // Arc arrows between steps (SVG)
  const arcs = [];
  const arcPositions = [
    { from: -90, to: 30 },   // Think → Act
    { from: 30, to: 150 },   // Act → Observe
    { from: 150, to: 270 },  // Observe → Think
  ];
  arcPositions.forEach(ap => {
    const arc = document.createElement('div');
    arc.className = 'anim-arc';
    arc.style.left = '0'; arc.style.top = '0';
    arc.style.width = '100%'; arc.style.height = '100%';
    arc.style.position = 'absolute'; arc.style.pointerEvents = 'none';

    const r = 160;
    const cx = 0, cy = 0; // center offset — will use viewBox
    const fromRad = ap.from * Math.PI / 180;
    const toRad = ap.to * Math.PI / 180;
    const x1 = Math.cos(fromRad) * r, y1 = Math.sin(fromRad) * r;
    const x2 = Math.cos(toRad) * r, y2 = Math.sin(toRad) * r;

    arc.innerHTML = `<svg width="100%" height="100%" viewBox="-220 -220 440 440" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);">
      <defs><marker id="ah${ap.from}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="var(--accent)" opacity=".6"/>
      </marker></defs>
      <path d="M${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2}"
            fill="none" stroke="var(--accent)" stroke-width="2"
            stroke-opacity=".4" marker-end="url(#ah${ap.from})"/>
    </svg>`;
    el.appendChild(arc);
    arcs.push(arc);
  });

  // Tool nodes branching from Act
  const tools = [
    { text: '🔍 Web Search', angle: -10, dist: 300 },
    { text: '💻 Code Exec',  angle: 30,  dist: 310 },
    { text: '🗄️ Database',    angle: 70,  dist: 300 },
  ];
  const toolEls = [];
  tools.forEach(t => {
    const node = document.createElement('div');
    node.className = 'anim-tool-node';
    const rad = t.angle * Math.PI / 180;
    const x = Math.cos(rad) * t.dist;
    const y = Math.sin(rad) * t.dist;
    node.style.left = `calc(50% + ${x}px - 50px)`;
    node.style.top = `calc(50% + ${y}px - 16px)`;
    node.innerHTML = `<div class="anim-tool-pill">${t.text}</div>`;
    el.appendChild(node);
    toolEls.push(node);
  });

  // Animation sequence
  let step = -1;
  el._totalSteps = 7; // brain, ring, think, act, observe, arcs, tools

  el._reset = () => {
    step = -1;
    brain.classList.remove('visible','breathe');
    ring.classList.remove('visible');
    orbitDot.classList.remove('visible');
    stepEls.forEach(s => s.classList.remove('visible'));
    arcs.forEach(a => a.classList.remove('visible'));
    toolEls.forEach(t => t.classList.remove('visible'));
  };

  el._advance = () => {
    step++;
    switch(step) {
      case 0: // Brain appears
        brain.classList.add('visible');
        setTimeout(() => brain.classList.add('breathe'), 800);
        break;
      case 1: // Orbit ring
        ring.classList.add('visible');
        orbitDot.classList.add('visible');
        break;
      case 2: // Think
        stepEls[0].classList.add('visible');
        break;
      case 3: // Act
        stepEls[1].classList.add('visible');
        break;
      case 4: // Observe
        stepEls[2].classList.add('visible');
        break;
      case 5: // Draw arcs
        arcs.forEach((a, i) => {
          setTimeout(() => a.classList.add('visible'), i * 300);
        });
        break;
      case 6: // Tools branch out
        toolEls.forEach((t, i) => {
          setTimeout(() => t.classList.add('visible'), i * 200);
        });
        break;
    }
  };
}

/* ──────────────────────────────────────────────────────────
   REVEAL.JS INTEGRATION
   Auto-advance animations when fragments are shown
   ────────────────────────────────────────────────────────── */
function initAnimatedDiagrams() {
  // Find all diagram containers
  const diagrams = document.querySelectorAll('[data-anim]');

  diagrams.forEach(container => {
    const type = container.dataset.anim;
    const id = container.id;

    // Initialize based on type
    switch(type) {
      case 'token-prediction':
        animTokenPrediction(id);
        break;
      case 'attention-heatmap':
        animAttentionHeatmap(id);
        break;
      case 'rag-flow':
        animRagFlow(id);
        break;
      case 'agent-loop':
        animAgentLoop(id);
        break;
    }
  });

  // Listen for Reveal fragment events to advance animations
  if (typeof Reveal !== 'undefined') {
    Reveal.on('fragmentshown', event => {
      const frag = event.fragment;
      const diagId = frag.dataset.animTarget;
      if (diagId) {
        const diag = document.getElementById(diagId);
        if (diag && diag._advance) diag._advance();
      }
    });

    Reveal.on('fragmenthidden', event => {
      // On going back, we reset to beginning
      // (A more sophisticated approach would track step-by-step reversal)
      const frag = event.fragment;
      const diagId = frag.dataset.animTarget;
      if (diagId) {
        const diag = document.getElementById(diagId);
        if (diag && diag._reset) {
          diag._reset();
          // Re-advance to the correct step based on how many fragments are visible
          const slide = frag.closest('section');
          if (slide) {
            const visibleFrags = slide.querySelectorAll(`.fragment.visible[data-anim-target="${diagId}"]`);
            for (let i = 0; i < visibleFrags.length; i++) {
              diag._advance();
            }
          }
        }
      }
    });

    // Reset animations when leaving a slide
    Reveal.on('slidechanged', event => {
      // Reset all diagrams on the previous slide
      if (event.previousSlide) {
        const prevDiags = event.previousSlide.querySelectorAll('[data-anim]');
        prevDiags.forEach(d => { if (d._reset) d._reset(); });
      }
    });
  }
}

// Auto-init if Reveal is already initialized
if (typeof Reveal !== 'undefined' && Reveal.isReady && Reveal.isReady()) {
  initAnimatedDiagrams();
}
