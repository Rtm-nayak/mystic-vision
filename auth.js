/* ============================
   auth.js — UI Logic Only
   Real auth is handled by firebase-auth.js
   ============================*/

/* ─── Toast (kept here as shared utility) ──────────── */
// NOTE: firebase-auth.js also defines showToast — that version
// takes precedence on pages that load firebase-auth.js.
// This version handles pages that only load auth.js.
if (typeof showToast === 'undefined') {
  window.showToast = function showToast(msg, duration = 3200) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), duration);
  };
}

/* ─── Password strength meter ────────────────────────── */
function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: 'Weak',   color: '#ef4444' };
  if (score <= 2) return { level: 2, label: 'Fair',   color: '#f97316' };
  if (score <= 3) return { level: 3, label: 'Good',   color: '#eab308' };
  if (score <= 4) return { level: 4, label: 'Strong', color: '#22c55e' };
  return              { level: 5, label: 'Stellar ✦', color: '#a855f7' };
}

/* ─── LOGIN PAGE — UI only (firebase-auth.js handles submission) ── */
(function initLoginUI() {
  if (!document.getElementById('login-form')) return;
  /* Password toggle UI */
  const pwInput   = document.getElementById('login-password');
  const toggleBtn = document.getElementById('toggle-pw-btn');
  const eyeIcon   = document.getElementById('eye-icon');
  toggleBtn?.addEventListener('click', () => {
    const isText = pwInput.type === 'text';
    pwInput.type = isText ? 'password' : 'text';
    eyeIcon.textContent = isText ? '👁' : '🙈';
  });
})();

/* ─── SIGNUP PAGE — UI only (firebase-auth.js handles submission) ── */
(function initSignupUI() {
  if (!document.getElementById('signup-form')) return;
  /* Password toggle UI */
  const pwInput   = document.getElementById('signup-password');
  const toggleBtn = document.getElementById('toggle-signup-pw-btn');
  const eyeIcon   = document.getElementById('signup-eye-icon');
  toggleBtn?.addEventListener('click', () => {
    const isText = pwInput.type === 'text';
    pwInput.type = isText ? 'password' : 'text';
    eyeIcon.textContent = isText ? '👁' : '🙈';
  });
})();

/* ─── FEEDBACK PAGE ─────────────────────────────────── */
(function initFeedback() {
  const form = document.getElementById('feedback-form');
  if (!form) return;

  /* Chip selection */
  const chips = document.querySelectorAll('.chip');
  let selectedCategory = 'reading';

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedCategory = chip.dataset.value;
    });
  });

  /* Star rating */
  const stars    = document.querySelectorAll('.star');
  const starLabel = document.getElementById('star-label');
  let selectedRating = 0;

  const STAR_LABELS = ['', 'Rough journey…', 'Getting there', 'Pretty good!', 'Really great ✨', 'Out of this world! 🌟'];

  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const val = Number(star.dataset.val);
      stars.forEach(s => s.classList.toggle('hovered', Number(s.dataset.val) <= val));
      if (starLabel) starLabel.textContent = STAR_LABELS[val];
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hovered'));
      if (starLabel) starLabel.textContent = selectedRating ? STAR_LABELS[selectedRating] : 'Tap to rate';
    });
    star.addEventListener('click', () => {
      selectedRating = Number(star.dataset.val);
      stars.forEach(s => {
        s.classList.toggle('active', Number(s.dataset.val) <= selectedRating);
        s.classList.remove('hovered');
      });
      if (starLabel) starLabel.textContent = STAR_LABELS[selectedRating];
    });
  });

  /* Character count */
  const msgInput  = document.getElementById('feedback-msg');
  const charCount = document.getElementById('char-count');

  msgInput?.addEventListener('input', () => {
    const len = Math.min(msgInput.value.length, 500);
    if (msgInput.value.length > 500) msgInput.value = msgInput.value.slice(0, 500);
    if (charCount) {
      charCount.textContent = `${len} / 500`;
      charCount.style.color = len > 450 ? '#f472b6' : 'var(--white-30)';
    }
    msgInput.classList.remove('error');
  });

  /* Form submit — sends to Google Sheets + Firestore */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg    = document.getElementById('feedback-msg');
    const msgErr = document.getElementById('msg-error');
    msg.classList.remove('error');
    if (msgErr) msgErr.textContent = '';

    if (!msg.value.trim() || msg.value.trim().length < 10) {
      msg.classList.add('error');
      if (msgErr) msgErr.textContent = 'Please share at least a few words — the cosmos is listening!';
      msg.focus();
      return;
    }

    const payload = {
      category:  selectedCategory,
      rating:    selectedRating,
      name:      document.getElementById('feedback-name')?.value.trim()  || 'Anonymous',
      email:     document.getElementById('feedback-email')?.value.trim() || '',
      message:   msg.value.trim(),
      consent:   document.getElementById('feedback-consent')?.checked    || false,
      timestamp: new Date().toISOString(),
    };

    const btn = document.getElementById('feedback-submit-btn');
    btn.disabled    = true;
    btn.textContent = '✦ Sending to the cosmos…';

    /* 1. Save to localStorage (local backup) */
    try {
      const existing = JSON.parse(localStorage.getItem('lumen_feedback') || '[]');
      existing.push(payload);
      localStorage.setItem('lumen_feedback', JSON.stringify(existing));
    } catch (_) { /* storage not available */ }

    /* 2. Dispatch event so firebase-auth.js can save to Firestore */
    document.dispatchEvent(new CustomEvent('lumen:feedback', { detail: payload }));

    /* 3. Send to Google Sheets (if URL is configured) */
    const SHEETS_URL = window.LUMEN_SHEETS_URL || '';

    const finish = () => {
      const card    = document.getElementById('feedback-card');
      const success = document.getElementById('feedback-success');
      if (card)    card.style.display = 'none';
      if (success) { success.classList.add('show'); success.setAttribute('aria-hidden', 'false'); }
    };

    if (SHEETS_URL) {
      fetch(SHEETS_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      })
      .then(() => finish())
      .catch(() => finish()); /* still show success even if sheets fails */
    } else {
      setTimeout(finish, 1200);
    }
  });

  /* Return home button (inside success state) */
  document.getElementById('back-after-feedback-btn')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
})();
