/* Hero vortex canvas animation. */

// Vortex particle trails: inward pull + sideways flow + gradual canvas fade.
// The animation pauses when the hero is off-screen or the tab is hidden.
(() => {
  const canvas = document.querySelector('.hero-vortex-canvas');
  const hero = canvas?.closest('.hero');
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!canvas || !hero || !ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particleCount = 150;
  const particles = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let centerX = 0;
  let centerY = 0;
  let maxRadius = 0;
  let frameId = 0;
  let running = false;
  let inView = false;
  let previousTime = 0;
  const pointer = { x: -1000, y: -1000, active: false };

  const random = (min, max) => min + Math.random() * (max - min);

  function spawnParticle(particle, initial = false) {
    particle.angle = random(0, Math.PI * 2);
    particle.radius = initial ? random(maxRadius * .22, maxRadius) : maxRadius * random(.86, 1.04);
    particle.speed = random(.48, 1.28);
    particle.spin = Math.random() < .86 ? 1 : -1;
    particle.hue = Math.random() < .68 ? random(258, 282) : random(185, 198);
    particle.width = random(.55, 1.45);
    particle.alpha = random(.28, .8);
    particle.prevX = centerX + Math.cos(particle.angle) * particle.radius;
    particle.prevY = centerY + Math.sin(particle.angle) * particle.radius;
    particle.initialized = initial;
  }

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    centerX = width * .5;
    centerY = height * .45;
    maxRadius = Math.min(width * .49, height * .57);
    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
      const particle = {};
      spawnParticle(particle, true);
      particles.push(particle);
    }
    // Make the first frame clean after a resize rather than retaining stretched trails.
    ctx.clearRect(0, 0, width, height);
  }

  function draw(now) {
    if (!running || document.hidden || !inView) {
      running = false;
      return;
    }
    const dt = previousTime ? Math.min(1.8, (now - previousTime) / 16.67) : 1;
    previousTime = now;

    // Fade the previous frame a little to leave smooth, persistent trails.
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.047)';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';

    for (const particle of particles) {
      const normalizedRadius = particle.radius / Math.max(1, maxRadius);
      const angularSpeed = (.006 + (1 - normalizedRadius) * .014) * particle.spin;
      particle.angle += angularSpeed * dt;
      particle.radius -= particle.speed * dt;

      let x = centerX + Math.cos(particle.angle) * particle.radius;
      let y = centerY + Math.sin(particle.angle) * particle.radius * .72;

      // Cursor gently bends nearby particle paths without taking control of the vortex.
      if (pointer.active) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 150 && distance > 1) {
          particle.angle += ((dx * (y - centerY) - dy * (x - centerX)) / (distance * maxRadius)) * .035 * (1 - distance / 150) * dt;
          x = centerX + Math.cos(particle.angle) * particle.radius;
          y = centerY + Math.sin(particle.angle) * particle.radius * .72;
        }
      }

      if (particle.initialized) {
        ctx.beginPath();
        ctx.moveTo(particle.prevX, particle.prevY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `hsla(${particle.hue}, 100%, ${particle.hue < 220 ? 72 : 76}%, ${particle.alpha})`;
        ctx.lineWidth = particle.width;
        ctx.shadowBlur = 7;
        ctx.shadowColor = particle.hue < 220 ? '#42d9ff' : '#a46bff';
        ctx.stroke();
      }

      particle.prevX = x;
      particle.prevY = y;
      particle.initialized = true;
      if (particle.radius < 10 || x < -12 || x > width + 12 || y < -12 || y > height + 12) {
        spawnParticle(particle, false);
      }
    }
    ctx.shadowBlur = 0;
    frameId = window.requestAnimationFrame(draw);
  }

  function start() {
    if (running || document.hidden || !inView || reducedMotion) return;
    running = true;
    previousTime = 0;
    frameId = window.requestAnimationFrame(draw);
  }

  function stop() {
    running = false;
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
  }

  resizeCanvas();
  if (reducedMotion) {
    // Reduced-motion users still get a quiet, static spiral graphic.
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    for (let arm = 0; arm < 4; arm++) {
      ctx.beginPath();
      for (let t = 0; t <= 1; t += .01) {
        const angle = t * Math.PI * 3 + arm * Math.PI / 2;
        const radius = maxRadius * (.12 + t * .82);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius * .72;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = arm % 2 ? 'rgba(66,217,255,.14)' : 'rgba(164,107,255,.16)';
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        inView = entry.isIntersecting;
        if (inView) start(); else stop();
      });
    }, { threshold: .02 });
    observer.observe(hero);
  } else {
    inView = true;
    start();
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    if (inView) start();
  }, { passive: true });
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });
})();
