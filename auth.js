/* ============================
   auth.js — Login, Signup & Feedback
   ============================*/

/* ─── Toast ────────────────────────────────────────── */
function showToast(msg, duration = 3200) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

/* ─── Simulate OAuth (Google / Apple) ───────────────── */
function simulateOAuth(provider, redirectTo = 'index.html') {
  const toastMap = {
    google: '✦ Connecting to Google…',
    apple:  '✦ Connecting to Apple…',
  };
  showToast(toastMap[provider]);
  // Simulate a redirect after a short delay
  setTimeout(() => {
    showToast('✓ Signed in! Welcome, Seeker.');
    setTimeout(() => window.location.href = redirectTo, 1200);
  }, 2000);
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

/* ─── LOGIN PAGE ─────────────────────────────────────── */
(function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  /* Toggle password */
  const pwInput  = document.getElementById('login-password');
  const toggleBtn = document.getElementById('toggle-pw-btn');
  const eyeIcon  = document.getElementById('eye-icon');

  toggleBtn?.addEventListener('click', () => {
    const isText = pwInput.type === 'text';
    pwInput.type = isText ? 'password' : 'text';
    eyeIcon.textContent = isText ? '👁' : '🙈';
  });

  /* Forgot password */
  document.getElementById('forgot-password-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('✦ Enter your email above first, then click Forgot.');
      document.getElementById('login-email')?.focus();
      return;
    }
    showToast(`✦ Reset link sent to ${email}. Check your inbox!`);
  });

  /* Google */
  document.getElementById('google-btn')?.addEventListener('click', () => simulateOAuth('google'));
  /* Apple */
  document.getElementById('apple-btn')?.addEventListener('click',  () => simulateOAuth('apple'));

  /* Real-time field clearing */
  ['login-email', 'login-password'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', function () {
      this.classList.remove('error');
    });
  });

  /* Form submit */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const email    = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    const emailErr = document.getElementById('email-error');
    const pwErr    = document.getElementById('pw-error');

    email.classList.remove('error');    emailErr.textContent = '';
    password.classList.remove('error'); pwErr.textContent    = '';

    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('error');
      emailErr.textContent = 'Please enter a valid email address.';
      valid = false;
    }
    if (!password.value || password.value.length < 6) {
      password.classList.add('error');
      pwErr.textContent = 'Password must be at least 6 characters.';
      valid = false;
    }
    if (!valid) return;

    const btn = document.getElementById('login-submit-btn');
    btn.disabled    = true;
    btn.textContent = '✦ Aligning the stars…';

    setTimeout(() => {
      btn.textContent = '✓ Signed In!';
      showToast('✦ Welcome back, Seeker! The cosmos awaits.');
      setTimeout(() => window.location.href = 'index.html', 1400);
    }, 1600);
  });
})();

