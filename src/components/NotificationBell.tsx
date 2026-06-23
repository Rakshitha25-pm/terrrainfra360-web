// Shared notification bell shown in the site header across every section.
// Mirrors the TI360-Application notifications screen: it merges two live
// sources for the signed-in user --
//   1) users/{uid}/notifications  (price drops, stock alerts, system messages)
//   2) b2b_quote_requests          (BuildDirect negotiation status updates)
// Unread is tracked locally (the collections are written server-side only),
// exactly like the app's "mark all read".
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Handshake, TrendingDown, Package, ShieldCheck, X } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, query, where, limit, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { loadServiceRFQs } from '../lib/serviceRfq';
import { loadOrders, fmt } from '../views/ti360shop/shared';
import { auth, db } from '../lib/firebase';

interface Notif { id: string; type: string; title: string; body: string; read: boolean; at: number; }

const READ_KEY = 'tf360_notif_read_v1';
const loadRead = (): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')); } catch { return new Set(); } };
const saveRead = (s: Set<string>) => { try { localStorage.setItem(READ_KEY, JSON.stringify([...s])); } catch { /* noop */ } };
const DISMISS_KEY = 'tf360_notif_dismissed_v1';
const loadDismiss = (): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(DISMISS_KEY) || '[]')); } catch { return new Set(); } };
const saveDismiss = (s: Set<string>) => { try { localStorage.setItem(DISMISS_KEY, JSON.stringify([...s])); } catch { /* noop */ } };

const timeAgo = (ms: number): string => {
  const d = Date.now() - ms; const m = Math.floor(d / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60); if (h < 24) return h + 'h ago';
  const days = Math.floor(h / 24); if (days < 7) return days + 'd ago';
  return new Date(ms).toLocaleDateString();
};

function quoteToNotif(id: string, x: any): Notif {
  const status = String(x.status || 'OPEN').toUpperCase();
  const vendor = x.vendorName || 'the vendor';
  const product = x.productName || 'your offer';
  let title = 'Offer sent to ' + vendor;
  let body = product + ' - awaiting the vendor reply';
  let read = true;
  if (status === 'ACCEPTED') { title = 'Offer approved by ' + vendor; body = 'Your price was accepted. Review and place the order.'; read = false; }
  else if (status === 'COUNTERED') { title = vendor + ' sent a counter-offer'; body = 'Tap to review the counter price for ' + product + '.'; read = false; }
  else if (status === 'DECLINED') { title = 'Offer not approved'; body = product + ' - send a revised offer to continue.'; read = false; }
  const at = x.updatedAt?.toMillis?.() ?? x.createdAt?.toMillis?.() ?? Date.now();
  return { id: 'q_' + id, type: 'b2b_negotiation', title, body, read, at };
}

const iconFor = (type: string) => {
  if (type === 'b2b_negotiation') return Handshake;
  if (type.includes('price')) return TrendingDown;
  if (type.includes('stock') || type.includes('restock')) return Package;
  return ShieldCheck;
};

