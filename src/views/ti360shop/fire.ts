// Live data from the TI360-Application Firebase backend (project tf360-360).
// Reads the same b2b_products collection the Flutter app uses.
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, collectionGroup, getDocs, getDoc, doc, setDoc, addDoc, deleteDoc, updateDoc, onSnapshot, query, where, orderBy, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
import { BProduct } from './shared';

const cfg = {
  apiKey: 'AIzaSyBE4CrdpZsRRacqLBy6sy4AcM7Mlm9sCAA',
  appId: '1:563072496316:web:489e12d0fe6b9f326c16b9',
  messagingSenderId: '563072496316',
  projectId: 'tf360-360',
  authDomain: 'tf360-360.firebaseapp.com',
  storageBucket: 'tf360-360.firebasestorage.app',
};

// Out-of-stock rule, identical to the app's ProductModel.isOutOfStock:
//   flag = data['inStock'] ?? data['available']; stockQty read from any of
//   stockQty/stock/quantity/qtyAvailable/inventory. Out of stock when the flag
//   is false OR the resolved quantity is <= 0.
const toNum = (v: any): number | null => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) return Number(v);
  return null;
};
const stockQtyOf = (m: any): number | null => {
  for (const k of ['stockQty', 'stock', 'quantity', 'qtyAvailable', 'inventory']) {
    const n = toNum(m?.[k]); if (n !== null) return n;
  }
  return null;
};
const outOfStockOf = (m: any): boolean => {
  if ((m?.inStock ?? m?.available) === false) return true;
  const q = stockQtyOf(m);
  return q !== null && q <= 0;
};
const PH = 'data:image/svg+xml;utf8,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='400' height='320'><rect width='400' height='320' fill='#161616'/><rect x='150' y='105' width='100' height='100' rx='14' fill='none' stroke='#f97316' stroke-width='6' opacity='0.5'/></svg>");

