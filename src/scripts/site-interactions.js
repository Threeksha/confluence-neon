/* Navigation, FAQ, theme-card controls, terminal commands, and network pointer interactions. */

const menuToggle = document.querySelector('.menu-toggle');
    const mainNavigation = document.querySelector('#main-navigation');

    if (menuToggle && mainNavigation) {
      const closeMenu = () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation menu');
        mainNavigation.classList.remove('is-open');
        document.body.classList.remove('menu-open');
      };

      menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
        mainNavigation.classList.toggle('is-open', !isOpen);
        document.body.classList.toggle('menu-open', !isOpen);
      });

      mainNavigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
      window.addEventListener('resize', () => {
        if (window.innerWidth > 680) closeMenu();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
      });
    }

    // FAQ items expand and collapse with a measured height transition.
    document.querySelectorAll('.faq-list details').forEach((item) => {
      const summary = item.querySelector('summary');
      const answer = item.querySelector('p');
      const indicator = summary?.querySelector('span');
      if (!summary || !answer) return;

      answer.style.overflow = 'hidden';
      answer.style.maxHeight = item.open ? `${answer.scrollHeight}px` : '0px';
      answer.style.opacity = item.open ? '1' : '0';
      answer.style.padding = item.open ? '0 20px 15px 0' : '0 20px 0 0';
      answer.style.transition = 'max-height 320ms ease, opacity 220ms ease, padding 320ms ease';

      summary.addEventListener('click', (event) => {
        event.preventDefault();
        const shouldOpen = !item.open;
        if (shouldOpen) {
          item.open = true;
          answer.style.maxHeight = '0px';
          answer.style.opacity = '0';
          answer.style.padding = '0 20px 0 0';
          requestAnimationFrame(() => {
            answer.style.maxHeight = `${answer.scrollHeight}px`;
            answer.style.opacity = '1';
            answer.style.padding = '0 20px 15px 0';
          });
        } else {
          answer.style.maxHeight = `${answer.scrollHeight}px`;
          answer.style.opacity = '1';
          requestAnimationFrame(() => {
            answer.style.maxHeight = '0px';
            answer.style.opacity = '0';
            answer.style.padding = '0 20px 0 0';
          });
          window.setTimeout(() => { item.open = false; }, 330);
        }
        if (indicator) indicator.textContent = shouldOpen ? '−' : '＋';
        summary.setAttribute('aria-expanded', String(shouldOpen));
      });
    });

    // Subtle interactive spotlight follows the pointer over theme cards.
    const reduceMotionForEffects = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotionForEffects) {
      document.querySelectorAll('.theme-card').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
          const bounds = card.getBoundingClientRect();
          card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
          card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
        });
        card.addEventListener('pointerleave', () => {
          card.style.removeProperty('--pointer-x');
          card.style.removeProperty('--pointer-y');
        });
      });
    }

    // Event details: reveal cards in a staggered sequence when the section enters view.
    const eventDetails = document.querySelector('.event-details');
    const eventMotionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (eventDetails && !eventMotionReduced && 'IntersectionObserver' in window) {
      eventDetails.classList.add('event-details-motion');
      const eventObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          // Replay the reveal whenever the section scrolls into view.
          eventDetails.classList.toggle('event-details-visible', entry.isIntersecting);
        });
      }, { threshold: 0.16, rootMargin: '0px 0px -5% 0px' });
      eventObserver.observe(eventDetails);
    }

    // Reveal major sections as they enter the viewport.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      document.querySelectorAll('main > .section, .stats, .final-cta').forEach((section) => {
        section.classList.add('reveal-on-scroll');
        revealObserver.observe(section);
      });
    }

    // Live countdown to the event start (India Standard Time).
    const countdownTarget = new Date('2026-10-25T08:00:00+05:30').getTime();
    const countdownParts = {
      days: document.querySelector('#countdown-days'),
      hours: document.querySelector('#countdown-hours'),
      minutes: document.querySelector('#countdown-minutes'),
      seconds: document.querySelector('#countdown-seconds'),
    };
    const updateCountdown = () => {
      const remaining = countdownTarget - Date.now();
      if (remaining <= 0) {
        Object.values(countdownParts).forEach((node) => { if (node) node.textContent = '00'; });
        const caption = document.querySelector('.countdown-kicker');
        if (caption) caption.textContent = 'CONFLUENCE IS LIVE';
        return;
      }
      const values = { days: Math.floor(remaining / 86400000), hours: Math.floor((remaining % 86400000) / 3600000), minutes: Math.floor((remaining % 3600000) / 60000), seconds: Math.floor((remaining % 60000) / 1000) };
      Object.entries(values).forEach(([key, value]) => { if (countdownParts[key]) countdownParts[key].textContent = key === 'days' ? String(value).padStart(3, '0') : String(value).padStart(2, '0'); });
    };
    updateCountdown();
    window.setInterval(updateCountdown, 1000);

    // Theme card details: keep the button state, icon, label, and content in sync.
    document.querySelectorAll('.theme-expand').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const card = button.closest('.theme-card');
        const extra = card?.querySelector('.theme-extra');
        const title = card?.querySelector('.card-title-row h3')?.textContent?.trim() || 'this theme';
        if (!card || !extra) return;

        const shouldExpand = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(shouldExpand));
        button.textContent = shouldExpand ? '−' : '＋';
        button.setAttribute('aria-label', `${shouldExpand ? 'Hide' : 'Show'} more about ${title}`);
        extra.hidden = !shouldExpand;
        card.classList.toggle('theme-card-expanded', shouldExpand);
      });
    });

    // Secret terminal with useful event commands.
    const terminal = document.querySelector('#confluence-terminal');
    const terminalLaunch = document.querySelector('.terminal-launch');
    const terminalClose = document.querySelector('.terminal-close');
    const terminalInput = document.querySelector('#terminal-input');
    const terminalOutput = document.querySelector('.terminal-output');
    const terminalForm = document.querySelector('.terminal-form');
    const runTerminalCommand = (rawCommand) => {
      if (!terminalOutput) return;
      const command = rawCommand.trim().toLowerCase();
      const answers = {
        help: 'AVAILABLE COMMANDS\nhelp       — show commands\nevent      — event overview\nprizes     — prize pool\nvenue      — location and time\nnetwork    — discover the interactive particle field\nclubadmins — private club-admin welcome instructions\nclear      — clear terminal',
        event: 'CONFLUENCE BUILDATHON 2026\nA 10-hour buildathon by IEEE CS PESU.\nSunday, 25 October 2026 · 8:00 AM–6:30 PM IST.',
        prizes: 'TOTAL PRIZE POOL: ₹30,000\nRegistration fee: ₹1,000 for selected teams.',
        venue: '13th Floor, B.E. Block, PES University\n100 Feet Ring Road, Banashankari, Bengaluru, Karnataka – 560085.\nEvent time: 8:00 AM–6:30 PM IST.',
        network: 'HIDDEN INTERACTION UNLOCKED\nMove your cursor across the glowing dots: the nearby particles push away and the web shifts with your movement.\nClick an empty area of the hero to burst the connected network into glowing particles. Try a few clicks and watch the links reconnect.\nTip: clicks on buttons and links keep their normal actions.',
        clubadmins: '╔════ CONFLUENCE // CLUB ADMIN ACCESS ════╗\n\nCLUB ADMINS: ENTER THE FIRST 4 LETTERS OF YOUR NAME.\n\nThis terminal keeps club-admin names private.',
        admins: '╔════ CONFLUENCE // CLUB ADMIN ACCESS ════╗\n\nCLUB ADMINS: ENTER THE FIRST 4 LETTERS OF YOUR NAME.\n\nThis terminal keeps club-admin names private.',
        whoami: 'A curious builder. That is a good place to start.',
      };
      const adminTriggers = { sama: 'sama', rosh: 'rosh', sanm: 'sanm' };
      if (adminTriggers[command]) {
        const line = document.createElement('p'); line.className = 'terminal-command-line'; line.textContent = `visitor@confluence:~$ ${rawCommand}`;
        const result = document.createElement('pre'); result.className = 'terminal-result';
        result.textContent = 'CLUB ADMIN SEQUENCE ACCEPTED\nPreparing your private Matrix-rain welcome…';
        terminalOutput.append(line, result);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        window.dispatchEvent(new CustomEvent('confluence-admin-easter-egg', { detail: { trigger: adminTriggers[command] } }));
        return;
      }
      if (command === 'clear') { terminalOutput.replaceChildren(); return; }
      const line = document.createElement('p'); line.className = 'terminal-command-line'; line.textContent = `visitor@confluence:~$ ${rawCommand}`;
      const result = document.createElement('pre'); result.className = 'terminal-result'; result.textContent = answers[command] || `Command not found: ${command || '(empty)'}. Type help to see available commands.`;
      terminalOutput.append(line, result);
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };
    const openTerminal = () => { terminal?.classList.add('terminal-open'); terminal?.setAttribute('aria-hidden', 'false'); document.body.classList.add('terminal-active'); window.setTimeout(() => terminalInput?.focus(), 60); };
    const closeTerminal = () => { terminal?.classList.remove('terminal-open'); terminal?.setAttribute('aria-hidden', 'true'); document.body.classList.remove('terminal-active'); terminalLaunch?.focus(); };
    terminalLaunch?.addEventListener('click', openTerminal);
    terminalClose?.addEventListener('click', closeTerminal);
    terminal?.addEventListener('click', (event) => { if (event.target === terminal) closeTerminal(); });
    terminalForm?.addEventListener('submit', (event) => { event.preventDefault(); if (terminalInput?.value) runTerminalCommand(terminalInput.value); if (terminalInput) terminalInput.value = ''; });
    terminal?.querySelectorAll('[data-command]').forEach((button) => button.addEventListener('click', () => runTerminalCommand(button.dataset.command || 'help')));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && terminal?.classList.contains('terminal-open')) closeTerminal(); });

    // Independent glowing-dot network. The original Confluence vortex canvas and
    // its animation code below remain unchanged; this is a separate background layer.
    const networkCanvas = document.querySelector('.confluence-network');
    const heroSection = document.querySelector('.hero');
    const networkContext = networkCanvas?.getContext('2d', { alpha: true });
    const networkReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (networkCanvas && networkContext && heroSection && !networkReduced) {
      let networkWidth = 0;
      let networkHeight = 0;
      let networkFrame = 0;
      let networkRunning = false;
      let networkInView = false;
      let previousNetworkTime = 0;
      let networkNodes = [];
      let burstParticles = [];
      const pointer = { x: -1000, y: -1000, active: false };
      const connectionDistance = 136;
      const pointerRadius = 190;
      const maxBurstParticles = 150;
      const random = (min, max) => min + Math.random() * (max - min);
      let protectedArea = null;

      // Reserve a quiet, padded zone around the hero copy. The particle web is
      // distributed around that zone instead of running through the headline,
      // description, or buttons. This layer is separate from the original vortex.
      const refreshProtectedArea = () => {
        const copy = heroSection.querySelector('.hero-copy');
        if (!copy) { protectedArea = null; return; }
        const heroBounds = heroSection.getBoundingClientRect();
        const copyBounds = copy.getBoundingClientRect();
        const narrow = networkWidth <= 680;
        const padX = narrow ? 18 : networkWidth <= 1000 ? 30 : 52;
        const padY = narrow ? 26 : 42;
        protectedArea = {
          left: Math.max(0, copyBounds.left - heroBounds.left - padX),
          right: Math.min(networkWidth, copyBounds.right - heroBounds.left + padX),
          top: Math.max(0, copyBounds.top - heroBounds.top - padY),
          bottom: Math.min(networkHeight, copyBounds.bottom - heroBounds.top + padY),
        };
      };

      const isInsideProtectedArea = (x, y) => Boolean(protectedArea &&
        x > protectedArea.left && x < protectedArea.right &&
        y > protectedArea.top && y < protectedArea.bottom);

      // Liang-Barsky segment/rectangle test: links are omitted if they would
      // cross the copy's quiet zone, keeping the text legible even at angles.
      const lineCrossesProtectedArea = (x1, y1, x2, y2) => {
        if (!protectedArea) return false;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const p = [-dx, dx, -dy, dy];
        const q = [
          x1 - protectedArea.left,
          protectedArea.right - x1,
          y1 - protectedArea.top,
          protectedArea.bottom - y1,
        ];
        let t0 = 0;
        let t1 = 1;
        for (let i = 0; i < 4; i++) {
          if (Math.abs(p[i]) < 1e-9) {
            if (q[i] < 0) return false;
          } else {
            const t = q[i] / p[i];
            if (p[i] < 0) t0 = Math.max(t0, t);
            else t1 = Math.min(t1, t);
            if (t0 > t1) return false;
          }
        }
        return true;
      };

      const safeRegions = () => {
        if (!protectedArea) return [{ left: 0, top: 0, right: networkWidth, bottom: networkHeight }];
        return [
          { left: 0, top: 0, right: protectedArea.left, bottom: networkHeight },
          { left: protectedArea.right, top: 0, right: networkWidth, bottom: networkHeight },
          { left: protectedArea.left, top: 0, right: protectedArea.right, bottom: protectedArea.top },
          { left: protectedArea.left, top: protectedArea.bottom, right: protectedArea.right, bottom: networkHeight },
        ].filter((region) => region.right - region.left > 12 && region.bottom - region.top > 12);
      };

      const randomSafePosition = () => {
        const regions = safeRegions();
        const weightedRegions = regions.map((region) => ({
          ...region,
          area: (region.right - region.left) * (region.bottom - region.top),
        }));
        const totalArea = weightedRegions.reduce((sum, region) => sum + region.area, 0);
        if (!totalArea) return { x: random(8, Math.max(9, networkWidth - 8)), y: random(8, Math.max(9, networkHeight - 8)) };
        let pick = Math.random() * totalArea;
        let region = weightedRegions[weightedRegions.length - 1];
        for (const candidate of weightedRegions) {
          pick -= candidate.area;
          if (pick <= 0) { region = candidate; break; }
        }
        const inset = 7;
        return {
          x: random(region.left + inset, Math.max(region.left + inset + 1, region.right - inset)),
          y: random(region.top + inset, Math.max(region.top + inset + 1, region.bottom - inset)),
        };
      };

      // Pick a position with breathing room from existing dots, reducing random clumps.
      const spacedSafePosition = (existingNodes, minSpacing) => {
        let best = randomSafePosition();
        let bestNearest = -1;
        const attempts = 110;
        for (let attempt = 0; attempt < attempts; attempt++) {
          const candidate = randomSafePosition();
          let nearest = Infinity;
          for (const node of existingNodes) {
            nearest = Math.min(nearest, Math.hypot(candidate.x - node.x, candidate.y - node.y));
            if (nearest < minSpacing) break;
          }
          if (nearest >= minSpacing) return candidate;
          if (nearest > bestNearest) {
            best = candidate;
            bestNearest = nearest;
          }
        }
        return best;
      };

      const keepNodeOutsideProtectedArea = (node) => {
        if (!isInsideProtectedArea(node.x, node.y)) return;
        const distances = [
          ...(protectedArea.left > 7 ? [{ edge: 'left', distance: node.x - protectedArea.left }] : []),
          ...(networkWidth - protectedArea.right > 7 ? [{ edge: 'right', distance: protectedArea.right - node.x }] : []),
          ...(protectedArea.top > 7 ? [{ edge: 'top', distance: node.y - protectedArea.top }] : []),
          ...(networkHeight - protectedArea.bottom > 7 ? [{ edge: 'bottom', distance: protectedArea.bottom - node.y }] : []),
        ].sort((a, b) => a.distance - b.distance);
        if (!distances.length) return;
        const edge = distances[0].edge;
        if (edge === 'left') { node.x = protectedArea.left - 2; node.vx = -Math.max(0.2, Math.abs(node.vx)); }
        else if (edge === 'right') { node.x = protectedArea.right + 2; node.vx = Math.max(0.2, Math.abs(node.vx)); }
        else if (edge === 'top') { node.y = protectedArea.top - 2; node.vy = -Math.max(0.2, Math.abs(node.vy)); }
        else { node.y = protectedArea.bottom + 2; node.vy = Math.max(0.2, Math.abs(node.vy)); }
      };

      const resizeNetwork = () => {
        const bounds = heroSection.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
        networkWidth = Math.max(1, bounds.width);
        networkHeight = Math.max(1, bounds.height);
        networkCanvas.width = Math.round(networkWidth * ratio);
        networkCanvas.height = Math.round(networkHeight * ratio);
        networkCanvas.style.width = `${networkWidth}px`;
        networkCanvas.style.height = `${networkHeight}px`;
        networkContext.setTransform(ratio, 0, 0, ratio, 0, 0);
        refreshProtectedArea();

        // Use a lighter particle count with more room between dots. The quiet
        // zone around the hero copy remains untouched.
        const count = networkWidth <= 680
          ? Math.min(36, Math.max(20, Math.floor(networkWidth / 12)))
          : networkWidth <= 1000
            ? Math.min(58, Math.max(34, Math.floor(networkWidth / 17)))
            : Math.min(92, Math.max(44, Math.floor(networkWidth / 16.5)));
        const minSpacing = networkWidth <= 680 ? 31 : networkWidth <= 1000 ? 43 : 54;
        networkNodes = [];
        for (let i = 0; i < count; i++) {
          const position = spacedSafePosition(networkNodes, minSpacing);
          networkNodes.push({
            x: position.x,
            y: position.y,
            vx: random(-0.25, 0.25),
            vy: random(-0.25, 0.25),
            r: random(1.45, 2.8),
            hue: Math.random() < 0.52 ? 269 : 190,
            phase: random(0, Math.PI * 2),
          });
        }
        networkContext.clearRect(0, 0, networkWidth, networkHeight);
      };

      const makeBurst = (x, y) => {
        const count = 28;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i / count) + random(-0.12, 0.12);
          const speed = random(1.6, 4.2);
          burstParticles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: random(38, 68),
            maxLife: 68,
            r: random(1.5, 3.2),
            hue: Math.random() < 0.5 ? 190 : 269,
          });
        }
        if (burstParticles.length > maxBurstParticles) {
          burstParticles.splice(0, burstParticles.length - maxBurstParticles);
        }

        // A click also gives nearby network nodes a visible outward impulse.
        for (const node of networkNodes) {
          const dx = node.x - x;
          const dy = node.y - y;
          const distance = Math.hypot(dx, dy);
          if (distance > 1 && distance < 185) {
            const force = (1 - distance / 185) * 2.1;
            node.vx += (dx / distance) * force;
            node.vy += (dy / distance) * force;
          }
        }
        // Keep node speeds stable after a burst so the network settles smoothly.
        networkNodes.forEach((node) => {
          const speed = Math.hypot(node.vx, node.vy);
          if (speed > 1.25) {
            node.vx = node.vx / speed * 1.25;
            node.vy = node.vy / speed * 1.25;
          }
        });
      };

      const drawNetwork = (now) => {
        if (!networkRunning || document.hidden || !networkInView) {
          networkRunning = false;
          return;
        }
        const dt = previousNetworkTime ? Math.min(2, (now - previousNetworkTime) / 16.67) : 1;
        previousNetworkTime = now;
        networkContext.clearRect(0, 0, networkWidth, networkHeight);
        networkContext.lineCap = 'round';

        // Move nodes independently, bounce softly at the edges, and repel them
        // from the cursor so the web visibly reacts rather than barely shifting.
        for (let i = 0; i < networkNodes.length; i++) {
          const node = networkNodes[i];
          node.phase += 0.025 * dt;
          node.vx += Math.sin(node.phase) * 0.0025 * dt;
          node.vy += Math.cos(node.phase * 0.8) * 0.0025 * dt;

          if (pointer.active) {
            const dx = node.x - pointer.x;
            const dy = node.y - pointer.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 1 && distance < pointerRadius) {
              const force = (1 - distance / pointerRadius) * 0.19 * dt;
              node.vx += (dx / distance) * force;
              node.vy += (dy / distance) * force;
            }
          }

          node.vx *= Math.pow(0.995, dt);
          node.vy *= Math.pow(0.995, dt);
          const speed = Math.hypot(node.vx, node.vy);
          if (speed > 1.12) {
            node.vx = node.vx / speed * 1.12;
            node.vy = node.vy / speed * 1.12;
          }
          node.x += node.vx * dt;
          node.y += node.vy * dt;
          if (node.x < 5) { node.x = 5; node.vx = Math.abs(node.vx); }
          if (node.x > networkWidth - 5) { node.x = networkWidth - 5; node.vx = -Math.abs(node.vx); }
          if (node.y < 5) { node.y = 5; node.vy = Math.abs(node.vy); }
          if (node.y > networkHeight - 5) { node.y = networkHeight - 5; node.vy = -Math.abs(node.vy); }
          keepNodeOutsideProtectedArea(node);
        }

        // Build candidate links, then draw the shortest ones first while
        // limiting each dot to two connections. This gives the network a loose,
        // airy structure instead of dense knots of intersecting lines.
        const possibleConnections = [];
        for (let i = 0; i < networkNodes.length; i++) {
          const node = networkNodes[i];
          for (let j = i + 1; j < networkNodes.length; j++) {
            const other = networkNodes[j];
            const distance = Math.hypot(node.x - other.x, node.y - other.y);
            if (distance < connectionDistance && !lineCrossesProtectedArea(node.x, node.y, other.x, other.y)) {
              possibleConnections.push({ i, j, distance });
            }
          }
        }
        possibleConnections.sort((a, b) => a.distance - b.distance);
        const linkCounts = new Uint8Array(networkNodes.length);
        const maxLinksPerNode = 2;
        for (const link of possibleConnections) {
          if (linkCounts[link.i] >= maxLinksPerNode || linkCounts[link.j] >= maxLinksPerNode) continue;
          linkCounts[link.i]++;
          linkCounts[link.j]++;
          const node = networkNodes[link.i];
          const other = networkNodes[link.j];
          const alpha = (1 - link.distance / connectionDistance) * 0.34;
          const hue = node.hue === 190 || other.hue === 190 ? '66,217,255' : '164,107,255';
          networkContext.strokeStyle = `rgba(${hue},${alpha})`;
          networkContext.lineWidth = link.distance < 72 ? 0.82 : 0.62;
          networkContext.beginPath();
          networkContext.moveTo(node.x, node.y);
          networkContext.lineTo(other.x, other.y);
          networkContext.stroke();
        }

        // Click bursts radiate outward, fade naturally, and temporarily link
        // to nearby network dots. The burst pool is capped to avoid unbounded growth.
        for (const burst of burstParticles) {
          burst.x += burst.vx * dt;
          burst.y += burst.vy * dt;
          burst.vx *= Math.pow(0.982, dt);
          burst.vy *= Math.pow(0.982, dt);
          burst.life -= dt;
          // Burst particles disappear at the edge of the text-safe zone.
          if (isInsideProtectedArea(burst.x, burst.y)) burst.life = 0;
        }
        burstParticles = burstParticles.filter((burst) => burst.life > 0);

        for (const burst of burstParticles) {
          const fade = Math.max(0, burst.life / burst.maxLife);
          for (const node of networkNodes) {
            const dx = node.x - burst.x;
            const dy = node.y - burst.y;
            const distance = Math.hypot(dx, dy);
            if (distance < 112 && !lineCrossesProtectedArea(burst.x, burst.y, node.x, node.y)) {
              const alpha = (1 - distance / 112) * fade * 0.48;
              const rgb = burst.hue === 190 ? '66,217,255' : '164,107,255';
              networkContext.strokeStyle = `rgba(${rgb},${alpha})`;
              networkContext.lineWidth = 0.85;
              networkContext.beginPath();
              networkContext.moveTo(burst.x, burst.y);
              networkContext.lineTo(node.x, node.y);
              networkContext.stroke();
            }
          }
        }

        // Glowing dots are drawn last so their centers stay crisp and luminous.
        networkContext.save();
        networkContext.globalCompositeOperation = 'screen';
        for (const node of networkNodes) {
          const pulse = 0.82 + Math.sin(node.phase * 1.7) * 0.18;
          const rgb = node.hue === 190 ? '66,217,255' : '164,107,255';
          networkContext.shadowBlur = 13;
          networkContext.shadowColor = `rgba(${rgb},0.95)`;
          networkContext.fillStyle = `rgba(${rgb},${0.83 * pulse})`;
          networkContext.beginPath();
          networkContext.arc(node.x, node.y, node.r * pulse, 0, Math.PI * 2);
          networkContext.fill();
        }
        for (const burst of burstParticles) {
          const fade = Math.max(0, burst.life / burst.maxLife);
          const rgb = burst.hue === 190 ? '66,217,255' : '164,107,255';
          networkContext.shadowBlur = 15;
          networkContext.shadowColor = `rgba(${rgb},${fade})`;
          networkContext.fillStyle = `rgba(${rgb},${fade})`;
          networkContext.beginPath();
          networkContext.arc(burst.x, burst.y, burst.r * (0.7 + fade * 0.45), 0, Math.PI * 2);
          networkContext.fill();
        }
        networkContext.restore();
        networkFrame = window.requestAnimationFrame(drawNetwork);
      };

      const startNetwork = () => {
        if (networkRunning || document.hidden || !networkInView) return;
        networkRunning = true;
        previousNetworkTime = 0;
        networkFrame = window.requestAnimationFrame(drawNetwork);
      };
      const stopNetwork = () => {
        networkRunning = false;
        if (networkFrame) window.cancelAnimationFrame(networkFrame);
        networkFrame = 0;
      };

      resizeNetwork();
      if ('IntersectionObserver' in window) {
        const networkObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.target !== heroSection) return;
            networkInView = entry.isIntersecting;
            if (networkInView) startNetwork(); else stopNetwork();
          });
        }, { threshold: 0.02 });
        networkObserver.observe(heroSection);
      } else {
        networkInView = true;
        startNetwork();
      }

      window.addEventListener('resize', () => {
        resizeNetwork();
        if (networkInView) startNetwork();
      }, { passive: true });
      heroSection.addEventListener('pointermove', (event) => {
        const bounds = heroSection.getBoundingClientRect();
        const nextX = event.clientX - bounds.left;
        const nextY = event.clientY - bounds.top;

        // Give nearby dots an immediate nudge in response to cursor movement,
        // then let the animation settle them naturally into the network again.
        if (pointer.active) {
          const moveX = nextX - pointer.x;
          const moveY = nextY - pointer.y;
          const moveLength = Math.hypot(moveX, moveY);
          if (moveLength > 1) {
            const moveDirX = moveX / moveLength;
            const moveDirY = moveY / moveLength;
            for (const node of networkNodes) {
              const dx = node.x - nextX;
              const dy = node.y - nextY;
              const distance = Math.hypot(dx, dy);
              if (distance > 1 && distance < pointerRadius) {
                const falloff = 1 - distance / pointerRadius;
                const nudge = falloff * 0.42;
                node.vx += (dx / distance) * nudge + moveDirX * nudge * 0.32;
                node.vy += (dy / distance) * nudge + moveDirY * nudge * 0.32;
              }
            }
          }
        }

        pointer.x = nextX;
        pointer.y = nextY;
        pointer.active = true;
      }, { passive: true });
      heroSection.addEventListener('pointerleave', () => { pointer.active = false; });
      heroSection.addEventListener('click', (event) => {
        if (event.target.closest('a, button, input, textarea, select, summary, [data-no-burst], .hero-copy, .hero-bottom, .side-words')) return;
        const bounds = heroSection.getBoundingClientRect();
        makeBurst(event.clientX - bounds.left, event.clientY - bounds.top);
        startNetwork();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopNetwork(); else startNetwork();
      });
    }

    // Horizontal Journey: reveal each phase as visitors move to the right.
    const journeySection = document.querySelector('.timeline-section');
    const journeyTrack = journeySection?.querySelector('.timeline');
    const journeyCards = journeyTrack ? Array.from(journeyTrack.querySelectorAll('.milestone')) : [];
    const journeyPrev = journeySection?.querySelector('.journey-arrow-prev');
    const journeyNext = journeySection?.querySelector('.journey-arrow-next');
    const journeyProgress = journeySection?.querySelector('.journey-progress-fill');
    const journeyCurrentStep = journeySection?.querySelector('.journey-current-step');
    const journeyReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (journeySection && journeyTrack && journeyCards.length) {
      let currentJourneyIndex = 0;
      const updateJourney = (index, shouldScroll = false) => {
        currentJourneyIndex = Math.max(0, Math.min(journeyCards.length - 1, index));
        journeyCards.forEach((card, cardIndex) => {
          card.classList.toggle('journey-card-revealed', cardIndex <= currentJourneyIndex);
          card.classList.toggle('journey-phase-active', cardIndex === currentJourneyIndex);
          card.setAttribute('aria-current', cardIndex === currentJourneyIndex ? 'step' : 'false');
        });
        if (journeyCurrentStep) journeyCurrentStep.textContent = String(currentJourneyIndex + 1).padStart(2, '0');
        if (journeyProgress) journeyProgress.style.width = `${((currentJourneyIndex + 1) / journeyCards.length) * 100}%`;
        if (journeyPrev) journeyPrev.disabled = currentJourneyIndex === 0;
        if (journeyNext) journeyNext.disabled = currentJourneyIndex === journeyCards.length - 1;
        if (shouldScroll) {
          // Calculate from rendered positions so the final card can scroll fully into view.
          const card = journeyCards[currentJourneyIndex];
          const trackRect = journeyTrack.getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();
          const currentOffset = cardRect.left - trackRect.left;
          const maxScroll = journeyTrack.scrollWidth - journeyTrack.clientWidth;
          const targetLeft = Math.max(0, Math.min(maxScroll, journeyTrack.scrollLeft + currentOffset - 12));
          journeyTrack.scrollTo({ left: targetLeft, behavior: journeyReducedMotion ? 'auto' : 'smooth' });
        }
      };
      const getNearestJourneyIndex = () => {
        // The final card cannot always reach the track's center because the
        // horizontal scroller has a hard maximum scroll position. Treat that
        // end position as Phase 04 instead of incorrectly switching back to 03.
        const maxScroll = Math.max(0, journeyTrack.scrollWidth - journeyTrack.clientWidth);
        if (maxScroll - journeyTrack.scrollLeft <= 28) return journeyCards.length - 1;
        const trackRect = journeyTrack.getBoundingClientRect();
        const trackCenter = trackRect.left + trackRect.width / 2;
        let nearestIndex = 0;
        let nearestDistance = Infinity;
        journeyCards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const distance = Math.abs((rect.left + rect.width / 2) - trackCenter);
          if (distance < nearestDistance) { nearestDistance = distance; nearestIndex = index; }
        });
        return nearestIndex;
      };
      journeyPrev?.addEventListener('click', () => updateJourney(currentJourneyIndex - 1, true));
      journeyNext?.addEventListener('click', () => updateJourney(currentJourneyIndex + 1, true));
      let journeyScrollTick = false;
      journeyTrack.addEventListener('scroll', () => {
        if (journeyScrollTick) return;
        journeyScrollTick = true;
        window.requestAnimationFrame(() => {
          updateJourney(getNearestJourneyIndex(), false);
          journeyScrollTick = false;
        });
      }, { passive: true });
      if ('IntersectionObserver' in window) {
        const journeyObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.target === journeySection && entry.isIntersecting) {
              journeySection.classList.add('journey-story-visible');
              updateJourney(getNearestJourneyIndex(), false);
            } else if (entry.target === journeySection) {
              journeySection.classList.remove('journey-story-visible');
            }
          });
        }, { threshold: 0.15 });
        journeyObserver.observe(journeySection);
      } else {
        journeySection.classList.add('journey-story-visible');
      }
      updateJourney(0, false);
    }



