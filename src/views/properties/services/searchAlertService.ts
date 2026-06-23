/**
 * "Watch this area" search alerts. When a search returns no/few results, we
 * offer to save it; a Cloud Function later notifies the user when a matching
 * property is posted. Stored at /users/{uid}/searchAlerts/{alertId}.
 */
import {
  addDoc,
  collection,
  getDocs,
  limit as fbLimit,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { auth, db } from '../../../lib/firebase';

export interface SaveAlertInput {
  query: string;
  pincode?: string;
  category?: string;
  intent?: string;
  maxPrice?: number;
}

/** Stable matching key — lowercase, single-spaced, trimmed. */
export function areaKeyFor(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function searchAlertAvailable(): boolean {
  return !!auth.currentUser;
}

/** Returns true if the user already has an alert for this exact area key. */
export async function hasAlertFor(q: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  const key = areaKeyFor(q);
  if (!key) return false;
  const snap = await getDocs(
    query(
      collection(db, 'users', user.uid, 'searchAlerts'),
      where('areaKey', '==', key),
      fbLimit(1),
    ),
  );
  return !snap.empty;
}

/**
 * Save a new alert. Returns true on success, false if not signed in or query
 * empty. No-ops silently for guests.
 */
export async function saveAlert(input: SaveAlertInput): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  const q = input.query.trim();
  if (!q) return false;
  const key = areaKeyFor(q);
  try {
    await addDoc(collection(db, 'users', user.uid, 'searchAlerts'), {
      uid: user.uid,
      query: q,
      areaKey: key,
      pincode: input.pincode ?? '',
      category: input.category ?? '',
      intent: input.intent ?? '',
      maxPrice: input.maxPrice ?? 0,
      active: true,
      createdAt: serverTimestamp(),
      lastNotifiedAt: null,
    });
    return true;
  } catch {
    return false;
  }
}
