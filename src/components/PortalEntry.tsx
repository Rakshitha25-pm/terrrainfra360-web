// PortalEntry.tsx
// Role-specific portal entry points (Admin / Vendor / Contractor) that open
// inside the site. The drawer's "Portals" buttons open a branded sign-in card;
// after Sign In we open a real in-app workspace dashboard for that role
// (sidebar nav, KPI cards, tables). The external *.terrainfra360.com portals
// are not deployed yet, so everything runs inside the site with sample data.
import { useState, type ComponentType, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  X, ShieldCheck, Building2, Wrench, Lock, Mail, Phone, ArrowRight,
  AlertCircle, TrendingUp, Layers, Users, Briefcase,
  ShoppingBag, MessageSquare, Award, Target, LogOut, LayoutGrid,
} from 'lucide-react';

export type PortalKind = 'admin' | 'vendor' | 'contractor';

type IconType = ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
type Feature = { icon: IconType; label: string };

interface PortalConfig {
  title: string;
  tagline: string;
  blurb: string;
  accent: string;
  accentSoft: string;
  grad: string;
  icon: IconType;
  idLabel: string;
  idPlaceholder: string;
  idType: 'email' | 'text';
  features: Feature[];
}

const CONFIG: Record<PortalKind, PortalConfig> = {
  admin: {
    title: 'Admin Portal',
    tagline: 'Operations Console',
    blurb: 'Manage the catalog, approve vendors, resolve disputes and watch platform analytics.',
    accent: '#6366f1',
    accentSoft: 'rgba(99,102,241,0.16)',
    grad: 'linear-gradient(135deg,#4f46e5,#1e1b4b)',
    icon: ShieldCheck,
    idLabel: 'Admin email',
    idPlaceholder: 'name@terrainfra360.com',
    idType: 'email',
    features: [
      { icon: TrendingUp, label: 'Dashboard & analytics' },
      { icon: Layers, label: 'Catalog management' },
      { icon: Users, label: 'Vendor approvals' },
      { icon: Briefcase, label: 'Orders & disputes' },
    ],
  },
  vendor: {
    title: 'Vendor Portal',
    tagline: 'Seller Workspace',
    blurb: 'List products, respond to RFQs, fulfil orders and track your payouts.',
    accent: '#10b981',
    accentSoft: 'rgba(16,185,129,0.16)',
    grad: 'linear-gradient(135deg,#059669,#064e3b)',
    icon: Building2,
    idLabel: 'Vendor ID or email',
    idPlaceholder: 'vendor@business.com',
    idType: 'text',
    features: [
      { icon: ShoppingBag, label: 'Manage listings' },
      { icon: MessageSquare, label: 'Respond to RFQs' },
      { icon: Briefcase, label: 'Order fulfilment' },
      { icon: Award, label: 'Payouts & rewards' },
    ],
  },
  contractor: {
    title: 'Contractor Portal',
    tagline: 'Project Workspace',
    blurb: 'Browse live RFQs, submit bids, manage project milestones and raise invoices.',
    accent: '#f97316',
    accentSoft: 'rgba(249,115,22,0.16)',
    grad: 'linear-gradient(135deg,#ea580c,#7c2d12)',
    icon: Wrench,
    idLabel: 'Phone or email',
    idPlaceholder: '+91 / name@email.com',
    idType: 'text',
    features: [
      { icon: Wrench, label: 'Browse live RFQs' },
      { icon: Target, label: 'Submit bids' },
      { icon: TrendingUp, label: 'Project milestones' },
      { icon: Briefcase, label: 'Invoices & payments' },
    ],
  },
};

type Kpi = { label: string; value: string; sub: string };
interface Dash {
  kpis: Kpi[];
  tableTitle: string;
  cols: string[];
  rows: string[][];
  lists: Record<string, { note: string; items: string[] }>;
}

