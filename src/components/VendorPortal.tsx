// VendorPortal.tsx
// Native in-site vendor portal styled to match the TI360 vendor-web app:
// yellow sidebar, green top bar, light surfaces, welcome + inventory cards and
// a Quick-actions grid. Real Firebase email/password login gated on
// vendors/{uid}.status === 'APPROVED'. Writes to the same Firestore collections
// the rest of the system understands. Uses an isolated Firebase app instance so
// vendor sign-in never clobbers the customer's phone-auth session.
import { useEffect, useState, type CSSProperties, type ComponentType } from 'react';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import {
  getFirestore, collection, addDoc, doc, getDoc, getDocs, updateDoc, setDoc,
  deleteDoc, query, where, serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  X, LogOut, LayoutGrid, Plus, Upload, Boxes, Users, ShoppingCart, Layers,
  CalendarDays, IdCard, Check, AlertCircle, Loader2, ImagePlus, Trash2,
  ArrowRight, Truck, MapPin, Mail, Lock, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { firebaseApp } from '../lib/firebase';

const vApp = getApps().find((a) => a.name === 'vendor-portal') ?? initializeApp(firebaseApp.options, 'vendor-portal');
const vAuth = getAuth(vApp);
const vDb = getFirestore(vApp);
const vStorage = getStorage(vApp);

// design tokens (from the vendor-web app)
const T = {
  green: '#0C831F', greenDark: '#0A6618', greenSoft: '#E3F4E5',
  red: '#CF3B34', redSoft: '#FCECEB',
  yellow: '#F1E04A', yellowDark: '#6E6418',
  ink: '#1C2630', body: '#46535E', muted: '#8B97A1',
  bg: '#F3F4F6', surface: '#FFFFFF', border: '#E4E7EA',
};
const GST_OPTIONS = [0, 5, 12, 18, 28];
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

type View = 'home' | 'sell' | 'products' | 'orders' | 'b2b' | 'holidays' | 'profile' | 'catalog' | 'subvendors';
type Opt = { id: string; name: string };
type DayHours = { open: boolean; openTime: string; closeTime: string };
type IconType = ComponentType<{ size?: number; color?: string; style?: CSSProperties }>;

interface VendorDoc {
  status?: string; fullName?: string; businessOwnerName?: string;
  businessRegisteredName?: string; businessName?: string; email?: string; phone?: string;
  gstNumber?: string; panNumber?: string; aadharNumberMasked?: string;
  shopAddressLine1?: string; shopAddressLine2?: string; city?: string; state?: string; pincode?: string;
  specialization?: string;
}

const card: CSSProperties = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: '0 1px 2px rgba(20,30,40,0.05)' };
const inputStyle: CSSProperties = { height: 44, width: '100%', padding: '0 13px', borderRadius: 10, border: `1px solid ${T.border}`, outline: 'none', fontSize: 14, color: T.ink, background: '#F6F7F8', boxSizing: 'border-box' };
const overline: CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: T.muted, textTransform: 'uppercase' };

function nameOf(d: { name?: string; title?: string }): string { return (d.name || d.title || '').toString(); }
function defaultSchedule(): Record<string, DayHours> { const o: Record<string, DayHours> = {}; WEEKDAYS.forEach((k) => { o[k] = { open: k !== 'sunday', openTime: '09:00', closeTime: '18:00' }; }); return o; }