/* ─── SIGNUP PAGE ───────────────────────────────────── */
(function initSignup() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  /* Show selected plan badge if ?plan= param present */
  const plan = new URLSearchParams(window.location.search).get('plan');
  const planBadge = document.getElementById('plan-badge');
  const planBadgeText = document.getElementById('plan-badge-text');
  if (plan && planBadge && planBadgeText) {
    const plans = { oracle: '⭐ Oracle Plan — $9/mo', luminary: '🌟 Luminary Plan — $29/mo' };
    if (plans[plan]) {
      planBadgeText.textContent = plans[plan];
      planBadge.style.display = 'flex';
    }
  }

  /* Google / Apple OAuth */
  document.getElementById('google-signup-btn')?.addEventListener('click', () => simulateOAuth('google'));
  document.getElementById('apple-signup-btn')?.addEventListener('click',  () => simulateOAuth('apple'));

  /* Toggle password visibility */
  const pwInput    = document.getElementById('signup-password');
  const toggleBtn  = document.getElementById('toggle-signup-pw-btn');
  const eyeIcon    = document.getElementById('signup-eye-icon');
  const pwBar      = document.getElementById('pw-bar');
  const pwStrLabel = document.getElementById('pw-strength-label');

  toggleBtn?.addEventListener('click', () => {
    const isText = pwInput.type === 'text';
    pwInput.type = isText ? 'password' : 'text';
    eyeIcon.textContent = isText ? '👁' : '🙈';
  });

  /* Live password strength */
  pwInput?.addEventListener('input', () => {
    const val = pwInput.value;
    if (!val) {
      if (pwBar) { pwBar.style.width = '0'; pwBar.style.background = ''; }
      if (pwStrLabel) pwStrLabel.textContent = '';
      return;
    }
    const { level, label, color } = getPasswordStrength(val);
    if (pwBar) {
      pwBar.style.width = `${(level / 5) * 100}%`;
      pwBar.style.background = color;
    }
    if (pwStrLabel) { pwStrLabel.textContent = label; pwStrLabel.style.color = color; }
  });

  /* Terms / privacy links */
  document.getElementById('terms-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('✦ Terms of Service — The cosmos binds us to honesty and fairness.');
  });
  document.getElementById('privacy-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('✦ Privacy Policy — Your cosmic data stays with you. Always.');
  });

  /* Real-time error clearing */
  ['signup-fname', 'signup-email', 'signup-password'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', function () {
      this.classList.remove('error');
    });
  });

  /* Form submit */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const fname    = document.getElementById('signup-fname');
    const email    = document.getElementById('signup-email');
    const password = document.getElementById('signup-password');
    const terms    = document.getElementById('signup-terms');

    const fnameErr = document.getElementById('fname-error');
    const emailErr = document.getElementById('signup-email-error');
    const pwErr    = document.getElementById('signup-pw-error');
    const termsErr = document.getElementById('terms-error');

    [fname, email, password].forEach(el => el.classList.remove('error'));
    [fnameErr, emailErr, pwErr, termsErr].forEach(el => { if (el) el.textContent = ''; });

    if (!fname.value.trim()) {
      fname.classList.add('error');
      fnameErr.textContent = 'Please enter your first name.';
      valid = false;
    }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('error');
      emailErr.textContent = 'Please enter a valid email address.';
      valid = false;
    }
    if (!password.value || password.value.length < 8) {
      password.classList.add('error');
      pwErr.textContent = 'Password must be at least 8 characters.';
      valid = false;
    }
    if (!terms.checked) {
      termsErr.textContent = 'You must agree to the terms to continue.';
      valid = false;
    }
    if (!valid) return;

    const btn = document.getElementById('signup-submit-btn');
    btn.disabled    = true;
    btn.textContent = '✦ Creating your cosmic profile…';

    setTimeout(() => {
      btn.textContent = '✓ Account Created!';
      showToast('✦ Welcome to Lumen, Seeker! Your journey begins now.');
      setTimeout(() => window.location.href = 'index.html', 1600);
    }, 1800);
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

  /* Form submit */
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

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzMKMc2GPPuJthavlOvLFDMjLW2oMVw_Efw1LfRYOr6lmozy70OvcanW0b0chimToF7/exec';

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      // Use text/plain to avoid CORS preflight which Apps Script often blocks
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    })
    .then(response => response.json())
    .then(data => {
      console.log('✦ Feedback recorded in stars:', data);
      const card    = document.getElementById('feedback-card');
      const success = document.getElementById('feedback-success');
      if (card)    card.style.display = 'none';
      if (success) { success.classList.add('show'); success.setAttribute('aria-hidden', 'false'); }
    })
    .catch(error => {
      console.error('Error sending feedback:', error);
      showToast('✦ The connection fluttered. Please try again.');
      btn.disabled = false;
      btn.textContent = '✦ Send to the Cosmos';
    });
  });

  /* Return home button (inside success state) */
  document.getElementById('back-after-feedback-btn')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
})();