const DASH: Record<PortalKind, Dash> = {
  admin: {
    kpis: [
      { label: 'Vendors', value: '342', sub: '8 pending approval' },
      { label: 'Live products', value: '12,480', sub: '+210 this week' },
      { label: 'Open disputes', value: '5', sub: '2 high priority' },
      { label: 'GMV (Jun)', value: 'Rs 1.8Cr', sub: '+12% MoM' },
    ],
    tableTitle: 'Latest activity',
    cols: ['Time', 'Entity', 'Event', 'Status'],
    rows: [
      ['09:12', 'Vendor: BuildMart', 'KYC submitted', 'Review'],
      ['08:47', 'Order #TF-90231', 'Dispute opened', 'Open'],
      ['08:20', 'Product: Cement', 'Price flagged', 'Auto-hold'],
      ['07:55', 'Vendor: SteelCo', 'Payout processed', 'Done'],
    ],
    lists: {
      'Dashboard & analytics': { note: 'Key trends', items: ['GMV up 12% MoM', 'Conversion 3.4%', 'Avg order Rs 18,200'] },
      'Catalog management': { note: 'Needs attention', items: ['210 new products to review', '18 price flags', '7 out-of-policy listings'] },
      'Vendor approvals': { note: 'Pending KYC', items: ['BuildMart - docs submitted', 'SteelCo - GST pending', 'PaintHub - bank verify'] },
      'Orders & disputes': { note: 'Active cases', items: ['#TF-90231 - wrong item', '#TF-90180 - late delivery', '#TF-90155 - refund requested'] },
    },
  },
  vendor: {
    kpis: [
      { label: 'Active listings', value: '128', sub: '+6 this week' },
      { label: 'Open RFQs', value: '14', sub: '3 awaiting quote' },
      { label: 'Orders to ship', value: '7', sub: '2 due today' },
      { label: 'Payout (Jun)', value: 'Rs 2.4L', sub: 'cleared Jun 15' },
    ],
    tableTitle: 'Recent orders',
    cols: ['Order', 'Item', 'Qty', 'Status'],
    rows: [
      ['#TF-90231', 'UltraTech Cement 53 Grade', '500 bags', 'Packed'],
      ['#TF-90228', 'TMT Steel Bars 12mm', '2.4 T', 'Shipped'],
      ['#TF-90219', 'Asian Paints Apex', '120 L', 'Delivered'],
      ['#TF-90205', 'Kajaria Floor Tiles', '85 box', 'Processing'],
    ],
    lists: {
      'Manage listings': { note: 'Your published products', items: ['UltraTech Cement 53 Grade - in stock', 'TMT Steel Bars 12mm - low stock', 'Kajaria Floor Tiles - in stock'] },
      'Respond to RFQs': { note: 'Buyers awaiting your quote', items: ['RFQ #4471 - 1,000 cement bags', 'RFQ #4468 - 5 T TMT steel', 'RFQ #4460 - 300 L paint'] },
      'Order fulfilment': { note: 'Orders in progress', items: ['#TF-90231 pack by today', '#TF-90228 handed to courier', '#TF-90205 awaiting stock'] },
      'Payouts & rewards': { note: 'Recent settlements', items: ['Jun 15 - Rs 2,40,000 cleared', 'May 31 - Rs 1,98,500 cleared', 'Gold tier - 3% cashback active'] },
    },
  },
  contractor: {
    kpis: [
      { label: 'Open RFQs', value: '23', sub: '6 match your trade' },
      { label: 'Active bids', value: '9', sub: '4 shortlisted' },
      { label: 'Projects', value: '3', sub: '1 milestone due' },
      { label: 'Invoiced (Jun)', value: 'Rs 6.7L', sub: 'Rs 1.2L pending' },
    ],
    tableTitle: 'Project milestones',
    cols: ['Project', 'Milestone', 'Due', 'Status'],
    rows: [
      ['Villa - Whitefield', 'Foundation', 'Jun 22', 'On track'],
      ['Apt - HSR', 'Plastering', 'Jun 28', 'At risk'],
      ['Office - MG Rd', 'Electrical', 'Jul 04', 'On track'],
      ['Villa - Whitefield', 'Roofing', 'Jul 12', 'Planned'],
    ],
    lists: {
      'Browse live RFQs': { note: 'New requirements', items: ['RFQ #5521 - 2BHK interior', 'RFQ #5518 - waterproofing', 'RFQ #5510 - false ceiling'] },
      'Submit bids': { note: 'Drafts & sent', items: ['Villa Whitefield - submitted', 'Apt HSR - draft', 'Office MG Rd - shortlisted'] },
      'Project milestones': { note: 'Upcoming', items: ['Foundation - Jun 22', 'Plastering - Jun 28', 'Electrical - Jul 04'] },
      'Invoices & payments': { note: 'Recent', items: ['INV-2208 Rs 3.1L - paid', 'INV-2210 Rs 1.2L - pending', 'INV-2205 Rs 2.4L - paid'] },
    },
  },
};

