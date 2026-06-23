/**
 * PropertyDetailPage — full-page listing detail.
 *
 * Layout (top → bottom):
 *   • Sticky back header with Share + Heart actions
 *   • Hero gallery (swipeable, page dots, image counter, Sale/Rent pill, Verified chip)
 *   • Title + price block
 *   • Quick facts strip (ownership, area, posted, intent)
 *   • Info cards: About, Property details, Price details, Why TerraInfra360
 *   • Contact card with side-by-side Call + WhatsApp buttons
 */
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Phone,
  Share2,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  Home,
  Users,
  CalendarClock,
  IndianRupee,
  CheckCircle2,
  X,
} from 'lucide-react';
import { PropTheme, brandGlow, formatINR } from '../propertyTheme';
import type { PropertyModel } from '../types';

interface Props {
  property: PropertyModel;
  isShortlisted: boolean;
  onToggleShortlist: () => void;
  onBack: () => void;
}

const WHATSAPP_GREEN = '#25D366';
const MAX_IMAGES = 20;

const intentLabel = (p: PropertyModel) =>
  p.listingPurpose === 'sale' ? 'For Sale' : p.listingPurpose === 'rent' ? 'For Rent' : 'For Lease';

const intentBg = (p: PropertyModel) =>
  p.listingPurpose === 'rent'
    ? '#3B82F6'
    : p.listingPurpose === 'lease'
      ? '#8B5CF6'
      : PropTheme.brand;

