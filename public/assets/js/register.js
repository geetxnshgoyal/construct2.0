import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

let db = null;
let isFirebaseConfigured = false;

export function initFirebase() {
  try {
    if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      isFirebaseConfigured = true;
      console.log("Firebase initialized.");
    } else {
      console.warn("Firebase config is missing or uses placeholders. Update assets/js/firebase-config.js with your project config.");
    }
  } catch (e) {
    console.error("Firebase init error:", e);
    isFirebaseConfigured = false;
  }
}

export function isConfigured() {
  return isFirebaseConfigured && db;
}

export async function saveToCollection(collectionName, payload) {
  if (!isConfigured()) {
    throw new Error("Firebase not configured");
  }

  return await addDoc(collection(db, collectionName), {
    ...payload,
    submittedAt: serverTimestamp(),
  });
}
