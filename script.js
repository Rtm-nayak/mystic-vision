/* ============================
   Lumen — Main Script (Full)
   ============================*/

/* ─── Starfield ─────────────────────────────────────── */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  const COUNT = 180;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function buildStars() {
    stars = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      base: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.015 + 0.004,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      const a = s.base * (0.6 + 0.4 * Math.sin(t * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.fill();
    }
  }

  function loop(ts) {
    draw(ts * 0.001);
    requestAnimationFrame(loop);
  }

  resize();
  buildStars();
  requestAnimationFrame(loop);
  window.addEventListener('resize', () => { resize(); buildStars(); });
})();

/* ─── Navbar scroll effect ───────────────────────────── */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── Mobile hamburger ───────────────────────────────── */
(function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    });
  });
})();

/* ─── Language Selector ──────────────────────────────── */
(function initLangSelector() {
  const btn = document.getElementById('lang-btn');
  if (!btn) return;

  const LANGUAGES = [
    { code: 'EN', label: '🇬🇧 English' },
    { code: 'ES', label: '🇪🇸 Español' },
    { code: 'FR', label: '🇫🇷 Français' },
    { code: 'DE', label: '🇩🇪 Deutsch' },
    { code: 'PT', label: '🇧🇷 Português' },
    { code: 'HI', label: '🇮🇳 हिन्दी' },
    { code: 'JA', label: '🇯🇵 日本語' },
    { code: 'ZH', label: '🇨🇳 中文' },
  ];

  // Build dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'lang-dropdown glass';
  dropdown.setAttribute('role', 'listbox');
  dropdown.setAttribute('aria-label', 'Select language');
  dropdown.innerHTML = LANGUAGES.map(l =>
    `<button class="lang-option${l.code === 'EN' ? ' active' : ''}" role="option" data-code="${l.code}">${l.label}</button>`
  ).join('');

  btn.parentElement.style.position = 'relative';
  btn.parentElement.appendChild(dropdown);

  let open = false;

  function toggleDropdown(state) {
    open = state ?? !open;
    dropdown.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  dropdown.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', () => {
      dropdown.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      btn.textContent = opt.dataset.code + ' ▾';
      toggleDropdown(false);
    });
  });

  document.addEventListener('click', () => toggleDropdown(false));
  dropdown.addEventListener('click', e => e.stopPropagation());
})();

/* ─── Scroll-entrance animations ─────────────────────── */
(function initAOS() {
  const els = document.querySelectorAll('[data-aos]');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('aos-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* ─── Reading Oracle ─────────────────────────────────── */
const READINGS = {
  love: [
    "A connection long dormant stirs beneath the surface. The next lunar cycle brings unexpected warmth from an unexpected direction.",
    "The stars align for heartfelt conversations — say what you have kept quiet. Authenticity is your greatest magnetic force right now.",
    "Venus casts a rosy light on your seventh house. A soulmate-level bond is forming, whether you recognise it yet or not.",
    "Release the memory that keeps you anchored to the past. New emotional territory awaits, luminous and wide open.",
  ],
  career: [
    "Mercury stations direct in your tenth house — a stalled negotiation breaks in your favour before the week is out.",
    "An idea you dismissed as too bold is exactly what is needed. Commit with full energy; the cosmos rewards audacity today.",
    "Collaborate rather than compete. The alliance you build in the coming days will compound into something extraordinary.",
    "A detour you resented is quietly positioning you for the opportunity you have always wanted. Trust the longer arc.",
  ],
  spirit: [
    "Stillness is not inaction — it is the most powerful signal you can send to the universe right now. Breathe and receive.",
    "Your intuition is operating at peak clarity. If something feels misaligned, it is. If something feels right, it is. Trust it.",
    "A creative or spiritual project you have postponed is ready to be born. The materials, the time, and the courage are all present.",
    "The universe is mirroring back your inner state with unusual fidelity. Cultivate wonder and wonder will find you.",
  ],
};

const CATEGORIES = ['love', 'career', 'spirit'];

function getReading(name) {
  const seed = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cat = CATEGORIES[seed % CATEGORIES.length];
  const pool = READINGS[cat];
  const pick = pool[(seed >> 2) % pool.length];
  return { category: cat.charAt(0).toUpperCase() + cat.slice(1), text: pick };
}

function beginReading() {
  const input = document.getElementById('hero-input');
  if (!input) return;
  const name = input.value.trim();
  if (!name) {
    input.focus();
    input.style.borderColor = 'rgba(236,72,153,0.7)';
    input.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.2)';
    setTimeout(() => { input.style.borderColor = ''; input.style.boxShadow = ''; }, 1400);
    return;
  }

  const { category, text } = getReading(name);
  const btn = document.getElementById('begin-reading-btn');

  // Always store the name searched
  localStorage.setItem('lumen_search_name', name);

  // Loading state
  if (btn) { btn.disabled = true; btn.textContent = '✦ Reading the stars…'; }

  setTimeout(() => {
    if (btn) { btn.disabled = false; btn.textContent = 'Begin Reading'; }

    const modalName    = document.getElementById('modal-name');
    const modalReading = document.getElementById('modal-reading');
    const overlay      = document.getElementById('modal-overlay');

    if (modalName)    modalName.textContent = `✦ ${name} · ${category} Reading`;
    if (modalReading) modalReading.innerHTML = `<p>${text}</p>`;
    if (overlay) {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    // Save to Firestore if Firebase is loaded and user is signed in
    if (typeof auth !== 'undefined' && typeof db !== 'undefined') {
      const user = auth.currentUser;
      if (user) {
        db.collection('readings').add({
          uid:       user.uid,
          name:      name,
          category:  category,
          text:      text,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        }).catch(() => {/* non-critical */});
      }
    }
  }, 900);
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Modal event wiring
document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
document.getElementById('modal-new-btn')?.addEventListener('click', closeModal);

// Hero input wiring
(function initHeroInput() {
  const input = document.getElementById('hero-input');
  if (!input) return;
  
  // Restore previously searched name if it exists
  const savedName = localStorage.getItem('lumen_search_name');
  if (savedName) input.value = savedName;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') beginReading();
  });
})();
document.getElementById('begin-reading-btn')?.addEventListener('click', beginReading);

/* ─── Pricing Plan Buttons ────────────────────────────── */
(function initPricingButtons() {
  // "Get Started" — Free plan → scroll to hero input
  document.getElementById('plan-seeker-btn')?.addEventListener('click', () => {
    const input = document.getElementById('hero-input');
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => input.focus(), 600);
    }
  });

  // "Begin Oracle" — $9 plan → go to signup with plan param
  document.getElementById('plan-oracle-btn')?.addEventListener('click', () => {
    window.location.href = 'signup.html?plan=oracle';
  });

  // "Ascend Now" — $29 plan → go to signup with plan param
  document.getElementById('plan-luminary-btn')?.addEventListener('click', () => {
    window.location.href = 'signup.html?plan=luminary';
  });
})();

/* ─── CTA "Begin My Reading" ─────────────────────────── */
document.getElementById('cta-main-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  const input = document.getElementById('hero-input');
  if (input) {
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => input.focus(), 600);
  }
});

/* ─── Nav "Begin Reading" (hero input scroll) ────────── */
document.getElementById('nav-begin-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  const input = document.getElementById('hero-input');
  if (input) {
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => input.focus(), 600);
  }
});
