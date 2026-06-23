import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Home,
  Building2,
  Store,
  Layers,
  Paintbrush,
  Zap,
  Droplets,
  UtensilsCrossed,
  Bath,
  Sofa,
  BedDouble,
  Grid3X3,
  User,
  Mail,
  Upload,
  FileText,
  StickyNote,
  Clock,
  Calendar,
  Target,
  Check,
  X,
  Send,
  ShieldCheck,
  Star,
  Package,
  Crown,
  ChevronDown,
  AlertCircle,
  Hash,
  Layers2,
} from 'lucide-react';
import { RFQStepBar } from './RFQStepBar';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RenovationRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface RFQData {
  city: string;
  locality: string;
  pincode: string;
  address: string;
  propertyType: string;
  projectType: string;
  area: string;
  bhk: string;
  floors: string;
  rooms: string;
  scopeOfWork: string[];
  designPreference: string;
  budgetRange: string;
  timeline: string;
  materialPreference: string;
  notes: string;
  uploadedFiles: string[];
  fullName: string;
  phone: string;
  email: string;
  rfqNumber: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TOTAL_STEPS = 11;

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Apartment', Icon: Building2, desc: 'Flat / Condo' },
  { id: 'villa', label: 'Villa', Icon: Home, desc: 'Independent villa' },
  { id: 'independent-house', label: 'Independent House', Icon: Home, desc: 'Standalone home' },
  { id: 'office', label: 'Office', Icon: Layers, desc: 'Commercial office' },
  { id: 'retail', label: 'Retail / Commercial', Icon: Store, desc: 'Shop / showroom' },
];

const PROJECT_TYPES = [
  { id: 'full', label: 'Full Renovation', desc: 'Complete overhaul, inside and out', color: 'amber' },
  { id: 'partial', label: 'Partial Renovation', desc: 'Selected rooms or sections', color: 'blue' },
  { id: 'interior', label: 'Interior Only', desc: 'Focus on indoor spaces', color: 'violet' },
  { id: 'exterior', label: 'Exterior Only', desc: 'Facade, landscaping, outdoors', color: 'emerald' },
];

const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK', 'Open Plan', 'Studio'];

const SCOPE_ITEMS = [
  { id: 'kitchen', label: 'Kitchen', Icon: UtensilsCrossed },
  { id: 'bathroom', label: 'Bathroom', Icon: Bath },
  { id: 'living', label: 'Living Room', Icon: Sofa },
  { id: 'bedroom', label: 'Bedroom', Icon: BedDouble },
  { id: 'flooring', label: 'Flooring', Icon: Grid3X3 },
  { id: 'painting', label: 'Painting', Icon: Paintbrush },
  { id: 'electrical', label: 'Electrical', Icon: Zap },
  { id: 'plumbing', label: 'Plumbing', Icon: Droplets },
];

const DESIGN_PREFERENCES = [
  { id: 'modern', label: 'Modern', emoji: '🏙️', desc: 'Clean lines, contemporary feel' },
  { id: 'traditional', label: 'Traditional', emoji: '🏛️', desc: 'Classic, timeless aesthetics' },
  { id: 'minimal', label: 'Minimal', emoji: '◻️', desc: 'Less is more philosophy' },
  { id: 'luxury', label: 'Luxury', emoji: '✨', desc: 'Premium, opulent finishes' },
  { id: 'not-sure', label: 'Not Sure', emoji: '💭', desc: "I'll decide with the designer" },
];

const BUDGET_RANGES = [
  { id: '<5L', label: '< ₹5 Lakhs', sub: 'Essential renovation' },
  { id: '5-10L', label: '₹5 – ₹10 Lakhs', sub: 'Standard quality work' },
  { id: '10-20L', label: '₹10 – ₹20 Lakhs', sub: 'Premium renovation' },
  { id: '20L+', label: '₹20 Lakhs+', sub: 'Luxury transformation' },
];

const TIMELINES = [
  { id: 'immediate', label: 'Immediate', sub: 'Start within 1–2 weeks', Icon: Clock },
  { id: '1-3months', label: '1 – 3 Months', sub: 'Planning & scheduling', Icon: Calendar },
  { id: 'flexible', label: 'Flexible', sub: 'No fixed timeline', Icon: Target },
];

