/* ============================================================
   firebase-auth.js — Real Firebase Auth + Firestore Logic
   Lumen Mystic Vision
   ============================================================
   Handles:
   - Email/password login & signup
   - Google OAuth (real popup)
   - Auth state → updates navbar on every page
   - Saves user profile to Firestore on signup
   - Saves feedback to Firestore
   ============================================================ */

/* ─── Helpers ────────────────────────────────────────────── */
function showToast(msg, duration = 3200) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

function setButtonLoading(btnId, loadingText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = true;
  btn._originalText = btn.textContent;
  btn.textContent = loadingText;
}

function resetButton(btnId, fallbackText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = false;
  btn.textContent = btn._originalText || fallbackText;
}

/* ─── Auth State Observer (runs on EVERY page) ──────────── */
// Updates the navbar to show user name or Sign In button
auth.onAuthStateChanged((user) => {
  const loginBtn  = document.getElementById('nav-login-btn');
  const logoutBtn = document.getElementById('nav-logout-btn');
  const userLabel = document.getElementById('nav-user-label');

  if (user) {
    // User is signed in
    const displayName = user.displayName || user.email.split('@')[0];
    if (loginBtn)  loginBtn.style.display  = 'none';
    if (userLabel) {
      userLabel.style.display = 'flex';
      userLabel.textContent   = `✦ ${displayName}`;
    }
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';

    // Store minimal user info in sessionStorage for quick access
    sessionStorage.setItem('lumen_user', JSON.stringify({
      uid:  user.uid,
      name: displayName,
      email: user.email,
    }));
  } else {
    // User is signed out
    if (loginBtn)  loginBtn.style.display  = '';
    if (userLabel) userLabel.style.display  = 'none';
    if (logoutBtn) logoutBtn.style.display  = 'none';
    sessionStorage.removeItem('lumen_user');
  }
});

/* ─── Logout (wired to button on all pages) ─────────────── */
document.getElementById('nav-logout-btn')?.addEventListener('click', async () => {
  try {
    await auth.signOut();
    showToast('✦ You have stepped back into the cosmos. See you soon.');
    setTimeout(() => window.location.href = 'index.html', 1200);
  } catch (err) {
    showToast('✦ Sign-out failed. Please try again.');
  }
});

