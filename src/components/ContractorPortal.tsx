// ContractorPortal.tsx
// Native in-site TI360 Contractor Portal, faithful to contractor-web:
// gold/cream theme (Cormorant Garamond + Inter), single-card email/password
// sign-in gated on a contractors/{doc}.status === 'APPROVED' (looked up by
// authUid), then a real dashboard (computed KPIs) + Projects / RFQs / My Bids /
// Milestones / Profile views reading the same Firestore as the platform.
// Isolated Firebase app instance so contractor sign-in never clobbers the
// customer's phone-auth session.
import { useEffect, useState, useRef, type CSSProperties, type ComponentType, type ChangeEvent } from 'react';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, getIdTokenResult, type User } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, doc, getDoc, updateDoc, serverTimestamp, orderBy, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  X, LogOut, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, LayoutGrid, FolderKanban, Camera,
  FileText, Gavel, ListChecks, IdCard, Star, Wallet, ClipboardCheck, MapPin, Images, Receipt, Upload, Play, Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Plus,
} from 'lucide-react';
import { firebaseApp } from '../lib/firebase';

const cApp = getApps().find((a) => a.name === 'contractor-portal') ?? initializeApp(firebaseApp.options, 'contractor-portal');
const cAuth = getAuth(cApp);
const cDb = getFirestore(cApp);
const cStorage = getStorage(cApp);

const T = {
  gold: '#C5A059', goldDeep: '#B08D3E', goldSoft: '#E4CF9A', goldText: '#8A6D27',
  ink: '#1A1A1A', body: '#52525B', muted: '#71717A',
  bg: '#FDFCFB', surface: '#FFFFFF', border: '#EDE7DC', cream: '#F6F1E8',
  emerald: '#047857', emeraldSoft: '#ECFDF5', red: '#B91C1C', redSoft: '#FEF2F2',
};
const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "Inter, ui-sans-serif, system-ui, sans-serif";
const HERO = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80';

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
interface ContractorDoc { status?: string; companyName?: string; name?: string; companyType?: string; contactName?: string; contactEmail?: string; contactPhone?: string; designation?: string; contractsExecuted?: string; officeAddress?: string; area?: string; city?: string; region?: string; performanceScore?: number; profileImageUrl?: string; userId?: string; authUid?: string; serviceCategories?: string[]; specializations?: string[]; equipmentAndMachinery?: string[]; }

const glass: CSSProperties = { background: 'rgba(255,255,255,0.92)', border: `1px solid ${T.border}`, boxShadow: '0 18px 48px -28px rgba(26,26,26,0.28)' };
const overline = (color = T.gold): CSSProperties => ({ fontSize: 11, fontWeight: 700, letterSpacing: 2.4, textTransform: 'uppercase', color });
const money = (n: number) => '\u20B9' + Math.round(n).toLocaleString('en-IN');
const g = (d: Row, k: string) => (d[k] == null ? '' : String(d[k]));

function GoldBtn({ children, onClick, disabled, full }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; full?: boolean }) {
  return <button onClick={onClick} disabled={disabled} style={{ height: 50, padding: '0 24px', width: full ? '100%' : undefined, borderRadius: 999, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#C5A059,#D7B673 50%,#C5A059)', color: '#1A1A1A', fontWeight: 700, fontSize: 14, opacity: disabled ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: '0 12px 26px -14px rgba(197,160,89,0.85)' }}>{children}</button>;
}
function StatusPill({ status }: { status: string }) {
  const s = (status || '').toUpperCase();
  const good = s === 'APPROVED' || s === 'COMPLETED' || s === 'DONE' || s === 'PAID' || s === 'RELEASED' || s === 'CLEARED';
  const bad = s === 'REJECTED' || s === 'CANCELLED';
  const bg = good ? T.emeraldSoft : bad ? T.redSoft : '#FDF8EC';
  const fg = good ? T.emerald : bad ? T.red : T.goldText;
  return <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 999, background: bg, color: fg }}>{s || 'PENDING'}</span>;
}
function Splash() { return <div style={{ position: 'fixed', inset: 0, zIndex: 660, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color={T.gold} /></div>; }

function LoginView(p: { email: string; pw: string; showPw: boolean; busy: boolean; err: string | null; setEmail: (v: string) => void; setPw: (v: string) => void; setShowPw: (v: boolean) => void; onSubmit: () => void; onClose: () => void }) {
  const [remember, setRemember] = useState(true);
  const lbl: CSSProperties = { fontSize: 12.5, fontWeight: 700, color: T.ink, marginBottom: 7, display: 'block' };
  const inp: CSSProperties = { height: 52, width: '100%', padding: '0 16px', borderRadius: 14, border: `1px solid ${T.border}`, outline: 'none', fontSize: 15, color: T.ink, background: '#fff', boxSizing: 'border-box', fontFamily: SANS };
  const pageBg = `radial-gradient(ellipse at 18% 0%, rgba(197,160,89,0.10), transparent 42%), radial-gradient(ellipse at 100% 100%, rgba(197,160,89,0.07), transparent 50%), ${T.bg}`;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 660, background: pageBg, overflowY: 'auto', fontFamily: SANS, color: T.ink }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '13px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ height: 40, width: 40, borderRadius: 12, background: 'linear-gradient(135deg,#C5A059,#D7B673)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1A1A', fontWeight: 800 }}>T</div>
          <div><span style={{ fontWeight: 800, fontSize: 18, color: T.ink }}>TI360</span> <span style={{ fontSize: 15, color: T.muted }}>Contractor Portal</span></div>
        </div>
        <button onClick={p.onClose} title="Close" style={{ height: 38, width: 38, borderRadius: 999, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
      </div>
      <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #C5A059, #E4CF9A, transparent)' }} />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '46px 24px 60px' }}>
        <div style={{ width: '100%', maxWidth: 470 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24 }}>
            <div style={{ height: 60, width: 60, borderRadius: 16, background: 'linear-gradient(135deg,#C5A059,#D7B673)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1A1A', fontWeight: 800, fontSize: 26 }}>T</div>
            <div style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, color: T.ink, marginTop: 14 }}>Welcome Back</div>
            <div style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>Sign in to your TI360 Contractor Portal</div>
          </div>
          <div style={{ ...glass, borderRadius: 22, padding: 30 }}>
            <label style={lbl}>Email Address</label>
            <input value={p.email} onChange={(e) => p.setEmail(e.target.value)} placeholder="your@email.com" autoComplete="username" style={inp} onKeyDown={(e) => { if (e.key === 'Enter') p.onSubmit(); }} />
            <div style={{ height: 18 }} />
            <label style={lbl}>Password</label>
            <div style={{ position: 'relative' }}>
              <input value={p.pw} onChange={(e) => p.setPw(e.target.value)} type={p.showPw ? 'text' : 'password'} placeholder="Enter your password" autoComplete="current-password" style={{ ...inp, paddingRight: 46 }} onKeyDown={(e) => { if (e.key === 'Enter') p.onSubmit(); }} />
              <button onClick={() => p.setShowPw(!p.showPw)} type="button" style={{ position: 'absolute', right: 8, top: 8, height: 36, width: 36, border: 'none', background: 'none', cursor: 'pointer', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.ink, cursor: 'pointer' }}><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: T.gold }} /> Remember Me</label>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.goldText }}>Forgot Password?</span>
            </div>
            {p.err && <div style={{ marginTop: 16, padding: '11px 14px', borderRadius: 14, border: '1px solid #FCA5A5', background: T.redSoft, color: '#991B1B', fontSize: 13, fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}><AlertCircle size={16} /> {p.err}</div>}
            <div style={{ marginTop: 18 }}><GoldBtn full disabled={p.busy} onClick={p.onSubmit}>{p.busy ? <Loader2 size={17} className="animate-spin" /> : 'SIGN IN'}</GoldBtn></div>
            <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 22, paddingTop: 18, textAlign: 'center', fontSize: 13, color: T.muted }}>New to TI360? <span style={{ color: T.goldText, fontWeight: 700 }}>Create Account</span></div>
          </div>
          <div style={{ ...overline(T.muted), fontSize: 10, marginTop: 20, textAlign: 'center' }}>Secure &amp; Encrypted</div>
        </div>
      </div>
    </div>
  );
}

