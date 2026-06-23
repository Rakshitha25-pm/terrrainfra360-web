import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Home,
  Hammer,
  TrendingUp,
  PiggyBank,
  Rocket,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Building2,
  LineChart,
  DollarSign,
  Clock,
  Upload,
  FileText,
  Check,
  BadgePercent,
  BarChart3,
  ShieldCheck,
  Banknote,
  Target,
  Calendar,
  StickyNote,
  Send,
  Star,
  ChevronDown,
  X,
} from 'lucide-react';
import { RFQStepBar } from './RFQStepBar';

interface FundingInvestmentRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
  preselectedService?: string;
}

// ─── Data ───────────────────────────────────────────────────────────────────

const FINANCIAL_SERVICES = [
  {
    id: 'home-loan',
    label: 'Home Loan',
    desc: 'Finance your dream home with competitive rates',
    Icon: Home,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    activeColor: 'bg-blue-600 text-white border-blue-600',
  },
  {
    id: 'construction-loan',
    label: 'Construction Loan',
    desc: 'Fund your construction project end-to-end',
    Icon: Hammer,
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    activeColor: 'bg-orange-500 text-white border-orange-500',
  },
  {
    id: 'funding-investment',
    label: 'Funding & Investment',
    desc: 'Raise capital or deploy funds strategically',
    Icon: TrendingUp,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    activeColor: 'bg-emerald-600 text-white border-emerald-600',
  },
  {
    id: 'investment-advisory',
    label: 'Investment Advisory',
    desc: 'Expert guidance for your portfolio',
    Icon: LineChart,
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    activeColor: 'bg-violet-600 text-white border-violet-600',
  },
  {
    id: 'fund-raising',
    label: 'Fund Raising',
    desc: 'Structured fundraising for your business',
    Icon: Rocket,
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    activeColor: 'bg-rose-600 text-white border-rose-600',
  },
];

const PROFILE_TYPES = [
  { id: 'salaried', label: 'Salaried', Icon: Briefcase },
  { id: 'self-employed', label: 'Self-Employed', Icon: User },
  { id: 'business-owner', label: 'Business Owner', Icon: Building2 },
  { id: 'investor', label: 'Investor', Icon: BarChart3 },
];

const AMOUNT_RANGES = {
  'home-loan': ['₹10L – ₹25L', '₹25L – ₹50L', '₹50L – ₹1Cr', '₹1Cr – ₹2Cr', '₹2Cr+'],
  'construction-loan': ['₹10L – ₹30L', '₹30L – ₹75L', '₹75L – ₹1.5Cr', '₹1.5Cr – ₹3Cr', '₹3Cr+'],
  'funding-investment': ['₹5L – ₹25L', '₹25L – ₹1Cr', '₹1Cr – ₹5Cr', '₹5Cr – ₹20Cr', '₹20Cr+'],
  'investment-advisory': ['< ₹10L', '₹10L – ₹50L', '₹50L – ₹2Cr', '₹2Cr – ₹10Cr', '₹10Cr+'],
  'fund-raising': ['₹25L – ₹1Cr', '₹1Cr – ₹5Cr', '₹5Cr – ₹25Cr', '₹25Cr – ₹100Cr', '₹100Cr+'],
};

