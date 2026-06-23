// Shared submission for every service RFQ flow. Before this, the flows only
// generated a number and showed a success screen — nothing was ever saved.
// This persists the request locally (so it is never lost and can be shown in
// the profile's "My Service / Quote Requests"), and makes a best-effort cloud
// write to `service_requests` (ignored if rules disallow or the user is not
// signed in).
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const KEY = 'tf360_service_rfqs_v1';

export interface ServiceRFQ {
  service: string;
  rfqNumber: string;
  createdAt: number;
  data: Record<string, unknown>;
}

export function submitServiceRFQ(service: string, data: Record<string, unknown>): string {
  const rfqNumber =
    (data.rfqNumber as string) || 'TF-RFQ-' + Date.now().toString(36).toUpperCase();
  const record: ServiceRFQ = { service, rfqNumber, createdAt: Date.now(), data };

  // Always persist locally so a submission is never lost.
  try {
    const list: ServiceRFQ[] = JSON.parse(localStorage.getItem(KEY) || '[]');
    list.unshift(record);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
    try { window.dispatchEvent(new CustomEvent('tf360-notif')); } catch {}
  } catch {
    /* noop */
  }

  // Best-effort cloud write (silently ignored if blocked by rules / no auth).
  try {
    void addDoc(collection(db, 'service_requests'), {
      service,
      rfqNumber,
      ...data,
      userUid: auth.currentUser?.uid || null,
      userPhone: (data.userPhone as string) || null,
      createdAt: serverTimestamp(),
    }).catch(() => {});
  } catch {
    /* noop */
  }

  return rfqNumber;
}

export function loadServiceRFQs(): ServiceRFQ[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
