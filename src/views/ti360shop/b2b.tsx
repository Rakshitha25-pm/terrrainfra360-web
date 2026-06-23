import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Search, Heart, ShoppingCart, ChevronRight, ChevronDown, Check, Plus, Minus, Trash2, SlidersHorizontal,
  ShieldCheck, Truck, Building2, BadgeCheck, Zap, LayoutGrid, X, Handshake, Lock, PackageCheck, Bell, Hourglass, MailCheck, XCircle, User, MapPin, Star, ZoomIn, ZoomOut
} from 'lucide-react';
import { MACROS, BPRODUCTS, RPRODUCTS, BProduct, fmt, useLocal, bProduct, tierPrice, saveOrder, newOrder, loadOrders } from './shared';
import { SearchBox, imgFallback, Toaster, say } from './retail';
import { fetchLiveB2BProducts, loginEmail, loginGoogle, watchAuth, fetchMembershipStatus, watchMembership, submitMembership,
  watchB2BProducts, watchMyQuotes, watchNotifications, submitQuoteRequest, setQuoteStatus, writeStockAlert, placeB2BOrder, watchOrder, fetchMacros, fireSignOut } from './fire';
import { replaceBProducts, replaceMacros } from './shared';
import { getLoggedInPhone } from '../../components/LoginModal';

type BDView = { t: 'home' } | { t: 'cat'; id: string } | { t: 'cats' } | { t: 'product'; id: string } | { t: 'negotiate'; id: string; qty: number } | { t: 'cart' } | { t: 'checkout' } | { t: 'wishlist' } | { t: 'search'; q: string } | { t: 'notifications' } | { t: 'order'; id: string } | { t: 'vendor'; name: string };
type BLine = { productId: string; qty: number };

const TICKER = ['TMT 500D ₹42,500/T ▲1.2%', 'OPC 53 ₹345/bag ▼0.4%', 'River Sand ₹2,100/unit ●0.0%', 'Aggregate ₹1,850/unit ▼2.1%', 'Copper Wire ₹612/kg ▲0.8%'];
const HERO = [
  { k: 'Supply Chain Optimized', t: 'UNIFIED PROCUREMENT', d: 'Bulk materials, industrial credit and logistics under one roof.' },
  { k: 'Institutional Financing', t: 'ZERO-GAP CREDIT', d: 'Net-30 credit lines for verified businesses.' },
  { k: 'Freight Redefined', t: 'GLOBAL LOGISTICS', d: 'Optimized route paths with live tracking.' },
];

const saveQuote = (q: any) => { try { const s = JSON.parse(localStorage.getItem('tf360_quotes_v1') || '[]'); s.unshift({ ...q, at: Date.now() }); localStorage.setItem('tf360_quotes_v1', JSON.stringify(s)); } catch {} };

export interface Nego { id: string; vendor: string; productIds: string[]; titles: string[]; baseline: number; offer: number; note?: string; status: 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'DECLINED'; counter?: number; counterNote?: string; at: number }
const NKEY = 'tf360_negos_v1';
const loadNegos = (): Nego[] => { try { return JSON.parse(localStorage.getItem(NKEY) || '[]'); } catch { return []; } };
const saveNegos = (n: Nego[]) => { try { localStorage.setItem(NKEY, JSON.stringify(n)); } catch {} };
// Simulated procurement desk: responds ~8s after submission (>=92% accepted, >=75% countered at midpoint, else declined)
const matureNegos = (): Nego[] => {
  if (LIVE_QUOTES) return LIVE_QUOTES;   // signed-in: real b2b_quote_requests drive every status panel + lock
  const n = loadNegos(); let ch = false;
  for (const x of n) {
    if (x.status === 'PENDING' && Date.now() - x.at > 8000) {
      const r = x.offer / x.baseline;
      if (r >= 0.92) x.status = 'ACCEPTED';
      else if (r >= 0.75) { x.status = 'COUNTERED'; x.counter = Math.round((x.offer + x.baseline) / 2); x.counterNote = 'Best we can do at current freight rates.'; }
      else x.status = 'DECLINED';
      ch = true;
    }
  }
  if (ch) saveNegos(n); return n;
};
const submitNego = (vendor: string, productIds: string[], titles: string[], baseline: number, offer: number, note?: string) => {
  const n = loadNegos();
  n.unshift({ id: String(Date.now()), vendor, productIds, titles, baseline, offer, note, status: 'PENDING', at: Date.now() });
  saveNegos(n);
};
let LIVE_QUOTES: Nego[] | null = null;
let LIVE_USER: any = null;
const mapStatus = (s: string): Nego['status'] => { const u = (s || 'OPEN').toUpperCase(); return u === 'COUNTERED' ? 'COUNTERED' : (u === 'APPROVED' || u === 'ACCEPTED') ? 'ACCEPTED' : (u === 'REJECTED' || u === 'DECLINED') ? 'DECLINED' : 'PENDING'; };
const mapQuote = (q: any): Nego => ({
  id: q.id, vendor: q.vendorName || 'Vendor',
  productIds: Array.isArray(q.items) && q.items.length ? q.items.map((i: any) => i.productId) : [q.productId],
  titles: Array.isArray(q.items) && q.items.length ? q.items.map((i: any) => i.name) : [q.productName],
  baseline: Number(q.baselineTotal) || 0, offer: Number(q.buyerOfferTotal) || 0, note: q.buyerNote,
  status: mapStatus(q.status), counter: Number(q.counterTotal ?? q.vendorCounterTotal ?? q.counterOfferTotal) || undefined,
  counterNote: q.counterNote || q.vendorNote, at: q.updatedAtMs || Date.now(),
});
const openNegoFor = (pid: string) => matureNegos().some(n => (n.status === 'PENDING' || n.status === 'COUNTERED') && n.productIds.includes(pid));

const VENDOR_META: Record<string, { city: string; rating: string; reviews: string; fulfilled: string; yrs: number }> = {
  'Orbilit Technology': { city: 'Mumbai, MH', rating: '4.6', reviews: '963', fulfilled: '904+', yrs: 9 },
  'Terra Materials Pvt Ltd': { city: 'Bengaluru, KA', rating: '4.8', reviews: '712', fulfilled: '650+', yrs: 6 },
  'Bharat Steel Corp': { city: 'Bengaluru, KA', rating: '4.7', reviews: '540', fulfilled: '480+', yrs: 7 },
  'AquaLine Solutions': { city: 'Pune, MH', rating: '4.5', reviews: '388', fulfilled: '310+', yrs: 4 },
  'ElectroHub': { city: 'Chennai, TN', rating: '4.7', reviews: '624', fulfilled: '560+', yrs: 5 },
  'SafeGuard PPE': { city: 'Bengaluru, KA', rating: '4.4', reviews: '215', fulfilled: '180+', yrs: 3 },
};
const vmeta = (v?: string | null) => VENDOR_META[v ?? ''] ?? { city: 'Bengaluru, KA', rating: '4.6', reviews: '500', fulfilled: '400+', yrs: 5 };

const TickerBar = () => {
  const [t, setT] = useState(0);
  useEffect(() => { const i = setInterval(() => setT(x => (x + 1) % TICKER.length), 3000); return () => clearInterval(i); }, []);
  return (
    <div className="overflow-hidden bg-[#0F172A] border-b border-emerald-500/15 px-4 py-1.5 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest shrink-0">BCI Live</span>
      <AnimatePresence mode="wait"><motion.span key={t} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="text-[10px] font-bold text-white/70 truncate">{TICKER[t]}</motion.span></AnimatePresence>
    </div>
  );
};

const BDHero = ({ onBrowse }: { onBrowse: () => void }) => {
  const [h, setH] = useState(0);
  useEffect(() => { const i = setInterval(() => setH(x => (x + 1) % HERO.length), 5000); return () => clearInterval(i); }, []);
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F172A] to-black border border-emerald-500/15 p-6 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-5 items-center">
      <div className="relative z-10 min-h-[120px]">
        <AnimatePresence mode="wait">
          <motion.div key={h} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.45 }}>
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.25em] mb-2">{HERO[h].k}</p>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none mb-2">{HERO[h].t}</h2>
            <p className="text-[11px] text-white/50 max-w-xs mb-4">{HERO[h].d}</p>
          </motion.div>
        </AnimatePresence>
        <button onClick={onBrowse} className="px-5 h-10 orange-gradient-bg text-white text-[10px] font-black uppercase tracking-wide rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2">Browse Verified Picks <ChevronRight size={13} /></button>
      </div>
      <div className="relative z-10 grid grid-cols-3 md:grid-cols-1 gap-2">
        {[['6+', 'Bulk SKUs live'], ['100%', 'GST-verified vendors'], ['~18%', 'Avg. bulk savings']].map(([n, l]) => (
          <div key={l} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
            <p className="text-lg font-black text-emerald-400 leading-none">{n}</p>
            <p className="text-[8px] font-black uppercase tracking-wide text-white/40 mt-1">{l}</p>
          </div>
        ))}
      </div>
      <Zap size={220} className="absolute -right-12 -top-12 text-emerald-500/5 pointer-events-none" fill="currentColor" />
    </div>
  );
};