const MU = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=600`;
const CURATED: [RegExp, string][] = [
  [/door|window/i, MU('photo-1558997519-83ea9252edf8')],
  [/hvac|cooling|\bair\b|ventil/i, MU('photo-1581092160562-40aa08e78837')],
  [/hardware|fastener|tool/i, MU('photo-1504148455328-c376907d081c')],
  [/lighting|switch/i, MU('photo-1558002038-1055907df827')],
  [/electric|wiring|distribution|backup|power/i, MU('photo-1558002038-1055907df827')],
  [/interior|decor|furnish|modular|joinery/i, MU('photo-1586023492125-27b2c045efd7')],
  [/paint|surface finish/i, MU('photo-1589939705384-5185137a7f0f')],
  [/plumb|sanitary|bath|water supply|fitting/i, MU('photo-1585704032915-c3400ca199e7')],
  [/roof/i, MU('photo-1632759145351-1d592919f522')],
  [/safety|security|building system/i, MU('photo-1581092160562-40aa08e78837')],
  [/tile|floor|cladding/i, MU('photo-1502005229762-cf1b2da7c5d6')],
  [/waterproof|chemical|adhesive|sealant/i, MU('photo-1517089596392-fb9a9033e05b')],
  [/ceiling|partition|drywall/i, MU('photo-1503387762-592deb58ef4e')],
  [/structural|civil|cement|concrete|steel|brick/i, MU('photo-1504307651254-35680f356dfd')],
  [/outdoor|landscap|lift|garden/i, MU('photo-1416879595882-3373a0480b5b')],
];
export function macroImage(name: string, url?: string): string {
  if (url && (url.includes('images.unsplash.com') || url.includes('firebasestorage') || url.includes('googleusercontent'))) return url;
  if (url && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url) && !url.includes('/photos/')) return url;
  for (const [re, img] of CURATED) if (re.test(name || '')) return img;
  return MU('photo-1503387762-592deb58ef4e');
}

export async function fetchLiveB2BProducts(): Promise<BProduct[] | null> {
  const app = getApps()[0] ?? initializeApp(cfg);
  const db = getFirestore(app);
  // 1) True wholesale collection (needs an approved signed-in member, like the app)
  try {
    const snap = await getDocs(collection(db, 'b2b_products'));
    const out: BProduct[] = [];
    snap.forEach(d => {
      const m: any = d.data();
      const tiers = Array.isArray(m.priceTiers)
        ? m.priceTiers.map((t: any) => ({ qty: Number(t.qty) || 1, pricePerUnit: Number(t.pricePerUnit) || 0 })).filter((t: any) => t.pricePerUnit > 0)
        : [];
      const imgs = Array.isArray(m.imageUrls) && m.imageUrls.length ? m.imageUrls : (m.imageUrl ? [m.imageUrl] : []);
      const unit = Number(m.pricePerUnit) || Number(m.vendorPrice) || tiers[0]?.pricePerUnit || 0;
      if (!unit && !tiers.length && !outOfStockOf(m)) return;
      out.push({
        id: d.id, title: m.title || m.productName || 'Product', brand: m.brand || undefined,
        description: m.description || '', bullets: Array.isArray(m.bullets) ? m.bullets : [],
        imageUrls: imgs.length ? imgs : [PH], minOrderQty: Number(m.minOrderQty) || 1,
        priceTiers: tiers.length ? tiers : [{ qty: Number(m.minOrderQty) || 1, pricePerUnit: unit }],
        gstPercent: Number(m.gstPercent) || 18,
        vendorId: m.vendorId || m.vendorUid || '', inStock: !outOfStockOf(m), outOfStock: outOfStockOf(m),
        vendorBusinessName: m.vendorBusinessName || 'Verified Vendor',
        macroId: m.macroId || m.categoryId || 'electrical',
      });
    });
    if (out.length) return out;
  } catch { console.warn('[TI360] b2b_products needs an approved sign-in — deriving wholesale view from public catalogue'); }
  // 2) Fallback: full public catalogue (same products, with vendor names) -> wholesale view
  try {
    const snap = await getDocs(collection(db, 'products'));
    const out: BProduct[] = [];
    snap.forEach(d => {
      const m: any = d.data();
      const unit = Number(m.vendorPrice) || Number(m.sellingPrice) || Number(m.finalPrice) || Number(m.price) || Number(m.mrp) || 0;
      if (!unit && !outOfStockOf(m)) return;
      const imgs = (Array.isArray(m.imageUrls) && m.imageUrls.length ? m.imageUrls : [m.imageUrl, m.image1Url].filter(Boolean)) as string[];
      let h = 0; for (const c of d.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const moq = [10, 14, 24, 32, 45, 50, 96][h % 7];
      out.push({
        id: d.id, title: m.title || 'Product', brand: m.brand || undefined,
        description: m.description || '', bullets: Array.isArray(m.bullets) ? m.bullets : [],
        imageUrls: imgs.length ? imgs : [PH], minOrderQty: moq,
        priceTiers: [{ qty: moq, pricePerUnit: unit }, { qty: moq * 4, pricePerUnit: Math.round(unit * 0.95) }],
        gstPercent: Number(m.gstPercent) || 18,
        vendorId: m.vendorId || m.vendorUid || '', inStock: !outOfStockOf(m), outOfStock: outOfStockOf(m),
        vendorBusinessName: m.vendorBusinessName || 'Verified Vendor',
        macroId: m.macroId || m.categoryId || 'misc',
      });
    });
    return out.length ? out : null;
  } catch (e) { console.warn('[TI360] live b2b unavailable:', e); return null; }
}

// --- Auth (same Firebase project as the app; b2b_products needs an APPROVED member account) ---
import { getAuth, setPersistence, browserLocalPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, type User } from 'firebase/auth';
const app2 = () => getApps()[0] ?? initializeApp(cfg);
const safeAuth = () => { try { return getAuth(app2()); } catch (e) { console.warn('[TI360] auth init failed:', e); return null; } };
export const loginEmail = async (e: string, p: string) => { const a = safeAuth(); if (!a) throw new Error('auth-unavailable'); try { await setPersistence(a, browserLocalPersistence); } catch {} return signInWithEmailAndPassword(a, e, p); };
export const loginGoogle = async () => { const a = safeAuth(); if (!a) throw new Error('auth-unavailable'); try { await setPersistence(a, browserLocalPersistence); } catch {} return signInWithPopup(a, new GoogleAuthProvider()); };
export const fireSignOut = () => { const a = safeAuth(); return a ? signOut(a) : Promise.resolve(); };
export const watchAuth = (cb: (u: User | null) => void) => { try { const a = safeAuth(); if (!a) { cb(null); return () => {}; } return onAuthStateChanged(a, cb); } catch (e) { console.warn('[TI360] watchAuth failed:', e); cb(null); return () => {}; } };
export const currentUser = (): User | null => { const a = safeAuth(); return a ? a.currentUser : null; };

// Product reviews -- public read, signed-in create (product_reviews, same as the app).
export function watchReviews(productId: string, cb: (rows: any[]) => void): Unsubscribe {
  try {
    return onSnapshot(query(collection(fdb(), 'product_reviews'), where('productId', '==', productId)),
      snap => { const r: any[] = []; snap.forEach(d => r.push({ id: d.id, ...d.data() })); r.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)); cb(r); },
      () => cb([]));
  } catch { cb([]); return () => {}; }
}
export async function submitReview(uid: string, userName: string, productId: string, rating: number, text: string, images?: string[]): Promise<{ ok: boolean; error?: string }> {
  try { await addDoc(collection(fdb(), 'product_reviews'), { productId, userId: uid, userName: userName || 'Customer', rating, text: text || '', images: images || [], createdAt: serverTimestamp() }); return { ok: true }; }
  catch (e: any) { console.warn('[TI360] review submit failed:', e); return { ok: false, error: e?.code || String(e?.message || e) }; }
}
export async function deleteReview(reviewId: string): Promise<boolean> {
  try { await deleteDoc(doc(fdb(), 'product_reviews', reviewId)); return true; } catch (e) { console.warn('[TI360] review delete failed:', e); return false; }
}

// Bridge the home-page phone login to a REAL Firebase auth session so the backend
// (b2b_quote_requests, b2b_memberships) accepts writes. We map each phone to a
// deterministic email/password account (Email/Password provider is enabled on tf360-360).
const phoneEmail = (phone: string) => phone.replace(/[^0-9]/g, '') + '@phone.tf360web.app';
const phonePass = (phone: string) => 'Tf360Web!' + phone.replace(/[^0-9]/g, '');
export async function ensureAuthFromPhone(phone: string): Promise<{ user: User | null; error?: string }> {
  const a = safeAuth(); if (!a || !phone) return { user: null, error: !phone ? 'no-phone' : 'auth-unavailable' };
  if (a.currentUser) return { user: a.currentUser };
  const email = phoneEmail(phone), pass = phonePass(phone);
  try { await setPersistence(a, browserLocalPersistence); } catch {}
  try { const c = await signInWithEmailAndPassword(a, email, pass); return { user: c.user }; }
  catch (e: any) {
    const code = String(e?.code || e?.message || e);
    if (code.includes('user-not-found') || code.includes('invalid-credential') || code.includes('invalid-login-credentials')) {
      try { const c = await createUserWithEmailAndPassword(a, email, pass); return { user: c.user }; }
      catch (e2: any) { const c2 = String(e2?.code || e2?.message || e2); console.warn('[TI360] phone-bridge create failed:', c2); return { user: null, error: 'create:' + c2 }; }
    }
    console.warn('[TI360] phone-bridge sign-in failed:', code); return { user: null, error: 'signin:' + code };
  }
}

// --- Retail catalogue (collection 'products' + 'catalog_macros' — publicly readable) ---
import type { RProduct, Macro } from './shared';
export async function fetchLiveRetail(): Promise<{ products: RProduct[]; macros: Macro[] } | null> {
  try {
    const app = getApps()[0] ?? initializeApp(cfg);
    const db = getFirestore(app);
    const [ps, ms] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'catalog_macros')),
    ]);
    const macroDocs = ms.docs.filter(d => (d.data() as any).active !== false);
    const nmeOf = (d: any) => String((d.data() as any).name || d.id || '').trim();
    const elDoc = macroDocs.find(d => /electrical.*lighting/i.test(nmeOf(d)));
    const elId = elDoc ? elDoc.id : '';
    const genElecDoc = macroDocs.find(d => /^electrical$/i.test(nmeOf(d)));
    const dropId = elId && genElecDoc ? genElecDoc.id : ''; // drop generic "Electrical" only when "Electrical & Lighting" can absorb its products
    const macros: Macro[] = [];
    for (const d of macroDocs) {
      if (dropId && d.id === dropId) continue;
      const nm = nmeOf(d);
      macros.push({ id: d.id, name: nm, imageUrl: macroImage(nm, (d.data() as any).imageUrl) });
    }
    const macroIds = new Set(macros.map(x => x.id));
    const remapMacro = (mid: string): string => {
      const v = String(mid || '');
      if (elId && (v === dropId || /^electrical$/i.test(v.trim()))) return elId;
      return v;
    };
    const products: RProduct[] = [];
    ps.forEach(d => {
      const m: any = d.data();
      const price = Number(m.sellingPrice) || Number(m.finalPrice) || Number(m.price) || Number(m.mrp) || Number(m.vendorPrice) || 0;
      if (!price && !outOfStockOf(m)) return; // app keeps out-of-stock LIVE items even at price 0
      const imgs = (Array.isArray(m.imageUrls) && m.imageUrls.length ? m.imageUrls : [m.imageUrl, m.image1Url, m.image2Url].filter(Boolean)) as string[];
      let mid = remapMacro(m.macroId || m.categoryId || (macros[0]?.id ?? 'misc'));
      if (elId && !macroIds.has(mid) && /light|lamp|chandelier|pendant|\bled\b|bulb|sconce/i.test(String(m.title || ''))) mid = elId;
      products.push({
        id: d.id,
        title: m.title || 'Product',
        brand: m.brand || m.vendorBusinessName || undefined,
        description: m.description || '',
        bullets: Array.isArray(m.bullets) ? m.bullets : [],
        price,
        mrp: Number(m.mrp) || undefined,
        gstPercent: Number(m.gstPercent) || 18,
        imageUrls: imgs.length ? imgs : [PH],
        macroId: mid,
        deliveryDays: Number(m.delivery) || 3,
        variants: m.variantsEnabled && Array.isArray(m.variants)
          ? m.variants.map((v: any, i: number) => ({ id: v.id || String(i), label: v.label || `Option ${i + 1}`, price: Number(v.finalPrice) || Number(v.pricePerUnit) || price, mrp: Number(v.mrp) || undefined }))
          : undefined,
        rating: 4.6, reviews: 120,
        warranty: m.warranty || undefined,
        outOfStock: outOfStockOf(m),
      });
    });
    return products.length ? { products, macros: macros.length ? macros : undefined as any } : null;
  } catch (e) { console.warn('[TI360] live retail catalogue unavailable:', e); return null; }
}

// --- B2B membership workflow (b2b_memberships/{uid}, same as the app) ---
export async function fetchMembershipStatus(uid: string): Promise<string | null> {
  try {
    const db = getFirestore(getApps()[0] ?? initializeApp(cfg));
    const s = await getDoc(doc(db, 'b2b_memberships', uid));
    return s.exists() ? String((s.data() as any).status || 'PENDING').toUpperCase() : null;
  } catch { return null; }
}
// Live membership status (same as the app): fires whenever the admin approves/rejects.
export function watchMembership(uid: string, cb: (status: string | null) => void): Unsubscribe {
  try {
    const db = getFirestore(getApps()[0] ?? initializeApp(cfg));
    return onSnapshot(doc(db, 'b2b_memberships', uid),
      s => cb(s.exists() ? String((s.data() as any).status || 'PENDING').toUpperCase() : null),
      () => cb(null));
  } catch { cb(null); return () => {}; }
}
export interface MembershipInput { name: string; phone: string; businessName: string; gstAvailable: boolean; gstNumber?: string; noGstReason?: string; noGstReasonOther?: string }
export async function submitMembership(uid: string, m: MembershipInput): Promise<{ ok: boolean; error?: string }> {
  try {
    const db = getFirestore(getApps()[0] ?? initializeApp(cfg));
    const data: any = {
      uid, status: 'PENDING',
      name: m.name || '', phone: m.phone || '',
      businessName: m.businessName,
      gstAvailable: m.gstAvailable,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      source: 'builddirect_web',
    };
    if (m.gstAvailable) data.gstNumber = m.gstNumber;
    else { data.noGstReason = m.noGstReason; if (m.noGstReason === 'OTHER') data.noGstReasonOther = m.noGstReasonOther || ''; }
    await setDoc(doc(db, 'b2b_memberships', uid), data);
    return { ok: true };
  } catch (e: any) { console.warn('[TI360] membership submit failed:', e); return { ok: false, error: e?.code || String(e?.message || e) }; }
}


/* ───────────────────────────────────────────────────────────────
   BuildDirect backend service layer — real Firestore, same collections
   and document schemas as the TI360-Application Flutter app + Cloud Functions.
─────────────────────────────────────────────────────────────── */
const fdb = () => getFirestore(getApps()[0] ?? initializeApp(cfg));

/* Live b2b_products snapshot (falls back to public `products` if member-gated). */
export function watchB2BProducts(onData: (rows: BProduct[]) => void): Unsubscribe {
  try {
  const map = (m: any, id: string): BProduct | null => {
    const tiers = Array.isArray(m.priceTiers)
      ? m.priceTiers.map((t: any) => ({ qty: Number(t.qty) || 1, pricePerUnit: Number(t.pricePerUnit) || 0 })).filter((t: any) => t.pricePerUnit > 0)
      : [];
    const imgs = (Array.isArray(m.imageUrls) && m.imageUrls.length ? m.imageUrls : [m.imageUrl, m.image1Url].filter(Boolean)) as string[];
    const unit = Number(m.pricePerUnit) || Number(m.vendorPrice) || Number(m.sellingPrice) || Number(m.finalPrice) || tiers[0]?.pricePerUnit || 0;
    if (!unit && !tiers.length && !outOfStockOf(m)) return null;
    let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const moq = Number(m.minOrderQty) || [10, 14, 24, 32, 45, 50, 96][h % 7];
    return {
      id, title: m.title || m.productName || 'Product', brand: m.brand || undefined,
      description: m.description || '', bullets: Array.isArray(m.bullets) ? m.bullets : [],
      imageUrls: imgs.length ? imgs : [PH], minOrderQty: moq,
      priceTiers: tiers.length ? tiers : [{ qty: moq, pricePerUnit: unit }, { qty: moq * 4, pricePerUnit: Math.round(unit * 0.95) }],
      gstPercent: Number(m.gstPercent) || 18,
      vendorId: m.vendorId || m.vendorUid || '', inStock: !outOfStockOf(m), outOfStock: outOfStockOf(m),
        vendorBusinessName: m.vendorBusinessName || 'Verified Vendor',
      macroId: m.macroId || m.categoryId || 'misc',
    };
  };
  let unsub: Unsubscribe = () => {};
  const startPublic = () => {
    unsub = onSnapshot(collection(fdb(), 'products'), snap => {
      const rows: BProduct[] = [];
      snap.forEach(d => { const r = map(d.data(), d.id); if (r) rows.push(r); });
      if (rows.length) onData(rows);
    }, () => {});
  };
  unsub = onSnapshot(collection(fdb(), 'b2b_products'),
    snap => {
      if (snap.empty) { unsub(); startPublic(); return; }
      const rows: BProduct[] = [];
      snap.forEach(d => { const r = map(d.data(), d.id); if (r) rows.push(r); });
      if (rows.length) onData(rows);
    },
    () => { startPublic(); });   // permission denied (not an approved member) -> public catalogue
  return () => unsub();
  } catch (e) { console.warn('[TI360] watchB2BProducts failed:', e); return () => {}; }
}

/* Negotiation: write a b2b_quote_requests doc exactly as the app does so the
   onB2BQuoteRequestCreated Cloud Function emails the vendor a PDF + tracking pixel. */
export interface QuoteItem { productId: string; name: string; qty: number; unitPrice: number; lineTotal: number; targetUnitPrice?: number; targetLineTotal?: number }
export async function submitQuoteRequest(p: {
  user: User; membershipBusinessName?: string; membershipGst?: string;
  vendorId: string; vendorName: string; productId: string; productName: string;
  minOrderQty: number; requestedQty: number; targetPricePerUnit: number;
  notes: string; baselineTotal: number; buyerOfferTotal: number; buyerNote?: string;
  items: QuoteItem[]; perProduct: boolean;
}): Promise<string | null> {
  try {
    const prices = p.items.map(i => i.targetUnitPrice ?? i.unitPrice).filter(Boolean);
    const ref = await addDoc(collection(fdb(), 'b2b_quote_requests'), {
      userUid: p.user.uid, userName: p.user.displayName || '', userEmail: p.user.email || '', userPhone: (p.user as any).phoneNumber || '',
      membershipBusinessName: p.membershipBusinessName || '', membershipGst: p.membershipGst || '',
      vendorId: p.vendorId, vendorName: p.vendorName,
      productId: p.productId, productName: p.productName,
      minOrderQty: p.minOrderQty, requestedQty: p.requestedQty, targetPricePerUnit: p.targetPricePerUnit,
      targetPriceMin: prices.length ? Math.min(...prices) : p.targetPricePerUnit,
      targetPriceMax: prices.length ? Math.max(...prices) : p.targetPricePerUnit,
      notes: p.notes, source: 'builddirect_single_source', status: 'OPEN',
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      baselineTotal: p.baselineTotal, buyerOfferTotal: p.buyerOfferTotal, buyerNote: p.buyerNote || '',
      items: p.items, itemCount: p.items.length,
    });
    return ref.id;
  } catch (e) { console.warn('[TI360] quote write failed (sign in as approved member):', e); return null; }
}

/* Live stream of the buyer's own quote requests -> drives lockedProductIds + status panels. */
export function watchMyQuotes(uid: string, cb: (rows: any[]) => void): Unsubscribe {
  try {
    const q = query(collection(fdb(), 'b2b_quote_requests'), where('userUid', '==', uid), where('source', '==', 'builddirect_single_source'));
    return onSnapshot(q, snap => {
      const rows: any[] = [];
      snap.forEach(d => { const m: any = d.data(); rows.push({ id: d.id, ...m, updatedAtMs: m.updatedAt?.toMillis?.() ?? Date.now() }); });
      rows.sort((a, b) => (b.updatedAtMs) - (a.updatedAtMs));
      cb(rows);
    }, () => cb([]));
  } catch { cb([]); return () => {}; }
}

/* Notifications: merge users/{uid}/notifications + quote status changes. */
export function watchNotifications(uid: string, cb: (rows: any[]) => void): Unsubscribe {
  const subs: Unsubscribe[] = [];
  let notes: any[] = [], quotes: any[] = [];
  const emit = () => {
    const merged = [
      ...notes.filter(n => n.type !== 'b2b_negotiation'),
      ...quotes.filter(q => q.status && q.status !== 'OPEN').map(q => ({
        id: 'q_' + q.id, type: 'quote', title: q.status === 'COUNTERED' ? 'Vendor sent a counter-offer' : q.status === 'APPROVED' || q.status === 'ACCEPTED' ? 'Offer approved' : q.status === 'REJECTED' ? 'Offer not approved' : 'Vendor reviewed your offer',
        body: `${q.vendorName} · ${q.productName}`, createdAtMs: q.updatedAtMs, quoteId: q.id,
      })),
    ];
    merged.sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
    cb(merged);
  };
  try {
    subs.push(onSnapshot(collection(fdb(), 'users', uid, 'notifications'), snap => {
      notes = []; snap.forEach(d => { const m: any = d.data(); notes.push({ id: d.id, ...m, createdAtMs: m.createdAt?.toMillis?.() ?? Date.now() }); }); emit();
    }, () => { notes = []; emit(); }));
  } catch {}
  subs.push(watchMyQuotes(uid, rows => { quotes = rows; emit(); }));
  return () => subs.forEach(u => u());
}

/* Out-of-stock watcher row (onB2BProductRestockedNotify fans this out later). */
export async function writeStockAlert(uid: string, email: string, product: { id: string; title: string; image: string }) {
  try { await setDoc(doc(fdb(), 'stock_alerts', `${uid}_${product.id}`), { productId: product.id, productTitle: product.title, productImage: product.image, userId: uid, userEmail: email, createdAt: serverTimestamp() }); return true; }
  catch (e) { console.warn('[TI360] stock alert failed:', e); return false; }
}

/* Addresses subcollection. */
export function watchAddresses(uid: string, cb: (rows: any[]) => void): Unsubscribe {
  try { return onSnapshot(collection(fdb(), 'users', uid, 'addresses'), snap => { const r: any[] = []; snap.forEach(d => r.push({ id: d.id, ...d.data() })); cb(r); }, () => cb([])); }
  catch { cb([]); return () => {}; }
}
export async function addAddressDoc(uid: string, a: any) { try { await addDoc(collection(fdb(), 'users', uid, 'addresses'), { ...a, createdAt: serverTimestamp() }); return true; } catch { return false; } }

/* Orders: write b2b_orders + subscribe a single order for the 5-stage tracker. */
export async function placeB2BOrder(payload: any): Promise<string | null> {
  try { const ref = await addDoc(collection(fdb(), 'b2b_orders'), { ...payload, status: 'PLACED', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); return ref.id; }
  catch (e) { console.warn('[TI360] order write failed:', e); return null; }
}
export function watchOrder(orderId: string, cb: (o: any | null) => void): Unsubscribe {
  try { return onSnapshot(doc(fdb(), 'b2b_orders', orderId), d => cb(d.exists() ? { id: d.id, ...d.data() } : null), () => cb(null)); }
  catch { cb(null); return () => {}; }
}

/* Cart + wishlist persisted to users/{uid}/* (best-effort; UI keeps a local mirror). */
export function watchCart(uid: string, cb: (rows: any[]) => void): Unsubscribe {
  try { return onSnapshot(collection(fdb(), 'users', uid, 'cart'), snap => { const r: any[] = []; snap.forEach(d => r.push({ productId: d.id, ...d.data() })); cb(r); }, () => cb([])); }
  catch { cb([]); return () => {}; }
}
export async function setCartDoc(uid: string, productId: string, qty: number) { try { await setDoc(doc(fdb(), 'users', uid, 'cart', productId), { qty, updatedAt: serverTimestamp() }); } catch {} }
export async function removeCartDoc(uid: string, productId: string) { try { await deleteDoc(doc(fdb(), 'users', uid, 'cart', productId)); } catch {} }
export function watchWishlist(uid: string, cb: (ids: string[]) => void): Unsubscribe {
  try { return onSnapshot(collection(fdb(), 'users', uid, 'wishlist'), snap => { const r: string[] = []; snap.forEach(d => r.push(d.id)); cb(r); }, () => cb([])); }
  catch { cb([]); return () => {}; }
}
export async function toggleWishlistDoc(uid: string, productId: string, on: boolean) { try { on ? await setDoc(doc(fdb(), 'users', uid, 'wishlist', productId), { addedAt: serverTimestamp() }) : await deleteDoc(doc(fdb(), 'users', uid, 'wishlist', productId)); } catch {} }

export async function setQuoteStatus(id: string, status: string) { try { await updateDoc(doc(fdb(), 'b2b_quote_requests', id), { status, updatedAt: serverTimestamp() }); return true; } catch { return false; } }


export async function fetchMacros(): Promise<{ id: string; name: string; imageUrl: string }[]> {
  try {
    const snap = await getDocs(collection(fdb(), 'catalog_macros'));
    const out: { id: string; name: string; imageUrl: string }[] = [];
    snap.forEach(d => { const m: any = d.data(); out.push({ id: d.id, name: m.name || d.id, imageUrl: macroImage(m.name || d.id, m.imageUrl) }); });
    return out;
  } catch { return []; }
}
