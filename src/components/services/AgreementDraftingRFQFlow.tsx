import React, { useState } from 'react';
import { submitServiceRFQ } from '../../lib/serviceRfq';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  FileText,
  Copy,
  Building2,
  Star,
  ShieldAlert,
  Users,
  Calendar,
  Zap,
  ClipboardCheck,
  RefreshCw,
  User,
  Phone,
  Sparkles,
  Gavel,
  MapPin,
  Briefcase,
  Languages,
  Clock,
  Search,
  Check,
  Info,
  AlertTriangle,
  ArrowUpRight,
  Scale,
  FileSignature,
  Handshake,
  Coins,
  ShieldCheck,
  FileEdit
} from 'lucide-react';
import { Lawyer } from '../rfq-types';
import { MOCK_LAWYERS } from '../rfq-constants';
import { RFQStepBar } from './RFQStepBar';

interface AgreementDraftingRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface AgreementState {
  // Step 1: Type & Purpose
  agreementType: string;
  purpose: string;
  transactionType: string;
  // Step 2: Parties & Stage
  partyStructure: string;
  transactionStage: string;
  // Step 3: Commercials & Clauses
  commercialStructure: string;
  requiredClauses: string[];
  // Step 4: Scope & Deliverables
  serviceType: string;
  additionalSupport: string[];
  finalOutput: string;
  revisionScope: string;
  specificConcern: string;
  // Step 5: Lawyer Selection
  selectionMode: 'manual' | 'suggestion' | '';
  selectedLawyerIds: string[];
  // Final
  userName: string;
  userPhone: string;
  rfqNumber: string;
}

const SectionWrapper = ({ children, title, icon: Icon, subtitle }: { children: React.ReactNode, title: string, icon: any, subtitle?: string }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-luxury-gold/10 rounded-2xl flex items-center justify-center text-luxury-gold shadow-sm">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-lg font-black text-[var(--ink)] tracking-tight">{title}</h3>
        {subtitle && <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{subtitle}</p>}
      </div>
    </div>
    <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[32px] p-6 shadow-sm space-y-6">
      {children}
    </div>
  </div>
);

const SegmentedControl = ({ options, selected, onChange }: { options: string[], selected: string, onChange: (val: string) => void }) => (
  <div className="flex p-1.5 bg-[var(--bg)] rounded-2xl border border-[var(--line)] overflow-x-auto no-scrollbar">
    {options.map((option) => (
      <button
        key={option}
        onClick={() => onChange(option)}
        className={`flex-shrink-0 px-4 py-3 text-[11px] font-bold rounded-xl transition-all ${
          selected === option 
            ? 'bg-[var(--paper)] text-[var(--ink)] shadow-sm border border-[var(--line)]' 
            : 'text-[var(--muted)] hover:text-[var(--muted)]'
        }`}
      >
        {option}
      </button>
    ))}
  </div>
);