/* ── B2B entry: gate disabled, opens shop directly ── */
function Onboarding({ mem, user, remote, onApply, onBack }: any) {
  const [f, setF] = useState({ name: mem.name ?? '', phone: mem.phone ?? '', business: mem.business ?? '', hasGst: true, gstin: mem.gstin ?? '', reason: 'LABOUR_CONTRACTOR', reasonOther: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const gstOk = !f.hasGst || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/.test(f.gstin.toUpperCase());
  const reasonOk = f.hasGst || f.reason !== 'OTHER' || f.reasonOther.trim().length > 0;
  const ready = f.name && f.business && (!f.hasGst || gstOk) && reasonOk;
  const REASONS: [string, string][] = [['LABOUR_CONTRACTOR', 'Labour contractor'], ['INDEPENDENT_SOURCER', 'Sourcing for a client'], ['INDEPENDENT_PURCHASE_MANAGER', 'Purchase manager'], ['RETAIL_RESALE_BUYER', 'Buying for resale'], ['OTHER', 'Other']];
  const submit = async () => {
    setBusy(true); setErr('');
    try {
      await onApply({ name: f.name, phone: f.phone, businessName: f.business, gstAvailable: f.hasGst, gstNumber: f.gstin.toUpperCase(), noGstReason: f.reason, noGstReasonOther: f.reasonOther });
    } catch (e: any) {
      const c = e?.code || String(e?.message || e);
      setErr(c.includes('not-signed-in') ? 'Saved. To send this to our team, sign in once from your account (person icon on the shop home), then submit again.' : c.includes('permission') ? 'The backend rejected it — check your business details / GST.' : 'Could not submit: ' + c);
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="sticky top-0 z-50 bg-black/95 border-b border-white/8 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full border border-white/10 text-white/50 hover:text-orange-500 flex items-center justify-center"><ArrowLeft size={17} /></button>
        <span className="font-black text-sm">TerraInfra <span className="text-orange-500">Business</span></span>
      </div>
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-black mb-1">Tell us about your business</h1>
        <p className="text-xs text-white/40 mb-6">Our team reviews each application. Your wholesale shop unlocks once approved.</p>
        {user && (
          <div className="mb-5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] leading-relaxed">
            <span className="text-white/40">Signed in as </span><span className="font-bold text-white">{user.email || user.uid?.slice(0, 10)}</span>
            <span className="text-white/40"> &middot; this account&apos;s status: </span>
            <span className="font-black text-orange-400">{remote || 'NO APPLICATION YET'}</span>
            <p className="text-white/35 mt-1">Approval is granted to <b>this exact account</b>. If you approved a different account in the admin, sign in with that one instead.</p>
          </div>
        )}
        <div className="space-y-3">
          <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Your name" className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-orange-500/50" />
          <input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="Phone" className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-orange-500/50" />
          <input value={f.business} onChange={e => setF({ ...f, business: e.target.value })} placeholder="Business name" className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-orange-500/50" />
          <button onClick={() => setF({ ...f, hasGst: !f.hasGst })} className="w-full flex items-center justify-between px-4 py-3 bg-[#111] border border-white/10 rounded-xl">
            <span className="text-xs font-bold">I have a GST number</span>
            <span className={`w-10 h-6 rounded-full relative transition-colors ${f.hasGst ? 'bg-orange-500' : 'bg-white/15'}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${f.hasGst ? 'left-5' : 'left-1'}`} /></span>
          </button>
          {f.hasGst ? (<>
            <input value={f.gstin} maxLength={15} onChange={e => setF({ ...f, gstin: e.target.value.toUpperCase() })} placeholder="GSTIN (15 characters)" className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-xs tracking-widest focus:outline-none focus:border-orange-500/50" />
            {f.gstin && !gstOk && <p className="text-[10px] text-red-400 font-bold">Enter a valid 15-character GSTIN.</p>}
          </>) : (<>
            <select value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })} className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-xs focus:outline-none">
              {REASONS.map(([v, l]) => <option key={v} value={v} className="bg-[#111]">{l}</option>)}
            </select>
            {f.reason === 'OTHER' && <input value={f.reasonOther} onChange={e => setF({ ...f, reasonOther: e.target.value })} placeholder="Tell us why you need wholesale access" className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-orange-500/50" />}
          </>)}
          {err && <p className="text-[11px] font-bold text-red-400">{err}</p>}
          <button disabled={!ready || busy} onClick={submit} className="w-full h-12 orange-gradient-bg text-white text-[11px] font-black uppercase tracking-wide rounded-xl disabled:opacity-30">{busy ? 'Submitting…' : 'Submit Application'}</button>
        </div>
      </div>
    </div>
  );
}

function Pending({ mem, onEdit, onBack }: any) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="sticky top-0 z-50 bg-black/95 border-b border-white/8 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full border border-white/10 text-white/50 hover:text-orange-500 flex items-center justify-center"><ArrowLeft size={17} /></button>
        <span className="font-black text-sm">TerraInfra <span className="text-orange-500">Business</span></span>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <span className="w-16 h-16 rounded-full bg-orange-500/15 text-orange-400 mx-auto mb-5 flex items-center justify-center"><Hourglass size={28} /></span>
          <h1 className="text-xl font-black mb-2">Application under review</h1>
          <p className="text-xs text-white/50 leading-relaxed mb-6">Hi {mem.name || 'there'}, your application for <span className="text-white font-bold">{mem.business || 'your business'}</span> is with our admin team. You'll get access once approved.</p>
          <p className="text-[10px] text-white/35 font-bold mb-4">Approval is done by the TerraInfra admin team — this page unlocks automatically once approved.</p>
          <button onClick={onEdit} className="px-5 h-10 border border-white/15 text-white text-[10px] font-black uppercase rounded-xl">Edit application</button>
        </div>
      </div>
    </div>
  );
}

const SignInScreen = ({ onBack }: { onBack: () => void }) => {
  const [f, setF] = useState({ email: '', pass: '', err: '', busy: false });
  const go = async (g: boolean) => {
    setF(x => ({ ...x, busy: true, err: '' }));
    try { g ? await loginGoogle() : await loginEmail(f.email, f.pass); }
    catch (e: any) {
      const c = String(e?.code || e?.message || e);
      const msg = c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found') ? 'Email or password is incorrect. Check the spelling (e.g. .com not .ocm).'
        : c.includes('invalid-email') ? 'That email address looks malformed.'
        : c.includes('popup') ? 'Google sign-in was closed before finishing. Try again.'
        : 'Could not sign in: ' + c;
      setF(x => ({ ...x, err: msg, busy: false }));
    }
  };
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="sticky top-0 z-50 bg-black/95 border-b border-white/8 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full border border-white/10 text-white/50 hover:text-orange-500 flex items-center justify-center"><ArrowLeft size={17} /></button>
        <span className="font-black text-sm">TerraInfra <span className="text-orange-500">Business</span></span>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-black mb-1">Welcome back</h1>
          <p className="text-xs text-white/40 mb-6">One-time sign in with your TI360 account — you won't be asked again on this device.</p>
          <input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="Email" className="w-full mb-2.5 px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-orange-500/50" />
          <input type="password" value={f.pass} onChange={e => setF({ ...f, pass: e.target.value })} placeholder="Password" className="w-full mb-2.5 px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-xs focus:outline-none focus:border-orange-500/50" />
          {f.err && <p className="text-[10px] font-bold text-red-400 mb-2">{f.err}</p>}
          <button disabled={f.busy} onClick={() => go(false)} className="w-full h-12 orange-gradient-bg text-white text-[11px] font-black uppercase tracking-wide rounded-xl disabled:opacity-40">{f.busy ? 'Signing in…' : 'Sign In'}</button>
        </div>
      </div>
    </div>
  );
};

function NeedSignIn({ homePhone, onBack }: any) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="sticky top-0 z-50 bg-black/95 border-b border-white/8 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full border border-white/10 text-white/50 hover:text-orange-500 flex items-center justify-center"><ArrowLeft size={17} /></button>
        <span className="font-black text-sm">TerraInfra <span className="text-orange-500">Business</span></span>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <span className="w-16 h-16 rounded-full bg-orange-500/15 text-orange-400 mx-auto mb-5 flex items-center justify-center"><User size={28} /></span>
          <h1 className="text-xl font-black mb-2">Sign in to open TerraInfra Business</h1>
          <p className="text-xs text-white/50 leading-relaxed mb-5">Tap <b>Sign in</b> in the top navigation and sign in with your mobile number. Then open B2B &mdash; your admin-approved wholesale access opens automatically (same account as the app).</p>
          {homePhone && <p className="text-[10px] text-white/35 mb-5">Home login detected ({homePhone}) but the secure session is not active yet &mdash; sign in again from the top navigation.</p>}
          <button onClick={onBack} className="w-full h-12 orange-gradient-bg text-white text-[11px] font-black uppercase tracking-wide rounded-xl">Back to shop</button>
        </div>
      </div>
    </div>
  );
}

export function B2BGate({ onBack, onNeedSignIn }: { onBack: () => void; onNeedSignIn?: () => void }) {
  // App workflow: opening B2B shows the business onboarding (GST etc.) until you are an
  // admin-approved member (status read live from b2b_memberships/{uid}).
  const [user, setUser] = useState<any>(undefined);
  const [remote, setRemote] = useState<string | null | undefined>(undefined);
  const [mem, setMem] = useLocal<any>('tf360_b2b_membership_v1', { status: 'NONE' });
  const [submitted, setSubmitted] = useState(false); // true only AFTER a real Firestore write
  const homePhone = getLoggedInPhone();
  useEffect(() => {
    const t = setTimeout(() => setUser((u: any) => (u === undefined ? null : u)), 9000); // wait for the bridge / saved session
    let memUnsub: (() => void) | null = null;
    const unsub = watchAuth(u => {
      setUser(u ?? null);
      if (memUnsub) { memUnsub(); memUnsub = null; }
      if (u) memUnsub = watchMembership(u.uid, st => { setRemote(st); setMem((m: any) => ({ ...(m || {}), status: st || 'NONE' })); }); // LIVE: admin approval unlocks instantly
      else setRemote(null);
    });
    return () => { clearTimeout(t); unsub(); if (memUnsub) memUnsub(); };
  }, []);
  if (user === undefined) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
  );
  if (user && remote === undefined) return mem?.status === 'APPROVED'
    ? <BuildDirect onBack={onBack} />
    : <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  // Approval + pending come ONLY from the backend (b2b_memberships). 'submitted' is a real post-write flag.
  if (remote === 'APPROVED') return <BuildDirect onBack={onBack} />;
  if (remote === 'PENDING' || submitted) return <Pending mem={mem} onEdit={() => { setSubmitted(false); setMem({ status: 'NONE' }); }} onBack={onBack} />;
  // Backend requires an authenticated user to record an application -> sign in BEFORE the form (like the app).
  if (!user) return <NeedSignIn homePhone={homePhone} onBack={onBack} />;
  const onApply = async (d: any) => {
    const res = await submitMembership(user.uid, d);      // user guaranteed signed in here
    if (!res.ok) throw new Error(res.error || 'submit-failed');
    setMem({ name: d.name, phone: d.phone, business: d.businessName, gstin: d.gstNumber, status: 'PENDING' });
    setSubmitted(true);                                   // flips to Pending ONLY after the write succeeds
  };
  return <Onboarding mem={mem} user={user} remote={remote} onApply={onApply} onBack={onBack} />;
}

