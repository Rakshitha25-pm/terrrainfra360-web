/**
 * Shortlist (favorites) persistence at /users/{uid}/shortlist/{propertyId}.
 *
 * Silently no-ops for guests — the UI keeps a local in-memory set so the
 * heart toggles work visually for signed-out users, but nothing persists.
 *
 * Doc shape mirrors the Flutter app exactly so a price-drop Cloud Function
 * can run a collectionGroup query across all users.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { auth, db } from '../../../lib/firebase';

/**
 * Subscribe to the live set of shortlisted IDs for the current user.
 * Emits an empty set when signed out. Re-subscribes on auth changes.
 *
 * Returns an unsubscribe function.
 */
export function shortlistedIdsStream(
  onData: (ids: Set<string>) => void,
): () => void {
  let innerUnsub: (() => void) | null = null;

  const outerUnsub = onAuthStateChanged(auth, (user) => {
    innerUnsub?.();
    innerUnsub = null;
    if (!user) {
      onData(new Set());
      return;
    }
    const col = collection(db, 'users', user.uid, 'shortlist');
    innerUnsub = onSnapshot(col, (snap) => {
      const ids = new Set<string>();
      snap.forEach((d) => ids.add(d.id));
      onData(ids);
    });
  });

  return () => {
    innerUnsub?.();
    outerUnsub();
  };
}

export function shortlistAvailable(): boolean {
  return !!auth.currentUser;
}

/** Toggle in/out of the shortlist. No-op for guests. */
export async function toggleShortlist(propertyId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const ref = doc(db, 'users', user.uid, 'shortlist', propertyId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
  } else {
    await setDoc(ref, {
      propertyId,
      shortlistedAt: serverTimestamp(),
    });
  }
}

export async function addToShortlist(propertyId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, 'users', user.uid, 'shortlist', propertyId), {
    propertyId,
    shortlistedAt: serverTimestamp(),
  });
}

export async function removeFromShortlist(propertyId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  await deleteDoc(doc(db, 'users', user.uid, 'shortlist', propertyId));
}