const ReviewSection = ({ title, icon: Icon, items }: { title: string, icon: any, items: { label: string, value: string | boolean | string[] }[] }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 px-1">
      <div className="w-6 h-6 rounded-lg bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
        <Icon size={14} />
      </div>
      <h3 className="text-[11px] font-black text-[var(--ink)] uppercase tracking-wider">{title}</h3>
    </div>
    <div className="bg-[var(--bg)]/50 rounded-2xl border border-[var(--line)] p-4 space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex justify-between items-start gap-4">
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-tight">{item.label}</p>
          <div className="text-right">
            {Array.isArray(item.value) ? (
              <div className="flex flex-wrap justify-end gap-1">
                {item.value.map((v, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 bg-[var(--paper)] border border-[var(--line)] rounded text-[9px] font-bold text-[var(--ink)]">
                    {v}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] font-black text-[var(--ink)]">
                {typeof item.value === 'boolean' ? (item.value ? 'Yes' : 'No') : (item.value || 'N/A')}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TextInput = ({ label, value, onChange, icon: Icon, placeholder, type = "text", suffix }: { label: string, value: string, onChange: (val: string) => void, icon: any, placeholder?: string, type?: string, suffix?: string }) => (
  <div className="space-y-2">
    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">{label}</p>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-luxury-gold transition-colors">
        <Icon size={18} />
      </div>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-4 bg-[var(--paper)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-4 focus:ring-luxury-gold/5 focus:border-luxury-gold/50 transition-all shadow-sm"
      />
      {suffix && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--muted)] uppercase">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

interface LawyerCardProps {
  lawyer: Lawyer;
  selected: boolean;
  onToggle: () => void;
}

const LawyerCard: React.FC<LawyerCardProps> = ({ lawyer, selected, onToggle }) => (
  <div 
    onClick={onToggle}
    className={`p-5 rounded-[24px] border transition-all cursor-pointer relative group ${
      selected 
        ? 'bg-luxury-gold/5 border-luxury-gold shadow-lg shadow-luxury-gold/5' 
        : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
    }`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <h4 className="text-sm font-black text-[var(--ink)] group-hover:text-luxury-gold transition-colors">{lawyer.name}</h4>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
          <MapPin size={12} />
          {lawyer.practiceLocation}
        </div>
      </div>
      <div className="flex items-center gap-1 bg-luxury-gold/10 px-2 py-1 rounded-lg">
        <Star size={10} className="text-luxury-gold fill-luxury-gold" />
        <span className="text-[10px] font-black text-luxury-gold">{lawyer.rating}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="space-y-1">
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Experience</p>
        <p className="text-[11px] font-black text-[var(--ink)]">{lawyer.experience}</p>
      </div>
      <div className="space-y-1 text-right">
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Drafts Done</p>
        <p className="text-[11px] font-black text-[var(--ink)]">{lawyer.opinionsCompleted}+</p>
      </div>
    </div>

    <div className="space-y-3">
      <div>
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Specialization</p>
        <div className="flex flex-wrap gap-1">
          {lawyer.specialization.slice(0, 2).map((spec, i) => (
            <span key={i} className="px-2 py-0.5 bg-[var(--bg)] border border-[var(--line)] rounded-md text-[9px] font-bold text-[var(--muted)]">
              {spec}
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-[var(--line)]">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">
          <Languages size={12} />
          {lawyer.languages.join(', ')}
        </div>
        <div className={`text-[9px] font-black uppercase tracking-widest ${lawyer.availability.includes('Today') ? 'text-green-500' : 'text-luxury-gold'}`}>
          {lawyer.availability}
        </div>
      </div>
    </div>

    {selected && (
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-luxury-gold rounded-full flex items-center justify-center text-white shadow-lg">
        <Check size={14} strokeWidth={3} />
      </div>
    )}
  </div>
);

export const AgreementDraftingRFQFlow: React.FC<AgreementDraftingRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<AgreementState>({
    agreementType: '',
    purpose: '',
    transactionType: '',
    partyStructure: '',
    transactionStage: '',
    commercialStructure: '',
    requiredClauses: [],
    serviceType: '',
    additionalSupport: [],
    finalOutput: '',
    revisionScope: '',
    specificConcern: '',
    selectionMode: '',
    selectedLawyerIds: [],
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  const isStepValid = () => {
    if (step === 1) return state.agreementType !== '' && state.purpose !== '' && state.transactionType !== '';
    if (step === 2) return state.partyStructure !== '' && state.transactionStage !== '';
    if (step === 3) return state.commercialStructure !== '' && state.requiredClauses.length > 0;
    if (step === 4) return state.serviceType !== '' && state.finalOutput !== '' && state.revisionScope !== '';
    if (step === 5) {
      if (state.selectionMode === 'suggestion') return true;
      if (state.selectionMode === 'manual') return state.selectedLawyerIds.length > 0;
      return false;
    }
    if (step === 6) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-ADR-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Agreement Drafting', { ...state, rfqNumber: rfqNum });
    setStep(7);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Type & <span className="text-luxury-gold">Purpose.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the agreement type and transaction context.
              </p>
            </div>

            <SectionWrapper title="Agreement Type" icon={FileSignature} subtitle="Compulsory selection">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Sale Agreement', 'Lease Agreement', 'Rental Agreement', 
                  'Construction Agreement', 'Interior Work Agreement', 
                  'Joint Development Agreement', 'Memorandum of Understanding', 
                  'Vendor Agreement', 'Service Agreement', 'Partnership Agreement', 
                  'Custom Agreement'
                ].map((t) => (
                  <button
                    key={t}
                    onClick={() => setState({ ...state, agreementType: t })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.agreementType === t
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Transaction Context" icon={Building2} subtitle="Purpose & Type">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Purpose</p>
                <SegmentedControl 
                  options={['Property Transaction', 'Construction Work', 'Interior Execution', 'Rental/Lease', 'Partnership', 'Investment', 'Commercial Use']} 
                  selected={state.purpose} 
                  onChange={(val) => setState({ ...state, purpose: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Property/Transaction Type</p>
                <SegmentedControl 
                  options={['Residential', 'Commercial', 'Land/Plot', 'Apartment', 'Villa', 'Office', 'Retail', 'Mixed Use']} 
                  selected={state.transactionType} 
                  onChange={(val) => setState({ ...state, transactionType: val })} 
                />
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Parties & <span className="text-luxury-gold">Stage.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the legal relationship and current progress.
              </p>
            </div>

            <SectionWrapper title="Party Structure" icon={Handshake} subtitle="Legal relationship">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Individual to Individual', 'Owner to Tenant', 
                  'Owner to Builder', 'Owner to Contractor', 
                  'Landowner to Developer', 'Company to Vendor', 
                  'Company to Client', 'Multiple Parties'
                ].map((p) => (
                  <button
                    key={p}
                    onClick={() => setState({ ...state, partyStructure: p })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.partyStructure === p
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Transaction Stage" icon={Clock} subtitle="Current progress">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Just Discussing', 'Terms Finalized', 
                  'Token Paid', 'Ready for Drafting', 
                  'Needs Revision'
                ].map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setState({ ...state, transactionStage: stage })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.transactionStage === stage
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Commercials & <span className="text-luxury-gold">Clauses.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define payment logic and required legal protections.
              </p>
            </div>

            <SectionWrapper title="Commercial Structure" icon={Coins} subtitle="Payment logic">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Lump Sum', 'Milestone-Based', 
                  'Monthly Rent', 'Revenue Share', 
                  'Profit Share', 'Security Deposit', 
                  'Refundable Deposit', 'Custom Structure'
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => setState({ ...state, commercialStructure: c })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.commercialStructure === c
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Required Clauses" icon={ShieldCheck} subtitle="Multi-select protections">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Advance Payment', 'Delay Penalty', 'Completion Timeline', 
                  'Defect Liability', 'Exit Clause', 'Termination Clause', 
                  'Refund Clause', 'Arbitration Clause', 'Jurisdiction Clause', 
                  'Lock-in Period', 'Renewal Clause', 'Confidentiality', 
                  'Indemnity', 'Force Majeure', 'Custom Clauses'
                ].map((clause) => (
                  <button
                    key={clause}
                    onClick={() => {
                      const newClauses = state.requiredClauses.includes(clause)
                        ? state.requiredClauses.filter(c => c !== clause)
                        : [...state.requiredClauses, clause];
                      setState({ ...state, requiredClauses: newClauses });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.requiredClauses.includes(clause)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {clause}
                  </button>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Scope & <span className="text-luxury-gold">Deliverables.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the service type and final output expectations.
              </p>
            </div>

            <SectionWrapper title="Service Scope" icon={FileEdit} subtitle="Drafting requirements">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Service Type</p>
                <SegmentedControl 
                  options={['Fresh Drafting', 'Review Existing', 'Editing Old', 'Registration-Ready']} 
                  selected={state.serviceType} 
                  onChange={(val) => setState({ ...state, serviceType: val })} 
                />
                
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-6">Additional Support (Multi-select)</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Stamp Paper', 'Registration', 'Bilingual Drafting', 'Notarization'
                  ].map((support) => (
                    <button
                      key={support}
                      onClick={() => {
                        const newSupport = state.additionalSupport.includes(support)
                          ? state.additionalSupport.filter(s => s !== support)
                          : [...state.additionalSupport, support];
                        setState({ ...state, additionalSupport: newSupport });
                      }}
                      className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                        state.additionalSupport.includes(support)
                          ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                          : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                      }`}
                    >
                      {support}
                    </button>
                  ))}
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Final Output" icon={FileText} subtitle="Deliverable & Revisions">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Expected Output</p>
                <SegmentedControl 
                  options={['Draft for Discussion', 'Final Draft', 'Execution-Ready', 'Registration-Ready']} 
                  selected={state.finalOutput} 
                  onChange={(val) => setState({ ...state, finalOutput: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Revision Scope</p>
                <SegmentedControl 
                  options={['One Round Only', 'Drafting + Revisions', 'Consultation Support']} 
                  selected={state.revisionScope} 
                  onChange={(val) => setState({ ...state, revisionScope: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Additional Context" icon={Info} subtitle="Optional background">
              <textarea 
                value={state.specificConcern}
                onChange={(e) => setState({ ...state, specificConcern: e.target.value })}
                placeholder="Any specific terms, term sheets, or background you want the lawyer to know..."
                className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors h-32 resize-none"
              />
            </SectionWrapper>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Lawyer <span className="text-luxury-gold">Selection.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Choose your legal expert or let us suggest the best fit.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setState({ ...state, selectionMode: 'manual' })}
                className={`p-6 rounded-[32px] border-2 transition-all text-center space-y-3 ${
                  state.selectionMode === 'manual'
                    ? 'bg-luxury-gold/5 border-luxury-gold shadow-xl shadow-luxury-gold/10'
                    : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
                }`}
              >
                <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${state.selectionMode === 'manual' ? 'bg-luxury-gold text-white' : 'bg-[var(--bg)] text-[var(--muted)]'}`}>
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-[var(--ink)]">Select Manually</p>
                  <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Choose Experts</p>
                </div>
              </button>

              <button
                onClick={() => setState({ ...state, selectionMode: 'suggestion', selectedLawyerIds: [] })}
                className={`p-6 rounded-[32px] border-2 transition-all text-center space-y-3 ${
                  state.selectionMode === 'suggestion'
                    ? 'bg-luxury-dark border-luxury-dark shadow-xl shadow-luxury-dark/10'
                    : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
                }`}
              >
                <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${state.selectionMode === 'suggestion' ? 'bg-luxury-gold text-white' : 'bg-[var(--bg)] text-[var(--muted)]'}`}>
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className={`text-xs font-black ${state.selectionMode === 'suggestion' ? 'text-white' : 'text-[var(--ink)]'}`}>TerraInfra Suggestion</p>
                  <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Auto-Match Best Fit</p>
                </div>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {state.selectionMode === 'manual' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black text-[var(--ink)] uppercase tracking-wider">Drafting Specialists</h3>
                    <span className="text-[10px] font-bold text-[var(--muted)]">{state.selectedLawyerIds.length} Selected</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {MOCK_LAWYERS.map((lawyer) => (
                      <LawyerCard 
                        key={lawyer.id} 
                        lawyer={lawyer} 
                        selected={state.selectedLawyerIds.includes(lawyer.id)}
                        onToggle={() => {
                          const newIds = state.selectedLawyerIds.includes(lawyer.id)
                            ? state.selectedLawyerIds.filter(id => id !== lawyer.id)
                            : [...state.selectedLawyerIds, lawyer.id];
                          setState({ ...state, selectedLawyerIds: newIds });
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {state.selectionMode === 'suggestion' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-luxury-dark rounded-[32px] p-8 text-center space-y-6 shadow-2xl shadow-orange-500/30"
                >
                  <div className="w-20 h-20 bg-luxury-gold rounded-[24px] flex items-center justify-center mx-auto shadow-xl shadow-luxury-gold/20">
                    <Sparkles size={40} className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white">Expert Matching</h3>
                    <p className="text-[var(--muted)] text-xs font-medium leading-relaxed">
                      Our system will analyze your agreement type, commercial structure, and required clauses to route your RFQ to the most qualified drafting expert.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-[var(--paper)]/5 rounded-2xl border border-white/10">
                      <ShieldAlert size={20} className="text-luxury-gold mx-auto mb-2" />
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">Verified Experts</p>
                    </div>
                    <div className="p-4 bg-[var(--paper)]/5 rounded-2xl border border-white/10">
                      <Zap size={20} className="text-luxury-gold mx-auto mb-2" />
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">Fast Routing</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 pb-32"
          >
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSignature className="w-10 h-10 text-luxury-gold" />
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">Review & Submit</h2>
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your agreement drafting requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Type & Context" 
                icon={FileSignature} 
                items={[
                  { label: 'Agreement', value: state.agreementType },
                  { label: 'Purpose', value: state.purpose },
                  { label: 'Type', value: state.transactionType }
                ]}
              />

              <ReviewSection 
                title="Parties & Stage" 
                icon={Handshake} 
                items={[
                  { label: 'Parties', value: state.partyStructure },
                  { label: 'Stage', value: state.transactionStage }
                ]}
              />

              <ReviewSection 
                title="Commercials & Clauses" 
                icon={ShieldCheck} 
                items={[
                  { label: 'Payment', value: state.commercialStructure },
                  { label: 'Clauses', value: state.requiredClauses }
                ]}
              />

              <ReviewSection 
                title="Scope & Deliverables" 
                icon={FileEdit} 
                items={[
                  { label: 'Service', value: state.serviceType },
                  { label: 'Support', value: state.additionalSupport },
                  { label: 'Output', value: state.finalOutput },
                  { label: 'Revisions', value: state.revisionScope }
                ]}
              />

              <ReviewSection 
                title="Expert Selection" 
                icon={Users} 
                items={[
                  { label: 'Mode', value: state.selectionMode === 'manual' ? 'Manual Selection' : 'TerraInfra Suggestion' },
                  { label: 'Experts', value: state.selectionMode === 'manual' ? `${state.selectedLawyerIds.length} Selected` : 'Auto-Match' }
                ]}
              />
            </div>
            
            <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[32px] p-6 space-y-6 shadow-sm">
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-[var(--ink)] uppercase tracking-wider px-1">Contact Information</h3>
                <TextInput 
                  label="Full Name" 
                  icon={User} 
                  placeholder="Enter your name"
                  value={state.userName}
                  onChange={(val) => setState({ ...state, userName: val })}
                />
                <TextInput 
                  label="Mobile Number" 
                  icon={Phone} 
                  placeholder="10-digit mobile number"
                  type="tel"
                  value={state.userPhone}
                  onChange={(val) => setState({ ...state, userPhone: val })}
                />
              </div>

              <button 
                disabled={!isStepValid()}
                onClick={handleFinalSubmit}
                className={`w-full py-5 rounded-2xl font-black text-sm shadow-xl transition-all ${
                  isStepValid() 
                    ? 'bg-orange-500 text-white shadow-orange-500/30 active:scale-[0.98]' 
                    : 'bg-[var(--paper)] text-[var(--muted)] cursor-not-allowed'
                }`}
              >
                Confirm & Submit RFQ
              </button>
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center space-y-8"
          >
            <div className="relative">
              <div className="w-32 h-32 bg-luxury-gold/10 rounded-full flex items-center justify-center shadow-2xl shadow-luxury-gold/10">
                <CheckCircle2 className="w-16 h-16 text-luxury-gold" />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-2 -right-2 w-10 h-10 bg-luxury-dark rounded-full flex items-center justify-center text-white shadow-lg"
              >
                <Sparkles size={20} />
              </motion.div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[var(--ink)] leading-tight">
                Drafting RFQ <span className="text-luxury-gold">Submitted!</span>
              </h2>
              <p className="text-[var(--muted)] text-sm font-semibold max-w-xs mx-auto">
                Thank you, {state.userName}. Your agreement drafting request has been sent to the selected experts.
              </p>
            </div>

            <div className="w-full max-w-xs bg-[var(--paper)] border border-[var(--line)] rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Your RFQ Number</p>
                <div className="flex items-center justify-center gap-3 py-3 bg-[var(--bg)] rounded-xl border border-[var(--line)]">
                  <span className="text-lg font-black text-[var(--ink)] tracking-tight">{state.rfqNumber}</span>
                  <button className="text-luxury-gold hover:text-luxury-gold/80 active:scale-90 transition-all">
                    <Copy size={18} />
                  </button>
                </div>
              </div>
              
              <button 
                onClick={onComplete}
                className="w-full py-4 bg-luxury-gold text-white rounded-2xl font-black text-sm shadow-lg shadow-luxury-gold/20 active:scale-[0.98] transition-all"
              >
                Done
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-premium-cream z-[60] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--paper)]/80 backdrop-blur-xl border-b border-[var(--line)] px-6 py-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 bg-[var(--bg)] rounded-full text-[var(--ink)] border border-[var(--line)]">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-bold text-[var(--ink)] tracking-tight">Agreement Drafting</h1>
          <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest">Step {step} of 7</p>
        </div>
        <div className="w-10 h-10" />
      </div>

      <div className="bg-[var(--paper)] border-b border-[var(--line)] px-6 py-3">
        <RFQStepBar step={step} totalSteps={7} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-32 no-scrollbar">
          {renderStep()}
      </div>

      {/* Footer Navigation */}
      {step < 6 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-[var(--paper)]/80 backdrop-blur-xl border-t border-[var(--line)] z-50">
          <div className="max-w-md mx-auto">
            <button 
              disabled={!isStepValid()}
              onClick={() => setStep(step + 1)}
              className={`w-full py-4.5 rounded-xl font-black flex items-center justify-center gap-3 transition-all shadow-xl ${
                isStepValid() 
                  ? 'bg-luxury-gold text-white shadow-luxury-gold/20' 
                  : 'bg-[var(--paper)] text-[var(--muted)] cursor-not-allowed shadow-none'
              }`}
            >
              {step === 5 ? 'Review RFQ' : 'Next Step'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
