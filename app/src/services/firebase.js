import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Recipes ---

export function subscribeRecipes(callback) {
  const q = query(collection(db, 'recipes'), orderBy('category'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function getRecipes() {
  const snap = await getDocs(query(collection(db, 'recipes'), orderBy('category')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getRecipe(id) {
  const snap = await getDoc(doc(db, 'recipes', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveRecipe(recipe) {
  const { id, ...data } = recipe;
  data.updatedAt = serverTimestamp();
  if (id) {
    await setDoc(doc(db, 'recipes', id), data, { merge: true });
    return id;
  } else {
    data.createdAt = serverTimestamp();
    const ref = await addDoc(collection(db, 'recipes'), data);
    return ref.id;
  }
}

export async function deleteRecipe(id) {
  await deleteDoc(doc(db, 'recipes', id));
}

export async function updateRecipeSortOrders(updates) {
  // updates: [{ id, sortOrder }, ...]
  const promises = updates.map(({ id, sortOrder }) =>
    setDoc(doc(db, 'recipes', id), { sortOrder, updatedAt: serverTimestamp() }, { merge: true })
  );
  await Promise.all(promises);
}

// --- Events ---

export function subscribeEvents(callback) {
  const q = query(collection(db, 'events'), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeActiveEvents(callback) {
  // Fetch all events and filter client-side to avoid needing a Firestore composite index
  const q = query(collection(db, 'events'));
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const active = all
      .filter((e) => e.isActive)
      .sort((a, b) => {
        const da = a.date?.toDate?.() || new Date(0);
        const db2 = b.date?.toDate?.() || new Date(0);
        return db2 - da;
      });
    callback(active);
  });
}

export async function getEvent(id) {
  const snap = await getDoc(doc(db, 'events', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveEvent(event) {
  const { id, ...data } = event;
  data.updatedAt = serverTimestamp();
  if (id) {
    await setDoc(doc(db, 'events', id), data, { merge: true });
    return id;
  } else {
    data.createdAt = serverTimestamp();
    const ref = await addDoc(collection(db, 'events'), data);
    return ref.id;
  }
}

export async function deleteEvent(id) {
  await deleteDoc(doc(db, 'events', id));
}

// --- Orders ---

export function subscribePendingOrders(eventId, callback) {
  // Fetch all orders and filter client-side to avoid needing Firestore composite indexes
  const q = query(collection(db, 'orders'));
  return onSnapshot(q, (snap) => {
    let results = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((o) => o.status === 'pending');
    if (eventId) {
      results = results.filter((o) => o.eventId === eventId);
    }
    results.sort((a, b) => {
      const da = a.createdAt?.toDate?.() || new Date(0);
      const db2 = b.createdAt?.toDate?.() || new Date(0);
      return da - db2;
    });
    callback(results);
  });
}

export function subscribeCompletedOrders(callback) {
  const q = query(collection(db, 'orders'));
  return onSnapshot(q, (snap) => {
    const results = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((o) => o.status === 'completed')
      .sort((a, b) => {
        const da = a.completedAt?.toDate?.() || new Date(0);
        const db2 = b.completedAt?.toDate?.() || new Date(0);
        return db2 - da;
      });
    callback(results);
  });
}

export async function createOrder(order) {
  const data = {
    ...order,
    status: 'pending',
    createdAt: serverTimestamp(),
    completedAt: null,
  };
  const ref = await addDoc(collection(db, 'orders'), data);
  return ref.id;
}

export async function completeOrder(id) {
  await updateDoc(doc(db, 'orders', id), {
    status: 'completed',
    completedAt: serverTimestamp(),
  });
}

// --- Config ---

export async function getConfig() {
  const snap = await getDoc(doc(db, 'config', 'settings'));
  return snap.exists() ? snap.data() : null;
}

export async function setConfig(data) {
  await setDoc(doc(db, 'config', 'settings'), data, { merge: true });
}

// --- PIN helpers ---

export async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPin(pin) {
  const config = await getConfig();
  if (!config?.adminPin) return false;
  const hashed = await hashPin(pin);
  return hashed === config.adminPin;
}

export { db, Timestamp, serverTimestamp };
