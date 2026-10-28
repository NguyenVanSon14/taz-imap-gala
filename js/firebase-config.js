// ============================================================
// FIREBASE CONFIG — Gala 20/11 IMAP "ĐIỆN ẢNH – Scenes of Inspiration" (TAZ0000)
// Firestore: events/TAZ0000/guestbook & rsvp
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjKovgSxKDy2P9C577SMUdSgCp6e3lf0w",
  authDomain: "taz-event.firebaseapp.com",
  projectId: "taz-event",
  storageBucket: "taz-event.firebasestorage.app",
  messagingSenderId: "409499042138",
  appId: "1:409499042138:web:17aa478de63d016593b363"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const guestbookCollection = collection(db, "events", "TAZ0000", "guestbook");
const rsvpCollection      = collection(db, "events", "TAZ0000", "rsvp");

export {
  db,
  guestbookCollection,
  rsvpCollection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
};
