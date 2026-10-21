/* Configured admin keyboard sequences, canvas effects, and sound control. */

(() => {
  const overlay = document.querySelector('#admin-easter-egg');
  if (!overlay || overlay.dataset.adminEggReady === 'true') return;
  overlay.dataset.adminEggReady = 'true';

  const canvas = overlay.querySelector('.admin-egg-canvas');
  const title = overlay.querySelector('.admin-egg-name');
  const message = overlay.querySelector('.admin-egg-message');
  const kicker = overlay.querySelector('.admin-egg-kicker');
  const muteButton = overlay.querySelector('.admin-egg-mute');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx || !title || !message || !kicker || !muteButton) return;

  // Add future admins here. The trigger is the first four letters of their name.
  const ADMIN_EASTER_EGGS = {
    samarth: { trigger: 'sama', name: 'Samarth', effect: 'matrix', title: 'WELCOME BACK ❤️ SAMARTH', kicker: 'CLUB ADMIN RECOGNIZED', message: 'Glad you’re back. The system remembers you.' },
    roshan: { trigger: 'rosh', name: 'Roshan', effect: 'matrix', title: 'WELCOME BACK ❤️ ROSHAN', kicker: 'CLUB ADMIN RECOGNIZED', message: 'Glad you’re back. The system remembers you.' },
    sanmithra: { trigger: 'sanm', name: 'Sanmithra', effect: 'matrix', title: 'WELCOME BACK ❤️ SANMITHRA', kicker: 'CLUB ADMIN RECOGNIZED', message: 'Glad you’re back. The system remembers you.' }
  };
  const adminsByTrigger = Object.values(ADMIN_EASTER_EGGS).reduce((map, admin) => {
    map[admin.trigger.toLowerCase()] = admin;
    return map;
  }, {});
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  let keyBuffer = '';
  let running = false;
  let muted = false;
  let rafId = 0;
  let finishTimer = 0;
  let hideTimer = 0;
  let typeTimer = 0;
  let lastTriggeredAt = 0;
  let startedAt = 0;
  let previousFocus = null;
  let audioContext = null;
  let activeGain = null;
  let activeOscillators = [];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let matrixDrops = [];
  let sparks = [];
  let lastFireworkAt = 0;

  const clearScheduledWork = () => {
    window.clearTimeout(finishTimer);
    window.clearTimeout(hideTimer);
    window.clearTimeout(typeTimer);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const stopSound = () => {
    activeOscillators.forEach((oscillator) => {
      try { oscillator.stop(); } catch (_) {}
    });
    activeOscillators = [];
    activeGain = null;
  };

  const playSound = (effect) => {
    if (muted || !AudioContextClass) return;
    try {
      if (!audioContext) audioContext = new AudioContextClass();
      if (audioContext.state === 'suspended') audioContext.resume();
      stopSound();
      const now = audioContext.currentTime;
      const master = audioContext.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.14, now + 0.035);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);
      master.connect(audioContext.destination);
      activeGain = master;
      const notes = effect === 'matrix' ? [220, 330, 495] : effect === 'fireworks' ? [392, 587, 784] : [180, 270, 540];
      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const layer = audioContext.createGain();
        oscillator.type = effect === 'doors' ? 'sawtooth' : 'sine';
        oscillator.frequency.setValueAtTime(frequency * 0.7, now + index * 0.045);
        oscillator.frequency.exponentialRampToValueAtTime(frequency, now + 0.22 + index * 0.045);
        layer.gain.setValueAtTime(0.0001, now);
        layer.gain.setValueAtTime(0.38 / (index + 1), now + 0.035 + index * 0.045);
        layer.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
        oscillator.connect(layer);
        layer.connect(master);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        activeOscillators.push(oscillator);
      });
    } catch (_) { /* Sound is optional; the visual easter egg still works. */ }
  };

  const resizeCanvas = () => {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    matrixDrops = Array.from({ length: Math.ceil(width / 17) }, () => Math.random() * -height / 16);
  };

  const drawMatrix = (elapsed) => {
    ctx.fillStyle = 'rgba(2, 8, 13, 0.20)';
    ctx.fillRect(0, 0, width, height);
    ctx.font = '14px monospace';
    const glyphs = '01アイウエオカキクケコサシスセソタチツテト';
    matrixDrops.forEach((drop, column) => {
      const x = column * 17;
      const y = drop * 16;
      const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      ctx.fillStyle = Math.random() > 0.93 ? '#e1ffe8' : (column % 4 === 0 ? '#b6ffcf' : '#22f58a');
      ctx.shadowColor = '#19ff92';
      ctx.shadowBlur = 10;
      ctx.fillText(glyph, x, y);
      ctx.shadowBlur = 0;
      matrixDrops[column] += 0.4 + Math.random() * 0.85;
      if (y > height && Math.random() > 0.975) matrixDrops[column] = Math.random() * -18;
    });
    if (elapsed < 700) {
      ctx.fillStyle = 'rgba(29, 255, 145, 0.035)';
      ctx.fillRect(0, Math.random() * height, width, 2);
    }
  };

  const spawnFirework = () => {
    const originX = width * (0.12 + Math.random() * 0.76);
    const originY = height * (0.12 + Math.random() * 0.52);
    const hue = [185, 265, 315, 42, 330][Math.floor(Math.random() * 5)];
    const count = 25 + Math.floor(Math.random() * 19);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.PI * 2 * i / count;
      const speed = 1.2 + Math.random() * 4.2;
      sparks.push({ x: originX, y: originY, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, decay: 0.008 + Math.random() * 0.014, hue, size: 1 + Math.random() * 2.1 });
    }
  };

  const drawFireworks = (now) => {
    ctx.fillStyle = 'rgba(3, 4, 17, 0.18)';
    ctx.fillRect(0, 0, width, height);
    if (now - lastFireworkAt > 360) { spawnFirework(); lastFireworkAt = now; }
    sparks = sparks.filter((spark) => spark.life > 0.03);
    sparks.forEach((spark) => {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += 0.028;
      spark.vx *= 0.992;
      spark.vy *= 0.992;
      spark.life -= spark.decay;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, spark.size * Math.max(0.45, spark.life), 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${spark.hue}, 100%, ${65 + spark.life * 20}%, ${Math.max(0, spark.life)})`;
      ctx.shadowColor = `hsl(${spark.hue}, 100%, 65%)`;
      ctx.shadowBlur = 12;
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  };

  const drawGlitch = (elapsed) => {
    ctx.clearRect(0, 0, width, height);
    if (elapsed < 1350 && Math.random() > 0.23) {
      const y = Math.random() * height;
      const bandHeight = 2 + Math.random() * 28;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(60, 232, 255, 0.25)' : 'rgba(255, 55, 185, 0.22)';
      ctx.fillRect((Math.random() - 0.5) * 70, y, width * (0.35 + Math.random() * 0.75), bandHeight);
      if (Math.random() > 0.6) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(0, y + bandHeight, width, 1);
      }
    }
  };

  const animate = (now) => {
    if (!running) return;
    if (!document.hidden && !reducedMotion.matches) {
      const elapsed = now - startedAt;
      if (activeEffect === 'matrix') drawMatrix(elapsed);
      else if (activeEffect === 'fireworks') drawFireworks(now);
      else drawGlitch(elapsed);
    }
    rafId = requestAnimationFrame(animate);
  };

  let activeEffect = '';
  let activeAdmin = null;
  const finishEffect = (immediate = false) => {
    if (!running) return;
    running = false;
    clearScheduledWork();
    overlay.classList.remove('is-active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('admin-egg-active');
    if (immediate) overlay.style.transitionDuration = '0ms';
    hideTimer = window.setTimeout(() => {
      overlay.style.removeProperty('transition-duration');
      overlay.classList.remove('effect-matrix', 'effect-fireworks', 'effect-doors', 'is-reduced-motion');
      overlay.querySelectorAll('.admin-egg-door').forEach((door) => door.style.removeProperty('animation'));
      title.textContent = '';
      activeAdmin = null;
      title.classList.remove('admin-egg-title-matrix');
      message.textContent = '';
      kicker.textContent = 'CONFLUENCE // PRIVATE PROTOCOL';
      ctx.clearRect(0, 0, width, height);
      sparks = [];
      keyBuffer = '';
      if (previousFocus && typeof previousFocus.focus === 'function' && document.contains(previousFocus)) {
        try { previousFocus.focus({ preventScroll: true }); } catch (_) { previousFocus.focus(); }
      }
      previousFocus = null;
    }, immediate ? 0 : 520);
  };

  const showEffect = (admin) => {
    if (running || Date.now() - lastTriggeredAt < 6500) return;
    lastTriggeredAt = Date.now();
    running = true;
    activeEffect = admin.effect;
    activeAdmin = admin;
    startedAt = performance.now();
    previousFocus = document.activeElement;
    clearScheduledWork();
    stopSound();
    sparks = [];
    lastFireworkAt = 0;
    overlay.classList.remove('effect-matrix', 'effect-fireworks', 'effect-doors', 'is-reduced-motion');
    overlay.classList.add(`effect-${admin.effect}`);
    if (reducedMotion.matches) overlay.classList.add('is-reduced-motion');
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('admin-egg-active');
    kicker.textContent = admin.kicker;
    message.textContent = admin.message;
    title.textContent = reducedMotion.matches ? admin.title : '';
    resizeCanvas();
    ctx.clearRect(0, 0, width, height);
    if (admin.effect === 'matrix') {
      title.classList.add('admin-egg-title-matrix');
      if (!reducedMotion.matches) {
        let index = 0;
        const typeNext = () => {
          if (!running || activeEffect !== 'matrix') return;
          index += 1;
          title.textContent = admin.title.slice(0, index);
          if (index < admin.title.length) typeTimer = window.setTimeout(typeNext, 44);
        };
        typeTimer = window.setTimeout(typeNext, 650);
      }
    } else {
      title.classList.remove('admin-egg-title-matrix');
    }
    muteButton.textContent = muted ? '♫ SOUND OFF' : '♫ SOUND ON';
    muteButton.setAttribute('aria-pressed', String(muted));
    muteButton.setAttribute('aria-label', muted ? 'Unmute easter egg sound' : 'Mute easter egg sound');
    try { muteButton.focus({ preventScroll: true }); } catch (_) {}
    playSound(admin.effect);
    if (!reducedMotion.matches) rafId = requestAnimationFrame(animate);
    finishTimer = window.setTimeout(() => finishEffect(false), 4650);
  };

  // The Secret Terminal can launch the same configured admin effects by command.
  window.addEventListener('confluence-admin-easter-egg', (event) => {
    const trigger = String(event.detail?.trigger || '').toLowerCase();
    const admin = adminsByTrigger[trigger];
    if (admin) showEffect(admin);
  });

  muteButton.addEventListener('click', () => {
    muted = !muted;
    muteButton.textContent = muted ? '♫ SOUND OFF' : '♫ SOUND ON';
    muteButton.setAttribute('aria-pressed', String(muted));
    muteButton.setAttribute('aria-label', muted ? 'Unmute easter egg sound' : 'Mute easter egg sound');
    if (muted) stopSound();
    else if (running) playSound(activeEffect);
  });

  document.addEventListener('keydown', (event) => {
    if (running) {
      if (event.key === 'Escape') finishEffect(true);
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    const target = event.target;
    if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""], [role="textbox"]')) return;
    if (!/^[a-z]$/i.test(event.key)) return;
    keyBuffer = (keyBuffer + event.key.toLowerCase()).slice(-4);
    const admin = adminsByTrigger[keyBuffer];
    if (admin) {
      keyBuffer = '';
      showEffect(admin);
    }
  });

  window.addEventListener('resize', () => { if (running) resizeCanvas(); }, { passive: true });
  reducedMotion.addEventListener?.('change', () => {
    if (!running) return;
    if (reducedMotion.matches) {
      overlay.classList.add('is-reduced-motion');
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      title.textContent = activeAdmin?.title || title.textContent;
    } else {
      overlay.classList.remove('is-reduced-motion');
      startedAt = performance.now();
      rafId = requestAnimationFrame(animate);
    }
  });
})();
