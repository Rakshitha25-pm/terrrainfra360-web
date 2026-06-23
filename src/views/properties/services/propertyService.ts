/**
 * Firestore + Storage layer for properties. Mirrors the Dart PropertyService:
 * - streamApprovedProperties: live feed of public/approved listings
 * - getPropertyById: one-shot deep-link fetch
 * - streamMyListings: owner-side stream by ownerUid
 * - uploadPropertyImages: sequential upload with progress callback
 * - updateListing / softDeleteListing: owner-side mutations
 *
 * Rules of thumb (from the Flutter side):
 *   • create one stream per screen and reuse the unsubscribe across the
 *     component's lifetime. Do not re-create on every render.
 *   • streams already skip soft-deleted docs (approvalStatus === 'deleted').
 */
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { db, storage } from '../../../lib/firebase';
import { propertyFromDoc, type PropertyModel } from '../types';

/** Live feed of public/approved listings. Subscribe once, unsubscribe on unmount. */
export function streamApprovedProperties(
  onData: (properties: PropertyModel[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    collection(db, 'properties'),
    where('approvalStatus', '==', 'approved'),
  );
  return onSnapshot(
    q,
    (snap) => {
      const items: PropertyModel[] = [];
      snap.forEach((d) => {
        const m = propertyFromDoc(d);
        if (m) items.push(m);
      });
      onData(items);
    },
    (err) => onError?.(err as Error),
  );
}

/** One-shot fetch by document id. Returns null if missing or unparseable. */
export async function getPropertyById(id: string): Promise<PropertyModel | null> {
  if (!id) return null;
  try {
    const snap = await getDoc(doc(db, 'properties', id));
    if (!snap.exists()) return null;
    return propertyFromDoc(snap);
  } catch {
    return null;
  }
}

/**
 * Owner-side stream. Matches by `ownerUid` (independent of phone formatting).
 * Excludes soft-deleted listings; newest first.
 */
export function streamMyListings(
  ownerUid: string,
  onData: (properties: PropertyModel[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    collection(db, 'properties'),
    where('ownerUid', '==', ownerUid),
  );
  return onSnapshot(
    q,
    (snap) => {
      const items: PropertyModel[] = [];
      snap.forEach((d) => {
        if (d.data()?.approvalStatus === 'deleted') return;
        const m = propertyFromDoc(d);
        if (m) items.push(m);
      });
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      onData(items);
    },
    (err) => onError?.(err as Error),
  );
}

/**
 * Upload property images sequentially. Calls `onProgress(completed, total)`
 * after every image so the UI can show "Uploading photo 2 of 5…".
 */
export async function uploadPropertyImages(
  propertyId: string,
  files: File[],
  onProgress?: (completed: number, total: number) => void,
): Promise<string[]> {
  const urls: string[] = [];
  const total = files.length;
  onProgress?.(0, total);
  for (let i = 0; i < total; i++) {
    const file = files[i];
    const r = ref(storage, `properties/${propertyId}/image_${i}.jpg`);
    const snap = await uploadBytes(r, file, { contentType: file.type || 'image/jpeg' });
    const url = await getDownloadURL(snap.ref);
    urls.push(url);
    onProgress?.(i + 1, total);
  }
  return urls;
}

/** Owner-side edit: price + purpose (no re-approval needed). */
export async function updateListing(
  id: string,
  finalPrice: number,
  listingPurpose: 'sale' | 'rent' | 'lease',
  priceUnit?: 'perAcre' | 'perSqFt',
): Promise<void> {
  const patch: Record<string, unknown> = {
    finalPrice,
    listingPurpose,
    updatedAt: serverTimestamp(),
  };
  if (priceUnit) patch.priceUnit = priceUnit;
  await updateDoc(doc(db, 'properties', id), patch);
}

/** Owner-side soft delete: hides the listing everywhere. */
export async function softDeleteListing(id: string, reason: string): Promise<void> {
  await updateDoc(doc(db, 'properties', id), {
    approvalStatus: 'deleted',
    deletionReason: reason,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