// Theme art reveal: animate cards only when the theme gallery enters the viewport.
(() => {
  const cards = document.querySelectorAll('.theme-card');
  if (!cards.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    cards.forEach((card) => card.classList.add('theme-art-in'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const card = entry.target;
        card.classList.remove('theme-art-in');
        void card.offsetWidth;
        card.classList.add('theme-art-in');
      } else {
        entry.target.classList.remove('theme-art-in');
      }
    });
  }, { threshold: 0.22 });
  cards.forEach((card) => observer.observe(card));
  cards.forEach((card) => {
    const art = card.querySelector('.card-art');
    if (!art) return;
    art.addEventListener('pointermove', (event) => {
      const rect = art.getBoundingClientRect();
      art.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
      art.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    }, { passive: true });
  });
})();



// Scroll reveal and subtle pointer lighting for TAKE THE NEXT STEP only.
(() => {
  const section = document.querySelector('#participate');
  if (!section || section.dataset.nextStepPolish === 'ready') return;
  section.dataset.nextStepPolish = 'ready';
  const cards = [...section.querySelectorAll('.next-step-card')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) {
    cards.forEach(card => card.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          card.classList.remove('is-visible');
          void card.offsetWidth;
          card.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -5% 0px' });
    cards.forEach((card, i) => {
      card.style.animationDelay = `${i * 140}ms`;
      observer.observe(card);
    });
  }
  section.addEventListener('pointermove', event => {
    const rect = section.getBoundingClientRect();
    section.style.setProperty('--ns-pointer-x', `${event.clientX - rect.left}px`);
    section.style.setProperty('--ns-pointer-y', `${event.clientY - rect.top}px`);
    const card = event.target.closest('.next-step-card');
    if (!card) return;
    const cr = card.getBoundingClientRect();
    card.style.setProperty('--card-glow-x', `${event.clientX - cr.left}px`);
    card.style.setProperty('--card-glow-y', `${event.clientY - cr.top}px`);
  }, { passive: true });
})();