export function PropertyDetailPage({
  property,
  isShortlisted,
  onToggleShortlist,
  onBack,
}: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const [pulsing, setPulsing] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const images = property.imageUrls.slice(0, MAX_IMAGES);
  const hasImages = images.length > 0;
  const verified = property.approvalStatus === 'approved';

  // ── Actions ───────────────────────────────────────────────────────────────
  const heart = () => {
    setPulsing(true);
    setTimeout(() => setPulsing(false), 420);
    onToggleShortlist();
  };

  const share = async () => {
    const url = window.location.href;
    const text = `${property.propertySubType} in ${property.areaName} — ${formatINR(property.finalPrice)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: text, text, url });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert('Link copied to clipboard');
      } catch { /* noop */ }
    }
  };

  // Cleanish phone number for tel: / wa.me URLs.
  const cleanPhone = property.postedByUserId.replace(/[^\d+]/g, '');
  const phoneHref = cleanPhone ? `tel:${cleanPhone}` : undefined;
  const waHref = cleanPhone
    ? `https://wa.me/${cleanPhone.replace(/^\+/, '')}?text=${encodeURIComponent(
        `Hi, I'm interested in ${property.propertySubType} listed on TerraInfra360.`,
      )}`
    : undefined;

  // Slide gallery via arrow keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setActiveImage((i) => Math.min(images.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setActiveImage((i) => Math.max(0, i - 1));
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onBack]);

  // Scroll the active image into view.
  useEffect(() => {
    galleryRef.current?.scrollTo({ left: activeImage * galleryRef.current.clientWidth, behavior: 'smooth' });
  }, [activeImage]);

  return (
    <div className="min-h-screen" style={{ background: PropTheme.scaffold }}>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-30 backdrop-blur-xl border-b px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(250,250,247,0.9)' }}
        style={{ borderColor: PropTheme.border }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black tracking-widest uppercase"
          style={{ borderColor: PropTheme.borderStrong, color: PropTheme.textPrimary }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={share} aria-label="Share" className="p-2 rounded-full border" style={{ borderColor: PropTheme.borderStrong }}>
            <Share2 size={16} />
          </button>
          <motion.button
            onClick={heart}
            animate={pulsing ? { scale: [1, 1.35, 1] } : { scale: 1 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            aria-label="Shortlist"
            className="p-2 rounded-full border"
            style={{ borderColor: PropTheme.borderStrong }}
          >
            <Heart
              size={16}
              className={isShortlisted ? 'text-red-500 fill-red-500' : 'text-gray-500'}
            />
          </motion.button>
        </div>
      </div>

      {/* ── TOP SECTION: gallery LEFT, info RIGHT (Magicbricks / NoBroker style) ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
          {/* LEFT: Image gallery */}
          <SideGallery
            images={images}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
            intent={intentLabel(property)}
            intentBg={intentBg(property)}
            verified={property.approvalStatus === 'approved'}
          />

          {/* RIGHT: Title + price + quick info + concierge */}
          <div
            className="flex flex-col gap-5 p-7"
            style={{
              background: PropTheme.surface,
              border: `1px solid ${PropTheme.border}`,
            }}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-6" style={{ background: PropTheme.brand }} />
                <span
                  className="text-[10px] font-medium uppercase tracking-[0.35em]"
                  style={{ color: PropTheme.brand }}
                >
                  {intentLabel(property)}
                </span>
                <span className="text-white/25 text-[10px]">·</span>
                <span
                  className="text-[10px] font-medium uppercase tracking-[0.25em]"
                  style={{ color: PropTheme.textMuted }}
                >
                  {property.propertyCategory}
                </span>
              </div>
              <h1
                className="leading-[1.02] mb-3"
                style={{
                  fontFamily: PropTheme.fontDisplay,
                  fontWeight: 600,
                  fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                  color: PropTheme.ink,
                  letterSpacing: '-1px',
                }}
              >
                {property.propertySubType || 'Untitled Residence'}
              </h1>
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: PropTheme.textSecondary }}
              >
                <MapPin size={14} style={{ color: PropTheme.brand }} />
                <span>
                  {property.areaName || property.pincode || 'Location not added'}
                </span>
              </div>
            </div>

            <div className="h-px" style={{ background: PropTheme.hairline }} />

            {/* Price block */}
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.35em] mb-2"
                style={{ color: PropTheme.textMuted }}
              >
                Asking Price
              </p>
              <p
                className="leading-none"
                style={{
                  fontFamily: PropTheme.fontDisplay,
                  fontWeight: 700,
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  color: PropTheme.brand,
                  letterSpacing: '-0.5px',
                }}
              >
                {formatINR(property.finalPrice)}
                {property.priceUnit === 'perAcre' && (
                  <span
                    className="text-sm ml-2"
                    style={{ color: PropTheme.textMuted, fontFamily: PropTheme.fontSans }}
                  >
                    / acre
                  </span>
                )}
                {property.priceUnit === 'perSqFt' && (
                  <span
                    className="text-sm ml-2"
                    style={{ color: PropTheme.textMuted, fontFamily: PropTheme.fontSans }}
                  >
                    / sqft
                  </span>
                )}
              </p>
            </div>

            {/* Quick facts row */}
            <div className="grid grid-cols-3 gap-px" style={{ background: PropTheme.border }}>
              <EditorialFact label="Category" value={property.propertyCategory} />
              <EditorialFact label="Owners" value={String(property.numberOfOwners)} />
              <EditorialFact label="Purpose" value={intentLabel(property)} />
            </div>

            <div className="h-px" style={{ background: PropTheme.hairline }} />

            {/* Concierge actions — Call + Message */}
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.35em] mb-3"
                style={{ color: PropTheme.brand }}
              >
                Private Concierge
              </p>
              <h3
                className="leading-[1.1] mb-1"
                style={{
                  fontFamily: PropTheme.fontDisplay,
                  fontWeight: 600,
                  fontSize: 22,
                  color: PropTheme.ink,
                  letterSpacing: '-0.4px',
                }}
              >
                {property.advertisementPosterName || 'Verified owner'}
              </h3>
              <p
                className="text-[12px] leading-[1.6] mb-5"
                style={{ color: PropTheme.textSecondary }}
              >
                Direct correspondence with the owner. No intermediaries, no commission.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={phoneHref}
                  onClick={(e) => { if (!phoneHref) e.preventDefault(); }}
                  className="flex items-center justify-center gap-2 py-3.5 text-[11px] font-medium tracking-[0.3em] uppercase cursor-pointer transition-colors"
                  style={{
                    background: PropTheme.ink,
                    color: PropTheme.scaffold,
                    opacity: phoneHref ? 1 : 0.4,
                  }}
                >
                  <Phone size={13} /> Call
                </a>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => { if (!waHref) e.preventDefault(); }}
                  className="flex items-center justify-center gap-2 py-3.5 text-[11px] font-medium tracking-[0.3em] uppercase cursor-pointer border transition-colors"
                  style={{
                    color: PropTheme.ink,
                    borderColor: PropTheme.borderStrong,
                    opacity: waHref ? 1 : 0.4,
                  }}
                >
                  <MessageCircle size={13} /> Message
                </a>
              </div>
              {verified && (
                <div
                  className="mt-4 flex items-center gap-2"
                >
                  <ShieldCheck size={12} style={{ color: PropTheme.brand }} />
                  <p
                    className="text-[10px] font-medium uppercase tracking-[0.25em]"
                    style={{ color: PropTheme.textMuted }}
                  >
                    Verified Listing
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden legacy hero block (kept for safe back-compat with refs below). */}
      <div className="hidden">
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: 'min(70vh, 720px)',
          background: PropTheme.surfaceAlt,
        }}
      >
        {hasImages ? (
          <>
            <div
              ref={galleryRef}
              className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
              onScroll={(e) => {
                const el = e.currentTarget;
                const i = Math.round(el.scrollLeft / el.clientWidth);
                if (i !== activeImage) setActiveImage(i);
              }}
            >
              {images.map((src, i) => (
                <div key={i} className="snap-start shrink-0 w-full h-full">
                  <img
                    src={src}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              ))}
            </div>

            {/* Bottom gradient — editorial dark wash so floating text reads */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(10,7,7,0.92) 0%, rgba(10,7,7,0.55) 35%, rgba(10,7,7,0) 100%)',
              }}
            />
            {/* Top gradient — subtler, so back arrow + counter read */}
            <div
              className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(10,7,7,0.55) 0%, rgba(10,7,7,0) 100%)',
              }}
            />

            {/* Intent + verified pills — top-left */}
            <div className="absolute top-5 left-5 sm:top-7 sm:left-8 flex items-center gap-2 z-10">
              <span
                className="px-3.5 py-1.5 rounded-full text-white text-[10px] font-black tracking-[0.35em] uppercase"
                style={{
                  background: intentBg(property),
                  boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                }}
              >
                {intentLabel(property)}
              </span>
              {property.approvalStatus === 'approved' && (
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[10px] font-black tracking-[0.35em] uppercase backdrop-blur-md"
                  style={{
                    background: 'rgba(10,9,8,0.55)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <ShieldCheck size={11} style={{ color: PropTheme.brand }} /> Verified
                </span>
              )}
            </div>

            {/* Counter — top-right */}
            <div
              className="absolute top-5 right-5 sm:top-7 sm:right-8 px-3.5 py-1.5 rounded-full backdrop-blur-md z-10"
              style={{
                background: 'rgba(10,9,8,0.55)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">
                {String(activeImage + 1).padStart(2, '0')}
                <span className="text-white/45 mx-1.5">/</span>
                {String(images.length).padStart(2, '0')}
              </span>
            </div>

            {/* ─── Premium floating title block — bottom-left ─── */}
            <div className="absolute inset-x-0 bottom-0 px-6 pb-10 sm:px-12 sm:pb-14 max-w-[1440px] mx-auto z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8" style={{ background: PropTheme.brand }} />
                <span
                  className="text-[10px] font-medium uppercase tracking-[0.35em]"
                  style={{ color: PropTheme.brand }}
                >
                  {property.propertyCategory}
                </span>
              </div>
              <h1
                className="leading-[1.02] mb-3"
                style={{
                  fontFamily: PropTheme.fontDisplay,
                  fontWeight: 600,
                  fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
                  color: '#ffffff',
                  letterSpacing: '-1.5px',
                  textShadow: '0 4px 24px rgba(0,0,0,0.6)',
                }}
              >
                {property.propertySubType || 'Untitled Residence'}
              </h1>
              <div className="flex items-center gap-2 text-white/80 text-sm mb-5">
                <MapPin size={14} style={{ color: PropTheme.brand }} />
                <span>{property.areaName || property.pincode || 'Location not added'}</span>
              </div>
              <div className="flex items-end gap-5 flex-wrap">
                <p
                  className="leading-none"
                  style={{
                    fontFamily: PropTheme.fontDisplay,
                    fontWeight: 700,
                    fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                    color: PropTheme.brand,
                    letterSpacing: '-0.8px',
                    textShadow: '0 4px 24px rgba(0,0,0,0.5)',
                  }}
                >
                  {formatINR(property.finalPrice)}
                  {property.priceUnit === 'perAcre' && (
                    <span className="text-white/55 ml-2 text-base" style={{ fontFamily: PropTheme.fontSans }}>
                      / acre
                    </span>
                  )}
                  {property.priceUnit === 'perSqFt' && (
                    <span className="text-white/55 ml-2 text-base" style={{ fontFamily: PropTheme.fontSans }}>
                      / sqft
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Page dots — centered above title */}
            {images.length > 1 && (
              <div
                className="absolute left-0 right-0 flex justify-center gap-1.5 z-10"
                style={{ bottom: 'calc(min(70vh, 720px) - 220px)' }}
              >
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className="h-1.5 rounded-full transition-all cursor-pointer"
                    style={{
                      width: i === activeImage ? 22 : 6,
                      background: i === activeImage ? PropTheme.brand : 'rgba(255,255,255,0.5)',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Prev/Next arrows (desktop) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((i) => Math.max(0, i - 1))}
                  className="hidden sm:flex absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-md border text-white items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10"
                  style={{
                    background: 'rgba(10,9,8,0.5)',
                    borderColor: 'rgba(255,255,255,0.18)',
                  }}
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setActiveImage((i) => Math.min(images.length - 1, i + 1))}
                  className="hidden sm:flex absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-md border text-white items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10"
                  style={{
                    background: 'rgba(10,9,8,0.5)',
                    borderColor: 'rgba(255,255,255,0.18)',
                  }}
                  aria-label="Next photo"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{
              background:
                'linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(120,53,15,0.35) 60%, #1a1816 100%)',
            }}
          >
            <Sparkles size={56} className="text-orange-300/50" />
            <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/45">
              Imagery forthcoming
            </span>
          </div>
        )}
      </div>
      </div>

      {/* Thumbnail strip removed per user request — gallery is navigated via
          the page dots, prev/next arrows on desktop, and swipe on mobile. */}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 gap-10">
        {/* ── Editorial details (full width — concierge moved to top) ── */}
        <div className="flex flex-col gap-10 min-w-0">
          {/* Editorial quick facts — magazine spec row */}
          <div className="grid grid-cols-3 gap-px" style={{ background: PropTheme.border }}>
            <EditorialFact label="Category" value={property.propertyCategory} />
            <EditorialFact label="Owners" value={String(property.numberOfOwners)} />
            <EditorialFact label="Purpose" value={intentLabel(property)} />
          </div>

          {/* Description — editorial body copy */}
          <EditorialSection eyebrow="The Residence" title="About this property">
            <p
              className="text-base leading-[1.8] whitespace-pre-wrap"
              style={{
                color: PropTheme.textPrimary,
                fontFamily: PropTheme.fontSans,
                fontWeight: 500,
              }}
            >
              {property.description?.trim() ||
                'Description forthcoming. Contact the owner directly for a complete dossier.'}
            </p>
          </EditorialSection>

          <EditorialSection eyebrow="The Specifications" title="Property details">
            <EditorialRow label="Sub-type" value={property.propertySubType} />
            <EditorialRow label="Category" value={property.propertyCategory} />
            <EditorialRow label="Purpose" value={intentLabel(property)} />
            <EditorialRow label="Owners" value={String(property.numberOfOwners)} />
            <EditorialRow label="Area · Pincode" value={`${property.areaName || '—'} · ${property.pincode || '—'}`} />
          </EditorialSection>

          <EditorialSection eyebrow="The Investment" title="Price details">
            <EditorialRow label="Total" value={formatINR(property.finalPrice)} bold />
            <EditorialRow label="Unit" value={property.priceUnit === 'perAcre' ? 'Per Acre' : 'Per Sq.Ft'} />
            <EditorialRow label="Currency" value={property.currency} />
          </EditorialSection>

          <EditorialSection eyebrow="The Promise" title="Why TerraInfra360">
            <div className="grid sm:grid-cols-3 gap-8 pt-2">
              {[
                ['01', 'Verified Listings', 'Every property passes manual review by our specialists.'],
                ['02', 'Direct Engagement', 'Speak with owners directly — no brokerage commissions.'],
                ['03', 'End-to-End Support', 'Legal, financing, and construction under one curated roof.'],
              ].map(([n, t, d]) => (
                <div key={n}>
                  <span
                    className="block mb-3"
                    style={{
                      fontFamily: PropTheme.fontDisplay,
                      fontWeight: 600,
                      fontSize: 28,
                      color: PropTheme.brand,
                      letterSpacing: '-0.4px',
                    }}
                  >
                    {n}
                  </span>
                  <p
                    className="mb-2"
                    style={{
                      fontFamily: PropTheme.fontDisplay,
                      fontWeight: 600,
                      fontSize: 18,
                      color: PropTheme.ink,
                      letterSpacing: '-0.2px',
                    }}
                  >
                    {t}
                  </p>
                  <p className="text-[13px] leading-[1.7]" style={{ color: PropTheme.textSecondary }}>
                    {d}
                  </p>
                </div>
              ))}
            </div>
          </EditorialSection>
        </div>

        {/* Concierge moved to the top-right column — no sidebar needed here. */}

        <AnimatePresence>
          {pulsing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-white text-xs font-black tracking-widest uppercase z-40"
              style={{ background: PropTheme.ink, boxShadow: brandGlow(0.4) }}
            >
              {isShortlisted ? 'Saved to shortlist' : 'Removed from shortlist'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Editorial helpers ──────────────────────────────────────────────────────
function EditorialSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-px w-6" style={{ background: PropTheme.brand }} />
        <span
          className="text-[10px] font-medium uppercase tracking-[0.35em]"
          style={{ color: PropTheme.brand }}
        >
          {eyebrow}
        </span>
      </div>
      <h3
        className="mb-6 leading-[1.05]"
        style={{
          fontFamily: PropTheme.fontDisplay,
          fontWeight: 600,
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          color: PropTheme.ink,
          letterSpacing: '-0.8px',
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function EditorialRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className="flex items-baseline justify-between py-4 border-b"
      style={{ borderColor: PropTheme.hairline }}
    >
      <span
        className="text-[10px] font-medium uppercase tracking-[0.3em]"
        style={{ color: PropTheme.textMuted }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: bold ? PropTheme.fontDisplay : PropTheme.fontSans,
          fontWeight: bold ? 700 : 600,
          fontSize: bold ? 22 : 14,
          color: PropTheme.ink,
          letterSpacing: bold ? '-0.3px' : '0',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function EditorialFact({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="p-5 flex flex-col gap-1.5"
      style={{ background: PropTheme.scaffold }}
    >
      <span
        className="text-[9px] font-medium uppercase tracking-[0.3em]"
        style={{ color: PropTheme.textMuted }}
      >
        {label}
      </span>
      <span
        className="capitalize truncate"
        style={{
          fontFamily: PropTheme.fontDisplay,
          fontWeight: 600,
          fontSize: 22,
          color: PropTheme.ink,
          letterSpacing: '-0.4px',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function _UnusedQuickFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Home;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl p-3 border flex items-center gap-2" style={{ background: PropTheme.surface, borderColor: PropTheme.border, boxShadow: PropTheme.shadowSoft }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: PropTheme.brandTint }}>
        <Icon size={16} style={{ color: PropTheme.brand }} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: PropTheme.textMuted }}>
          {label}
        </p>
        <p className="text-xs font-black truncate" style={{ color: PropTheme.ink }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function timeAgo(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return 'Just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 2592000) return `${Math.floor(sec / 86400)}d ago`;
  return `${Math.floor(sec / 2592000)}mo ago`;
}

/**
 * SideGallery — left-side gallery for the 2-column detail layout.
 *
 * Main hero image (~70% of column height) + 4-tile thumbnail strip below
 * (~30%). "View all N" pill floats bottom-right of the hero. Clicking any
 * image opens the same Lightbox the MosaicGallery uses.
 */
function SideGallery({
  images,
  activeImage,
  setActiveImage,
  intent,
  intentBg,
  verified,
}: {
  images: string[];
  activeImage: number;
  setActiveImage: (i: number) => void;
  intent: string;
  intentBg: string;
  verified: boolean;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Empty-state placeholder.
  if (images.length === 0) {
    return (
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: '4/3',
          background:
            'linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(120,53,15,0.35) 60%, #1a1816 100%)',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Sparkles size={48} className="text-orange-300/50" />
          <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/45">
            Imagery forthcoming
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* ── Single hero image — fills the column. Tap opens slide lightbox. ── */}
      <div
        className="relative w-full overflow-hidden group cursor-pointer"
        style={{ aspectRatio: '4/3' }}
        onClick={() => {
          setLightboxIndex(activeImage);
          setLightboxOpen(true);
        }}
      >
        <img
          src={images[activeImage] ?? images[0]}
          alt={`Photo ${activeImage + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Intent + verified pills — top-left */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          <span
            className="px-3 py-1.5 rounded-full text-white text-[9.5px] font-black tracking-[0.35em] uppercase"
            style={{
              background: intentBg,
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            }}
          >
            {intent}
          </span>
          {verified && (
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[9.5px] font-black tracking-[0.35em] uppercase backdrop-blur-md"
              style={{
                background: 'rgba(10,9,8,0.55)',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              <ShieldCheck size={11} style={{ color: PropTheme.brand }} /> Verified
            </span>
          )}
        </div>

        {/* Page counter — top-right */}
        {images.length > 1 && (
          <div
            className="absolute top-4 right-4 px-3 py-1.5 rounded-full backdrop-blur-md z-10"
            style={{
              background: 'rgba(10,9,8,0.55)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">
              {String(activeImage + 1).padStart(2, '0')}
              <span className="text-white/45 mx-1">/</span>
              {String(images.length).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* "View all N" floating bottom-right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLightboxIndex(activeImage);
            setLightboxOpen(true);
          }}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md cursor-pointer hover:scale-105 transition-transform z-10"
          style={{
            background: 'rgba(255,255,255,0.95)',
            color: PropTheme.ink,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <Sparkles size={13} />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase">
            View all {images.length}
          </span>
        </button>

        {/* Page dots — bottom-center */}
        {images.length > 1 && (
          <div
            className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none"
          >
            {images.slice(0, Math.min(images.length, 8)).map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === activeImage ? 18 : 6,
                  background:
                    i === activeImage ? PropTheme.brand : 'rgba(255,255,255,0.55)',
                }}
              />
            ))}
          </div>
        )}

        {/* Prev / Next chevrons — inline (don't open lightbox) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImage(Math.max(0, activeImage - 1));
              }}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full backdrop-blur-md border text-white items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10"
              style={{
                background: 'rgba(10,9,8,0.55)',
                borderColor: 'rgba(255,255,255,0.18)',
                opacity: activeImage === 0 ? 0.4 : 1,
              }}
              aria-label="Previous photo"
              disabled={activeImage === 0}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImage(Math.min(images.length - 1, activeImage + 1));
              }}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full backdrop-blur-md border text-white items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10"
              style={{
                background: 'rgba(10,9,8,0.55)',
                borderColor: 'rgba(255,255,255,0.18)',
                opacity: activeImage === images.length - 1 ? 0.4 : 1,
              }}
              aria-label="Next photo"
              disabled={activeImage === images.length - 1}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          setIndex={setLightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * MosaicGallery — Sotheby's / Airbnb-style contained gallery.
 *
 * Desktop: 1 large image on the left (50% width) + 2×2 grid of 4 thumbs
 *   on the right (50% width). Total 5 images visible, "View all N" button
 *   bottom-right. Clicking any image opens a full-screen lightbox.
 * Mobile:  Single image swiper (snap-x) with page dots.
 */
function MosaicGallery({
  images,
  activeImage,
  setActiveImage,
  intent,
  intentBg,
  verified,
}: {
  images: string[];
  activeImage: number;
  setActiveImage: (i: number) => void;
  intent: string;
  intentBg: string;
  verified: boolean;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const openAt = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  // Empty-state placeholder.
  if (images.length === 0) {
    return (
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          aspectRatio: '16/9',
          background:
            'linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(120,53,15,0.35) 60%, #1a1816 100%)',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Sparkles size={56} className="text-orange-300/50" />
          <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/45">
            Imagery forthcoming
          </span>
        </div>
      </div>
    );
  }

  // Mosaic positions: [0] big-left, [1-4] right 2×2.
  const slots = [
    images[0],
    images[1] ?? images[0],
    images[2] ?? images[0],
    images[3] ?? images[0],
    images[4] ?? images[0],
  ];

  return (
    <>
      {/* ── Mobile: simple swiper ── */}
      <div className="md:hidden">
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{ aspectRatio: '4/3', background: PropTheme.surfaceAlt }}
        >
          <div
            className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
            onScroll={(e) => {
              const el = e.currentTarget;
              const i = Math.round(el.scrollLeft / el.clientWidth);
              if (i !== activeImage) setActiveImage(i);
            }}
          >
            {images.map((src, i) => (
              <div key={i} className="snap-start shrink-0 w-full h-full">
                <img
                  src={src}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                  onClick={() => openAt(i)}
                />
              </div>
            ))}
          </div>
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-white text-[9px] font-black tracking-[0.3em] uppercase"
              style={{ background: intentBg }}
            >
              {intent}
            </span>
            {verified && (
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[9px] font-black tracking-[0.3em] uppercase backdrop-blur-md"
                style={{
                  background: 'rgba(10,9,8,0.55)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <ShieldCheck size={10} style={{ color: PropTheme.brand }} />
                Verified
              </span>
            )}
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === activeImage ? 18 : 6,
                  background:
                    i === activeImage ? PropTheme.brand : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop: 5-tile mosaic ── */}
      <div
        className="hidden md:grid relative overflow-hidden rounded-2xl"
        style={{
          gridTemplateColumns: '1.4fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 8,
          aspectRatio: '16/9',
          maxHeight: 560,
        }}
      >
        {/* Big left image — spans both rows */}
        <button
          onClick={() => openAt(0)}
          className="relative overflow-hidden group cursor-pointer row-span-2"
        >
          <img
            src={slots[0]}
            alt="Photo 1"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 100%)',
            }}
          />
          {/* Intent + verified pills inside the big tile */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-white text-[9.5px] font-black tracking-[0.35em] uppercase"
              style={{
                background: intentBg,
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              }}
            >
              {intent}
            </span>
            {verified && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[9.5px] font-black tracking-[0.35em] uppercase backdrop-blur-md"
                style={{
                  background: 'rgba(10,9,8,0.55)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                <ShieldCheck size={10} style={{ color: PropTheme.brand }} />
                Verified
              </span>
            )}
          </div>
        </button>

        {/* 4 small thumbs on the right */}
        {[1, 2, 3, 4].map((idx, slotI) => {
          const isLastSlot = slotI === 3;
          return (
            <button
              key={idx}
              onClick={() => openAt(idx)}
              className="relative overflow-hidden group cursor-pointer"
            >
              <img
                src={slots[idx]}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* "+N more" overlay on the last visible thumb */}
              {isLastSlot && images.length > 5 && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ background: 'rgba(10,9,8,0.55)' }}
                >
                  <span
                    className="text-white font-bold text-xl"
                    style={{
                      fontFamily: PropTheme.fontDisplay,
                      fontWeight: 600,
                    }}
                  >
                    +{images.length - 5}
                  </span>
                </div>
              )}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 100%)',
                }}
              />
            </button>
          );
        })}

        {/* "View all photos" button — bottom-right */}
        <button
          onClick={() => openAt(0)}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md cursor-pointer hover:scale-105 transition-transform"
          style={{
            background: 'rgba(255,255,255,0.95)',
            color: PropTheme.ink,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <Sparkles size={13} />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase">
            View all {images.length}
          </span>
        </button>
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          setIndex={setLightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

/**
 * Lightbox — full-screen sliding gallery.
 *
 * Horizontal swipe (drag) + click prev/next + keyboard arrows + Esc to close.
 * Smooth tween animation between images. No thumbnail strip per user request.
 */
function Lightbox({
  images,
  index,
  setIndex,
  onClose,
}: {
  images: string[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
}) {
  // Direction tracks left vs right slide for animation.
  const [direction, setDirection] = useState(0);

  const goPrev = () => {
    if (index > 0) {
      setDirection(-1);
      setIndex(index - 1);
    }
  };
  const goNext = () => {
    if (index < images.length - 1) {
      setDirection(1);
      setIndex(index + 1);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-md overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      {/* Counter + Close — top-right */}
      <div
        className="absolute top-5 right-5 flex items-center gap-3 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="px-3.5 py-1.5 rounded-full text-white text-[10px] font-black tracking-[0.3em] uppercase"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {String(index + 1).padStart(2, '0')}
          <span className="text-white/45 mx-1">/</span>
          {String(images.length).padStart(2, '0')}
        </span>
        <button
          onClick={onClose}
          className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
          aria-label="Close"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      {/* Sliding image — uses motion's drag for swipe support */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt={`Photo ${index + 1}`}
          custom={direction}
          variants={{
            enter: (dir: number) => ({ x: dir > 0 ? 600 : -600, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (dir: number) => ({ x: dir > 0 ? -600 : 600, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.25 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            const SWIPE_THRESHOLD = 80;
            if (info.offset.x < -SWIPE_THRESHOLD) goNext();
            else if (info.offset.x > SWIPE_THRESHOLD) goPrev();
          }}
          className="max-w-[92vw] max-h-[88vh] object-contain cursor-grab active:cursor-grabbing select-none"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      </AnimatePresence>

      {/* Prev / Next chevrons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            disabled={index === 0}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform disabled:opacity-25 z-20"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            aria-label="Previous"
          >
            <ChevronLeft size={22} className="text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            disabled={index === images.length - 1}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform disabled:opacity-25 z-20"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            aria-label="Next"
          >
            <ChevronRight size={22} className="text-white" />
          </button>
        </>
      )}

      {/* Dots indicator at the bottom (no thumb strip per user request) */}
      {images.length > 1 && images.length <= 16 && (
        <div
          className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none"
        >
          {images.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 24 : 6,
                background:
                  i === index ? PropTheme.brand : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
