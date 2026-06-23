/**
 * 8-step Post Property wizard — web port of the Flutter PostPropertyFlow.
 *
 * Steps:
 *   1. Listing purpose (Sale / Rent / Lease)
 *   2. Property category + subtype
 *   3. Ownership role
 *   4. Location (pincode + area; map picker is a stub — Maps JS can be added)
 *   5. Images + amenities (image_picker → File[] + multipart upload)
 *   6. Property details
 *   7. Pricing + legal flags
 *   8. Poster verification (name + phone)
 *
 * On submit:
 *   • Creates a Firestore doc in `properties` with approvalStatus = 'pending'
 *   • Uploads each image sequentially to Storage with per-image progress
 *   • Updates the doc with the resulting image URLs
 */
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  Building2,
  TreePine,
  Plus,
  X,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Loader2,
  ChevronRight,
  Mail,
  Locate,
  Crosshair,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../../../lib/firebase';
import { uploadPropertyImages } from '../services/propertyService';
import { PropTheme, brandGlow, formatINR } from '../propertyTheme';
import type {
  ListingPurpose,
  PosterRole,
  PriceUnit,
  PropertyCategory,
} from '../types';
import { AiDescriptionField } from './AiDescriptionField';

const STEPS = 8;
const STEP_LABELS = [
  'Listing purpose',
  'Property type',
  'Your role',
  'Location',
  'Photos & amenities',
  'Property details',
  'Pricing & legal',
  'Verify yourself',
];

interface Props {
  onClose: () => void;
}

interface WizardState {
  // Step 1
  listingPurpose?: ListingPurpose;
  // Step 2
  category?: PropertyCategory;
  subtype?: string;
  // Step 3
  ownership?: PosterRole;
  ownershipOther?: string;
  // Step 4 — Location (full Flutter parity with step_4_location.dart)
  pincode?: string;
  areaName?: string;
  // Captured from "Use my current location" reverse geocode → preview card.
  detectedCity?: string;
  detectedState?: string;
  detectedAddress?: string;
  detectedLat?: number;
  detectedLng?: number;
  locationSaved?: boolean;
  // Step 5
  imageFiles: File[];
  amenities: string[];
  // Step 6 — category-conditional, kept as a single bag of fields so future
  // fields don't require WizardState surgery. Mirrors the Flutter Step 6
  // data shape (lib/screens/properties/post_property/steps/step_6_property_details.dart).
  details: Record<string, string | number | boolean | undefined | null>;
  description: string;
  numberOfOwners: number;
  // Step 7 — pricing & legal (full Flutter parity)
  price?: number;
  priceUnit: PriceUnit;
  legalCheckOk: boolean;
  step7: Step7State;
  // Step 8 — poster + OTP verification
  posterName?: string;
  posterPhone?: string;
  otpVerified: boolean;
}

interface Step7State {
  negotiable?: boolean;
  advance?: string;
  booking?: string;
  advanceRefundable?: boolean;
  possession?: 'immediate' | '3m' | '6m' | 'under_construction';
  titleClear?: boolean;
  encumbrance?: boolean;
  approvedBy: string[];
  documents: string[];
  taxPaid?: boolean;
  pendingDues?: boolean;
  pendingAmount?: string;
  brokerageApplicable?: boolean;
  brokeragePercent?: string;
  brokeragePayableBy?: 'Buyer' | 'Seller' | 'Both';
  loanAvailable?: boolean;
}

const initialState: WizardState = {
  imageFiles: [],
  amenities: [],
  details: {},
  description: '',
  numberOfOwners: 1,
  priceUnit: 'perSqFt',
  legalCheckOk: false,
  step7: {
    approvedBy: [],
    documents: [],
  },
  otpVerified: false,
};

