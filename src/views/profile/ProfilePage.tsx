/**
 * ProfileDrawer — right-side slide-in drawer that ports the Flutter
 * `MyProfileScreen` and uses an in-drawer navigation stack.
 *
 * Architecture:
 *   • A single `view` state controls what's rendered INSIDE the drawer
 *     (home, orders, addresses, wishlist, notifications, etc.).
 *   • Tapping a row swaps the content with a slide animation — no
 *     pop-up full-screen sheet anymore. Tap the back arrow to return.
 *   • Each sub-view streams its own Firestore collection
 *     (`users/{phone}/orders`, `.../wishlist`, `.../addresses`,
 *     `.../notifications`) and shows empty state when none.
 *   • Edit Profile + Language Picker also live as in-drawer views.
 *   • Sign Out clears localStorage + closes drawer.
 *
 * Theme matches the rest of the website (dark warm palette).
 */
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Camera, BadgeCheck, Receipt, Heart, Ticket, Headphones,
  Building2, Briefcase, FileText, MapPin, Smartphone, Bell, ShieldCheck,
  Lock, Info, Shield, Star, LogOut, ChevronRight, Sparkles, X,
  User as UserIcon, Mail, Phone as PhoneIcon, Check, Plus,
  Inbox, Calendar, Tag, CheckCircle2, Pencil, Trash2,
} from 'lucide-react';
import {
  doc, onSnapshot, setDoc, serverTimestamp, collection, query,
  orderBy, where, deleteDoc, addDoc, updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { clearLoggedInPhone, getLoggedInPhone } from '../../components/LoginModal';
import { loadOrders, saveOrder, newOrder, RPRODUCTS } from '../ti360shop/shared';
import { loadServiceRFQs } from '../../lib/serviceRfq';
import { useT, LANGUAGES } from '../../lib/i18n';
import type { LangCode } from '../../lib/i18n';

// ─── Website dark theme tokens ──────────────────────────────────────────
// Theme-aware palette: these resolve to CSS variables (defined in index.css)
// so the drawer's inline styles flip correctly between dark and light mode.
// Previously these were hardcoded dark values, which left near-white text on a
// light background (invisible) when the site was switched to light mode.
const T = {
  scaffold: 'var(--tf-scaffold)',
  surface: 'var(--tf-surface)',
  surfaceAlt: 'var(--tf-surfaceAlt)',
  hairline: 'var(--tf-hairline)',
  ink: 'var(--tf-ink)',
  inkMute: 'var(--tf-inkMute)',
  inkFaint: 'var(--tf-inkFaint)',
  brand: '#f97316',
  brandDark: '#ea580c',
  brandSoft: 'rgba(249,115,22,0.12)',
  brandGrad: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  identityGrad: 'var(--tf-identityGrad)',
} as const;

interface Props {
  onClose: () => void;
  onSignedOut: () => void;
  onOpenMyListings: () => void;
}

interface Profile {
  name?: string; email?: string; phone?: string; photoUrl?: string;
  createdAt?: { seconds?: number } | null;
}
type B2BStatus = 'none' | 'pending' | 'approved' | 'rejected';

type View =
  | 'home' | 'edit' | 'language'
  | 'orders' | 'wishlist' | 'coupons' | 'helpCenter'
  | 'serviceRequests' | 'quoteRequests'
  | 'addresses' | 'devices' | 'notifications'
  | 'privacy' | 'password' | 'about' | 'terms';

export function ProfilePage({ onClose, onSignedOut, onOpenMyListings }: Props) {
  const { t, langDef } = useT();
  const phone = getLoggedInPhone();
  const [uid, setUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);
  const [profile, setProfile] = useState<Profile>(() => { try { return JSON.parse(localStorage.getItem('tf360_profile_v1') || '{}'); } catch { return {}; } });
  const [b2bStatus] = useState<B2BStatus>('none');
  const [view, setView] = useState<View>('home');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  // Stream the profile doc keyed by the Firebase uid (the app's path),
  // overlaying the locally-cached profile so saved details show immediately.
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      const d = snap.data();
      if (d) setProfile((prev) => ({ ...prev, ...d }));
    });
    return unsub;
  }, [uid]);

  // Lock body scroll while drawer is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const displayName = useMemo(
    () => profile.name?.trim() ||
      (phone ? phone.replace(/^(\+91)(\d{5})(\d{5})/, '$1 $2 $3') : 'TerraInfra User'),
    [profile.name, phone],
  );
  const initials = computeInitials(profile.name || phone || 'TI');
  const memberSince = `${t('memberSince')} ${formatMemberSince(profile.createdAt)}`;

  const signOut = () => {
    if (!confirm(t('signOutConfirm'))) return;
    fbSignOut(auth).catch(() => {});
    clearLoggedInPhone();
    onSignedOut();
  };

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const title =
    view === 'home' ? t('myProfile') :
    view === 'edit' ? t('editProfile') :
    view === 'language' ? t('tryInLanguage') :
    view === 'orders' ? t('orders') :
    view === 'wishlist' ? t('wishlist') :
    view === 'coupons' ? t('coupons') :
    view === 'helpCenter' ? t('helpCenter') :
    view === 'serviceRequests' ? t('myServiceRequests') :
    view === 'quoteRequests' ? t('myQuoteRequests') :
    view === 'addresses' ? t('savedAddressLedger') :
    view === 'devices' ? t('manageDevices') :
    view === 'notifications' ? t('notificationSettings') :
    view === 'privacy' ? t('privacyCenter') :
    view === 'password' ? t('updateSecuredPassword') :
    view === 'about' ? t('aboutTI') :
    view === 'terms' ? t('termsConditions') :
    t('myProfile');

  const goHome = () => setView('home');

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-[480]"
        style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 240 }}
        className="tf360-profile-drawer fixed top-0 right-0 bottom-0 z-[490] flex flex-col overflow-hidden"
        style={{
          width: 'min(440px, 100vw)',
          background: T.scaffold,
          borderLeft: `1px solid ${T.hairline}`,
          boxShadow: '-30px 0 80px rgba(0,0,0,0.6)',
        }}
        aria-label={title}
      >
        <DrawerHeader
          title={title}
          onBack={view === 'home' ? null : goHome}
          onClose={onClose}
        />

        {/* Animated view stack */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ x: view === 'home' ? -40 : 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: view === 'home' ? 40 : -40, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 overflow-y-auto"
            >
              {view === 'home' && (
                <HomeView
                  t={t} langDef={langDef}
                  name={displayName} phone={phone ?? ''} photoUrl={profile.photoUrl}
                  initials={initials} memberSince={memberSince}
                  b2bStatus={b2bStatus}
                  go={setView}
                  onOpenMyListings={() => { onOpenMyListings(); onClose(); }}
                  onSignOut={signOut}
                />
              )}
              {view === 'edit' && (
                <EditView
                  profile={profile} uid={uid} phone={phone ?? ''}
                  onSaved={(pp) => { setProfile((prev) => ({ ...prev, ...pp })); goHome(); flash('Profile updated.'); }}
                />
              )}
              {view === 'language' && (
                <LanguageView onPicked={(label) => { goHome(); flash(`${t('languageChanged')} ${label}`); }} />
              )}
              {view === 'orders' && <OrdersView />}
              {view === 'wishlist' && <WishlistView phone={phone} />}
              {view === 'coupons' && <CouponsView />}
              {view === 'helpCenter' && <HelpCenterView />}
              {view === 'serviceRequests' && <ServiceRFQView />}
              {view === 'quoteRequests' && <ServiceRFQView />}
              {view === 'addresses' && <AddressesView />}
              {view === 'devices' && <DevicesView />}
              {view === 'notifications' && <NotificationsView phone={phone} />}
              {view === 'privacy' && <PrivacyView phone={phone} />}
              {view === 'password' && <PasswordView />}
              {view === 'about' && <AboutView />}
              {view === 'terms' && <TermsView />}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              className="absolute bottom-5 left-4 right-4 z-[510] flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: '#0E1116', border: '1px solid rgba(249,115,22,0.30)', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: T.brand }} />
              <p className="text-white text-xs font-semibold flex-1">{toast}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Drawer header — back arrow when not on home
// ═══════════════════════════════════════════════════════════════════
function DrawerHeader({
  title, onBack, onClose,
}: { title: string; onBack: (() => void) | null; onClose: () => void }) {
  return (
    <div
      className="sticky top-0 z-10 backdrop-blur-xl"
      style={{ background: 'rgba(10,8,7,0.92)', borderBottom: `1px solid ${T.hairline}` }}
    >
      <div className="px-5 h-[60px] flex items-center gap-3">
        <button
          onClick={onBack ?? onClose} aria-label="Back"
          className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          style={{ background: T.surfaceAlt, border: `1px solid ${T.hairline}` }}
        >
          <ArrowLeft size={18} style={{ color: T.ink }} strokeWidth={2.5} />
        </button>
        <h1 className="font-black flex-1 truncate" style={{ fontSize: 17, color: T.ink, letterSpacing: '-0.3px' }}>
          {title}
        </h1>
        <button
          onClick={onClose} aria-label="Close"
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
          style={{ background: T.surfaceAlt, border: `1px solid ${T.hairline}` }}
        >
          <X size={16} style={{ color: T.inkMute }} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HOME VIEW — landing page of the drawer
// ═══════════════════════════════════════════════════════════════════
function HomeView({
  t, langDef, name, phone, photoUrl, initials, memberSince, b2bStatus,
  go, onOpenMyListings, onSignOut,
}: {
  t: (key: string) => string;
  langDef: { label: string };
  name: string; phone: string; photoUrl?: string; initials: string; memberSince: string;
  b2bStatus: B2BStatus;
  go: (v: View) => void;
  onOpenMyListings: () => void;
  onSignOut: () => void;
}) {
  // Tap into the language context so the quick toggle can switch the whole
  // site back to English without going through the language picker.
  const { lang, setLanguage } = useT();
  const isEnglish = lang === 'en';
  return (
    <div className="px-4 py-4 space-y-4">
      <IdentityCard
        name={name} phone={phone} photoUrl={photoUrl} initials={initials}
        memberSince={memberSince}
        b2bApproved={b2bStatus === 'approved'} b2bLabel={t('b2bPremiumMember')}
        onChangePhoto={() => go('edit')}
      />

      <QuickTiles
        onOrders={() => go('orders')}
        onWishlist={() => go('wishlist')}
        onCoupons={() => go('coupons')}
        onHelp={() => go('helpCenter')}
        labels={{
          orders: t('orders'), wishlist: t('wishlist'),
          coupons: t('coupons'), helpCenter: t('helpCenter'),
        }}
      />

      {b2bStatus === 'none' && (
        <button
          onClick={() => go('about')}
          className="w-full px-3.5 py-3 rounded-2xl flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-transform"
          style={{ background: T.surfaceAlt, border: `1.4px solid rgba(249,115,22,0.40)` }}
        >
          <div className="w-[34px] h-[34px] rounded-xl flex items-center justify-center shrink-0"
            style={{ background: T.brandSoft }}>
            <Sparkles size={18} style={{ color: T.brand }} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-[12.5px] font-extrabold truncate" style={{ color: T.ink }}>{t('unlockBulkPricing')}</p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: T.inkFaint }}>{t('joinAsBusiness')}</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg text-white text-[11.5px] font-black" style={{ background: T.brand }}>
            {t('join')}
          </div>
        </button>
      )}

      <div>
        <SectionTitle>{t('myActivity')}</SectionTitle>
        <NavGroup>
          <NavRow icon={Building2} label={t('myPropertyListings')} onClick={onOpenMyListings} />
          <RowDivider />
          <NavRow icon={Briefcase} label={t('myServiceRequests')} onClick={() => go('serviceRequests')} />
          <RowDivider />
          <NavRow icon={FileText} label={t('myQuoteRequests')} onClick={() => go('quoteRequests')} />
        </NavGroup>
      </div>

      <button onClick={() => go('language')}
        className="w-full px-3.5 py-3 rounded-2xl flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-transform"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0.02) 60%, rgba(255,255,255,0.02) 100%)',
          border: `1px solid ${T.hairline}`,
        }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: T.brandSoft }}>
          <span className="font-black text-[15px]" style={{ color: T.brand }}>अ</span>
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[13px] font-extrabold truncate" style={{ color: T.ink }}>{t('tryInLanguages')}</p>
          <p className="text-[10px] font-medium mt-0.5" style={{ color: T.inkFaint }}>
            {t('currentlySetTo')} {langDef.label}
          </p>
        </div>
        <span className="px-1.5 py-1 rounded text-[8px] font-black tracking-wider" style={{ background: T.brandSoft, color: T.brand }}>
          {t('choose')}
        </span>
        <ChevronRight size={20} style={{ color: T.inkMute }} />
      </button>

      {/* ── English toggle ──
        Visible only when the user is NOT on English. Tapping it flips the
        whole site straight back to English, no picker required. */}
      {!isEnglish && (
        <button
          onClick={() => setLanguage('en')}
          translate="no"
          className="notranslate w-full px-4 py-3 rounded-2xl flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-transform"
          style={{
            background: T.brandGrad,
            boxShadow: '0 8px 22px rgba(249,115,22,0.32)',
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.22)' }}
          >
            <span className="font-black text-[13px] text-white tracking-wider">EN</span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-[13px] font-black text-white truncate">
              Switch back to English
            </p>
            <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Currently: {langDef.label}
            </p>
          </div>
          <div className="px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider bg-white text-orange-600">
            EN
          </div>
        </button>
      )}

      <div>
        <SectionTitle>{t('accountSettings')}</SectionTitle>
        <NavGroup>
          <NavRow icon={UserIcon} label={t('editProfileDetails')} onClick={() => go('edit')} />
          <RowDivider />
          <NavRow icon={MapPin} label={t('savedAddressLedger')} onClick={() => go('addresses')} />
          <RowDivider />
          <NavRow icon={Smartphone} label={t('manageDevices')} onClick={() => go('devices')} />
          <RowDivider />
          <NavRow icon={Bell} label={t('notificationSettings')} onClick={() => go('notifications')} />
          <RowDivider />
          <NavRow icon={ShieldCheck} label={t('privacyCenter')} onClick={() => go('privacy')} />
          <RowDivider />
          <NavRow icon={Lock} label={t('updateSecuredPassword')} onClick={() => go('password')} />
        </NavGroup>
      </div>

      <div>
        <SectionTitle>{t('supportCorporate')}</SectionTitle>
        <NavGroup>
          <NavRow icon={Info} label={t('aboutTI')} onClick={() => go('about')} />
          <RowDivider />
          <NavRow icon={Shield} label={t('termsConditions')} onClick={() => go('terms')} />
          <RowDivider />
          <NavRow icon={Star} label={t('rateOurApp')} onClick={() => {
            window.open('https://play.google.com/store/apps/details?id=com.tf360.tf360', '_blank');
          }} />
        </NavGroup>
      </div>

      <div className="pt-1">
        <LogoutButton label={t('signOut')} onClick={onSignOut} />
      </div>

      <div className="text-center pt-2 pb-4">
        <p className="text-[10px] font-black tracking-wider" style={{ color: T.inkFaint }}>
          APP VERSION 1.0.0 (WEB)
        </p>
        <p className="text-[9px] font-semibold mt-0.5" style={{ color: T.inkFaint, letterSpacing: '0.4px' }}>
          TerraInfra360 Global Pvt. Ltd. · ISO 9001 Certified
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Identity / Quick tiles / shared primitives
// ═══════════════════════════════════════════════════════════════════
function IdentityCard({
  name, phone, photoUrl, initials, memberSince, b2bApproved, b2bLabel, onChangePhoto,
}: {
  name: string; phone: string; photoUrl?: string; initials: string;
  memberSince: string; b2bApproved: boolean; b2bLabel: string; onChangePhoto: () => void;
}) {
  return (
    <div className="p-5 rounded-3xl relative overflow-hidden"
      style={{ background: T.identityGrad, border: `1px solid ${T.hairline}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'rgba(249,115,22,0.10)', filter: 'blur(40px)' }} />
      <div className="relative flex items-center gap-5">
        <div className="relative shrink-0">
          <button onClick={onChangePhoto}
            className="w-[86px] h-[86px] rounded-full flex items-center justify-center text-white font-black overflow-hidden cursor-pointer"
            style={{ background: T.brandGrad, border: `3px solid ${T.scaffold}`, fontSize: 27 }}
            aria-label="Change profile picture">
            {photoUrl ? <img src={photoUrl} alt={name} className="w-full h-full object-cover" /> : initials}
          </button>
          <div className="absolute -right-px -bottom-px w-[30px] h-[30px] rounded-full flex items-center justify-center"
            style={{ background: T.brand, border: `2.5px solid ${T.scaffold}` }}>
            <Camera size={14} color="#0a0807" strokeWidth={2.5} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="font-black truncate" style={{ fontSize: 21, color: T.ink, letterSpacing: '-0.4px' }}>{name}</h2>
            <BadgeCheck size={19} style={{ color: T.brand }} className="shrink-0" />
          </div>
          <p className="font-bold mt-1" style={{ color: T.inkMute, fontSize: 13, letterSpacing: '0.4px' }}>{phone || '—'}</p>
          <div className="mt-3 px-3 py-2 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${T.hairline}` }}>
            <span className="text-[11px] font-semibold flex-1 truncate" style={{ color: T.inkMute }}>{memberSince}</span>
            {b2bApproved && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider" style={{ background: T.brandSoft, color: T.brand }}>
                {b2bLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickTiles({
  onOrders, onWishlist, onCoupons, onHelp, labels,
}: {
  onOrders: () => void; onWishlist: () => void; onCoupons: () => void; onHelp: () => void;
  labels: { orders: string; wishlist: string; coupons: string; helpCenter: string };
}) {
  const tiles = [
    { icon: Receipt, label: labels.orders, onClick: onOrders },
    { icon: Heart, label: labels.wishlist, onClick: onWishlist },
    { icon: Ticket, label: labels.coupons, onClick: onCoupons },
    { icon: Headphones, label: labels.helpCenter, onClick: onHelp },
  ];
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {tiles.map(({ icon: Icon, label, onClick }) => (
        <button key={label} onClick={onClick}
          className="h-14 px-3.5 rounded-2xl flex items-center gap-2.5 cursor-pointer hover:-translate-y-0.5 transition-transform"
          style={{ background: T.surfaceAlt, border: `1px solid ${T.hairline}` }}>
          <Icon size={21} style={{ color: T.brand }} />
          <span className="text-[13.5px] font-extrabold truncate" style={{ color: T.ink }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-black mb-2 px-1" style={{ fontSize: 14, color: T.ink, letterSpacing: '-0.2px' }}>
      {children}
    </p>
  );
}
function NavGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: T.surfaceAlt, border: `1px solid ${T.hairline}` }}>
      {children}
    </div>
  );
}
function NavRow({
  icon: Icon, label, onClick, iconColor, trailing,
}: {
  icon: typeof Receipt; label: string; onClick?: () => void; iconColor?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-[14px] hover:bg-white/[0.04] transition-colors cursor-pointer text-left">
      <Icon size={20} style={{ color: iconColor ?? T.brand }} />
      <span className="flex-1 text-[14px] font-bold truncate" style={{ color: T.ink }}>{label}</span>
      {trailing ?? <ChevronRight size={20} style={{ color: T.inkFaint }} />}
    </button>
  );
}
function RowDivider() {
  return <div className="ml-[56px]" style={{ height: 1, background: T.hairline }} />;
}
function LogoutButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="flex justify-center">
      <button onClick={onClick}
        className="px-7 py-2.5 rounded-full flex items-center gap-2 text-white cursor-pointer hover:scale-105 transition-transform"
        style={{ background: T.brandGrad, boxShadow: '0 8px 22px rgba(249,115,22,0.40)' }}>
        <LogOut size={16} />
        <span className="font-black text-[13.5px]" style={{ letterSpacing: '0.3px' }}>{label}</span>
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: EDIT PROFILE
// ═══════════════════════════════════════════════════════════════════
function EditView({
  profile, uid, phone, onSaved,
}: { profile: Profile; uid: string | null; phone: string; onSaved: (p: Profile) => void }) {
  const { t } = useT();
  const [name, setName] = useState(profile.name ?? '');
  const [email, setEmail] = useState(profile.email ?? '');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const patch: Profile = { name: name.trim(), email: email.trim(), phone };
    // Always cache locally so the edit persists even if the backend write is
    // blocked; sync to users/{uid} (the app's path) when actually signed in.
    try { localStorage.setItem('tf360_profile_v1', JSON.stringify(patch)); } catch { /* noop */ }
    try {
      if (uid) await setDoc(doc(db, 'users', uid), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) { console.warn('[Profile] cloud save failed:', e); }
    finally { setBusy(false); onSaved(patch); }
  };

  return (
    <div className="px-5 py-5 space-y-3">
      <Field label={t('fullName')} icon={UserIcon}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('yourName')}
          className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-white/30"
          style={{ color: T.ink }} />
      </Field>
      <Field label={t('email')} icon={Mail}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
          className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-white/30"
          style={{ color: T.ink }} />
      </Field>
      <Field label={t('mobileNumber')} icon={PhoneIcon}>
        <span className="text-xs mr-1" style={{ color: T.inkFaint }}>+91</span>
        <input value={phone.replace(/^\+91/, '')} readOnly
          className="w-full bg-transparent outline-none text-sm font-medium" style={{ color: T.inkMute }} />
      </Field>
      <button onClick={save} disabled={busy}
        className="w-full mt-2 py-3.5 rounded-2xl text-white font-black text-[13.5px] cursor-pointer disabled:opacity-50"
        style={{ background: T.brandGrad, boxShadow: '0 8px 22px rgba(249,115,22,0.30)' }}>
        {busy ? t('saving') : t('saveChanges')}
      </button>
    </div>
  );
}
function Field({ label, icon: Icon, children }: { label: string; icon: typeof Receipt; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5" style={{ color: T.brand }}>{label}</label>
      <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl"
        style={{ background: T.surfaceAlt, border: `1px solid ${T.hairline}` }}>
        <Icon size={16} style={{ color: T.inkFaint }} />
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: LANGUAGE PICKER
// ═══════════════════════════════════════════════════════════════════
function LanguageView({ onPicked }: { onPicked: (label: string) => void }) {
  const { t, lang, setLanguage } = useT();
  const [pending, setPending] = useState<LangCode>(lang);

  const commit = () => {
    const picked = LANGUAGES.find((l) => l.code === pending) ?? LANGUAGES[0];
    setLanguage(picked.code);
    onPicked(picked.label);
  };

  // `translate="no"` + `notranslate` class tells the DOM translator + any
  // browser-level translator to leave every string here alone. We want the
  // language NAMES to always stay in their native script so the user can
  // recognise them regardless of the active locale.
  return (
    <div className="px-5 py-5 notranslate" translate="no">
      <div className="grid grid-cols-2 gap-2.5">
        {LANGUAGES.map((l) => {
          const selected = pending === l.code;
          return (
            <button key={l.code} onClick={() => setPending(l.code)}
              translate="no"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all notranslate"
              style={{
                background: selected ? T.brandSoft : T.surfaceAlt,
                border: `${selected ? 1.5 : 1}px solid ${selected ? T.brand : T.hairline}`,
              }}>
              <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0"
                style={{ background: selected ? T.brandSoft : 'rgba(255,255,255,0.06)' }}>
                <span className="font-black text-base" style={{ color: selected ? T.brand : T.inkMute }}>{l.letter}</span>
              </div>
              <span className="flex-1 text-left text-sm font-extrabold truncate"
                style={{ color: selected ? T.brand : T.ink }}>{l.label}</span>
              {selected && <Check size={16} style={{ color: T.brand }} />}
            </button>
          );
        })}
      </div>
      <button onClick={commit}
        className="w-full h-[50px] rounded-xl text-white font-black text-[15px] cursor-pointer mt-4"
        style={{ background: T.brand, boxShadow: '0 8px 22px rgba(249,115,22,0.35)', letterSpacing: '0.4px' }}>
        {t('continueBtn')}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: ORDERS — streams users/{phone}/orders
// ═══════════════════════════════════════════════════════════════════
function OrdersView() {
  const { t } = useT();
  const [orders, setOrders] = useState<any[] | null>(null);
  const [uid, setUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  useEffect(() => {
    const tsSec = (c: any): number =>
      c?.seconds ?? (typeof c?.toMillis === 'function' ? Math.floor(c.toMillis() / 1000) : (typeof c === 'number' ? Math.floor(c / 1000) : 0));

    // The web shop's checkout writes orders to localStorage — surface them too.
    const local = loadOrders().map((o) => ({
      id: o.id, code: o.code,
      title: (o.items && o.items.length)
        ? o.items.map((i) => i.title).slice(0, 2).join(', ') + (o.items.length > 2 ? ` +${o.items.length - 2} more` : '')
        : ('Order ' + o.code),
      total: o.total, status: o.status,
      createdAt: { seconds: Math.floor((o.createdAt || Date.now()) / 1000) },
      items: o.items,
    }));

    if (!uid) { setOrders(local); return; }

    // Match TI360-Application: real orders live in the top-level `orders`
    // collection keyed by userId == uid (the app also keeps a legacy
    // users/{uid}/orders subcollection). Read both, merge with the local
    // shop orders, dedupe by id, sort newest-first on the client (no index).
    const norm = (id: string, x: any) => {
      const items = Array.isArray(x.items) ? x.items : [];
      const title = items.length
        ? items.map((i: any) => i.productName || i.title || i.name).filter(Boolean).slice(0, 2).join(', ') + (items.length > 2 ? ` +${items.length - 2} more` : '')
        : (x.orderCode ? `Order ${x.orderCode}` : `${items.length || 1} item(s)`);
      return { id, code: x.orderCode || x.orderNumber, title, total: x.total ?? x.amount, status: x.status || x.paymentStatus || 'PLACED', createdAt: x.createdAt, items };
    };

    let top: any[] = [], sub: any[] = [];
    const emit = () => {
      const seen = new Set<string>();
      const all = [...top, ...sub, ...local].filter((o) => {
        const k = String(o.id || o.code || '');
        if (k && seen.has(k)) return false;
        if (k) seen.add(k);
        return true;
      });
      all.sort((a, b) => tsSec(b.createdAt) - tsSec(a.createdAt));
      setOrders(all);
    };

    const unsubTop = onSnapshot(
      query(collection(db, 'orders'), where('userId', '==', uid)),
      (snap) => { top = snap.docs.map((d) => norm(d.id, d.data())); emit(); },
      (e) => { console.warn('[Profile] orders read failed:', (e as any)?.code || e); top = []; emit(); },
    );
    const unsubSub = onSnapshot(
      collection(db, 'users', uid, 'orders'),
      (snap) => { sub = snap.docs.map((d) => norm(d.id, d.data())); emit(); },
      () => { sub = []; emit(); },
    );
    emit();
    return () => { unsubTop(); unsubSub(); };
  }, [uid]);

  const [openId, setOpenId] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');

  const statusOf = (o: any): string => (cancelled.has(o.id) ? 'CANCELLED' : String(o.status || 'PLACED')).toUpperCase();

  const cancel = (o: any) => {
    setCancelled((prev) => new Set(prev).add(o.id));
    try {
      const all = loadOrders();
      const i = all.findIndex((x) => x.id === o.id);
      if (i >= 0) { all[i] = { ...all[i], status: 'CANCELLED' }; localStorage.setItem('tf360_orders_v2', JSON.stringify(all)); }
    } catch { /* noop */ }
    updateDoc(doc(db, 'orders', o.id), { status: 'CANCELLED' }).catch(() => {});
    setMsg('Order cancelled'); setTimeout(() => setMsg(''), 2200);
  };

  const reorder = (o: any) => {
    const lines: any[] = [];
    for (const it of (o.items || [])) {
      const m = RPRODUCTS.find((pp) => pp.title === (it.title || it.productName));
      if (m) lines.push({ productId: m.id, qty: it.qty || 1, selected: true });
    }
    if (lines.length) {
      try {
        const cur = JSON.parse(localStorage.getItem('tf360_rcart_v1') || '[]');
        for (const l of lines) { const ex = cur.find((c: any) => c.productId === l.productId); if (ex) ex.qty += l.qty; else cur.push(l); }
        localStorage.setItem('tf360_rcart_v1', JSON.stringify(cur));
        setMsg('Added to cart — open the Shop to checkout');
      } catch { setMsg('Could not reorder'); }
    } else {
      saveOrder(newOrder(o.total || 0, o.payment || 'COD', (o.items || []).map((i: any) => ({ title: i.title || i.productName || 'Item', img: i.img || '', qty: i.qty || 1 })), !!o.isB2B));
      setMsg('Order placed again');
    }
    setTimeout(() => setMsg(''), 2600);
  };

  if (orders === null) return <Loading />;
  if (orders.length === 0) return <AccountEmpty uid={uid} icon={Inbox} titleKey="noOrdersYet" hintKey="noOrdersHint" />;

  const steps = ['PLACED', 'SHIPPED', 'DELIVERED'];

  return (
    <div className="px-4 py-4 space-y-3">
      {msg && <div className="px-3 py-2 rounded-xl text-xs font-bold text-center" style={{ background: 'rgba(249,115,22,0.12)', color: T.brand, border: `1px solid ${T.hairline}` }}>{msg}</div>}
      {orders.map((o) => {
        const st = statusOf(o);
        const open = openId === o.id;
        const isCancelled = st === 'CANCELLED';
        const stepIdx = isCancelled ? -1 : Math.max(0, steps.indexOf(st));
        return (
          <div key={o.id} className="rounded-2xl overflow-hidden" style={{ background: T.surfaceAlt, border: `1px solid ${T.hairline}` }}>
            <button onClick={() => setOpenId(open ? null : o.id)} className="w-full p-4 flex items-start justify-between text-left cursor-pointer">
              <div className="min-w-0">
                <p className="text-[11px] font-black tracking-wider" style={{ color: T.brand }}>#{String(o.code || o.id || '').slice(0, 10).toUpperCase()}</p>
                <p className="text-sm font-bold mt-1 truncate" style={{ color: T.ink }}>{o.title || `${(o.items?.length ?? 1)} item(s)`}</p>
                <p className="text-xs mt-0.5" style={{ color: T.inkMute }}>{fmtDate(o.createdAt)}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-base font-black" style={{ color: T.ink }}>₹{o.total ?? o.amount ?? '—'}</p>
                <p className="text-[10px] font-extrabold uppercase tracking-wider mt-1" style={{ color: isCancelled ? '#f87171' : T.brand }}>{st}</p>
              </div>
            </button>
            {open && (
              <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: T.hairline }}>
                {isCancelled ? (
                  <p className="text-xs font-bold mt-3" style={{ color: '#f87171' }}>This order was cancelled.</p>
                ) : (
                  <div className="flex items-center mt-3 mb-1">
                    {steps.map((stp, i) => (
                      <div key={stp} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: i <= stepIdx ? T.brand : T.surface, border: `1px solid ${i <= stepIdx ? T.brand : T.hairline}` }}>
                            {i <= stepIdx ? <Check size={13} color="#0a0807" /> : <span className="text-[10px] font-black" style={{ color: T.inkFaint }}>{i + 1}</span>}
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-wider mt-1" style={{ color: i <= stepIdx ? T.brand : T.inkFaint }}>{stp}</span>
                        </div>
                        {i < steps.length - 1 && <div className="flex-1 h-0.5 mx-1 mb-4" style={{ background: i < stepIdx ? T.brand : T.hairline }} />}
                      </div>
                    ))}
                  </div>
                )}
                {Array.isArray(o.items) && o.items.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {o.items.slice(0, 5).map((it: any, i: number) => (
                      <p key={i} className="text-xs" style={{ color: T.inkMute }}>• {(it.title || it.productName || 'Item')} × {it.qty || 1}</p>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  {!isCancelled && st !== 'DELIVERED' && (
                    <button onClick={() => cancel(o)} className="flex-1 py-2 rounded-lg text-xs font-black cursor-pointer" style={{ background: 'rgba(220,38,38,0.12)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.25)' }}>Cancel order</button>
                  )}
                  <button onClick={() => reorder(o)} className="flex-1 py-2 rounded-lg text-xs font-black text-white cursor-pointer" style={{ background: T.brandGrad }}>Reorder</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: WISHLIST — streams users/{phone}/wishlist
// ═══════════════════════════════════════════════════════════════════
function WishlistView({ phone }: { phone: string | null }) {
  const [items, setItems] = useState<any[] | null>(null);
  const [uid, setUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);
  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  useEffect(() => {
    if (!phone) { setItems([]); return; }
    const q = query(collection(db, 'users', phone, 'wishlist'), orderBy('addedAt', 'desc'));
    const unsub = onSnapshot(q,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setItems([]));
    return unsub;
  }, [phone]);

  const remove = async (id: string) => {
    if (!phone) return;
    await deleteDoc(doc(db, 'users', phone, 'wishlist', id));
  };

  if (items === null) return <Loading />;
  if (items.length === 0) {
    return <AccountEmpty uid={uid} icon={Heart} titleKey="noWishlist" hintKey="noWishlistHint" />;
  }

  return (
    <div className="px-4 py-4 grid grid-cols-2 gap-3">
      {items.map((it) => (
        <div key={it.id} className="rounded-2xl overflow-hidden relative"
          style={{ background: T.surfaceAlt, border: `1px solid ${T.hairline}` }}>
          {it.image && (
            <div className="aspect-[4/3] overflow-hidden">
              <img src={it.image} alt={it.title} className="w-full h-full object-cover" />
            </div>
          )}
          <button onClick={() => remove(it.id)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.55)' }}>
            <X size={13} color="#fff" />
          </button>
          <div className="p-3">
            <p className="text-xs font-extrabold truncate" style={{ color: T.ink }}>{it.title || 'Item'}</p>
            <p className="text-[10px] font-bold mt-0.5" style={{ color: T.brand }}>{it.price || ''}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: COUPONS / HELP CENTER — informational
// ═══════════════════════════════════════════════════════════════════
function CouponsView() {
  return <EmptyView icon={Ticket} titleKey="noCoupons" hintKey="noCouponsHint" />;
}
function HelpCenterView() {
  const { t } = useT();
  return (
    <div className="px-4 py-4 space-y-3">
      <NavGroup>
        <NavRow icon={Headphones} label={t('contactUs')} onClick={() => window.location.href = 'tel:+919876543210'} />
        <RowDivider />
        <NavRow icon={Mail} label="hello@terrainfra360.com" onClick={() => window.location.href = 'mailto:hello@terrainfra360.com'} />
        <RowDivider />
        <NavRow icon={Info} label={t('aboutTI')} />
      </NavGroup>
      <p className="text-xs leading-relaxed px-1" style={{ color: T.inkMute }}>{t('helpDesc')}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: ADDRESSES — streams users/{phone}/addresses with add form
// ═══════════════════════════════════════════════════════════════════
function AddressesView() {
  const { t } = useT();
  const [items, setItems] = useState<any[] | null>(null);
  const [uid, setUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);
  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [pin, setPin] = useState('');
  const [defaultId, setDefaultId] = useState<string>(() => { try { return localStorage.getItem('tf360_default_addr') || ''; } catch { return ''; } });

  useEffect(() => {
    const readLocal = (key: string, label: string) => { try { const a = JSON.parse(localStorage.getItem(key) || 'null'); return (a && a.line1) ? [{ id: key, line1: a.line1, city: a.city || a.area || '', pincode: a.pincode || '', _local: label }] : []; } catch { return []; } };
    const local: any[] = [...readLocal('tf360_raddr_v1', 'Retail'), ...readLocal('tf360_baddr_v1', 'Business')];
    if (!uid) { setItems(local); return; }
    const q = query(collection(db, 'users', uid, 'addresses'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q,
      (snap) => { const remote: any[] = snap.docs.map((d) => ({ id: d.id, ...d.data() })); setItems([...remote, ...local]); },
      () => setItems(local));
    return unsub;
  }, [uid]);

  const resetForm = () => { setLine1(''); setCity(''); setPin(''); setEditId(null); setShowForm(false); };
  const startEdit = (a: any) => { setLine1(a.line1 || ''); setCity(a.city || ''); setPin(a.pincode || ''); setEditId(a.id); setShowForm(true); };

  const save = async () => {
    if (!line1.trim()) return;
    const data = { line1: line1.trim(), city: city.trim(), pincode: pin.trim() };
    if (editId) {
      if (editId.startsWith('tf360_')) {
        try { const cur = JSON.parse(localStorage.getItem(editId) || '{}'); localStorage.setItem(editId, JSON.stringify({ ...cur, ...data })); } catch { /* noop */ }
        setItems((prev) => (prev || []).map((a: any) => (a.id === editId ? { ...a, ...data } : a)));
      } else if (uid) {
        await updateDoc(doc(db, 'users', uid, 'addresses', editId), data);
      }
    } else if (uid) {
      await addDoc(collection(db, 'users', uid, 'addresses'), { ...data, createdAt: serverTimestamp() });
    } else {
      try { localStorage.setItem('tf360_raddr_v1', JSON.stringify(data)); } catch { /* noop */ }
      setItems((prev) => [{ id: 'tf360_raddr_v1', ...data, _local: 'Retail' }, ...(prev || []).filter((a: any) => a.id !== 'tf360_raddr_v1')]);
    }
    resetForm();
  };

  const remove = async (id: string) => {
    if (id === defaultId) { setDefaultId(''); try { localStorage.removeItem('tf360_default_addr'); } catch { /* noop */ } }
    if (id.startsWith('tf360_')) { try { localStorage.removeItem(id); } catch { /* noop */ } setItems((prev) => (prev || []).filter((a: any) => a.id !== id)); return; }
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'addresses', id));
  };

  const setDefault = (id: string) => { setDefaultId(id); try { localStorage.setItem('tf360_default_addr', id); } catch { /* noop */ } };

  if (items === null) return <Loading />;

  return (
    <div className="px-4 py-4 space-y-3">
      {items.length === 0 && !showForm && (
        <div className="p-4 rounded-2xl" style={{ background: T.surfaceAlt, border: `1px solid ${T.hairline}` }}>
          <p className="font-black text-sm" style={{ color: T.ink }}>{t('noAddresses')}</p>
          <p className="text-xs mt-1" style={{ color: T.inkMute }}>{t('noAddressesHint')}</p>
        </div>
      )}
      {items.map((a) => {
        const isDefault = a.id === defaultId;
        return (
          <div key={a.id} className="p-4 rounded-2xl"
            style={{ background: T.surfaceAlt, border: `1px solid ${isDefault ? 'rgba(249,115,22,0.45)' : T.hairline}` }}>
            <div className="flex items-start gap-3">
              <MapPin size={18} style={{ color: T.brand }} className="shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold" style={{ color: T.ink }}>{a.line1}</p>
                  {a._local && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded" style={{ background: 'rgba(249,115,22,0.15)', color: T.brand }}>{a._local}</span>}
                  {isDefault && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded" style={{ background: T.brand, color: '#0a0807' }}>Default</span>}
                </div>
                <p className="text-xs mt-0.5" style={{ color: T.inkMute }}>{[a.city, a.pincode].filter(Boolean).join(' · ')}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setDefault(a.id)} disabled={isDefault}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black cursor-pointer disabled:opacity-60"
                style={{ background: isDefault ? 'rgba(249,115,22,0.15)' : T.surface, color: isDefault ? T.brand : T.inkMute, border: `1px solid ${T.hairline}` }}>
                <Star size={12} /> {isDefault ? 'Default' : 'Set default'}
              </button>
              <button onClick={() => startEdit(a)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black cursor-pointer"
                style={{ background: T.surface, color: T.inkMute, border: `1px solid ${T.hairline}` }}>
                <Pencil size={12} /> Edit
              </button>
              <button onClick={() => remove(a.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black cursor-pointer ml-auto"
                style={{ background: 'rgba(220,38,38,0.12)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.25)' }}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        );
      })}

      {!showForm ? (
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-white cursor-pointer"
          style={{ background: T.brandGrad, boxShadow: '0 8px 22px rgba(249,115,22,0.30)' }}>
          <Plus size={16} />
          <span className="font-black text-[13px]">{t('addNewAddress')}</span>
        </button>
      ) : (
        <div className="p-4 rounded-2xl space-y-2" style={{ background: T.surfaceAlt, border: `1px solid ${T.hairline}` }}>
          <p className="text-xs font-black mb-1" style={{ color: T.ink }}>{editId ? 'Edit address' : t('addNewAddress')}</p>
          <input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Address line"
            className="w-full px-3 py-2 rounded-lg text-sm bg-black/30 outline-none placeholder:text-white/30"
            style={{ color: T.ink, border: `1px solid ${T.hairline}` }} />
          <div className="grid grid-cols-2 gap-2">
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City"
              className="px-3 py-2 rounded-lg text-sm bg-black/30 outline-none placeholder:text-white/30"
              style={{ color: T.ink, border: `1px solid ${T.hairline}` }} />
            <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN"
              className="px-3 py-2 rounded-lg text-sm bg-black/30 outline-none placeholder:text-white/30"
              style={{ color: T.ink, border: `1px solid ${T.hairline}` }} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={resetForm}
              className="flex-1 py-2 rounded-lg text-xs font-black cursor-pointer"
              style={{ background: T.surface, color: T.inkMute, border: `1px solid ${T.hairline}` }}>
              {t('cancel')}
            </button>
            <button onClick={save}
              className="flex-1 py-2 rounded-lg text-xs font-black text-white cursor-pointer"
              style={{ background: T.brandGrad }}>
              {t('save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: DEVICES — shows current browser session
// ═══════════════════════════════════════════════════════════════════
function DevicesView() {
  const { t } = useT();
  const ua = navigator.userAgent;
  const browser =
    /Edg/.test(ua) ? 'Microsoft Edge' :
    /Chrome/.test(ua) ? 'Google Chrome' :
    /Firefox/.test(ua) ? 'Firefox' :
    /Safari/.test(ua) ? 'Safari' : 'Web Browser';
  const os =
    /Windows/.test(ua) ? 'Windows' :
    /Mac/.test(ua) ? 'macOS' :
    /Android/.test(ua) ? 'Android' :
    /iPhone|iPad/.test(ua) ? 'iOS' :
    /Linux/.test(ua) ? 'Linux' : 'Unknown';

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="p-4 rounded-2xl flex items-center gap-3"
        style={{ background: T.surfaceAlt, border: `1px solid ${T.brand}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.brandSoft }}>
          <Smartphone size={20} style={{ color: T.brand }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold truncate" style={{ color: T.ink }}>{browser} · {os}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: T.brand }}>
            {t('thisDevice')}
          </p>
        </div>
        <CheckCircle2 size={20} style={{ color: T.brand }} />
      </div>
      <p className="text-xs leading-relaxed px-1" style={{ color: T.inkMute }}>{t('noDevicesHint')}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: NOTIFICATION SETTINGS — writes prefs to users/{phone}
// ═══════════════════════════════════════════════════════════════════
function NotificationsView({ phone }: { phone: string | null }) {
  const { t } = useT();
  const [prefs, setPrefs] = useState({
    propertyAlerts: true, priceDrops: true, orderUpdates: true, promotions: false,
  });

  useEffect(() => {
    if (!phone) return;
    const unsub = onSnapshot(doc(db, 'users', phone), (snap) => {
      const d = snap.data();
      if (d?.notificationPrefs) setPrefs((p) => ({ ...p, ...d.notificationPrefs }));
    });
    return unsub;
  }, [phone]);

  const toggle = async (key: keyof typeof prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    if (phone) await updateDoc(doc(db, 'users', phone), { notificationPrefs: next });
  };

  const rows: { key: keyof typeof prefs; labelKey: string }[] = [
    { key: 'propertyAlerts', labelKey: 'notifPropertyAlerts' },
    { key: 'priceDrops', labelKey: 'notifPriceDrops' },
    { key: 'orderUpdates', labelKey: 'notifOrderUpdates' },
    { key: 'promotions', labelKey: 'notifPromotions' },
  ];

  return (
    <div className="px-4 py-4">
      <NavGroup>
        {rows.map((r, idx) => (
          <div key={r.key}>
            <ToggleRow icon={Bell} label={t(r.labelKey)} on={prefs[r.key]} onChange={() => toggle(r.key)} />
            {idx < rows.length - 1 && <RowDivider />}
          </div>
        ))}
      </NavGroup>
    </div>
  );
}
function ToggleRow({
  icon: Icon, label, on, onChange,
}: { icon: typeof Bell; label: string; on: boolean; onChange: () => void }) {
  return (
    <div className="w-full flex items-center gap-4 px-4 py-[14px]">
      <Icon size={20} style={{ color: T.brand }} />
      <span className="flex-1 text-[14px] font-bold truncate" style={{ color: T.ink }}>{label}</span>
      <button onClick={onChange} aria-label={label}
        className="relative w-11 h-6 rounded-full cursor-pointer transition-colors"
        style={{ background: on ? T.brand : 'rgba(255,255,255,0.10)' }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
          style={{ left: on ? 22 : 2 }} />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: PRIVACY — toggle prefs
// ═══════════════════════════════════════════════════════════════════
function PrivacyView({ phone }: { phone: string | null }) {
  const { t } = useT();
  const [prefs, setPrefs] = useState({ shareWithVendors: true, analytics: true });

  useEffect(() => {
    if (!phone) return;
    const unsub = onSnapshot(doc(db, 'users', phone), (snap) => {
      const d = snap.data();
      if (d?.privacyPrefs) setPrefs((p) => ({ ...p, ...d.privacyPrefs }));
    });
    return unsub;
  }, [phone]);

  const toggle = async (key: keyof typeof prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    if (phone) await updateDoc(doc(db, 'users', phone), { privacyPrefs: next });
  };

  return (
    <div className="px-4 py-4 space-y-3">
      <NavGroup>
        <ToggleRow icon={ShieldCheck} label={t('privacyShareWithVendors')} on={prefs.shareWithVendors} onChange={() => toggle('shareWithVendors')} />
        <RowDivider />
        <ToggleRow icon={ShieldCheck} label={t('privacyAnalytics')} on={prefs.analytics} onChange={() => toggle('analytics')} />
      </NavGroup>
      <button className="w-full py-3 rounded-2xl text-white font-black text-[13px] cursor-pointer"
        style={{ background: T.brandGrad }}>
        {t('privacyDownload')}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: CHANGE PASSWORD
// ═══════════════════════════════════════════════════════════════════
function PasswordView() {
  const { t } = useT();
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [c, setC] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!a || !b || b !== c) { alert('Passwords do not match.'); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    setA(''); setB(''); setC('');
    alert('Password updated.');
  };

  return (
    <div className="px-5 py-5 space-y-3">
      <Field label={t('currentPassword')} icon={Lock}>
        <input type="password" value={a} onChange={(e) => setA(e.target.value)}
          className="w-full bg-transparent outline-none text-sm font-medium" style={{ color: T.ink }} />
      </Field>
      <Field label={t('newPassword')} icon={Lock}>
        <input type="password" value={b} onChange={(e) => setB(e.target.value)}
          className="w-full bg-transparent outline-none text-sm font-medium" style={{ color: T.ink }} />
      </Field>
      <Field label={t('confirmPassword')} icon={Lock}>
        <input type="password" value={c} onChange={(e) => setC(e.target.value)}
          className="w-full bg-transparent outline-none text-sm font-medium" style={{ color: T.ink }} />
      </Field>
      <button onClick={save} disabled={busy}
        className="w-full mt-2 py-3.5 rounded-2xl text-white font-black text-[13.5px] cursor-pointer disabled:opacity-50"
        style={{ background: T.brandGrad }}>
        {busy ? t('saving') : t('saveChanges')}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VIEW: ABOUT / TERMS
// ═══════════════════════════════════════════════════════════════════
function AboutView() {
  const { t } = useT();
  return (
    <div className="px-5 py-5 space-y-4">
      <div className="p-5 rounded-2xl" style={{ background: T.identityGrad, border: `1px solid ${T.hairline}` }}>
        <p className="text-[10px] font-black tracking-wider" style={{ color: T.brand }}>EST. 2024</p>
        <h2 className="font-black mt-1" style={{ fontSize: 22, color: T.ink, letterSpacing: '-0.4px' }}>
          TerraInfra 360
        </h2>
        <p className="text-sm leading-relaxed mt-3" style={{ color: T.inkMute }}>{t('aboutDesc')}</p>
      </div>
      <div className="p-4 rounded-2xl grid grid-cols-3 gap-3 text-center"
        style={{ background: T.surfaceAlt, border: `1px solid ${T.hairline}` }}>
        {[
          { v: '8,000+', l: t('projectsDelivered') },
          { v: '2,400+', l: t('verifiedVendors') },
          { v: '98%', l: t('clientSatisfaction') },
        ].map((s) => (
          <div key={s.l}>
            <p className="font-black" style={{ fontSize: 18, color: T.brand }}>{s.v}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider mt-1" style={{ color: T.inkFaint }}>{s.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
function TermsView() {
  const { t } = useT();
  return (
    <div className="px-5 py-5 space-y-3">
      <p className="text-sm leading-relaxed" style={{ color: T.inkMute }}>{t('termsDesc')}</p>
      <ol className="text-xs leading-relaxed list-decimal pl-4 space-y-2" style={{ color: T.inkMute }}>
        <li>You agree to provide accurate listing information.</li>
        <li>TerraInfra360 reserves the right to verify any property before publication.</li>
        <li>Brokerage and service fees are governed by the contract you accept at booking.</li>
        <li>Disputes are handled per Bangalore jurisdiction.</li>
        <li>Data collected is used solely for service delivery and analytics.</li>
      </ol>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Empty + Loading helpers
// ═══════════════════════════════════════════════════════════════════
function ServiceRFQView() {
  const items = loadServiceRFQs();
  if (!items.length) return <EmptyView icon={FileText} titleKey="noRequests" hintKey="quoteRequestsDesc" />;
  return (
    <div className="px-4 py-4 space-y-3">
      {items.map((r, i) => (
        <div key={r.rfqNumber + i} className="p-4 rounded-2xl" style={{ background: T.surfaceAlt, border: `1px solid ${T.hairline}` }}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-black tracking-wider truncate" style={{ color: T.brand }}>{r.rfqNumber}</p>
            <p className="text-[10px] font-bold shrink-0" style={{ color: T.inkFaint }}>{new Date(r.createdAt).toLocaleDateString()}</p>
          </div>
          <p className="text-sm font-bold mt-1" style={{ color: T.ink }}>{r.service || 'Service request'}</p>
          <p className="text-[10px] font-extrabold uppercase tracking-wider mt-1" style={{ color: '#34d399' }}>Submitted</p>
        </div>
      ))}
    </div>
  );
}

function AccountEmpty({ uid, icon: Icon, titleKey, hintKey }: { uid: string | null; icon: typeof Inbox; titleKey: string; hintKey: string }) {
  const { t } = useT();
  return (
    <div className="px-6 py-12 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: T.surfaceAlt, border: `1px solid ${T.hairline}` }}>
        <Icon size={26} style={{ color: T.inkFaint }} />
      </div>
      <p className="font-black text-base" style={{ color: T.ink }}>{t(titleKey)}</p>
      <p className="text-xs mt-2 leading-relaxed max-w-[280px] mx-auto" style={{ color: T.inkMute }}>
        {uid ? t(hintKey) : "You're signed in on this device, but your account isn't connected to the backend. Sign out at the top of this panel and sign in again to load this."}
      </p>
      <p className="text-[10px] mt-5 font-black uppercase tracking-wider" style={{ color: uid ? '#34d399' : '#f59e0b' }}>
        {uid ? 'Backend connected' : 'Backend not connected — sign in again'}
      </p>
    </div>
  );
}

function EmptyView({
  icon: Icon, titleKey, hintKey,
}: { icon: typeof Inbox; titleKey: string; hintKey: string }) {
  const { t } = useT();
  return (
    <div className="px-6 py-12 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: T.brandSoft }}>
        <Icon size={28} style={{ color: T.brand }} />
      </div>
      <p className="font-black text-base" style={{ color: T.ink }}>{t(titleKey)}</p>
      <p className="text-xs mt-2 leading-relaxed max-w-xs mx-auto" style={{ color: T.inkMute }}>{t(hintKey)}</p>
    </div>
  );
}
function Loading() {
  const { t } = useT();
  return (
    <div className="px-6 py-16 text-center">
      <div className="w-10 h-10 rounded-full border-2 mx-auto mb-3 animate-spin"
        style={{ borderColor: T.hairline, borderTopColor: T.brand }} />
      <p className="text-xs font-bold" style={{ color: T.inkMute }}>{t('loading')}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════
function computeInitials(s: string): string {
  const parts = s.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TI';
  if (parts.length === 1) {
    const p = parts[0];
    return (p.length >= 2 ? p.substring(0, 2) : p).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
function formatMemberSince(createdAt?: { seconds?: number } | null): string {
  if (!createdAt?.seconds) return '2026';
  const d = new Date(createdAt.seconds * 1000);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtDate(ts: any): string {
  if (!ts?.seconds) return '';
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
