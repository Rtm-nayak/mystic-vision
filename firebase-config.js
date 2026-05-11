/* ============================================================
   firebase-config.js — Lumen Firebase Initialization
   ============================================================
   SETUP: Replace the placeholder values below with your own
   Firebase project config. Get it from:
   Firebase Console → Your Project → Project Settings → Your Apps → SDK setup

   Steps:
   1. Go to https://console.firebase.google.com
   2. Create project → Add Web App
   3. Copy the config object shown and paste the values below
   4. Enable: Authentication > Email/Password + Google
   5. Enable: Firestore Database (start in test mode)
   ============================================================ */

// 👇 PASTE YOUR FIREBASE CONFIG VALUES HERE 👇
const firebaseConfig = {
  apiKey:            "AIzaSyD9IumB8iAECC7MUY1MTpf5BjyK7Z-9dfM",
  authDomain:        "lumen-mystic.firebaseapp.com",
  projectId:         "lumen-mystic",
  storageBucket:     "lumen-mystic.firebasestorage.app",
  messagingSenderId: "965189961794",
  appId:             "1:965189961794:web:354b5fea60df559ef945db"
};

// ── Initialize Firebase (compat SDK — no build tool needed) ──
firebase.initializeApp(firebaseConfig);

// ── Exported singletons used by all other scripts ──
const auth = firebase.auth();
const db   = firebase.firestore();

// ── Google Auth Provider ──
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ── Persistence: remember login across tabs/sessions ──
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