function BuildDirect({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<BDView>({ t: 'home' });
  const [cart, setCart] = useLocal<BLine[]>('tf360_bcart_v1', []);
  const [wish, setWish] = useLocal<string[]>('tf360_bwish_v1', []);
  const [addr, setAddr] = useLocal<any>('tf360_baddr_v1', null);

  const [, setLiveTick] = useState(0);
  const [live, setLive] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [lf, setLf] = useState({ email: '', pass: '', err: '', busy: false });
  const doLogin = async (g: boolean) => {
    setLf(x => ({ ...x, busy: true, err: '' }));
    try { g ? await loginGoogle() : await loginEmail(lf.email, lf.pass); setShowLogin(false); say('Signed in'); }
    catch (e: any) { setLf(x => ({ ...x, err: e?.code || 'Sign-in failed', busy: false })); return; }
    setLf(x => ({ ...x, busy: false }));
  };
  useEffect(() => {
    let unsubP = () => {}, unsubA = () => {};
    try {
      fetchMacros().then(ms => { if (ms.length) { replaceMacros(ms); setLiveTick(t => t + 1); } }).catch(() => {});
      unsubP = watchB2BProducts(list => {
        if (list && list.length) { replaceBProducts(list); setCart(cs => cs.filter(l => list.some(p => p.id === l.productId))); setLive(true); setLiveTick(t => t + 1); }
      });
      unsubA = watchAuth(u => { setMe(u); LIVE_USER = u; });
    } catch (e) { console.warn('[TI360] b2b live init failed:', e); }
    return () => { try { unsubP(); unsubA(); } catch {} };
  }, []);
  useEffect(() => {
    if (!me) { LIVE_QUOTES = null; setNotifs([]); setLiveTick(t => t + 1); return; }
    const u1 = watchMyQuotes(me.uid, rows => { LIVE_QUOTES = rows.map(mapQuote); setLiveTick(t => t + 1); });
    const u2 = watchNotifications(me.uid, setNotifs);
    return () => { u1(); u2(); };
  }, [me]);
  const sendOffer = async (vendor: string, items: any[], baseline: number, offer: number, note: string, perProduct: boolean) => {
    if (!me) { setShowLogin(true); say('Sign in with your TI360 account to send the offer to the vendor'); return; }
    const first = items[0]; const pp = bProduct(first.productId);
    const totalQty = Math.max(1, items.reduce((a, i) => a + i.qty, 0));
    const id = await submitQuoteRequest({
      user: me, vendorId: pp?.vendorId || vendor, vendorName: vendor,
      productId: perProduct && items.length === 1 ? first.productId : `SINGLE_SOURCE_BUNDLE_${pp?.vendorId || vendor}`,
      productName: perProduct && items.length === 1 ? first.name : `${items.length} items`,
      minOrderQty: Math.max(1, pp?.minOrderQty ?? 1), requestedQty: Math.max(first.qty, pp?.minOrderQty ?? 1),
      targetPricePerUnit: Math.max(1, Math.round(offer / totalQty)),
      notes: items.map(i => `${i.name} x${i.qty} = ₹${fmt(i.lineTotal)} → target ₹${fmt(i.targetLineTotal ?? i.lineTotal)}`).join('; '),
      baselineTotal: baseline, buyerOfferTotal: offer, buyerNote: note, items, perProduct,
    });
    if (id) say('Offer sent — the vendor has been emailed for review');
    else say('Could not send: your B2B membership must be admin-approved to negotiate');
  };

  const cartQty = cart.reduce((a, l) => a + l.qty, 0);
  const add = (id: string, qty: number) => { setCart(cs => { const k = cs.find(l => l.productId === id); if (k) return cs.map(l => l === k ? { ...l, qty: l.qty + qty } : l); return [...cs, { productId: id, qty }]; }); say('Added to procurement bag'); };
  const toggleWish = (id: string) => setWish(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  const lineTotal = (l: BLine) => tierPrice(bProduct(l.productId), l.qty) * l.qty;
  const subtotal = cart.reduce((a, l) => a + lineTotal(l), 0);
  const gst = cart.reduce((a, l) => a + lineTotal(l) * ((bProduct(l.productId).gstPercent ?? 18) / 100), 0);
  const delivery = subtotal > 50000 || subtotal === 0 ? 0 : 750;
  const total = subtotal + gst + delivery;

  /* header — emerald industrial console */
  const Header = () => (
    <div className="sticky top-0 z-[70] bg-black/95 backdrop-blur-xl border-b border-white/8">
      <TickerBar />
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <button onClick={() => view.t === 'home' ? onBack() : setView({ t: 'home' })} className="w-9 h-9 rounded-full border border-white/10 text-white/50 hover:text-emerald-400 hover:border-emerald-400 flex items-center justify-center"><ArrowLeft size={17} /></button>
        <button onClick={() => setView({ t: 'home' })} className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"><Building2 size={15} className="text-emerald-400" /></span>
          <span className="font-black text-sm text-white leading-none">TerraInfra <span className="text-emerald-400">Business</span><span className="block text-[7px] font-black uppercase tracking-[0.3em] text-white/30 mt-0.5">Wholesale Console</span></span>
        </button>
        {view.t !== 'cart' && view.t !== 'checkout' && (<SearchBox placeholder="Search wholesale materials…" onSubmit={sq => setView({ t: 'search', q: sq })} suggestions={BPRODUCTS.map(x => ({ id: x.id, title: x.title, image: x.imageUrls?.[0] }))} onPick={id => setView({ t: 'product', id })} />)}
        <button onClick={() => setView({ t: 'wishlist' })} className="relative p-2 text-white/60 hover:text-emerald-400"><Heart size={18} className={wish.length ? 'fill-red-500 text-red-500' : ''} />{wish.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black border border-black">{wish.length}</span>}</button>
        <button onClick={() => setView({ t: 'cart' })} className="relative p-2 text-white/60 hover:text-emerald-400">
          <ShoppingCart size={18} />
          {cart.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black border border-black">{cart.length}</span>}
        </button>
      </div>
    </div>
  );

  /* card — slate console card */
  const BCard = ({ p }: { p: BProduct }) => (
    <div className="bg-[#111] border border-white/8 rounded-xl overflow-hidden flex flex-col hover:border-emerald-500/30 transition-all">
      <div className="relative h-44 w-full overflow-hidden bg-[#0d0d0d] cursor-pointer" onClick={() => setView({ t: 'product', id: p.id })}>
        <img src={p.imageUrls[0]} referrerPolicy="no-referrer" alt="" onError={imgFallback} className="absolute inset-0 w-full h-full object-cover" />
        <span className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-500/90 text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase"><ShieldCheck size={9} /> Verified</span>
        <span className="absolute bottom-2 left-2 orange-gradient-bg text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">MOQ {fmt(p.minOrderQty)}</span>
        <button onClick={e => { e.stopPropagation(); toggleWish(p.id); }} className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border ${wish.includes(p.id) ? 'bg-red-500/15 border-red-500/40 text-red-500' : 'bg-black/60 border-white/10 text-white/50 hover:text-emerald-400'}`}><Heart size={13} fill={wish.includes(p.id) ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <p className="text-[9px] font-black text-white/40 tracking-[0.16em] uppercase h-3 truncate">{p.vendorBusinessName}</p>
        <p className="text-[12px] font-bold text-white leading-snug line-clamp-2 h-8 cursor-pointer hover:text-emerald-400" onClick={() => setView({ t: 'product', id: p.id })}>{p.title}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-black text-white">₹{fmt(tierPrice(p, p.minOrderQty))}</span>
          <span className="text-[10px] text-white/40 font-bold">/ unit</span>
        </div>
        <p className="text-[9px] text-emerald-400 font-bold h-4">MOQ {fmt(p.minOrderQty)} units</p>
        <div className="mt-auto pt-1.5">
          <button onClick={() => setView({ t: 'product', id: p.id })} className="w-full h-[30px] border border-emerald-500/60 text-emerald-400 text-[11px] font-bold rounded-full hover:bg-emerald-500/10 active:scale-95 transition-all">View Tiers →</button>
        </div>
      </div>
    </div>
  );

  const Grid = ({ ps }: { ps: BProduct[] }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{ps.map(p => <BCard key={p.id} p={p} />)}</div>
  );

  const Home = () => (
    <div className="max-w-7xl mx-auto px-4 pb-20 space-y-6 pt-4">
      <BDHero onBrowse={() => document.getElementById('bd-picks')?.scrollIntoView({ behavior: 'smooth' })} />
      {/* category chips -> open category page */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[9px] font-black text-emerald-400 tracking-[0.25em] uppercase">Our Expertise</p>
            <h2 className="text-xl font-black text-white tracking-tight">Specialized Inventory</h2>
          </div>
          <button onClick={() => setView({ t: 'cats' })} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 rounded-full text-[10px] font-black text-white uppercase tracking-wide shadow-lg shadow-emerald-500/20">
            <LayoutGrid size={12} /> Explore
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => setView({ t: 'cat', id: '__ALL__' })} className="shrink-0 flex flex-col items-center gap-1.5 w-[78px]">
            <span className="w-[74px] h-[74px] rounded-xl flex items-center justify-center bg-[#0F172A] border-2 border-white/10"><LayoutGrid size={24} className="text-white/60" /></span>
            <span className="text-[10px] font-extrabold text-white/60 leading-tight text-center">All</span>
          </button>
          {MACROS.map(m => (
            <button key={m.id} onClick={() => setView({ t: 'cat', id: m.id })} className="shrink-0 flex flex-col items-center gap-1.5 w-[78px]">
              <span className="w-[74px] h-[74px] rounded-xl overflow-hidden border-2 border-white/10">
                <img src={m.imageUrl} referrerPolicy="no-referrer" alt="" onError={imgFallback} className="w-full h-full object-cover" />
              </span>
              <span className="text-[10px] font-extrabold text-white/60 leading-tight text-center line-clamp-2">{m.name}</span>
            </button>
          ))}
        </div>
      </section>
      <section id="bd-picks">
        <h2 className="text-base font-black text-white mb-3 flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-400" /> Verified Picks</h2>
        <Grid ps={BPRODUCTS} />
      </section>
    </div>
  );

  const BrowseScreen = ({ macroId, q }: { macroId?: string; q?: string }) => {
    const PMAX = Math.max(...BPRODUCTS.map(p => tierPrice(p, p.minOrderQty)));
    const [cats, setCats] = useState<string[]>(macroId && macroId !== '__ALL__' ? [macroId] : []);
    const [vends, setVends] = useState<string[]>([]);
    const [maxP, setMaxP] = useState(PMAX);
    const [sort, setSort] = useState('rec');
    const [sortOpen, setSortOpen] = useState(false);
    const [showF, setShowF] = useState(false);
    const SORTS: [string, string][] = [['rec', 'Recommended'], ['plh', 'Unit Price: Low to High'], ['phl', 'Unit Price: High to Low'], ['moq', 'MOQ: Low to High']];
    const unit = (p: BProduct) => tierPrice(p, p.minOrderQty);
    const base = BPRODUCTS.filter(p => q ? (p.title + ' ' + (p.brand ?? '') + ' ' + (p.vendorBusinessName ?? '')).toLowerCase().includes(q.toLowerCase()) : true);
    const vendList = [...new Set(base.map(p => p.vendorBusinessName ?? ''))].filter(Boolean).sort();
    let ps = base.filter(p => (cats.length === 0 || cats.includes(p.macroId ?? '')) && (vends.length === 0 || vends.includes(p.vendorBusinessName ?? '')) && unit(p) <= maxP);
    if (sort === 'plh') ps = [...ps].sort((a, b2) => unit(a) - unit(b2));
    if (sort === 'phl') ps = [...ps].sort((a, b2) => unit(b2) - unit(a));
    if (sort === 'moq') ps = [...ps].sort((a, b2) => a.minOrderQty - b2.minOrderQty);
    const tgl = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
    const Box = ({ on }: { on: boolean }) => (
      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${on ? 'bg-emerald-500 border-emerald-500' : 'border-white/25'}`}>{on && <Check size={11} className="text-black" />}</span>
    );
    const title = q ? `Results for "${q}"` : (macroId && macroId !== '__ALL__' ? (MACROS.find(m => m.id === macroId)?.name ?? String(macroId).replace(/[-_]/g, ' ')) : 'All Lots');
    const active = cats.length + vends.length + (maxP < PMAX ? 1 : 0);
    return (
      <div className="max-w-7xl mx-auto px-4 pb-20 pt-5">
        <p className="text-[10px] text-white/40 font-bold mb-1">TerraInfra Business / Wholesale / <span className="text-white">{title}</span></p>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h1 className="text-lg font-black text-white">{title} <span className="text-white/40 text-xs font-bold">- {ps.length} lots</span></h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowF(f => !f)} className="lg:hidden h-9 px-4 bg-[#0F172A] border border-white/10 rounded-lg text-[11px] font-bold text-white flex items-center gap-2"><SlidersHorizontal size={12} /> Filters{active > 0 && <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[8px] font-black flex items-center justify-center">{active}</span>}</button>
            <div className="relative">
              <button onClick={() => setSortOpen(o => !o)} className="h-9 px-4 bg-[#0F172A] border border-white/10 rounded-lg text-[11px] text-white/60 flex items-center gap-2 hover:border-emerald-500/50">
                Sort by : <span className="font-black text-white">{SORTS.find(x => x[0] === sort)?.[1]}</span> <ChevronDown size={13} className={sortOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-10 z-40 w-60 bg-[#0F172A] border border-white/10 rounded-xl py-1.5 shadow-2xl">
                  {SORTS.map(([v, l]) => (
                    <button key={v} onClick={() => { setSort(v); setSortOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-wide flex items-center justify-between ${sort === v ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/50 hover:text-emerald-400'}`}>{l}{sort === v && <Check size={11} />}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 items-start">
          <aside className={`${showF ? 'block' : 'hidden'} lg:block bg-[#0F172A] border border-white/10 rounded-2xl p-4 lg:sticky lg:top-36`}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-white tracking-[0.15em]">FILTERS</p>
              {active > 0 && <button onClick={() => { setCats([]); setVends([]); setMaxP(PMAX); }} className="text-[9px] font-black text-emerald-400 uppercase hover:underline">Clear all</button>}
            </div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2.5">Departments</p>
            <div className="space-y-2 mb-5">
              {[...new Set(base.map(p => p.macroId ?? ''))].filter(Boolean).map(mid => { const n = base.filter(p => p.macroId === mid).length; const m = MACROS.find(x => x.id === mid) ?? { id: mid, name: String(mid).replace(/[-_]/g, ' '), imageUrl: '' }; return (
                <button key={m.id} onClick={() => tgl(cats, setCats, m.id)} className="flex items-center gap-2.5 w-full text-left group">
                  <Box on={cats.includes(m.id)} />
                  <span className="text-[11px] text-white/70 group-hover:text-white truncate">{m.name}</span>
                  <span className="text-[9px] text-white/30 font-bold">({n})</span>
                </button>
              ); })}
            </div>
            <div className="h-px bg-white/10 mb-4" />
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2.5">Vendor</p>
            <div className="space-y-2 mb-5">
              {vendList.map(v => { const n = base.filter(p => p.vendorBusinessName === v).length; return (
                <button key={v} onClick={() => tgl(vends, setVends, v)} className="flex items-center gap-2.5 w-full text-left group">
                  <Box on={vends.includes(v)} />
                  <span className="text-[11px] text-white/70 group-hover:text-white truncate">{v}</span>
                  <span className="text-[9px] text-white/30 font-bold">({n})</span>
                </button>
              ); })}
            </div>
            <div className="h-px bg-white/10 mb-4" />
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3">Unit Price</p>
            <input type="range" min={0} max={PMAX} step={10} value={maxP} onChange={e => setMaxP(Number(e.target.value))} className="w-full accent-emerald-500" />
            <p className="text-[10px] text-white/50 font-bold mt-1">₹0 – ₹{fmt(maxP)}{maxP >= PMAX ? '+' : ''} / unit</p>
          </aside>
          <div>
            {ps.length ? <Grid ps={ps} /> : (
              <div className="py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center"><Search size={24} className="text-white/30" /></div>
                <p className="text-white font-black mb-1">No matching lots</p>
                <p className="text-white/40 text-xs">Try clearing some filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ProductScreen = ({ id }: { id: string }) => {
    const p = bProduct(id);
    const [qty, setQty] = useState(p.minOrderQty);
    const [pin, setPin] = useState('560001');
    const [pinMsg, setPinMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [allBullets, setAllBullets] = useState(false);
    const [descOpen, setDescOpen] = useState(false);
    const [imgIdx, setImgIdx] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [zoom, setZoom] = useState(1);
    const retailMatch = RPRODUCTS.find(r => r.id === p.id) || RPRODUCTS.find(r => r.title === p.title);
    const gallery = [...new Set([...(Array.isArray(p.imageUrls) ? p.imageUrls : []), ...((retailMatch?.imageUrls) || [])])].filter(Boolean);
    useEffect(() => { setQty(p.minOrderQty); setAllBullets(false); setDescOpen(false); setImgIdx(0); setLightbox(false); setZoom(1); window.scrollTo({ top: 0 }); }, [id]);
    const unit = tierPrice(p, qty);
    const base = p.priceTiers[0]?.pricePerUnit ?? unit;
    const savings = (base - unit) * qty;
    const eta = new Date(Date.now() + 6 * 864e5).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    const checkPin = () => { const ok = /^[0-9]{6}$/.test(pin.trim()); setPinMsg(ok ? { ok: true, text: 'Serviceable - delivery confirmed by ' + eta } : { ok: false, text: 'Enter a valid 6-digit pincode' }); };
    const notify = () => { if (!me) { say('Sign in from your profile to get a restock alert'); return; } writeStockAlert(me.uid, me.email || '', { id: p.id, title: p.title, image: p.imageUrls[0] }); say('We will email you when this is back in stock'); };
    const bullets = Array.isArray(p.bullets) ? p.bullets : [];
    const shownBullets = allBullets ? bullets : bullets.slice(0, 2);
    const similar = BPRODUCTS.filter(x => x.macroId === p.macroId && x.id !== p.id).slice(0, 8);
    return (
      <div className="max-w-7xl mx-auto px-4 pb-28 pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div onClick={() => { setZoom(1); setLightbox(true); }} className="relative rounded-2xl overflow-hidden bg-[#111] border border-white/8 cursor-zoom-in group" style={{ aspectRatio: '1/1' }}>
              <img src={gallery[imgIdx] || p.imageUrls[0]} referrerPolicy="no-referrer" alt="" onError={imgFallback} className="w-full h-full object-cover" />
              {p.inStock === false && <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">Out of Stock</span>}
              <span className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ZoomIn size={16} /></span>
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">{gallery.map((g, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${imgIdx === i ? 'border-emerald-500' : 'border-white/10 opacity-60 hover:opacity-100'}`}><img src={g} referrerPolicy="no-referrer" onError={imgFallback} className="w-full h-full object-cover" /></button>
              ))}</div>
            )}
          </div>
          <div className="lg:col-span-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-orange-500 tracking-[0.2em] uppercase">{p.brand ?? 'Wholesale'}</span>
                <span className="bg-emerald-500/15 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Verified Vendor</span>
              </div>
              <h1 className="text-xl font-black text-white leading-tight">{p.title}</h1>
              <p className="text-[11px] font-black text-white/40 flex items-center gap-1.5 mt-2"><Star size={12} className="text-amber-400 fill-amber-400" /> 4.9 <span className="text-white/20">|</span> 1.2K REVIEWS <span className="text-white/20">|</span> <span className="text-emerald-400">VERIFIED STOCK</span></p>
            </div>
            {savings > 0 && <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-[11px] font-black text-emerald-400">YIELD SAVINGS &mdash; you save ₹{fmt(savings)} at this volume</div>}
            <div className="bg-[#111] border border-white/8 rounded-2xl p-4">
              <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mb-3">Bulk Pricing</p>
              <div className="flex items-center justify-between text-[9px] font-black text-white/30 uppercase px-2 mb-1"><span>Min Qty</span><span>Per Unit</span></div>
              {p.priceTiers.map(t => { const active = qty >= t.qty && unit === t.pricePerUnit; return (
                <div key={t.qty} className={`flex items-center justify-between px-2 py-2.5 rounded-lg ${active ? 'bg-emerald-500/10 border-l-2 border-emerald-500' : ''}`}>
                  <span className="flex items-center gap-2 text-xs font-bold text-white/70">{fmt(t.qty)} Units+{active && <span className="text-[8px] font-black text-black bg-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Applied</span>}</span>
                  <span className={`text-sm font-black ${active ? 'text-emerald-400' : 'text-white/70'}`}>₹{fmt(t.pricePerUnit)}</span>
                </div>
              ); })}
              <div className="flex items-end justify-between mt-3 pt-3 border-t border-white/8">
                <div>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-wider mb-1.5">Choose Quantity</p>
                  <div className="inline-flex items-center bg-black/40 border border-white/10 rounded-lg">
                    <button onClick={() => setQty(Math.max(p.minOrderQty, qty - p.minOrderQty))} disabled={qty <= p.minOrderQty} className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-emerald-400 disabled:opacity-25"><Minus size={14} /></button>
                    <input value={qty} onChange={e => setQty(parseInt(e.target.value.replace(/\D/g, '')) || 0)} onBlur={() => setQty(q => Math.max(p.minOrderQty, q || p.minOrderQty))} inputMode="numeric" className="w-12 text-center text-sm font-black text-white bg-transparent focus:outline-none" />
                    <button onClick={() => setQty(qty + p.minOrderQty)} className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-emerald-400"><Plus size={14} /></button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-white/50">₹{fmt(unit)} / Unit</p>
                  <p className="text-2xl font-black text-white leading-none mt-0.5">₹{fmt(unit * qty)}</p>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-wider mt-0.5">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-[#111] border border-white/8 rounded-2xl p-4">
              <div className="flex items-start gap-3.5">
                <span className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0"><Truck size={20} /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.16em]">Get it by</p>
                  <p className="text-lg font-black text-white leading-tight">{eta}</p>
                  <p className="text-[11px] font-bold text-orange-500 flex items-center gap-1 mt-0.5"><Zap size={11} /> Free site delivery above ₹2L</p>
                </div>
              </div>
              <div className="h-px bg-white/8 my-3.5" />
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-white/40 shrink-0" />
                <input value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setPinMsg(null); }} onKeyDown={e => { if (e.key === 'Enter') checkPin(); }} inputMode="numeric" maxLength={6} placeholder="Enter delivery pincode" className="flex-1 bg-transparent text-sm font-bold text-white placeholder:text-white/30 focus:outline-none" />
                <button onClick={checkPin} className="px-4 py-2 bg-white/10 hover:bg-emerald-600 border border-white/15 rounded-lg text-[10px] font-black text-white uppercase tracking-widest transition-colors">Check</button>
              </div>
              {pinMsg && <p className={`text-[11px] font-bold mt-2.5 flex items-center gap-1.5 ${pinMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{pinMsg.ok ? <Check size={12} /> : <X size={12} />}{pinMsg.text}</p>}
            </div>
            {bullets.length > 0 && (
              <div className="bg-[#111] border border-white/8 rounded-2xl p-4">
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2.5">Highlights</p>
                <ul className="space-y-2">{shownBullets.map((bl, i) => <li key={i} className="flex gap-2.5 text-xs text-white/60"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />{bl}</li>)}</ul>
                {bullets.length > 2 && <button onClick={() => setAllBullets(!allBullets)} className="mt-3 flex items-center gap-1 text-[11px] font-black text-orange-500 uppercase tracking-wide">{allBullets ? 'See less' : 'See ' + (bullets.length - 2) + ' more'}<ChevronDown size={13} className={allBullets ? 'rotate-180' : ''} /></button>}
              </div>
            )}
            {p.description && (
              <div className="bg-[#111] border border-white/8 rounded-2xl p-4">
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2.5">Product Description</p>
                <p className={`text-xs text-white/60 leading-relaxed ${descOpen ? '' : 'line-clamp-2'}`}>{p.description}</p>
                <button onClick={() => setDescOpen(!descOpen)} className="mt-2.5 flex items-center gap-1 text-[11px] font-black text-orange-500 uppercase tracking-wide">{descOpen ? 'See less' : 'See more'}<ChevronDown size={13} className={descOpen ? 'rotate-180' : ''} /></button>
              </div>
            )}
            <div className="bg-[#111] border border-white/8 rounded-2xl p-4">
              <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2.5">Specifications</p>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest bg-white/5 px-2.5 py-1.5 rounded mb-1">General</p>
              {[['Delivery', '3 - 5 working days'], ['Minimum Order', fmt(p.minOrderQty) + ' Units'], ['Sold Per', 'Unit'], ['Warranty', '1 Year Manufacturer Warranty'], ['Brand', p.brand ?? '-'], ['GST', (p.gstPercent ?? 18) + '%'], ['Vendor', p.vendorBusinessName ?? '-']].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-white/5 last:border-0"><span className="text-[11px] text-white/40">{k}</span><span className="text-[11px] font-bold text-white text-right">{v}</span></div>
              ))}
            </div>
          </div>
        </div>
        {similar.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-black text-white mb-4">Similar Materials</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{similar.map(s => (
              <button key={s.id} onClick={() => setView({ t: 'product', id: s.id })} className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden text-left hover:border-emerald-500/40 transition-colors">
                <div className="relative bg-black/40" style={{ aspectRatio: '1/1' }}><img src={s.imageUrls[0]} referrerPolicy="no-referrer" onError={imgFallback} className="w-full h-full object-cover" /></div>
                <div className="p-3"><p className="text-xs font-bold text-white line-clamp-2 leading-snug mb-1 min-h-[2rem]">{s.title}</p><p className="text-sm font-black text-white">₹{fmt(s.priceTiers[0]?.pricePerUnit ?? 0)} <span className="text-[9px] text-emerald-400 font-bold">/Unit</span></p></div>
              </button>
            ))}</div>
          </section>
        )}
        {lightbox && (
          <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" onClick={() => setLightbox(false)}>
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(1, +(z - 0.5).toFixed(1))); }} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><ZoomOut size={18} /></button>
              <span className="text-white/70 text-xs font-black w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(4, +(z + 0.5).toFixed(1))); }} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><ZoomIn size={18} /></button>
              <button onClick={() => setLightbox(false)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><X size={18} /></button>
            </div>
            {gallery.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>{gallery.map((g, i) => (
                <button key={i} onClick={() => { setImgIdx(i); setZoom(1); }} className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${imgIdx === i ? 'border-emerald-500' : 'border-white/20 opacity-60'}`}><img src={g} referrerPolicy="no-referrer" className="w-full h-full object-cover" /></button>
              ))}</div>
            )}
            <div className="overflow-auto max-w-[95vw] max-h-[88vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img src={gallery[imgIdx] || p.imageUrls[0]} referrerPolicy="no-referrer" alt="" onError={imgFallback} style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease' }} className="max-w-[90vw] max-h-[85vh] object-contain origin-center select-none" />
            </div>
          </div>
        )}
        <div className="fixed bottom-0 left-0 right-0 z-[80] bg-black/95 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-2xl mx-auto px-4 py-3">
            {p.inStock === false ? (
              <button onClick={notify} className="w-full h-12 bg-white/10 border border-white/15 text-white text-[11px] font-black uppercase tracking-widest rounded-xl">Notify Me When Available</button>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                <button onClick={() => say('Coming soon')} className="h-12 bg-[#0F172A] border border-white/15 text-white text-[10px] font-black uppercase rounded-xl flex flex-col items-center justify-center gap-0.5"><Handshake size={15} />Negotiate</button>
                <button onClick={() => say('Coming soon - online purchase is not available yet')} className="h-12 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl flex flex-col items-center justify-center gap-0.5"><Zap size={15} /> Buy Now</button>
                <button onClick={() => add(p.id, qty)} className="h-12 orange-gradient-bg text-white text-[10px] font-black uppercase rounded-xl flex flex-col items-center justify-center gap-0.5"><ShoppingCart size={15} /> Add to Bag</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const NegotiateScreen = ({ id, qty0 }: { id: string; qty0: number }) => {
    const p = bProduct(id);
    const [qty, setQty] = useState(Math.max(qty0, p.minOrderQty));
    const [price, setPrice] = useState('');
    const [note, setNote] = useState('');
    const [sent, setSent] = useState(false);
    const market = tierPrice(p, qty);
    const offer = Number(price) || 0;
    const est = offer * qty;
    const save = (market - offer) * qty;
    if (sent) return (
      <div className="max-w-md mx-auto px-4 pt-20 pb-20 text-center">
        <span className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto mb-5 flex items-center justify-center"><Check size={30} /></span>
        <h1 className="text-xl font-black text-white mb-2">Quote Request Sent</h1>
        <p className="text-xs text-white/50 leading-relaxed mb-6">Our procurement desk will review your offer with {p.vendorBusinessName}. Track replies from the bell icon.</p>
        <button onClick={() => setView({ t: 'cart' })} className="px-6 h-11 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl">Track Negotiations</button>
      </div>
    );
    return (
      <div className="max-w-md mx-auto px-4 pb-24 pt-5">
        <h1 className="text-xl font-black text-white mb-5 flex items-center gap-2"><Handshake size={18} className="text-emerald-400" /> Request a Quote</h1>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 mb-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mb-1">Procuring</p>
            <p className="text-sm font-black text-white line-clamp-2">{p.title}</p>
            <p className="text-[10px] text-white/40 font-bold mt-0.5">Market ₹{fmt(market)} / unit</p>
          </div>
          <img src={p.imageUrls[0]} referrerPolicy="no-referrer" alt="" onError={imgFallback} className="w-14 h-14 rounded-xl object-cover shrink-0" />
        </div>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 mb-3">
          <div className="flex items-center justify-between mb-2"><p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Total Requirement</p><p className="text-[9px] font-bold text-white/30">MOQ {fmt(p.minOrderQty)} units</p></div>
          <div className="inline-flex items-center bg-black/40 border border-white/10 rounded-lg">
            <button onClick={() => setQty(q => Math.max(p.minOrderQty, q - 1))} disabled={qty <= p.minOrderQty} className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-emerald-400 disabled:opacity-25"><Minus size={14} /></button>
            <input value={qty} onChange={e => setQty(parseInt(e.target.value.replace(/\D/g, '')) || 0)} onBlur={() => setQty(q => Math.max(p.minOrderQty, q || p.minOrderQty))} inputMode="numeric" className="w-16 text-center text-sm font-black text-white bg-transparent focus:outline-none" />
            <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-emerald-400"><Plus size={14} /></button>
          </div>
          {qty < p.minOrderQty && <p className="text-[10px] font-bold text-red-400 mt-2.5">Minimum order is {fmt(p.minOrderQty)} units &mdash; increase the quantity to send a quote.</p>}
        </div>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 mb-3">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Your Target Price / Unit</p>
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 focus-within:border-orange-500">
            <span className="text-sm font-black text-white/40">₹</span>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder={String(Math.round(market * 0.9))} className="flex-1 py-3 bg-transparent text-center text-sm font-black text-white placeholder:text-white/20 focus:outline-none" />
          </div>
        </div>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 mb-3">
          <div className="flex items-center justify-between mb-2"><p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Notes to Vendor</p><p className="text-[9px] font-bold text-white/25">OPTIONAL</p></div>
          <textarea value={note} maxLength={240} onChange={e => setNote(e.target.value)} rows={3} placeholder="Volumes, timeline, payment terms, site details…" className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 resize-none" />
        </div>
        <div className="bg-black border border-white/10 rounded-2xl p-4 mb-4">
          {[['Market price', `₹${fmt(market)} / unit`], ['Your offer', offer ? `₹${fmt(offer)} / unit` : '—'], ['Quantity', `${fmt(qty)} units`]].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs py-1"><span className="text-white/40">{k}</span><span className="font-bold text-white">{v}</span></div>
          ))}
          <div className="flex justify-between text-sm pt-2 mt-1 border-t border-white/10"><span className="font-black text-white/60">Estimated total</span><span className="font-black text-white">{offer ? `₹${fmt(est)}` : '—'}</span></div>
          {offer > 0 && save > 0 && <p className="mt-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-[10px] font-black text-emerald-400">You save ₹{fmt(save)} vs market price</p>}
        </div>
        <button disabled={!offer || qty < p.minOrderQty} onClick={() => { sendOffer(p.vendorBusinessName ?? 'Vendor', [{ productId: p.id, name: p.title, qty, unitPrice: market, lineTotal: market * qty, targetUnitPrice: offer, targetLineTotal: est }], market * qty, est, note, true); setSent(true); }} className="w-full h-12 orange-gradient-bg text-white text-[11px] font-black uppercase tracking-wide rounded-xl disabled:opacity-30">{qty < p.minOrderQty ? `Minimum ${fmt(p.minOrderQty)} units` : 'Send Quote Request'}</button>
        <p className="text-[10px] text-white/35 text-center mt-2">Our procurement desk responds within 24 hours</p>
      </div>
    );
  };

  const CartScreen = () => {
    const [tab, setTab] = useState<'cart' | 'single'>('cart');
    const [lock, setLock] = useState<string | null>(null);
    const [tick, setTick] = useState(0);
    useEffect(() => { const i = setInterval(() => setTick(t => t + 1), 4000); return () => clearInterval(i); }, []);
    const negos = matureNegos();
    const resolve = (id: string, accept: boolean) => { if (me) { setQuoteStatus(id, accept ? 'ACCEPTED' : 'DECLINED'); say(accept ? 'Counter-offer accepted' : 'Counter-offer declined'); return; } const n = loadNegos(); const x = n.find(y => y.id === id); if (x) { x.status = accept ? 'ACCEPTED' : 'DECLINED'; saveNegos(n); } setTick(t => t + 1); say(accept ? 'Counter-offer accepted' : 'Counter-offer declined'); };
    const [sheet, setSheet] = useState(false);
    const [perMode, setPerMode] = useState(false);
    const [target, setTarget] = useState('');
    const [perT, setPerT] = useState<Record<string, string>>({});
    const [msg, setMsg] = useState('');
    const accNego = negos.find(n => n.status === 'ACCEPTED' && n.productIds.every(id => cart.some(l => l.productId === id)));
    const negPrice = accNego ? Math.max(0, (accNego.counter ?? accNego.offer)) : 0;
    const vendors = [...new Set(cart.map(l => bProduct(l.productId).vendorBusinessName))];
    const vendorLines = (v: string | undefined | null) => cart.filter(l => bProduct(l.productId).vendorBusinessName === v);
    const vendorSub = (v: string | null) => vendorLines(v).reduce((a, l) => a + lineTotal(l), 0);
    return (
      <div className="max-w-3xl mx-auto px-4 pb-32 pt-5">
        <h1 className="text-xl font-black text-white mb-1">Procurement Bag <span className="text-[10px] font-black text-white/40 bg-white/5 px-2 py-0.5 rounded-full align-middle ml-1">{cartQty} units</span></h1>
        <div className="inline-flex bg-[#0F172A] border border-white/10 rounded-xl p-1 my-4">
          {(['cart', 'single'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 h-8 rounded-lg text-[10px] font-black uppercase tracking-wide ${tab === t ? 'bg-emerald-600 text-white' : 'text-white/50'}`}>{t === 'cart' ? 'My Cart' : 'Single Source'}</button>
          ))}
        </div>
        {cart.length === 0 ? (
          <div className="py-20 text-center bg-[#0F172A] border border-white/10 rounded-2xl px-6">
            <ShoppingCart size={36} className="mx-auto text-white/20 mb-3" />
            <p className="text-white font-black mb-1">Your site bag is empty</p>
            <p className="text-white/40 text-xs mb-4">Specify the materials needed for your project to get bulk quotes.</p>
            <button onClick={() => setView({ t: 'home' })} className="px-6 h-10 border border-emerald-500/50 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl">Explore Materials</button>
          </div>
        ) : tab === 'cart' ? (
          <div className="space-y-4">
          {cart.map(l => { const p = bProduct(l.productId); return (
            <div key={p.id} className="bg-[#0F172A] border border-white/10 rounded-3xl p-4 flex gap-3">
              <img src={p.imageUrls[0]} referrerPolicy="no-referrer" alt="" onError={imgFallback} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-extrabold text-white line-clamp-2">{p.title}</p>
                  <button onClick={() => setCart(cs => cs.filter(x => x !== l))} className="text-white/30 hover:text-red-500 shrink-0"><X size={14} /></button>
                </div>
                <p className="text-[10px] font-bold text-white/40 mt-0.5">₹{fmt(tierPrice(p, l.qty))}/unit · {p.vendorBusinessName}</p>
                <div className="flex items-center justify-between mt-2.5">
                  <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-xl">
                    <button onClick={() => setCart(cs => cs.map(x => x === l ? { ...x, qty: Math.max(p.minOrderQty, x.qty - p.minOrderQty) } : x))} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-emerald-400"><Minus size={12} /></button>
                    <span className="w-12 text-center text-xs font-black text-white">{fmt(l.qty)}</span>
                    <button onClick={() => setCart(cs => cs.map(x => x === l ? { ...x, qty: x.qty + p.minOrderQty } : x))} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-emerald-400"><Plus size={12} /></button>
                  </div>
                  <span className="text-lg font-black text-white">₹{fmt(lineTotal(l))}</span>
                </div>
              </div>
            </div>
          ); })}
          {/* PRICING BREAKDOWN — dark slate card per Flutter */}
          <div className="bg-[#1F2937] border border-white/10 rounded-3xl p-5">
            <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.25em] mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500" /> Pricing Breakdown</p>
            <div className="flex justify-between text-xs py-1"><span className="text-white/50">Material Subtotal</span><span className="font-bold text-white">₹{fmt(subtotal)}</span></div>
            <div className="flex justify-between text-xs py-1"><span className="text-white/50">Shipping & Loading</span><span className="font-black text-emerald-400 tracking-[0.15em] text-[10px]">COMPLIMENTARY</span></div>
            <div className="h-px bg-white/10 my-3" />
            {negPrice > 0 && (<>
              <span className="inline-block text-[8px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded mb-1.5">Approved Negotiated Price</span>
              <p className="text-xs text-white/30 line-through">₹{fmt(total)}</p>
            </>)}
            <div className="flex items-end justify-between">
              <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Total Quote</span>
              <span className={`text-[28px] leading-none font-black ${negPrice > 0 ? 'text-emerald-400' : 'text-white'}`}>₹{fmt(negPrice > 0 ? negPrice + gst + delivery : total)}</span>
            </div>
            <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mt-3">Incl. GST @ 18% • Rates guaranteed for 24h</p>
          </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* SINGLE-SOURCE PROCUREMENT explainer (Flutter parity) */}
            <div className="rounded-[20px] bg-gradient-to-br from-blue-600 to-blue-950 border border-blue-400/20 p-5 flex gap-3">
              <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0"><PackageCheck size={18} className="text-white" /></span>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Single-Source Procurement</p>
                <p className="text-[11px] text-white/80 font-semibold leading-relaxed">All {cart.length} materials consolidated under one verified vendor — one invoice, one GST bill, one coordinated site delivery.</p>
              </div>
            </div>
            {!lock && (
            <div className="pt-1">
              <p className="text-xs font-black text-white tracking-[0.1em] uppercase">Choose Your Vendor</p>
              <p className="text-[10px] text-white/40 font-semibold mt-0.5">One verified vendor fulfils every material in your bag — pick the quote that works for you.</p>
            </div>
            )}
            {!lock && vendors.map(v => {
              const cover = vendorLines(v).length; const isLocked = lock === v;
              const skus = BPRODUCTS.filter(p => p.vendorBusinessName === v).length;
              const placed = loadOrders().filter(o => o.isB2B).length;
              return (
                <button key={v} onClick={() => setLock(isLocked ? null : (v ?? null))} className={`w-full text-left bg-[#0F172A] border rounded-3xl p-4 transition-all ${isLocked ? 'border-emerald-500' : 'border-white/10 hover:border-emerald-500/40'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-full"><BadgeCheck size={10} /> Trusted Partner</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{placed} orders placed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-white/80 font-black flex items-center justify-center shrink-0">{(v ?? 'V').split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-black text-white">{v}</span>
                      <span className="block text-[10px] text-white/40 font-bold">{vmeta(v).city} · {skus} SKUs</span>
                    </span>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isLocked ? 'border-emerald-400' : 'border-white/25'}`}>{isLocked && <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className="text-[10px] font-black text-amber-400">★ {vmeta(v).rating} <span className="text-white/30 font-bold">({vmeta(v).reviews})</span></span>
                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded"><ShieldCheck size={9} /> GST Verified</span>
                    <span className="text-[9px] text-white/30 font-bold">{vmeta(v).fulfilled} orders fulfilled · {vmeta(v).yrs} yrs on TerraInfra</span>
                  </div>
                  <div className="mt-2.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-[10px] font-black text-emerald-400 flex items-center gap-1.5"><Check size={11} /> Stocks all {cover} of your material categories</div>
                  <div className="mt-2.5 pt-2.5 border-t border-white/8 flex items-center justify-between">
                    <span className="text-[8px] font-black text-white/35 uppercase tracking-[0.2em]">Single-Source Quote</span>
                    <span className="text-base font-black text-white">₹{fmt(vendorSub(v ?? null))}</span>
                  </div>
                  {isLocked && <div className="mt-2 flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase"><Lock size={10} /> Locked vendor · tap to change</div>}
                </button>
              );
            })}
            {lock && (() => {
              const lines = vendorLines(lock);
              const bTotal = vendorSub(lock);
              const vNegod = negos.filter(n => n.vendor === lock).length;
              const inNego = lines.filter(l => openNegoFor(l.productId)).length;
              const vProds = BPRODUCTS.filter(p => p.vendorBusinessName === lock).slice(0, 3);
              return (<>
                {/* LOCKED VENDOR banner */}
                <div className="bg-black border border-white/15 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <Lock size={14} className="text-emerald-400 shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[8px] font-black text-emerald-400 uppercase tracking-[0.25em]">Locked Vendor</span>
                    <span className="block text-sm font-black text-white truncate">{lock}</span>
                  </span>
                  <button onClick={() => setLock(null)} className="px-4 h-9 bg-white/10 border border-white/15 text-white text-[10px] font-black rounded-full hover:border-emerald-400 shrink-0">Change Vendor</button>
                </div>
                {/* vendor detail stats card */}
                <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/8">
                    <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/80 font-black flex items-center justify-center">{lock.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
                    <span className="flex-1"><span className="block text-sm font-black text-white">{lock}</span><span className="block text-[10px] text-white/40 font-bold">{vmeta(lock).city} · ★ {vmeta(lock).rating} · <span className="text-emerald-400">GST</span></span></span>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-white/8 text-center pt-3">
                    {[['Items', String(lines.length)], ['Delivery', '4 days'], ['Order Total', `₹${fmt(bTotal)}`]].map(([k, v2]) => (
                      <div key={k}><p className="text-[9px] font-black text-white/35 uppercase">{k}</p><p className="text-xs font-black text-white mt-0.5">{v2}</p></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-white/8 text-center pt-3 mt-3 border-t border-white/8">
                    {[['Negotiated', String(vNegod)], ['Purchased', String(loadOrders().filter(o => o.isB2B).length)]].map(([k, v2]) => (
                      <div key={k}><p className="text-[9px] font-black text-white/35 uppercase">{k}</p><p className="text-xs font-black text-white mt-0.5">{v2}</p></div>
                    ))}
                  </div>
                </div>
                {/* products from this vendor */}
                <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-4">
                  <div className="flex items-center justify-between mb-1"><p className="text-xs font-black text-white">Products from this Vendor</p><button onClick={() => setView({ t: 'vendor', name: lock! })} className="text-[10px] font-black text-orange-400 hover:underline">See All →</button></div>
                  <p className="text-[10px] text-white/40 font-bold mb-3">{BPRODUCTS.filter(p => p.vendorBusinessName === lock).length} products available from {lock}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {vProds.map(p => (
                      <button key={p.id} onClick={() => setView({ t: 'product', id: p.id })} className="bg-black/30 border border-white/8 rounded-xl overflow-hidden text-left hover:border-emerald-500/40">
                        <div className="relative w-full" style={{ aspectRatio: '1/1' }}><img src={p.imageUrls[0]} referrerPolicy="no-referrer" alt="" onError={imgFallback} className="absolute inset-0 w-full h-full object-cover" /></div>
                        <div className="p-2"><p className="text-[9px] font-bold text-white line-clamp-2">{p.title}</p><p className="text-[10px] font-black text-orange-400 mt-0.5">₹{fmt(tierPrice(p, p.minOrderQty))}</p></div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* NEGOTIATE ALL ITEMS TOGETHER — dark card */}
                <div className="bg-black border border-white/10 rounded-3xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center"><Handshake size={16} className="text-orange-400" /></span>
                    <span><span className="block text-[11px] font-black text-white uppercase tracking-[0.15em]">Negotiate All Items Together</span><span className="block text-[9px] text-white/40 font-bold">Bundle offer for {lines.length} product(s)</span></span>
                  </div>
                  <p className="text-[10px] text-white/50 font-semibold leading-relaxed mb-3">Propose ONE target price for ALL {lines.length} products in your bag{inNego > 0 ? `, including the ${inNego} product(s) already in a per-product negotiation` : ''}. This is a separate bundle offer to {lock}.</p>
                  <span className="inline-block bg-white/10 text-white text-[10px] font-black px-2.5 py-1 rounded-lg mb-3">Bundle total: ₹{fmt(bTotal)}</span>
                  <button onClick={() => say('Coming soon')} className="w-full h-11 orange-gradient-bg text-white text-[11px] font-black uppercase tracking-wide rounded-xl flex items-center justify-center gap-2"><Handshake size={14} /> Make an Offer</button>
                </div>
                {/* PREFERRED VENDOR BENEFITS */}
                <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center"><BadgeCheck size={16} className="text-orange-400" /></span>
                    <span><span className="block text-[10px] font-black text-orange-400 uppercase tracking-[0.15em]">Preferred Vendor Benefits Unlocked</span><span className="block text-[10px] text-white/40 font-bold">{lock} · Trusted Partner</span></span>
                  </div>
                  <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-[10px] font-black text-emerald-400 mb-3">Repeat Buyer Savings — a 3% relationship rebate is applied to this order</div>
                  {[['Bulk-order volume pricing', true], ['Repeat-buyer relationship rebate', true], ['Enterprise contract pricing', true], ['Price negotiation', true], ['Priority delivery scheduling', false], ['Dedicated account manager', false]].map(([l, on]: any) => (
                    <div key={l} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                      <span className={`text-[11px] font-bold ${on ? 'text-white/80' : 'text-white/30'} flex items-center gap-2`}>{on ? <Check size={11} className="text-emerald-400" /> : <Lock size={11} className="text-white/25" />}{l}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${on ? 'text-emerald-400' : 'text-white/25'}`}>{on ? 'Unlocked' : 'Unlocks at Strategic Partner'}</span>
                    </div>
                  ))}
                  <p className="text-[9px] text-white/30 font-bold mt-2.5">1 more order with {lock} unlocks the next tier.</p>
                </div>
              </>);
            })()}
            {(lock ? negos.filter(n => n.vendor === lock) : negos).map(n => {
              const agreed = n.counter ?? n.offer;
              if (n.status === 'PENDING') return (
                <div key={n.id} className="bg-orange-500/10 border border-orange-500/25 rounded-2xl p-4">
                  <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Hourglass size={11} /> Offer Sent · Awaiting Reply</p>
                  <div className="flex justify-between text-xs py-0.5"><span className="text-white/40">Quoted price</span><span className="font-bold text-white/60">₹{fmt(n.baseline)}</span></div>
                  <div className="flex justify-between text-xs py-0.5"><span className="text-white/40">Your offer</span><span className="font-black text-orange-400">₹{fmt(n.offer)}</span></div>
                  <p className="text-[9px] font-black text-white/30 uppercase mt-2">Negotiated for {n.titles.length} product(s) · {n.titles.join(' · ')}</p>
                  <p className="text-[10px] text-orange-300/80 mt-2">Our team is reviewing your offer with {n.vendor}. You'll see their reply here shortly.</p>
                </div>
              );
              if (n.status === 'COUNTERED') return (
                <div key={n.id} className="bg-blue-500/10 border border-blue-500/25 rounded-2xl p-4">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><MailCheck size={11} /> Counter-Offer Received</p>
                  <div className="flex justify-between text-xs py-0.5"><span className="text-white/40">Your offer</span><span className="font-bold text-white/60">₹{fmt(n.offer)}</span></div>
                  <div className="flex justify-between text-xs py-0.5"><span className="text-white/40">{n.vendor} counter</span><span className="font-black text-blue-400">₹{fmt(n.counter ?? 0)}</span></div>
                  {n.counterNote && <p className="text-[10px] italic text-white/60 bg-black/30 border border-white/10 rounded-lg px-3 py-2 mt-2">"{n.counterNote}"</p>}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <button onClick={() => resolve(n.id, false)} className="h-9 border border-white/20 text-white/70 text-[10px] font-black uppercase rounded-lg">Decline</button>
                    <button onClick={() => resolve(n.id, true)} className="col-span-2 h-9 bg-[#0F172A] border border-blue-400/40 text-white text-[10px] font-black uppercase rounded-lg">Accept ₹{fmt(n.counter ?? 0)}</button>
                  </div>
                </div>
              );
              if (n.status === 'ACCEPTED') return (
                <div key={n.id} className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><BadgeCheck size={11} /> Offer Approved</p>
                  <div className="flex justify-between text-xs py-0.5"><span className="text-white/40">Approved order price</span><span className="font-black text-emerald-400">₹{fmt(agreed)}</span></div>
                  <p className="text-[10px] text-emerald-300/80 mt-2">Approved by {n.vendor} · 7-day buy window. Continue to checkout to place the order at this price.</p>
                  <button onClick={() => say('Coming soon - online purchase is not available yet')} className="mt-3 w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg">Continue to Checkout</button>
                </div>
              );
              return (
                <div key={n.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-2 flex items-center gap-1.5"><XCircle size={11} /> Offer Not Approved</p>
                  <p className="text-[10px] text-white/50">Your offer was reviewed but not approved this time. You can send the vendor a fresh offer.</p>
                  <button onClick={() => setSheet(true)} className="mt-3 h-9 px-4 bg-[#0F172A] border border-white/15 text-white text-[10px] font-black uppercase rounded-lg">Start a New Offer</button>
                </div>
              );
            })}
            <div className="px-4 py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[10px] font-bold text-orange-300">Track your negotiation status from the bell icon in the header.</div>
          </div>
        )}
        {sheet && lock && (() => {
          const lines = vendorLines(lock);
          const baseline = vendorSub(lock);
          const perSum = lines.reduce((a, l) => a + (Number(perT[l.productId]) || Math.round(lineTotal(l) * 0.9)), 0);
          const offerTotal = perMode ? perSum : Number(target) || 0;
          const ok = offerTotal > 0 && offerTotal < baseline;
          return (
            <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setSheet(false)}>
              <div className="bg-[#0F172A] border border-white/10 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-black text-white">Negotiate Your Order</h3><button onClick={() => setSheet(false)} className="text-white/40 hover:text-white"><X size={16} /></button></div>
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 mb-3 flex items-center gap-3">
                  <div className="flex-1"><p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{lock} · Current Quote</p><p className="text-2xl font-black text-white mt-1">₹{fmt(baseline)}</p></div>
                  <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><Handshake size={18} className="text-emerald-400" /></span>
                </div>
                <button onClick={() => setPerMode(m => !m)} className="w-full flex items-center justify-between px-4 py-3 bg-black/30 border border-white/10 rounded-xl mb-3">
                  <span className="text-left"><span className="block text-xs font-bold text-white">Negotiate each product</span><span className="block text-[9px] text-white/40">Toggle on to type a target per product instead of one total</span></span>
                  <span className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${perMode ? 'bg-orange-500' : 'bg-white/15'}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${perMode ? 'left-5' : 'left-1'}`} /></span>
                </button>
                {!perMode ? (
                  <div className="mb-3">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Your Target Total</p>
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 focus-within:border-orange-500">
                      <span className="text-sm font-black text-white/40">₹</span>
                      <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder={`e.g. ₹${fmt(Math.round(baseline * 0.9))}`} className="flex-1 py-3 bg-transparent text-sm font-black text-white placeholder:text-white/20 focus:outline-none" />
                    </div>
                    <p className={`text-[10px] font-bold mt-1.5 ${ok ? 'text-emerald-400' : 'text-white/40'}`}>{ok ? `You're asking for ₹${fmt(baseline - offerTotal)} off the quote` : 'Enter the total price you want to pay.'}</p>
                  </div>
                ) : (
                  <div className="mb-3">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Per-Product Targets</p>
                    {lines.map(l => { const p2 = bProduct(l.productId); const act = lineTotal(l); return (
                      <div key={l.productId} className="flex items-center gap-2 mb-2">
                        <img src={p2.imageUrls[0]} referrerPolicy="no-referrer" alt="" onError={imgFallback} className="w-11 h-11 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 grid grid-cols-3 gap-1.5">
                          <div className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5"><p className="text-[7px] font-black text-white/30 uppercase">Actual</p><p className="text-[10px] font-black text-white/60">₹{fmt(act)}</p></div>
                          <div className="bg-black/20 border border-white/10 rounded-lg px-2 py-1.5"><p className="text-[7px] font-black text-white/30 uppercase">Target</p><p className="text-[10px] font-black text-white/60">₹{fmt(Math.round(act * 0.9))}</p></div>
                          <div className="bg-orange-500/10 border border-orange-500/40 rounded-lg px-2 py-1.5"><p className="text-[7px] font-black text-orange-400 uppercase">Your Offer</p><input type="number" value={perT[l.productId] ?? ''} onChange={e => setPerT({ ...perT, [l.productId]: e.target.value })} placeholder={String(Math.round(act * 0.9))} className="w-full bg-transparent text-[10px] font-black text-white placeholder:text-white/25 focus:outline-none" /></div>
                        </div>
                      </div>
                    ); })}
                    <div className="bg-black border border-white/10 rounded-xl px-4 py-2.5 flex justify-between mt-1"><span className="text-[9px] font-black text-white/40 uppercase">Bundle Total</span><span className="text-sm font-black text-white">₹{fmt(perSum)}</span></div>
                  </div>
                )}
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Message to Vendor (Optional)</p>
                <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={2} placeholder="Volumes, timeline, repeat order…" className="w-full mb-3 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 resize-none" />
                <button disabled={!ok} onClick={() => { const items = lines.map(l => { const pp = bProduct(l.productId); const lt = lineTotal(l); const tgt = perMode ? (Number(perT[l.productId]) || Math.round(lt * 0.9)) : Math.round(lt * (offerTotal / Math.max(1, baseline))); return { productId: l.productId, name: pp.title, qty: l.qty, unitPrice: tierPrice(pp, l.qty), lineTotal: lt, targetUnitPrice: Math.round(tgt / Math.max(1, l.qty)), targetLineTotal: tgt }; }); sendOffer(lock, items, baseline, offerTotal, msg, perMode); setSheet(false); setTarget(''); setPerT({}); setMsg(''); }} className="w-full h-12 orange-gradient-bg text-white text-[11px] font-black uppercase tracking-wide rounded-xl disabled:opacity-30">Send Offer to Vendor</button>
              </div>
            </div>
          );
        })()}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-[80] bg-black/95 backdrop-blur-xl border-t border-white/10">
            <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
              <div><p className="text-[9px] font-black text-white/40 uppercase">Order Total (incl. GST)</p><p className="text-lg font-black text-white">₹{fmt(total)}</p></div>
              {tab === 'cart'
                ? <button onClick={() => say('Coming soon - online purchase is not available yet')} className="flex-1 max-w-xs h-12 orange-gradient-bg text-white text-[11px] font-black uppercase tracking-wide rounded-xl">Request Delivery</button>
                : lock
                  ? <button onClick={() => say('Coming soon - online purchase is not available yet')} className="flex-1 max-w-xs h-12 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wide rounded-xl">Request Single-Source Quote</button>
                  : <button disabled className="flex-1 max-w-xs h-12 bg-white/10 text-white/40 text-[11px] font-black uppercase tracking-wide rounded-xl">Select a vendor to continue</button>}
            </div>
          </div>
        )}
      </div>
    );
  };

  const CheckoutScreen = () => {
    const [pay, setPay] = useState('NET_30');
    const [busy, setBusy] = useState(false);
    const [showAddr, setShowAddr] = useState(!addr);
    const accNego = matureNegos().find(n => n.status === 'ACCEPTED' && n.productIds.every(id => cart.some(l => l.productId === id)));
    const negDisc = accNego ? Math.max(0, Math.round(accNego.baseline - (accNego.counter ?? accNego.offer))) : 0;
    const payable = Math.max(0, total - negDisc);
    const [form, setForm] = useState(addr ?? { name: '', line1: '', city: '', state: '', pincode: '' });
    return (
      <div className="max-w-3xl mx-auto px-4 pb-44 pt-5">
        <h1 className="text-xl font-black text-white mb-5">Business Checkout</h1>
        <button onClick={() => setShowAddr(true)} className="w-full text-left bg-[#0F172A] border border-white/10 rounded-2xl p-5 flex items-center gap-4 mb-4 hover:border-emerald-500/40">
          <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Building2 size={20} className="text-emerald-400" /></span>
          <span className="flex-1 min-w-0">
            <span className="block text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Deliver To Site</span>
            {addr ? <><span className="block text-sm font-bold text-white">{addr.name}</span><span className="block text-xs text-white/60">{addr.line1}, {addr.city} {addr.pincode}</span></> : <span className="block text-xs text-white/50">Add New Site</span>}
          </span>
          <ChevronRight size={16} className="text-white/40" />
        </button>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-black text-white mb-3">Payment Method</h3>
          {[['NET_30', 'Credit Line (Net-30)', 'Interest-free 30-day window'], ['BANK', 'Bank Transfer', 'NEFT / RTGS on proforma invoice']].map(([v, l, d]) => (
            <button key={v} onClick={() => setPay(v)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border mb-2 ${pay === v ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10'}`}>
              <span className="text-left"><span className="block text-xs font-bold text-white">{l}</span><span className="block text-[10px] text-white/40">{d}</span></span>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${pay === v ? 'border-emerald-400' : 'border-white/25'}`}>{pay === v && <span className="w-2 h-2 rounded-full bg-emerald-400" />}</span>
            </button>
          ))}
          <p className="text-[10px] text-white/40 mt-2 flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-400" /> GST tax invoice available as PDF after dispatch.</p>
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-[80] bg-black/95 backdrop-blur-xl border-t border-white/10 rounded-t-[28px]">
          <div className="max-w-3xl mx-auto px-5 py-4">
            {([['Subtotal', `₹${fmt(subtotal)}`], ['GST', `₹${fmt(gst)}`], ['Freight', delivery === 0 ? 'GRATIS' : `₹${fmt(delivery)}`], ...(negDisc > 0 ? [['Negotiated discount', `- ₹${fmt(negDisc)}`]] : [])] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs py-0.5"><span className="text-white/40">{k}</span><span className={`font-bold ${v === 'GRATIS' ? 'text-emerald-400' : 'text-white'}`}>{v}</span></div>
            ))}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div><p className="text-[9px] font-black text-white/40 uppercase">Payable</p><p className="text-2xl font-black text-white">₹{fmt(payable)}</p></div>
              <button disabled={!addr || cart.length === 0 || busy} onClick={async () => { setBusy(true);
                  saveOrder(newOrder(payable, pay === 'NET_30' ? 'NET-30' : 'BANK', cart.map(l => ({ title: bProduct(l.productId).title, img: bProduct(l.productId).imageUrls[0], qty: l.qty })), true));
                  let oid: string | null = null;
                  if (me) oid = await placeB2BOrder({ buyerUid: me.uid, buyerEmail: me.email || '', payment: pay === 'NET_30' ? 'NET-30' : 'BANK', address: addr, items: cart.map(l => ({ productId: l.productId, title: bProduct(l.productId).title, img: bProduct(l.productId).imageUrls[0], qty: l.qty, unitPrice: tierPrice(bProduct(l.productId), l.qty), lineTotal: lineTotal(l) })), subtotal, gst, delivery, total: payable, itemCount: cart.length });
                  setCart([]); setBusy(false); say('Business order placed!'); setView(oid ? { t: 'order', id: oid } : { t: 'home' }); }}
                className="px-8 h-12 orange-gradient-bg text-white text-[11px] font-black uppercase tracking-wide rounded-xl disabled:opacity-30">{busy ? 'Placing…' : addr ? 'Place Order' : 'Select Site'}</button>
            </div>
          </div>
        </div>
        {showAddr && (
          <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setShowAddr(false)}>
            <div className="bg-[#0F172A] border border-white/10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-black text-white mb-4">Site Address</h3>
              {(['name', 'line1', 'city', 'state', 'pincode'] as const).map(k => (
                <input key={k} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={k === 'name' ? 'Site / company name' : k === 'line1' ? 'Address' : k[0].toUpperCase() + k.slice(1)} className="w-full mb-2.5 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50" />
              ))}
              <button onClick={() => { if (form.name && form.line1) { setAddr(form); setShowAddr(false); } }} className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl mt-1">Save Site</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const WishlistScreen = () => {
    const ps = BPRODUCTS.filter(p => wish.includes(p.id));
    return (
      <div className="max-w-7xl mx-auto px-4 pb-20 pt-5">
        <h1 className="text-xl font-black text-white mb-5">Wishlist <span className="text-[10px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full align-middle ml-2">{ps.length} SAVED</span></h1>
        {ps.length ? <Grid ps={ps} /> : <p className="text-white/40 text-sm py-20 text-center">No saved materials yet.</p>}
      </div>
    );
  };

  const VendorScreen = ({ name }: { name: string }) => {
    const ps = BPRODUCTS.filter(p => p.vendorBusinessName === name);
    const meta = vmeta(name);
    return (
      <div className="max-w-7xl mx-auto px-4 pb-20 pt-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white/80 font-black flex items-center justify-center shrink-0">{name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
          <div>
            <h1 className="text-xl font-black text-white leading-tight">{name}</h1>
            <p className="text-[10px] font-bold text-white/40">{meta.city} · ★ {meta.rating} ({meta.reviews}) · <span className="text-emerald-400">GST Verified</span></p>
          </div>
        </div>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-5">{ps.length} products available from {name}</p>
        {ps.length ? <Grid ps={ps} /> : <p className="text-white/40 text-sm py-16 text-center">No products listed for this vendor.</p>}
      </div>
    );
  };

  const NotificationsScreen = () => (
    <div className="max-w-3xl mx-auto px-4 pb-20 pt-5">
      <h1 className="text-xl font-black text-white mb-1">Notifications</h1>
      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-5">{notifs.length} updates</p>
      {!me && <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-[11px] font-bold text-amber-300 mb-4">Sign in from your profile to receive live vendor replies & order updates.</div>}
      {notifs.length === 0 ? (
        <div className="py-20 text-center bg-[#0F172A] border border-white/10 rounded-2xl"><Bell size={36} className="mx-auto text-white/20 mb-3" /><p className="text-white font-black">No notifications yet</p></div>
      ) : (
        <div className="space-y-2.5">{notifs.map((n: any, i: number) => (
          <button key={n.id || i} onClick={() => n.quoteId ? setView({ t: 'cart' }) : undefined} className="w-full text-left bg-[#0F172A] border border-white/10 rounded-2xl p-4 flex items-center gap-3 hover:border-emerald-500/40">
            <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0"><Bell size={15} /></span>
            <span className="flex-1 min-w-0"><span className="block text-xs font-black text-white">{n.title || 'Update'}</span><span className="block text-[10px] text-white/40 truncate">{n.body || ''}</span></span>
            <ChevronRight size={14} className="text-white/25" />
          </button>
        ))}</div>
      )}
    </div>
  );

  const OrderScreen = ({ id }: { id: string }) => {
    const [o, setO] = useState<any>(null);
    useEffect(() => watchOrder(id, setO), [id]);
    const stages = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
    const idx = o ? Math.max(0, stages.findIndex(s => s.toUpperCase() === String(o.status || 'PLACED').toUpperCase())) : 0;
    return (
      <div className="max-w-2xl mx-auto px-4 pb-20 pt-5">
        <h1 className="text-xl font-black text-white mb-1">Order Tracking</h1>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-5">Order #{id.slice(-8)}</p>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 mb-4">
          {[['Total', `₹${fmt(Number(o?.total) || 0)}`], ['Items', String(o?.itemCount ?? '—')], ['Payment', o?.payment ?? '—']].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs py-1"><span className="text-white/40">{k}</span><span className="font-black text-white">{v}</span></div>
          ))}
        </div>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3">Live Tracking</p>
          {stages.map((s, i) => (
            <div key={s} className="flex items-center gap-3 py-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${i <= idx ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/40'}`}>{i <= idx ? <Check size={13} /> : i + 1}</span>
              <span className={`text-xs font-black ${i <= idx ? 'text-white' : 'text-white/40'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <Toaster />
      {showLogin && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowLogin(false)}>
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-sm rounded-3xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-black text-white mb-1">Sign in to TerraInfra Business</h3>
            <p className="text-[10px] text-white/40 mb-4">Use your TI360 business account to unlock the live wholesale catalogue & negotiation.</p>
            <input value={lf.email} onChange={e => setLf({ ...lf, email: e.target.value })} placeholder="Email" className="w-full mb-2.5 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50" />
            <input type="password" value={lf.pass} onChange={e => setLf({ ...lf, pass: e.target.value })} placeholder="Password" className="w-full mb-2.5 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50" />
            {lf.err && <p className="text-[10px] font-bold text-red-400 mb-2">{lf.err}</p>}
            <button disabled={lf.busy} onClick={() => doLogin(false)} className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl disabled:opacity-40">{lf.busy ? 'Signing in…' : 'Sign In'}</button>
          </div>
        </div>
      )}
      {live && <div className="max-w-7xl mx-auto px-4 pt-2"><p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">● Live TI360 catalogue</p></div>}
      {view.t === 'home' && <Home />}
      {view.t === 'cats' && (
        <div className="max-w-7xl mx-auto px-4 pb-20 pt-4">
          <h1 className="text-xl font-black text-white mb-4">All Categories</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <button onClick={() => setView({ t: 'cat', id: '__ALL__' })} className="rounded-2xl border-2 border-white/10 bg-[#0F172A] flex flex-col items-center justify-center h-32 gap-2">
              <LayoutGrid size={28} className="text-emerald-400" />
              <span className="text-[11px] font-extrabold text-white/70">All Lots</span>
            </button>
            {MACROS.map(m => (
              <button key={m.id} onClick={() => setView({ t: 'cat', id: m.id })} className="rounded-2xl overflow-hidden border-2 border-white/10 relative h-32">
                <img src={m.imageUrl} referrerPolicy="no-referrer" alt="" onError={imgFallback} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 text-[11px] font-black text-white text-left leading-tight line-clamp-2">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {view.t === 'cat' && <BrowseScreen macroId={view.id} />}
      {view.t === 'product' && <ProductScreen id={view.id} />}
      {view.t === 'negotiate' && <NegotiateScreen id={view.id} qty0={view.qty} />}
      {view.t === 'cart' && <CartScreen />}
      {view.t === 'checkout' && <CheckoutScreen />}
      {view.t === 'wishlist' && <WishlistScreen />}
      {view.t === 'search' && <BrowseScreen q={view.q} />}
      {view.t === 'notifications' && <NotificationsScreen />}
      {view.t === 'order' && <OrderScreen id={view.id} />}
      {view.t === 'vendor' && <VendorScreen name={view.name} />}
    </div>
  );
}
