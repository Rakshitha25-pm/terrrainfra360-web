// AdminPortal.tsx
// Native in-site TF360 Admin Console, faithful to the admin-web app:
// gold/cream theme (Cormorant Garamond display + Inter body), two-panel sign-in
// gated on admin_users/{uid}.active === true, a Welcome-to-TF360 dashboard with
// stat cards + Approval Center + Management Modules, and LIVE approval queues
// (vendors / contractors / products / properties / b2b memberships) that read and
// write the same Firestore the rest of the platform uses. Isolated Firebase app
// instance so admin sign-in never clobbers the customer phone-auth session.
import { useEffect, useState, type CSSProperties, type ComponentType } from 'react';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import {
  getFirestore, collection, doc, getDoc, getDocs, updateDoc, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import {
  X, LogOut, Bell, Eye, EyeOff, ArrowRight, ArrowLeft, Users, FileText, ShoppingCart,
  ClipboardList, Check, Loader2, AlertCircle, Search,
} from 'lucide-react';
import { firebaseApp } from '../lib/firebase';

const aApp = getApps().find((a) => a.name === 'admin-portal') ?? initializeApp(firebaseApp.options, 'admin-portal');
const aAuth = getAuth(aApp);
const aDb = getFirestore(aApp);

// design tokens (from the admin-web app)
const T = {
  gold: '#C5A059', goldDeep: '#B08D3E', goldSoft: '#E4CF9A', goldText: '#8A6D27',
  ink: '#1A1A1A', body: '#52525B', muted: '#71717A',
  bg: '#FDFCFB', surface: '#FFFFFF', border: '#EDE7DC', cream: '#F6F1E8',
  emerald: '#047857', emeraldSoft: '#ECFDF5', red: '#B91C1C', redSoft: '#FEF2F2',
};
const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "Inter, ui-sans-serif, system-ui, sans-serif";
const HERO = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80';
const IMG = {
  vendors: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=70',
  contractors: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=70',
  products: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=70',
  properties: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=70',
  b2b: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=70',
  orders: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=900&q=70',
};

function useFonts() {
  useEffect(() => {
    const id = 'tf360-admin-fonts';
    if (document.getElementById(id)) return;
    const l = document.createElement('link');
    l.id = id; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,500;1,600&family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }, []);
}

type IconType = ComponentType<{ size?: number; color?: string; style?: CSSProperties }>;
type Row = { id: string } & Record<string, unknown>;

const glass: CSSProperties = { background: 'rgba(255,255,255,0.92)', border: `1px solid ${T.border}`, boxShadow: '0 18px 48px -28px rgba(26,26,26,0.28)' };
const overline = (color = T.gold): CSSProperties => ({ fontSize: 11, fontWeight: 700, letterSpacing: 2.4, textTransform: 'uppercase', color });

function GoldBtn({ children, onClick, disabled, full }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; full?: boolean }) {
  return <button onClick={onClick} disabled={disabled} style={{ height: 50, padding: '0 24px', width: full ? '100%' : undefined, borderRadius: 999, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#C5A059,#D7B673 50%,#C5A059)', color: '#1A1A1A', fontWeight: 700, fontSize: 14, letterSpacing: 0.3, opacity: disabled ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: '0 12px 26px -14px rgba(197,160,89,0.85)' }}>{children}</button>;
}
function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} style={{ height: 50, padding: '0 22px', borderRadius: 999, border: `1px solid ${T.gold}55`, background: 'rgba(255,255,255,0.7)', color: T.ink, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{children}</button>;
}
function StatusPill({ status }: { status: string }) {
  const s = (status || '').toUpperCase();
  const good = s === 'APPROVED' || s === 'LIVE' || s === 'ACTIVE' || s === 'PAID' || s === 'DELIVERED';
  const bad = s === 'REJECTED' || s === 'SUSPENDED' || s === 'CANCELLED';
  const bg = good ? T.emeraldSoft : bad ? T.redSoft : '#FDF8EC';
  const fg = good ? T.emerald : bad ? T.red : T.goldText;
  return <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 999, background: bg, color: fg }}>{s || 'PENDING'}</span>;
}
function Splash() {
  return <div style={{ position: 'fixed', inset: 0, zIndex: 660, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color={T.gold} /></div>;
}

function labelOf(col: string, d: Row): string {
  const g = (k: string) => (d[k] == null ? '' : String(d[k]));
  if (col === 'vendors') return g('businessRegisteredName') || g('businessName') || g('fullName') || g('businessOwnerName') || g('email') || d.id;
  if (col === 'contractors') return g('companyName') || g('name') || g('contactName') || g('email') || d.id;
  if (col === 'product_submission' || col === 'b2b_product_submission' || col === 'products' || col === 'b2b_products') return g('productName') || g('name') || g('title') || d.id;
  if (col === 'properties') return g('title') || g('name') || g('projectName') || d.id;
  if (col === 'b2b_memberships') return g('businessName') || g('name') || g('email') || d.id;
  return g('name') || g('title') || d.id;
}
function subOf(col: string, d: Row): string {
  const g = (k: string) => (d[k] == null ? '' : String(d[k]));
  if (col === 'vendors') return [g('city'), g('specialization')].filter(Boolean).join(' . ') || g('phone') || g('email');
  if (col === 'contractors') return [g('city'), g('region')].filter(Boolean).join(' . ') || g('email') || g('phone');
  if (col === 'b2b_memberships') return g('email') || g('gstNumber');
  if (col === 'product_submission' || col === 'b2b_product_submission') return [g('brand'), g('vendorBusinessName')].filter(Boolean).join(' . ');
  return g('email') || g('city') || '';
}

function LoginView(p: {
  email: string; pw: string; showPw: boolean; busy: boolean; err: string | null;
  setEmail: (v: string) => void; setPw: (v: string) => void; setShowPw: (v: boolean) => void;
  onSubmit: () => void; onClose: () => void;
}) {
  const lbl: CSSProperties = { ...overline(T.muted), fontSize: 10.5, letterSpacing: 2, marginBottom: 8, display: 'block' };
  const inp: CSSProperties = { height: 52, width: '100%', padding: '0 16px', borderRadius: 14, border: `1px solid ${T.border}`, outline: 'none', fontSize: 15, color: T.ink, background: '#fff', boxSizing: 'border-box', fontFamily: SANS };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 660, background: T.bg, overflowY: 'auto', fontFamily: SANS, color: T.ink }}>
      <button onClick={p.onClose} title="Close" style={{ position: 'fixed', top: 18, right: 20, zIndex: 5, height: 40, width: 40, borderRadius: 999, border: `1px solid ${T.border}`, background: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}><X size={18} /></button>
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', minHeight: '100vh' }}>
        {/* left hero */}
        <div style={{ position: 'relative', padding: 56, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundImage: `linear-gradient(135deg, rgba(26,26,26,0.74), rgba(26,26,26,0.46) 60%, rgba(26,26,26,0.28)), url(${HERO})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ height: 46, width: 46, borderRadius: 999, background: 'linear-gradient(135deg,#C5A059,#D7B673)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1A1A', fontWeight: 800, fontSize: 16 }}>TF</div>
            <div>
              <div style={{ ...overline(T.goldSoft), fontSize: 10 }}>TF360</div>
              <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600 }}>Admin Console</div>
            </div>
          </div>
          <div style={{ maxWidth: 480 }}>
            <div style={{ ...overline(T.goldSoft), marginBottom: 18 }}>Administration</div>
            <div style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 600, lineHeight: 1.05 }}>One workspace.<br /><span style={{ fontStyle: 'italic', color: T.goldSoft }}>Every</span> operation.</div>
            <p style={{ marginTop: 20, fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.82)' }}>Review approvals, manage contractors, monitor RFQs and oversee your commerce lifecycle from a single, curated surface.</p>
          </div>
          <div style={{ ...overline('rgba(255,255,255,0.6)'), fontSize: 10.5 }}>(C) TF360 . Secured access</div>
        </div>
        {/* right form */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, background: T.bg }}>
          <div style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ ...overline(T.gold), marginBottom: 14 }}>Welcome back</div>
            <div style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.05, color: T.ink }}>Sign in to your<br /><span style={{ fontStyle: 'italic', color: T.gold }}>admin</span> console.</div>
            <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.65, color: T.body }}>Access is restricted to active admin accounts. If you need credentials, contact your TF360 administrator.</p>
            <div style={{ marginTop: 28 }}>
              <label style={lbl}>Email</label>
              <input value={p.email} onChange={(e) => p.setEmail(e.target.value)} placeholder="admin@tf360.com" autoComplete="username" style={inp} onKeyDown={(e) => { if (e.key === 'Enter') p.onSubmit(); }} />
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={lbl}>Password</label>
              <div style={{ position: 'relative' }}>
                <input value={p.pw} onChange={(e) => p.setPw(e.target.value)} type={p.showPw ? 'text' : 'password'} placeholder="********" autoComplete="current-password" style={{ ...inp, paddingRight: 46 }} onKeyDown={(e) => { if (e.key === 'Enter') p.onSubmit(); }} />
                <button onClick={() => p.setShowPw(!p.showPw)} type="button" style={{ position: 'absolute', right: 8, top: 8, height: 36, width: 36, border: 'none', background: 'none', cursor: 'pointer', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            {p.err && <div style={{ marginTop: 16, padding: '11px 14px', borderRadius: 14, border: '1px solid #FCA5A5', background: T.redSoft, color: '#991B1B', fontSize: 13, fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}><AlertCircle size={16} /> {p.err}</div>}
            <div style={{ marginTop: 22 }}>
              <GoldBtn full disabled={p.busy} onClick={p.onSubmit}>{p.busy ? <Loader2 size={17} className="animate-spin" /> : <>Sign in to console <ArrowRight size={17} /></>}</GoldBtn>
            </div>
            <div style={{ ...overline(T.muted), fontSize: 10.5, marginTop: 26, textAlign: 'center' }}>TF360 . Secured</div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ApprovalCfg = { key: string; title: string; sub: string; col: string; statusField: string; order?: string; approve: string; reject: string; pending: string; img: string };
const APPROVALS: ApprovalCfg[] = [
  { key: 'vendors', title: 'Vendor Approvals', sub: 'Seller onboarding & KYC', col: 'vendors', statusField: 'status', order: 'status', approve: 'APPROVED', reject: 'REJECTED', pending: 'PENDING', img: IMG.vendors },
  { key: 'contractors', title: 'Contractor Approvals', sub: 'Contractor registrations', col: 'contractors', statusField: 'status', order: 'createdAt', approve: 'APPROVED', reject: 'REJECTED', pending: 'PENDING', img: IMG.contractors },
  { key: 'products', title: 'Product Approvals', sub: 'Retail product submissions', col: 'product_submission', statusField: 'status', order: 'status', approve: 'APPROVED', reject: 'REJECTED', pending: 'PENDING', img: IMG.products },
  { key: 'properties', title: 'Property Approvals', sub: 'Property listing review', col: 'properties', statusField: 'approvalStatus', approve: 'approved', reject: 'rejected', pending: 'pending', img: IMG.properties },
  { key: 'memberships', title: 'B2B Memberships', sub: 'Membership applications', col: 'b2b_memberships', statusField: 'status', order: 'createdAt', approve: 'APPROVED', reject: 'REJECTED', pending: 'PENDING', img: IMG.b2b },
  { key: 'b2bsubs', title: 'B2B Submissions', sub: 'B2B product submissions', col: 'b2b_product_submission', statusField: 'status', order: 'status', approve: 'APPROVED', reject: 'REJECTED', pending: 'PENDING', img: IMG.b2b },
];

type ManageCfg = { key: string; title: string; sub: string; col: string; order?: string; cols: { label: string; field: string }[]; img: string };
const MANAGE: ManageCfg[] = [
  { key: 'contractors-hub', title: 'Contractors', sub: 'Contractor management hub', col: 'contractors', cols: [{ label: 'Company', field: 'companyName' }, { label: 'City', field: 'city' }, { label: 'Status', field: 'status' }], img: IMG.contractors },
  { key: 'rfqs', title: 'RFQ Management', sub: 'Requests for quotation', col: 'rfqs', cols: [{ label: 'Title', field: 'title' }, { label: 'Location', field: 'location' }, { label: 'Status', field: 'status' }], img: IMG.properties },
  { key: 'products-live', title: 'Products', sub: 'Live retail catalog', col: 'products', cols: [{ label: 'Name', field: 'name' }, { label: 'Brand', field: 'brand' }, { label: 'Stock', field: 'inStock' }], img: IMG.products },
  { key: 'orders', title: 'Orders', sub: 'Retail orders', col: 'orders', cols: [{ label: 'Customer', field: 'customerName' }, { label: 'Status', field: 'status' }], img: IMG.orders },
  { key: 'b2b-orders', title: 'B2B Orders', sub: 'Business orders', col: 'b2b_orders', cols: [{ label: 'Business', field: 'businessName' }, { label: 'Status', field: 'status' }], img: IMG.b2b },
  { key: 'b2b-products', title: 'B2B Products', sub: 'Business catalog', col: 'b2b_products', cols: [{ label: 'Name', field: 'name' }, { label: 'Status', field: 'status' }], img: IMG.products },
];

const STATS = [
  { value: '6', label: 'Approval Queues', icon: ClipboardList },
  { value: '1', label: 'Contractor Hub', icon: Users },
  { value: '1', label: 'RFQ Module', icon: FileText },
  { value: '3', label: 'Commerce Modules', icon: ShoppingCart },
];

function Topbar({ onLogout, onClose, bell }: { onLogout: () => void; onClose: () => void; bell: number }) {
  return (
    <div style={{ ...glass, borderRadius: 18, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{ height: 42, width: 42, borderRadius: 999, background: 'linear-gradient(135deg,#C5A059,#D7B673)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1A1A', fontWeight: 800 }}>TF</div>
        <div>
          <div style={{ ...overline(T.gold), fontSize: 10 }}>TF360</div>
          <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: T.ink }}>Admin Console</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', height: 42, width: 42, borderRadius: 999, border: `1px solid ${T.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.body }}>
          <Bell size={18} />
          {bell > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 999, background: T.gold, color: '#1A1A1A', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{bell > 99 ? '99+' : bell}</span>}
        </div>
        <GhostBtn onClick={onLogout}><LogOut size={15} /> Sign out</GhostBtn>
        <button onClick={onClose} title="Close" style={{ height: 42, width: 42, borderRadius: 999, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
      </div>
    </div>
  );
}

function ModuleCard({ title, sub, img, tag, onClick }: { title: string; sub: string; img: string; tag: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ ...glass, borderRadius: 22, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', padding: 0, border: `1px solid ${T.border}` }}>
      <div style={{ position: 'relative', height: 150, backgroundImage: `linear-gradient(to top, rgba(26,26,26,0.55), rgba(26,26,26,0.05)), url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.95)', color: T.goldText, fontSize: 9.5, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', padding: '4px 9px', borderRadius: 999 }}>{tag}</span>
      </div>
      <div style={{ padding: '15px 17px' }}>
        <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink }}>{title}</div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 3 }}>{sub}</div>
        <div style={{ marginTop: 11, display: 'inline-flex', alignItems: 'center', gap: 6, color: T.goldText, fontWeight: 700, fontSize: 12.5 }}>Open <ArrowRight size={14} /></div>
      </div>
    </button>
  );
}

function Home({ go, bell, onLogout, onClose }: { go: (v: AdminView) => void; bell: number; onLogout: () => void; onClose: () => void }) {
  const sectionTitle = (over: string, head: string) => (
    <div style={{ marginBottom: 16 }}>
      <div style={overline(T.gold)}>{over}</div>
      <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: T.ink, marginTop: 4 }}>{head}</div>
    </div>
  );
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '22px 24px 60px' }}>
      <Topbar onLogout={onLogout} onClose={onClose} bell={bell} />
      {/* hero */}
      <div style={{ ...glass, borderRadius: 28, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.3fr 1fr', marginBottom: 18 }}>
        <div style={{ padding: '40px 40px 36px' }}>
          <div style={overline(T.gold)}>Administration</div>
          <div style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 600, lineHeight: 1.04, color: T.ink, marginTop: 8 }}>Welcome to<br /><span style={{ fontStyle: 'italic', color: T.gold }}>TF360</span></div>
          <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.7, color: T.body, maxWidth: 520 }}>Your central admin console for reviewing approvals, managing contractors, monitoring RFQs and overseeing your entire commerce lifecycle.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <GoldBtn onClick={() => go({ t: 'manage', cfg: MANAGE[1] })}>Go to RFQ Management <ArrowRight size={16} /></GoldBtn>
            <GhostBtn onClick={() => go({ t: 'approval', cfg: APPROVALS[0] })}>Review Approvals</GhostBtn>
          </div>
        </div>
        <div style={{ backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.85), rgba(255,255,255,0.1) 55%, rgba(26,26,26,0.05)), url(${HERO})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      </div>
      {/* stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 34 }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={{ ...glass, borderRadius: 20, padding: '18px 20px', border: i === 0 ? `2px solid ${T.gold}55` : `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 700, color: T.ink, lineHeight: 1 }}>{s.value}</div>
              <s.icon size={20} color={T.gold} />
            </div>
            <div style={{ ...overline(T.muted), fontSize: 10.5, marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* approval center */}
      {sectionTitle('Approval Center', 'Review & approve submissions')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>
        {APPROVALS.map((a) => <ModuleCard key={a.key} title={a.title} sub={a.sub} img={a.img} tag="Approvals" onClick={() => go({ t: 'approval', cfg: a })} />)}
      </div>
      {/* management modules */}
      {sectionTitle('Management Modules', 'Operations & commerce')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {MANAGE.map((m) => <ModuleCard key={m.key} title={m.title} sub={m.sub} img={m.img} tag="Module" onClick={() => go({ t: 'manage', cfg: m })} />)}
      </div>
    </div>
  );
}

function PageHeader({ title, sub, onBack }: { title: string; sub: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
      <button onClick={onBack} style={{ height: 42, width: 42, borderRadius: 999, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', color: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={18} /></button>
      <div>
        <div style={overline(T.gold)}>Admin</div>
        <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: T.ink, lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function ApprovalQueue({ cfg, onBack }: { cfg: ApprovalCfg; onBack: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [cfg.key]);
  async function load() {
    setRows(null); setErr(null);
    const map = (snap: { docs: { id: string; data: () => Record<string, unknown> }[] }) => snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
    try {
      const base = collection(aDb, cfg.col);
      const q = cfg.order ? query(base, orderBy(cfg.order, cfg.order === 'createdAt' ? 'desc' : 'asc')) : query(base);
      setRows(map(await getDocs(q)));
    } catch {
      try { setRows(map(await getDocs(collection(aDb, cfg.col)))); }
      catch { setErr('Could not load ' + cfg.title + '. Check your admin access.'); setRows([]); }
    }
  }
  const statusOf = (r: Row) => String(r[cfg.statusField] ?? cfg.pending);
  const norm = (s: string) => s.toUpperCase();
  async function setStatus(r: Row, status: string) {
    setBusyId(r.id); setErr(null);
    try {
      const patch: Record<string, unknown> = { [cfg.statusField]: status, updatedAt: serverTimestamp() };
      if (norm(status) === norm(cfg.approve)) { patch.approvedAt = serverTimestamp(); if (cfg.col === 'vendors') { patch.rejectionReasons = []; patch.rejectionOther = ''; } }
      if (norm(status) === norm(cfg.reject)) { patch.rejectedAt = serverTimestamp(); if (cfg.col === 'vendors') patch.rejectionReasons = ['Rejected by admin']; }
      await updateDoc(doc(aDb, cfg.col, r.id), patch);
      setRows((prev) => (prev ? prev.map((x) => (x.id === r.id ? { ...x, [cfg.statusField]: status } : x)) : prev));
    } catch { setErr('Update failed - your account may not have write access to ' + cfg.col + '.'); }
    finally { setBusyId(null); }
  }
  const list = (rows || []).filter((r) => (filter === 'ALL' ? true : norm(statusOf(r)) === filter));
  const cnt = (f: string) => (rows || []).filter((r) => norm(statusOf(r)) === f).length;
  const tabs: ('ALL' | 'PENDING' | 'APPROVED' | 'REJECTED')[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

  return (
    <div>
      <PageHeader title={cfg.title} sub={cfg.sub} onBack={onBack} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {tabs.map((t) => {
          const on = filter === t;
          const c = t === 'ALL' ? (rows || []).length : cnt(t);
          return <button key={t} onClick={() => setFilter(t)} style={{ padding: '8px 15px', borderRadius: 999, border: `1px solid ${on ? T.gold : T.border}`, background: on ? T.gold : '#fff', color: on ? '#1A1A1A' : T.body, fontWeight: 700, fontSize: 12.5, cursor: 'pointer', textTransform: 'capitalize' }}>{t.toLowerCase()} ({c})</button>;
        })}
      </div>
      {err && <div style={{ padding: '11px 14px', borderRadius: 12, border: '1px solid #FCA5A5', background: T.redSoft, color: '#991B1B', fontSize: 13, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}><AlertCircle size={16} /> {err}</div>}
      {rows === null ? <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color={T.gold} /></div>
        : list.length === 0 ? <div style={{ ...glass, borderRadius: 18, padding: 40, textAlign: 'center', color: T.muted }}>No {filter.toLowerCase()} items.</div>
          : (
            <div style={{ display: 'grid', gap: 12 }}>
              {list.map((r) => {
                const st = statusOf(r); const pending = norm(st) === norm(cfg.pending);
                return (
                  <div key={r.id} style={{ ...glass, borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labelOf(cfg.col, r)}</div>
                      <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>{subOf(cfg.col, r) || r.id}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <StatusPill status={st} />
                      {pending && (busyId === r.id
                        ? <Loader2 size={18} className="animate-spin" color={T.gold} />
                        : <>
                          <button onClick={() => setStatus(r, cfg.approve)} style={{ height: 38, padding: '0 15px', borderRadius: 9, border: 'none', cursor: 'pointer', background: T.emerald, color: '#fff', fontWeight: 700, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Check size={14} /> Approve</button>
                          <button onClick={() => setStatus(r, cfg.reject)} style={{ height: 38, padding: '0 15px', borderRadius: 9, border: `1px solid ${T.border}`, cursor: 'pointer', background: '#fff', color: T.red, fontWeight: 700, fontSize: 12.5 }}>Reject</button>
                        </>)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
    </div>
  );
}

function ManagementList({ cfg, onBack }: { cfg: ManageCfg; onBack: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [qstr, setQstr] = useState('');
  useEffect(() => {
    (async () => {
      setRows(null); setErr(null);
      try { const snap = await getDocs(collection(aDb, cfg.col)); setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))); }
      catch { setErr('Could not load ' + cfg.title + '.'); setRows([]); }
    })(); /* eslint-disable-next-line */
  }, [cfg.key]);
  const cell = (r: Row, field: string) => { const v = r[field]; if (v === true) return 'Yes'; if (v === false) return 'No'; return v == null ? '-' : String(v); };
  const list = (rows || []).filter((r) => !qstr || labelOf(cfg.col, r).toLowerCase().includes(qstr.toLowerCase()));
  return (
    <div>
      <PageHeader title={cfg.title} sub={cfg.sub} onBack={onBack} />
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 13, top: 13, color: T.muted }} />
        <input value={qstr} onChange={(e) => setQstr(e.target.value)} placeholder={'Search ' + cfg.title.toLowerCase()} style={{ height: 42, width: '100%', padding: '0 14px 0 38px', borderRadius: 12, border: `1px solid ${T.border}`, outline: 'none', fontSize: 14, background: '#fff', boxSizing: 'border-box', fontFamily: SANS }} />
      </div>
      {err && <div style={{ padding: '11px 14px', borderRadius: 12, border: '1px solid #FCA5A5', background: T.redSoft, color: '#991B1B', fontSize: 13, marginBottom: 14 }}>{err}</div>}
      {rows === null ? <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color={T.gold} /></div>
        : (
          <div style={{ ...glass, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `1.4fr ${cfg.cols.map(() => '1fr').join(' ')}`, gap: 0, padding: '12px 18px', background: T.cream, ...overline(T.goldText), fontSize: 10.5 }}>
              <div>Name</div>{cfg.cols.map((c) => <div key={c.label}>{c.label}</div>)}
            </div>
            {list.length === 0 ? <div style={{ padding: 32, textAlign: 'center', color: T.muted }}>No records found.</div>
              : list.slice(0, 100).map((r) => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: `1.4fr ${cfg.cols.map(() => '1fr').join(' ')}`, gap: 0, padding: '13px 18px', borderTop: `1px solid ${T.border}`, fontSize: 13.5, color: T.body, alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labelOf(cfg.col, r)}</div>
                  {cfg.cols.map((c) => <div key={c.label}>{c.field === 'status' ? <StatusPill status={cell(r, c.field)} /> : cell(r, c.field)}</div>)}
                </div>
              ))}
            <div style={{ padding: '10px 18px', borderTop: `1px solid ${T.border}`, fontSize: 12, color: T.muted }}>{list.length} record{list.length === 1 ? '' : 's'}{list.length > 100 ? ' (showing first 100)' : ''}</div>
          </div>
        )}
    </div>
  );
}

type AdminView = { t: 'home' } | { t: 'approval'; cfg: ApprovalCfg } | { t: 'manage'; cfg: ManageCfg };

export function AdminPortal({ onClose }: { onClose: () => void }) {
  useFonts();
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AdminView>({ t: 'home' });
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [bell, setBell] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(aAuth, async (u) => { if (u) { const ok = await gate(u); if (ok) setUser(u); } setBooting(false); });
    return () => unsub();
  }, []);
  useEffect(() => {
    if (!user) return;
    getDocs(collection(aDb, 'admin_notifications')).then((s) => setBell(s.docs.filter((d) => (d.data() as { isRead?: boolean }).isRead !== true).length)).catch(() => setBell(0));
  }, [user]);

  async function gate(u: User): Promise<boolean> {
    try {
      const snap = await getDoc(doc(aDb, 'admin_users', u.uid));
      if (!snap.exists() || (snap.data() as { active?: boolean }).active !== true) { await signOut(aAuth); setErr('Not authorized as admin. This account is not an active admin.'); return false; }
      return true;
    } catch { await signOut(aAuth).catch(() => {}); setErr('Could not verify admin access. Try again.'); return false; }
  }
  async function doLogin() {
    setErr(null);
    if (!email.trim() || pw.length < 6) { setErr('Enter a valid email and a 6+ character password.'); return; }
    setBusy(true);
    try { const cred = await signInWithEmailAndPassword(aAuth, email.trim(), pw); const ok = await gate(cred.user); if (ok) setUser(cred.user); }
    catch (e) { const code = (e as { code?: string }).code || ''; setErr(code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') ? 'Incorrect email or password.' : code.includes('too-many-requests') ? 'Too many attempts. Please wait and try again.' : 'Sign in failed. Please try again.'); }
    finally { setBusy(false); }
  }
  async function doLogout() { await signOut(aAuth).catch(() => {}); setUser(null); setView({ t: 'home' }); setEmail(''); setPw(''); }

  if (booting) return <Splash />;
  if (!user) return <LoginView email={email} pw={pw} showPw={showPw} busy={busy} err={err} setEmail={setEmail} setPw={setPw} setShowPw={setShowPw} onSubmit={doLogin} onClose={onClose} />;

  const pageBg = `radial-gradient(ellipse at 20% 0%, rgba(197,160,89,0.08), transparent 45%), radial-gradient(ellipse at 100% 100%, rgba(197,160,89,0.06), transparent 50%), ${T.bg}`;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 660, background: pageBg, overflowY: 'auto', fontFamily: SANS, color: T.body }}>
      {view.t === 'home' && <Home go={setView} bell={bell} onLogout={doLogout} onClose={onClose} />}
      {view.t !== 'home' && (
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '22px 24px 60px' }}>
          <Topbar onLogout={doLogout} onClose={onClose} bell={bell} />
          {view.t === 'approval' && <ApprovalQueue cfg={view.cfg} onBack={() => setView({ t: 'home' })} />}
          {view.t === 'manage' && <ManagementList cfg={view.cfg} onBack={() => setView({ t: 'home' })} />}
        </div>
      )}
    </div>
  );
}