export function PortalEntryModal({ portal, onClose }: { portal: PortalKind; onClose: () => void }) {
  const cfg = CONFIG[portal];
  const Icon = cfg.icon;
  const [signedIn, setSignedIn] = useState(false);
  const [uid, setUid] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    if (!uid.trim() || !pw.trim()) {
      setErr('Enter your credentials to continue.');
      return;
    }
    setSignedIn(true);
  };

  if (signedIn) {
    return <PortalDashboard portal={portal} account={uid} onExit={onClose} />;
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[650] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 210 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[95vh]"
        style={{ background: '#0d0b0a', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
      >
        <div className="relative px-7 pt-7 pb-6" style={{ background: cfg.grad }}>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.28)' }}
          >
            <X size={16} className="text-white" />
          </button>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.16)' }}>
            <Icon size={26} className="text-white" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">{cfg.tagline}</p>
          <h2 className="text-2xl font-black text-white tracking-tight">{cfg.title}</h2>
          <p className="text-sm text-white/85 mt-2 leading-relaxed max-w-sm">{cfg.blurb}</p>
        </div>

        <div className="overflow-y-auto px-7 py-6">
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {cfg.features.map((f) => {
              const FIcon = f.icon;
              return (
                <div
                  key={f.label}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <FIcon size={15} className="shrink-0" style={{ color: cfg.accent }} />
                  <span className="text-[11.5px] font-bold text-white/70 leading-tight">{f.label}</span>
                </div>
              );
            })}
          </div>

          <Field icon={cfg.idType === 'email' ? Mail : Phone} label={cfg.idLabel} accent={cfg.accent}>
            <input
              type={cfg.idType}
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder={cfg.idPlaceholder}
              className="w-full bg-transparent outline-none text-sm font-medium text-white placeholder:text-white/30"
            />
          </Field>
          <div className="h-3" />
          <Field icon={Lock} label="Password" accent={cfg.accent}>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Your password"
              className="w-full bg-transparent outline-none text-sm font-medium text-white placeholder:text-white/30"
            />
          </Field>

          {err && (
            <div className="flex items-start gap-2 p-3 rounded-xl mt-4" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)' }}>
              <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-300 leading-relaxed">{err}</p>
            </div>
          )}

          <button
            onClick={submit}
            className="w-full mt-5 py-4 rounded-xl text-white font-black text-xs tracking-[0.3em] uppercase cursor-pointer flex items-center justify-center gap-2"
            style={{ background: cfg.grad }}
          >
            Sign in <ArrowRight size={15} />
          </button>

          <p className="text-center text-[11px] text-white/40 pt-4 leading-relaxed">
            Restricted access. For a new {portal} account, contact{' '}
            <span style={{ color: cfg.accent }}>partners@terrainfra360.com</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function PortalDashboard({ portal, account, onExit }: { portal: PortalKind; account: string; onExit: () => void }) {
  const cfg = CONFIG[portal];
  const data = DASH[portal];
  const HeaderIcon = cfg.icon;
  const nav = ['Overview', ...cfg.features.map((f) => f.label)];
  const [active, setActive] = useState('Overview');
  const SectionIcon = cfg.features.find((f) => f.label === active)?.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[650] flex flex-col"
      style={{ background: '#0a0a0a' }}
    >
      <div className="flex items-center justify-between px-5 sm:px-8 h-16 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#0d0b0a' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cfg.grad }}>
            <HeaderIcon size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: cfg.accent }}>{cfg.tagline}</p>
            <h2 className="text-white font-black text-sm leading-none">{cfg.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-[11px] text-white/45 font-semibold">Signed in as {account}</span>
          <button onClick={onExit} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-white/70 hover:text-white cursor-pointer" style={{ background: '#1a1714' }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r py-4 px-3 gap-1" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#0d0b0a' }}>
          {nav.map((item, i) => {
            const on = item === active;
            const Ic = i === 0 ? LayoutGrid : cfg.features[i - 1].icon;
            return (
              <button
                key={item}
                onClick={() => setActive(item)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] font-bold transition-colors cursor-pointer"
                style={{ background: on ? cfg.accentSoft : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,0.55)' }}
              >
                <Ic size={16} style={{ color: on ? cfg.accent : 'rgba(255,255,255,0.4)' }} />
                {item}
              </button>
            );
          })}
        </aside>

        <main className="flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="md:hidden flex gap-2 overflow-x-auto pb-4 -mx-1 px-1">
            {nav.map((item) => {
              const on = item === active;
              return (
                <button key={item} onClick={() => setActive(item)} className="shrink-0 px-3 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer" style={{ background: on ? cfg.accentSoft : '#141110', color: on ? '#fff' : 'rgba(255,255,255,0.55)' }}>
                  {item}
                </button>
              );
            })}
          </div>

          {active === 'Overview' ? (
            <>
              <h1 className="text-white font-black text-xl mb-1">Overview</h1>
              <p className="text-white/45 text-sm mb-6">A snapshot of your {portal} workspace. Sample data.</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {data.kpis.map((k) => (
                  <div key={k.label} className="rounded-2xl p-4" style={{ background: '#121010', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/40">{k.label}</p>
                    <p className="text-2xl font-black text-white mt-1.5">{k.value}</p>
                    <p className="text-[11px] font-semibold mt-1" style={{ color: cfg.accent }}>{k.sub}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background: '#121010', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <h3 className="text-white font-black text-sm">{data.tableTitle}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr>{data.cols.map((c) => <th key={c} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-white/35 whitespace-nowrap">{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {data.rows.map((r, ri) => (
                        <tr key={ri} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                          {r.map((cell, ci) => <td key={ci} className="px-5 py-3 text-[12.5px] text-white/75 font-medium whitespace-nowrap">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-white font-black text-xl mb-1">{active}</h1>
              <p className="text-white/45 text-sm mb-6">{data.lists[active]?.note}</p>
              <div className="space-y-2.5 max-w-2xl">
                {(data.lists[active]?.items ?? []).map((it, ii) => (
                  <div key={ii} className="flex items-center gap-3 rounded-xl px-4 py-3.5" style={{ background: '#121010', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {SectionIcon ? <SectionIcon size={16} style={{ color: cfg.accent }} /> : null}
                    <span className="text-[13px] text-white/80 font-medium">{it}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl p-5 max-w-2xl" style={{ background: cfg.accentSoft, border: '1px solid rgba(255,255,255,0.10)' }}>
                <p className="text-[12.5px] text-white/70 leading-relaxed">This is a live in-app preview of the {cfg.title}. Connect the backend to replace the sample data with live records.</p>
              </div>
            </>
          )}
        </main>
      </div>
    </motion.div>
  );
}

function Field({ icon: Icon, label, accent, children }: { icon: IconType; label: string; accent: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-[0.3em] block mb-1.5" style={{ color: accent }}>
        {label}
      </label>
      <div
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl border focus-within:border-white/30"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' }}
      >
        <Icon size={16} className="text-white/35 shrink-0" />
        {children}
      </div>
    </div>
  );
}
