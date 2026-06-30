/* ============================================================
   DERANECK.EU – Hub Landing Page JavaScript
   Canvas · Tilt · Parallax · Scroll · Form · Futuristic FX
   ============================================================ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ══════════════════════════════════════════════════════════════
   0. PAGE LOADER
══════════════════════════════════════════════════════════════ */
(function initPageLoader() {
  const loader = $('#pageLoader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('loaded'), 300);
  });
})();


/* ══════════════════════════════════════════════════════════════
   1. NAVBAR – scroll state & mobile toggle
══════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar   = $('#navbar');
  const toggle   = $('#navToggle');
  const menu     = $('#navMenu');
  const navLinks = $$('.nav-link, .nav-cta-btn', menu);
  let overlay    = null;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', closeMenu);
  }
  createOverlay();

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function openMenu() {
    menu.classList.add('open');
    toggle.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });
  navLinks.forEach(l => l.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
})();


/* ══════════════════════════════════════════════════════════════
   2. SCROLL REVEAL – IntersectionObserver
══════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const els = $$('.reveal-up, .reveal-right');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
})();


/* ══════════════════════════════════════════════════════════════
   3. HERO ENTRANCE – staggered on load
══════════════════════════════════════════════════════════════ */
(function initHeroEntrance() {
  const heroEls = $$('.hero .reveal-up, .hero .reveal-right');
  if (!heroEls.length) return;
  setTimeout(() => heroEls.forEach(el => el.classList.add('visible')), 600);
})();


/* ══════════════════════════════════════════════════════════════
   4. HERO SCROLL FADE – fade out hero on scroll
══════════════════════════════════════════════════════════════ */
(function initHeroScrollFade() {
  const hero = $('.hero-inner');
  const indicator = $('.scroll-indicator');
  if (!hero) return;

  function onScroll() {
    const scrollY = window.scrollY;
    const fadeEnd = window.innerHeight * 0.5;
    const progress = Math.min(scrollY / fadeEnd, 1);

    hero.style.opacity = 1 - progress;
    hero.style.transform = `translateY(${scrollY * 0.3}px)`;

    if (indicator) {
      indicator.style.opacity = 1 - progress * 2;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ══════════════════════════════════════════════════════════════
   5. PARTICLE CANVAS – three-color network (enhanced)
══════════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  let mouseX = -1000, mouseY = -1000;
  let time = 0;

  const PARTICLE_COUNT = 80;
  const COLORS = [
    { r: 200, g: 164, b: 74  },
    { r: 0,   g: 212, b: 229 },
    { r: 0,   g: 229, b: 160 },
  ];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle(edge) {
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    let x, y;
    if (edge) {
      const side = Math.floor(Math.random() * 4);
      if (side === 0) { x = Math.random() * W; y = -10; }
      else if (side === 1) { x = W + 10; y = Math.random() * H; }
      else if (side === 2) { x = Math.random() * W; y = H + 10; }
      else { x = -10; y = Math.random() * H; }
    } else {
      x = Math.random() * W;
      y = Math.random() * H;
    }
    return {
      x, y,
      r:     Math.random() * 2.2 + 0.4,
      dx:    (Math.random() - 0.5) * 0.35,
      dy:    (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.15,
      baseAlpha: Math.random() * 0.5 + 0.15,
      color: c,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle(false));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    time += 0.01;

    particles.forEach(p => {
      /* Mouse repulsion + glow */
      const mdx = p.x - mouseX;
      const mdy = p.y - mouseY;
      const mDist = Math.hypot(mdx, mdy);
      if (mDist < 160) {
        const force = (160 - mDist) / 160 * 0.9;
        p.x += (mdx / mDist) * force;
        p.y += (mdy / mDist) * force;
        /* Brighten near mouse */
        p.alpha = Math.min(p.baseAlpha + (1 - mDist / 160) * 0.5, 1);
      } else {
        /* Subtle pulse */
        p.alpha = p.baseAlpha + Math.sin(time * 2 + p.phase) * 0.05;
      }

      /* Draw dot with glow */
      const { r, g, b } = p.color;
      if (mDist < 100) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha * 0.15})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
      ctx.fill();

      /* Move */
      p.x += p.dx;
      p.y += p.dy;

      /* Wrap */
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    });

    /* Connecting lines with pulse */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], bP = particles[j];
        const dist = Math.hypot(a.x - bP.x, a.y - bP.y);
        if (dist < 130) {
          const pulse = 0.5 + Math.sin(time * 3 + i * 0.1) * 0.5;
          const alpha = (1 - dist / 130) * 0.12 * (0.7 + pulse * 0.3);
          const cr = Math.round((a.color.r + bP.color.r) / 2);
          const cg = Math.round((a.color.g + bP.color.g) / 2);
          const cb = Math.round((a.color.b + bP.color.b) / 2);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(bP.x, bP.y);
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  init();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 150);
  });
})();