function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: T.ink, marginBottom: 6 }}>{label}</label>{children}</div>;
}
function PrimaryBtn({ children, onClick, disabled, full }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; full?: boolean }) {
  return <button onClick={onClick} disabled={disabled} style={{ height: 44, padding: '0 20px', width: full ? '100%' : undefined, borderRadius: 8, fontWeight: 700, fontSize: 13.5, cursor: disabled ? 'not-allowed' : 'pointer', border: 'none', background: T.green, color: '#fff', opacity: disabled ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{children}</button>;
}
function GhostBtn({ children, onClick, full }: { children: React.ReactNode; onClick?: () => void; full?: boolean }) {
  return <button onClick={onClick} style={{ height: 42, padding: '0 16px', width: full ? '100%' : undefined, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: `1px solid ${T.border}`, background: '#fff', color: T.ink, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{children}</button>;
}
function ErrBox({ msg }: { msg: string }) {
  return <div style={{ padding: '10px 13px', borderRadius: 8, border: '1px solid #F1C4C1', background: T.redSoft, color: '#B22A23', fontSize: 13, fontWeight: 500, marginBottom: 14 }}>{msg}</div>;
}
function Spinner() { return <div style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color={T.green} /></div>; }
function Pill({ status }: { status: string }) {
  const good = status === 'APPROVED' || status === 'LIVE' || status === 'DELIVERED';
  return <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', padding: '3px 9px', borderRadius: 999, background: good ? T.greenSoft : '#FBF1CC', color: good ? T.greenDark : T.yellowDark }}>{status}</span>;
}

const NAV: { key: string; label: string; icon: IconType; view: View }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid, view: 'home' },
  { key: 'sell', label: 'Sell Product', icon: Plus, view: 'sell' },
  { key: 'catalog', label: 'Upload Catalog', icon: Upload, view: 'catalog' },
  { key: 'products', label: 'My Products', icon: Boxes, view: 'products' },
  { key: 'subvendors', label: 'Sub Vendors', icon: Users, view: 'subvendors' },
  { key: 'orders', label: 'Orders', icon: ShoppingCart, view: 'orders' },
  { key: 'b2b', label: 'B2B Orders', icon: Layers, view: 'b2b' },
  { key: 'holidays', label: 'Holiday Calendar', icon: CalendarDays, view: 'holidays' },
  { key: 'profile', label: 'My Profile', icon: IdCard, view: 'profile' },
];
const CRUMB: Record<View, string> = { home: 'Dashboard', sell: 'Sell Product', catalog: 'Upload Catalog', products: 'My Products', subvendors: 'Sub Vendors', orders: 'Orders', b2b: 'B2B Orders', holidays: 'Holiday Calendar', profile: 'My Profile' };

export function VendorPortal({ onClose }: { onClose: () => void }) {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [vendor, setVendor] = useState<VendorDoc | null>(null);
  const [view, setView] = useState<View>('home');
  const [oos, setOos] = useState(0);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Always open at the login screen -- never silently restore a saved session.
    signOut(vAuth).catch(() => {});
    setUser(null);
    setBooting(false);
    return () => {};
  }, []);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(vDb, 'products'), where('vendorId', '==', user.uid)))
      .then((s) => setOos(s.docs.filter((d) => (d.data() as { inStock?: boolean }).inStock === false).length)).catch(() => setOos(0));
  }, [user]);

  async function gate(u: User): Promise<boolean> {
    try {
      const snap = await getDoc(doc(vDb, 'vendors', u.uid));
      if (!snap.exists()) { await signOut(vAuth); setErr('Vendor profile not found. Please register in the TerraInfra360 vendor app first.'); return false; }
      const v = snap.data() as VendorDoc;
      if ((v.status ?? 'PENDING') !== 'APPROVED') { await signOut(vAuth); setErr(`Your vendor account is not approved yet (status: ${v.status ?? 'PENDING'}). Please wait for admin approval.`); return false; }
      setVendor(v); return true;
    } catch { await signOut(vAuth).catch(() => {}); setErr('Could not verify your vendor account. Try again.'); return false; }
  }
  async function doLogin() {
    setErr(null);
    if (!email.trim() || pw.length < 6) { setErr('Enter a valid email and a 6+ character password.'); return; }
    setBusy(true);
    try { const cred = await signInWithEmailAndPassword(vAuth, email.trim(), pw); const ok = await gate(cred.user); if (ok) setUser(cred.user); }
    catch (e) {
      const code = (e as { code?: string }).code || '';
      setErr(code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') ? 'Incorrect email or password.' : code.includes('too-many-requests') ? 'Too many attempts. Please wait and try again.' : 'Sign in failed. Please try again.');
    } finally { setBusy(false); }
  }
  async function doLogout() { await signOut(vAuth).catch(() => {}); setUser(null); setVendor(null); setView('home'); setEmail(''); setPw(''); }

  const businessName = vendor?.businessRegisteredName || vendor?.businessName || vendor?.fullName || 'Vendor';

  if (booting) return <div style={{ position: 'fixed', inset: 0, zIndex: 660, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color={T.green} /></div>;

  if (!user) return <LoginView email={email} pw={pw} setEmail={setEmail} setPw={setPw} busy={busy} err={err} onSubmit={doLogin} onClose={onClose} />;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 660, display: 'flex', background: T.bg, color: T.body, overflow: 'hidden' }}>
      <Sidebar active={view} go={setView} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar crumb={CRUMB[view]} onLogout={doLogout} onExit={onClose} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 30px 56px', boxSizing: 'border-box' }}>
            {view === 'home' && <Dashboard businessName={businessName} oos={oos} go={setView} />}
            {view === 'sell' && <SellView user={user} vendor={vendor} businessName={businessName} onDone={() => setView('products')} />}
            {view === 'products' && <ProductsView uid={user.uid} onSell={() => setView('sell')} />}
            {view === 'orders' && <OrdersView uid={user.uid} coll="orders" title="Orders" />}
            {view === 'b2b' && <OrdersView uid={user.uid} coll="b2b_orders" title="B2B Orders" />}
            {view === 'holidays' && <HolidaysView uid={user.uid} vendor={vendor} />}
            {view === 'profile' && <ProfileView uid={user.uid} />}
            {view === 'catalog' && <CatalogView onSell={() => setView('sell')} />}
            {view === 'subvendors' && <SubVendorsView uid={user.uid} vendor={vendor} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ---------------- Login (two-panel, light) ----------------
function LoginView({ email, pw, setEmail, setPw, busy, err, onSubmit, onClose }: { email: string; pw: string; setEmail: (v: string) => void; setPw: (v: string) => void; busy: boolean; err: string | null; onSubmit: () => void; onClose: () => void }) {
  const [note, setNote] = useState(false);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = !busy && emailOk && pw.length >= 6;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 660, background: T.bg, overflowY: 'auto' }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: T.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>T</div>
            <div style={{ lineHeight: 1.15 }}><div style={{ fontWeight: 800, fontSize: 15, color: T.ink }}>TerraInfra360</div><div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.6, color: T.muted }}>VENDOR PORTAL</div></div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}><X size={16} /> Close</button>
        </div>
      </div>
      <div style={{ maxWidth: 940, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ ...card, overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', background: `linear-gradient(160deg, ${T.green}, ${T.greenDark})`, color: '#fff', padding: '44px 38px' }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, opacity: 0.9 }}>TERRAINFRA360</div>
            <h2 style={{ margin: '14px 0 10px', fontSize: 28, fontWeight: 900, lineHeight: 1.2 }}>Vendor &amp; Seller Portal</h2>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, opacity: 0.92 }}>Sign in to manage your catalog, orders, operating hours and holiday calendar - all in one place.</p>
            <div style={{ marginTop: 26, display: 'grid', gap: 12 }}>
              {['Sell to verified construction buyers', 'Bulk catalog upload with AI parsing', 'Live orders, B2B orders and delivery control'].map((t) => (
                <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ width: 20, height: 20, borderRadius: 999, background: 'rgba(255,255,255,0.22)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color="#fff" /></span>
                  <span style={{ fontSize: 13.5 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: '1 1 360px', padding: '40px 38px' }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.ink }}>Welcome Back</h2>
            <div style={{ ...overline, marginTop: 6 }}>Login to continue</div>
            <div style={{ marginTop: 22 }}>
              {err && <ErrBox msg={err} />}
              <Fld label="Email Address"><input style={inputStyle} value={email} placeholder="example@gmail.com" onChange={(e) => setEmail(e.target.value)} /></Fld>
              <Fld label="Password"><input style={inputStyle} type="password" value={pw} placeholder="Enter your password" onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && canSubmit) onSubmit(); }} /></Fld>
              <PrimaryBtn onClick={onSubmit} disabled={!canSubmit} full>{busy ? <Loader2 size={16} className="animate-spin" /> : null}{busy ? 'Signing in...' : 'Login'}</PrimaryBtn>
              <div style={{ marginTop: 12 }}><GhostBtn onClick={() => setNote(true)} full>Register as a new vendor</GhostBtn></div>
              {note && <p style={{ fontSize: 12, color: T.muted, marginTop: 12, lineHeight: 1.6 }}>New vendors register in the TerraInfra360 vendor app. Once an admin approves your account, sign in here with the same email.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Sidebar + Topbar ----------------
function Sidebar({ active, go }: { active: View; go: (v: View) => void }) {
  return (
    <aside style={{ width: 242, flexShrink: 0, background: T.yellow, borderRight: '1px solid #D9CB52', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px', borderBottom: '1px solid rgba(0,0,0,0.10)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#1C2024', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>T</div>
        <div style={{ lineHeight: 1.15 }}><div style={{ fontWeight: 800, fontSize: 15, color: '#1B1B12' }}>TerraInfra360</div><div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.6, color: '#6E6630' }}>VENDOR PORTAL</div></div>
      </div>
      <nav style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 3, flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: '#87823F', padding: '4px 10px 6px' }}>Menu</div>
        {NAV.map((n) => {
          const on = n.view === active; const Ic = n.icon;
          return (
            <button key={n.key} onClick={() => go(n.view)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px', borderRadius: 6, fontSize: 13.5, fontWeight: on ? 700 : 600, color: on ? '#fff' : '#34331C', background: on ? '#4C9A1C' : 'transparent', boxShadow: on ? '0 1px 4px rgba(0,0,0,0.22)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <Ic size={18} color={on ? '#fff' : '#6B6838'} />{n.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(0,0,0,0.10)', fontSize: 11, color: '#6E6630', lineHeight: 1.5 }}>&copy; {new Date().getFullYear()} TerraInfra360<br />ISO 9001 Certified</div>
    </aside>
  );
}
function Topbar({ crumb, onLogout, onExit }: { crumb: string; onLogout: () => void; onExit: () => void }) {
  return (
    <header style={{ background: T.green, borderBottom: `1px solid ${T.greenDark}`, height: 62, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexShrink: 0 }}>
      <div><div style={{ fontSize: 15.5, fontWeight: 700, color: '#fff' }}>{crumb}</div><div style={{ fontSize: 11.5, color: '#CDEBD0', marginTop: 1 }}>TerraInfra360 - Vendor &amp; Seller Portal</div></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onLogout} style={{ height: 38, padding: '0 14px', borderRadius: 8, background: '#fff', color: T.ink, border: 'none', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}><LogOut size={14} /> Logout</button>
        <button onClick={onExit} aria-label="Close" style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
      </div>
    </header>
  );
}

// ---------------- Dashboard ----------------
function Dashboard({ businessName, oos, go }: { businessName: string; oos: number; go: (v: View) => void }) {
  const actions: { title: string; desc: string; mark: string; text: string; view: View }[] = [
    { title: 'Sell a Product', desc: 'List a single product, set its pricing and submit it for approval.', mark: T.green, text: T.green, view: 'sell' },
    { title: 'Upload Catalog', desc: 'Bulk-create products from a price-list PDF or image.', mark: T.yellow, text: T.yellowDark, view: 'catalog' },
    { title: 'My Products', desc: 'Track pending, live and disabled listings in one place.', mark: '#2E86E6', text: '#1E6FD0', view: 'products' },
    { title: 'Orders', desc: 'View and fulfil your retail customer orders.', mark: T.green, text: T.green, view: 'orders' },
    { title: 'B2B Orders', desc: 'Manage bulk and business-to-business orders.', mark: T.yellow, text: T.yellowDark, view: 'b2b' },
    { title: 'Holiday Calendar', desc: 'Set shop closures so delivery dates stay accurate.', mark: '#EE6A3F', text: '#D8512C', view: 'holidays' },
    { title: 'My Profile', desc: 'Business details, shop hours and password settings.', mark: '#2E86E6', text: '#1E6FD0', view: 'profile' },
  ];
  return (
    <>
      <div style={{ ...card, padding: 0, display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: 6, background: T.green, flexShrink: 0 }} />
        <div style={{ flex: 1, padding: '22px 24px', display: 'flex', gap: 18, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 240 }}>
            <div style={{ ...overline, color: T.green }}>Vendor Dashboard</div>
            <h1 style={{ margin: '7px 0 0', fontSize: 22, fontWeight: 700, color: T.ink }}>Welcome back, {businessName}</h1>
            <div style={{ marginTop: 5, fontSize: 13.5, color: T.body }}>Manage your products, orders and shop settings from one place.</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: T.green, color: '#fff', borderRadius: 999, padding: '8px 15px', fontSize: 12, fontWeight: 700 }}><span style={{ width: 7, height: 7, borderRadius: 999, background: '#fff' }} />APPROVED VENDOR</span>
        </div>
      </div>

      <div style={{ marginTop: 16, ...card, padding: 0, display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: 6, background: oos > 0 ? T.red : T.green, flexShrink: 0 }} />
        <div style={{ flex: 1, padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 220 }}>
            <div style={{ ...overline, color: oos > 0 ? T.red : T.green }}>Inventory</div>
            <div style={{ margin: '6px 0 0', fontSize: 17, fontWeight: 700, color: T.ink }}>{oos > 0 ? `${oos} product${oos === 1 ? '' : 's'} out of stock` : 'All products in stock'}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: T.body }}>{oos > 0 ? 'These cannot be checked out until restocked.' : 'Every live listing is currently available to buy.'}</div>
          </div>
          <div style={{ minWidth: 64, height: 64, borderRadius: 12, background: oos > 0 ? T.redSoft : T.greenSoft, color: oos > 0 ? T.red : T.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, padding: '0 12px' }}>{oos}</div>
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.ink }}>Quick actions</h2>
        <div style={{ marginTop: 13, display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))' }}>
          {actions.map((a) => (
            <button key={a.title} onClick={() => go(a.view)} style={{ ...card, textAlign: 'left', cursor: 'pointer', padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', minHeight: 150 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: a.mark, marginBottom: 13 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{a.title}</div>
              <div style={{ fontSize: 13, color: T.body, marginTop: 6, lineHeight: 1.55, flex: 1 }}>{a.desc}</div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: a.text }}>Open <ArrowRight size={14} /></div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ---------------- Sell ----------------
function SellView({ user, vendor, businessName, onDone }: { user: User; vendor: VendorDoc | null; businessName: string; onDone: () => void }) {
  const [macros, setMacros] = useState<Opt[]>([]); const [cats, setCats] = useState<Opt[]>([]); const [ptypes, setPtypes] = useState<Opt[]>([]);
  const [macroId, setMacroId] = useState(''); const [categoryId, setCategoryId] = useState(''); const [productTypeId, setProductTypeId] = useState('');
  const [brand, setBrand] = useState(''); const [productName, setProductName] = useState(''); const [description, setDescription] = useState('');
  const [gstPercent, setGstPercent] = useState(18); const [mrp, setMrp] = useState(''); const [sellingPrice, setSellingPrice] = useState('');
  const [files, setFiles] = useState<File[]>([]); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null); const [doneNo, setDoneNo] = useState<string | null>(null);

  useEffect(() => { getDocs(collection(vDb, 'catalog_macros')).then((s) => setMacros(s.docs.map((d) => ({ id: d.id, name: nameOf(d.data() as { name?: string }) })).filter((m) => m.name))).catch(() => setMacros([])); }, []);
  useEffect(() => { setCats([]); setCategoryId(''); setPtypes([]); setProductTypeId(''); if (!macroId) return; getDocs(collection(vDb, 'catalog_macros', macroId, 'categories')).then((s) => setCats(s.docs.map((d) => ({ id: d.id, name: nameOf(d.data() as { name?: string }) })).filter((c) => c.name))).catch(() => setCats([])); }, [macroId]);
  useEffect(() => { setPtypes([]); setProductTypeId(''); if (!macroId || !categoryId) return; getDocs(collection(vDb, 'catalog_macros', macroId, 'categories', categoryId, 'product_types')).then((s) => setPtypes(s.docs.map((d) => ({ id: d.id, name: nameOf(d.data() as { name?: string }) })).filter((p) => p.name))).catch(() => setPtypes([])); }, [macroId, categoryId]);

  const mrpN = parseFloat(mrp) || 0; const spN = parseFloat(sellingPrice) || 0;
  const discountPercent = mrpN > 0 && spN > 0 && spN <= mrpN ? Math.round(((mrpN - spN) / mrpN) * 100) : 0;

  async function submit() {
    setErr(null);
    if (!macroId) return setErr('Choose a category.');
    if (brand.trim().length < 2) return setErr('Brand must be at least 2 characters.');
    if (productName.trim().length < 3) return setErr('Product name must be at least 3 characters.');
    if (description.trim().length < 10) return setErr('Description must be at least 10 characters.');
    if (!(mrpN > 0) || !(spN > 0)) return setErr('Enter a valid MRP and selling price.');
    if (spN > mrpN) return setErr('Selling price cannot exceed MRP.');
    if (files.length < 2) return setErr('Add at least 2 product images.');
    setBusy(true);
    try {
      const payload: Record<string, unknown> = { status: 'PENDING', vendorUid: user.uid, vendorEmail: vendor?.email || user.email || '', vendorName: vendor?.fullName || businessName, vendorBusinessName: businessName, macroId, categoryId, productTypeId, brand: brand.trim().replace(/\s+/g, ' '), productName: productName.trim(), description: description.trim(), bullets: [], gstPercent, mrp: mrpN, sellingPrice: spN, discountPercent, variantsEnabled: false, variants: [], returnable: 'YES', warranty: '', delivery: { mode: 'NEXT_DAY', days: 0 }, imageUrls: [], image1Url: '', image2Url: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
      const docRef = await addDoc(collection(vDb, 'product_submission'), payload);
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) { const f = files[i]; const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, '_'); const path = `product_submissions/${user.uid}/${docRef.id}/image_${i + 1}_${Date.now()}_${safe}`; const snap = await uploadBytes(ref(vStorage, path), f); urls.push(await getDownloadURL(snap.ref)); }
      await updateDoc(docRef, { imageUrls: urls, image1Url: urls[0] || '', image2Url: urls[1] || '', updatedAt: serverTimestamp() });
      setDoneNo(docRef.id.slice(0, 8).toUpperCase());
    } catch (e) { const code = (e as { code?: string }).code || ''; setErr(code.includes('permission') ? 'Permission denied by the server rules for this account.' : 'Could not submit the product. Please try again.'); }
    finally { setBusy(false); }
  }

  if (doneNo) return (
    <div style={{ ...card, padding: 40, textAlign: 'center', maxWidth: 460, margin: '0 auto' }}>
      <div style={{ width: 60, height: 60, borderRadius: 999, background: T.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Check size={30} color={T.green} /></div>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.ink }}>Product submitted</h2>
      <p style={{ color: T.body, fontSize: 13.5, marginTop: 8 }}>Your product is now PENDING admin approval. Ref {doneNo}.</p>
      <div style={{ marginTop: 18 }}><PrimaryBtn onClick={onDone}>View my products</PrimaryBtn></div>
    </div>
  );

  return (
    <div style={{ ...card, padding: 24, maxWidth: 720 }}>
      <h1 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: T.ink }}>Sell a product</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        <Fld label="Category"><Sel value={macroId} onChange={setMacroId} options={macros} placeholder="Select" /></Fld>
        <Fld label="Sub-category"><Sel value={categoryId} onChange={setCategoryId} options={cats} placeholder={macroId ? 'Select' : '-'} /></Fld>
        <Fld label="Product type"><Sel value={productTypeId} onChange={setProductTypeId} options={ptypes} placeholder={categoryId ? 'Select' : '-'} /></Fld>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Fld label="Brand"><input style={inputStyle} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. UltraTech" /></Fld>
        <Fld label="Product name"><input style={inputStyle} value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Cement 53 Grade" /></Fld>
      </div>
      <Fld label="Description"><textarea style={{ ...inputStyle, height: 90, padding: '11px 13px' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the product (min 10 chars)" /></Fld>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <Fld label="MRP (Rs)"><input style={inputStyle} type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="0" /></Fld>
        <Fld label="Selling price (Rs)"><input style={inputStyle} type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0" /></Fld>
        <Fld label="GST %"><select style={inputStyle} value={gstPercent} onChange={(e) => setGstPercent(parseInt(e.target.value, 10))}>{GST_OPTIONS.map((g) => <option key={g} value={g}>{g}%</option>)}</select></Fld>
      </div>
      {discountPercent > 0 && <p style={{ fontSize: 12.5, color: T.green, margin: '-4px 0 10px', fontWeight: 600 }}>Discount: {discountPercent}% off MRP</p>}
      <Fld label="Images (min 2)">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px', borderRadius: 10, cursor: 'pointer', fontSize: 13.5, color: T.body, background: '#F6F7F8', border: `1px dashed ${T.border}` }}>
          <ImagePlus size={16} color={T.green} />{files.length ? `${files.length} image(s) selected` : 'Choose product images'}
          <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => { if (e.target.files) setFiles(Array.from(e.target.files).slice(0, 5)); }} />
        </label>
        {files.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>{files.map((f, i) => (<span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: T.body, padding: '4px 8px', borderRadius: 8, background: '#F6F7F8', border: `1px solid ${T.border}` }}>{f.name.slice(0, 18)}<button onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><Trash2 size={12} /></button></span>))}</div>}
      </Fld>
      {err && <ErrBox msg={err} />}
      <PrimaryBtn onClick={submit} disabled={busy} full>{busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}{busy ? 'Submitting...' : 'Submit product'}</PrimaryBtn>
    </div>
  );
}
function Sel({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: Opt[]; placeholder: string }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} disabled={options.length === 0} style={{ ...inputStyle, opacity: options.length === 0 ? 0.5 : 1 }}><option value="">{placeholder}</option>{options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>;
}