export function NotificationBell({ tone = 'dark' }: { tone?: 'dark' | 'auto' }) {
  const [user, setUser] = useState<User | null>(null);
  const [base, setBase] = useState<Notif[]>([]);
  const [quotes, setQuotes] = useState<Notif[]>([]);
  const [svc, setSvc] = useState<Notif[]>([]);
  const [localSvc, setLocalSvc] = useState<Notif[]>([]);
  const [localOrders, setLocalOrders] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(loadRead);
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismiss);
  const dismiss = (id: string) => { const s = new Set(dismissed); s.add(id); setDismissed(s); saveDismiss(s); };
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => onAuthStateChanged(auth, u => setUser(u)), []);

  useEffect(() => {
    if (!user) { setBase([]); return; }
    let unsub: Unsubscribe = () => {};
    try {
      const q = query(collection(db, 'users', user.uid, 'notifications'), limit(100)); // no orderBy: don't drop docs missing createdAt
      unsub = onSnapshot(q, snap => {
        const rows: Notif[] = [];
        snap.forEach(d => {
          const x = d.data() as any;
          if (x.type === 'b2b_negotiation') return; // negotiation comes from the quote stream below
          const at = x.createdAt?.toMillis?.() ?? (typeof x.createdAt === 'number' ? x.createdAt : (x.timestamp?.toMillis?.() ?? Date.now()));
          rows.push({ id: d.id, type: x.type || '', title: x.title || x.heading || 'Notification', body: x.body || x.message || x.subtitle || '', read: !!x.read, at });
        });
        setBase(rows);
      }, e => { console.warn('[NotifBell] notifications read failed:', (e as any)?.code || e); setBase([]); });
    } catch { setBase([]); }
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) { setQuotes([]); return; }
    let unsub: Unsubscribe = () => {};
    try {
      const q = query(collection(db, 'b2b_quote_requests'), where('userUid', '==', user.uid));
      unsub = onSnapshot(q, snap => {
        const rows: Notif[] = [];
        snap.forEach(d => rows.push(quoteToNotif(d.id, d.data())));
        setQuotes(rows);
      }, e => { console.warn('[NotifBell] quote-requests read failed:', (e as any)?.code || e); setQuotes([]); });
    } catch { setQuotes([]); }
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) { setSvc([]); return; }
    let unsub: Unsubscribe = () => {};
    try {
      const q = query(collection(db, 'service_requests'), where('userUid', '==', user.uid));
      unsub = onSnapshot(q, snap => {
        const rows: Notif[] = [];
        snap.forEach(d => {
          const x = d.data() as any;
          const at = x.createdAt?.toMillis?.() ?? (typeof x.createdAt === 'number' ? x.createdAt : Date.now());
          rows.push({ id: 'svc_' + (x.rfqNumber || d.id), type: 'service', title: 'Service request submitted', body: `${x.service || 'Service'}${x.rfqNumber ? ' - ' + x.rfqNumber : ''}`, read: false, at });
        });
        setSvc(rows);
      }, e => { console.warn('[NotifBell] service-requests read failed:', (e as any)?.code || e); setSvc([]); });
    } catch { setSvc([]); }
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const readLocal = () => {
      try { setLocalSvc(loadServiceRFQs().map(r => ({ id: 'svc_' + r.rfqNumber, type: 'service', title: 'Service request submitted', body: `${r.service || 'Service'}${r.rfqNumber ? ' - ' + r.rfqNumber : ''}`, read: false, at: r.createdAt || Date.now() }))); } catch { setLocalSvc([]); }
      try {
        setLocalOrders(loadOrders().map(o => {
          const label = o.status === 'DELIVERED' ? 'Order delivered' : o.status === 'SHIPPED' ? 'Order shipped' : o.status === 'CANCELLED' ? 'Order cancelled' : 'Order placed';
          return { id: 'ord_' + o.id, type: 'order', title: label, body: `${o.code} \u00b7 \u20b9${fmt(o.total)} \u00b7 ${o.items.length} item${o.items.length === 1 ? '' : 's'}`, read: false, at: o.createdAt || Date.now() };
        }));
      } catch { setLocalOrders([]); }
    };
    readLocal();
    window.addEventListener('tf360-notif', readLocal);
    window.addEventListener('storage', readLocal);
    return () => { window.removeEventListener('tf360-notif', readLocal); window.removeEventListener('storage', readLocal); };
  }, [open]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const items = (() => {
    const seen = new Set<string>();
    return [...base, ...quotes, ...svc, ...localSvc, ...localOrders]
      .filter(n => { if (seen.has(n.id) || dismissed.has(n.id)) return false; seen.add(n.id); return true; })
      .sort((a, b) => b.at - a.at);
  })();
  const unread = items.filter(n => !n.read && !readIds.has(n.id)).length;
  const markAll = () => { const s = new Set(readIds); items.forEach(n => s.add(n.id)); setReadIds(s); saveRead(s); };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        title="Notifications"
        className={`relative transition-all hover:scale-110 p-2 rounded-full hover:bg-orange-500/10 hover:text-orange-500 ${tone === 'auto' ? 'text-current opacity-70 hover:opacity-100' : 'text-white/60'}`}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[8px] min-w-[15px] h-[15px] px-0.5 flex items-center justify-center rounded-full font-black border border-black">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-[330px] max-w-[88vw] bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-[400] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">Notifications</span>
                {unread > 0 && <span className="text-[9px] font-black uppercase tracking-wider text-orange-500 bg-orange-500/15 px-2 py-0.5 rounded-full">{unread} new</span>}
              </div>
              {unread > 0
                ? <button onClick={markAll} className="text-[10px] font-black uppercase tracking-wider text-white/50 hover:text-orange-500">Mark all read</button>
                : <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white"><X size={15} /></button>}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {!user ? (
                <div className="px-4 py-10 text-center">
                  <Bell size={26} className="text-white/20 mx-auto mb-3" />
                  <p className="text-xs text-white/45">Sign in to see your notifications.</p>
                </div>
              ) : items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell size={26} className="text-white/20 mx-auto mb-3" />
                  <p className="text-xs text-white/45">You're all caught up. No notifications yet.</p>
                  <p className="text-[9px] text-white/25 mt-3 break-all px-2">Account: {(user as any).phoneNumber || user.email || user.uid}</p>
                  {!(user as any).phoneNumber && (
                    <p className="text-[10px] text-amber-400/80 mt-3 px-2 leading-relaxed">Your TI360 app notifications are linked to your <strong>phone number</strong>. Sign out, then sign in with the same phone number you use in the app to see them here.</p>
                  )}
                </div>
              ) : items.map(n => {
                const Ic = iconFor(n.type);
                const isUnread = !n.read && !readIds.has(n.id);
                return (
                  <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-white/5 ${isUnread ? 'bg-orange-500/[0.06]' : ''}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUnread ? 'bg-orange-500/20 text-orange-400' : 'bg-white/8 text-white/40'}`}>
                      <Ic size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white leading-snug">{n.title}</p>
                      {n.body && <p className="text-[11px] text-white/50 leading-snug mt-0.5">{n.body}</p>}
                      <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mt-1">{timeAgo(n.at)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 shrink-0 self-start pt-0.5">
                      {isUnread && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                      <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} title="Remove" className="text-white/20 hover:text-red-400 transition-colors"><X size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            {user && items.length > 0 && (
              <div className="px-4 py-2.5 border-t border-white/8 text-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white/35"><Check size={11} /> Live updates from TerraInfra360</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