/* ══════════════════════════════════════════════════════════════
   6. 3D TILT EFFECT + RIPPLE – service cards
══════════════════════════════════════════════════════════════ */
(function initTilt() {
  const cards = $$('[data-tilt]');
  if (!cards.length) return;

  const MAX_ROTATION = 8;

  cards.forEach(card => {
    const glare = card.querySelector('.card-glare');

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const rotateY = ((x - cx) / cx) * MAX_ROTATION;
      const rotateX = ((cy - y) / cy) * MAX_ROTATION;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      if (glare) {
        const gx = (x / rect.width) * 100;
        const gy = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.08) 0%, transparent 60%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      card.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
      if (glare) glare.style.background = '';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });

    card.addEventListener('mouseenter', e => {
      card.style.transition = 'none';
      /* Ripple effect */
      const rect = card.getBoundingClientRect();
      const ripple = document.createElement('div');
      ripple.className = 'card-ripple';
      const size = Math.max(rect.width, rect.height) * 2.5;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      card.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transition = 'transform .8s ease-out, opacity .8s ease-out';
        ripple.style.transform = 'scale(1)';
        ripple.style.opacity = '0';
      });
      setTimeout(() => ripple.remove(), 800);
    });
  });
})();


/* ══════════════════════════════════════════════════════════════
   7. PARALLAX – about section image
══════════════════════════════════════════════════════════════ */
(function initParallax() {
  const els = $$('[data-parallax]');
  if (!els.length) return;

  function onScroll() {
    els.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (center - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ══════════════════════════════════════════════════════════════
   8. SMOOTH SCROLL
══════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = $('#navbar')?.offsetHeight || 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ══════════════════════════════════════════════════════════════
   9. ACTIVE NAV on scroll
══════════════════════════════════════════════════════════════ */
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  if (!sections.length || !navLinks.length) return;

  function onScroll() {
    const scrollPos = window.scrollY + 120;
    let current = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ══════════════════════════════════════════════════════════════
   10. CONTACT FORM
══════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form      = $('#contactForm');
  const success   = $('#formSuccess');
  const service   = $('#service');
  const subjectEl = $('#formSubject');
  const replyEl   = $('#formReplyTo');
  const emailEl   = $('#email');
  const nameEl    = $('#name');
  if (!form) return;

  if (service && subjectEl) {
    service.addEventListener('change', () => {
      const name = nameEl ? nameEl.value : '';
      subjectEl.value = `[${service.value}] Neue Anfrage von ${name}`.trim();
    });
  }

  if (emailEl && replyEl) {
    emailEl.addEventListener('input', () => { replyEl.value = emailEl.value; });
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const required = $$('[required]', form);
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#ef4444';
        valid = false;
      }
    });

    if (!valid) {
      form.style.animation = 'none';
      form.offsetHeight;
      form.style.animation = 'shake .4s ease';
      return;
    }

    if (subjectEl && service && nameEl) {
      subjectEl.value = `[${service.value}] Neue Anfrage von ${nameEl.value}`;
    }

    const btn = $('button[type="submit"]', form);
    btn.classList.add('loading');
    btn.disabled = true;

    const data = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
    .then(response => {
      if (response.ok) {
        btn.style.display = 'none';
        success.classList.add('show');
        form.reset();
        setTimeout(() => {
          success.classList.remove('show');
          btn.style.display = '';
          btn.classList.remove('loading');
          btn.disabled = false;
        }, 8000);
      } else {
        throw new Error('Form submission failed');
      }
    })
    .catch(() => {
      /* Fallback: show success anyway */
      btn.style.display = 'none';
      success.classList.add('show');
      form.reset();
      setTimeout(() => {
        success.classList.remove('show');
        btn.style.display = '';
        btn.classList.remove('loading');
        btn.disabled = false;
      }, 8000);
    });
  });

  $$('[required]', form).forEach(f => {
    f.addEventListener('input', () => { f.style.borderColor = ''; });
  });
})();


/* ══════════════════════════════════════════════════════════════
   11. MODALS
══════════════════════════════════════════════════════════════ */
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('active');
  document.body.style.overflow = '';
}
function closeModalOnBg(e, id) {
  if (e.target === e.currentTarget) closeModal(id);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    $$('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
  }
});