type CView = 'home' | 'projects' | 'rfqs' | 'bids' | 'milestones' | 'billing' | 'portfolio' | 'profile';
type PortalData = { projects: Row[]; milestones: Row[]; billings: Row[]; rfqs: Row[]; bids: Row[]; portfolio: Row[] };
const NAV: { key: CView; label: string; icon: IconType }[] = [
  { key: 'home', label: 'Dashboard', icon: LayoutGrid },
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'rfqs', label: 'RFQs', icon: FileText },
  { key: 'bids', label: 'My Bids', icon: Gavel },
  { key: 'milestones', label: 'Milestones', icon: ListChecks },
  { key: 'billing', label: 'Billing', icon: Receipt },
  { key: 'portfolio', label: 'Portfolio', icon: Images },
  { key: 'profile', label: 'Profile', icon: IdCard },
];
const RELEASED = ['APPROVED', 'PAID', 'RELEASED', 'CLEARED'];
const WEEK_PENDING = ['PENDING_APPROVAL', 'IN_REVIEW', 'SUBMITTED'];

function Avatar({ contractor, size = 42 }: { contractor: ContractorDoc; size?: number }) {
  const url = contractor.profileImageUrl;
  const initial = (contractor.companyName || contractor.name || 'C').trim().charAt(0).toUpperCase();
  if (url) return <img src={url} alt="" style={{ height: size, width: size, borderRadius: 999, objectFit: 'cover', border: `2px solid ${T.gold}` }} />;
  return <div style={{ height: size, width: size, borderRadius: 999, background: 'linear-gradient(135deg,#C5A059,#D7B673)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1A1A', fontWeight: 800, fontSize: size * 0.4, border: `2px solid ${T.gold}` }}>{initial}</div>;
}
function Topbar({ contractor, onLogout, onClose }: { contractor: ContractorDoc; onLogout: () => void; onClose: () => void }) {
  const cid = contractor.userId || '';
  const region = contractor.area || contractor.region || '';
  return (
    <div style={{ ...glass, borderRadius: 18, padding: '13px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ height: 40, width: 40, borderRadius: 12, background: 'linear-gradient(135deg,#C5A059,#D7B673)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1A1A', fontWeight: 800 }}>T</div>
        <div>
          <div style={{ ...overline(T.gold), fontSize: 10 }}>TI360</div>
          <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, lineHeight: 1.1 }}>Contractor Portal</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {cid && <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 800, fontSize: 13.5, color: T.ink, letterSpacing: 0.3 }}>{cid}</div>{region && <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{region}</div>}</div>}
        <Avatar contractor={contractor} />
        <button onClick={onLogout} style={{ height: 40, padding: '0 16px', borderRadius: 999, border: `1px solid ${T.gold}55`, background: 'rgba(255,255,255,0.7)', color: T.ink, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}><LogOut size={15} /> Logout</button>
        <button onClick={onClose} title="Close" style={{ height: 40, width: 40, borderRadius: 999, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
      </div>
    </div>
  );
}

function NavBar({ view, setView }: { view: CView; setView: (v: CView) => void }) {
  return (
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', margin: '16px 0 22px' }}>
      {NAV.map((n) => {
        const on = view === n.key;
        return <button key={n.key} onClick={() => setView(n.key)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: 999, border: `1px solid ${on ? T.ink : T.border}`, background: on ? T.ink : '#fff', color: on ? '#fff' : T.body, fontWeight: 700, fontSize: 12, letterSpacing: 0.3, cursor: 'pointer' }}><n.icon size={14} /> {n.label}</button>;
      })}
    </div>
  );
}

function KpiTile({ label, value, icon: Icon, accent }: { label: string; value: string; icon: IconType; accent?: boolean }) {
  return (
    <div style={{ ...glass, borderRadius: 18, padding: '17px 18px', border: accent ? `2px solid ${T.gold}55` : `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: T.ink, lineHeight: 1 }}>{value}</div>
        <Icon size={19} color={T.gold} />
      </div>
      <div style={{ ...overline(T.muted), fontSize: 10, marginTop: 9 }}>{label}</div>
    </div>
  );
}

function Home({ contractor, data, setView }: { contractor: ContractorDoc; data: PortalData; setView: (v: CView) => void }) {
  const released = data.billings.filter((b) => RELEASED.includes(g(b, 'status').toUpperCase())).reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const pendingWeeks = data.milestones.reduce((n, m) => n + (((m.weekPlans as Row[]) || []).filter((w) => WEEK_PENDING.includes(String((w as Row).status || '').toUpperCase())).length), 0);
  const perf = contractor.performanceScore ?? 98;
  const kpis: { label: string; value: string; icon: IconType; accent?: boolean }[] = [
    { label: 'Total Projects', value: String(data.projects.length), icon: FolderKanban, accent: true },
    { label: 'Total Milestones', value: String(data.milestones.length), icon: ListChecks },
    { label: 'Released Amount', value: money(released), icon: Wallet },
    { label: 'Performance Score', value: String(perf), icon: Star },
    { label: 'Pending Approvals', value: String(pendingWeeks), icon: ClipboardCheck },
    { label: 'Invited RFQs', value: String(data.rfqs.length), icon: FileText },
  ];
  const quick: { label: string; v: CView; icon: IconType }[] = [
    { label: 'View RFQ Listings', v: 'rfqs', icon: FileText },
    { label: 'Submit / Track Bids', v: 'bids', icon: Gavel },
    { label: 'Project Milestones', v: 'milestones', icon: ListChecks },
    { label: 'My Projects', v: 'projects', icon: FolderKanban },
  ];
  const projects = [...data.projects].sort((a, b) => (Number(b.progress) || 0) - (Number(a.progress) || 0)).slice(0, 2);
  const name = contractor.companyName || contractor.name || 'Contractor';
  return (
    <div>
      <div style={{ ...glass, borderRadius: 26, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.4fr 1fr', marginBottom: 20 }}>
        <div style={{ padding: '34px 36px' }}>
          <div style={overline(T.gold)}>Welcome</div>
          <div style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1.05, color: T.ink, marginTop: 6 }}>Welcome, <span style={{ fontStyle: 'italic', color: T.gold }}>{name}</span>!</div>
          <p style={{ marginTop: 12, fontSize: 14.5, lineHeight: 1.65, color: T.body, maxWidth: 480 }}>Here is your project overview and latest activity.</p>
        </div>
        <div style={{ backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.85), rgba(255,255,255,0.1) 55%, rgba(26,26,26,0.05)), url(${HERO})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 26 }}>
        {kpis.map((k) => <KpiTile key={k.label} {...k} />)}
      </div>
      <div style={{ ...overline(T.gold), marginBottom: 12 }}>Pending Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 26 }}>
        {[
          { n: pendingWeeks, label: 'Pending Approval Weeks', v: 'milestones' as CView },
          { n: data.rfqs.length, label: 'Invited RFQs', v: 'rfqs' as CView },
          { n: data.bids.length, label: 'My Bids & Responses', v: 'bids' as CView },
        ].map((a) => (
          <button key={a.label} onClick={() => setView(a.v)} style={{ ...glass, borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: T.gold, lineHeight: 1, minWidth: 26 }}>{a.n}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>{a.label}</div>
            <ArrowRight size={16} style={{ marginLeft: 'auto', color: T.muted }} />
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, alignItems: 'start' }}>
        <div>
          <div style={{ ...overline(T.gold), marginBottom: 12 }}>Current Projects</div>
          {projects.length === 0 ? <div style={{ ...glass, borderRadius: 16, padding: 28, color: T.muted, textAlign: 'center' }}>No projects yet.</div>
            : <div style={{ display: 'grid', gap: 12 }}>{projects.map((pr) => {
              const prog = Number(pr.progressPercent ?? pr.progress) || 0;
              return (
                <div key={pr.id} style={{ ...glass, borderRadius: 16, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>{g(pr, 'title') || g(pr, 'rfqCode') || pr.id}</div>
                    <StatusPill status={g(pr, 'status')} />
                  </div>
                  {g(pr, 'rfqCode') && <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{g(pr, 'rfqCode')}</div>}
                  <div style={{ height: 8, borderRadius: 999, background: T.cream, marginTop: 12, overflow: 'hidden' }}><div style={{ height: '100%', width: prog + '%', background: 'linear-gradient(90deg,#C5A059,#D7B673)' }} /></div>
                  <div style={{ fontSize: 11.5, color: T.muted, marginTop: 6 }}>{prog}% complete</div>
                </div>
              );
            })}</div>}
        </div>
        <div>
          <div style={{ ...overline(T.gold), marginBottom: 12 }}>Quick Actions</div>
          <div style={{ ...glass, borderRadius: 16, padding: 10, display: 'grid', gap: 4 }}>
            {quick.map((q) => <button key={q.label} onClick={() => setView(q.v)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px', borderRadius: 11, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', color: T.ink, fontWeight: 600, fontSize: 13.5 }}><q.icon size={16} color={T.gold} /> {q.label}<ArrowRight size={14} style={{ marginLeft: 'auto', color: T.muted }} /></button>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function fmtDate(v: unknown): string {
  if (!v) return '-';
  let d: Date | null = null;
  if (typeof v === 'object' && v && 'seconds' in (v as Record<string, unknown>)) d = new Date(Number((v as { seconds: number }).seconds) * 1000);
  else if (typeof v === 'number') d = new Date(v);
  else if (typeof v === 'string') { const t = Date.parse(v); if (!isNaN(t)) d = new Date(t); else return v; }
  if (!d || isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function Empty({ label }: { label: string }) { return <div style={{ ...glass, borderRadius: 16, padding: 36, textAlign: 'center', color: T.muted }}>{label}</div>; }
function Head({ over, title }: { over: string; title: string }) { return <div style={{ marginBottom: 14 }}><div style={overline(T.gold)}>{over}</div><div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, color: T.ink, marginTop: 2 }}>{title}</div></div>; }

function ProjectsView({ data }: { data: PortalData }) {
  return (<div><Head over="Workspace" title="My Projects" />
    {!data.projects.length ? <Empty label="No projects assigned yet." /> : <div style={{ display: 'grid', gap: 12 }}>{data.projects.map((pr) => {
      const prog = Number(pr.progressPercent ?? pr.progress) || 0;
      return (<div key={pr.id} style={{ ...glass, borderRadius: 16, padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><div style={{ fontWeight: 700, fontSize: 15.5, color: T.ink }}>{g(pr, 'title') || pr.id}</div><StatusPill status={g(pr, 'status')} /></div>
        <div style={{ display: 'flex', gap: 16, marginTop: 5, fontSize: 12.5, color: T.muted, flexWrap: 'wrap' }}>{(g(pr, 'rfqCode') || g(pr, 'sourceRfqId') || g(pr, 'rfqId')) && <span>{g(pr, 'rfqCode') || g(pr, 'sourceRfqId') || g(pr, 'rfqId')}</span>}{(g(pr, 'location') || g(pr, 'area')) && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {g(pr, 'location') || g(pr, 'area')}</span>}{g(pr, 'constructionType') && <span>{g(pr, 'constructionType')}</span>}</div>
        <div style={{ height: 8, borderRadius: 999, background: T.cream, marginTop: 12, overflow: 'hidden' }}><div style={{ height: '100%', width: prog + '%', background: 'linear-gradient(90deg,#C5A059,#D7B673)' }} /></div>
        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 6 }}>{prog}% complete</div>
      </div>);
    })}</div>}
  </div>);
}
function RfqsView({ data }: { data: PortalData }) {
  return (<div><Head over="Opportunities" title="Invited RFQs" />
    {!data.rfqs.length ? <Empty label="No RFQ invitations yet." /> : <div style={{ display: 'grid', gap: 12 }}>{data.rfqs.map((r) => (
      <div key={r.id} style={{ ...glass, borderRadius: 16, padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><div style={{ fontWeight: 700, fontSize: 15.5, color: T.ink }}>{g(r, 'title') || g(r, 'serviceTitle') || g(r, 'rfqId') || r.id}</div><StatusPill status={g(r, 'status') || 'OPEN'} /></div>
        {g(r, 'description') && <div style={{ fontSize: 13, color: T.body, marginTop: 5, lineHeight: 1.5, maxWidth: 720 }}>{g(r, 'description').slice(0, 160)}</div>}
        <div style={{ display: 'flex', gap: 18, marginTop: 10, fontSize: 12.5, color: T.muted, flexWrap: 'wrap' }}>{g(r, 'location') && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {g(r, 'location')}</span>}{r.estimatedBudget != null && <span>Budget: {money(Number(r.estimatedBudget) || 0)}</span>}{r.totalSqft != null && <span>{String(r.totalSqft)} sqft</span>}{r.dueDate != null && <span>Due: {fmtDate(r.dueDate)}</span>}</div>
      </div>
    ))}</div>}
  </div>);
}
function BidsView({ data }: { data: PortalData }) {
  return (<div><Head over="Submissions" title="My Bids & Responses" />
    {!data.bids.length ? <Empty label="No bids submitted yet." /> : <div style={{ display: 'grid', gap: 12 }}>{data.bids.map((b) => (
      <div key={b.id} style={{ ...glass, borderRadius: 16, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div><div style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>{g(b, 'rfqCode') || g(b, 'rfqId') || g(b, 'title') || b.id}</div><div style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>Quoted: {money(Number(b.lumpSumAmount ?? b.finalQuotedAmount ?? b.quotedAmount ?? b.amount) || 0)}</div></div>
        <StatusPill status={g(b, 'status')} />
      </div>
    ))}</div>}
  </div>);
}
function MilestonesView({ docId }: { docId: string }) {
  const [projects, setProjects] = useState<Row[]>([]);
  const [mils, setMils] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [selP, setSelP] = useState('');
  const [selM, setSelM] = useState('');
  const [openWk, setOpenWk] = useState(0);
  const [proofUrl, setProofUrl] = useState(''); const [itemsTxt, setItemsTxt] = useState(''); const [remarks, setRemarks] = useState(''); const [wfiles, setWfiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const LOCK = ['SUBMITTED', 'PENDING_APPROVAL', 'PROCESSING', 'PAID', 'CLEARED'];
  const mapDocs = (s: { docs: { id: string; data: () => Record<string, unknown> }[] }) => s.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
  async function reload() {
    if (!docId) { setLoading(false); return; }
    setLoading(true);
    try { const [ps, ms] = await Promise.all([getDocs(query(collection(cDb, 'projects'), where('contractorId', '==', docId))), getDocs(query(collection(cDb, 'milestones'), where('contractorId', '==', docId)))]); const pl = mapDocs(ps), ml = mapDocs(ms); setProjects(pl); setMils(ml); setSelP((c) => c || (pl[0] ? String(pl[0].id) : '')); } catch { /* ignore */ } finally { setLoading(false); }
  }
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [docId]);
  const proj = projects.find((p) => String(p.id) === selP);
  const projMils = mils.filter((m) => proj && (String(m.projectId) === String(proj.id) || String(m.projectId) === String(proj.projectId) || String(m.projectId) === String(proj.projectCode)));
  useEffect(() => { setSelM((c) => (projMils.find((m) => String(m.id) === c) ? c : (projMils[0] ? String(projMils[0].id) : ''))); /* eslint-disable-next-line */ }, [selP, mils]);
  const mil = projMils.find((m) => String(m.id) === selM);
  const weeks = (mil?.weekPlans as Row[]) || [];
  function openWeek(i: number) { setOpenWk(i); const w = (weeks[i] || {}) as Row; setProofUrl(String(w.proofUrl || '')); setItemsTxt(((w.completedItems as string[]) || []).join(', ')); setRemarks(String(w.remarks || '')); setWfiles([]); setMsg(null); }
  async function submitWeek(i: number) {
    if (!mil) return; const w = (weeks[i] || {}) as Row;
    if (!proofUrl.trim() && !wfiles.length && !((w.proofImageUrls as string[]) || []).length) { setMsg('Add a proof link or upload proof images.'); return; }
    if (!itemsTxt.trim()) { setMsg('Enter completed work items.'); return; }
    setBusy(true); setMsg(null);
    try {
      const urls: string[] = [...((w.proofImageUrls as string[]) || [])];
      for (const f of wfiles) { const sref = ref(cStorage, `milestones/${mil.id}/weeks/week-${w.weekNumber}/proof-images/${Date.now()}-${f.name}`); await uploadBytes(sref, f); urls.push(await getDownloadURL(sref)); }
      const nextWeeks = weeks.map((x, idx) => idx === i ? { ...x, status: 'PENDING_APPROVAL', proofUrl: proofUrl.trim(), remarks: remarks.trim(), completedItems: itemsTxt.split(',').map((s) => s.trim()).filter(Boolean), proofImageUrls: urls } : x);
      await updateDoc(doc(cDb, 'milestones', String(mil.id)), { weekPlans: nextWeeks, updatedAt: serverTimestamp(), submittedForApprovalAt: serverTimestamp() });
      setMsg('Week submitted for approval.'); await reload();
    } catch { setMsg('Submit failed. Please try again.'); } finally { setBusy(false); }
  }
  const inp: CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 12, border: `1px solid ${T.border}`, outline: 'none', fontSize: 13.5, color: T.ink, background: '#fff', boxSizing: 'border-box', fontFamily: SANS };
  const prog = (m: Row) => { const ws = (m.weekPlans as Row[]) || []; const ap = ws.filter((w) => String((w as Row).status || '').toUpperCase() === 'APPROVED').length; return ws.length ? Math.round((ap / ws.length) * 100) : 0; };
  return (<div><Head over="Delivery" title="Milestones" />
    <div style={{ fontSize: 13.5, color: T.muted, marginTop: -8, marginBottom: 16 }}>View admin-defined project milestones and execute week-wise work.</div>
    {loading ? <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin" color={T.gold} /></div>
      : !projects.length ? <Empty label="No projects assigned yet." />
        : <>
          <div style={{ ...glass, borderRadius: 16, padding: 14, display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12, marginBottom: 16 }}>
            <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Select project</label>
              <select value={selP} onChange={(e) => setSelP(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>{projects.map((p) => <option key={String(p.id)} value={String(p.id)}>{g(p, 'projectId') || p.id} - {g(p, 'title') || g(p, 'projectName') || 'Project'}</option>)}</select></div>
            <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Progress</label><div style={{ ...inp, fontWeight: 800, color: T.goldText }}>{proj ? prog(proj) : 0}%</div></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
            <div style={{ ...glass, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: T.ink }}>Milestones</div>
              <div style={{ padding: 10, display: 'grid', gap: 8 }}>
                {projMils.length === 0 ? <div style={{ padding: 20, textAlign: 'center', color: T.muted, fontSize: 13 }}>No milestones for this project.</div>
                  : projMils.map((m, i) => { const on = String(m.id) === selM; const ws = (m.weekPlans as Row[]) || []; return (
                    <button key={String(m.id)} onClick={() => { setSelM(String(m.id)); setOpenWk(0); }} style={{ textAlign: 'left', padding: '12px 13px', borderRadius: 12, border: `1px solid ${on ? T.gold : T.border}`, background: on ? `${T.gold}14` : '#fff', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}><div style={{ fontWeight: 700, fontSize: 13.5, color: T.ink }}>M{g(m, 'milestoneNumber') || i + 1} - {g(m, 'title') || 'Milestone'}</div><StatusPill status={g(m, 'status')} /></div>
                      <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3 }}>{ws.length} week(s)</div>
                    </button>); })}
              </div>
            </div>
            <div style={{ ...glass, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: `1px solid ${T.border}` }}><div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: T.ink }}>Milestone Detail</div>{mil && <span style={{ fontWeight: 800, color: T.goldText }}>{money(Number(mil.amount) || 0)}</span>}</div>
              <div style={{ padding: 16 }}>
                {!mil ? <Empty label="Select a milestone to view its week plan." /> : <>
                  <div style={{ background: T.cream, borderRadius: 12, padding: 14, fontSize: 13, color: T.body, marginBottom: 14 }}>
                    <div><b style={{ color: T.ink }}>Project:</b> {g(proj as Row, 'title') || g(proj as Row, 'projectName') || '-'}</div>
                    {g(mil, 'description') && <div style={{ marginTop: 4 }}><b style={{ color: T.ink }}>Description:</b> {g(mil, 'description')}</div>}
                    {g(mil, 'dueDate') && <div style={{ marginTop: 4 }}><b style={{ color: T.ink }}>Due Date:</b> {fmtDate(mil.dueDate)}</div>}
                  </div>
                  {msg && <div style={{ fontSize: 12.5, color: msg.includes('submitted') ? T.emerald : T.red, marginBottom: 10 }}>{msg}</div>}
                  <div style={{ display: 'grid', gap: 10 }}>
                    {weeks.length === 0 ? <Empty label="No week plan for this milestone." /> : weeks.map((w0, i) => {
                      const w = w0 as Row; const open = openWk === i; const st = String(w.status || 'PENDING').toUpperCase(); const locked = LOCK.includes(st);
                      return (<div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
                        <button onClick={() => (open ? setOpenWk(-1) : openWeek(i))} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '13px 15px', background: open ? T.cream : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                          <div><div style={{ fontWeight: 700, fontSize: 13.5, color: T.ink }}>Week {String(w.weekNumber || i + 1)}</div><div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{w.startDate ? `${w.startDate} - ${w.endDate || ''}` : ''}{w.invoiceCode ? `  .  ${w.invoiceCode}` : ''}</div></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><StatusPill status={st} /><span style={{ fontWeight: 800, color: T.goldText, fontSize: 13 }}>{money(Number(w.amount) || 0)}</span>{open ? <ChevronUp size={16} color={T.muted} /> : <ChevronDown size={16} color={T.muted} />}</div>
                        </button>
                        {open && <div style={{ borderTop: `1px solid ${T.border}`, padding: 15, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                          <div style={{ background: T.cream, borderRadius: 10, padding: 13, fontSize: 12.5, color: T.body }}>
                            <div><b style={{ color: T.ink }}>Completed Work:</b> {((w.completedItems as string[]) || []).join(', ') || '-'}</div>
                            <div style={{ marginTop: 5 }}><b style={{ color: T.ink }}>Proof Link:</b> {w.proofUrl ? <a href={String(w.proofUrl)} target="_blank" rel="noreferrer" style={{ color: T.goldText }}>open</a> : '-'}</div>
                            <div style={{ marginTop: 5 }}><b style={{ color: T.ink }}>Bill Status:</b> {String(w.billStatus || 'Not Raised')}</div>
                            {((w.proofImageUrls as string[]) || []).length > 0 && <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>{((w.proofImageUrls as string[]) || []).map((u, k) => <a key={k} href={u} target="_blank" rel="noreferrer" style={{ display: 'block', width: 54, height: 54, borderRadius: 8, backgroundImage: `url(${u})`, backgroundSize: 'cover', backgroundPosition: 'center', border: `1px solid ${T.border}` }} />)}</div>}
                          </div>
                          <div>
                            <input value={proofUrl} disabled={locked} onChange={(e) => setProofUrl(e.target.value)} placeholder="Proof URL / document link" style={{ ...inp, opacity: locked ? 0.5 : 1, marginBottom: 8 }} />
                            <textarea value={itemsTxt} disabled={locked} onChange={(e) => setItemsTxt(e.target.value)} rows={2} placeholder="Completed work items (comma separated)" style={{ ...inp, opacity: locked ? 0.5 : 1, marginBottom: 8, resize: 'vertical' }} />
                            <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => setWfiles(Array.from(e.target.files ?? []))} style={{ display: 'none' }} />
                            <button onClick={() => fileRef.current?.click()} disabled={locked} style={{ height: 38, padding: '0 14px', borderRadius: 9, border: `1px solid ${T.border}`, background: '#fff', color: T.ink, fontWeight: 700, fontSize: 12.5, cursor: locked ? 'default' : 'pointer', marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Upload size={13} /> {wfiles.length ? `${wfiles.length} file(s)` : 'Upload proof images'}</button>
                            <textarea value={remarks} disabled={locked} onChange={(e) => setRemarks(e.target.value)} rows={2} placeholder="Remarks" style={{ ...inp, opacity: locked ? 0.5 : 1, marginBottom: 10, resize: 'vertical' }} />
                            <GoldBtn full disabled={locked || busy} onClick={() => submitWeek(i)}>{busy ? <Loader2 size={15} className="animate-spin" /> : locked ? 'Submitted / Locked' : 'Submit Week for Approval'}</GoldBtn>
                          </div>
                        </div>}
                      </div>); })}
                  </div>
                </>}
              </div>
            </div>
          </div>
        </>}
  </div>);
}
function ProfileView({ contractor, docId, onPhoto }: { contractor: ContractorDoc; docId: string; onPhoto: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [perr, setPerr] = useState<string | null>(null);
  async function pickPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!docId) { setPerr('Could not resolve your account - reopen the portal.'); return; }
    if (!file.type.startsWith('image/')) { setPerr('Please choose an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setPerr('Image must be under 5MB.'); return; }
    setUploading(true); setPerr(null);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const sref = ref(cStorage, `contractor-profile-images/${docId}/profile.${ext}`);
      await uploadBytes(sref, file);
      const url = await getDownloadURL(sref);
      await updateDoc(doc(cDb, 'contractors', docId), { profileImageUrl: url, updatedAt: serverTimestamp() });
      onPhoto(url);
    } catch { setPerr('Upload failed. Please try again.'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }
  const company: [string, string][] = [
    ['Company Name', contractor.companyName || '-'],
    ['Contractor ID', contractor.userId || '-'],
    ['Contractor Type', contractor.companyType || '-'],
    ['No. of Contracts Executed', contractor.contractsExecuted || '-'],
    ['Office Address', contractor.officeAddress || '-'],
    ['Area', contractor.area || '-'],
    ['Work Locations', contractor.region || '-'],
  ];
  const contact: [string, string][] = [
    ['Contact Person', contractor.contactName || '-'],
    ['Email', contractor.contactEmail || '-'],
    ['Phone Number', contractor.contactPhone || '-'],
    ['Designation', contractor.designation || '-'],
  ];
  const chipGroups: [string, string[]][] = [
    ['Primary Services', contractor.serviceCategories || []],
    ['Specializations', contractor.specializations || []],
    ['Equipment & Machinery', contractor.equipmentAndMachinery || []],
  ];
  const InfoCard = ({ title, rows }: { title: string; rows: [string, string][] }) => (
    <div style={{ ...glass, borderRadius: 18, overflow: 'hidden', maxWidth: 760, marginBottom: 14 }}>
      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: T.ink, padding: '16px 20px 4px' }}>{title}</div>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', padding: '12px 20px', borderTop: `1px solid ${T.border}`, fontSize: 14 }}>
          <div style={{ fontWeight: 700, color: T.ink }}>{k}</div>
          <div style={{ color: T.body }}>{v}</div>
        </div>
      ))}
    </div>
  );
  return (<div><Head over="Account" title="Contractor Profile" />
    <div style={{ ...glass, borderRadius: 18, padding: 22, maxWidth: 760, display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14 }}>
      <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
        <Avatar contractor={contractor} size={96} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} title="Change photo" style={{ position: 'absolute', right: 0, bottom: 0, height: 30, width: 30, borderRadius: 999, border: '2px solid #fff', background: T.gold, color: '#1A1A1A', cursor: uploading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}</button>
        <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: T.ink }}>{contractor.companyName || contractor.name || 'Contractor'}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.goldText, marginTop: 2 }}>{contractor.userId || ''}</div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{contractor.area || contractor.region || ''}</div>
        <div style={{ marginTop: 8 }}><StatusPill status={(contractor.status || 'PENDING').toUpperCase()} /></div>
        {perr ? <div style={{ fontSize: 11.5, color: T.red, marginTop: 6 }}>{perr}</div> : <div style={{ fontSize: 11.5, color: T.muted, marginTop: 6 }}>Tap the camera to change your photo</div>}
      </div>
    </div>
    <InfoCard title="Company Information" rows={company} />
    <InfoCard title="Contact Information" rows={contact} />
    <div style={{ ...glass, borderRadius: 18, padding: '16px 20px 20px', maxWidth: 760 }}>
      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Services &amp; Specializations</div>
      {chipGroups.map(([label, items]) => (
        <div key={label} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 7 }}>{label}</div>
          {items.length === 0 ? <div style={{ fontSize: 13, color: T.muted }}>-</div> : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{items.map((it) => (
              <span key={it} style={{ borderRadius: 999, border: `1px solid ${T.gold}55`, background: `${T.gold}1A`, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: T.goldText }}>{it}</span>
            ))}</div>
          )}
        </div>
      ))}
    </div>
  </div>);
}

function BillingView({ docId }: { docId: string }) {
  const [loading, setLoading] = useState(true);
  const [mils, setMils] = useState<Row[]>([]);
  const [bills, setBills] = useState<Row[]>([]);
  const [banks, setBanks] = useState<Row[]>([]);
  const [showAddBank, setShowAddBank] = useState(false);
  const [bf, setBf] = useState({ holder: '', bank: '', ifsc: '', acct: '', confirm: '' });
  const [selWeek, setSelWeek] = useState('');
  const [invNo, setInvNo] = useState(''); const [invAmt, setInvAmt] = useState(''); const [invRemarks, setInvRemarks] = useState(''); const [invFile, setInvFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const mapDocs = (s: { docs: { id: string; data: () => Record<string, unknown> }[] }) => s.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
  async function reload() {
    if (!docId) { setLoading(false); return; }
    setLoading(true);
    try { const [ms, bs, ba] = await Promise.all([getDocs(query(collection(cDb, 'milestones'), where('contractorId', '==', docId))), getDocs(query(collection(cDb, 'billings'), where('contractorId', '==', docId))), getDocs(query(collection(cDb, 'contractor_bank_accounts'), where('contractorId', '==', docId)))]); setMils(mapDocs(ms)); setBills(mapDocs(bs)); setBanks(mapDocs(ba)); } catch { /* ignore */ } finally { setLoading(false); }
  }
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [docId]);
  const billable: { key: string; milId: string; m: Row; w: Row; wi: number }[] = [];
  mils.forEach((m) => { if (m.billEnabled) ((m.weekPlans as Row[]) || []).forEach((w, wi) => { const ww = w as Row; if (String(ww.status || '').toUpperCase() === 'APPROVED' && !ww.billRaised) billable.push({ key: `${m.id}-${wi}`, milId: String(m.id), m, w: ww, wi }); }); });
  const defBank = banks.find((b) => b.isDefault) || banks[0];
  const sel = billable.find((x) => x.key === selWeek);
  useEffect(() => { if (sel) { setInvNo(String(sel.w.invoiceCode || '')); setInvAmt(String(sel.w.amount || '')); } /* eslint-disable-next-line */ }, [selWeek]);
  const mask = (a: string) => (a.length > 4 ? '****' + a.slice(-4) : a);
  const norm = (s: Row) => String(s.status || '').toUpperCase();
  const cSub = bills.filter((b) => ['SUBMITTED', 'IN_REVIEW', 'PENDING', 'PROCESSING'].includes(norm(b)));
  const cApp = bills.filter((b) => norm(b) === 'APPROVED');
  const cClr = bills.filter((b) => ['PAID', 'RELEASED', 'CLEARED'].includes(norm(b)));
  const cRej = bills.filter((b) => norm(b) === 'REJECTED');
  async function addBank() {
    if (!bf.holder.trim() || !bf.bank.trim() || !bf.ifsc.trim() || !bf.acct.trim()) { setMsg('Fill all bank fields.'); return; }
    if (bf.acct !== bf.confirm) { setMsg('Account numbers do not match.'); return; }
    if (banks.length >= 3) { setMsg('Maximum 3 bank accounts.'); return; }
    setBusy(true); setMsg(null);
    try { await addDoc(collection(cDb, 'contractor_bank_accounts'), { contractorId: docId, accountHolderName: bf.holder.trim(), bankName: bf.bank.trim(), ifscCode: bf.ifsc.trim().toUpperCase(), accountNumber: bf.acct.trim(), accountNumberMasked: mask(bf.acct.trim()), isDefault: banks.length === 0, defaultChangedAt: banks.length === 0 ? new Date().toISOString() : '', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); setBf({ holder: '', bank: '', ifsc: '', acct: '', confirm: '' }); setShowAddBank(false); setMsg('Bank account added.'); await reload(); } catch { setMsg('Could not save bank account.'); } finally { setBusy(false); }
  }
  async function makeDefault(id: string) {
    setBusy(true); setMsg(null);
    try { for (const b of banks) { await updateDoc(doc(cDb, 'contractor_bank_accounts', String(b.id)), { isDefault: String(b.id) === id, ...(String(b.id) === id ? { defaultChangedAt: new Date().toISOString() } : {}), updatedAt: serverTimestamp() }); } await reload(); } catch { /* ignore */ } finally { setBusy(false); }
  }
  async function raiseBill() {
    if (!sel) { setMsg('Select an approved week to bill.'); return; }
    if (!invNo.trim() || !(Number(invAmt) > 0)) { setMsg('Enter a valid invoice number and amount.'); return; }
    if (!defBank) { setMsg('Add a bank account first.'); return; }
    setBusy(true); setMsg(null);
    try {
      let fileUrl = ''; let fileName = '';
      if (invFile) { const sref = ref(cStorage, `billings/${docId}/${sel.milId}/week-${sel.w.weekNumber}/${Date.now()}-${invFile.name}`); await uploadBytes(sref, invFile); fileUrl = await getDownloadURL(sref); fileName = invFile.name; }
      await addDoc(collection(cDb, 'billings'), { contractorId: docId, projectId: sel.m.projectId || '', projectTitle: sel.m.projectTitle || '', milestoneId: sel.milId, milestoneTitle: sel.m.title || '', milestoneNumber: sel.m.milestoneNumber || '', weekNumber: sel.w.weekNumber || '', amount: Number(invAmt), invoiceNumber: invNo.trim(), invoiceFileUrl: fileUrl, invoiceFileName: fileName, remarks: invRemarks.trim(), status: 'SUBMITTED', submittedAtLabel: new Date().toLocaleDateString('en-IN'), approvedAtLabel: '', clearedAtLabel: '', bankAccountLabel: defBank ? `${defBank.bankName} ${defBank.accountNumberMasked || ''}` : '', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const m = mils.find((x) => String(x.id) === sel.milId); if (m) { const nw = ((m.weekPlans as Row[]) || []).map((w, idx) => (idx === sel.wi ? { ...w, billRaised: true, billStatus: 'SUBMITTED' } : w)); await updateDoc(doc(cDb, 'milestones', sel.milId), { weekPlans: nw, updatedAt: serverTimestamp() }); }
      setInvNo(''); setInvAmt(''); setInvRemarks(''); setInvFile(null); setSelWeek(''); setMsg('Bill submitted.'); await reload();
    } catch { setMsg('Could not submit bill.'); } finally { setBusy(false); }
  }
  const inp: CSSProperties = { width: '100%', padding: '10px 13px', borderRadius: 11, border: `1px solid ${T.border}`, outline: 'none', fontSize: 13.5, color: T.ink, background: '#fff', boxSizing: 'border-box', fontFamily: SANS };
  const stat = (n: number, l: string, accent?: boolean) => (<div style={{ ...glass, borderRadius: 16, padding: '14px 16px', border: accent ? `2px solid ${T.gold}55` : `1px solid ${T.border}` }}><div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: T.ink }}>{n}</div><div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: T.muted, marginTop: 4 }}>{l}</div></div>);
  const Table = ({ title, rows }: { title: string; rows: Row[] }) => (
    <div style={{ ...glass, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${T.border}` }}><div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: T.ink }}>{title}</div><div style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>{rows.length}</div></div>
      {rows.length === 0 ? <div style={{ padding: 18, textAlign: 'center', color: T.muted, fontSize: 12.5 }}>No records found.</div>
        : rows.map((b) => (<div key={String(b.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '11px 16px', borderTop: `1px solid ${T.border}` }}>
          <div style={{ minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 13.5, color: T.ink }}>{g(b, 'invoiceNumber') || g(b, 'milestoneTitle') || String(b.id)}</div><div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{g(b, 'projectTitle')}{b.weekNumber != null ? `  .  W${b.weekNumber}` : ''}</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}><span style={{ fontWeight: 800, color: T.goldText, fontSize: 13 }}>{money(Number(b.amount) || 0)}</span><StatusPill status={g(b, 'status')} /></div>
        </div>))}
    </div>
  );
  return (<div><Head over="Finance" title="Billing" />
    <div style={{ fontSize: 13.5, color: T.muted, marginTop: -8, marginBottom: 16 }}>Manage bank accounts and raise week-wise approved bills.</div>
    {loading ? <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin" color={T.gold} /></div> : <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>{stat(billable.length, 'Available Bills', true)}{stat(cSub.length, 'Submitted')}{stat(cApp.length, 'Approved')}{stat(cClr.length, 'Cleared')}</div>
      {msg && <div style={{ fontSize: 12.5, color: msg.includes('added') || msg.includes('submitted') ? T.emerald : T.red, marginBottom: 12 }}>{msg}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ ...glass, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${T.border}` }}><div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: T.ink }}>Bank Accounts</div><button onClick={() => setShowAddBank((v) => !v)} style={{ height: 34, padding: '0 13px', borderRadius: 999, border: 'none', background: T.gold, color: '#1A1A1A', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> {showAddBank ? 'Close' : 'Add Bank Account'}</button></div>
            <div style={{ padding: 14 }}>
              {showAddBank && <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: 13, marginBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}><input value={bf.holder} onChange={(e) => setBf({ ...bf, holder: e.target.value })} placeholder="Account Holder Name" style={inp} /><input value={bf.bank} onChange={(e) => setBf({ ...bf, bank: e.target.value })} placeholder="Bank Name" style={inp} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}><input value={bf.ifsc} onChange={(e) => setBf({ ...bf, ifsc: e.target.value.toUpperCase() })} placeholder="IFSC Code" style={inp} /><input value={bf.acct} onChange={(e) => setBf({ ...bf, acct: e.target.value })} placeholder="Account Number" style={inp} /><input value={bf.confirm} onChange={(e) => setBf({ ...bf, confirm: e.target.value })} placeholder="Confirm Account" style={inp} /></div>
                <GoldBtn disabled={busy || banks.length >= 3} onClick={addBank}>{busy ? <Loader2 size={15} className="animate-spin" /> : 'Save Bank Account'}</GoldBtn> <span style={{ fontSize: 11.5, color: T.muted, marginLeft: 8 }}>{banks.length}/3 added</span>
              </div>}
              {banks.length === 0 ? <div style={{ padding: 16, textAlign: 'center', color: T.muted, border: `1px dashed ${T.border}`, borderRadius: 12, fontSize: 13 }}>No bank accounts added yet.</div>
                : banks.map((b) => (<div key={String(b.id)} style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div><div style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>{g(b, 'bankName')}</div><div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{g(b, 'accountHolderName')}  .  {g(b, 'accountNumberMasked') || mask(g(b, 'accountNumber'))}  .  {g(b, 'ifscCode')}</div></div>
                  {b.isDefault ? <span style={{ fontSize: 10.5, fontWeight: 800, padding: '4px 10px', borderRadius: 999, background: T.emeraldSoft, color: T.emerald }}>DEFAULT</span> : <button onClick={() => makeDefault(String(b.id))} disabled={busy} style={{ height: 32, padding: '0 12px', borderRadius: 999, border: `1px solid ${T.gold}55`, background: '#fff', color: T.goldText, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Make Default</button>}
                </div>))}
            </div>
          </div>
          <div style={{ ...glass, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: T.ink }}>Raise Bill</div>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>Default payout: <b style={{ color: T.ink }}>{defBank ? `${g(defBank, 'bankName')} ${g(defBank, 'accountNumberMasked') || ''}` : 'none - add a bank account'}</b></div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: T.ink, margin: '8px 0 5px' }}>Select Bill (approved weeks)</label>
              <select value={selWeek} onChange={(e) => setSelWeek(e.target.value)} style={{ ...inp, cursor: 'pointer', marginBottom: 10 }}><option value="">Select an approved week</option>{billable.map((x) => <option key={x.key} value={x.key}>{(x.m.projectTitle || x.m.title || 'Project')} . M{String(x.m.milestoneNumber || '')} . W{String(x.w.weekNumber || '')}</option>)}</select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}><input value={invNo} onChange={(e) => setInvNo(e.target.value)} placeholder="Invoice Number" style={inp} /><input value={invAmt} onChange={(e) => setInvAmt(e.target.value)} placeholder="Invoice Amount" type="number" style={inp} /></div>
              <input ref={fileRef} type="file" accept="application/pdf,image/*" onChange={(e) => setInvFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
              <button onClick={() => fileRef.current?.click()} style={{ height: 38, padding: '0 14px', borderRadius: 9, border: `1px solid ${T.border}`, background: '#fff', color: T.ink, fontWeight: 700, fontSize: 12.5, cursor: 'pointer', marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Upload size={13} /> {invFile ? invFile.name.slice(0, 22) : 'Upload Invoice'}</button>
              <textarea value={invRemarks} onChange={(e) => setInvRemarks(e.target.value)} rows={2} placeholder="Remarks" style={{ ...inp, marginBottom: 10, resize: 'vertical' }} />
              <GoldBtn full disabled={busy || !sel} onClick={raiseBill}>{busy ? <Loader2 size={15} className="animate-spin" /> : 'Submit Bill'}</GoldBtn>
            </div>
          </div>
        </div>
        <div>
          <Table title="Submitted Bills" rows={cSub} />
          <Table title="Approved Bills" rows={cApp} />
          <Table title="Cleared Bills" rows={cClr} />
          <Table title="Rejected Bills" rows={cRej} />
        </div>
      </div>
    </>}
  </div>);
}
function PortfolioView({ docId }: { docId: string }) {
  type PItem = { id: string; title: string; projectName: string; category: string; description: string; mediaType: string; mediaUrl: string; thumbnailUrl: string; createdAtText: string };
  const [items, setItems] = useState<PItem[] | null>(null);
  const [title, setTitle] = useState(''); const [projectName, setProjectName] = useState(''); const [category, setCategory] = useState(''); const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [search, setSearch] = useState(''); const [filterType, setFilterType] = useState('ALL');
  const [viewer, setViewer] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => { (async () => {
    if (!docId) { setItems([]); return; }
    setItems(null);
    const map = (s: { docs: { id: string; data: () => Record<string, unknown> }[] }) => s.docs.map((d) => { const p = d.data() as Record<string, unknown>; return { id: d.id, title: String(p.title ?? ''), projectName: String(p.projectName ?? ''), category: String(p.category ?? ''), description: String(p.description ?? ''), mediaType: String(p.mediaType ?? 'IMAGE'), mediaUrl: String(p.mediaUrl ?? ''), thumbnailUrl: String(p.thumbnailUrl ?? ''), createdAtText: String(p.createdAtText ?? 'Recently added') }; });
    try { const s = await getDocs(query(collection(cDb, 'portfolio_items'), where('contractorId', '==', docId), orderBy('createdAt', 'desc'))); setItems(map(s)); }
    catch { try { const s = await getDocs(query(collection(cDb, 'portfolio_items'), where('contractorId', '==', docId))); setItems(map(s)); } catch { setItems([]); } }
  })(); /* eslint-disable-next-line */ }, [docId]);
  function chooseFiles(e: ChangeEvent<HTMLInputElement>) {
    const fs = Array.from(e.target.files ?? []);
    if (!fs.length) return;
    if (fs.length > 30) { setMsg('Max 30 files at once.'); return; }
    if (fs.find((f) => !f.type.startsWith('image/') && !f.type.startsWith('video/'))) { setMsg('Only image / video files allowed.'); return; }
    if (fs.find((f) => f.size > 20 * 1024 * 1024)) { setMsg('Each file must be under 20MB.'); return; }
    setFiles(fs); setMsg(null);
  }
  async function doUpload() {
    if (!docId) { setMsg('Account not resolved - reopen the portal.'); return; }
    if (!title.trim() || !projectName.trim() || !category.trim() || !description.trim()) { setMsg('Fill Title, Project, Category and Description.'); return; }
    if (!files.length) { setMsg('Choose at least one file.'); return; }
    setUploading(true); setMsg(null);
    try {
      const created: PItem[] = [];
      for (const file of files) {
        const isImage = file.type.startsWith('image/'); const mediaType = isImage ? 'IMAGE' : 'VIDEO';
        const ext = file.name.split('.').pop() || 'file';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const path = `contractor-portfolio/${docId}/${fileName}`;
        const sref = ref(cStorage, path);
        await uploadBytes(sref, file);
        const url = await getDownloadURL(sref);
        const dref = await addDoc(collection(cDb, 'portfolio_items'), { contractorId: docId, title: title.trim(), category: category.trim(), projectName: projectName.trim(), description: description.trim(), mediaType, mediaUrl: url, storagePath: path, thumbnailUrl: isImage ? url : '', createdAt: serverTimestamp(), updatedAt: serverTimestamp(), createdAtText: new Date().toLocaleDateString('en-IN') });
        created.push({ id: dref.id, title: title.trim(), projectName: projectName.trim(), category: category.trim(), description: description.trim(), mediaType, mediaUrl: url, thumbnailUrl: isImage ? url : '', createdAtText: new Date().toLocaleDateString('en-IN') });
      }
      setItems((prev) => [...created.reverse(), ...(prev || [])]);
      setTitle(''); setProjectName(''); setCategory(''); setDescription(''); setFiles([]); if (fileRef.current) fileRef.current.value = '';
      setMsg('Uploaded successfully.');
    } catch { setMsg('Upload failed. Please try again.'); }
    finally { setUploading(false); }
  }
  const list = (items || []).filter((it) => { const q = search.trim().toLowerCase(); const ms = !q || it.title.toLowerCase().includes(q) || it.projectName.toLowerCase().includes(q) || it.category.toLowerCase().includes(q); const mt = filterType === 'ALL' || it.mediaType.toUpperCase() === filterType; return ms && mt; });
  const inp: CSSProperties = { height: 46, width: '100%', padding: '0 14px', borderRadius: 12, border: `1px solid ${T.border}`, outline: 'none', fontSize: 14, color: T.ink, background: '#fff', boxSizing: 'border-box', fontFamily: SANS };
  const lbl: CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 6 };
  return (<div><Head over="Showcase" title="Portfolio Gallery" />
    <div style={{ fontSize: 13.5, color: T.muted, marginTop: -8, marginBottom: 16 }}>Upload completed work images and videos to showcase your projects.</div>
    <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 16, alignItems: 'start' }}>
      <div style={{ ...glass, borderRadius: 18, padding: 20 }}>
        <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: T.ink, marginBottom: 14 }}>Upload New Portfolio Items</div>
        <label style={lbl}>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: High-rise Residential Tower" style={inp} />
        <div style={{ height: 12 }} /><label style={lbl}>Project Name</label><input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Ex: Skyline Heights Phase 1" style={inp} />
        <div style={{ height: 12 }} /><label style={lbl}>Category</label><input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Civil Works / Electrical / Turnkey" style={inp} />
        <div style={{ height: 12 }} /><label style={lbl}>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Write a short summary about the completed work, scope, and highlights." style={{ ...inp, height: 'auto', padding: '10px 14px', resize: 'vertical' }} />
        <div style={{ height: 14 }} /><label style={lbl}>Upload Images / Videos (max 30)</label>
        <div style={{ border: `2px dashed ${T.border}`, borderRadius: 12, padding: 18, textAlign: 'center' }}>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={chooseFiles} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} style={{ height: 40, padding: '0 18px', borderRadius: 999, border: `1px solid ${T.gold}55`, background: 'rgba(255,255,255,0.7)', color: T.ink, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}><Upload size={15} /> Choose Files</button>
          <div style={{ fontSize: 12.5, color: T.muted, marginTop: 8 }}>{files.length ? `${files.length} file(s) selected` : 'Click to upload images and videos'}</div>
        </div>
        {msg && <div style={{ fontSize: 12.5, color: msg.startsWith('Uploaded') ? T.emerald : T.red, marginTop: 10 }}>{msg}</div>}
        <div style={{ marginTop: 14 }}><GoldBtn full disabled={uploading} onClick={doUpload}>{uploading ? <Loader2 size={16} className="animate-spin" /> : 'Upload Portfolio Items'}</GoldBtn></div>
      </div>
      <div>
        <div style={{ ...glass, borderRadius: 16, padding: 12, display: 'grid', gridTemplateColumns: '1fr 150px', gap: 10, marginBottom: 14 }}>
          <div style={{ position: 'relative' }}><Search size={16} style={{ position: 'absolute', left: 12, top: 14, color: T.muted }} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, project, or category" style={{ ...inp, paddingLeft: 36 }} /></div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="ALL">All Media</option><option value="IMAGE">Images</option><option value="VIDEO">Videos</option></select>
        </div>
        <div style={{ ...glass, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: `1px solid ${T.border}` }}><div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: T.ink }}>Uploaded Portfolio</div><div style={{ fontSize: 12.5, fontWeight: 700, color: T.muted }}>{list.length} shown</div></div>
          <div style={{ padding: 14 }}>
            {items === null ? <div style={{ padding: 30, textAlign: 'center' }}><Loader2 className="animate-spin" color={T.gold} /></div>
              : list.length === 0 ? <div style={{ padding: 30, textAlign: 'center', color: T.muted, border: `1px dashed ${T.border}`, borderRadius: 12 }}>No portfolio items found.</div>
                : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>{list.map((it, i) => (
                  <button key={it.id} onClick={() => setViewer(i)} style={{ ...glass, borderRadius: 14, overflow: 'hidden', textAlign: 'left', cursor: 'pointer', padding: 0, border: `1px solid ${T.border}` }}>
                    <div style={{ height: 170, background: '#F5F0E8', position: 'relative' }}>
                      {it.mediaType.toUpperCase() === 'IMAGE'
                        ? <img src={it.thumbnailUrl || it.mediaUrl} alt={it.title} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                        : <><video src={it.mediaUrl} muted style={{ height: '100%', width: '100%', objectFit: 'cover' }} /><div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.gold, color: '#1A1A1A', padding: '6px 14px', borderRadius: 999, fontWeight: 700, fontSize: 12.5 }}><Play size={13} /> Play</span></div></>}
                    </div>
                    <div style={{ padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <div><div style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>{it.title}</div><div style={{ fontSize: 12.5, fontWeight: 700, color: T.goldText, marginTop: 2 }}>{it.projectName}</div></div>
                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, padding: '3px 9px', borderRadius: 999, background: it.mediaType.toUpperCase() === 'IMAGE' ? T.emeraldSoft : '#FDF8EC', color: it.mediaType.toUpperCase() === 'IMAGE' ? T.emerald : T.goldText, height: 'fit-content' }}>{it.mediaType.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: T.muted, marginTop: 8 }}>{it.category}</div>
                      <div style={{ fontSize: 12.5, color: T.body, marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{it.description}</div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: T.muted, marginTop: 10 }}>{it.createdAtText}</div>
                    </div>
                  </button>
                ))}</div>}
          </div>
        </div>
      </div>
    </div>
    {viewer !== null && list[viewer] && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 700, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', color: '#fff' }}>
          <div><div style={{ fontWeight: 700, fontSize: 16 }}>{list[viewer].title}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{viewer + 1} / {list.length}</div></div>
          <button onClick={() => setViewer(null)} style={{ height: 38, width: 38, borderRadius: 999, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 16 }}>
          <button onClick={() => setViewer((v) => (v === null ? v : (v - 1 + list.length) % list.length))} style={{ position: 'absolute', left: 12, height: 48, width: 48, borderRadius: 999, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer' }}><ChevronLeft size={22} /></button>
          {list[viewer].mediaType.toUpperCase() === 'IMAGE'
            ? <img src={list[viewer].mediaUrl} alt={list[viewer].title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            : <video src={list[viewer].mediaUrl} controls autoPlay style={{ maxHeight: '100%', maxWidth: '100%' }} />}
          <button onClick={() => setViewer((v) => (v === null ? v : (v + 1) % list.length))} style={{ position: 'absolute', right: 12, height: 48, width: 48, borderRadius: 999, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer' }}><ChevronRight size={22} /></button>
        </div>
        <div style={{ padding: '12px 18px', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.2)' }}><div style={{ fontWeight: 700 }}>{list[viewer].projectName}</div><div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{list[viewer].category}</div><div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>{list[viewer].description}</div></div>
      </div>
    )}
  </div>);
}
export function ContractorPortal({ onClose }: { onClose: () => void }) {
  useFonts();
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [contractor, setContractor] = useState<ContractorDoc | null>(null);
  const [cDocId, setCDocId] = useState('');
  const [data, setData] = useState<PortalData>({ projects: [], milestones: [], billings: [], rfqs: [], bids: [], portfolio: [] });
  const [loadingData, setLoadingData] = useState(false);
  const [view, setView] = useState<CView>('home');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Always open at the login screen -- never silently restore a saved session.
    signOut(cAuth).catch(() => {});
    setUser(null);
    setBooting(false);
    return () => {};
  }, []);

  async function loadData(docId: string, uid: string) {
    setLoadingData(true);
    const safe = async (qy: Promise<{ docs: { id: string; data: () => Record<string, unknown> }[] }>): Promise<Row[]> => { try { const s = await qy; return s.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })); } catch { return []; } };
    const [projects, milestones, billings, rfqs, bids, portfolio] = await Promise.all([
      safe(getDocs(query(collection(cDb, 'projects'), where('contractorId', '==', docId)))),
      safe(getDocs(query(collection(cDb, 'milestones'), where('contractorId', '==', docId)))),
      safe(getDocs(query(collection(cDb, 'billings'), where('contractorId', '==', docId)))),
      safe(getDocs(query(collection(cDb, 'rfqs'), where('invitedContractorAuthUids', 'array-contains', uid)))),
      safe(getDocs(query(collection(cDb, 'rfq_bids'), where('contractorDocId', '==', docId)))),
      safe(getDocs(query(collection(cDb, 'portfolio'), where('contractorId', '==', docId)))),
    ]);
    setData({ projects, milestones, billings, rfqs, bids, portfolio });
    setLoadingData(false);
  }
  async function gate(u: User): Promise<boolean> {
    try {
      // Resolve the contractor robustly: authUid query -> contractorId claim -> email.
      let docId = ''; let cdoc: ContractorDoc | null = null;
      try { const tok = await getIdTokenResult(u, true); const cid = (tok.claims?.contractorId as string | undefined) || ''; if (cid) { const cs = await getDoc(doc(cDb, 'contractors', cid)); if (cs.exists()) { docId = cs.id; cdoc = cs.data() as ContractorDoc; } } } catch (e) { /* ignore */ }
      if (!docId) { try { const snap = await getDocs(query(collection(cDb, 'contractors'), where('authUid', '==', u.uid))); if (!snap.empty) { docId = snap.docs[0].id; cdoc = snap.docs[0].data() as ContractorDoc; } } catch (e) { /* ignore */ } }
      if (!docId && u.email) { try { const es = await getDocs(query(collection(cDb, 'contractors'), where('email', '==', u.email))); if (!es.empty) { docId = es.docs[0].id; cdoc = es.docs[0].data() as ContractorDoc; } } catch (e) { /* ignore */ } }
      if (!docId || !cdoc) { await signOut(cAuth); setErr('Contractor profile not found. Please register or contact admin.'); return false; }
      const status = String(cdoc.status ?? 'PENDING').toUpperCase();
      if (status !== 'APPROVED') { await signOut(cAuth); setErr(status === 'PENDING' ? 'Your registration is pending admin approval.' : status === 'SUSPENDED' ? 'Your account is suspended. Please contact admin.' : status === 'REJECTED' ? 'Your registration was rejected. Please contact admin.' : 'Unable to login. Please contact admin.'); return false; }
      setContractor(cdoc); setCDocId(docId); loadData(docId, u.uid); return true;
    } catch { await signOut(cAuth).catch(() => {}); setErr('Could not verify your contractor account. Try again.'); return false; }
  }
  async function doLogin() {
    setErr(null);
    if (!email.trim() || pw.length < 6) { setErr('Enter a valid email and a 6+ character password.'); return; }
    setBusy(true);
    try { const cred = await signInWithEmailAndPassword(cAuth, email.trim(), pw); const ok = await gate(cred.user); if (ok) setUser(cred.user); }
    catch (e) { const code = (e as { code?: string }).code || ''; setErr(code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') ? 'Incorrect email or password.' : code.includes('too-many-requests') ? 'Too many attempts. Please wait and try again.' : 'Sign in failed. Please try again.'); }
    finally { setBusy(false); }
  }
  async function doLogout() { await signOut(cAuth).catch(() => {}); setUser(null); setContractor(null); setView('home'); setEmail(''); setPw(''); setData({ projects: [], milestones: [], billings: [], rfqs: [], bids: [], portfolio: [] }); }

  if (booting) return <Splash />;
  if (!user || !contractor) return <LoginView email={email} pw={pw} showPw={showPw} busy={busy} err={err} setEmail={setEmail} setPw={setPw} setShowPw={setShowPw} onSubmit={doLogin} onClose={onClose} />;

  const pageBg = `radial-gradient(ellipse at 18% 0%, rgba(197,160,89,0.08), transparent 45%), radial-gradient(ellipse at 100% 100%, rgba(197,160,89,0.06), transparent 50%), ${T.bg}`;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 660, background: pageBg, overflowY: 'auto', fontFamily: SANS, color: T.body }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '22px 24px 60px' }}>
        <Topbar contractor={contractor} onLogout={doLogout} onClose={onClose} />
        <NavBar view={view} setView={setView} />
        {loadingData && view === 'home' ? <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color={T.gold} /></div>
          : view === 'home' ? <Home contractor={contractor} data={data} setView={setView} />
            : view === 'projects' ? <ProjectsView data={data} />
              : view === 'rfqs' ? <RfqsView data={data} />
                : view === 'bids' ? <BidsView data={data} />
                  : view === 'milestones' ? <MilestonesView docId={cDocId} />
                    : view === 'billing' ? <BillingView docId={cDocId} />
                      : view === 'portfolio' ? <PortfolioView docId={cDocId} />
                        : <ProfileView contractor={contractor} docId={cDocId} onPhoto={(url) => setContractor((c) => (c ? { ...c, profileImageUrl: url } : c))} />}
      </div>
    </div>
  );
}