export function PostPropertyFlow({ onClose }: Props) {
  const [step, setStep] = useState(1);
  const [s, setS] = useState<WizardState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [status, setStatus] = useState('');
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);

  const set = <K extends keyof WizardState>(k: K, v: WizardState[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  // ── Step validation ───────────────────────────────────────────────────────
  const canAdvance = (() => {
    switch (step) {
      case 1: return !!s.listingPurpose;
      case 2: return !!s.category && !!s.subtype;
      case 3:
        return !!s.ownership && (s.ownership !== 'other' || !!s.ownershipOther?.trim());
      case 4: return !!s.pincode && s.pincode.length === 6 && !!s.locationSaved;
      case 5: return s.imageFiles.length > 0;
      case 6: {
        // Category-aware lightweight validation. Mirrors the Flutter logic
        // but is more permissive — the description is now optional, and
        // each category requires only its core fields.
        if (s.category === 'land') {
          return !!s.details.landType && !!s.details.acres;
        }
        if (s.category === 'residential') {
          return (
            !!s.details.resType &&
            !!s.details.bedrooms &&
            !!s.details.bathrooms &&
            !!s.details.area
          );
        }
        if (s.category === 'commercial') {
          return !!s.details.commercialType && !!s.details.area;
        }
        return s.description.trim().length >= 20;
      }
      case 7:
        return (
          !!s.price &&
          s.price > 0 &&
          !!s.step7.advance &&
          !!s.step7.possession &&
          s.step7.titleClear === true &&
          s.step7.documents.length > 0
        );
      case 8:
        return (
          !!s.posterName?.trim() &&
          !!s.posterPhone &&
          s.posterPhone.length === 10 &&
          s.otpVerified
        );
      default: return false;
    }
  })();

  const next = () => setStep((n) => Math.min(STEPS, n + 1));
  const back = () => setStep((n) => Math.max(1, n - 1));

  // ── Submit ────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!isFirebaseConfigured) {
      setSubmitErr('Firebase is not configured — listings can\'t be saved.');
      return;
    }
    setSubmitting(true);
    setSubmitErr(null);
    setProgress(0);
    setStatus('Creating listing…');

    try {
      const uid = auth.currentUser?.uid ?? s.posterPhone ?? 'guest';
      const docRef = await addDoc(collection(db, 'properties'), {
        postedByUserId: s.posterPhone ?? '',
        ownerUid: uid,
        advertisementPosterName: s.posterName,
        posterRole: s.ownership ?? 'owner',
        posterRoleOtherText: s.ownership === 'other' ? s.ownershipOther : null,
        listingPurpose: s.listingPurpose,
        propertyCategory: s.category,
        propertySubType: s.subtype,
        finalPrice: s.price,
        priceUnit: s.priceUnit,
        currency: 'INR',
        imageUrls: [],
        description: s.description,
        numberOfOwners: s.numberOfOwners,
        propertyType: 'general',
        geoLocation: { latitude: s.detectedLat ?? 0, longitude: s.detectedLng ?? 0 },
        pincode: s.pincode,
        areaName: s.areaName,
        city: s.detectedCity,
        state: s.detectedState,
        address: s.detectedAddress,
        amenities: s.amenities,
        // Category-conditional fields from Step 6 — same shape the Flutter app writes.
        details: s.details,
        // Step 7 — pricing & legal block. Mirrors Flutter's _buildData() shape.
        pricing: {
          price: s.price,
          priceUnit: s.priceUnit,
          negotiable: s.step7.negotiable ?? null,
          advance: s.step7.advance ?? '',
          booking: s.step7.booking ?? '',
          advanceRefundable: s.step7.advanceRefundable ?? null,
          possession: s.step7.possession ?? null,
          titleClear: s.step7.titleClear ?? null,
          encumbrance: s.step7.encumbrance ?? null,
          approvedBy: s.step7.approvedBy,
          documents: s.step7.documents,
          taxPaid: s.step7.taxPaid ?? null,
          pendingDues: s.step7.pendingDues ?? null,
          pendingAmount: s.step7.pendingAmount ?? '',
          brokerageApplicable: s.step7.brokerageApplicable ?? null,
          brokeragePercent: s.step7.brokeragePercent ?? '',
          brokeragePayableBy: s.step7.brokeragePayableBy ?? null,
          loanAvailable: s.step7.loanAvailable ?? null,
        },
        approvalStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setProgress(0.1);
      setStatus(`Uploading 0 of ${s.imageFiles.length} photos…`);
      const urls = await uploadPropertyImages(
        docRef.id,
        s.imageFiles,
        (done, total) => {
          setProgress(0.1 + (done / total) * 0.85);
          setStatus(`Uploading ${done} of ${total} photos…`);
        },
      );

      setStatus('Finalising…');
      await updateDoc(doc(db, 'properties', docRef.id), {
        imageUrls: urls,
        updatedAt: serverTimestamp(),
      });
      setProgress(1);
      setStatus('Submitted! Awaiting approval.');
      setDoneId(docRef.id);
    } catch (e) {
      setSubmitErr((e as Error).message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Done screen ───────────────────────────────────────────────────────────
  if (doneId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: PropTheme.scaffold }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6 text-white"
          style={{ background: PropTheme.brandGradient, boxShadow: brandGlow(0.5) }}
        >
          <Check size={48} strokeWidth={3} />
        </motion.div>
        <h2 className="text-3xl font-black mb-3" style={{ color: PropTheme.ink }}>
          Listing submitted!
        </h2>
        <p className="max-w-md text-sm mb-10" style={{ color: PropTheme.textSecondary }}>
          Our team reviews every property before it goes live. We'll notify you
          within 24 hours once your listing is approved.
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl text-white font-black text-xs tracking-widest uppercase"
          style={{ background: PropTheme.brandGradient }}
        >
          Back to Properties
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: PropTheme.scaffold }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 border-b backdrop-blur-xl px-4 py-3 flex items-center justify-between"
        style={{ borderColor: PropTheme.border }}
      >
        <button
          onClick={step === 1 ? onClose : back}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black tracking-widest uppercase"
          style={{ borderColor: PropTheme.borderStrong, color: PropTheme.textPrimary }}
        >
          <ArrowLeft size={14} /> {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: PropTheme.brand }}>
            Step {step}
          </span>
          <span className="text-[10px] font-bold" style={{ color: PropTheme.textMuted }}>
            of {STEPS}
          </span>
        </div>
        <div className="w-16" />
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <motion.div
          className="h-full"
          style={{ background: PropTheme.brandGradient }}
          initial={{ width: 0 }}
          animate={{ width: `${(step / STEPS) * 100}%` }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        />
      </div>

      {/* Body — desktop: 2-column with vertical step rail; mobile: stacked */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* Step rail (desktop only) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-[110px] rounded-2xl p-5 border" style={{ background: PropTheme.surface, borderColor: PropTheme.border, boxShadow: PropTheme.shadowSoft }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: PropTheme.brand }}>
              Post in 8 steps
            </p>
            <ol className="space-y-1">
              {STEP_LABELS.map((label, i) => {
                const n = i + 1;
                const done = n < step;
                const current = n === step;
                return (
                  <li key={n} className="flex items-center gap-3 py-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                      style={
                        current
                          ? { background: PropTheme.brand, color: 'white' }
                          : done
                            ? { background: PropTheme.brandTint, color: PropTheme.brand }
                            : { background: PropTheme.surfaceAlt, color: PropTheme.textMuted }
                      }
                    >
                      {done ? <Check size={12} /> : n}
                    </div>
                    <span
                      className="text-[12.5px] font-bold leading-tight"
                      style={{
                        color: current ? PropTheme.ink : done ? PropTheme.textPrimary : PropTheme.textMuted,
                      }}
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {/* Form column */}
        <div className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && <Step1 s={s} set={set} />}
              {step === 2 && <Step2 s={s} set={set} />}
              {step === 3 && <Step3 s={s} set={set} />}
              {step === 4 && <Step4 s={s} set={set} />}
              {step === 5 && <Step5 s={s} set={set} setS={setS} />}
              {step === 6 && <Step6 s={s} setS={setS} set={set} />}
              {step === 7 && <Step7 s={s} setS={setS} set={set} />}
              {step === 8 && <Step8 s={s} set={set} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div
        className="sticky bottom-0 border-t backdrop-blur-xl px-4 sm:px-6 py-3"
        style={{ borderColor: PropTheme.border }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <span className="text-xs font-bold" style={{ color: PropTheme.textMuted }}>
            {canAdvance ? 'Looking good — continue' : 'Fill the required fields'}
          </span>
          {step < STEPS ? (
            <button
              onClick={next}
              disabled={!canAdvance}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-black text-xs tracking-widest uppercase disabled:opacity-40"
              style={{ background: PropTheme.brandGradient }}
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!canAdvance || submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-black text-xs tracking-widest uppercase disabled:opacity-40"
              style={{ background: PropTheme.brandGradient }}
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Submit listing
            </button>
          )}
        </div>
        {submitErr && (
          <p className="max-w-2xl mx-auto mt-2 text-xs font-bold text-red-500">{submitErr}</p>
        )}
      </div>

      {/* Submission modal */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="rounded-3xl p-8 max-w-sm w-full text-center border" style={{ background: PropTheme.surface, borderColor: PropTheme.border }}>
              <div className="relative w-24 h-24 mx-auto mb-5">
                <svg className="w-24 h-24 -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#eee" strokeWidth="6" fill="none" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={PropTheme.brand}
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - progress)}
                    style={{ transition: 'stroke-dashoffset 0.3s' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-lg" style={{ color: PropTheme.brand }}>
                  {Math.round(progress * 100)}%
                </div>
              </div>
              <p className="font-black text-base" style={{ color: PropTheme.ink }}>{status}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Common UI ──────────────────────────────────────────────────────────────
function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-black mb-2" style={{ color: PropTheme.ink, letterSpacing: '-0.6px' }}>
        {title}
      </h1>
      <p className="text-sm" style={{ color: PropTheme.textSecondary }}>
        {subtitle}
      </p>
    </div>
  );
}

function ChoiceCard({
  selected,
  onClick,
  icon: Icon,
  title,
  subtitle,
  image,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: typeof Home;
  title: string;
  subtitle?: string;
  image?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all cursor-pointer hover:scale-[1.01]"
      style={{
        borderColor: selected ? PropTheme.brand : PropTheme.border,
        background: PropTheme.surface,
        boxShadow: selected ? brandGlow(0.25) : PropTheme.shadowCard,
      }}
    >
      {image ? (
        <div
          className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border"
          style={{ borderColor: PropTheme.border }}
        >
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      ) : Icon ? (
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: selected ? PropTheme.brandTint : PropTheme.surfaceAlt,
          }}
        >
          <Icon size={22} style={{ color: PropTheme.brand }} />
        </div>
      ) : null}
      <div className="flex-1 min-w-0">
        <p className="font-black text-base text-white">{title}</p>
        {subtitle && (
          <p className="text-xs mt-0.5 text-white/55">{subtitle}</p>
        )}
      </div>
      {selected && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: PropTheme.brand }}
        >
          <Check size={14} className="text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

function Field({ label, children, hint }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="text-[10.5px] font-black uppercase tracking-widest block mb-2"
             style={{ color: PropTheme.textSecondary }}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs" style={{ color: PropTheme.textMuted }}>{hint}</p>}
    </div>
  );
}

const inputCls = 'w-full px-4 py-3 rounded-xl border text-[14px] font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 transition-colors';

// ── Step 1: Listing purpose ────────────────────────────────────────────────
function Step1({ s, set }: { s: WizardState; set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void }) {
  return (
    <>
      <StepHeader title="Are you selling, renting, or leasing?" subtitle="Choose how you'd like to list this property." />
      <div className="space-y-3">
        <ChoiceCard
          selected={s.listingPurpose === 'sale'}
          onClick={() => set('listingPurpose', 'sale')}
          title="For Sale"
          subtitle="Full ownership transfer to a buyer."
          image="/images/post_property/sell.jpg"
        />
        <ChoiceCard
          selected={s.listingPurpose === 'rent'}
          onClick={() => set('listingPurpose', 'rent')}
          title="For Rent"
          subtitle="Monthly rental — keep ownership, gain steady income."
          image="/images/post_property/rent.jpg"
        />
        <ChoiceCard
          selected={s.listingPurpose === 'lease'}
          onClick={() => set('listingPurpose', 'lease')}
          title="For Lease"
          subtitle="Long-term lease arrangement, typically 11+ months."
          image="/images/post_property/lease.jpg"
        />
      </div>
    </>
  );
}

// ── Step 2: Category + subtype ─────────────────────────────────────────────
const SUBTYPES: Record<PropertyCategory, string[]> = {
  residential: ['1 BHK Flat', '2 BHK Flat', '3 BHK Flat', '4 BHK Flat', 'Independent House', 'Villa', 'Builder Floor', 'Penthouse', 'Studio Apartment'],
  land: ['Residential Plot', 'Agricultural Land', 'Farm Land', 'Commercial Plot', 'Industrial Plot', '1 Acre Land', '5 Acres Land'],
  commercial: ['Office', 'Shop', 'Showroom', 'Warehouse', 'Industrial Unit', 'Retail Space', 'Godown'],
};

const CATEGORY_IMAGES: Record<PropertyCategory, string> = {
  residential: '/images/post_property/residential.jpg',
  commercial: '/images/post_property/commercial.jpg',
  land: '/images/post_property/land.jpg',
};

function Step2({ s, set }: { s: WizardState; set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void }) {
  return (
    <>
      <StepHeader title="What type of property?" subtitle="Pick a category, then choose a specific subtype." />
      <div className="grid grid-cols-3 gap-3 mb-6">
        {([
          { id: 'residential' as const, label: 'Residential', icon: Home },
          { id: 'commercial' as const, label: 'Commercial', icon: Building2 },
          { id: 'land' as const, label: 'Land', icon: TreePine },
        ]).map((c) => {
          const selected = s.category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => { set('category', c.id); set('subtype', undefined); }}
              className="relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.02]"
              style={{
                borderColor: selected ? PropTheme.brand : PropTheme.border,
                boxShadow: selected ? brandGlow(0.25) : PropTheme.shadowCard,
                aspectRatio: '1 / 0.95',
              }}
            >
              <img
                src={CATEGORY_IMAGES[c.id]}
                alt={c.label}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: selected
                    ? 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(249,115,22,0.65))'
                    : 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.75))',
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col items-center">
                <c.icon size={22} className="text-white mb-1" />
                <span className="text-sm font-black text-white">{c.label}</span>
              </div>
              {selected && (
                <div
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: PropTheme.brand }}
                >
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {s.category && (
        <Field label="Subtype">
          <div className="flex flex-wrap gap-2">
            {SUBTYPES[s.category].map((st) => (
              <button
                key={st}
                onClick={() => set('subtype', st)}
                className="px-3.5 py-2 rounded-full border text-[12px] font-bold cursor-pointer transition-all"
                style={
                  s.subtype === st
                    ? { background: PropTheme.brand, borderColor: PropTheme.brand, color: 'white' }
                    : { background: PropTheme.surface, borderColor: PropTheme.border, color: 'rgba(255,255,255,0.75)' }
                }
              >
                {st}
              </button>
            ))}
          </div>
        </Field>
      )}
    </>
  );
}

// ── Step 3: Ownership role ─────────────────────────────────────────────────
const OWNERSHIP_OPTIONS: { id: PosterRole; label: string; sub: string }[] = [
  { id: 'owner', label: 'Owner', sub: 'You hold the title.' },
  { id: 'immediateAggregator', label: 'Immediate Aggregator', sub: 'Authorised by the owner to list.' },
  { id: 'agreementHolder', label: 'Agreement Holder', sub: 'Sale/lease agreement holder.' },
  { id: 'gpaHolder', label: 'GPA Holder', sub: 'General Power of Attorney holder.' },
  { id: 'mouHolder', label: 'MoU Holder', sub: 'Memorandum of Understanding signed.' },
  { id: 'terrainInfraChannelPartner', label: 'TerraInfra Channel Partner', sub: 'Empanelled partner.' },
  { id: 'other', label: 'Other', sub: 'Specify your role.' },
];

function Step3({ s, set }: { s: WizardState; set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void }) {
  return (
    <>
      <StepHeader title="What's your role?" subtitle="We verify ownership before publishing." />
      <div className="space-y-2.5">
        {OWNERSHIP_OPTIONS.map((o) => (
          <ChoiceCard
            key={o.id}
            selected={s.ownership === o.id}
            onClick={() => set('ownership', o.id)}
            title={o.label}
            subtitle={o.sub}
          />
        ))}
      </div>
      {s.ownership === 'other' && (
        <div className="mt-4">
          <Field label="Specify your role">
            <input
              className={inputCls}
              style={{ borderColor: PropTheme.border }}
              placeholder="e.g. Developer, Broker, Family member"
              value={s.ownershipOther ?? ''}
              onChange={(e) => set('ownershipOther', e.target.value)}
            />
          </Field>
        </div>
      )}
    </>
  );
}

// ── Step 4: Location (Flutter parity with step_4_location.dart) ───────────
// Mirrors the Flutter flow:
//   1) User types a 6-digit pincode OR taps "Use my current location"
//   2) GPS detection runs → reverse geocode (Nominatim) → preview card with
//      editable Area, City, State, Address, GPS coords, editable Pincode +
//      candidate neighborhood chips.
//   3) User reviews the preview and taps "Save this location" (or Discard).
//   4) On save we mark locationSaved=true and show the green confirmation card.
//
// The standalone "Area / Locality" input is removed — area is now driven by
// the preview card so it always stays consistent with the saved GPS fix.
interface ReverseGeocode {
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  candidates: string[];
}

async function reverseGeocodeNominatim(lat: number, lng: number): Promise<ReverseGeocode | null> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}` +
      '&format=json&zoom=18&addressdetails=1';
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data?.address ?? {};
    const area: string | undefined =
      addr.neighbourhood || addr.suburb || addr.village || addr.town || addr.city_district;
    const city: string | undefined = addr.city || addr.town || addr.village;
    const state: string | undefined = addr.state;
    const pincode: string | undefined = addr.postcode;
    const address: string | undefined = data?.display_name;
    const candidateKeys = [
      'neighbourhood', 'suburb', 'village', 'town', 'city_district',
      'quarter', 'hamlet', 'residential',
    ] as const;
    const set = new Set<string>();
    candidateKeys.forEach((k) => {
      const v = addr[k];
      if (typeof v === 'string' && v.trim()) set.add(v);
    });
    if (city) set.delete(city);
    if (state) set.delete(state);
    return { area, city, state, pincode, address, candidates: Array.from(set) };
  } catch {
    return null;
  }
}

function Step4({ s, set }: { s: WizardState; set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void }) {
  // Local UI state — preview card lives entirely in this component until
  // the user taps Save (mirrors Flutter behaviour).
  const [isLocating, setIsLocating] = useState(false);
  const [locErr, setLocErr] = useState<string | null>(null);
  const [hasDetection, setHasDetection] = useState(false);
  const [detectedArea, setDetectedArea] = useState<string>('');
  const [detectedPincode, setDetectedPincode] = useState<string>('');
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [detectedState, setDetectedState] = useState<string | null>(null);
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [detectedLat, setDetectedLat] = useState<number | null>(null);
  const [detectedLng, setDetectedLng] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);

  const resetDetection = () => {
    setHasDetection(false);
    setDetectedArea('');
    setDetectedPincode('');
    setDetectedCity(null);
    setDetectedState(null);
    setDetectedAddress(null);
    setDetectedLat(null);
    setDetectedLng(null);
    setCandidates([]);
  };

  const useCurrentLocation = () => {
    setLocErr(null);
    if (!navigator.geolocation) {
      setLocErr("Geolocation isn't supported in this browser.");
      return;
    }
    setIsLocating(true);
    resetDetection();
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const r = await reverseGeocodeNominatim(latitude, longitude);
        setIsLocating(false);
        setHasDetection(true);
        setDetectedLat(latitude);
        setDetectedLng(longitude);
        setDetectedCity(r?.city ?? null);
        setDetectedState(r?.state ?? null);
        setDetectedAddress(r?.address ?? null);
        setDetectedArea(r?.area ?? r?.city ?? '');
        setDetectedPincode(r?.pincode ?? '');
        setCandidates(r?.candidates ?? []);
      },
      (err) => {
        setIsLocating(false);
        setLocErr(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Type the pincode below.'
            : err.code === err.POSITION_UNAVAILABLE
              ? "Couldn't determine your location. Type it manually."
              : err.code === err.TIMEOUT
                ? 'Location request timed out. Try again.'
                : 'Location error.',
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const saveDetectedLocation = () => {
    if (detectedPincode.length !== 6) return;
    set('pincode', detectedPincode);
    set('areaName', detectedArea.trim() || detectedCity || '');
    set('detectedCity', detectedCity ?? undefined);
    set('detectedState', detectedState ?? undefined);
    set('detectedAddress', detectedAddress ?? undefined);
    set('detectedLat', detectedLat ?? undefined);
    set('detectedLng', detectedLng ?? undefined);
    set('locationSaved', true);
    setHasDetection(false);
  };

  const editSavedLocation = () => {
    set('locationSaved', false);
  };

  const canSavePreview = detectedPincode.length === 6;

  return (
    <>
      <StepHeader
        title="Property location"
        subtitle="Exact location is visible only to TerraInfra360 admins."
      />

      {/* ── Card 1 — Area pincode + current-location action ── */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{ background: PropTheme.surface, border: `1px solid ${PropTheme.border}` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Mail size={16} className="text-orange-500" />
          <h3 className="text-sm font-black text-white tracking-wide">Area pincode</h3>
        </div>
        <Field label="Pincode" hint="6-digit Indian pincode">
          <input
            className={inputCls}
            style={{ borderColor: PropTheme.border, background: PropTheme.surfaceAlt, color: 'white' }}
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit pincode"
            value={s.pincode ?? ''}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6);
              set('pincode', v);
              if (v.length !== 6) set('locationSaved', false);
            }}
          />
        </Field>

        {/* Choose / Use my current location */}
        <button
          onClick={useCurrentLocation}
          disabled={isLocating}
          className="w-full mt-2 flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01] disabled:opacity-60"
          style={{
            background: PropTheme.brandTint,
            border: `1px solid rgba(249,115,22,0.45)`,
          }}
        >
          {isLocating
            ? <Loader2 size={16} className="text-orange-400 animate-spin" />
            : <Locate size={16} className="text-orange-400" />}
          <span className="text-[13px] font-black" style={{ color: PropTheme.brand }}>
            {isLocating ? 'Detecting location…' : 'Use my current location'}
          </span>
        </button>

        {locErr && (
          <p className="text-xs font-bold text-red-400 mt-3">{locErr}</p>
        )}
      </div>

      {/* ── Card 2 — Detected-location preview (before save) ── */}
      {hasDetection && !isLocating && !s.locationSaved && (
        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background: 'rgba(249,115,22,0.06)',
            border: `1px solid rgba(249,115,22,0.45)`,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(249,115,22,0.18)' }}
            >
              <Locate size={15} className="text-orange-400" />
            </div>
            <h4 className="text-sm font-black text-orange-300 tracking-wide">
              We detected your location
            </h4>
          </div>

          {/* Area — editable */}
          <PreviewField icon={MapPin} label="Area">
            <input
              className="w-full bg-transparent outline-none text-sm font-bold text-white placeholder:text-white/30"
              placeholder="Area / neighborhood"
              value={detectedArea}
              onChange={(e) => setDetectedArea(e.target.value)}
            />
          </PreviewField>

          {/* Candidate neighborhood chips */}
          {candidates.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 ml-[68px]">
              {candidates.map((c) => {
                const selected = detectedArea.trim().toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    onClick={() => setDetectedArea(c)}
                    className="px-2.5 py-1 rounded-full text-[10.5px] font-extrabold cursor-pointer transition-colors"
                    style={{
                      background: selected ? PropTheme.brand : 'rgba(255,255,255,0.04)',
                      color: selected ? '#fff' : PropTheme.brand,
                      border: `1px solid ${selected ? PropTheme.brand : 'rgba(249,115,22,0.45)'}`,
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          )}

          {/* City — read-only */}
          {detectedCity && (
            <PreviewRow icon={Building2} label="City" value={detectedCity} />
          )}
          {/* State — read-only */}
          {detectedState && (
            <PreviewRow icon={Globe} label="State" value={detectedState} />
          )}
          {/* Address — read-only */}
          {detectedAddress && (
            <PreviewRow icon={Home} label="Address" value={detectedAddress} multi />
          )}
          {/* GPS — read-only */}
          {detectedLat != null && detectedLng != null && (
            <PreviewRow
              icon={Crosshair}
              label="GPS"
              value={`${detectedLat.toFixed(5)}, ${detectedLng.toFixed(5)}`}
            />
          )}

          {/* Pincode — editable, auto-filled */}
          <PreviewField icon={Mail} label="Pincode">
            <input
              className="w-full bg-transparent outline-none text-sm font-bold text-white placeholder:text-white/30"
              placeholder="6-digit pincode"
              inputMode="numeric"
              maxLength={6}
              value={detectedPincode}
              onChange={(e) => setDetectedPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </PreviewField>

          {/* Save + Discard buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={resetDetection}
              className="flex-1 py-2.5 rounded-lg text-xs font-black cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: PropTheme.textSecondary,
                border: `1px solid ${PropTheme.border}`,
              }}
            >
              Discard
            </button>
            <button
              onClick={saveDetectedLocation}
              disabled={!canSavePreview}
              className="flex-[2] py-2.5 rounded-lg text-xs font-black text-white cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              style={{
                background: PropTheme.brand,
                boxShadow: canSavePreview ? brandGlow(0.3) : undefined,
              }}
            >
              <CheckCircle2 size={14} /> Save this location
            </button>
          </div>
        </div>
      )}

      {/* ── Card 3 — Saved confirmation ── */}
      {s.locationSaved && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(34,197,94,0.06)',
            border: `1px solid rgba(34,197,94,0.45)`,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgb(34,197,94)' }}
            >
              <Check size={18} className="text-white" strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-green-400 tracking-wide">Location saved</p>
              <div className="flex items-center gap-1.5 mt-2">
                <MapPin size={13} className="text-white/55" />
                <p className="text-sm font-bold text-white truncate">{s.areaName || '—'}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Mail size={12} className="text-white/45" />
                <p className="text-xs font-bold text-white/65">Pincode: {s.pincode}</p>
              </div>
              {s.detectedCity && (
                <p className="text-[11px] text-white/45 mt-1">
                  {s.detectedCity}{s.detectedState ? `, ${s.detectedState}` : ''}
                </p>
              )}
              <p className="text-[11px] font-medium text-white/40 mt-2">
                These details will be used for your listing.
              </p>
              <button
                onClick={editSavedLocation}
                className="mt-3 text-[10.5px] font-black uppercase tracking-wider cursor-pointer text-orange-400 hover:text-orange-300"
              >
                Change location ›
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper: read-only preview row with icon + label + value.
function PreviewRow({
  icon: Icon, label, value, multi,
}: { icon: typeof MapPin; label: string; value: string; multi?: boolean }) {
  return (
    <div className="flex items-start gap-2 mt-2">
      <Icon size={13} className="text-white/55 mt-0.5 shrink-0" />
      <div className="w-14 text-[11px] font-bold text-white/55 shrink-0">{label}</div>
      <p
        className={`flex-1 text-[12.5px] font-extrabold text-white ${multi ? '' : 'truncate'}`}
        style={multi ? { lineHeight: 1.4 } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

// Helper: editable preview field with icon + label + input.
function PreviewField({
  icon: Icon, label, children,
}: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <Icon size={13} className="text-white/55 shrink-0" />
      <div className="w-14 text-[11px] font-bold text-white/55 shrink-0">{label}</div>
      <div
        className="flex-1 rounded-md px-3 py-2"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(249,115,22,0.30)' }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Step 5: Images + amenities ─────────────────────────────────────────────
const AMENITY_OPTIONS = [
  'Parking', 'Power Backup', 'Lift', '24/7 Security', 'Swimming Pool',
  'Gym', 'Garden', 'Clubhouse', 'CCTV', 'Water Supply', 'Gas Line',
  'WiFi', 'Smart Home', 'Solar Panels', 'Rainwater Harvesting',
];

function Step5({
  s, set, setS,
}: {
  s: WizardState;
  set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
  setS: React.Dispatch<React.SetStateAction<WizardState>>;
}) {
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const next = [...s.imageFiles];
    for (let i = 0; i < files.length && next.length < 10; i++) next.push(files[i]);
    set('imageFiles', next);
  };
  const removeImage = (i: number) =>
    setS((p) => ({ ...p, imageFiles: p.imageFiles.filter((_, idx) => idx !== i) }));
  const toggleAmenity = (a: string) =>
    setS((p) => ({
      ...p,
      amenities: p.amenities.includes(a)
        ? p.amenities.filter((x) => x !== a)
        : [...p.amenities, a],
    }));

  return (
    <>
      <StepHeader title="Add photos & amenities" subtitle="Up to 10 photos. Listings with photos get 5× more enquiries." />
      <Field label="Photos">
        <label
          className="block p-4 rounded-2xl border-2 border-dashed cursor-pointer text-center hover:bg-amber-50 transition-colors"
          style={{ borderColor: PropTheme.borderStrong }}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <ImageIcon size={28} className="mx-auto mb-2" style={{ color: PropTheme.brand }} />
          <p className="font-black text-sm" style={{ color: PropTheme.ink }}>
            Tap to add photos
          </p>
          <p className="text-xs" style={{ color: PropTheme.textMuted }}>
            JPG / PNG, up to 10 images
          </p>
        </label>
        {s.imageFiles.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
            {s.imageFiles.map((f, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border" style={{ borderColor: PropTheme.border }}>
                <img src={URL.createObjectURL(f)} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Field>
      <Field label="Amenities">
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => {
            const sel = s.amenities.includes(a);
            return (
              <button
                key={a}
                onClick={() => toggleAmenity(a)}
                className="px-3.5 py-2 rounded-full border text-[12px] font-bold"
                style={
                  sel
                    ? { background: PropTheme.brand, borderColor: PropTheme.brand, color: 'white' }
                    : { background: PropTheme.surfaceAlt, borderColor: PropTheme.border, color: PropTheme.textPrimary }
                }
              >
                {sel ? <Check size={11} className="inline mr-1" /> : <Plus size={11} className="inline mr-1" />}
                {a}
              </button>
            );
          })}
        </div>
      </Field>
    </>
  );
}

// ── Step 6: Property details + AI description ──────────────────────────────
// Category-conditional fields per Flutter step_6_property_details.dart.
//
//   Land:        landType (Land / JV-JD), acres, road width, frontage, agri / general /
//                highway / conversion / goodwill toggles, property nature, owner% / dev% / advance
//   Residential: resType, bedrooms, bathrooms, area, maintenance, floor, furnishing,
//                lift / power / gated / parking / security / balcony toggles
//   Commercial:  furnishing, area, lift / power / parking / security / washroom toggles
function Step6({
  s,
  setS,
  set,
}: {
  s: WizardState;
  setS: React.Dispatch<React.SetStateAction<WizardState>>;
  set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
}) {
  const d = s.details;
  const setD = (k: string, v: WizardState['details'][string]) =>
    setS((prev) => ({ ...prev, details: { ...prev.details, [k]: v } }));

  return (
    <>
      <StepHeader
        title="Property details"
        subtitle={
          s.category === 'land'
            ? 'Tell us about your land or JV/JD opportunity.'
            : s.category === 'residential'
              ? 'Share the configuration and features of your home.'
              : s.category === 'commercial'
                ? 'Share the configuration and features of your space.'
                : 'Share the configuration and features.'
        }
      />

      <Field label="Number of owners">
        <input
          className={inputCls}
          style={{ borderColor: PropTheme.border, background: PropTheme.surfaceAlt }}
          type="number"
          min={1}
          max={10}
          value={s.numberOfOwners}
          onChange={(e) =>
            set('numberOfOwners', Math.max(1, Number(e.target.value) || 1))
          }
        />
      </Field>

      {s.category === 'land' && <LandDetails d={d} setD={setD} />}
      {s.category === 'residential' && (
        <ResidentialDetails d={d} setD={setD} />
      )}
      {s.category === 'commercial' && (
        <CommercialDetails d={d} setD={setD} />
      )}

      <Field
        label="Description"
        hint="Optional but recommended. The AI helper drafts one from your inputs above."
      >
        <AiDescriptionField
          value={s.description}
          onChange={(v) => set('description', v)}
          context={{
            listingPurpose: s.listingPurpose,
            propertyCategory: s.category,
            propertySubType: s.subtype,
            areaName: s.areaName,
            pincode: s.pincode,
            amenities: [
              ...s.amenities,
              ...(d.lift === true ? ['Lift'] : []),
              ...(d.parking === true ? ['Car Parking'] : []),
              ...(d.power === true ? ['Power Backup'] : []),
              ...(d.security === true ? ['Security'] : []),
              ...(d.gated === true ? ['Gated Community'] : []),
              ...(d.balcony === true ? ['Balcony'] : []),
              ...(d.washroom === true ? ['Washroom'] : []),
            ],
            bhk: d.bedrooms ? `${d.bedrooms} BHK` : undefined,
            numberOfOwners: s.numberOfOwners,
          }}
        />
      </Field>
    </>
  );
}

// ─── Reusable detail UI ────────────────────────────────────────────────────
type DetailsBag = WizardState['details'];

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm font-semibold text-white/85">{label}</span>
      <div className="flex gap-2">
        {[
          { v: true, label: 'Yes' },
          { v: false, label: 'No' },
        ].map((o) => {
          const sel = value === o.v;
          return (
            <button
              key={o.label}
              onClick={() => onChange(o.v)}
              className="px-3.5 py-1.5 rounded-full border-2 text-[11.5px] font-bold cursor-pointer transition-all"
              style={
                sel
                  ? {
                      background: PropTheme.brand,
                      borderColor: PropTheme.brand,
                      color: 'white',
                    }
                  : {
                      background: PropTheme.surface,
                      borderColor: PropTheme.border,
                      color: 'rgba(255,255,255,0.7)',
                    }
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChoicePills({
  label,
  options,
  value,
  onChange,
  hint,
}: {
  label: string;
  options: string[];
  value?: string;
  onChange: (v: string | undefined) => void;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const sel = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(sel ? undefined : opt)}
              className="px-3.5 py-2 rounded-full border text-[12px] font-bold cursor-pointer transition-all"
              style={
                sel
                  ? {
                      background: PropTheme.brand,
                      borderColor: PropTheme.brand,
                      color: 'white',
                    }
                  : {
                      background: PropTheme.surface,
                      borderColor: PropTheme.border,
                      color: 'rgba(255,255,255,0.75)',
                    }
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  suffix,
}: {
  label: string;
  hint?: string;
  value?: string | number | boolean | null;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <input
          className={inputCls}
          style={{
            borderColor: PropTheme.border,
            background: PropTheme.surfaceAlt,
            paddingRight: suffix ? 60 : undefined,
          }}
          type="number"
          inputMode="decimal"
          min={0}
          placeholder={placeholder}
          value={(value as string | number | undefined) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && (
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none"
            style={{ color: PropTheme.textMuted }}
          >
            {suffix}
          </span>
        )}
      </div>
    </Field>
  );
}

function ToggleGroup({
  items,
  details,
  setD,
}: {
  items: { key: string; label: string }[];
  details: DetailsBag;
  setD: (k: string, v: boolean) => void;
}) {
  return (
    <div
      className="rounded-2xl border divide-y mb-5"
      style={{ borderColor: PropTheme.border }}
    >
      {items.map((it, i) => (
        <div key={it.key} className={i === 0 ? 'px-4' : 'px-4'}>
          <YesNo
            label={it.label}
            value={details[it.key] as boolean | undefined}
            onChange={(v) => setD(it.key, v)}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Land details ──────────────────────────────────────────────────────────
function LandDetails({
  d,
  setD,
}: {
  d: DetailsBag;
  setD: (k: string, v: WizardState['details'][string]) => void;
}) {
  const isJv = d.landType === 'jvjd';
  return (
    <>
      <ChoicePills
        label="Land type"
        options={['Land', 'JV / JD']}
        value={
          d.landType === 'land'
            ? 'Land'
            : d.landType === 'jvjd'
              ? 'JV / JD'
              : undefined
        }
        onChange={(v) =>
          setD('landType', v === 'JV / JD' ? 'jvjd' : v === 'Land' ? 'land' : undefined)
        }
      />

      {isJv && (
        <ChoicePills
          label="JV project type"
          options={['Apartment', 'Villa', 'Layout', 'Standalone Building']}
          value={d.jvProjectType as string | undefined}
          onChange={(v) => setD('jvProjectType', v)}
        />
      )}

      <NumberField
        label="Total area"
        suffix="acres"
        placeholder="e.g. 2.5"
        value={d.acres}
        onChange={(v) => setD('acres', v)}
      />
      <NumberField
        label="Road width"
        suffix="ft"
        placeholder="e.g. 30"
        value={d.roadWidth}
        onChange={(v) => setD('roadWidth', v)}
      />
      <NumberField
        label="Frontage"
        suffix="ft"
        placeholder="e.g. 60"
        value={d.frontage}
        onChange={(v) => setD('frontage', v)}
      />

      <ToggleGroup
        details={d}
        setD={setD}
        items={[
          { key: 'agri', label: 'Agricultural land?' },
          { key: 'general', label: 'General property (DC converted)?' },
          { key: 'highway', label: 'Highway-facing?' },
          { key: 'conversion', label: 'Land conversion done?' },
          ...(isJv ? [{ key: 'goodwill', label: 'Goodwill applicable?' }] : []),
        ]}
      />

      <ChoicePills
        label="Property nature"
        options={['Ancestral', 'Resale']}
        value={d.propertyNature as string | undefined}
        onChange={(v) => setD('propertyNature', v)}
      />

      {isJv && (
        <>
          <NumberField
            label="Owner share"
            suffix="%"
            placeholder="e.g. 40"
            value={d.ownerPercent}
            onChange={(v) => setD('ownerPercent', v)}
          />
          <NumberField
            label="Developer share"
            suffix="%"
            placeholder="e.g. 60"
            value={d.developerPercent}
            onChange={(v) => setD('developerPercent', v)}
          />
          <NumberField
            label="Advance amount"
            suffix="₹"
            placeholder="e.g. 5000000"
            value={d.advance}
            onChange={(v) => setD('advance', v)}
          />
        </>
      )}
    </>
  );
}

// ─── Residential details ───────────────────────────────────────────────────
function ResidentialDetails({
  d,
  setD,
}: {
  d: DetailsBag;
  setD: (k: string, v: WizardState['details'][string]) => void;
}) {
  return (
    <>
      <ChoicePills
        label="Residential type"
        options={[
          'Apartment',
          'Independent House',
          'Villa',
          'Builder Floor',
          'Studio',
          'Penthouse',
        ]}
        value={d.resType as string | undefined}
        onChange={(v) => setD('resType', v)}
      />
      <ChoicePills
        label="Bedrooms (BHK)"
        options={['1', '2', '3', '4', '5+']}
        value={d.bedrooms as string | undefined}
        onChange={(v) => setD('bedrooms', v)}
      />
      <ChoicePills
        label="Bathrooms"
        options={['1', '2', '3', '4', '5+']}
        value={d.bathrooms as string | undefined}
        onChange={(v) => setD('bathrooms', v)}
      />
      <NumberField
        label="Built-up area"
        suffix="sqft"
        placeholder="e.g. 1200"
        value={d.area}
        onChange={(v) => setD('area', v)}
      />
      <NumberField
        label="Floor"
        hint="Which floor is the property on? (0 for ground)"
        placeholder="e.g. 4"
        value={d.floor}
        onChange={(v) => setD('floor', v)}
      />
      <NumberField
        label="Monthly maintenance"
        suffix="₹"
        placeholder="e.g. 3500"
        value={d.maintenance}
        onChange={(v) => setD('maintenance', v)}
      />
      <ChoicePills
        label="Furnishing"
        options={['Furnished', 'Semi-furnished', 'Unfurnished']}
        value={d.furnishing as string | undefined}
        onChange={(v) => setD('furnishing', v)}
      />

      <ToggleGroup
        details={d}
        setD={setD}
        items={[
          { key: 'lift', label: 'Lift?' },
          { key: 'power', label: 'Power backup?' },
          { key: 'gated', label: 'Gated community?' },
          { key: 'parking', label: 'Car parking?' },
          { key: 'security', label: '24/7 security?' },
          { key: 'balcony', label: 'Balcony?' },
        ]}
      />
    </>
  );
}

// ─── Commercial details ────────────────────────────────────────────────────
function CommercialDetails({
  d,
  setD,
}: {
  d: DetailsBag;
  setD: (k: string, v: WizardState['details'][string]) => void;
}) {
  return (
    <>
      <ChoicePills
        label="Commercial type"
        options={[
          'Office',
          'Shop',
          'Showroom',
          'Warehouse',
          'Industrial',
          'Retail',
          'Godown',
        ]}
        value={d.commercialType as string | undefined}
        onChange={(v) => setD('commercialType', v)}
      />
      <NumberField
        label="Built-up area"
        suffix="sqft"
        placeholder="e.g. 800"
        value={d.area}
        onChange={(v) => setD('area', v)}
      />
      <ChoicePills
        label="Furnishing"
        options={['Furnished', 'Semi-furnished', 'Bare Shell']}
        value={d.furnishing as string | undefined}
        onChange={(v) => setD('furnishing', v)}
      />

      <ToggleGroup
        details={d}
        setD={setD}
        items={[
          { key: 'lift', label: 'Lift?' },
          { key: 'power', label: 'Power backup?' },
          { key: 'parking', label: 'Car parking?' },
          { key: 'security', label: '24/7 security?' },
          { key: 'washroom', label: 'Washroom inside?' },
        ]}
      />
    </>
  );
}

// ── Step 7: Pricing & legal — full Flutter parity ──────────────────────────
// Mirrors lib/screens/properties/post_property/steps/step_7_pricing_legal.dart
function Step7({
  s,
  setS,
  set,
}: {
  s: WizardState;
  setS: React.Dispatch<React.SetStateAction<WizardState>>;
  set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
}) {
  const setStep7 = <K extends keyof Step7State>(k: K, v: Step7State[K]) =>
    setS((prev) => ({ ...prev, step7: { ...prev.step7, [k]: v } }));

  return (
    <>
      <StepHeader
        title="Pricing & legal"
        subtitle="Set your price and share the legal, tax and possession details."
      />

      {/* ── Price details ── */}
      <Step7Card title="Price details">
        <NumberField
          label="Total price"
          suffix="₹"
          placeholder="Enter amount"
          value={s.price}
          onChange={(v) => set('price', Number(v) || undefined)}
        />
        {s.price ? (
          <p className="-mt-3 mb-4 text-sm font-bold" style={{ color: PropTheme.brand }}>
            {formatINR(s.price)}
            {s.priceUnit === 'perAcre' && ' / acre'}
            {s.priceUnit === 'perSqFt' && ' / sqft'}
          </p>
        ) : null}
        <ChoicePills
          label="Price unit"
          options={['Per Acre', 'Per Sq Ft', 'Total Price']}
          value={
            s.priceUnit === 'perAcre'
              ? 'Per Acre'
              : s.priceUnit === 'perSqFt'
                ? 'Per Sq Ft'
                : undefined
          }
          onChange={(v) => {
            if (v === 'Per Acre') set('priceUnit', 'perAcre');
            else if (v === 'Per Sq Ft') set('priceUnit', 'perSqFt');
          }}
        />
        <YesNoRow
          label="Price negotiable?"
          value={s.step7.negotiable}
          onChange={(v) => setStep7('negotiable', v)}
        />
      </Step7Card>

      {/* ── Advance & booking ── */}
      <Step7Card title="Advance & booking">
        <NumberField label="Advance amount" suffix="₹" placeholder="Enter amount"
          value={s.step7.advance}
          onChange={(v) => setStep7('advance', v)} />
        <NumberField label="Booking amount (optional)" suffix="₹" placeholder="Enter amount"
          value={s.step7.booking}
          onChange={(v) => setStep7('booking', v)} />
        <YesNoRow label="Is advance refundable?"
          value={s.step7.advanceRefundable}
          onChange={(v) => setStep7('advanceRefundable', v)} />
      </Step7Card>

      {/* ── Possession ── */}
      <Step7Card title="Possession timeline">
        <ChoicePills
          label="When can the buyer move in?"
          options={['Immediate', 'Within 3 Months', 'Within 6 Months', 'Under Construction']}
          value={
            s.step7.possession === 'immediate' ? 'Immediate'
              : s.step7.possession === '3m' ? 'Within 3 Months'
                : s.step7.possession === '6m' ? 'Within 6 Months'
                  : s.step7.possession === 'under_construction' ? 'Under Construction'
                    : undefined
          }
          onChange={(v) =>
            setStep7('possession',
              v === 'Immediate' ? 'immediate'
                : v === 'Within 3 Months' ? '3m'
                  : v === 'Within 6 Months' ? '6m'
                    : v === 'Under Construction' ? 'under_construction'
                      : undefined,
            )
          }
        />
      </Step7Card>

      {/* ── Legal & documents ── */}
      <Step7Card title="Legal & documentation">
        <YesNoRow label="Title clear?"
          value={s.step7.titleClear}
          onChange={(v) => setStep7('titleClear', v)} />
        <YesNoRow label="Encumbrance?"
          value={s.step7.encumbrance}
          onChange={(v) => setStep7('encumbrance', v)} />
        <MultiSelectChips
          label="Approved by"
          options={['HMDA', 'DTCP', 'Gram Panchayat', 'Corporation', 'Not Applicable']}
          value={s.step7.approvedBy}
          onChange={(arr) => setStep7('approvedBy', arr)}
        />
        <MultiSelectChips
          label="Documents available"
          options={['Sale Deed', 'Link Documents', 'EC', 'Pattadar Passbook', 'Approved Layout', 'Building Plan Approval']}
          value={s.step7.documents}
          onChange={(arr) => setStep7('documents', arr)}
        />
      </Step7Card>

      {/* ── Tax & dues ── */}
      <Step7Card title="Tax & dues">
        <YesNoRow label="Property tax paid up-to-date?"
          value={s.step7.taxPaid}
          onChange={(v) => setStep7('taxPaid', v)} />
        <YesNoRow label="Any pending dues?"
          value={s.step7.pendingDues}
          onChange={(v) => setStep7('pendingDues', v)} />
        {s.step7.pendingDues === true && (
          <NumberField label="Pending amount" suffix="₹" placeholder="Enter amount"
            value={s.step7.pendingAmount}
            onChange={(v) => setStep7('pendingAmount', v)} />
        )}
      </Step7Card>

      {/* ── Brokerage ── */}
      <Step7Card title="Brokerage & commission">
        <YesNoRow label="Brokerage applicable?"
          value={s.step7.brokerageApplicable}
          onChange={(v) => setStep7('brokerageApplicable', v)} />
        {s.step7.brokerageApplicable === true && (
          <>
            <NumberField label="Brokerage %" suffix="%" placeholder="Enter percentage"
              value={s.step7.brokeragePercent}
              onChange={(v) => setStep7('brokeragePercent', v)} />
            <ChoicePills label="Brokerage payable by"
              options={['Buyer', 'Seller', 'Both']}
              value={s.step7.brokeragePayableBy}
              onChange={(v) =>
                setStep7('brokeragePayableBy', v as 'Buyer' | 'Seller' | 'Both' | undefined)
              }
            />
          </>
        )}
      </Step7Card>

      {/* ── Loan ── */}
      <Step7Card title="Bank loan / EMI">
        <YesNoRow label="Bank loan / EMI available?"
          value={s.step7.loanAvailable}
          onChange={(v) => setStep7('loanAvailable', v)} />
      </Step7Card>
    </>
  );
}

// ─── Step 7 helper components ──────────────────────────────────────────────
function Step7Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5 mb-4"
      style={{
        background: PropTheme.surface,
        borderColor: PropTheme.border,
        boxShadow: PropTheme.shadowSoft,
      }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4"
        style={{ color: PropTheme.brand }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function YesNoRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 mb-2 flex-wrap gap-2">
      <span className="text-sm font-medium text-white/85">{label}</span>
      <div className="flex gap-2">
        {[
          { v: true, label: 'Yes' },
          { v: false, label: 'No' },
        ].map((o) => {
          const sel = value === o.v;
          return (
            <button
              key={o.label}
              onClick={() => onChange(o.v)}
              className="px-4 py-1.5 rounded-full border text-[12px] font-bold cursor-pointer transition-all"
              style={
                sel
                  ? { background: PropTheme.brand, borderColor: PropTheme.brand, color: 'white' }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      borderColor: PropTheme.border,
                      color: 'rgba(255,255,255,0.75)',
                    }
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiSelectChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (arr: string[]) => void;
}) {
  const toggle = (o: string) => {
    if (value.includes(o)) onChange(value.filter((x) => x !== o));
    else onChange([...value, o]);
  };
  return (
    <Field label={label} hint={`${value.length} selected`}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const sel = value.includes(o);
          return (
            <button
              key={o}
              onClick={() => toggle(o)}
              className="px-3.5 py-2 rounded-full border text-[12px] font-bold cursor-pointer transition-all"
              style={
                sel
                  ? { background: PropTheme.brand, borderColor: PropTheme.brand, color: 'white' }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      borderColor: PropTheme.border,
                      color: 'rgba(255,255,255,0.75)',
                    }
              }
            >
              {sel ? <Check size={11} className="inline mr-1" /> : null}
              {o}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

// ── Step 8: Review & verify ────────────────────────────────────────────────
function Step8({ s, set }: { s: WizardState; set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void }) {
  return (
    <>
      <StepHeader
        title="Review & submit"
        subtitle="Verify everything before submitting for approval."
      />

      {/* ── Your details ── */}
      <Step7Card title="Your details">
        <Field label="Full name">
          <input
            className={inputCls}
            style={{ borderColor: PropTheme.border, background: PropTheme.surfaceAlt }}
            placeholder="As on PAN / Aadhaar"
            value={s.posterName ?? ''}
            onChange={(e) => set('posterName', e.target.value)}
          />
        </Field>
        <Field
          label="Mobile number"
          hint="10-digit Indian mobile. We send an OTP to verify."
        >
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold"
              style={{ color: PropTheme.textMuted }}
            >
              +91
            </span>
            <input
              className={inputCls + ' pl-12'}
              style={{ borderColor: PropTheme.border, background: PropTheme.surfaceAlt }}
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile"
              value={s.posterPhone ?? ''}
              onChange={(e) => {
                set('posterPhone', e.target.value.replace(/\D/g, '').slice(0, 10));
                // If phone changes after OTP, reset verification.
                if (s.otpVerified) set('otpVerified', false);
              }}
            />
          </div>
        </Field>

        <Step8OTPFlow s={s} set={set} />

        {!s.otpVerified && (
          <div
            className="mt-3 p-3 rounded-xl flex items-start gap-2"
            style={{
              background: 'rgba(249,115,22,0.10)',
              border: `1px solid rgba(249,115,22,0.35)`,
            }}
          >
            <span
              className="text-[11px] font-medium leading-relaxed"
              style={{ color: PropTheme.brand }}
            >
              Enter your name, a valid 10-digit mobile number, then verify the
              OTP we send to enable submission.
            </span>
          </div>
        )}
      </Step7Card>

      {/* ── Property summary ── */}
      <Step7Card title="Property summary">
        <ReviewBlock
          items={[
            ['Listing purpose', s.listingPurpose ?? '—'],
            ['Category', s.category ?? '—'],
            ['Sub-type', s.subtype ?? '—'],
            ['Ownership role',
              s.ownership === 'other' ? s.ownershipOther ?? 'Other' : s.ownership ?? '—'],
          ]}
        />
        <div className="h-3" />
        <ReviewBlock
          items={[
            ['Location', `${s.areaName ?? '—'} · PIN ${s.pincode ?? '—'}`],
            ['Photos', `${s.imageFiles.length} attached`],
            ['Amenities',
              s.amenities.length > 0 ? s.amenities.join(', ') : 'None'],
          ]}
        />
      </Step7Card>

      {/* ── Property details (step 6) ── */}
      {Object.keys(s.details).length > 0 && (
        <Step7Card title="Property details">
          <ReviewBlock
            items={Object.entries(s.details)
              .filter(([, v]) => v !== undefined && v !== null && v !== '')
              .map(([k, v]) => [
                titleCase(k),
                typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v),
              ])}
          />
        </Step7Card>
      )}

      {/* ── Pricing & legal (step 7) ── */}
      <Step7Card title="Pricing & legal">
        <ReviewBlock items={collectStep7Review(s)} />
      </Step7Card>
    </>
  );
}

// ─── Step 8 helpers ────────────────────────────────────────────────────────
function titleCase(s: string): string {
  return s
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function collectStep7Review(s: WizardState): [string, string][] {
  const out: [string, string][] = [];
  const yn = (v?: boolean | null) => (v == null ? '—' : v ? 'Yes' : 'No');
  if (s.price) {
    out.push([
      'Price',
      s.price >= 10000000
        ? `₹${(s.price / 10000000).toFixed(2)} Cr`
        : s.price >= 100000
          ? `₹${(s.price / 100000).toFixed(2)} L`
          : `₹${s.price}`,
    ]);
  }
  out.push([
    'Price unit',
    s.priceUnit === 'perAcre' ? 'Per Acre' : 'Per Sq Ft',
  ]);
  if (s.step7.negotiable != null) out.push(['Negotiable', yn(s.step7.negotiable)]);
  if (s.step7.advance) out.push(['Advance', `₹${s.step7.advance}`]);
  if (s.step7.possession) {
    const label =
      s.step7.possession === 'immediate'
        ? 'Immediate'
        : s.step7.possession === '3m'
          ? 'Within 3 months'
          : s.step7.possession === '6m'
            ? 'Within 6 months'
            : 'Under construction';
    out.push(['Possession', label]);
  }
  if (s.step7.titleClear != null)
    out.push(['Title clear', yn(s.step7.titleClear)]);
  if (s.step7.approvedBy.length)
    out.push(['Approved by', s.step7.approvedBy.join(', ')]);
  if (s.step7.documents.length)
    out.push(['Documents', s.step7.documents.join(', ')]);
  if (s.step7.taxPaid != null) out.push(['Tax paid', yn(s.step7.taxPaid)]);
  if (s.step7.loanAvailable != null)
    out.push(['Loan available', yn(s.step7.loanAvailable)]);
  if (s.step7.brokerageApplicable === true) {
    if (s.step7.brokeragePercent)
      out.push(['Brokerage', `${s.step7.brokeragePercent}%`]);
    if (s.step7.brokeragePayableBy)
      out.push(['Payable by', s.step7.brokeragePayableBy]);
  }
  return out;
}

function ReviewBlock({ items }: { items: [string, string][] }) {
  if (items.length === 0)
    return (
      <p className="text-xs" style={{ color: PropTheme.textMuted }}>
        No data captured yet.
      </p>
    );
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: PropTheme.surfaceAlt,
        borderColor: PropTheme.border,
      }}
    >
      {items.map(([label, value], i) => (
        <div
          key={i}
          className={`flex items-start gap-3 px-3 py-2.5 ${
            i < items.length - 1 ? 'border-b' : ''
          }`}
          style={{ borderColor: PropTheme.border }}
        >
          <span
            className="text-[10px] font-medium uppercase tracking-[0.25em] shrink-0"
            style={{ color: PropTheme.textMuted, minWidth: 116 }}
          >
            {label}
          </span>
          <span
            className="text-[13px] font-semibold flex-1 break-words"
            style={{ color: PropTheme.textPrimary }}
          >
            {value || '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── OTP flow ─ web port of Flutter's verifyPhoneNumber UX ─────────────────
// Real Firebase Phone Auth on web requires RecaptchaVerifier setup, which
// adds significant complexity. For now we ship a clean mocked OTP UI that
// matches Flutter pixel-by-pixel and accepts any 6-digit code as valid.
// Wire to firebase.auth.signInWithPhoneNumber when you're ready.
function Step8OTPFlow({
  s,
  set,
}: {
  s: WizardState;
  set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'verified' | 'error'>(
    s.otpVerified ? 'verified' : 'idle',
  );
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = (s.posterPhone?.length ?? 0) === 10 && state !== 'sending';

  const sendOtp = async () => {
    if (!canSend) return;
    setState('sending');
    setError(null);
    // Simulate latency.
    await new Promise((r) => setTimeout(r, 1100));
    setState('sent');
  };

  const verifyOtp = async () => {
    if (otp.length < 4) return;
    setVerifying(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 500));
    // Mocked acceptance — any 6-digit code passes.
    if (otp.length === 6) {
      set('otpVerified', true);
      setState('verified');
    } else {
      setError('Invalid OTP. Please re-enter.');
    }
    setVerifying(false);
  };

  if (state === 'verified') {
    return (
      <div
        className="mt-3 p-3 rounded-xl flex items-center gap-3"
        style={{
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.45)',
        }}
      >
        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <Check size={14} className="text-white" strokeWidth={3} />
        </div>
        <span className="text-sm font-bold text-emerald-400">
          Mobile verified
        </span>
      </div>
    );
  }

  if (state === 'sending') {
    return (
      <div
        className="mt-3 p-3 rounded-xl flex items-center gap-3"
        style={{ background: 'rgba(249,115,22,0.08)' }}
      >
        <Loader2 size={16} className="animate-spin" style={{ color: PropTheme.brand }} />
        <span
          className="text-[13px] font-bold"
          style={{ color: PropTheme.brand }}
        >
          Sending OTP to your phone…
        </span>
      </div>
    );
  }

  if (state === 'sent') {
    return (
      <div
        className="mt-3 p-3 rounded-xl"
        style={{
          background: 'rgba(249,115,22,0.08)',
          border: '1px solid rgba(249,115,22,0.4)',
        }}
      >
        <p
          className="text-[13px] font-bold mb-3"
          style={{ color: PropTheme.brand }}
        >
          Enter the 6-digit OTP we just sent
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••••"
            className="flex-1 px-3 py-3 rounded-md text-base font-black tracking-[0.5em] outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${PropTheme.brand}66`,
              color: PropTheme.ink,
            }}
          />
          <button
            onClick={verifyOtp}
            disabled={otp.length < 4 || verifying}
            className="px-5 rounded-md text-[12px] font-black tracking-wider uppercase cursor-pointer disabled:opacity-40"
            style={{
              background: PropTheme.brand,
              color: 'white',
            }}
          >
            {verifying ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs font-bold text-red-400">{error}</p>
        )}
        <button
          onClick={sendOtp}
          className="mt-2 text-xs font-black underline cursor-pointer"
          style={{ color: PropTheme.brand }}
        >
          Resend OTP
        </button>
      </div>
    );
  }

  // idle / error
  return (
    <div className="mt-3">
      <button
        onClick={sendOtp}
        disabled={!canSend}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-md text-[13px] font-black tracking-wide cursor-pointer transition-all disabled:opacity-40"
        style={{
          background: canSend ? PropTheme.brandGradient : PropTheme.surfaceAlt,
          color: canSend ? 'white' : PropTheme.textMuted,
          boxShadow: canSend ? brandGlow(0.22) : 'none',
        }}
      >
        <Check size={15} />
        Send OTP to verify
      </button>
      {error && (
        <p className="mt-2 text-xs font-bold text-red-400">{error}</p>
      )}
    </div>
  );
}