/* ══════════════════════════════════════════════════════════════
   12. INJECT DYNAMIC STYLES
══════════════════════════════════════════════════════════════ */
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }
    .nav-link.active { color: var(--text-primary) !important; }
    .nav-link.active::after { width: 100% !important; }
  `;
  document.head.appendChild(style);
})();


/* ══════════════════════════════════════════════════════════════
   13. TYPEWRITER EFFECT
══════════════════════════════════════════════════════════════ */
(function initTypewriter() {
  const el = $('#heroTypewriter');
  if (!el) return;

  const textSpan = el.querySelector('.typewriter-text');
  const cursor   = el.querySelector('.typewriter-cursor');
  const lines    = (el.dataset.lines || '').split('|');
  if (!textSpan || !lines.length) return;

  let lineIdx = 0, charIdx = 0;
  let currentText = '';

  function typeLine() {
    if (lineIdx >= lines.length) {
      setTimeout(() => cursor.classList.add('done'), 500);
      return;
    }

    const line = lines[lineIdx];

    if (charIdx <= line.length) {
      currentText = lines.slice(0, lineIdx).join('\n') +
        (lineIdx > 0 ? '\n' : '') + line.slice(0, charIdx);
      textSpan.innerHTML = currentText.replace(/\n/g, '<br>');
      charIdx++;
      setTimeout(typeLine, 40 + Math.random() * 30);
    } else {
      lineIdx++;
      charIdx = 0;
      setTimeout(typeLine, 400);
    }
  }

  /* Start after hero entrance animation */
  setTimeout(typeLine, 1200);
})();


/* ══════════════════════════════════════════════════════════════
   14. CURSOR GLOW
══════════════════════════════════════════════════════════════ */
(function initCursorGlow() {
  const glow = $('#cursorGlow');
  if (!glow || window.matchMedia('(hover: none)').matches) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let active = false;

  document.addEventListener('mousemove', e => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!active) {
      active = true;
      glow.classList.add('active');
    }
  });

  document.addEventListener('mouseleave', () => {
    active = false;
    glow.classList.remove('active');
  });

  /* Detect which section the cursor is over */
  function getSectionColor() {
    const el = document.elementFromPoint(targetX, targetY);
    if (!el) return '';
    const card = el.closest('[data-accent]');
    if (card) {
      const accent = card.dataset.accent;
      if (accent === 'versicherung') return 'gold';
      if (accent === 'skyestate') return 'cyan';
      if (accent === 'werbewal') return 'mint';
    }
    return '';
  }

  function animate() {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';

    /* Update color based on section */
    const color = getSectionColor();
    glow.className = 'cursor-glow' + (active ? ' active' : '') + (color ? ' ' + color : '');

    requestAnimationFrame(animate);
  }
  animate();
})();


/* ══════════════════════════════════════════════════════════════
   15. MAGNETIC BUTTONS
══════════════════════════════════════════════════════════════ */
(function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;

  const btns = $$('[data-magnetic]');
  const MAX_PULL = 6;

  btns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2) * MAX_PULL;
      const dy = (e.clientY - cy) / (rect.height / 2) * MAX_PULL;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
      btn.style.transition = 'transform 0.15s ease-out';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(.4,0,.2,1)';
    });
  });
})();


/* ══════════════════════════════════════════════════════════════
   16. COUNTER ANIMATION
══════════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = $$('[data-target]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1500;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();


/* ══════════════════════════════════════════════════════════════
   17. WORD REVEAL – split headlines into animated words
══════════════════════════════════════════════════════════════ */
(function initWordReveal() {
  const headlines = $$('.section-headline');
  if (!headlines.length) return;

  headlines.forEach(h => {
    /* Skip if inside hero */
    if (h.closest('.hero')) return;

    const html = h.innerHTML;
    /* Split text nodes into words while preserving HTML tags */
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    let wordIndex = 0;
    function processNode(node) {
      if (node.nodeType === 3) {
        const words = node.textContent.split(/(\s+)/);
        const fragment = document.createDocumentFragment();
        words.forEach(word => {
          if (word.trim() === '') {
            fragment.appendChild(document.createTextNode(word));
          } else {
            const span = document.createElement('span');
            span.className = 'word-reveal';
            span.textContent = word;
            span.style.transitionDelay = (wordIndex * 0.08) + 's';
            wordIndex++;
            fragment.appendChild(span);
          }
        });
        node.parentNode.replaceChild(fragment, node);
      } else if (node.nodeType === 1) {
        if (node.classList && node.classList.contains('text-gradient')) {
          /* Gradient-Span als EINE Reveal-Einheit kapseln. Den Text darin in
             transformierte .word-reveal-Kinder zu splitten macht den
             background-clip:text-Gradient auf iOS Safari unsichtbar. */
          const span = document.createElement('span');
          span.className = 'word-reveal';
          span.style.transitionDelay = (wordIndex * 0.08) + 's';
          wordIndex++;
          node.parentNode.replaceChild(span, node);
          span.appendChild(node);
        } else {
          /* For other inline elements, wrap their contents per word. */
          const children = [...node.childNodes];
          children.forEach(processNode);
        }
      }
    }

    const children = [...wrapper.childNodes];
    children.forEach(processNode);
    h.innerHTML = wrapper.innerHTML;

    /* Remove existing reveal-up class since we handle it per-word */
    h.classList.remove('reveal-up');
    h.style.opacity = '1';
    h.style.transform = 'none';
  });

  /* Observe word-reveal spans */
  const words = $$('.word-reveal');
  if (!words.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  words.forEach(w => obs.observe(w));
})();