const DYNAMIC_FIELDS: Record<string, { label: string; options: string[] }[]> = {
  'home-loan': [
    { label: 'Property Type', options: ['Apartment', 'Independent House', 'Villa', 'Plot + Construction', 'Under Construction'] },
    { label: 'Employment Income (Annual)', options: ['< ₹5L', '₹5L – ₹12L', '₹12L – ₹25L', '₹25L – ₹50L', '₹50L+'] },
  ],
  'construction-loan': [
    { label: 'Construction Stage', options: ['Pre-Foundation', 'Foundation Done', 'Ground Floor', 'Ongoing — Need Top-up', 'New Project'] },
    { label: 'Plot Ownership', options: ['Owned – Clear Title', 'Owned – Encumbered', 'Yet to Purchase', 'Ancestral Property'] },
  ],
  'funding-investment': [
    { label: 'Business / Project Type', options: ['Real Estate', 'Tech Startup', 'Manufacturing', 'Retail / E-commerce', 'Infrastructure'] },
    { label: 'Funding Stage', options: ['Pre-Seed', 'Seed', 'Series A / B', 'Growth Stage', 'Pre-IPO'] },
  ],
  'investment-advisory': [
    { label: 'Investment Goal', options: ['Wealth Creation', 'Retirement Planning', "Children's Education", 'Regular Income', 'Tax Saving'] },
    { label: 'Risk Appetite', options: ['Conservative', 'Moderate', 'Aggressive', 'Very Aggressive'] },
  ],
  'fund-raising': [
    { label: 'Business Stage', options: ['Idea / Concept', 'MVP Ready', 'Revenue Generating', 'Profitable', 'Scaling Up'] },
    { label: 'Preferred Investor Type', options: ['Angel Investor', 'Venture Capital', 'Private Equity', 'Bank / NBFC', 'Government Scheme'] },
  ],
};

const TIMELINES = [
  { id: 'immediate', label: 'Immediate', sub: 'Within 7 days', Icon: Clock },
  { id: '1-3months', label: '1 – 3 Months', sub: 'Planning ahead', Icon: Calendar },
  { id: 'flexible', label: 'Flexible', sub: 'No rush', Icon: Target },
];

const TOTAL_STEPS = 9;

// ─── State Shape ─────────────────────────────────────────────────────────────

interface RFQData {
  serviceId: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  profileType: string;
  amountRange: string;
  dynamicField1: string;
  dynamicField2: string;
  timeline: string;
  notes: string;
  uploadedFile: string;
  rfqNumber: string;
}

// ─── Helper sub-components ───────────────────────────────────────────────────

const ProgressBar = ({ step }: { step: number }) => (
  <div className="px-6 pt-6 pb-2">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
        Step {step} of {TOTAL_STEPS}
      </span>
      <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">
        {Math.round((step / TOTAL_STEPS) * 100)}%
      </span>
    </div>
    <div className="h-1.5 bg-[var(--paper)] rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
        initial={{ width: `${((step - 1) / TOTAL_STEPS) * 100}%` }}
        animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  </div>
);

const StepHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="px-6 pt-4 pb-2">
    <motion.h2
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl font-black text-[var(--ink)] leading-tight"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[13px] text-[var(--muted)] mt-1 leading-relaxed"
      >
        {subtitle}
      </motion.p>
    )}
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
  <div className="px-6 pb-8 pt-4 flex gap-3">
    <button
      onClick={onBack}
      className="w-12 h-12 rounded-2xl bg-[var(--paper)] flex items-center justify-center text-[var(--muted)] hover:bg-[var(--line)] transition-colors shrink-0"
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
    <button
      onClick={onNext}
      disabled={nextDisabled}
      className={`flex-1 h-12 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
        nextDisabled
          ? 'bg-[var(--paper)] text-[var(--muted)] cursor-not-allowed'
          : isLast
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200 hover:shadow-amber-300 hover:scale-[1.01]'
          : 'bg-luxury-dark text-white hover:bg-luxury-dark'
      }`}
    >
      {nextLabel}
      {!nextDisabled && <ArrowRight className="w-4 h-4" />}
    </button>
  </div>
);