/* ─── GOOGLE OAUTH (shared — login & signup pages) ──────── */
async function signInWithGoogle(redirectTo = 'index.html') {
  try {
    const result = await auth.signInWithPopup(googleProvider);
    const user   = result.user;

    // If new user, save profile to Firestore
    if (result.additionalUserInfo?.isNewUser) {
      await db.collection('users').doc(user.uid).set({
        name:      user.displayName || '',
        email:     user.email,
        zodiac:    '',
        plan:      'seeker',
        provider:  'google',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    showToast(`✦ Welcome, ${user.displayName || 'Seeker'}! The cosmos awaits.`);
    setTimeout(() => window.location.href = redirectTo, 1000);
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user') return;
    showToast('✦ Google sign-in failed. Please try again.');
    console.error('Google OAuth error:', err);
  }
}

/* ─── LOGIN PAGE ─────────────────────────────────────────── */
(function initFirebaseLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  // Password toggle (keep existing UI logic)
  const pwInput   = document.getElementById('login-password');
  const toggleBtn = document.getElementById('toggle-pw-btn');
  const eyeIcon   = document.getElementById('eye-icon');
  toggleBtn?.addEventListener('click', () => {
    const isText = pwInput.type === 'text';
    pwInput.type = isText ? 'password' : 'text';
    eyeIcon.textContent = isText ? '👁' : '🙈';
  });

  // Forgot password — real Firebase email
  document.getElementById('forgot-password-link')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('✦ Enter your email above first, then click Forgot.');
      document.getElementById('login-email')?.focus();
      return;
    }
    try {
      await auth.sendPasswordResetEmail(email);
      showToast(`✦ Reset link sent to ${email}. Check your inbox!`);
    } catch (err) {
      showToast('✦ Could not send reset email. Check the address and try again.');
    }
  });

  // Real Google OAuth
  document.getElementById('google-btn')?.addEventListener('click', () => signInWithGoogle('index.html'));
  document.getElementById('apple-btn')?.addEventListener('click',  () => {
    showToast('✦ Apple Sign-In coming soon. Use email or Google for now.');
  });

  // Clear errors on input
  ['login-email', 'login-password'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', function () {
      this.classList.remove('error');
    });
  });

  // Form submit — real Firebase
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailEl  = document.getElementById('login-email');
    const passEl   = document.getElementById('login-password');
    const emailErr = document.getElementById('email-error');
    const pwErr    = document.getElementById('pw-error');

    emailEl.classList.remove('error');  emailErr.textContent = '';
    passEl.classList.remove('error');   pwErr.textContent    = '';

    let valid = true;
    if (!emailEl.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.classList.add('error');
      emailErr.textContent = 'Please enter a valid email address.';
      valid = false;
    }
    if (!passEl.value || passEl.value.length < 6) {
      passEl.classList.add('error');
      pwErr.textContent = 'Password must be at least 6 characters.';
      valid = false;
    }
    if (!valid) return;

    setButtonLoading('login-submit-btn', '✦ Aligning the stars…');

    try {
      const cred = await auth.signInWithEmailAndPassword(emailEl.value.trim(), passEl.value);
      const name = cred.user.displayName || cred.user.email.split('@')[0];
      showToast(`✦ Welcome back, ${name}! The cosmos awaits.`);
      setTimeout(() => window.location.href = 'index.html', 1000);
    } catch (err) {
      resetButton('login-submit-btn', 'Sign In to Lumen');
      switch (err.code) {
        case 'auth/user-not-found':
          emailEl.classList.add('error');
          emailErr.textContent = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          passEl.classList.add('error');
          pwErr.textContent = 'Incorrect password. Try again or reset it.';
          break;
        case 'auth/too-many-requests':
          showToast('✦ Too many attempts. Please wait a moment and try again.');
          break;
        default:
          showToast('✦ Sign-in failed. Please check your details and try again.');
      }
    }
  });
})();

