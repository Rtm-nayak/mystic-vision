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
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
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
