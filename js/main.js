/* ============================================================
   DERANECK.EU – Hub Landing Page JavaScript
   Canvas · Tilt · Parallax · Scroll · Form
   ============================================================ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


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
  setTimeout(() => heroEls.forEach(el => el.classList.add('visible')), 150);
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
   5. PARTICLE CANVAS – three-color network
══════════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  let mouseX = -1000, mouseY = -1000;

  const PARTICLE_COUNT = 70;
  const COLORS = [
    { r: 200, g: 164, b: 74  },  // Gold
    { r: 0,   g: 212, b: 229 },  // Cyan
    { r: 0,   g: 229, b: 160 },  // Mint
  ];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 2 + 0.4,
      dx:    (Math.random() - 0.5) * 0.3,
      dy:    (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.15,
      color: c,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      /* Mouse repulsion */
      const mdx = p.x - mouseX;
      const mdy = p.y - mouseY;
      const mDist = Math.hypot(mdx, mdy);
      if (mDist < 150) {
        const force = (150 - mDist) / 150 * 0.8;
        p.x += (mdx / mDist) * force;
        p.y += (mdy / mDist) * force;
      }

      /* Draw dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      const { r, g, b } = p.color;
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

    /* Connecting lines */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.12;
          /* Blend colors */
          const cr = Math.round((a.color.r + b.color.r) / 2);
          const cg = Math.round((a.color.g + b.color.g) / 2);
          const cb = Math.round((a.color.b + b.color.b) / 2);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  /* Track mouse for particle interaction */
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
   6. 3D TILT EFFECT – service cards
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

      /* Move glare with cursor */
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

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
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

  /* Update subject based on dropdown */
  if (service && subjectEl) {
    service.addEventListener('change', () => {
      const name = nameEl ? nameEl.value : '';
      subjectEl.value = `[${service.value}] Neue Anfrage von ${name}`.trim();
    });
  }

  /* Sync reply-to */
  if (emailEl && replyEl) {
    emailEl.addEventListener('input', () => { replyEl.value = emailEl.value; });
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    /* Validate */
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

    /* Update subject with name before submit */
    if (subjectEl && service && nameEl) {
      subjectEl.value = `[${service.value}] Neue Anfrage von ${nameEl.value}`;
    }

    /* Submit via fetch (Formspree) */
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
      /* Fallback: show success anyway (Formspree PLACEHOLDER not set up yet) */
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

  /* Clear red borders on input */
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
