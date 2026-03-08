/* ═══════════════════════════════════════════════════════════
   NARRATION ENGINE v4
   TTS + notes teleprompter + word highlighting
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── State ────────────────────────────────────────────────── */
  var playing     = false;
  var paused      = false;
  var showPanel   = true;
  var rate        = 1.0;
  var utt         = null;
  var words       = [];
  var spans       = [];
  var hlIdx       = 0;
  var voice       = null;
  var voiceMenuOn = false;
  var keepAlive   = null;
  var simTimer    = null;
  var gotBoundary = false;

  var synth    = window.speechSynthesis;
  var RATES    = [0.6, 0.75, 0.85, 1.0, 1.15, 1.3, 1.5, 1.75];
  var rateIdx  = 3;
  var LANG_MAP = { en: 'en-GB', it: 'it-IT', fr: 'fr-FR', es: 'es-ES' };

  /* ── DOM ──────────────────────────────────────────────────── */
  var $player   = document.getElementById('narr-player');
  var $play     = document.getElementById('narr-play');
  var $pause    = document.getElementById('narr-pause');
  var $stop     = document.getElementById('narr-stop');
  var $slower   = document.getElementById('narr-slower');
  var $faster   = document.getElementById('narr-faster');
  var $ccBtn    = document.getElementById('narr-notes-btn');
  var $voiceBtn = document.getElementById('narr-voice-btn');
  var $panel    = document.getElementById('narr-text-panel');
  var $vmenu    = document.getElementById('narr-voice-menu');
  var $speed    = document.getElementById('narr-speed-lbl');
  var $progWrap = document.getElementById('narr-progress-wrap');
  var $progBar  = document.getElementById('narr-progress-bar');
  /* ═══════════════════════════════════════════════════════════
     VOICE SELECTION
     ═══════════════════════════════════════════════════════════ */
  var voicesForLang = [];
  var QUALITY = [
    'enhanced','premium','natural','neural','wavenet',
    'samantha','karen','daniel','moira','tessa',
    'google us','google uk',
    'microsoft aria','microsoft guy','microsoft jenny',
    'microsoft elsa','microsoft cosimo','microsoft isabella'
  ];

  function scoreV(v, bcp) {
    var n  = v.name.toLowerCase(), s = 0;
    if (v.localService) s += 1;
    QUALITY.forEach(function (h, i) { if (n.indexOf(h) >= 0) s += 10 + i; });
    if (n.indexOf('espeak') >= 0 || n.indexOf('compact') >= 0) s -= 50;
    /* Prefer voices that exactly match the target locale (e.g. en-GB > en-US) */
    if (bcp) {
      if (v.lang === bcp)                              s += 8;
      else if (v.lang.substring(0, 5) === bcp.substring(0, 5)) s += 3;
    }
    return s;
  }

  function getLang() {
    return typeof currentLang !== 'undefined' ? currentLang : 'en';
  }

  function refreshVoices() {
    var bcp    = LANG_MAP[getLang()] || 'en-GB';
    var prefix = bcp.substring(0, 2);
    voicesForLang = synth.getVoices()
      .filter(function (v) { return v.lang.substring(0, 2) === prefix; })
      .sort(function (a, b) { return scoreV(b, bcp) - scoreV(a, bcp); });
    if (!voice || voice.lang.substring(0, 2) !== prefix) {
      voice = voicesForLang[0] || null;
    }
    restoreVoice();
  }

  synth.onvoiceschanged = refreshVoices;
  refreshVoices();

  function restoreVoice() {
    try {
      var saved = localStorage.getItem('narr-voice-' + getLang());
      if (saved) {
        var m = voicesForLang.find(function (v) { return v.name === saved; });
        if (m) voice = m;
      }
    } catch (e) {}
  }

  function buildVoiceMenu() {
    refreshVoices();
    $vmenu.innerHTML = '';
    if (!voicesForLang.length) {
      $vmenu.innerHTML = '<div style="padding:10px 16px;color:rgba(255,255,255,.4)">No voices found</div>';
      return;
    }
    voicesForLang.forEach(function (v) {
      var opt   = document.createElement('div');
      opt.className = 'narr-voice-opt' + (voice === v ? ' selected' : '');
      var label = v.name.replace(/Microsoft |Google |Apple /gi, '');
      var tag   = /neural|natural|enhanced|premium/.test(v.name.toLowerCase())
        ? '<span class="voice-tag">HD</span>' : '';
      opt.innerHTML = label + tag;
      opt.addEventListener('click', function () {
        voice = v;
        try { localStorage.setItem('narr-voice-' + getLang(), v.name); } catch (e) {}
        toggleVoiceMenu(false);
        if (playing && !paused) speakSlide();
      });
      $vmenu.appendChild(opt);
    });
  }

  function toggleVoiceMenu(show) {
    voiceMenuOn = typeof show === 'boolean' ? show : !voiceMenuOn;
    if (voiceMenuOn) buildVoiceMenu();
    $vmenu.style.display = voiceMenuOn ? 'block' : 'none';
    $voiceBtn.classList.toggle('active', voiceMenuOn);
  }

  /* ═══════════════════════════════════════════════════════════
     TEXT PANEL + WORD HIGHLIGHTING
     ═══════════════════════════════════════════════════════════ */
  function getNotesText(slide) {
    if (!slide) return '';
    var a = slide.querySelector('aside.notes');
    return a ? a.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  function renderPanel(text) {
    words = text ? text.split(/\s+/).filter(Boolean) : [];
    spans = [];
    hlIdx = 0;
    $progBar.style.width = '0%';
    $panel.innerHTML = '';

    if (!showPanel || !words.length) {
      $panel.style.display = 'none';
      return;
    }

    words.forEach(function (w) {
      var sp = document.createElement('span');
      sp.className = 'nw';
      sp.textContent = w + ' ';
      spans.push(sp);
      $panel.appendChild(sp);
    });
    $panel.setAttribute('data-mode', 'notes');
    $panel.style.display = 'block';
  }

  /* charIndex from onboundary to word array index */
  function charToIdx(ci) {
    var pos = 0;
    for (var i = 0; i < words.length; i++) {
      if (pos + words[i].length > ci) return i;
      pos += words[i].length + 1;
    }
    return words.length - 1;
  }

  function highlightAt(idx) {
    if (!spans.length || idx < 0 || idx >= spans.length) return;
    for (var j = hlIdx; j < idx; j++) {
      if (spans[j]) spans[j].className = 'nw spoken';
    }
    spans[idx].className = 'nw current';
    spans[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    hlIdx = idx;
    if (words.length > 1)
      $progBar.style.width = Math.round((idx / (words.length - 1)) * 100) + '%';
  }

  /* ── Simulated highlight (fallback when no boundary events) ── */
  function startSim() {
    stopSim();
    if (!words.length || !spans.length) return;
    var ms  = Math.round(387 / rate);
    var idx = 0;
    /* 600 ms initial delay so highlight doesn't race audio */
    setTimeout(function () {
      if (!playing || gotBoundary) return;
      highlightAt(0);
      simTimer = setInterval(function () {
        if (!playing) { stopSim(); return; }
        if (paused) return; /* freeze, do not cancel */
        idx++;
        if (idx >= words.length) { stopSim(); return; }
        highlightAt(idx);
      }, ms);
    }, 600);
  }

  function stopSim() {
    if (simTimer) { clearInterval(simTimer); simTimer = null; }
  }

  /* ── Panel toggle button ─────────────────────────────────── */
  function togglePanel() {
    showPanel = !showPanel;
    $ccBtn.classList.toggle('active', showPanel);
    if (!showPanel) {
      $panel.style.display = 'none';
    } else if (playing || paused) {
      var slide = typeof Reveal !== 'undefined' ? Reveal.getCurrentSlide() : null;
      var text  = getNotesText(slide);
      if (text) {
        renderPanel(text);
        for (var j = 0; j < Math.min(hlIdx + 1, spans.length); j++) {
          spans[j].className = j < hlIdx ? 'nw spoken' : 'nw current';
        }
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════
     UI STATE — does NOT control panel visibility during playback
     ═══════════════════════════════════════════════════════════ */
  function setUI(state) {
    if (state === 'idle') {
      $play.innerHTML  = '&#9654; Play';
      $play.disabled   = false;
      $pause.disabled  = true;
      $stop.disabled   = true;
      $pause.innerHTML = '&#9208; ';
      $player.style.opacity = '.45';
      $progWrap.classList.remove('visible');
      $panel.style.display = 'none';
    } else if (state === 'playing') {
      $play.innerHTML  = '&#9654;';
      $play.disabled   = true;
      $pause.disabled  = false;
      $stop.disabled   = false;
      $pause.innerHTML = '&#9208; ';
      $player.style.opacity = '1';
      $progWrap.classList.add('visible');
      if (showPanel && spans.length) $panel.style.display = 'block';
    } else if (state === 'paused') {
      $play.disabled   = false;
      $pause.disabled  = true;
      $stop.disabled   = false;
      $player.style.opacity = '1';
    }
  }

  /* ═══════════════════════════════════════════════════════════
     CHROME KEEP-ALIVE (Chrome kills speech after ~15 s)
     ═══════════════════════════════════════════════════════════ */
  function startKeepAlive() {
    stopKeepAlive();
    keepAlive = setInterval(function () {
      if (synth.speaking && !synth.paused) { synth.pause(); synth.resume(); }
    }, 10000);
  }
  function stopKeepAlive() {
    if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
  }

  /* ═══════════════════════════════════════════════════════════
     SPEAK CURRENT SLIDE
     ═══════════════════════════════════════════════════════════ */
  function speakSlide() {
    if (typeof Reveal === 'undefined') return;

    synth.cancel();
    stopKeepAlive();
    stopSim();
    gotBoundary = false;

    var slide = Reveal.getCurrentSlide();
    var text  = getNotesText(slide);

    if (!text) {
      renderPanel('');
      $progBar.style.width = '100%';
      setTimeout(function () {
        if (playing) Reveal.next();
      }, 1200);
      return;
    }

    renderPanel(text);

    refreshVoices();
    utt = new SpeechSynthesisUtterance(text);
    if (voice) utt.voice = voice;
    utt.lang  = LANG_MAP[getLang()] || 'en-GB';
    utt.rate  = rate;
    utt.pitch = 1.0;

    utt.onboundary = function (e) {
      if (e.name !== 'word') return;
      gotBoundary = true;
      stopSim();
      highlightAt(charToIdx(e.charIndex));
    };

    utt.onend = function () {
      stopKeepAlive();
      stopSim();
      if (!playing) return;
      spans.forEach(function (sp) { sp.className = 'nw spoken'; });
      $progBar.style.width = '100%';
      setTimeout(function () {
        if (!playing) return;
        var routes = Reveal.availableRoutes ? Reveal.availableRoutes() : {};
        if (routes.right || routes.down) Reveal.next();
        else stopNarration();
      }, 1000);
    };

    utt.onerror = function (e) {
      stopKeepAlive();
      stopSim();
      if (e.error !== 'interrupted' && e.error !== 'canceled')
        console.warn('[narration] TTS error:', e.error);
    };

    synth.speak(utt);
    startKeepAlive();

    /* Start fallback sim after 1 s if no boundary events arrived */
    setTimeout(function () {
      if (!gotBoundary && playing && !paused && spans.length) startSim();
    }, 1000);
  }

  /* ═══════════════════════════════════════════════════════════
     PLAYBACK CONTROLS
     ═══════════════════════════════════════════════════════════ */
  function startNarration() {
    playing = true;
    paused  = false;
    if (!showPanel) { showPanel = true; $ccBtn.classList.add('active'); }
    setUI('playing');
    speakSlide();
  }

  function pauseNarration() {
    paused = true;
    synth.pause();
    stopKeepAlive();
    setUI('paused');
  }

  function resumeNarration() {
    paused = false;
    setUI('playing');
    synth.resume();
    /* Chrome silently fails resume after >5s — detect and restart */
    setTimeout(function () {
      if (playing && !paused && !synth.speaking) {
        speakSlide();
      } else {
        startKeepAlive();
      }
    }, 600);
  }

  function stopNarration() {
    playing = false;
    paused  = false;
    synth.cancel();
    stopKeepAlive();
    stopSim();
    utt = null;
    setUI('idle');
    $panel.innerHTML = '';
    spans = [];
    words = [];
    hlIdx = 0;
    $progBar.style.width = '0%';
  }

  /* ═══════════════════════════════════════════════════════════
     BUTTON EVENTS
     ═══════════════════════════════════════════════════════════ */
  $play.addEventListener('click', function () {
    if (!playing && !paused) startNarration();
    else if (paused) resumeNarration();
  });
  $pause.addEventListener('click', function () {
    if (playing && !paused) pauseNarration();
  });
  $stop.addEventListener('click', stopNarration);

  $slower.addEventListener('click', function () {
    rateIdx = Math.max(0, rateIdx - 1);
    rate = RATES[rateIdx];
    $speed.textContent = rate + 'x';
    if (playing && !paused) speakSlide();
  });
  $faster.addEventListener('click', function () {
    rateIdx = Math.min(RATES.length - 1, rateIdx + 1);
    rate = RATES[rateIdx];
    $speed.textContent = rate + 'x';
    if (playing && !paused) speakSlide();
  });

  $ccBtn.addEventListener('click', togglePanel);

  $voiceBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleVoiceMenu();
  });
  document.addEventListener('click', function (e) {
    if (voiceMenuOn && !$vmenu.contains(e.target) && e.target !== $voiceBtn)
      toggleVoiceMenu(false);
  });

  /* ═══════════════════════════════════════════════════════════
     KEYBOARD SHORTCUTS
     ═══════════════════════════════════════════════════════════ */
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.code) {
      case 'KeyN':
        if (!playing && !paused) startNarration();
        else if (playing && !paused) pauseNarration();
        else if (paused) resumeNarration();
        e.preventDefault(); break;
      case 'KeyT':
        togglePanel(); e.preventDefault(); break;
      case 'KeyM':
        $volIcon.click(); e.preventDefault(); break;
      case 'Escape':
        if (playing || paused) { stopNarration(); e.preventDefault(); }
        if (voiceMenuOn) toggleVoiceMenu(false);
        break;
      case 'Minus': case 'NumpadSubtract':
        if (playing) { $slower.click(); e.preventDefault(); } break;
      case 'Equal': case 'NumpadAdd':
        if (playing) { $faster.click(); e.preventDefault(); } break;
    }
  });

  /* ═══════════════════════════════════════════════════════════
     REVEAL.JS INTEGRATION
     ═══════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    var poll = setInterval(function () {
      if (typeof Reveal === 'undefined' || !Reveal.isReady || !Reveal.isReady()) return;
      clearInterval(poll);

      Reveal.on('slidechanged', function () {
        if (playing && !paused) speakSlide();
        else if (paused) {
          paused  = false;
          playing = true;
          setUI('playing');
          speakSlide();
        }
      });

      $player.style.display = 'flex';

      /* Wrap window.setLang so voice refreshes on language switch */
      var origSetLang = window.setLang;
      if (origSetLang) {
        window.setLang = function (lang) {
          origSetLang(lang);
          refreshVoices();
          if (playing && !paused) speakSlide();
        };
      }
    }, 200);
  });

  /* Hover opacity for player bar */
  $player.addEventListener('mouseenter', function () { $player.style.opacity = '1'; });
  $player.addEventListener('mouseleave', function () {
    if (!playing && !paused) $player.style.opacity = '.45';
  });

})();