// ---------------- My products ----------------
function ProductsView({ uid, onSell }: { uid: string; onSell: () => void }) {
  type Row = { id: string; kind: 'SUBMISSION' | 'PRODUCT'; productName: string; brand: string; status: string; mrp?: number; price?: number; image?: string; outOfStock: boolean };
  const [rows, setRows] = useState<Row[] | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  async function load() {
    const out: Row[] = [];
    try { const s = await getDocs(query(collection(vDb, 'product_submission'), where('vendorUid', '==', uid))); s.forEach((d) => { const x = d.data() as Record<string, unknown>; out.push({ id: d.id, kind: 'SUBMISSION', productName: (x.productName as string) || (x.title as string) || 'Untitled', brand: (x.brand as string) || '', status: (x.status as string) || 'PENDING', mrp: x.mrp as number, price: x.sellingPrice as number, image: ((x.imageUrls as string[]) || [])[0] || (x.image1Url as string) || '', outOfStock: false }); }); } catch { /* ignore */ }
    try { const s = await getDocs(query(collection(vDb, 'products'), where('vendorId', '==', uid))); s.forEach((d) => { const x = d.data() as Record<string, unknown>; out.push({ id: d.id, kind: 'PRODUCT', productName: (x.productName as string) || (x.title as string) || 'Untitled', brand: (x.brand as string) || '', status: ((x.status as string) || 'LIVE').toUpperCase(), mrp: x.mrp as number, price: (x.price as number) ?? (x.sellingPrice as number), image: ((x.imageUrls as string[]) || [])[0] || (x.imageUrl as string) || (x.image1Url as string) || '', outOfStock: x.inStock === false }); }); } catch { /* ignore */ }
    setRows(out);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [uid]);

  async function toggleStock(id: string, oos: boolean) { setBusyId(id); try { await updateDoc(doc(vDb, 'products', id), { inStock: oos, stockUpdatedAt: serverTimestamp(), updatedAt: serverTimestamp() }); setMsg(oos ? 'Marked In Stock.' : 'Marked Out of Stock.'); await load(); } catch { setMsg('Could not update stock (check permissions).'); } finally { setBusyId(null); } }
  async function toggleLive(id: string, status: string) { setBusyId(id); try { const next = status === 'DISABLED' ? 'LIVE' : 'DISABLED'; await updateDoc(doc(vDb, 'products', id), { status: next, updatedAt: serverTimestamp() }); setMsg('Product ' + next + '.'); await load(); } catch { setMsg('Could not update status (check permissions).'); } finally { setBusyId(null); } }
  async function del(id: string, kind: string) { if (!window.confirm('Permanently delete this listing?')) return; setBusyId(id); try { await deleteDoc(doc(vDb, kind === 'SUBMISSION' ? 'product_submission' : 'products', id)); setMsg('Deleted.'); await load(); } catch { setMsg('Could not delete (check permissions).'); } finally { setBusyId(null); } }

  const counts: Record<string, number> = {};
  (rows || []).forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
  const FILTERS: [string, string][] = [['ALL', 'All'], ['PENDING', 'Pending'], ['APPROVED', 'Approved'], ['LIVE', 'Live'], ['DISABLED', 'Disabled'], ['REJECTED', 'Rejected']];
  const shown = (rows || []).filter((r) => filter === 'ALL' || r.status === filter);
  const mini = (active: boolean): CSSProperties => ({ height: 30, padding: '0 10px', borderRadius: 8, border: `1px solid ${active ? T.green : T.border}`, background: active ? T.green : '#fff', color: active ? '#fff' : T.body, fontWeight: 700, fontSize: 12, cursor: 'pointer' });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.ink }}>My products</h1>
        <PrimaryBtn onClick={onSell}><Plus size={16} /> Sell</PrimaryBtn>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {FILTERS.map(([k, l]) => <button key={k} onClick={() => setFilter(k)} style={{ height: 34, padding: '0 12px', borderRadius: 999, border: `1px solid ${filter === k ? T.green : T.border}`, background: filter === k ? T.green : '#fff', color: filter === k ? '#fff' : T.ink, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{l}{k !== 'ALL' && counts[k] ? ` (${counts[k]})` : ''}</button>)}
      </div>
      {msg && <div style={{ ...card, padding: '8px 12px', marginBottom: 12, fontSize: 12.5, color: T.greenDark, background: T.greenSoft }}>{msg}</div>}
      {rows === null ? <Spinner /> : shown.length === 0 ? <div style={{ ...card, padding: 40, textAlign: 'center', color: T.muted }}>No products in this filter.</div> : (
        <div style={{ display: 'grid', gap: 10 }}>{shown.map((p) => (
          <div key={p.kind + p.id} style={{ ...card, padding: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ width: 54, height: 54, borderRadius: 8, overflow: 'hidden', background: '#F6F7F8', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.image ? <img src={p.image} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}</div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>{p.productName}</div>
              <div style={{ fontSize: 12, color: T.muted }}>{p.brand || '-'}{p.price ? ` - Rs ${p.price}` : ''}{p.mrp && p.mrp !== p.price ? ` (MRP ${p.mrp})` : ''}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Pill status={p.status} />
              {p.outOfStock && <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, background: T.redSoft, color: T.red }}>Out of stock</span>}
              {p.kind === 'PRODUCT' && (<>
                <button disabled={busyId === p.id} onClick={() => toggleStock(p.id, p.outOfStock)} style={mini(p.outOfStock)}>{busyId === p.id ? '...' : p.outOfStock ? 'In stock' : 'Out of stock'}</button>
                <button disabled={busyId === p.id} onClick={() => toggleLive(p.id, p.status)} style={mini(false)}>{p.status === 'DISABLED' ? 'Enable' : 'Disable'}</button>
              </>)}
              <button disabled={busyId === p.id} onClick={() => del(p.id, p.kind)} style={{ height: 30, padding: '0 10px', borderRadius: 8, border: `1px solid ${T.red}`, background: '#fff', color: T.red, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}

// ---------------- Orders ----------------
function OrdersView({ uid, coll, title }: { uid: string; coll: string; title: string }) {
  const [rows, setRows] = useState<{ id: string; code: string; status: string; total: number; items: number; place: string; ts: number }[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  useEffect(() => { (async () => {
    try { const s = await getDocs(query(collection(vDb, coll), where('vendorIds', 'array-contains', uid)));
      const list = s.docs.map((d) => { const x = d.data() as Record<string, unknown>; const vs = (x.vendorStatus as Record<string, string>) || {}; const totals = (x.totals as Record<string, number>) || {}; const items = (x.items as unknown[]) || []; const addr = (x.address as Record<string, string>) || {}; return { id: d.id, code: (x.orderId as string) || (x.orderCode as string) || d.id.slice(0, 8).toUpperCase(), status: vs[uid] || (x.status as string) || 'PLACED', total: totals.total || 0, items: items.length, place: addr.city || addr.town || addr.district || '', ts: (x.createdAt as { seconds?: number })?.seconds || 0 }; }).sort((a, b) => b.ts - a.ts);
      setRows(list);
    } catch { setRows([]); }
  })(); }, [uid, coll]);
  async function setStatus(id: string, val: string) { setBusyId(id); try { await updateDoc(doc(vDb, coll, id), { ['vendorStatus.' + uid]: val, updatedAt: serverTimestamp() }); setRows((rs) => rs ? rs.map((r) => r.id === id ? { ...r, status: val } : r) : rs); } catch { /* ignore */ } finally { setBusyId(null); } }
  const STEPS = ['ARRIVED', 'SHIPPED', 'DELIVERED'];
  return (
    <div>
      <h1 style={{ margin: '0 0 14px', fontSize: 20, fontWeight: 800, color: T.ink }}>{title}</h1>
      {rows === null ? <Spinner /> : rows.length === 0 ? <div style={{ ...card, padding: 40, textAlign: 'center', color: T.muted }}>No orders yet.</div> : (
        <div style={{ display: 'grid', gap: 12 }}>{rows.map((o) => (
          <div key={o.id} style={{ ...card, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div><div style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>#{o.code}</div><div style={{ fontSize: 12, color: T.muted, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><MapPin size={12} /> {o.place || 'NA'} - {o.items} item(s)</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 800, fontSize: 14, color: T.ink }}>Rs {o.total.toLocaleString('en-IN')}</div><div style={{ marginTop: 4 }}><Pill status={o.status} /></div></div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>{STEPS.map((st) => { const on = o.status === st; return (<button key={st} disabled={busyId === o.id} onClick={() => setStatus(o.id, st)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', border: `1px solid ${on ? T.green : T.border}`, background: on ? T.greenSoft : '#fff', color: on ? T.greenDark : T.body }}>{st === 'SHIPPED' ? <Truck size={12} /> : st === 'DELIVERED' ? <Check size={12} /> : <Plus size={12} />}{st}</button>); })}</div>
          </div>
        ))}</div>
      )}
    </div>
  );
}

// ---------------- Holidays ----------------
function HolidaysView({ uid, vendor }: { uid: string; vendor: VendorDoc | null }) {
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const WK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const fmtYMD = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = sod(new Date());
  const wkKey = (d: Date) => WEEKDAYS[(d.getDay() + 6) % 7];
  const dayCount = (a: string, b: string) => Math.max(1, Math.round((sod(new Date(b)).getTime() - sod(new Date(a)).getTime()) / 86400000) + 1);
  const pretty = (ymd: string) => { const [y, m, d] = ymd.split('-').map(Number); return (y && m && d) ? `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}` : ymd; };

  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [rs, setRs] = useState<Date | null>(null);
  const [re, setRe] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [weekly, setWeekly] = useState<Record<string, DayHours>>(defaultSchedule());
  const [holidays, setHolidays] = useState<{ id: string; startDate: string; endDate: string; reason?: string; subVendorName?: string }[]>([]);
  const [subs, setSubs] = useState<{ id: string; name: string }[]>([]);
  const [selSub, setSelSub] = useState('');
  const [busy, setBusy] = useState(false);
  const [savingH, setSavingH] = useState(false);
  const [hoursMsg, setHoursMsg] = useState('');

  const email = (vendor?.email || '').trim().toLowerCase();
  const biz = (vendor?.businessRegisteredName || vendor?.businessName || '').trim().toLowerCase();
  const isMaster = email === 'info@terrainfra360.com' || biz.startsWith('terrainfra360');
  const selectedSub = subs.find((s) => s.id === selSub) || null;

  async function reload() {
    try { const s = await getDocs(collection(vDb, 'shop_schedules', uid, 'holidays')); setHolidays(s.docs.map((d) => ({ id: d.id, ...(d.data() as { startDate: string; endDate: string; reason?: string; subVendorName?: string }) })).sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))); } catch { setHolidays([]); }
  }
  useEffect(() => { (async () => {
    try { const ds = await getDoc(doc(vDb, 'shop_schedules', uid)); const w = (ds.data() as { weeklySchedule?: Record<string, DayHours> } | undefined)?.weeklySchedule; if (w) setWeekly({ ...defaultSchedule(), ...w }); } catch { /* ignore */ }
    await reload();
    try { const s = await getDocs(collection(vDb, 'vendors', uid, 'sub_vendors')); setSubs(s.docs.map((d) => ({ id: d.id, name: String((d.data() as { name?: string }).name || '') })).sort((a, b) => a.name.localeCompare(b.name))); } catch { /* ignore */ }
  })(); }, [uid]);

  function pick(d: Date) { if (sod(d) < today) return; if (!rs || (rs && re)) { setRs(d); setRe(null); return; } if (sod(d) >= sod(rs)) setRe(d); else { setRs(d); setRe(null); } }
  function inRange(d: Date) { if (!rs) return false; const x = sod(d).getTime(); const a = sod(rs).getTime(); const b = sod(re ?? rs).getTime(); return x >= Math.min(a, b) && x <= Math.max(a, b); }
  function isHol(d: Date) { const x = sod(d).getTime(); return holidays.some((h) => { const a = sod(new Date(h.startDate)).getTime(); const b = sod(new Date(h.endDate)).getTime(); return !Number.isNaN(a) && !Number.isNaN(b) && x >= Math.min(a, b) && x <= Math.max(a, b); }); }
  function isWkClosed(d: Date) { return weekly[wkKey(d)]?.open === false; }

  async function confirmClosure() {
    if (!rs || !re) return; setBusy(true);
    try { await addDoc(collection(vDb, 'shop_schedules', uid, 'holidays'), { startDate: fmtYMD(rs), endDate: fmtYMD(re), reason: reason.trim(), ...(isMaster && selectedSub ? { subVendorId: selectedSub.id, subVendorName: selectedSub.name } : {}), createdAt: serverTimestamp() }); setRs(null); setRe(null); setReason(''); setSelSub(''); await reload(); } catch { /* ignore */ } finally { setBusy(false); }
  }
  async function removeHol(id: string) { try { await deleteDoc(doc(vDb, 'shop_schedules', uid, 'holidays', id)); await reload(); } catch { /* ignore */ } }
  async function saveHours() { setSavingH(true); setHoursMsg(''); try { await setDoc(doc(vDb, 'shop_schedules', uid), { weeklySchedule: weekly, updatedAt: serverTimestamp() }, { merge: true }); setHoursMsg('Weekly operating hours saved.'); } catch { /* ignore */ } finally { setSavingH(false); } }
  function setDay(day: string, patch: Partial<DayHours>) { setHoursMsg(''); setWeekly((pr) => ({ ...pr, [day]: { ...pr[day], ...patch } })); }

  const year = cursor.getFullYear(); const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const canPrev = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());
  const yearOpts: number[] = []; for (let y = today.getFullYear() - 1; y <= today.getFullYear() + 3; y++) yearOpts.push(y);
  const selLabel = rs && re ? `${fmtYMD(rs)} to ${fmtYMD(re)} (${dayCount(fmtYMD(rs), fmtYMD(re))} day${dayCount(fmtYMD(rs), fmtYMD(re)) > 1 ? 's' : ''})` : rs ? `${fmtYMD(rs)} - pick an end date` : 'Pick a start date on the calendar';
  const selStyle: CSSProperties = { ...inputStyle, height: 40, fontWeight: 700, width: 'auto' };

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: T.ink }}>Holiday Calendar</h1>
      <p style={{ color: T.muted, fontSize: 13, marginBottom: 14 }}>Mark the days your shop will be closed. Delivery estimates extend automatically by the days you close.</p>

      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <button onClick={() => { if (canPrev) setCursor(new Date(year, month - 1, 1)); }} disabled={!canPrev} style={{ height: 36, padding: '0 12px', borderRadius: 6, border: `1px solid ${T.border}`, background: '#fff', cursor: canPrev ? 'pointer' : 'not-allowed', opacity: canPrev ? 1 : 0.4, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={14} /> Prev</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={month} onChange={(e) => setCursor(new Date(year, Number(e.target.value), 1))} style={selStyle}>{MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}</select>
            <select value={year} onChange={(e) => setCursor(new Date(Number(e.target.value), month, 1))} style={selStyle}>{yearOpts.map((y) => <option key={y} value={y}>{y}</option>)}</select>
          </div>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} style={{ height: 36, padding: '0 12px', borderRadius: 6, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>Next <ChevronRight size={14} /></button>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12, fontSize: 12, fontWeight: 700, color: T.body }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: T.redSoft, border: `1px solid ${T.red}` }} /> Non-working day (weekly off or holiday closure)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: T.green }} /> Selected range</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: '#fff', border: `2px solid ${T.green}` }} /> Today</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
          {WK.map((w) => <div key={w} style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: T.muted, padding: '4px 0' }}>{w}</div>)}
          {cells.map((d, i) => {
            if (d === null) return <div key={`b${i}`} />;
            const cd = new Date(year, month, d);
            const past = sod(cd) < today;
            const isToday = sod(cd).getTime() === today.getTime();
            const sel = inRange(cd);
            const nw = isWkClosed(cd) || isHol(cd);
            const bg = sel ? T.green : nw ? T.redSoft : past ? '#f4f4f5' : '#fff';
            const col = sel ? '#fff' : nw ? T.red : past ? '#b0b0b0' : T.ink;
            const bd = isToday ? `2px solid ${T.green}` : (nw && !sel) ? `1px solid ${T.red}` : `1px solid ${T.border}`;
            return <button key={`d${d}`} disabled={past} onClick={() => pick(cd)} style={{ height: 44, borderRadius: 8, border: bd, background: bg, color: col, fontWeight: 800, cursor: past ? 'not-allowed' : 'pointer' }}>{d}</button>;
          })}
        </div>
        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          <div style={{ padding: '8px 12px', borderRadius: 6, background: T.greenSoft, fontSize: 13, fontWeight: 800, color: T.greenDark }}>{selLabel}</div>
          {isMaster && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.4, color: T.muted, marginBottom: 4 }}>Which sub-vendor is applying for leave?</div>
              <select value={selSub} onChange={(e) => setSelSub(e.target.value)} disabled={busy || subs.length === 0} style={inputStyle}>
                <option value="">{subs.length === 0 ? '- Add sub-vendors first -' : '- Select sub-vendor (optional) -'}</option>
                {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <input style={inputStyle} placeholder="Reason (optional) - e.g. Diwali, stock-taking" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <PrimaryBtn onClick={confirmClosure} disabled={!rs || !re || busy}>{busy ? 'Saving...' : 'Confirm Closure'}</PrimaryBtn>
            {rs && <GhostBtn onClick={() => { setRs(null); setRe(null); }}>Clear selection</GhostBtn>}
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ fontWeight: 800, color: T.ink, marginBottom: 4 }}>Weekly Operating Hours</div>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>Days marked closed repeat every week and show red on the calendar.</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {WEEKDAYS.map((day, i) => { const dh = weekly[day]; return (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '8px 10px', border: `1px solid ${T.border}`, borderRadius: 8, background: dh.open ? '#fff' : T.redSoft }}>
              <div style={{ width: 84, fontWeight: 800, color: dh.open ? T.ink : T.red }}>{WK[i]}</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}><input type="checkbox" checked={dh.open} onChange={() => setDay(day, { open: !dh.open })} />{dh.open ? 'Open' : 'Closed'}</label>
              {dh.open ? (<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="time" value={dh.openTime} onChange={(e) => setDay(day, { openTime: e.target.value })} style={{ ...inputStyle, height: 34, width: 120 }} /><span style={{ color: T.muted }}>to</span><input type="time" value={dh.closeTime} onChange={(e) => setDay(day, { closeTime: e.target.value })} style={{ ...inputStyle, height: 34, width: 120 }} /></div>) : <span style={{ fontSize: 12, color: T.red, fontWeight: 700 }}>Recurring weekly off</span>}
            </div>
          ); })}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
          <PrimaryBtn onClick={saveHours} disabled={savingH}>{savingH ? 'Saving...' : 'Save Weekly Hours'}</PrimaryBtn>
          {hoursMsg && <span style={{ fontSize: 13, fontWeight: 700, color: T.green }}>{hoursMsg}</span>}
        </div>
      </div>

      <div style={{ ...card, padding: 16 }}>
        <div style={{ fontWeight: 800, color: T.ink, marginBottom: 10 }}>Scheduled Closures ({holidays.length})</div>
        {holidays.length === 0 ? <div style={{ color: T.muted, fontSize: 13 }}>No closures scheduled. Your shop follows its weekly hours.</div> : (
          <div style={{ display: 'grid', gap: 8 }}>{holidays.map((h) => (
            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 12px', border: `1px solid ${T.border}`, borderRadius: 8 }}>
              <div>
                <div style={{ fontWeight: 800, color: T.ink }}>{pretty(h.startDate)} - {pretty(h.endDate)} <span style={{ color: T.muted, fontWeight: 600 }}>({dayCount(h.startDate, h.endDate)} day{dayCount(h.startDate, h.endDate) > 1 ? 's' : ''})</span></div>
                {h.subVendorName ? <div style={{ fontSize: 11, fontWeight: 800, color: T.greenDark, marginTop: 2 }}>{h.subVendorName} on leave</div> : null}
                {h.reason ? <div style={{ fontSize: 12, color: T.muted }}>{h.reason}</div> : null}
              </div>
              <button onClick={() => removeHol(h.id)} style={{ height: 34, padding: '0 12px', borderRadius: 6, border: `1px solid ${T.border}`, background: '#fff', color: T.red, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}

// ---------------- Profile ----------------
function ProfileView({ uid }: { uid: string }) {
  const [v, setV] = useState<VendorDoc | null>(null);
  useEffect(() => { getDoc(doc(vDb, 'vendors', uid)).then((s) => setV((s.data() as VendorDoc) || {})).catch(() => setV({})); }, [uid]);
  const rows: [string, string | undefined][] = v ? [['Full name', v.fullName], ['Owner', v.businessOwnerName], ['Business', v.businessRegisteredName || v.businessName], ['Email', v.email], ['Phone', v.phone], ['Specialization', v.specialization], ['GST', v.gstNumber], ['PAN', v.panNumber], ['Aadhaar', v.aadharNumberMasked], ['Address', [v.shopAddressLine1, v.shopAddressLine2].filter(Boolean).join(', ')], ['City', v.city], ['State', v.state], ['Pincode', v.pincode]] : [];
  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: T.ink }}>My profile</h1>
      {v && <div style={{ marginBottom: 14 }}><Pill status={v.status || 'PENDING'} /></div>}
      {!v ? <Spinner /> : (
        <div style={{ ...card, overflow: 'hidden' }}>{rows.map(([k, val], i) => (
          <div key={k} style={{ display: 'flex', gap: 16, padding: '12px 18px', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
            <span style={{ width: 120, flexShrink: 0, ...overline }}>{k}</span>
            <span style={{ fontSize: 13.5, color: T.ink, fontWeight: 500, wordBreak: 'break-word' }}>{val || '-'}</span>
          </div>
        ))}</div>
      )}
      <p style={{ fontSize: 12, color: T.muted, marginTop: 12 }}>Profile details are managed in the TerraInfra360 vendor app. Operating hours can be edited in Holiday calendar.</p>
    </div>
  );
}

// ---------------- Catalog / Sub Vendors (placeholders) ----------------
function CatalogView({ onSell }: { onSell: () => void }) {
  return (
    <div style={{ ...card, padding: 40, textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ width: 60, height: 60, borderRadius: 999, background: T.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Upload size={26} color={T.green} /></div>
      <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: T.ink }}>Upload catalog</h1>
      <p style={{ color: T.body, fontSize: 13.5, marginTop: 8, maxWidth: 380, margin: '8px auto 0' }}>Bulk CSV / price-list upload is coming to the web portal. For now you can list products one at a time.</p>
      <div style={{ marginTop: 18 }}><PrimaryBtn onClick={onSell}>Sell a product</PrimaryBtn></div>
    </div>
  );
}
function SubVendorsView({ uid, vendor }: { uid: string; vendor: VendorDoc | null }) {
  type Sub = { id: string; name: string; address: string; phone: string; specialization: string; branchesBlr: number };
  const [items, setItems] = useState<Sub[] | null>(null);
  const [name, setName] = useState(''); const [address, setAddress] = useState(''); const [phone, setPhone] = useState(''); const [spec, setSpec] = useState(''); const [branches, setBranches] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [ok, setOk] = useState(''); const [search, setSearch] = useState('');

  const email = (vendor?.email || '').trim().toLowerCase();
  const biz = (vendor?.businessRegisteredName || vendor?.businessName || '').trim().toLowerCase();
  const isMaster = email === 'info@terrainfra360.com' || biz.startsWith('terrainfra360');

  async function load() {
    try { const s = await getDocs(collection(vDb, 'vendors', uid, 'sub_vendors')); const list = s.docs.map((d) => { const x = d.data() as Record<string, unknown>; return { id: d.id, name: String(x.name || ''), address: String(x.address || ''), phone: String(x.phone || ''), specialization: String(x.specialization || ''), branchesBlr: Number(x.branchesBlr || 0) }; }).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())); setItems(list); } catch { setItems([]); }
  }
  useEffect(() => { if (isMaster) load(); else setItems([]); /* eslint-disable-next-line */ }, [uid, isMaster]);

  function reset() { setName(''); setAddress(''); setPhone(''); setSpec(''); setBranches(''); setEditingId(null); }
  async function save() {
    setErr(''); setOk('');
    if (!name.trim()) { setErr('Vendor name is required.'); return; }
    if (!phone.trim()) { setErr('Contact number is required.'); return; }
    setBusy(true);
    try {
      const colRef = collection(vDb, 'vendors', uid, 'sub_vendors');
      const payload = { name: name.trim(), address: address.trim(), phone: phone.trim(), specialization: spec.trim(), branchesBlr: Number(branches) || 0, updatedAt: serverTimestamp() };
      if (editingId) { await updateDoc(doc(colRef, editingId), payload); setOk(`Sub-vendor "${name.trim()}" updated.`); }
      else { await addDoc(colRef, { ...payload, createdAt: serverTimestamp() }); setOk(`Sub-vendor "${name.trim()}" added.`); }
      reset(); await load();
    } catch (e) { const m = (e as { message?: string }).message || String(e); setErr(m.toLowerCase().includes('permission') ? 'Save blocked by Firestore rules.' : 'Save failed: ' + m); }
    finally { setBusy(false); }
  }
  function startEdit(s: Sub) { setEditingId(s.id); setName(s.name); setAddress(s.address); setPhone(s.phone); setSpec(s.specialization); setBranches(String(s.branchesBlr || '')); setErr(''); setOk(''); }
  async function del(s: Sub) { if (!window.confirm(`Delete sub-vendor "${s.name}"?`)) return; try { await deleteDoc(doc(vDb, 'vendors', uid, 'sub_vendors', s.id)); setOk(`Deleted "${s.name}".`); await load(); } catch { setErr('Delete failed.'); } }

  if (!isMaster) return (
    <div style={{ ...card, padding: 40, textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ width: 60, height: 60, borderRadius: 999, background: T.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Users size={26} color={T.green} /></div>
      <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: T.ink }}>Sub vendors</h1>
      <p style={{ color: T.body, fontSize: 13.5, maxWidth: 400, margin: '8px auto 0' }}>Sub-vendors is only available for the TerraInfra360 master account. Sign in with info@terrainfra360.com to manage suppliers.</p>
    </div>
  );

  const q = search.trim().toLowerCase();
  const shown = (items || []).filter((x) => !q || [x.name, x.address, x.phone, x.specialization, x.id, String(x.branchesBlr)].join(' ').toLowerCase().includes(q));
  const lbl: CSSProperties = { fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 4 };

  return (
    <div style={{ maxWidth: 820, display: 'grid', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.ink }}>Sub Vendors</h1>
        <p style={{ color: T.muted, fontSize: 13, marginTop: 6 }}>Add the suppliers you sell on behalf of. They appear in the Sell Product sub-vendor picker.</p>
      </div>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ fontWeight: 800, color: T.ink, marginBottom: 10 }}>{editingId ? 'Edit sub-vendor' : 'Add new sub-vendor'}</div>
        {editingId && <div style={{ background: '#F1F5F9', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 800, color: T.ink, marginBottom: 10, display: 'inline-block' }}>Vendor ID: {editingId}</div>}
        <div style={{ display: 'grid', gap: 12 }}>
          <div><div style={lbl}>Vendor name *</div><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Sub-vendor business name" maxLength={120} /></div>
          <div><div style={lbl}>Contact number *</div><input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} placeholder="10-digit mobile" maxLength={10} inputMode="numeric" /></div>
          <div><div style={lbl}>Address</div><input style={inputStyle} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area, city" maxLength={200} /></div>
          <div><div style={lbl}>Specialization</div><input style={inputStyle} value={spec} onChange={(e) => setSpec(e.target.value)} placeholder="e.g. Lighting, Tiles, Cement" maxLength={120} /></div>
          <div><div style={lbl}>Branches / outlets in Bangalore</div><input style={inputStyle} value={branches} onChange={(e) => setBranches(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 3" inputMode="numeric" maxLength={4} /></div>
        </div>
        {err && <ErrBox msg={err} />}
        {ok && <div style={{ background: T.greenSoft, color: T.greenDark, padding: '8px 12px', borderRadius: 8, marginTop: 10, fontSize: 12.5, fontWeight: 700 }}>{ok}</div>}
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <PrimaryBtn onClick={save} disabled={busy}>{busy ? 'Saving...' : editingId ? 'Update sub-vendor' : 'Add sub-vendor'}</PrimaryBtn>
          {editingId && <GhostBtn onClick={reset}>Cancel</GhostBtn>}
        </div>
      </div>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 800, color: T.ink }}>All sub-vendors ({items ? items.length : 0})</div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, specialization..." style={{ ...inputStyle, marginLeft: 'auto', width: 'min(340px,100%)' }} />
        </div>
        {items === null ? <Spinner /> : shown.length === 0 ? <div style={{ color: T.muted, padding: 12, fontSize: 13 }}>{items.length === 0 ? 'No sub-vendors yet. Add your first one above.' : 'No matches for that search.'}</div> : (
          <div style={{ display: 'grid', gap: 10 }}>{shown.map((s) => (
            <div key={s.id} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: T.ink }}>{s.name}</div>
                <div style={{ fontSize: 10, color: T.muted, fontFamily: 'ui-monospace, monospace' }}>ID: {s.id}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: T.body }}>{s.phone || '-'} - {s.specialization || '-'} - {s.branchesBlr || 0} outlet{s.branchesBlr === 1 ? '' : 's'} in Bangalore</div>
                {s.address && <div style={{ marginTop: 4, fontSize: 12, color: T.muted }}>{s.address}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <button onClick={() => startEdit(s)} style={{ height: 32, padding: '0 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => del(s)} style={{ height: 32, padding: '0 12px', borderRadius: 8, border: `1px solid ${T.red}`, background: '#fff', color: T.red, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