/* ─── SIGNUP PAGE ────────────────────────────────────────── */
(function initFirebaseSignup() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  // Show plan badge from URL param
  const plan = new URLSearchParams(window.location.search).get('plan');
  const planBadge     = document.getElementById('plan-badge');
  const planBadgeText = document.getElementById('plan-badge-text');
  if (plan && planBadge && planBadgeText) {
    const plans = { oracle: '⭐ Oracle Plan — $9/mo', luminary: '🌟 Luminary Plan — $29/mo' };
    if (plans[plan]) {
      planBadgeText.textContent = plans[plan];
      planBadge.style.display = 'flex';
    }
  }

  // Real Google OAuth
  document.getElementById('google-signup-btn')?.addEventListener('click', () => signInWithGoogle('index.html'));
  document.getElementById('apple-signup-btn')?.addEventListener('click',  () => {
    showToast('✦ Apple Sign-In coming soon. Use email or Google for now.');
  });

  // Password toggle
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

  // Password strength (reuse existing logic)
  function getStrength(pw) {
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: 'Weak',       color: '#ef4444' };
    if (score <= 2) return { level: 2, label: 'Fair',       color: '#f97316' };
    if (score <= 3) return { level: 3, label: 'Good',       color: '#eab308' };
    if (score <= 4) return { level: 4, label: 'Strong',     color: '#22c55e' };
    return              { level: 5, label: 'Stellar ✦', color: '#a855f7' };
  }

  pwInput?.addEventListener('input', () => {
    const val = pwInput.value;
    if (!val) {
      if (pwBar) { pwBar.style.width = '0'; pwBar.style.background = ''; }
      if (pwStrLabel) pwStrLabel.textContent = '';
      return;
    }
    const { level, label, color } = getStrength(val);
    if (pwBar) { pwBar.style.width = `${(level / 5) * 100}%`; pwBar.style.background = color; }
    if (pwStrLabel) { pwStrLabel.textContent = label; pwStrLabel.style.color = color; }
  });

  // Terms / privacy links
  document.getElementById('terms-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('✦ Terms of Service — The cosmos binds us to honesty and fairness.');
  });
  document.getElementById('privacy-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('✦ Privacy Policy — Your cosmic data stays with you. Always.');
  });

  // Clear errors on input
  ['signup-fname', 'signup-email', 'signup-password'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', function () {
      this.classList.remove('error');
    });
  });

  // Form submit — real Firebase
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fname    = document.getElementById('signup-fname');
    const lname    = document.getElementById('signup-lname');
    const emailEl  = document.getElementById('signup-email');
    const passEl   = document.getElementById('signup-password');
    const zodiac   = document.getElementById('signup-zodiac');
    const terms    = document.getElementById('signup-terms');

    const fnameErr = document.getElementById('fname-error');
    const emailErr = document.getElementById('signup-email-error');
    const pwErr    = document.getElementById('signup-pw-error');
    const termsErr = document.getElementById('terms-error');

    [fname, emailEl, passEl].forEach(el => el.classList.remove('error'));
    [fnameErr, emailErr, pwErr, termsErr].forEach(el => { if (el) el.textContent = ''; });

    let valid = true;
    if (!fname.value.trim()) {
      fname.classList.add('error');
      fnameErr.textContent = 'Please enter your first name.';
      valid = false;
    }
    if (!emailEl.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.classList.add('error');
      emailErr.textContent = 'Please enter a valid email address.';
      valid = false;
    }
    if (!passEl.value || passEl.value.length < 8) {
      passEl.classList.add('error');
      pwErr.textContent = 'Password must be at least 8 characters.';
      valid = false;
    }
    if (!terms.checked) {
      termsErr.textContent = 'You must agree to the terms to continue.';
      valid = false;
    }
    if (!valid) return;

    setButtonLoading('signup-submit-btn', '✦ Creating your cosmic profile…');

    try {
      // Create Firebase Auth account
      const cred = await auth.createUserWithEmailAndPassword(
        emailEl.value.trim(),
        passEl.value
      );
      const user = cred.user;

      // Set display name
      const fullName = [fname.value.trim(), lname?.value.trim()].filter(Boolean).join(' ');
      await user.updateProfile({ displayName: fullName });

      // Save profile to Firestore
      await db.collection('users').doc(user.uid).set({
        name:      fullName,
        email:     user.email,
        zodiac:    zodiac?.value || '',
        plan:      plan || 'seeker',
        provider:  'email',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      showToast(`✦ Welcome to Lumen, ${fname.value.trim()}! Your journey begins now.`);
      setTimeout(() => window.location.href = 'index.html', 1200);

    } catch (err) {
      resetButton('signup-submit-btn', '✦ Create My Account');
      switch (err.code) {
        case 'auth/email-already-in-use':
          emailEl.classList.add('error');
          document.getElementById('signup-email-error').textContent =
            'An account with this email already exists. Sign in instead.';
          break;
        case 'auth/weak-password':
          passEl.classList.add('error');
          document.getElementById('signup-pw-error').textContent =
            'Password is too weak. Add numbers or symbols.';
          break;
        case 'auth/invalid-email':
          emailEl.classList.add('error');
          document.getElementById('signup-email-error').textContent =
            'Please enter a valid email address.';
          break;
        default:
          showToast('✦ Account creation failed. Please try again.');
          console.error('Signup error:', err);
      }
    }
  });
})();

/* ─── FEEDBACK PAGE — Save to Firestore ─────────────────── */
// This supplements the existing feedback submit in auth.js.
// We hook into the form's submit event AFTER the main handler
// and save the payload to Firestore if the user is logged in (or anonymously).
(function initFirebaseFeedback() {
  const form = document.getElementById('feedback-form');
  if (!form) return;

  // Listen for the custom 'lumen:feedback' event dispatched by auth.js
  document.addEventListener('lumen:feedback', async (e) => {
    const payload = e.detail;
    if (!payload) return;

    try {
      const user = auth.currentUser;
      await db.collection('feedback').add({
        ...payload,
        uid:       user ? user.uid : 'anonymous',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✦ Feedback saved to Firestore');
    } catch (err) {
      // Firestore save failure is silent — Google Sheets is the primary store
      console.warn('Firestore feedback save failed (non-critical):', err);
    }
  });
})();