const MATERIAL_LEVELS = [
  {
    id: 'basic',
    label: 'Basic',
    Icon: Package,
    desc: 'Functional & cost-effective materials',
    items: ['Standard tiles', 'Contractor-grade paint', 'Basic hardware'],
    color: 'slate',
  },
  {
    id: 'standard',
    label: 'Standard',
    Icon: Star,
    desc: 'Quality materials with good durability',
    items: ['Mid-range tiles', 'Asian Paints / Berger', 'Branded fixtures'],
    color: 'blue',
    recommended: true,
  },
  {
    id: 'premium',
    label: 'Premium',
    Icon: Crown,
    desc: 'Top-of-the-line products & finishes',
    items: ['Italian / designer tiles', 'Nerolac Impression', 'Luxury fittings'],
    color: 'amber',
  },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────

const ProgressBar = ({ step }: { step: number }) => (
  <div className="px-5 pt-5 pb-2">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
        Step {step} of {TOTAL_STEPS}
      </span>
      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
        {Math.round((step / TOTAL_STEPS) * 100)}%
      </span>
    </div>
    <div className="h-1.5 bg-[var(--paper)] rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'linear-gradient(90deg, #f97316, #ef4444)' }}
        initial={{ width: `${((step - 1) / TOTAL_STEPS) * 100}%` }}
        animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />
    </div>
    {/* Step dots */}
    <div className="flex gap-[3px] mt-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-[3px] rounded-full transition-all duration-300 ${
            i < step ? 'bg-orange-400' : 'bg-[var(--paper)]'
          }`}
        />
      ))}
    </div>
  </div>
);

const StepLabel = ({ step, label }: { step: number; label: string }) => (
  <div className="px-5 pt-3 pb-1">
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1"
    >
      Step {step}
    </motion.p>
    <motion.h2
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="text-[22px] font-black text-[var(--ink)] leading-tight"
    >
      {label}
    </motion.h2>
  </div>
);

const NavButtons = ({
  onBack,
  onNext,
  nextLabel = 'Continue',
  nextDisabled = false,
  isLast = false,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLast?: boolean;
}) => (
  <div className="px-5 pb-8 pt-3 flex gap-3 shrink-0">
    <button
      onClick={onBack}
      className="w-12 h-12 rounded-2xl bg-[var(--paper)] flex items-center justify-center text-[var(--muted)] hover:bg-[var(--line)] transition-colors shrink-0"
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
    <button
      onClick={onNext}
      disabled={nextDisabled}
      className={`flex-1 h-12 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 ${
        nextDisabled
          ? 'bg-[var(--paper)] text-[var(--muted)] cursor-not-allowed'
          : isLast
          ? 'text-white shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.01]'
          : 'bg-luxury-dark text-white hover:bg-luxury-dark'
      }`}
      style={!nextDisabled && isLast ? { background: 'linear-gradient(90deg, #f97316, #ef4444)' } : {}}
    >
      {nextLabel}
      {!nextDisabled && <ArrowRight className="w-4 h-4" />}
    </button>
  </div>
);

const SelectChip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-xl border-2 text-[13px] font-bold transition-all duration-150 ${
      active
        ? 'border-orange-500 bg-orange-50 text-orange-700'
        : 'border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--line)] hover:bg-[var(--bg)]'
    }`}
  >
    {children}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export function RenovationRFQFlow({ onBack, onComplete }: RenovationRFQFlowProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [data, setData] = useState<RFQData>({
    city: '',
    locality: '',
    pincode: '',
    address: '',
    propertyType: '',
    projectType: '',
    area: '',
    bhk: '',
    floors: '',
    rooms: '',
    scopeOfWork: [],
    designPreference: '',
    budgetRange: '',
    timeline: '',
    materialPreference: '',
    notes: '',
    uploadedFiles: [],
    fullName: '',
    phone: '',
    email: '',
    rfqNumber: `REN-${Date.now().toString().slice(-6)}`,
  });

  const set = (key: keyof RFQData) => (val: string) =>
    setData((d) => ({ ...d, [key]: val }));

  const toggleScope = (id: string) =>
    setData((d) => ({
      ...d,
      scopeOfWork: d.scopeOfWork.includes(id)
        ? d.scopeOfWork.filter((s) => s !== id)
        : [...d.scopeOfWork, id],
    }));

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const goPrev = () => {
    if (step === 1) { onBack(); return; }
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).map((f) => f.name);
    setData((d) => ({ ...d, uploadedFiles: [...d.uploadedFiles, ...files].slice(0, 5) }));
  };

  const removeFile = (name: string) =>
    setData((d) => ({ ...d, uploadedFiles: d.uploadedFiles.filter((f) => f !== name) }));

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
  };

  // ─── Success ───────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 bg-[var(--paper)] z-[90] flex flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-black text-[var(--ink)] mb-2"
        >
          RFQ Submitted!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[var(--muted)] text-sm max-w-xs leading-relaxed mb-5"
        >
          Our renovation experts will review your request and send competitive quotes within 24 hours.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-orange-50 border border-orange-100 rounded-2xl px-6 py-3 mb-6 w-full max-w-xs"
        >
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-0.5">Reference Number</p>
          <p className="text-xl font-black text-[var(--ink)]">{data.rfqNumber}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-xs space-y-2.5 mb-8"
        >
          {[
            { Icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50', text: 'Your data is fully encrypted and secure' },
            { Icon: Star, color: 'text-orange-500', bg: 'bg-orange-50', text: 'Get up to 5 competitive quotes from verified contractors' },
            { Icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50', text: 'No payment required at this stage' },
          ].map(({ Icon, color, bg, text }, i) => (
            <div key={i} className={`flex items-center gap-3 p-3.5 ${bg} rounded-2xl`}>
              <Icon className={`w-5 h-5 ${color} shrink-0`} />
              <p className="text-[12px] font-bold text-[var(--ink)] text-left leading-snug">{text}</p>
            </div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          onClick={onComplete}
          className="w-full max-w-xs py-4 bg-orange-500 text-white font-black rounded-2xl text-sm uppercase tracking-widest"
        >
          Back to Services
        </motion.button>
      </div>
    );
  }

  // ─── Steps ─────────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {

      // Step 1 — Location (4 fields)
      case 1:
        return (
          <div className="flex flex-col h-full">
            <StepLabel step={1} label="Where is your property?" />
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-3">
              <p className="text-[13px] text-[var(--muted)] leading-relaxed">
                Help us match you with local contractors in your area.
              </p>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">City *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="text"
                    value={data.city}
                    onChange={(e) => set('city')(e.target.value)}
                    placeholder="e.g. Bangalore, Mumbai…"
                    className="w-full h-13 h-[52px] pl-11 pr-4 rounded-2xl border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] font-semibold text-[14px] focus:outline-none focus:border-orange-400 transition-colors placeholder:text-[var(--muted)]"
                  />
                </div>
              </div>

              {/* Locality */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Locality / Area *</label>
                <input
                  type="text"
                  value={data.locality}
                  onChange={(e) => set('locality')(e.target.value)}
                  placeholder="e.g. Indiranagar, Koramangala…"
                  className="w-full h-[52px] px-4 rounded-2xl border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] font-semibold text-[14px] focus:outline-none focus:border-orange-400 transition-colors placeholder:text-[var(--muted)]"
                />
              </div>

              {/* Pincode */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                  PIN Code <span className="text-[var(--muted)] normal-case font-bold">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={data.pincode}
                  onChange={(e) => set('pincode')(e.target.value)}
                  placeholder="e.g. 560038"
                  maxLength={6}
                  className="w-full h-[52px] px-4 rounded-2xl border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] font-semibold text-[14px] focus:outline-none focus:border-orange-400 transition-colors placeholder:text-[var(--muted)]"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                  Full Address <span className="text-[var(--muted)] normal-case font-bold">(optional)</span>
                </label>
                <textarea
                  value={data.address}
                  onChange={(e) => set('address')(e.target.value)}
                  placeholder="Flat no., building name, street, landmark…"
                  rows={2}
                  className="w-full px-4 pt-3.5 pb-3 rounded-2xl border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] font-medium text-[14px] focus:outline-none focus:border-orange-400 transition-colors placeholder:text-[var(--muted)] resize-none"
                />
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-orange-50 rounded-2xl border border-orange-100">
                <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-orange-700 font-bold leading-snug">
                  Full address is only shared with shortlisted contractors after your approval.
                </p>
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.city.trim() || !data.locality.trim()} />
          </div>
        );

      // Step 2 — Property Type
      case 2:
        return (
          <div className="flex flex-col h-full">
            <StepLabel step={2} label="Property type" />
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-3">
              <p className="text-[13px] text-[var(--muted)]">Select the type of space being renovated.</p>
              <div className="space-y-2.5">
                {PROPERTY_TYPES.map((pt) => {
                  const active = data.propertyType === pt.id;
                  return (
                    <button
                      key={pt.id}
                      onClick={() => set('propertyType')(pt.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-150 text-left ${
                        active
                          ? 'border-orange-500 bg-orange-50 shadow-sm shadow-orange-100'
                          : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--line)] hover:bg-[var(--bg)]'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-orange-500' : 'bg-[var(--paper)]'}`}>
                        <pt.Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-[var(--muted)]'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-black text-[14px] ${active ? 'text-orange-700' : 'text-[var(--ink)]'}`}>{pt.label}</p>
                        <p className="text-[12px] text-[var(--muted)] mt-0.5">{pt.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${active ? 'bg-orange-500 border-orange-500' : 'border-[var(--line)]'}`}>
                        {active && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.propertyType} />
          </div>
        );

      // Step 3 — Project Type
      case 3:
        return (
          <div className="flex flex-col h-full">
            <StepLabel step={3} label="Project type" />
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-3">
              <p className="text-[13px] text-[var(--muted)]">What scope of renovation are you planning?</p>
              <div className="grid grid-cols-2 gap-3">
                {PROJECT_TYPES.map((pt) => {
                  const active = data.projectType === pt.id;
                  const colorMap: Record<string, string> = {
                    amber: active ? 'border-amber-500 bg-amber-50' : 'border-[var(--line)] bg-[var(--paper)] hover:border-amber-200',
                    blue: active ? 'border-blue-500 bg-blue-50' : 'border-[var(--line)] bg-[var(--paper)] hover:border-blue-200',
                    violet: active ? 'border-violet-500 bg-violet-50' : 'border-[var(--line)] bg-[var(--paper)] hover:border-violet-200',
                    emerald: active ? 'border-emerald-500 bg-emerald-50' : 'border-[var(--line)] bg-[var(--paper)] hover:border-emerald-200',
                  };
                  const dotMap: Record<string, string> = {
                    amber: active ? 'bg-amber-500 border-amber-500' : 'border-[var(--line)]',
                    blue: active ? 'bg-blue-500 border-blue-500' : 'border-[var(--line)]',
                    violet: active ? 'bg-violet-500 border-violet-500' : 'border-[var(--line)]',
                    emerald: active ? 'bg-emerald-500 border-emerald-500' : 'border-[var(--line)]',
                  };
                  const labelMap: Record<string, string> = {
                    amber: active ? 'text-amber-700' : 'text-[var(--ink)]',
                    blue: active ? 'text-blue-700' : 'text-[var(--ink)]',
                    violet: active ? 'text-violet-700' : 'text-[var(--ink)]',
                    emerald: active ? 'text-emerald-700' : 'text-[var(--ink)]',
                  };
                  return (
                    <button
                      key={pt.id}
                      onClick={() => set('projectType')(pt.id)}
                      className={`flex flex-col p-4 rounded-2xl border-2 transition-all duration-150 text-left ${colorMap[pt.color]}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mb-3 ${dotMap[pt.color]}`}>
                        {active && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <p className={`font-black text-[13px] leading-tight mb-1.5 ${labelMap[pt.color]}`}>{pt.label}</p>
                      <p className="text-[11px] text-[var(--muted)] leading-snug">{pt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.projectType} />
          </div>
        );

      // Step 4 — Area & BHK
      case 4:
        return (
          <div className="flex flex-col h-full">
            <StepLabel step={4} label="Property dimensions" />
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-4">
              <p className="text-[13px] text-[var(--muted)]">
                Help us estimate material quantities and project scope accurately.
              </p>

              {/* Area */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Total Built-up Area (sq.ft) *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={data.area}
                    onChange={(e) => set('area')(e.target.value)}
                    placeholder="e.g. 1200"
                    min="1"
                    className="w-full h-[52px] px-4 pr-16 rounded-2xl border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] font-bold text-[15px] focus:outline-none focus:border-orange-400 transition-colors placeholder:text-[var(--muted)]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-[var(--muted)] uppercase tracking-wider">
                    sq.ft
                  </span>
                </div>
                {data.area && (
                  <p className="text-[11px] text-[var(--muted)] pl-1">
                    ≈ {(parseFloat(data.area) * 0.0929).toFixed(1)} sq.m
                  </p>
                )}
              </div>

              {/* BHK / Config */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Configuration / BHK</label>
                <div className="flex flex-wrap gap-2">
                  {BHK_OPTIONS.map((opt) => (
                    <SelectChip key={opt} active={data.bhk === opt} onClick={() => set('bhk')(opt)}>
                      {opt}
                    </SelectChip>
                  ))}
                </div>
              </div>

              {/* Number of floors */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Number of Floors</label>
                <div className="flex flex-wrap gap-2">
                  {['Ground Floor', '1 Floor', '2 Floors', '3 Floors', '4+ Floors', 'Duplex', 'Triplex'].map((opt) => (
                    <SelectChip key={opt} active={data.floors === opt} onClick={() => set('floors')(opt)}>
                      {opt}
                    </SelectChip>
                  ))}
                </div>
              </div>

              {/* Number of rooms */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Total Rooms to Renovate</label>
                <div className="flex flex-wrap gap-2">
                  {['1 Room', '2 Rooms', '3 Rooms', '4 Rooms', '5 Rooms', '6+ Rooms', 'Entire Property'].map((opt) => (
                    <SelectChip key={opt} active={data.rooms === opt} onClick={() => set('rooms')(opt)}>
                      {opt}
                    </SelectChip>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-[var(--bg)] rounded-2xl">
                <p className="text-[11px] text-[var(--muted)] font-bold">
                  💡 Approximate estimates are fine — contractors will verify dimensions on site.
                </p>
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.area.trim()} />
          </div>
        );

      // Step 5 — Scope of Work
      case 5:
        return (
          <div className="flex flex-col h-full">
            <StepLabel step={5} label="Scope of work" />
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-3">
              <p className="text-[13px] text-[var(--muted)]">
                Select all areas you want renovated. <span className="font-bold text-[var(--muted)]">Multi-select allowed.</span>
              </p>

              <div className="grid grid-cols-2 gap-3">
                {SCOPE_ITEMS.map((item) => {
                  const active = data.scopeOfWork.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleScope(item.id)}
                      className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all duration-150 ${
                        active
                          ? 'border-orange-500 bg-orange-50 shadow-sm shadow-orange-100'
                          : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--line)] hover:bg-[var(--bg)]'
                      }`}
                    >
                      {active && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${active ? 'bg-orange-500' : 'bg-[var(--paper)]'}`}>
                        <item.Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-[var(--muted)]'}`} />
                      </div>
                      <span className={`text-[12px] font-black ${active ? 'text-orange-700' : 'text-[var(--ink)]'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {data.scopeOfWork.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-100 rounded-xl"
                >
                  <Check className="w-4 h-4 text-orange-500 shrink-0" />
                  <p className="text-[12px] font-bold text-orange-700">
                    {data.scopeOfWork.length} area{data.scopeOfWork.length > 1 ? 's' : ''} selected
                  </p>
                </motion.div>
              )}
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={data.scopeOfWork.length === 0} />
          </div>
        );

      // Step 6 — Design Preference
      case 6:
        return (
          <div className="flex flex-col h-full">
            <StepLabel step={6} label="Design preference" />
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-3">
              <p className="text-[13px] text-[var(--muted)]">What aesthetic are you going for?</p>
              <div className="space-y-2.5">
                {DESIGN_PREFERENCES.map((dp) => {
                  const active = data.designPreference === dp.id;
                  return (
                    <button
                      key={dp.id}
                      onClick={() => set('designPreference')(dp.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-150 text-left ${
                        active
                          ? 'border-orange-500 bg-orange-50 shadow-sm shadow-orange-100'
                          : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--line)] hover:bg-[var(--bg)]'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${active ? 'bg-orange-100' : 'bg-[var(--paper)]'}`}>
                        {dp.emoji}
                      </div>
                      <div className="flex-1">
                        <p className={`font-black text-[14px] ${active ? 'text-orange-700' : 'text-[var(--ink)]'}`}>{dp.label}</p>
                        <p className="text-[12px] text-[var(--muted)] mt-0.5">{dp.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${active ? 'bg-orange-500 border-orange-500' : 'border-[var(--line)]'}`}>
                        {active && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.designPreference} />
          </div>
        );

      // Step 7 — Budget
      case 7:
        return (
          <div className="flex flex-col h-full">
            <StepLabel step={7} label="Budget range" />
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-3">
              <p className="text-[13px] text-[var(--muted)]">
                This helps contractors tailor their quotes to your expectations.
              </p>
              <div className="space-y-2.5">
                {BUDGET_RANGES.map((br, idx) => {
                  const active = data.budgetRange === br.id;
                  const widths = ['w-1/4', 'w-2/4', 'w-3/4', 'w-full'];
                  return (
                    <button
                      key={br.id}
                      onClick={() => set('budgetRange')(br.id)}
                      className={`w-full p-4 rounded-2xl border-2 transition-all duration-150 text-left ${
                        active
                          ? 'border-orange-500 bg-orange-50 shadow-sm shadow-orange-100'
                          : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--line)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className={`font-black text-[15px] ${active ? 'text-orange-700' : 'text-[var(--ink)]'}`}>{br.label}</p>
                          <p className="text-[12px] text-[var(--muted)] mt-0.5">{br.sub}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${active ? 'bg-orange-500 border-orange-500' : 'border-[var(--line)]'}`}>
                          {active && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      {/* Visual bar */}
                      <div className="h-1 bg-[var(--paper)] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${widths[idx]} ${active ? 'bg-orange-400' : 'bg-[var(--line)]'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.budgetRange} />
          </div>
        );

      // Step 8 — Timeline
      case 8:
        return (
          <div className="flex flex-col h-full">
            <StepLabel step={8} label="Your timeline" />
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-3">
              <p className="text-[13px] text-[var(--muted)]">When are you planning to start?</p>
              <div className="space-y-3">
                {TIMELINES.map((tl) => {
                  const active = data.timeline === tl.id;
                  return (
                    <button
                      key={tl.id}
                      onClick={() => set('timeline')(tl.id)}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-150 text-left ${
                        active
                          ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100'
                          : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--line)]'
                      }`}
                    >
                      <div className={`w-13 h-13 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-orange-500' : 'bg-[var(--paper)]'}`}>
                        <tl.Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-[var(--muted)]'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-black text-[15px] ${active ? 'text-orange-700' : 'text-[var(--ink)]'}`}>{tl.label}</p>
                        <p className="text-[12px] text-[var(--muted)] mt-0.5">{tl.sub}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${active ? 'bg-orange-500 border-orange-500' : 'border-[var(--line)]'}`}>
                        {active && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.timeline} />
          </div>
        );

      // Step 9 — Material Preference
      case 9:
        return (
          <div className="flex flex-col h-full">
            <StepLabel step={9} label="Material quality" />
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-3">
              <p className="text-[13px] text-[var(--muted)]">
                Set expectations on material grade for the project.
              </p>
              <div className="space-y-3">
                {MATERIAL_LEVELS.map((ml) => {
                  const active = data.materialPreference === ml.id;
                  const colorMap: Record<string, { ring: string; bg: string; icon: string; label: string; dot: string }> = {
                    slate: {
                      ring: active ? 'border-[var(--line)]0' : 'border-[var(--line)]',
                      bg: active ? 'bg-[var(--bg)]' : 'bg-[var(--paper)] hover:border-[var(--line)]',
                      icon: active ? 'bg-[var(--muted)] text-white' : 'bg-[var(--paper)] text-[var(--muted)]',
                      label: active ? 'text-[var(--ink)]' : 'text-[var(--ink)]',
                      dot: active ? 'bg-[var(--muted)] border-[var(--muted)]' : 'border-[var(--line)]',
                    },
                    blue: {
                      ring: active ? 'border-blue-500' : 'border-[var(--line)]',
                      bg: active ? 'bg-blue-50' : 'bg-[var(--paper)] hover:border-blue-200',
                      icon: active ? 'bg-blue-600 text-white' : 'bg-[var(--paper)] text-[var(--muted)]',
                      label: active ? 'text-blue-700' : 'text-[var(--ink)]',
                      dot: active ? 'bg-blue-600 border-blue-600' : 'border-[var(--line)]',
                    },
                    amber: {
                      ring: active ? 'border-amber-500' : 'border-[var(--line)]',
                      bg: active ? 'bg-amber-50' : 'bg-[var(--paper)] hover:border-amber-200',
                      icon: active ? 'bg-amber-500 text-white' : 'bg-[var(--paper)] text-[var(--muted)]',
                      label: active ? 'text-amber-700' : 'text-[var(--ink)]',
                      dot: active ? 'bg-amber-500 border-amber-500' : 'border-[var(--line)]',
                    },
                  };
                  const c = colorMap[ml.color];
                  return (
                    <button
                      key={ml.id}
                      onClick={() => set('materialPreference')(ml.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 ${c.ring} ${c.bg} relative`}
                    >
                      {ml.recommended && (
                        <div className="absolute -top-2.5 left-4">
                          <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <div className="flex items-start gap-3 mt-1">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
                          <ml.Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`font-black text-[15px] ${c.label}`}>{ml.label}</p>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${c.dot}`}>
                              {active && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                          <p className="text-[12px] text-[var(--muted)] mt-0.5 mb-2">{ml.desc}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {ml.items.map((item) => (
                              <span key={item} className="text-[10px] font-bold text-[var(--muted)] bg-[var(--paper)] px-2.5 py-1 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.materialPreference} />
          </div>
        );

      // Step 10 — Uploads & Notes
      case 10:
        return (
          <div className="flex flex-col h-full">
            <StepLabel step={10} label="Photos & notes" />
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-4">
              <p className="text-[13px] text-[var(--muted)]">
                Upload images or floor plans. Add any specific requirements. Both are optional.
              </p>

              {/* File upload */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-2 block">
                  Upload Files <span className="text-[var(--muted)] normal-case font-bold">(optional, max 5)</span>
                </label>
                <input
                  id="reno-file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.heic"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="reno-file-upload"
                  className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 transition-all cursor-pointer ${
                    data.uploadedFiles.length > 0
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-[var(--line)] bg-[var(--bg)] hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${data.uploadedFiles.length > 0 ? 'bg-orange-100' : 'bg-[var(--line)]'}`}>
                    <Upload className={`w-6 h-6 ${data.uploadedFiles.length > 0 ? 'text-orange-500' : 'text-[var(--muted)]'}`} />
                  </div>
                  <div className="text-center">
                    <p className={`font-black text-[13px] ${data.uploadedFiles.length > 0 ? 'text-orange-600' : 'text-[var(--muted)]'}`}>
                      {data.uploadedFiles.length > 0 ? 'Add more files' : 'Tap to upload'}
                    </p>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">Photos, floor plans — JPG, PNG, PDF, HEIC</p>
                  </div>
                </label>

                {data.uploadedFiles.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
                    {data.uploadedFiles.map((name) => (
                      <div key={name} className="flex items-center gap-3 px-4 py-3 bg-[var(--paper)] border border-[var(--line)] rounded-xl">
                        <FileText className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="flex-1 text-[12px] font-bold text-[var(--ink)] truncate">{name}</span>
                        <button onClick={() => removeFile(name)} className="w-6 h-6 rounded-full bg-[var(--paper)] flex items-center justify-center hover:bg-red-50 transition-colors">
                          <X className="w-3 h-3 text-[var(--muted)]" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-2 block">
                  Additional Notes <span className="text-[var(--muted)] normal-case font-bold">(optional)</span>
                </label>
                <div className="relative">
                  <StickyNote className="absolute left-4 top-4 w-4 h-4 text-[var(--muted)]" />
                  <textarea
                    value={data.notes}
                    onChange={(e) => set('notes')(e.target.value)}
                    placeholder="Any special requirements, existing damage, preferred contractors, or context for the renovator…"
                    rows={4}
                    className="w-full rounded-2xl border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] font-medium text-[13px] pl-11 pr-4 pt-4 pb-4 focus:outline-none focus:border-orange-400 transition-colors placeholder:text-[var(--muted)] resize-none"
                  />
                </div>
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextLabel="Almost Done" />
          </div>
        );

      // Step 11 — Contact & Submit
      case 11: {
        const canSubmit = data.fullName.trim() && data.phone.length >= 10 && data.email.includes('@');

        // Summary data
        const scopeLabels = data.scopeOfWork.map((id) => SCOPE_ITEMS.find((s) => s.id === id)?.label).filter(Boolean).join(', ');
        const propertyLabel = PROPERTY_TYPES.find((p) => p.id === data.propertyType)?.label;
        const projectLabel = PROJECT_TYPES.find((p) => p.id === data.projectType)?.label;
        const designLabel = DESIGN_PREFERENCES.find((d) => d.id === data.designPreference)?.label;
        const budgetLabel = BUDGET_RANGES.find((b) => b.id === data.budgetRange)?.label;
        const timelineLabel = TIMELINES.find((t) => t.id === data.timeline)?.label;
        const materialLabel = MATERIAL_LEVELS.find((m) => m.id === data.materialPreference)?.label;

        return (
          <div className="flex flex-col h-full">
            <StepLabel step={11} label="Contact & submit" />
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-5">

              {/* Contact fields */}
              <div className="bg-[var(--bg)] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Your Contact Details</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                    <input
                      type="text"
                      value={data.fullName}
                      onChange={(e) => set('fullName')(e.target.value)}
                      placeholder="Your full name"
                      className="w-full h-13 h-[52px] pl-11 pr-4 rounded-2xl border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] font-semibold text-[14px] focus:outline-none focus:border-orange-400 transition-colors placeholder:text-[var(--muted)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Phone Number *</label>
                  <div className="flex gap-2">
                    <div className="h-[52px] px-3 bg-[var(--paper)] rounded-2xl border-2 border-[var(--line)] flex items-center gap-1.5 shrink-0">
                      <span className="text-base">🇮🇳</span>
                      <span className="font-bold text-[var(--muted)] text-[13px]">+91</span>
                      <ChevronDown className="w-3 h-3 text-[var(--muted)]" />
                    </div>
                    <input
                      type="tel"
                      value={data.phone}
                      onChange={(e) => set('phone')(e.target.value)}
                      placeholder="10-digit number"
                      maxLength={10}
                      className="flex-1 h-[52px] rounded-2xl border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] font-semibold text-[14px] px-4 focus:outline-none focus:border-orange-400 transition-colors placeholder:text-[var(--muted)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => set('email')(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-[52px] pl-11 pr-4 rounded-2xl border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] font-semibold text-[14px] focus:outline-none focus:border-orange-400 transition-colors placeholder:text-[var(--muted)]"
                    />
                  </div>
                </div>
              </div>

              {/* Quick summary */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-2.5">Your Project Summary</p>
                <div className="bg-[var(--paper)] border border-[var(--line)] rounded-2xl divide-y divide-slate-50 overflow-hidden shadow-sm">
                  {[
                    { label: 'Location', value: data.city, show: !!data.city },
                    { label: 'Property', value: propertyLabel, show: !!propertyLabel },
                    { label: 'Project Type', value: projectLabel, show: !!projectLabel },
                    { label: 'Area', value: data.area ? `${data.area} sq.ft${data.bhk ? ` • ${data.bhk}` : ''}` : null, show: !!data.area },
                    { label: 'Scope', value: scopeLabels || null, show: !!scopeLabels },
                    { label: 'Design', value: designLabel, show: !!designLabel },
                    { label: 'Budget', value: budgetLabel, show: !!budgetLabel },
                    { label: 'Timeline', value: timelineLabel, show: !!timelineLabel },
                    { label: 'Materials', value: materialLabel, show: !!materialLabel },
                  ]
                    .filter((r) => r.show && r.value)
                    .map((row, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] w-20 shrink-0">{row.label}</p>
                        <p className="text-[12px] font-bold text-[var(--ink)] flex-1 truncate">{row.value}</p>
                      </div>
                    ))}
                </div>
              </div>

              <p className="text-center text-[11px] text-[var(--muted)] leading-relaxed px-2">
                By submitting, you agree to TerraInfra 360's{' '}
                <span className="text-orange-500 font-bold">Terms</span> and{' '}
                <span className="text-orange-500 font-bold">Privacy Policy</span>.
              </p>
            </div>

            {/* CTA */}
            <div className="px-5 pb-8 pt-3 flex gap-3 shrink-0">
              <button
                onClick={goPrev}
                className="w-12 h-12 rounded-2xl bg-[var(--paper)] flex items-center justify-center text-[var(--muted)] hover:bg-[var(--line)] transition-colors shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => canSubmit && setSubmitted(true)}
                disabled={!canSubmit}
                className={`flex-1 h-14 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 ${
                  canSubmit
                    ? 'text-white shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.01]'
                    : 'bg-[var(--paper)] text-[var(--muted)] cursor-not-allowed'
                }`}
                style={canSubmit ? { background: 'linear-gradient(90deg, #f97316, #ef4444)' } : {}}
              >
                <Send className="w-4 h-4" />
                Get Renovation Quotes
              </button>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f9f9f9] z-[90] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--paper)] border-b border-[var(--line)] shrink-0">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={goPrev} className="flex items-center gap-2 text-[var(--muted)] font-black text-[13px]">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <div className="text-center">
            <p className="font-black text-[13px] text-[var(--ink)] leading-none">Renovation RFQ</p>
            <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mt-0.5">
              {data.city || 'New Request'}
            </p>
          </div>
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[var(--paper)] flex items-center justify-center"
          >
            <X className="w-4 h-4 text-[var(--muted)]" />
          </button>
        </div>
        <RFQStepBar step={step} totalSteps={9} />
      </div>

      {/* Animated step content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="h-full flex flex-col"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