const SelectCard = ({
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
    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
      active
        ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-100'
        : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--line)] hover:bg-[var(--bg)]'
    }`}
  >
    {children}
  </button>
);

const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  prefix?: string;
}) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">{label}</label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-bold text-sm">{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-14 rounded-2xl border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] font-semibold text-[15px] focus:outline-none focus:border-amber-400 transition-colors placeholder:text-[var(--muted)] ${
          prefix ? 'pl-10 pr-4' : 'px-4'
        }`}
      />
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export function FundingInvestmentRFQFlow({ onBack, onComplete, preselectedService }: FundingInvestmentRFQFlowProps) {
  const [step, setStep] = useState(preselectedService ? 2 : 1);
  const [direction, setDirection] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);

  const [data, setData] = useState<RFQData>({
    serviceId: preselectedService || '',
    fullName: '',
    phone: '',
    email: '',
    city: '',
    profileType: '',
    amountRange: '',
    dynamicField1: '',
    dynamicField2: '',
    timeline: '',
    notes: '',
    uploadedFile: '',
    rfqNumber: `FIN-${Date.now().toString().slice(-6)}`,
  });

  const set = (key: keyof RFQData) => (val: string) => setData((d) => ({ ...d, [key]: val }));

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const goPrev = () => {
    if (step === 1) { onBack(); return; }
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const selectedService = FINANCIAL_SERVICES.find((s) => s.id === data.serviceId);
  const dynamicFields = DYNAMIC_FIELDS[data.serviceId] || [];
  const amountOptions = AMOUNT_RANGES[data.serviceId as keyof typeof AMOUNT_RANGES] || AMOUNT_RANGES['home-loan'];

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  // ─── Success Screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 bg-[var(--paper)] z-[90] flex flex-col items-center justify-center px-8 text-center">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-200">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-black text-[var(--ink)] mb-3">
          RFQ Submitted!
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-[var(--muted)] text-sm max-w-xs leading-relaxed mb-2">
          Our financial advisors will review your request and reach out within 24 hours.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-3 mb-8">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Reference Number</p>
          <p className="text-xl font-black text-[var(--ink)]">{data.rfqNumber}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="w-full max-w-xs space-y-3">
          <div className="flex items-center gap-3 p-4 bg-[var(--bg)] rounded-2xl">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-[12px] font-bold text-[var(--muted)] text-left">Your data is 100% secure & confidential</p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-[var(--bg)] rounded-2xl">
            <Star className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[12px] font-bold text-[var(--muted)] text-left">Multiple competitive quotes from verified advisors</p>
          </div>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          onClick={onComplete}
          className="mt-8 w-full max-w-xs py-4 bg-orange-500 text-white font-black rounded-2xl text-sm uppercase tracking-widest"
        >
          Back to Services
        </motion.button>
      </div>
    );
  }

  // ─── Step Content ────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {

      // Step 1 — Service Selection
      case 1:
        return (
          <div className="flex flex-col h-full">
            <StepHeader title="What do you need?" subtitle="Select the financial service you're looking for." />
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4 space-y-3">
              {FINANCIAL_SERVICES.map((svc) => {
                const active = data.serviceId === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => set('serviceId')(svc.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      active
                        ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-100'
                        : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--line)]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${active ? svc.activeColor : svc.color}`}>
                      <svc.Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[14px] text-[var(--ink)]">{svc.label}</p>
                      <p className="text-[12px] text-[var(--muted)] mt-0.5 leading-snug">{svc.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${active ? 'bg-amber-500 border-amber-500' : 'border-[var(--line)]'}`}>
                      {active && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.serviceId} />
          </div>
        );

      // Step 2 — Personal Info
      case 2:
        return (
          <div className="flex flex-col h-full">
            <StepHeader title="Tell us about you" subtitle="Basic details to personalise your quotes." />
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4 space-y-4">
              <div className="p-5 bg-[var(--bg)] rounded-2xl space-y-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Personal Details</p>
                </div>
                <InputField
                  label="Full Name"
                  value={data.fullName}
                  onChange={set('fullName')}
                  placeholder="e.g. Rajesh Kumar"
                />
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="h-14 px-4 bg-[var(--paper)] rounded-2xl border-2 border-[var(--line)] flex items-center gap-2 shrink-0">
                      <span className="text-base">🇮🇳</span>
                      <span className="font-bold text-[var(--muted)] text-[13px]">+91</span>
                      <ChevronDown className="w-3 h-3 text-[var(--muted)]" />
                    </div>
                    <input
                      type="tel"
                      value={data.phone}
                      onChange={(e) => set('phone')(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="flex-1 h-14 rounded-2xl border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] font-semibold text-[15px] px-4 focus:outline-none focus:border-amber-400 transition-colors placeholder:text-[var(--muted)]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-[12px] font-bold text-emerald-700">Your details are fully encrypted and never shared without consent.</p>
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.fullName.trim() || data.phone.length < 10} />
          </div>
        );

      // Step 3 — Contact Details
      case 3:
        return (
          <div className="flex flex-col h-full">
            <StepHeader title="How can we reach you?" subtitle="Email and location help us match the right advisors." />
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4 space-y-4">
              <div className="p-5 bg-[var(--bg)] rounded-2xl space-y-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Contact Details</p>
                </div>
                <InputField
                  label="Email Address"
                  value={data.email}
                  onChange={set('email')}
                  type="email"
                  placeholder="name@example.com"
                />
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">City / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                    <input
                      type="text"
                      value={data.city}
                      onChange={(e) => set('city')(e.target.value)}
                      placeholder="e.g. Bangalore, Mumbai…"
                      className="w-full h-14 rounded-2xl border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] font-semibold text-[15px] pl-11 pr-4 focus:outline-none focus:border-amber-400 transition-colors placeholder:text-[var(--muted)]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.email.includes('@') || !data.city.trim()} />
          </div>
        );

      // Step 4 — Profile Type
      case 4:
        return (
          <div className="flex flex-col h-full">
            <StepHeader title="Your profile type" subtitle="This helps us match the most relevant financial products." />
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4">
              <div className="grid grid-cols-2 gap-3">
                {PROFILE_TYPES.map((pt) => {
                  const active = data.profileType === pt.id;
                  return (
                    <button
                      key={pt.id}
                      onClick={() => set('profileType')(pt.id)}
                      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
                        active
                          ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-100'
                          : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--line)] hover:bg-[var(--bg)]'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${active ? 'bg-amber-500' : 'bg-[var(--paper)]'}`}>
                        <pt.Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-[var(--muted)]'}`} />
                      </div>
                      <span className={`text-[13px] font-black text-center leading-tight ${active ? 'text-amber-600' : 'text-[var(--ink)]'}`}>
                        {pt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.profileType} />
          </div>
        );

      // Step 5 — Financial Requirement
      case 5:
        return (
          <div className="flex flex-col h-full">
            <StepHeader
              title="Financial requirement"
              subtitle={`Select your ${selectedService?.label || 'financial'} amount range.`}
            />
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4 space-y-3">
              {/* Service badge */}
              {selectedService && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider ${selectedService.color}`}>
                  <selectedService.Icon className="w-3.5 h-3.5" />
                  {selectedService.label}
                </div>
              )}

              <div className="space-y-2 mt-2">
                {amountOptions.map((amt) => {
                  const active = data.amountRange === amt;
                  return (
                    <button
                      key={amt}
                      onClick={() => set('amountRange')(amt)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${
                        active
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--line)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Banknote className={`w-5 h-5 ${active ? 'text-amber-500' : 'text-[var(--muted)]'}`} />
                        <span className={`font-black text-[14px] ${active ? 'text-amber-600' : 'text-[var(--ink)]'}`}>{amt}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'bg-amber-500 border-amber-500' : 'border-[var(--line)]'}`}>
                        {active && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.amountRange} />
          </div>
        );

      // Step 6 — Dynamic Service Fields
      case 6:
        return (
          <div className="flex flex-col h-full">
            <StepHeader
              title="A few more details"
              subtitle="Help us customise your quote with specific information."
            />
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4 space-y-5">
              {dynamicFields.map((field, fi) => {
                const fieldKey = fi === 0 ? 'dynamicField1' : 'dynamicField2';
                const currentVal = fi === 0 ? data.dynamicField1 : data.dynamicField2;
                return (
                  <div key={fi} className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">{field.label}</p>
                    <div className="space-y-2">
                      {field.options.map((opt) => {
                        const active = currentVal === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => set(fieldKey)(opt)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                              active
                                ? 'border-amber-500 bg-amber-50'
                                : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--line)]'
                            }`}
                          >
                            <span className={`font-bold text-[13px] ${active ? 'text-amber-700' : 'text-[var(--ink)]'}`}>{opt}</span>
                            {active && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={dynamicFields.length > 0 && (!data.dynamicField1 || (dynamicFields.length > 1 && !data.dynamicField2))} />
          </div>
        );

      // Step 7 — Timeline
      case 7:
        return (
          <div className="flex flex-col h-full">
            <StepHeader title="Your timeline" subtitle="When are you looking to get started?" />
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4 space-y-3">
              {TIMELINES.map((tl) => {
                const active = data.timeline === tl.id;
                return (
                  <button
                    key={tl.id}
                    onClick={() => set('timeline')(tl.id)}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                      active
                        ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-100'
                        : 'border-[var(--line)] bg-[var(--paper)] hover:border-[var(--line)]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-amber-500' : 'bg-[var(--paper)]'}`}>
                      <tl.Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-[var(--muted)]'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-black text-[15px] ${active ? 'text-amber-700' : 'text-[var(--ink)]'}`}>{tl.label}</p>
                      <p className="text-[12px] text-[var(--muted)] mt-0.5">{tl.sub}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${active ? 'bg-amber-500 border-amber-500' : 'border-[var(--line)]'}`}>
                      {active && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextDisabled={!data.timeline} />
          </div>
        );

      // Step 8 — Documents & Notes (optional)
      case 8:
        return (
          <div className="flex flex-col h-full">
            <StepHeader title="Documents & Notes" subtitle="Attach files or add context. Both are optional." />
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4 space-y-4">
              {/* File upload */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)] mb-2">Upload Document</p>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) set('uploadedFile')(file.name);
                }} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 transition-all ${
                    data.uploadedFile
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-[var(--line)] bg-[var(--bg)] hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  {data.uploadedFile ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-black text-emerald-700 text-[13px]">{data.uploadedFile}</p>
                        <p className="text-[11px] text-emerald-500 mt-1">Tap to replace</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[var(--line)] flex items-center justify-center">
                        <Upload className="w-6 h-6 text-[var(--muted)]" />
                      </div>
                      <div className="text-center">
                        <p className="font-black text-[var(--muted)] text-[13px]">Tap to upload</p>
                        <p className="text-[11px] text-[var(--muted)] mt-0.5">PDF, JPG, PNG — max 10 MB</p>
                      </div>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-[var(--muted)] mt-2 text-center">
                  e.g. Salary slips, Bank statements, Property documents
                </p>
              </div>

              {/* Notes */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)] mb-2">Additional Notes</p>
                <div className="relative">
                  <StickyNote className="absolute left-4 top-4 w-4 h-4 text-[var(--muted)]" />
                  <textarea
                    value={data.notes}
                    onChange={(e) => set('notes')(e.target.value)}
                    placeholder="Any specific requirements, existing loans, or context for the advisor…"
                    rows={4}
                    className="w-full rounded-2xl border-2 border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] font-medium text-[13px] pl-11 pr-4 pt-4 pb-4 focus:outline-none focus:border-amber-400 transition-colors placeholder:text-[var(--muted)] resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[var(--bg)] rounded-2xl">
                <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[12px] font-bold text-[var(--muted)]">
                  Documents help advisors provide more accurate quotes.
                </p>
              </div>
            </div>
            <NavButtons onBack={goPrev} onNext={goNext} nextLabel="Review RFQ" />
          </div>
        );

      // Step 9 — Review & Submit
      case 9: {
        const svc = FINANCIAL_SERVICES.find((s) => s.id === data.serviceId);
        const profileLabel = PROFILE_TYPES.find((p) => p.id === data.profileType)?.label;
        const timelineLabel = TIMELINES.find((t) => t.id === data.timeline)?.label;
        const rows: { label: string; value: string; Icon: any }[] = [
          { label: 'Service', value: svc?.label || '—', Icon: svc?.Icon || DollarSign },
          { label: 'Name', value: data.fullName || '—', Icon: User },
          { label: 'Phone', value: data.phone ? `+91 ${data.phone}` : '—', Icon: Phone },
          { label: 'Email', value: data.email || '—', Icon: Mail },
          { label: 'City', value: data.city || '—', Icon: MapPin },
          { label: 'Profile', value: profileLabel || '—', Icon: Briefcase },
          { label: 'Amount', value: data.amountRange || '—', Icon: Banknote },
          ...(data.dynamicField1 ? [{ label: dynamicFields[0]?.label || 'Details', value: data.dynamicField1, Icon: BadgePercent }] : []),
          ...(data.dynamicField2 ? [{ label: dynamicFields[1]?.label || 'Info', value: data.dynamicField2, Icon: BarChart3 }] : []),
          { label: 'Timeline', value: timelineLabel || '—', Icon: Clock },
          ...(data.uploadedFile ? [{ label: 'Document', value: data.uploadedFile, Icon: FileText }] : []),
        ];

        return (
          <div className="flex flex-col h-full">
            <StepHeader title="Review your RFQ" subtitle="Double-check your details before submitting." />
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4 space-y-4">
              {/* RFQ ID banner */}
              <div className="flex items-center justify-between bg-luxury-dark text-white rounded-2xl px-5 py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">RFQ Reference</p>
                  <p className="font-black text-lg">{data.rfqNumber}</p>
                </div>
                {svc && (
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${svc.activeColor}`}>
                    <svc.Icon className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Summary rows */}
              <div className="bg-[var(--paper)] border border-[var(--line)] rounded-2xl divide-y divide-slate-50 overflow-hidden shadow-sm">
                {rows.map((row, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <row.Icon className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">{row.label}</p>
                      <p className="text-[13px] font-bold text-[var(--ink)] truncate">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes preview */}
              {data.notes && (
                <div className="bg-[var(--bg)] border border-[var(--line)] rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">Notes</p>
                  <p className="text-[13px] text-[var(--muted)] leading-relaxed">{data.notes}</p>
                </div>
              )}

              <p className="text-center text-[11px] text-[var(--muted)] leading-relaxed">
                By submitting, you agree to TerraInfra 360's{' '}
                <span className="text-amber-500 font-bold">Terms of Service</span> and{' '}
                <span className="text-amber-500 font-bold">Privacy Policy</span>.
              </p>
            </div>

            <div className="px-6 pb-8 pt-2 flex gap-3">
              <button
                onClick={goPrev}
                className="w-12 h-12 rounded-2xl bg-[var(--paper)] flex items-center justify-center text-[var(--muted)] hover:bg-[var(--line)] transition-colors shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-amber-200 hover:shadow-amber-300 hover:scale-[1.01] transition-all"
              >
                <Send className="w-4 h-4" />
                Submit RFQ — Get Quotes
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
    <div className="fixed inset-0 bg-[#f8f8f8] z-[90] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--paper)] border-b border-[var(--line)] shrink-0">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={goPrev} className="flex items-center gap-2 text-[var(--muted)] font-black text-sm">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <div className="text-center">
            <p className="font-black text-[13px] text-[var(--ink)] leading-none">Financial RFQ</p>
            <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mt-0.5">
              {selectedService?.label || 'Funding & Investment'}
            </p>
          </div>
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-[var(--paper)] flex items-center justify-center">
            <X className="w-4 h-4 text-[var(--muted)]" />
          </button>
        </div>
        <RFQStepBar step={step} totalSteps={13} />
      </div>

      {/* Step content with animation */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="h-full flex flex-col"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
