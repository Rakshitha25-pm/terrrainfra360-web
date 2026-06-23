import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu, Search, Heart, ShoppingCart, Sparkles, X, ChevronRight, ChevronDown, ChevronLeft,
  ArrowLeft, Star, SlidersHorizontal, ArrowUpDown, Check, Plus, Minus, Trash2, BookmarkPlus,
  MapPin, Package, Truck, ShieldCheck, LayoutGrid, Receipt, Zap, Building2, User, Settings, Bookmark, HelpCircle, FileText, Info, LogOut, Pencil, Bell, GitCompare
} from 'lucide-react';
import {
  MACROS, RPRODUCTS, RProduct, Variant, CartLine, fmt, useLocal, rProduct,
  saveOrder, loadOrders, newOrder, OrderRec, replaceRetail,
} from './shared';
import { fetchLiveRetail, loginEmail, loginGoogle, watchAuth, watchNotifications, writeStockAlert, currentUser, watchReviews, submitReview, deleteReview, fireSignOut, watchAddresses, watchMembership } from './fire';

type View =
  | { t: 'home' } | { t: 'macros' } | { t: 'list'; macroId: string | null; q?: string }
  | { t: 'detail'; id: string } | { t: 'cart' } | { t: 'checkout' } | { t: 'orders' } | { t: 'wishlist' } | { t: 'profile' } | { t: 'notifications' } | { t: 'order'; id: string } | { t: 'compare' };


export const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='320'><rect width='400' height='320' fill='#161616'/><rect x='150' y='105' width='100' height='100' rx='14' fill='none' stroke='#f97316' stroke-width='6' opacity='0.55'/><circle cx='200' cy='155' r='14' fill='#f97316' opacity='0.55'/></svg>");
export const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => { const t = e.currentTarget; if (t.src !== FALLBACK_IMG) t.src = FALLBACK_IMG; };

type Suggest = { id: string; title: string; image?: string };
export const SearchBox = ({ placeholder, onSubmit, suggestions, onPick }: { placeholder: string; onSubmit: (q: string) => void; suggestions?: Suggest[]; onPick?: (id: string) => void }) => {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const list = suggestions || [];
  const ql = q.trim().toLowerCase();
  const matches = (ql ? list.filter(x => x.title.toLowerCase().includes(ql)) : list).slice(0, 6);
  const showDrop = focused && matches.length > 0;
  return (
    <div className="relative flex-1">
      <div className="h-11 bg-[#111] border border-white/10 rounded-xl flex items-center gap-2 px-3 focus-within:border-orange-500/50">
        <Sparkles size={15} className="text-orange-500 shrink-0" />
        <input value={q} onChange={e => setQ(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} onKeyDown={e => { if (e.key === 'Enter') { onSubmit(q.trim()); setFocused(false); } }} placeholder={placeholder} className="flex-1 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none" />
        {q && <button onClick={() => setQ('')} className="text-white/30 hover:text-white"><X size={14} /></button>}
        <button onClick={() => onSubmit(q.trim())} className="h-7 w-9 orange-gradient-bg rounded-lg flex items-center justify-center text-white hover:opacity-90 active:scale-95 transition-all"><Search size={14} /></button>
      </div>
      {showDrop && (
        <div className="absolute z-[60] left-0 right-0 mt-1 bg-[#1a1714] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60 max-h-80 overflow-y-auto">
          {!ql && <p className="px-3 pt-2.5 pb-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Recommended</p>}
          {matches.map(x => (
            <button key={x.id} onMouseDown={e => { e.preventDefault(); if (onPick) onPick(x.id); else onSubmit(x.title); setQ(''); setFocused(false); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-left">
              {x.image ? <img src={x.image} alt="" referrerPolicy="no-referrer" onError={imgFallback} className="w-9 h-9 rounded object-cover bg-white/5 shrink-0" /> : <span className="w-9 h-9 rounded bg-white/5 shrink-0" />}
              <span className="text-xs text-white truncate">{x.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const KEYWORDS = ['Best Builders', 'Steel Bars', 'Cement', 'Hand Tools', 'Safety Gear', 'Power Tools'];
const OFFER_SLIDES = [
  { off: '10% OFF', badge: 'Flash Sale', sub: 'Limited-time price drops across departments', cls: 'from-purple-600 to-purple-950' },
  { off: '20% OFF', badge: 'Hot Deal', sub: 'Contractor favourites at honest rates', cls: 'from-orange-600 to-orange-900' },
  { off: '30% OFF', badge: 'Super Saver', sub: 'Stack savings on finishing materials', cls: 'from-emerald-600 to-emerald-950' },
  { off: '40% OFF', badge: 'Bulk Buy', sub: 'Bigger carts, bigger discounts', cls: 'from-red-600 to-red-900' },
  { off: '50%+ OFF', badge: 'Mega Sale', sub: 'Clearance picks while stocks last', cls: 'from-gray-700 to-gray-900' },
];
const B2B_HEADS = ['Bulk purchases? Wholesale rates unlocked', 'Net-30 credit for verified businesses', 'GST invoices on every order', 'Single-source procurement for sites', 'Factory-direct tier pricing'];

const loadViewed = (): string[] => { try { return JSON.parse(localStorage.getItem('tf360_rviewed_v1') || '[]'); } catch { return []; } };
const saveViewed = (id: string) => { try { localStorage.setItem('tf360_rviewed_v1', JSON.stringify([id, ...loadViewed().filter(x => x !== id)].slice(0, 10))); } catch {} };

const deliveryText = (d: number) => {
  const dt = new Date(Date.now() + d * 864e5);
  return `Get it by ${dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`;
};


let toastFn: ((m: string) => void) | null = null;
export const say = (m: string) => { if (toastFn) toastFn(m); };
export const Toaster = () => {
  const [m, setM] = useState('');
  useEffect(() => { toastFn = (x: string) => { setM(x); window.setTimeout(() => setM(''), 2200); }; return () => { toastFn = null; }; }, []);
  return (
    <AnimatePresence>
      {m && <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-28 left-1/2 -translate-x-1/2 z-[300] bg-[#111] border border-orange-500/40 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-2xl">{m}</motion.div>}
    </AnimatePresence>
  );
};

const B2BStrip = ({ onOpen }: { onOpen: () => void }) => {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(x => (x + 1) % B2B_HEADS.length), 3000); return () => clearInterval(t); }, []);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#0c130c]">
      <div className="absolute -right-10 -top-16 w-72 h-72 bg-emerald-500/15 blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 grid-pattern-subtle pointer-events-none" />
      <div className="relative z-10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-[9px] font-black tracking-[0.25em] text-emerald-300 uppercase mb-2"><Building2 size={10} /> TerraInfra Business</span>
          <AnimatePresence mode="wait">
            <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-base font-black text-white leading-tight">{B2B_HEADS[i]}</motion.p>
          </AnimatePresence>
          <div className="flex flex-wrap items-center gap-2.5 mt-2 text-[9px] font-black uppercase tracking-wide text-white/40">
            <span>GST invoices</span><span className="text-emerald-500">•</span><span>Net-30 credit</span><span className="text-emerald-500">•</span><span>Tier pricing</span><span className="text-emerald-500">•</span><span>Verified vendors</span>
          </div>
        </div>
        <button onClick={onOpen} className="shrink-0 px-6 h-12 orange-gradient-bg text-white text-[11px] font-black uppercase tracking-wide rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">Open B2B Store <ChevronRight size={14} /></button>
      </div>
    </div>
  );
};

const OfferZoneStrip = () => (
  <section>
    <p className="text-[9px] font-black text-orange-500 tracking-[0.25em] uppercase mb-3">Offer Zone</p>
    <div className="overflow-hidden">
      <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }} className="flex gap-3 flex-nowrap w-max">
        {[...OFFER_SLIDES, ...OFFER_SLIDES].map((o, i) => (
          <div key={o.off + i} className={`shrink-0 w-56 h-28 rounded-2xl bg-gradient-to-br ${o.cls} p-4 flex flex-col justify-center relative overflow-hidden border border-white/10`}>
            <span className="self-start text-[8px] font-black uppercase tracking-widest text-white bg-white/20 px-2 py-0.5 rounded mb-1">{o.badge}</span>
            <p className="text-2xl font-black text-white leading-none">{o.off}</p>
            <p className="text-[9px] font-semibold text-white/85 mt-1 line-clamp-2">{o.sub}</p>
            <Zap size={70} className="absolute -right-3 -bottom-3 text-white/10 pointer-events-none" fill="currentColor" />
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

/* shared small bits */
const Stepper = ({ qty, min = 1, set }: { qty: number; min?: number; set: (n: number) => void }) => (
  <div className="inline-flex items-center bg-black/40 border border-white/10 rounded-lg">
    <button onClick={() => set(Math.max(min, qty - 1))} disabled={qty <= min} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-orange-500 disabled:opacity-25"><Minus size={13} /></button>
    <span className="w-9 text-center text-xs font-black text-white">{qty}</span>
    <button onClick={() => set(qty + 1)} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-orange-500"><Plus size={13} /></button>
  </div>
);
const Stars = ({ r }: { r: number }) => (
  <span className="inline-flex items-center gap-0.5">{[1, 2, 3, 4, 5].map(i => <Star key={i} size={11} fill={i <= Math.round(r) ? '#f97316' : 'none'} className={i <= Math.round(r) ? 'text-orange-500' : 'text-white/15'} />)}</span>
);

/* ── Product card (Flutter anatomy) ── */
const RCard = ({ p, onOpen, wish, toggleWish, addToCart, buyNow, compared, onCompare }: {
  p: RProduct; onOpen: () => void; wish: boolean; toggleWish: () => void; addToCart: () => void; buyNow: () => void; compared?: boolean; onCompare?: () => void;
}) => (
  <div className="bg-[#111] border border-white/8 rounded-xl overflow-hidden flex flex-col hover:border-orange-500/30 transition-all">
    <div className="relative h-44 w-full overflow-hidden bg-[#0d0d0d] cursor-pointer" onClick={onOpen}>
      <img src={p.imageUrls[0]} referrerPolicy="no-referrer" alt="" onError={imgFallback} className="absolute inset-0 w-full h-full object-cover" />
      {p.mrp && p.mrp > p.price && (
        <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">-{Math.round((1 - p.price / p.mrp) * 100)}%</span>
      )}
      {p.outOfStock && <span className="absolute bottom-2 left-2 text-red-500 text-[8.5px] font-black tracking-wider bg-black/70 px-1.5 py-0.5 rounded">OUT OF STOCK</span>}
      <button onClick={e => { e.stopPropagation(); toggleWish(); }}
        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border ${wish ? 'bg-red-500/15 border-red-500/40 text-red-500' : 'bg-black/60 border-white/10 text-white/50 hover:text-orange-500'}`}>
        <Heart size={13} fill={wish ? 'currentColor' : 'none'} />
      </button>
      {onCompare && (
        <button onClick={e => { e.stopPropagation(); onCompare(); }} title="Compare"
          className={`absolute top-11 right-2 w-7 h-7 rounded-full flex items-center justify-center border ${compared ? 'bg-orange-500 border-orange-500 text-white' : 'bg-black/60 border-white/10 text-white/50 hover:text-orange-500'}`}>
          <GitCompare size={12} />
        </button>
      )}
    </div>
    <div className="p-2.5 flex flex-col gap-1 flex-1">
      <p className="text-[9px] font-black text-white/40 tracking-[0.16em] uppercase h-3 truncate">{p.brand}</p>
      <p className="text-[12px] font-bold text-white leading-snug line-clamp-2 h-8 cursor-pointer hover:text-orange-500" onClick={onOpen}>{p.title}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-base font-black text-white">₹{fmt(p.price)}</span>
        {p.mrp && p.mrp > p.price && <span className="text-[11px] text-white/30 line-through">₹{fmt(p.mrp)}</span>}
      </div>
      <p className="text-[9px] text-emerald-400 font-bold h-4">{deliveryText(p.deliveryDays)}</p>
      <div className="mt-auto pt-1.5 flex flex-col gap-1.5">
        <button onClick={addToCart} disabled={p.outOfStock} className="h-[30px] orange-gradient-bg text-white text-[11px] font-bold rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-30">Add to Cart</button>
        {p.outOfStock
          ? <button onClick={() => { const u = currentUser(); if (!u) { say('Sign in from your profile to get a back-in-stock alert'); return; } writeStockAlert(u.uid, u.email || '', { id: p.id, title: p.title, image: p.imageUrls[0] }); say('We will email you when this is back in stock'); }} className="h-[30px] bg-white/10 border border-orange-500/40 text-orange-400 text-[11px] font-black rounded-full hover:bg-orange-500/10">Notify Me</button>
          : <button onClick={buyNow} className="h-[30px] border border-orange-500/60 text-orange-500 text-[11px] font-bold rounded-full hover:bg-orange-500/10 active:scale-95 transition-all">Buy Now</button>}
      </div>
    </div>
  </div>
);

/* ── Retail app ── */
export function RetailApp({ onExit, onOpenB2B, initialView }: { onExit?: () => void; onOpenB2B: () => void; initialView?: View | null }) {
  const [view, setView] = useState<View>(initialView ?? { t: 'home' });
  const [notifUser, setNotifUser] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const toggleCompare = (id: string) => setCompare(c => {
    if (c.includes(id)) return c.filter(x => x !== id);
    const cat = RPRODUCTS.find(p => p.id === id)?.macroId;
    if (c.length > 0 && RPRODUCTS.find(p => p.id === c[0])?.macroId !== cat) { say('You can compare products from the same category only'); return c; }
    if (c.length >= 4) { say('You can compare up to 4 products'); return c; }
    return [...c, id];
  });
  useEffect(() => {
    let un: (() => void) | undefined;
    const ua = watchAuth(u => { setNotifUser(u); if (un) { un(); un = undefined; } if (u) un = watchNotifications(u.uid, setNotifs); else setNotifs([]); });
    return () => { ua(); if (un) un(); };
  }, []);
  const [cart, setCart] = useLocal<CartLine[]>('tf360_rcart_v1', []);
  const [saved, setSaved] = useLocal<CartLine[]>('tf360_rsaved_v1', []);
  const [wish, setWish] = useLocal<string[]>('tf360_rwish_v1', []);
  const [addr, setAddr] = useLocal<any>('tf360_raddr_v1', null);
  const checkoutDefaultApplied = React.useRef(false);
  const [prof, setProf] = useLocal<any>('tf360_profile_v1', { name: 'TerraInfra User', phone: '+91 98765 43210', email: '', emailVerified: false, notificationsEnabled: true, memberSince: 'Jun 2026' });

  const [rLive, setRLive] = useState(0);
  useEffect(() => {
    fetchLiveRetail().then(res => {
      if (res && res.products.length) {
        replaceRetail(res.products, res.macros);
        setCart(cs => cs.filter(l => res.products.some(p => p.id === l.productId)));
        setSaved(ss => ss.filter(l => res.products.some(p => p.id === l.productId)));
        setRLive(t => t + 1);
        say('Live TI360 catalogue loaded');
      }
    });
  }, []);

  const cartQty = cart.reduce((a, l) => a + l.qty, 0);
  const lineProduct = (l: CartLine) => rProduct(l.productId);
  const linePrice = (l: CartLine) => {
    const p = lineProduct(l);
    const v = p.variants?.find(v => v.id === l.variantId);
    return v ? v.price : p.price;
  };
  const addLine = (id: string, qty = 1, variantId?: string) => {
    setCart(prev => {
      const k = prev.find(l => l.productId === id && l.variantId === variantId);
      if (k) return prev.map(l => l === k ? { ...l, qty: l.qty + qty } : l);
      return [...prev, { productId: id, qty, variantId, selected: true }];
    });
    say('Added to cart');
  };
  const toggleWish = (id: string) => setWish(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  const selected = cart.filter(l => l.selected && !lineProduct(l).outOfStock);
  const subtotal = selected.reduce((a, l) => a + linePrice(l) * l.qty, 0);
  const mrpTotal = selected.reduce((a, l) => { const p = lineProduct(l); const v = p.variants?.find(v => v.id === l.variantId); return a + ((v?.mrp ?? p.mrp ?? linePrice(l)) * l.qty); }, 0);
  const gstTotal = selected.reduce((a, l) => a + linePrice(l) * l.qty * ((lineProduct(l).gstPercent ?? 18) / 100), 0);
  const deliveryFee = subtotal === 0 || subtotal >= 999 ? 0 : 49;
  const payable = subtotal + deliveryFee;

  const placeOrder = (payment: string) => {
    const items = selected.map(l => ({ title: lineProduct(l).title, img: lineProduct(l).imageUrls[0], qty: l.qty }));
    saveOrder(newOrder(payable, payment, items, false));
    setCart(prev => prev.filter(l => !l.selected));
    setView({ t: 'orders' });
    say('Order placed!');
  };

  /* header */
  const Header = () => (
    <div className="sticky top-0 z-[70] bg-black/95 backdrop-blur-xl border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 pt-3 pb-2.5 flex items-center gap-3">
        {onExit && view.t === 'home'
          ? <button onClick={onExit} className="w-9 h-9 rounded-full border border-white/10 text-white/50 hover:text-orange-500 hover:border-orange-500 flex items-center justify-center"><ArrowLeft size={17} /></button>
          : view.t !== 'home'
            ? <button onClick={() => setView({ t: 'home' })} className="w-9 h-9 rounded-full border border-white/10 text-white/50 hover:text-orange-500 hover:border-orange-500 flex items-center justify-center"><ArrowLeft size={17} /></button>
            : <button className="w-9 h-9 rounded-full border border-white/10 text-white/50 flex items-center justify-center"><Menu size={17} /></button>}
        <button onClick={() => setView({ t: 'home' })} className="text-[17px] italic font-black tracking-tight text-white">Terra<span className="text-orange-500">Infra</span>Mart</button>
        <div className="flex-1" />
        <button onClick={() => setView({ t: 'wishlist' })} className="relative p-2 rounded-full text-white/60 hover:text-orange-500">
          <Heart size={19} className={wish.length ? 'fill-red-500 text-red-500' : ''} />
          {wish.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-orange-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black border border-black">{wish.length}</span>}
        </button>
        <button onClick={() => setView({ t: 'cart' })} className="relative p-2 rounded-full text-white/60 hover:text-orange-500">
          <ShoppingCart size={19} />
          {cartQty > 0 && <span className="absolute -top-0.5 -right-0.5 bg-orange-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black border border-black">{cartQty}</span>}
        </button>
      </div>
      {view.t !== 'cart' && view.t !== 'checkout' && (<div className="max-w-7xl mx-auto px-4 pb-3">
        <SearchBox placeholder="AI Search — materials, tools, suppliers…" onSubmit={sq => setView({ t: 'list', macroId: null, q: sq })} suggestions={RPRODUCTS.map(x => ({ id: x.id, title: x.title, image: x.imageUrls?.[0] }))} onPick={id => setView({ t: 'detail', id })} />
      </div>)}
    </div>
  );

  /* home pieces */
  const [sortBy, setSortBy] = useState('');
  const [rankOpen, setRankOpen] = useState(false);
  const [macroSel, setMacroSel] = useState<string | null>(null);

  const gridProducts = useMemo(() => {
    let ps = macroSel ? RPRODUCTS.filter(p => p.macroId === macroSel) : [...RPRODUCTS];
    if (sortBy === 'low') ps.sort((a, b) => a.price - b.price);
    if (sortBy === 'high') ps.sort((a, b) => b.price - a.price);
    if (sortBy === 'disc') ps.sort((a, b) => ((b.mrp ?? b.price) - b.price) / (b.mrp ?? b.price) - ((a.mrp ?? a.price) - a.price) / (a.mrp ?? a.price));
    return ps;
  }, [macroSel, sortBy, rLive]);

  const Home = () => (
    <div className="max-w-7xl mx-auto px-4 pb-20 space-y-6">
      {/* keyword chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pt-4">
        {KEYWORDS.map(k => (
          <button key={k} onClick={() => setView({ t: 'list', macroId: null, q: k })} className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-[#111] border border-white/10 rounded-full text-[10px] font-black uppercase tracking-wide text-white/70 hover:border-orange-500/50 hover:text-orange-500">
            <Zap size={11} className="text-orange-500" />{k}
          </button>
        ))}
      </div>

      {/* B2B promo strip */}
      <B2BStrip onOpen={onOpenB2B} />

      {/* macro strip */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[9px] font-black text-orange-500 tracking-[0.25em] uppercase">Our Expertise</p>
            <h2 className="text-xl font-black text-white tracking-tight">Specialized Inventory</h2>
          </div>
          <button onClick={() => setView({ t: 'macros' })} className="flex items-center gap-1.5 px-4 py-2 orange-gradient-bg rounded-full text-[10px] font-black text-white uppercase tracking-wide shadow-lg shadow-orange-500/20">
            <LayoutGrid size={12} /> Explore
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => setView({ t: 'list', macroId: null })} className="shrink-0 flex flex-col items-center gap-1.5 w-[78px]">
            <span className={`w-[74px] h-[74px] rounded-xl flex items-center justify-center bg-[#111] border-2 ${macroSel === null ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'border-white/10'}`}><LayoutGrid size={24} className="text-white/60" /></span>
            <span className="text-[10px] font-extrabold text-white/60 leading-tight text-center">All</span>
          </button>
          {MACROS.map(m => (
            <button key={m.id} onClick={() => setView({ t: 'list', macroId: m.id })} className="shrink-0 flex flex-col items-center gap-1.5 w-[78px]">
              <span className={`w-[74px] h-[74px] rounded-xl overflow-hidden border-2 ${macroSel === m.id ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'border-white/10'}`}>
                <img src={m.imageUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={m.name} />
              </span>
              <span className="text-[10px] font-extrabold text-white/60 leading-tight text-center line-clamp-2">{m.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* offer zone */}
      <OfferZoneStrip />

      {/* recommended for you */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[12px] font-black text-white tracking-[0.12em]">RECOMMENDED FOR YOU ✨</h2>
          <button onClick={() => setView({ t: 'list', macroId: null })} className="text-[10px] font-black text-orange-500 uppercase tracking-wide hover:underline">View all</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {[...RPRODUCTS].sort((a, b) => ((b.mrp ?? b.price) - b.price) / (b.mrp ?? b.price) - ((a.mrp ?? a.price) - a.price) / (a.mrp ?? a.price)).slice(0, 10).map(p => (
            <div key={p.id} className="w-[210px] sm:w-[230px] shrink-0">
              <RCard p={p} onOpen={() => setView({ t: 'detail', id: p.id })} wish={wish.includes(p.id)} toggleWish={() => toggleWish(p.id)} addToCart={() => addLine(p.id)} buyNow={() => say('Coming soon - online purchase is not available yet')} compared={compare.includes(p.id)} onCompare={() => toggleCompare(p.id)} />
            </div>
          ))}
        </div>
      </section>

      {/* recently viewed */}
      {loadViewed().length > 0 && (
        <section>
          <h2 className="text-[12px] font-black text-white tracking-[0.12em] mb-3">RECENTLY VIEWED</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {loadViewed().map(id => RPRODUCTS.find(p => p.id === id)).filter(Boolean).map((p: any) => (
              <div key={p.id} className="w-[210px] sm:w-[230px] shrink-0">
              <RCard p={p} onOpen={() => setView({ t: 'detail', id: p.id })} wish={wish.includes(p.id)} toggleWish={() => toggleWish(p.id)} addToCart={() => addLine(p.id)} buyNow={() => say('Coming soon - online purchase is not available yet')} compared={compare.includes(p.id)} onCompare={() => toggleCompare(p.id)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* filter / sort bar + grid */}
      <section>
        <div className="flex items-center gap-2.5 mb-4 relative">
          <button onClick={() => setView({ t: 'macros' })} className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-white/10 rounded-full text-[12px] font-extrabold text-white hover:border-orange-500/50"><SlidersHorizontal size={13} /> Specify</button>
          <button onClick={() => setRankOpen(o => !o)} className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-white/10 rounded-full text-[12px] font-extrabold text-white hover:border-orange-500/50"><ArrowUpDown size={13} /> Rank {sortBy && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}</button>
          {rankOpen && (
            <div className="absolute left-0 top-11 z-40 w-52 bg-[#111] border border-white/10 rounded-xl py-1.5 shadow-2xl">
              {[{ l: 'Price: Low to High', v: 'low' }, { l: 'Price: High to Low', v: 'high' }, { l: 'Discount: High to Low', v: 'disc' }].map(o => (
                <button key={o.v} onClick={() => { setSortBy(sortBy === o.v ? '' : o.v); setRankOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-wide flex items-center justify-between ${sortBy === o.v ? 'text-orange-500 bg-orange-500/10' : 'text-white/50 hover:text-orange-500'}`}>{o.l}{sortBy === o.v && <Check size={11} />}</button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[9px] font-black text-orange-500 tracking-[0.25em] uppercase">Curated</p>
            <h2 className="text-xl font-black text-white tracking-tight truncate">{macroSel ? MACROS.find(m => m.id === macroSel)?.name : 'Featured For Your Site'}</h2>
          </div>
          <span className="text-[11px] font-bold text-white/40">{gridProducts.length} items</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {gridProducts.map(p => (
            <RCard key={p.id} p={p} onOpen={() => setView({ t: 'detail', id: p.id })} wish={wish.includes(p.id)} toggleWish={() => toggleWish(p.id)} addToCart={() => addLine(p.id)} buyNow={() => say('Coming soon - online purchase is not available yet')} compared={compare.includes(p.id)} onCompare={() => toggleCompare(p.id)} />
          ))}
        </div>
      </section>
    </div>
  );

  /* macros screen */
  const MacrosScreen = () => (
    <div className="max-w-7xl mx-auto px-4 pb-20 pt-5">
      <p className="text-[10px] font-black text-orange-500 tracking-[0.25em] uppercase">Departments</p>
      <h1 className="text-2xl font-black text-white tracking-tight mb-1">Shop by Category</h1>
      <p className="text-xs text-white/40 font-semibold mb-6">Pick a department to browse its inventory</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {MACROS.map(m => (
          <button key={m.id} onClick={() => setView({ t: 'list', macroId: m.id })} className="rounded-2xl overflow-hidden border border-white/10 hover:border-orange-500/50 bg-[#111] text-left group">
            <div className="h-32 overflow-hidden bg-black/40"><img src={m.imageUrl} referrerPolicy="no-referrer" alt="" onError={imgFallback} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
            <div className="p-3">
              <p className="text-[12px] font-black text-white leading-tight">{m.name}</p>
              <p className="text-[9px] font-extrabold text-orange-500 mt-1 flex items-center gap-1">Shop Now <ChevronRight size={10} /></p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  /* product list (category / search results) with filters + sort */
  const ListScreen = ({ macroId, query }: { macroId: string | null; query?: string }) => {
    const PMAX = Math.max(...RPRODUCTS.map(p => p.price));
    const [cats, setCats] = useState<string[]>(macroId ? [macroId] : []);
    const [brands, setBrands] = useState<string[]>([]);
    const [maxP, setMaxP] = useState(PMAX);
    const [sort, setSort] = useState('rec');
    const [sortOpen, setSortOpen] = useState(false);
    const [showF, setShowF] = useState(false);
    const SORTS: [string, string][] = [['rec', 'Recommended'], ['plh', 'Price: Low to High'], ['phl', 'Price: High to Low'], ['disc', 'Better Discount'], ['rate', 'Customer Rating']];
    const base = RPRODUCTS.filter(p => query ? (p.title + ' ' + (p.brand ?? '') + ' ' + (MACROS.find(m => m.id === p.macroId)?.name ?? '')).toLowerCase().includes(query.toLowerCase()) : true);
    const brandList = [...new Set(base.map(p => p.brand ?? ''))].filter(Boolean).sort();
    let ps = base.filter(p => (cats.length === 0 || cats.includes(p.macroId)) && (brands.length === 0 || brands.includes(p.brand ?? '')) && p.price <= maxP);
    if (sort === 'plh') ps = [...ps].sort((a, b) => a.price - b.price);
    if (sort === 'phl') ps = [...ps].sort((a, b) => b.price - a.price);
    if (sort === 'disc') ps = [...ps].sort((a, b) => ((b.mrp ?? b.price) - b.price) / (b.mrp ?? b.price) - ((a.mrp ?? a.price) - a.price) / (a.mrp ?? a.price));
    if (sort === 'rate') ps = [...ps].sort((a, b) => b.rating - a.rating);
    const tgl = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
    const Box = ({ on }: { on: boolean }) => (
      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${on ? 'bg-orange-500 border-orange-500' : 'border-white/25'}`}>{on && <Check size={11} className="text-white" />}</span>
    );
    const title = query ? `Results for "${query}"` : (macroId ? MACROS.find(m => m.id === macroId)?.name : 'All Products');
    const active = cats.length + brands.length + (maxP < PMAX ? 1 : 0);
    return (
      <div className="max-w-7xl mx-auto px-4 pb-20 pt-5">
        <p className="text-[10px] text-white/40 font-bold mb-1">Home / Shop / <span className="text-white">{title}</span></p>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h1 className="text-lg font-black text-white">{title} <span className="text-white/40 text-xs font-bold">- {ps.length} items</span></h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowF(f => !f)} className="lg:hidden h-9 px-4 bg-[#111] border border-white/10 rounded-lg text-[11px] font-bold text-white flex items-center gap-2"><SlidersHorizontal size={12} /> Filters{active > 0 && <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[8px] font-black flex items-center justify-center">{active}</span>}</button>
            <div className="relative">
              <button onClick={() => setSortOpen(o => !o)} className="h-9 px-4 bg-[#111] border border-white/10 rounded-lg text-[11px] text-white/60 flex items-center gap-2 hover:border-orange-500/50">
                Sort by : <span className="font-black text-white">{SORTS.find(x => x[0] === sort)?.[1]}</span> <ChevronDown size={13} className={sortOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-10 z-40 w-56 bg-[#111] border border-white/10 rounded-xl py-1.5 shadow-2xl">
                  {SORTS.map(([v, l]) => (
                    <button key={v} onClick={() => { setSort(v); setSortOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-wide flex items-center justify-between ${sort === v ? 'text-orange-500 bg-orange-500/10' : 'text-white/50 hover:text-orange-500'}`}>{l}{sort === v && <Check size={11} />}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 items-start">
          <aside className={`${showF ? 'block' : 'hidden'} lg:block bg-[#111] border border-white/8 rounded-2xl p-4 lg:sticky lg:top-36`}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-white tracking-[0.15em]">FILTERS</p>
              {active > 0 && <button onClick={() => { setCats([]); setBrands([]); setMaxP(PMAX); }} className="text-[9px] font-black text-orange-500 uppercase hover:underline">Clear all</button>}
            </div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2.5">Categories</p>
            <div className="space-y-2 mb-5">
              {MACROS.map(m => { const n = base.filter(p => p.macroId === m.id).length; if (!n) return null; return (
                <button key={m.id} onClick={() => tgl(cats, setCats, m.id)} className="flex items-center gap-2.5 w-full text-left group">
                  <Box on={cats.includes(m.id)} />
                  <span className="text-[11px] text-white/70 group-hover:text-white truncate">{m.name}</span>
                  <span className="text-[9px] text-white/30 font-bold">({n})</span>
                </button>
              ); })}
            </div>
            <div className="h-px bg-white/8 mb-4" />
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2.5">Brand</p>
            <div className="space-y-2 mb-5">
              {brandList.map(b => { const n = base.filter(p => p.brand === b).length; return (
                <button key={b} onClick={() => tgl(brands, setBrands, b)} className="flex items-center gap-2.5 w-full text-left group">
                  <Box on={brands.includes(b)} />
                  <span className="text-[11px] text-white/70 group-hover:text-white truncate">{b}</span>
                  <span className="text-[9px] text-white/30 font-bold">({n})</span>
                </button>
              ); })}
            </div>
            <div className="h-px bg-white/8 mb-4" />
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3">Price</p>
            <input type="range" min={0} max={PMAX} step={50} value={maxP} onChange={e => setMaxP(Number(e.target.value))} className="w-full accent-orange-500" />
            <p className="text-[10px] text-white/50 font-bold mt-1">₹0 – ₹{fmt(maxP)}{maxP >= PMAX ? '+' : ''}</p>
          </aside>
          <div>
            {ps.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {ps.map(p => <RCard key={p.id} p={p} onOpen={() => setView({ t: 'detail', id: p.id })} wish={wish.includes(p.id)} toggleWish={() => toggleWish(p.id)} addToCart={() => addLine(p.id)} buyNow={() => say('Coming soon - online purchase is not available yet')} compared={compare.includes(p.id)} onCompare={() => toggleCompare(p.id)} />)}
              </div>
            ) : (
              <div className="py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center"><Search size={24} className="text-white/30" /></div>
                <p className="text-white font-black mb-1">No matching products</p>
                <p className="text-white/40 text-xs">Try clearing some filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* product detail */
  const DetailScreen = ({ id }: { id: string }) => {
    const p = rProduct(id);
    const [variant, setVariant] = useState<Variant | undefined>(p.variants?.[0]);
    const [qty, setQty] = useState(1);
    const [open, setOpen] = useState<string | null>('Description');
    const [img, setImg] = useState(0);
    useEffect(() => { setVariant(p.variants?.[0]); setQty(1); setImg(0); window.scrollTo({ top: 0 }); saveViewed(id); }, [id]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [rStar, setRStar] = useState(5);
    const [rTxt, setRTxt] = useState('');
    const [rImgs, setRImgs] = useState<string[]>([]);
    const [rBusy, setRBusy] = useState(false);
    const myUid = currentUser()?.uid;
    useEffect(() => watchReviews(id, setReviews), [id]);
    const addPhoto = (file: File) => {
      if (rImgs.length >= 3) { say('Up to 3 photos per review'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const im = new Image();
        im.onload = () => {
          const MAX = 600; let w = im.width, h = im.height;
          if (w > h && w > MAX) { h = Math.round(h * MAX / w); w = MAX; } else if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          const ctx = c.getContext('2d'); if (ctx) ctx.drawImage(im, 0, 0, w, h);
          setRImgs(prev => [...prev, c.toDataURL('image/jpeg', 0.55)]);
        };
        im.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    };
    const postReview = async () => {
      const u = currentUser();
      if (!u) { say('Sign in from your profile to post a review'); return; }
      if (!rTxt.trim()) { say('Write a few words for your review'); return; }
      setRBusy(true);
      const res = await submitReview(u.uid, u.displayName || u.email || 'Customer', id, rStar, rTxt.trim(), rImgs);
      setRBusy(false);
      if (res.ok) { setRTxt(''); setRStar(5); setRImgs([]); say('Review posted!'); } else { say('Could not post review: ' + (res.error || '')); }
    };
    const price = variant?.price ?? p.price;
    const mrp = variant?.mrp ?? p.mrp;
    const gallery = [p.imageUrls[0], p.imageUrls[0], p.imageUrls[0]];
    const similar = RPRODUCTS.filter(x => x.macroId === p.macroId && x.id !== p.id).slice(0, 5);
    const sections: [string, React.ReactNode][] = [
      ['Description', <p className="text-xs text-white/60 leading-relaxed">{p.description}</p>],
      ['Features', <ul className="space-y-2">{p.bullets.map((b, i) => <li key={i} className="flex gap-2 text-xs text-white/60"><Check size={12} className="text-orange-500 shrink-0 mt-0.5" />{b}</li>)}</ul>],
      ['Delivery & Returns', <p className="text-xs text-white/60 leading-relaxed">{deliveryText(p.deliveryDays)}. Free delivery on orders above ₹999. 7-day return on eligible items.</p>],
      ['Warranty', <p className="text-xs text-white/60">{p.warranty ?? 'No warranty information available.'}</p>],
    ];
    return (
      <div className="max-w-7xl mx-auto px-4 pb-28 pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden bg-[#111] border border-white/8" style={{ aspectRatio: '1/1' }}>
              <img src={gallery[img]} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={p.title} />
              {mrp && mrp > price && <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">-{Math.round((1 - price / mrp) * 100)}%</span>}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">{gallery.map((_, i) => <span key={i} className={`h-1.5 rounded-full ${i === img ? 'w-4 bg-orange-500' : 'w-1.5 bg-white/30'}`} />)}</div>
            </div>
            <div className="flex gap-2 mt-3">{gallery.map((g, i) => <button key={i} onClick={() => setImg(i)} className={`w-14 h-14 rounded-lg overflow-hidden border-2 ${img === i ? 'border-orange-500' : 'border-white/10 opacity-60'}`}><img src={g} referrerPolicy="no-referrer" className="w-full h-full object-cover" /></button>)}</div>
          </div>
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-orange-500 tracking-[0.2em] uppercase">{p.brand}</span>
                <span className="bg-emerald-500/15 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Authorized Store</span>
              </div>
              <h1 className="text-xl font-black text-white leading-tight">{p.title}</h1>
              <div className="flex items-center gap-2 mt-2"><Stars r={p.rating} /><span className="text-[11px] text-white/50 font-bold">{p.rating} · {fmt(p.reviews)} ratings</span>{!p.outOfStock && <span className="text-[9px] font-black text-emerald-400 uppercase">In Stock</span>}</div>
            </div>
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-black text-white">₹{fmt(price)}</span>
                {mrp && mrp > price && <><span className="text-sm text-white/30 line-through">₹{fmt(mrp)}</span><span className="text-xs font-black text-emerald-400">You save ₹{fmt(mrp - price)}</span></>}
              </div>
              <p className="text-[10px] text-white/40 mt-0.5">Inclusive of all taxes · GST {p.gstPercent ?? 18}%</p>
            </div>
            {p.variants && (
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Select Option</p>
                <div className="flex flex-wrap gap-2">{p.variants.map(v => (
                  <button key={v.id} onClick={() => setVariant(v)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide border flex items-center gap-1.5 ${variant?.id === v.id ? 'orange-gradient-bg text-white border-transparent' : 'bg-black/30 text-white/60 border-white/10 hover:border-orange-500/40'}`}>{variant?.id === v.id && <Check size={11} />}{v.label}</button>
                ))}</div>
              </div>
            )}
            <div className="p-4 bg-[#111] border border-white/8 rounded-2xl flex items-center gap-3">
              <Truck size={18} className="text-emerald-400 shrink-0" />
              <div><p className="text-xs font-black text-white">{deliveryText(p.deliveryDays)}</p><p className="text-[10px] text-white/40">Free delivery over ₹999 · ₹49 below</p></div>
            </div>
            <div className="flex items-center gap-3"><span className="text-xs font-bold text-white/60">Quantity:</span><Stepper qty={qty} set={setQty} /></div>
            {p.outOfStock ? (
              <button onClick={() => { const u = currentUser(); if (!u) { say('Sign in from your profile to get a back-in-stock alert'); return; } writeStockAlert(u.uid, u.email || '', { id: p.id, title: p.title, image: p.imageUrls[0] }); say('We will email you when this is back in stock'); }} className="w-full h-11 bg-white/10 border border-orange-500/40 text-white text-[11px] font-black uppercase tracking-wide rounded-xl hover:bg-orange-500/10">Notify Me When Available</button>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => addLine(p.id, qty, variant?.id)} className="h-11 border border-white/15 text-white text-[11px] font-black uppercase tracking-wide rounded-xl hover:border-orange-500/50">Add to Cart</button>
                <button onClick={() => say('Coming soon - online purchase is not available yet')} className="h-11 orange-gradient-bg text-white text-[11px] font-black uppercase tracking-wide rounded-xl hover:opacity-90">Buy Now</button>
              </div>
            )}
            <div className="divide-y divide-white/8 border border-white/8 rounded-2xl bg-[#111] overflow-hidden">
              {sections.map(([t, body]) => (
                <div key={t}>
                  <button onClick={() => setOpen(open === t ? null : t)} className="w-full px-4 py-3.5 flex items-center justify-between text-left">
                    <span className="text-xs font-black text-white">{t}</span>
                    <ChevronDown size={14} className={`text-white/40 transition-transform ${open === t ? 'rotate-180' : ''}`} />
                  </button>
                  {open === t && <div className="px-4 pb-4">{body}</div>}
                </div>
              ))}
            </div>
            <div className="border border-white/8 rounded-2xl bg-[#111] p-4">
              <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mb-3">Specifications</p>
              {[['Brand', p.brand ?? '—'], ['Department', MACROS.find(m => m.id === p.macroId)?.name ?? '—'], ['GST', `${p.gstPercent ?? 18}%`], ['Warranty', p.warranty ?? '—'], ['Dispatch', `${p.deliveryDays} day(s)`]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-white/5 last:border-0"><span className="text-[11px] text-white/40">{k}</span><span className="text-[11px] font-bold text-white">{v}</span></div>
              ))}
            </div>
          </div>
        </div>
        <section className="mt-10 max-w-3xl">
          <h2 className="text-base font-black text-white mb-1">Ratings &amp; Reviews</h2>
          <p className="text-[11px] text-white/40 mb-4">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          <div className="bg-[#111] border border-white/8 rounded-2xl p-4 mb-4">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3">Write a review</p>
            <div className="flex items-center gap-1 mb-3">{[1, 2, 3, 4, 5].map(s => <button key={s} onClick={() => setRStar(s)}><Star size={22} className={s <= rStar ? 'text-orange-500 fill-orange-500' : 'text-white/20'} /></button>)}</div>
            <textarea value={rTxt} onChange={e => setRTxt(e.target.value)} maxLength={400} rows={3} placeholder="Share your experience with this product..." className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500/50 resize-none mb-3" />
            <div className="flex items-center gap-2 mb-3">
              {rImgs.map((im, k) => (<div key={k} className="relative w-14 h-14"><img src={im} alt="" className="w-14 h-14 rounded-lg object-cover border border-white/10" /><button onClick={() => setRImgs(prev => prev.filter((_, j) => j !== k))} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center"><X size={9} /></button></div>))}
              {rImgs.length < 3 && <label className="w-14 h-14 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer text-white/40 hover:text-orange-500 hover:border-orange-500/50"><Plus size={16} /><span className="text-[7px] font-black uppercase">Photo</span><input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) addPhoto(file); e.currentTarget.value = ''; }} /></label>}
            </div>
            <button disabled={rBusy} onClick={postReview} className="px-6 h-10 orange-gradient-bg text-white text-[10px] font-black uppercase tracking-wide rounded-xl disabled:opacity-40">{rBusy ? 'Posting...' : 'Post Review'}</button>
          </div>
          {reviews.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-6 bg-[#111] border border-white/8 rounded-2xl">No reviews yet. Be the first to review this product.</p>
          ) : (
            <div className="space-y-3">{reviews.map((rv: any) => (
              <div key={rv.id} className="bg-[#111] border border-white/8 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-white">{rv.userName || 'Customer'}</span>
                  <span className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} className={s <= (rv.rating || 0) ? 'text-orange-500 fill-orange-500' : 'text-white/15'} />)}</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">{rv.text}</p>
                {Array.isArray(rv.images) && rv.images.length > 0 && <div className="flex gap-2 mt-2.5">{rv.images.map((im: string, k: number) => <img key={k} src={im} alt="" className="w-16 h-16 rounded-lg object-cover border border-white/10" />)}</div>}
                {myUid && rv.userId === myUid && <button onClick={async () => { if (await deleteReview(rv.id)) say('Review deleted'); }} className="mt-2.5 text-[9px] font-black text-red-400 uppercase tracking-wide hover:underline">Delete my review</button>}
              </div>
            ))}</div>
          )}
        </section>
        {similar.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-black text-white mb-4">More in {MACROS.find(m => m.id === p.macroId)?.name}</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">{similar.map(s => (
              <div key={s.id} className="w-[180px] shrink-0"><RCard p={s} onOpen={() => setView({ t: 'detail', id: s.id })} wish={wish.includes(s.id)} toggleWish={() => toggleWish(s.id)} addToCart={() => addLine(s.id)} buyNow={() => say('Coming soon - online purchase is not available yet')} /></div>
            ))}</div>
          </section>
        )}
      </div>
    );
  };

  /* cart */
  const CartScreen = () => {
    const allSel = cart.length > 0 && cart.every(l => l.selected);
    return (
      <div className="max-w-3xl mx-auto px-4 pb-32 pt-5">
        <div className="flex items-end justify-between mb-4">
          <div><h1 className="text-xl font-black text-white">Shopping Cart</h1><p className="text-[10px] text-white/40 font-bold uppercase tracking-wide">{selected.reduce((a, l) => a + l.qty, 0)} selected units</p></div>
          <div className="text-right"><p className="text-[9px] text-white/40 font-black uppercase">Subtotal</p><p className="text-lg font-black text-orange-500">₹{fmt(subtotal)}</p></div>
        </div>
        {cart.length === 0 ? (
          <div className="py-24 text-center bg-[#111] border border-white/8 rounded-2xl">
            <ShoppingCart size={40} className="mx-auto text-white/20 mb-4" />
            <p className="text-white font-black mb-1">Your Cart is empty</p>
            <button onClick={() => setView({ t: 'home' })} className="mt-3 px-6 py-2.5 orange-gradient-bg text-white text-[10px] font-black uppercase tracking-wide rounded-full">Shop Featured Deals</button>
          </div>
        ) : (
          <>
            <button onClick={() => setCart(cs => cs.map(l => ({ ...l, selected: !allSel })))} className="flex items-center gap-2 mb-3 text-[11px] font-bold text-white/60 hover:text-white">
              <span className={`w-4 h-4 rounded border flex items-center justify-center ${allSel ? 'bg-orange-500 border-orange-500' : 'border-white/30'}`}>{allSel && <Check size={11} className="text-white" />}</span>
              {allSel ? 'Deselect all items' : 'Select all items'}
            </button>
            <div className="space-y-3">
              {cart.map(l => {
                const p = lineProduct(l); const v = p.variants?.find(v => v.id === l.variantId);
                return (
                  <div key={p.id + (l.variantId ?? '')} className={`bg-[#111] border border-white/8 rounded-2xl p-3.5 flex gap-3 ${p.outOfStock ? 'opacity-60' : ''}`}>
                    <button onClick={() => setCart(cs => cs.map(x => x === l ? { ...x, selected: !x.selected } : x))} className={`w-5 h-5 rounded border self-center flex items-center justify-center shrink-0 ${l.selected ? 'bg-orange-500 border-orange-500' : 'border-white/30'}`}>{l.selected && <Check size={12} className="text-white" />}</button>
                    <img src={p.imageUrls[0]} referrerPolicy="no-referrer" className="w-[76px] h-[76px] rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white line-clamp-2">{p.title}</p>
                      {v && <p className="text-[10px] font-black text-orange-500 mt-0.5">Variant: {v.label}</p>}
                      {p.outOfStock
                        ? <p className="text-[10px] font-black text-red-500 mt-0.5">Out of stock</p>
                        : <p className="text-[10px] text-emerald-400 font-bold mt-0.5">● In Stock · {deliveryText(p.deliveryDays)}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <Stepper qty={l.qty} set={n => setCart(cs => cs.map(x => x === l ? { ...x, qty: n } : x))} />
                        <span className="text-sm font-black text-white">₹{fmt(linePrice(l) * l.qty)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 self-start">
                      <button title="Save for later" onClick={() => { setSaved(s => [...s, l]); setCart(cs => cs.filter(x => x !== l)); }} className="text-white/40 hover:text-orange-500"><BookmarkPlus size={15} /></button>
                      <button title="Remove" onClick={() => setCart(cs => cs.filter(x => x !== l))} className="text-white/40 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
            {saved.length > 0 && (
              <section className="mt-8">
                <h3 className="text-xs font-black text-white mb-3 flex items-center gap-2">Awaited Selections <span className="bg-white/10 text-white/60 text-[9px] px-1.5 py-0.5 rounded-full">{saved.length}</span></h3>
                <div className="space-y-2.5">{saved.map(l => { const p = lineProduct(l); return (
                  <div key={'s' + p.id + (l.variantId ?? '')} className="bg-[#111]/60 border border-white/8 rounded-2xl p-3 flex gap-3 items-center">
                    <img src={p.imageUrls[0]} referrerPolicy="no-referrer" className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-white/70 line-clamp-1">{p.title}</p><p className="text-xs font-black text-white mt-0.5">₹{fmt(linePrice(l))}</p></div>
                    <button onClick={() => { setCart(cs => [...cs, { ...l, selected: true }]); setSaved(s => s.filter(x => x !== l)); }} className="text-[10px] font-black text-orange-500 uppercase hover:underline">Add to Bag</button>
                    <button onClick={() => setSaved(s => s.filter(x => x !== l))} className="text-[10px] font-black text-white/40 uppercase hover:text-red-500">Remove</button>
                  </div>
                ); })}</div>
              </section>
            )}
            <div className="fixed bottom-0 left-0 right-0 z-[80] bg-black/95 backdrop-blur-xl border-t border-white/10">
              <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
                <div><p className="text-[9px] font-black text-white/40 uppercase">Grand Total</p><p className="text-lg font-black text-white">₹{fmt(payable)}</p>{deliveryFee === 0 && subtotal > 0 && <p className="text-[9px] font-black text-emerald-400">Free Delivery</p>}</div>
                <button disabled={selected.length === 0} onClick={() => say('Coming soon - online purchase is not available yet')} className="flex-1 max-w-xs h-12 orange-gradient-bg text-white text-[11px] font-black uppercase tracking-wide rounded-xl disabled:opacity-30">Proceed ({selected.reduce((a, l) => a + l.qty, 0)})</button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  /* checkout */
  const CheckoutScreen = () => {
    const [showAddr, setShowAddr] = useState(!addr);
    const [form, setForm] = useState(addr ?? { name: '', phone: '', line1: '', city: '', state: '', pincode: '' });
    const [pay, setPay] = useState('UPI');
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState<any[]>([]);
    useEffect(() => {
      const readLocal = (key: string, label: string) => { try { const a = JSON.parse(localStorage.getItem(key) || 'null'); return (a && a.line1) ? [{ id: key, _local: label, ...a }] : []; } catch { return []; } };
      const local = [...readLocal('tf360_raddr_v1', 'Retail'), ...readLocal('tf360_baddr_v1', 'Business')];
      const u = currentUser();
      if (!u) { setSaved(local); return; }
      return watchAddresses(u.uid, rows => setSaved([...rows, ...local]));
    }, []);
    useEffect(() => {
      if (checkoutDefaultApplied.current) return;
      let did = ''; try { did = localStorage.getItem('tf360_default_addr') || ''; } catch { /* noop */ }
      const pick = (did && saved.find(a => a.id === did)) || (!addr && saved[0]) || null;
      if (pick) { setAddr(pick); checkoutDefaultApplied.current = true; }
    }, [saved]);
    const oos = cart.filter(l => l.selected && lineProduct(l).outOfStock).length;
    const ready = !!addr && selected.length > 0;
    return (
      <div className="max-w-3xl mx-auto px-4 pb-44 pt-5">
        <h1 className="text-xl font-black text-white mb-5">Review Order</h1>
        <button onClick={() => setShowAddr(true)} className="w-full text-left bg-[#111] border border-white/10 rounded-2xl p-5 flex items-center gap-4 mb-4 hover:border-orange-500/40">
          <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0"><MapPin size={20} className="text-orange-500" /></span>
          <span className="flex-1 min-w-0">
            <span className="block text-[9px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">Deliver To</span>
            {addr ? (<>
              <span className="block text-[15px] font-bold text-white">{addr.name || addr.line1 || 'Saved address'}</span>
              <span className="block text-xs text-white/60">{[addr.line1, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</span>
              {addr.phone && <span className="block text-[11px] text-white/40">{addr.phone}</span>}
              <span className="block text-[10px] font-black text-orange-400 uppercase tracking-wider mt-1">Tap to change</span>
            </>) : <span className="block text-xs text-white/50">Tap to add a delivery address</span>}
          </span>
          <ChevronRight size={16} className="text-white/40 shrink-0" />
        </button>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3"><h3 className="text-sm font-black text-white">Review Items</h3><span className="bg-white/10 text-white/60 text-[9px] font-black px-1.5 py-0.5 rounded-full">{selected.length}</span></div>
          {oos > 0 && <div className="mb-3 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-[10px] font-bold text-yellow-300">{oos} out-of-stock item(s) excluded from this order.</div>}
          <div className="space-y-3">{selected.map(l => { const p = lineProduct(l); return (
            <div key={'c' + p.id + (l.variantId ?? '')} className="flex items-center gap-3">
              <img src={p.imageUrls[0]} referrerPolicy="no-referrer" className="w-[64px] h-[64px] rounded-xl object-cover" />
              <div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-white line-clamp-2">{p.title}</p><p className="text-[9px] font-black text-orange-500 uppercase mt-0.5">Qty {l.qty}</p></div>
              <span className="text-xs font-black text-white">₹{fmt(linePrice(l) * l.qty)}</span>
            </div>
          ); })}</div>
        </div>
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-black text-white mb-3">Payment Method</h3>
          {['UPI', 'CARD', 'COD'].map(m => (
            <button key={m} onClick={() => setPay(m)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border mb-2 ${pay === m ? 'border-orange-500 bg-orange-500/10' : 'border-white/10'}`}>
              <span className="text-xs font-bold text-white">{m === 'UPI' ? 'UPI / Netbanking' : m === 'CARD' ? 'Credit / Debit Card' : 'Cash on Delivery'}</span>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${pay === m ? 'border-orange-500' : 'border-white/25'}`}>{pay === m && <span className="w-2 h-2 rounded-full bg-orange-500" />}</span>
            </button>
          ))}
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-[80] bg-black/95 backdrop-blur-xl border-t border-white/10 rounded-t-[28px]">
          <div className="max-w-3xl mx-auto px-5 py-4">
            {[['Total MRP', `₹${fmt(mrpTotal)}`], ['GST (included)', `₹${fmt(gstTotal)}`], ['Logistics Fee', deliveryFee === 0 ? 'GRATIS' : `₹${deliveryFee}`], ['Discount', `- ₹${fmt(Math.max(0, mrpTotal - subtotal))}`]].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs py-0.5"><span className="text-white/40">{k}</span><span className={`font-bold ${v === 'GRATIS' ? 'text-emerald-400' : String(k) === 'Discount' ? 'text-emerald-400' : 'text-white'}`}>{v}</span></div>
            ))}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div><p className="text-[9px] font-black text-white/40 uppercase">Payable</p><p className="text-2xl font-black text-white">₹{fmt(payable)}</p></div>
              <button disabled={!ready || busy} onClick={() => say('Coming soon - online purchase is not available yet')}
                className="px-8 h-12 orange-gradient-bg text-white text-[11px] font-black uppercase tracking-wide rounded-xl disabled:opacity-30 flex items-center gap-2">
                {busy ? 'Placing…' : addr ? 'Place Order' : 'Select Address'} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
        {showAddr && (
          <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setShowAddr(false)}>
            <div className="bg-[#111] border border-white/10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-black text-white mb-4">Select Delivery Address</h3>
              {saved.length > 0 && (
                <div className="space-y-2 mb-4">
                  {saved.map(a => {
                    const sel = !!addr && (a.id === addr.id || (a.line1 === addr.line1 && a.pincode === addr.pincode));
                    return (
                      <button key={a.id} onClick={() => { setAddr(a); setShowAddr(false); }} className={`w-full text-left p-3 rounded-xl border ${sel ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-orange-500/40'}`}>
                        <p className="text-xs font-bold text-white">{a.name || a.line1}{a._local && <span className="ml-2 text-[8px] font-black uppercase px-1 py-0.5 rounded bg-white/10 text-white/50">{a._local}</span>}</p>
                        <p className="text-[11px] text-white/50 mt-0.5">{[a.line1, a.city, a.pincode].filter(Boolean).join(', ')}</p>
                        {a.phone && <p className="text-[10px] text-white/35 mt-0.5">{a.phone}</p>}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">{saved.length > 0 ? 'Or add a new address' : 'Add a delivery address'}</p>
              {(['name', 'phone', 'line1', 'city', 'state', 'pincode'] as const).map(k => (
                <input key={k} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={k === 'line1' ? 'Address (building, street, area)' : k[0].toUpperCase() + k.slice(1)}
                  className="w-full mb-2.5 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50" />
              ))}
              <button onClick={() => { if (form.name && form.line1 && form.pincode) { setAddr(form); setShowAddr(false); } }} className="w-full h-11 orange-gradient-bg text-white text-[10px] font-black uppercase tracking-wide rounded-xl mt-1">Save Address</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* orders */
  const OrderScreen = ({ id }: { id: string }) => {
    const o = loadOrders().find(x => x.id === id);
    if (!o) return <div className="max-w-2xl mx-auto px-4 pt-12 text-center"><Receipt size={40} className="mx-auto text-white/20 mb-3" /><p className="text-white font-black">Order not found</p><button onClick={() => setView({ t: 'orders' })} className="mt-4 px-6 py-2.5 orange-gradient-bg text-white text-[10px] font-black uppercase rounded-full">Back to Orders</button></div>;
    const stages = ['Order Placed', 'Confirmed', 'Shipped', 'Delivered'];
    const p = o.status === 'DELIVERED' ? 100 : o.status === 'SHIPPED' ? 75 : o.status === 'CANCELLED' ? 0 : 25;
    const reached = (i: number) => o.status !== 'CANCELLED' && p >= (i + 1) * 25;
    const units = o.items.reduce((a, it) => a + it.qty, 0);
    return (
      <div className="max-w-2xl mx-auto px-4 pb-24 pt-5">
        <h1 className="text-xl font-black text-white mb-1">Order Tracking</h1>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-5">Order #{o.code} · {o.date}</p>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 mb-4">
          {[['Total', `₹${fmt(o.total)}`], ['Items', String(units)], ['Payment', o.payment]].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs py-1"><span className="text-white/40">{k}</span><span className="font-black text-white">{v}</span></div>
          ))}
        </div>
        {o.status === 'CANCELLED' ? (
          <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-5 text-center text-red-400 font-black mb-4">This order was cancelled.</div>
        ) : (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5 mb-4">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3">Live Tracking</p>
            {stages.map((s, i) => (
              <div key={s} className="flex items-center gap-3 py-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${reached(i) ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/40'}`}>{reached(i) ? <Check size={13} /> : i + 1}</span>
                <span className={`text-xs font-black ${reached(i) ? 'text-white' : 'text-white/40'}`}>{s}</span>
              </div>
            ))}
          </div>
        )}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">Items ({o.items.length})</p>
          <div className="space-y-3">{o.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0"><img src={it.img} referrerPolicy="no-referrer" className="w-full h-full object-cover" /></span>
              <span className="flex-1 min-w-0"><span className="block text-xs font-bold text-white truncate">{it.title}</span><span className="block text-[10px] text-white/40">Qty {it.qty}</span></span>
            </div>
          ))}</div>
        </div>
      </div>
    );
  };
  const OrdersScreen = () => {
    const orders = loadOrders();
    const stColor = (s: OrderRec['status']) => s === 'DELIVERED' ? 'text-emerald-400 bg-emerald-500/10' : s === 'CANCELLED' ? 'text-red-400 bg-red-500/10' : s === 'SHIPPED' ? 'text-sky-400 bg-sky-500/10' : 'text-amber-300 bg-amber-500/10';
    const pct = (s: OrderRec['status']) => s === 'DELIVERED' ? 100 : s === 'SHIPPED' ? 75 : s === 'CANCELLED' ? 0 : 25;
    return (
      <div className="max-w-3xl mx-auto px-4 pb-24 pt-5">
        <h1 className="text-xl font-black text-white mb-5">Your Orders</h1>
        {orders.length === 0 ? (
          <div className="py-24 text-center bg-[#111] border border-white/8 rounded-2xl">
            <Receipt size={40} className="mx-auto text-white/20 mb-4" />
            <p className="text-white font-black mb-1">No orders yet</p>
            <p className="text-white/40 text-xs mb-4">You haven't placed any orders.</p>
            <button onClick={() => setView({ t: 'home' })} className="px-6 py-2.5 orange-gradient-bg text-white text-[10px] font-black uppercase tracking-wide rounded-full">Start Shopping</button>
          </div>
        ) : (
          <div className="space-y-4">{orders.map(o => (
            <div key={o.id} onClick={() => setView({ t: 'order', id: o.id })} className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden cursor-pointer hover:border-orange-500/40 transition-colors">
              <div className="bg-white/5 px-4 py-3 flex items-center gap-6">
                <div><p className="text-[9px] font-black text-white/40 uppercase">Order Placed</p><p className="text-xs font-bold text-white">{o.date}</p></div>
                <div><p className="text-[9px] font-black text-white/40 uppercase">Total</p><p className="text-xs font-bold text-white">₹{fmt(o.total)}</p></div>
                <div className="ml-auto text-right"><p className="text-[9px] font-black text-white/40 uppercase">Order #</p><p className="text-xs font-bold text-white truncate max-w-[120px]">{o.code}</p></div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded ${stColor(o.status)}`}>{o.status}</span>
                  <span className="text-[9px] font-black uppercase text-white/50 bg-white/5 px-1.5 py-0.5 rounded">{o.payment}</span>
                  {o.isB2B && <span className="text-[9px] font-black uppercase text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">Business</span>}
                  <span className="ml-auto text-[10px] font-black text-emerald-400">{pct(o.status)}%</span>
                </div>
                <div className="relative h-[3px] bg-white/10 rounded-full mb-1.5"><span className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full" style={{ width: `${pct(o.status)}%` }} /></div>
                <div className="flex justify-between mb-3">{['Order Placed', 'Package Arrived', 'Package Shipped', 'Delivered'].map((s, i) => <span key={s} className={`text-[8px] font-bold ${pct(o.status) >= (i + 1) * 25 ? 'text-emerald-400' : 'text-white/30'}`}>{s}</span>)}</div>
                <div className="flex gap-2 mb-4">{o.items.slice(0, 4).map((it, i) => (
                  <span key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/10">
                    <img src={it.img} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    {i === 3 && o.items.length > 4 && <span className="absolute inset-0 bg-black/70 flex items-center justify-center text-[9px] font-black text-white">+{o.items.length - 3}</span>}
                  </span>
                ))}</div>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setView({ t: 'order', id: o.id }); }} className="px-4 h-9 border border-white/15 text-white text-[10px] font-black uppercase rounded-lg hover:border-orange-500/50">Track Package</button>
                  <button onClick={(e) => { e.stopPropagation(); say('Items added back to cart'); }} className="px-4 h-9 orange-gradient-bg text-white text-[10px] font-black uppercase rounded-lg">Order Again</button>
                </div>
              </div>
            </div>
          ))}</div>
        )}
      </div>
    );
  };

  /* wishlist */
  const WishlistScreen = () => {
    const ps = RPRODUCTS.filter(p => wish.includes(p.id));
    return (
      <div className="max-w-7xl mx-auto px-4 pb-20 pt-5">
        <h1 className="text-xl font-black text-white mb-5">Wishlist <span className="text-[10px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full align-middle ml-2">{ps.length} SAVED</span></h1>
        {ps.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">{ps.map(p => (
            <RCard key={p.id} p={p} onOpen={() => setView({ t: 'detail', id: p.id })} wish toggleWish={() => toggleWish(p.id)} addToCart={() => addLine(p.id)} buyNow={() => say('Coming soon - online purchase is not available yet')} compared={compare.includes(p.id)} onCompare={() => toggleCompare(p.id)} />
          ))}</div>
        ) : <p className="text-white/40 text-sm py-20 text-center">No saved materials yet.</p>}
      </div>
    );
  };


  /* My Profile — port of shop/profile/my_profile_screen.dart */
  const NotificationsScreen = () => (
    <div className="max-w-3xl mx-auto px-4 pb-20 pt-5">
      <h1 className="text-xl font-black text-white mb-1">Notifications</h1>
      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-5">{notifs.length} updates</p>
      {!notifUser && <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-[11px] font-bold text-amber-300 mb-4">Sign in from your profile to receive order updates, price drops and stock alerts.</div>}
      {notifs.length === 0 ? (
        <div className="py-20 text-center bg-[#111] border border-white/10 rounded-2xl"><Bell size={36} className="mx-auto text-white/20 mb-3" /><p className="text-white font-black">No notifications yet</p><p className="text-[11px] text-white/40 mt-1">Order updates, price drops and stock alerts appear here.</p></div>
      ) : (
        <div className="space-y-2.5">{notifs.map((n: any, i: number) => (
          <div key={n.id || i} className="w-full text-left bg-[#111] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0"><Bell size={15} /></span>
            <span className="flex-1 min-w-0"><span className="block text-xs font-black text-white">{n.title || 'Update'}</span><span className="block text-[10px] text-white/40">{n.body || ''}</span></span>
            <ChevronRight size={14} className="text-white/25" />
          </div>
        ))}</div>
      )}
    </div>
  );
  const ProfileScreen = () => {
    const orders = loadOrders();
    const quotes = (() => { try { return JSON.parse(localStorage.getItem('tf360_quotes_v1') || '[]').length + JSON.parse(localStorage.getItem('tf360_negos_v1') || '[]').length; } catch { return 0; } })();
    const [edit, setEdit] = useState(false);
    const [authUser, setAuthUser] = useState<any>(null);
    useEffect(() => watchAuth(u => setAuthUser(u)), []);
    const [b2bStatus, setB2bStatus] = useState<string | null>(null);
    useEffect(() => { if (!authUser) { setB2bStatus(null); return; } return watchMembership(authUser.uid, setB2bStatus); }, [authUser]);
    const [login, setLogin] = useState(false);
    const [lf, setLf] = useState({ email: '', pass: '', err: '', busy: false });
    const doLogin = async (g: boolean) => {
      setLf(x => ({ ...x, busy: true, err: '' }));
      try { g ? await loginGoogle() : await loginEmail(lf.email, lf.pass); setLogin(false); say('Signed in to TI360'); }
      catch (e: any) { setLf(x => ({ ...x, err: e?.code || 'Sign-in failed', busy: false })); return; }
      setLf(x => ({ ...x, busy: false }));
    };
    const [f, setF] = useState({ name: prof.name, phone: prof.phone, email: prof.email });
    const Row = ({ Ic, label, badge, onClick }: { Ic: any; label: string; badge?: string; onClick: () => void }) => (
      <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left">
        <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0"><Ic size={15} /></span>
        <span className="flex-1 text-xs font-bold text-white">{label}</span>
        {badge && <span className="text-[9px] font-black text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{badge}</span>}
        <ChevronRight size={14} className="text-white/25" />
      </button>
    );
    const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
      <section className="mb-4">
        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.25em] mb-2 px-1">{title}</p>
        <div className="bg-[#111] border border-white/8 rounded-2xl divide-y divide-white/5 overflow-hidden">{children}</div>
      </section>
    );
    return (
      <div className="max-w-md mx-auto px-4 pb-24 pt-5">
        {/* identity card */}
        <div className="relative rounded-3xl p-5 mb-4 bg-gradient-to-br from-[#0F1319] via-[#212833] to-[#0A0D12] border border-[#2A2F3A] flex items-center gap-4">
          <div className="relative shrink-0">
            <span className="w-[72px] h-[72px] rounded-full orange-gradient-bg flex items-center justify-center text-2xl font-black text-white">{(prof.name || 'U')[0].toUpperCase()}</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-[26px] h-[26px] rounded-full bg-[#111] border border-white/20 flex items-center justify-center"><Pencil size={11} className="text-orange-400" /></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-black text-white truncate">{prof.name}</p>
            <p className="text-[11px] text-white/50 font-bold">{prof.phone}</p>
            <p className="text-[9px] text-white/30 font-black uppercase tracking-wide mt-1">Member since {prof.memberSince}</p>
          </div>
          <button onClick={() => setEdit(true)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-orange-400 flex items-center justify-center shrink-0"><Settings size={15} /></button>
        </div>
        {/* stats 2x2 */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[['Orders', orders.length, () => setView({ t: 'orders' })], ['Saved', wish.length, () => setView({ t: 'wishlist' })], ['Cart Units', cartQty, () => setView({ t: 'cart' })], ['RFQs & Offers', quotes, () => setView({ t: 'orders' })]].map(([l, n, go]: any) => (
            <button key={l} onClick={go} className="bg-[#111] border border-white/8 rounded-2xl p-3.5 text-left hover:border-orange-500/40">
              <p className="text-xl font-black text-white leading-none">{n}</p>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-wide mt-1.5">{l}</p>
            </button>
          ))}
        </div>
        {/* B2B strip */}
        <button onClick={onOpenB2B} className={`w-full mb-4 rounded-2xl border px-4 py-3.5 flex items-center gap-3 text-left ${b2bStatus === 'APPROVED' ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15' : b2bStatus === 'PENDING' ? 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15' : 'border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/15'}`}>
          <Building2 size={16} className={`shrink-0 ${b2bStatus === 'APPROVED' ? 'text-emerald-400' : b2bStatus === 'PENDING' ? 'text-amber-400' : 'text-orange-400'}`} />
          <span className="flex-1">
            <span className="block text-xs font-black text-white">{b2bStatus === 'APPROVED' ? 'TerraInfra Business - Active' : b2bStatus === 'PENDING' ? 'B2B Access - Under Review' : 'B2B Access - Apply Now'}</span>
            <span className={`block text-[9px] font-bold ${b2bStatus === 'APPROVED' ? 'text-emerald-300/80' : b2bStatus === 'PENDING' ? 'text-amber-300/80' : 'text-orange-300/80'}`}>{b2bStatus === 'APPROVED' ? 'Wholesale pricing unlocked - open TerraInfra Business' : b2bStatus === 'PENDING' ? 'Your request is under review - tap to view' : 'Send a request (GST) to unlock wholesale products'}</span>
          </span>
          <ChevronRight size={14} className={b2bStatus === 'APPROVED' ? 'text-emerald-400' : b2bStatus === 'PENDING' ? 'text-amber-400' : 'text-orange-400'} />
        </button>
        <Group title="My Activity">
          <Row Ic={Package} label="My Orders" badge={String(orders.filter((o: any) => !o.isB2B).length)} onClick={() => setView({ t: 'orders' })} />
          <Row Ic={Building2} label="My B2B Orders" badge={String(orders.filter((o: any) => o.isB2B).length)} onClick={() => setView({ t: 'orders' })} />
          <Row Ic={Bookmark} label="Saved Items" badge={String(wish.length)} onClick={() => setView({ t: 'wishlist' })} />
          <Row Ic={Receipt} label="My Quote Requests" badge={String(quotes)} onClick={() => say('Track quote replies from the B2B bell icon')} />
        </Group>
        <Group title="Account & Security">
          {authUser
            ? <button onClick={() => { fireSignOut(); say('Signed out of TI360'); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0"><User size={15} /></span>
                <span className="flex-1"><span className="block text-xs font-bold text-white">TI360 Account · Connected</span><span className="block text-[9px] text-emerald-400 font-bold">{authUser.email ?? 'signed in'} · tap to sign out</span></span>
              </button>
            : <button onClick={() => setLogin(true)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left">
                <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0"><User size={15} /></span>
                <span className="flex-1 text-xs font-bold text-white">Sign in to TI360 Account</span>
                <ChevronRight size={14} className="text-white/25" />
              </button>}
          <Row Ic={MapPin} label={prof.email ? prof.email : 'Add Email Address'} onClick={() => setEdit(true)} />
          <Row Ic={User} label="Edit Profile Details" onClick={() => setEdit(true)} />
          <Row Ic={MapPin} label="Saved Address Ledger" badge={addr ? '1' : '0'} onClick={() => setView({ t: 'checkout' })} />
          <button onClick={() => setProf({ ...prof, notificationsEnabled: !prof.notificationsEnabled })} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left">
            <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0"><Info size={15} /></span>
            <span className="flex-1 text-xs font-bold text-white">Notification Preferences</span>
            <span className={`w-10 h-6 rounded-full relative transition-colors ${prof.notificationsEnabled ? 'bg-orange-500' : 'bg-white/15'}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prof.notificationsEnabled ? 'left-5' : 'left-1'}`} /></span>
          </button>
        </Group>
        <Group title="Support & Corporate Info">
          <Row Ic={HelpCircle} label="Help & Support Hotline" onClick={() => say('Support: +91 800 555 1234 · support@terrainfra360.com')} />
          <Row Ic={Info} label="About TerraInfra360" onClick={() => say('India\'s premier construction & real estate ecosystem')} />
          <Row Ic={FileText} label="Terms & Conditions" onClick={() => say('Terms & Conditions — coming soon')} />
        </Group>
        <button onClick={() => { setProf({ name: 'TerraInfra User', phone: '', email: '', emailVerified: false, notificationsEnabled: true, memberSince: 'Jun 2026' }); say('Signed out'); }} className="w-full h-12 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-[11px] font-black uppercase tracking-wide hover:bg-red-500/15">Sign Out</button>
        <p className="text-center text-[9px] text-white/25 font-black uppercase tracking-widest mt-5">TerraInfraMart · v1.0 · © 2026 TerraInfra 360</p>
        {login && (
          <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setLogin(false)}>
            <div className="bg-[#111] border border-white/10 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-black text-white mb-1">TI360 Account</h3>
              <p className="text-[10px] text-white/40 mb-4">One-time sign in — unlocks the live catalogue everywhere.</p>
              <input value={lf.email} onChange={e => setLf({ ...lf, email: e.target.value })} placeholder="Email" className="w-full mb-2.5 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500/50" />
              <input type="password" value={lf.pass} onChange={e => setLf({ ...lf, pass: e.target.value })} placeholder="Password" className="w-full mb-2.5 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500/50" />
              {lf.err && <p className="text-[10px] font-bold text-red-400 mb-2">{lf.err}</p>}
              <button disabled={lf.busy} onClick={() => doLogin(false)} className="w-full h-11 orange-gradient-bg text-white text-[10px] font-black uppercase rounded-xl disabled:opacity-40">{lf.busy ? 'Signing in…' : 'Sign In'}</button>
            </div>
          </div>
        )}
        {edit && (
          <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setEdit(false)}>
            <div className="bg-[#111] border border-white/10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-black text-white mb-4">Edit Profile Details</h3>
              {[['name', 'Government ID Legal Name'], ['phone', 'Mobile Contact Number'], ['email', 'Email Address']].map(([k, l]) => (
                <div key={k} className="mb-2.5">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{l}</p>
                  <input value={(f as any)[k]} onChange={e => setF({ ...f, [k]: e.target.value })} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500/50" />
                </div>
              ))}
              <button onClick={() => { setProf({ ...prof, ...f }); setEdit(false); say('Profile updated'); }} className="w-full h-11 orange-gradient-bg text-white text-[10px] font-black uppercase rounded-xl mt-1">Save Changes</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CompareScreen = () => {
    const ps = compare.map(id => RPRODUCTS.find(p => p.id === id)).filter(Boolean) as RProduct[];
    const rows: [string, (p: RProduct) => string][] = [
      ['Price', p => '₹' + fmt(p.price)],
      ['MRP', p => p.mrp ? '₹' + fmt(p.mrp) : '—'],
      ['Discount', p => (p.mrp && p.mrp > p.price) ? Math.round((1 - p.price / p.mrp) * 100) + '% OFF' : '—'],
      ['Brand', p => p.brand ?? '—'],
      ['Rating', p => p.rating + ' ★ (' + fmt(p.reviews) + ')'],
      ['GST', p => (p.gstPercent ?? 18) + '%'],
      ['Warranty', p => p.warranty ?? '—'],
      ['Delivery', p => deliveryText(p.deliveryDays)],
      ['Stock', p => p.outOfStock ? 'Out of stock' : 'In stock'],
    ];
    return (
      <div className="max-w-7xl mx-auto px-4 pb-24 pt-5">
        <div className="flex items-center justify-between mb-5">
          <div><h1 className="text-xl font-black text-white">Compare Products</h1><p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-0.5">{ps.length} of 4 selected</p></div>
          {ps.length > 0 && <button onClick={() => setCompare([])} className="text-[10px] font-black text-red-400 uppercase tracking-wide">Clear all</button>}
        </div>
        {ps.length === 0 ? (
          <div className="py-20 text-center bg-[#111] border border-white/8 rounded-2xl"><GitCompare size={36} className="mx-auto text-white/20 mb-3" /><p className="text-white font-black">Nothing to compare yet</p><p className="text-[11px] text-white/40 mt-1">Tap the compare icon on any product to add it here.</p><button onClick={() => setView({ t: 'list', macroId: null })} className="mt-4 px-6 py-2.5 orange-gradient-bg text-white text-[10px] font-black uppercase rounded-full">Browse Products</button></div>
        ) : (
          <div className="overflow-x-auto no-scrollbar border border-white/8 rounded-2xl bg-[#111]">
            <table className="w-full border-collapse min-w-[560px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-[#0a0a0a] p-3 text-left text-[9px] font-black text-white/40 uppercase tracking-widest w-24 align-bottom">Parameter</th>
                  {ps.map(p => (
                    <th key={p.id} className="p-3 border-l border-white/8 min-w-[150px] align-top">
                      <div onClick={() => setView({ t: 'detail', id: p.id })} className="cursor-pointer"><img src={p.imageUrls[0]} referrerPolicy="no-referrer" onError={imgFallback} className="w-full h-20 object-cover rounded-lg mb-2" /><p className="text-[11px] font-bold text-white line-clamp-2 leading-snug text-left">{p.title}</p></div>
                      <button onClick={() => { if (p.outOfStock) return; addLine(p.id); say('Added to cart'); }} disabled={p.outOfStock} className="mt-2 w-full h-8 orange-gradient-bg text-white text-[9px] font-black uppercase tracking-wide rounded-lg disabled:opacity-30">{p.outOfStock ? 'Out of Stock' : 'Add to Cart'}</button>
                      <button onClick={() => say('Coming soon - online purchase is not available yet')} disabled={p.outOfStock} className="mt-1.5 w-full h-8 border border-white/15 text-white text-[9px] font-black uppercase tracking-wide rounded-lg hover:border-orange-500/50 disabled:opacity-30">Buy Now</button>
                      <button onClick={() => toggleCompare(p.id)} className="mt-1.5 text-[9px] font-black text-red-400 uppercase tracking-wide hover:underline">Remove</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, fn], i) => (
                  <tr key={label} className={i % 2 ? 'bg-white/[0.02]' : ''}>
                    <td className="sticky left-0 z-10 bg-[#0a0a0a] p-3 text-[10px] font-black text-white/50 uppercase tracking-wider">{label}</td>
                    {ps.map(p => <td key={p.id} className="p-3 border-l border-white/8 text-xs font-bold text-white text-center">{fn(p)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <Toaster />
      {view.t === 'home' && <Home />}
      {view.t === 'macros' && <MacrosScreen />}
      {view.t === 'list' && <ListScreen macroId={view.macroId} query={view.q} />}
      {view.t === 'detail' && <DetailScreen id={view.id} />}
      {view.t === 'cart' && <CartScreen />}
      {view.t === 'checkout' && <CheckoutScreen />}
      {view.t === 'orders' && <OrdersScreen />}
      {view.t === 'wishlist' && <WishlistScreen />}
      {view.t === 'profile' && <ProfileScreen />}
      {view.t === 'notifications' && <NotificationsScreen />}
      {view.t === 'order' && <OrderScreen id={view.id} />}
      {view.t === 'compare' && <CompareScreen />}
      {compare.length > 0 && view.t !== 'compare' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] bg-[#111] border border-orange-500/40 rounded-2xl shadow-2xl shadow-black/60 px-3 py-2.5 flex items-center gap-3">
          <div className="flex -space-x-2">{compare.slice(0, 4).map(id => { const pr = RPRODUCTS.find(p => p.id === id); return pr ? <img key={id} src={pr.imageUrls[0]} referrerPolicy="no-referrer" onError={imgFallback} className="w-9 h-9 rounded-lg object-cover border-2 border-[#111]" /> : null; })}</div>
          <span className="text-xs font-black text-white whitespace-nowrap">{compare.length} to compare</span>
          <button onClick={() => setView({ t: 'compare' })} className="px-4 h-9 orange-gradient-bg text-white text-[10px] font-black uppercase rounded-lg flex items-center gap-1.5"><GitCompare size={13} /> Compare</button>
          <button onClick={() => setCompare([])} className="text-white/40 hover:text-white"><X size={16} /></button>
        </div>
      )}
    </div>
  );
}
