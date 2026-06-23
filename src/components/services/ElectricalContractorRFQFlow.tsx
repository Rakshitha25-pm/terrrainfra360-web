import React, { useState, useEffect } from 'react';
import { submitServiceRFQ } from '../../lib/serviceRfq';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Building2, 
  Scaling, 
  ClipboardCheck, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  MessageSquare,
  Check,
  Star,
  Briefcase,
  Construction,
  Truck,
  User,
  Phone,
  Copy,
  Sparkles,
  Layers,
  Layout,
  Settings,
  Activity,
  Cpu,
  Trophy,
  Shield,
  Gem,
  Lightbulb,
  Wifi,
  Battery,
  Sun,
  Car
} from 'lucide-react';
import { ElectricalContractor } from '../rfq-types';
import { MOCK_ELECTRICAL_CONTRACTORS } from '../rfq-constants';
import { RFQStepBar } from './RFQStepBar';

interface ElectricalContractorRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface ElectricalState {
  // Step 1: Requirement Type
  requirementType: string;
  // Step 2: Project Context
  propertyType: string;
  constructionStage: string;
  propertySize: string;
  floorsCount: string;
  intendedUsage: string;
  // Step 3: Quality Level
  qualityLevel: string;
  // Step 4: Core Components
  coreComponents: string;
  // Step 5-7: Brand Tiers & Selections
  switchTier: string;
  selectedSwitchBrands: string[];
  wireTier: string;
  selectedWireBrands: string[];
  mcbTier: string;
  selectedMcbBrands: string[];
  // Step 8: Additional Systems
  additionalSystems: string[];
  // Step 9: Responsibility Model
  responsibilityModel: string;
  // Step 10: Site Readiness
  siteReadiness: string;
  // Step 11: Timeline & Final Input
  urgency: string;
  specificInstructions: string;
  // Step 12: Selection
  selectionMode: 'manual' | 'suggestion' | '';
  selectedContractorIds: string[];
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

const ReviewSection = ({ title, icon: Icon, items }: { title: string, icon: any, items: { label: string, value: string | boolean | string[] | null }[] }) => (
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

const ContractorCard: React.FC<{ contractor: ElectricalContractor, selected: boolean, onToggle: () => void }> = ({ contractor, selected, onToggle }) => (
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
        <h4 className="text-sm font-black text-[var(--ink)] group-hover:text-luxury-gold transition-colors">{contractor.name}</h4>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
          <MapPin size={12} />
          {contractor.location}
        </div>
      </div>
      <div className="flex items-center gap-1 bg-luxury-gold/10 px-2 py-1 rounded-lg">
        <Star size={10} className="text-luxury-gold fill-luxury-gold" />
        <span className="text-[10px] font-black text-luxury-gold">{contractor.rating}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="space-y-1">
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Experience</p>
        <p className="text-[11px] font-black text-[var(--ink)]">{contractor.experience}</p>
      </div>
      <div className="space-y-1 text-right">
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Projects</p>
        <p className="text-[11px] font-black text-[var(--ink)]">{contractor.projectsCompleted}+</p>
      </div>
    </div>

    <div className="space-y-3">
      <div>
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Specialization</p>
        <div className="flex flex-wrap gap-1">
          {contractor.specialization.map((s, i) => (
            <span key={i} className="px-2 py-0.5 bg-[var(--bg)] border border-[var(--line)] rounded-md text-[9px] font-bold text-[var(--muted)]">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Licensing / Brands</p>
        <div className="flex flex-wrap gap-1">
          {contractor.certifications.map((c, i) => (
            <span key={i} className="px-2 py-0.5 bg-green-50 border border-green-100 rounded-md text-[9px] font-bold text-green-600">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-[var(--line)]">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">
          <Briefcase size={12} />
          {contractor.executionCapability.join(' / ')}
        </div>
        <div className="text-[9px] font-black text-luxury-gold uppercase tracking-widest">
          {contractor.availability}
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

const BrandCard: React.FC<{ name: string, tags: string[], selected: boolean, onToggle: () => void }> = ({ name, tags, selected, onToggle }) => (
  <button
    onClick={onToggle}
    className={`p-4 rounded-2xl border transition-all text-left space-y-2 relative ${
      selected 
        ? 'bg-luxury-gold/5 border-luxury-gold shadow-md shadow-luxury-gold/5' 
        : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
    }`}
  >
    <p className={`text-[13px] font-black ${selected ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}>{name}</p>
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, i) => (
        <span key={i} className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
          selected ? 'bg-luxury-gold/20 text-luxury-gold' : 'bg-[var(--paper)] text-[var(--muted)]'
        }`}>
          {tag}
        </span>
      ))}
    </div>
    {selected && (
      <div className="absolute top-2 right-2 text-luxury-gold">
        <CheckCircle2 size={14} />
      </div>
    )}
  </button>
);

const BRANDS_DATA = {
  switches: {
    Standard: [
      { name: 'Anchor', tags: ['Popular', 'Value'] },
      { name: 'GM', tags: ['Recommended', 'Versatile'] },
      { name: 'Goldmedal', tags: ['Budget Friendly'] }
    ],
    Classic: [
      { name: 'Havells', tags: ['High Safety', 'Popular'] },
      { name: 'Polycab', tags: ['Durable', 'Recommended'] },
      { name: 'Wipro', tags: ['Modern Design'] }
    ],
    Luxury: [
      { name: 'Legrand', tags: ['Premium', 'Luxury Choice'] },
      { name: 'Schneider', tags: ['High Tech', 'Recommended'] },
      { name: 'Panasonic', tags: ['Elegant'] }
    ]
  },
  wiring: {
    Standard: [
      { name: 'Anchor', tags: ['Standard'] },
      { name: 'GM', tags: ['Value'] },
      { name: 'V-Guard', tags: ['Popular'] }
    ],
    Classic: [
      { name: 'Havells', tags: ['High Safety', 'Recommended'] },
      { name: 'Polycab', tags: ['Popular', 'Durable'] },
      { name: 'Finolex', tags: ['Trusted'] }
    ],
    Luxury: [
      { name: 'Finolex (FRLS)', tags: ['Premium Safety'] },
      { name: 'RR Kabel', tags: ['Top Quality'] },
      { name: 'KEI', tags: ['High Performance'] }
    ]
  },
  mcb: {
    Standard: [
      { name: 'Anchor', tags: ['Basic Protection'] },
      { name: 'GM', tags: ['Value'] },
      { name: 'IndoAsian', tags: ['Standard'] }
    ],
    Classic: [
      { name: 'Havells', tags: ['Recommended', 'Popular'] },
      { name: 'Polycab', tags: ['Reliable'] },
      { name: 'L&T', tags: ['High Durability'] }
    ],
    Luxury: [
      { name: 'Schneider', tags: ['Advanced Safety', 'Premium'] },
      { name: 'Legrand', tags: ['Top Tier', 'Recommended'] },
      { name: 'ABB', tags: ['Global Standard'] }
    ]
  }
};

export const ElectricalContractorRFQFlow: React.FC<ElectricalContractorRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<ElectricalState>({
    requirementType: 'Complete Electrical Work',
    propertyType: '',
    constructionStage: '',
    propertySize: '',
    floorsCount: '',
    intendedUsage: '',
    qualityLevel: '',
    coreComponents: 'Complete Setup (Wiring + Switches + DB)',
    switchTier: '',
    selectedSwitchBrands: [],
    wireTier: '',
    selectedWireBrands: [],
    mcbTier: '',
    selectedMcbBrands: [],
    additionalSystems: [],
    responsibilityModel: 'Complete Design & Execution',
    siteReadiness: '',
    urgency: '',
    specificInstructions: '',
    selectionMode: '',
    selectedContractorIds: [],
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const isStepValid = () => {
    if (step === 1) return state.requirementType !== '';
    if (step === 2) return state.propertyType !== '' && state.constructionStage !== '' && state.propertySize !== '' && state.floorsCount !== '' && state.intendedUsage !== '';
    if (step === 3) return state.qualityLevel !== '';
    if (step === 4) return state.coreComponents !== '';
    // Brand steps (5,6,7) are optional
    if (step === 8) return true; // Additional systems optional
    if (step === 9) return state.responsibilityModel !== '';
    if (step === 10) return state.siteReadiness !== '';
    if (step === 11) return state.urgency !== '';
    if (step === 12) {
      if (state.selectionMode === 'suggestion') return true;
      if (state.selectionMode === 'manual') return state.selectedContractorIds.length > 0;
      return false;
    }
    if (step === 13) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-ELE-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Electrical', { ...state, rfqNumber: rfqNum });
    setStep(14);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Electrical <span className="text-luxury-gold">Requirement.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Choose the type of electrical work you need.
              </p>
            </div>

            <SectionWrapper title="Work Type" icon={Zap} subtitle="Select requirement">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'Complete Electrical Work', desc: 'Full wiring, points, and DB setup for new builds or full renovations.', icon: Sparkles, recommended: true },
                  { id: 'Partial Work', desc: 'Specific additions, room-wise wiring, or component upgrades.', icon: Layers },
                  { id: 'Repair & Maintenance', desc: 'Fixing faults, replacing components, or general checkups.', icon: Settings }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setState({ ...state, requirementType: item.id })}
                    className={`p-5 rounded-[24px] border transition-all text-left flex gap-4 items-start relative ${
                      state.requirementType === item.id
                        ? 'bg-luxury-gold/5 border-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${state.requirementType === item.id ? 'bg-luxury-gold text-white' : 'bg-[var(--bg)] text-[var(--muted)]'}`}>
                      <item.icon size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className={`text-[13px] font-black ${state.requirementType === item.id ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}>{item.id}</p>
                      <p className="text-[10px] font-bold text-[var(--muted)] leading-relaxed">{item.desc}</p>
                    </div>
                    {item.recommended && (
                      <div className="absolute top-4 right-4 px-2 py-0.5 bg-luxury-gold text-white text-[8px] font-black uppercase tracking-widest rounded">
                        Recommended
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Project <span className="text-luxury-gold">Context.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Help us understand your property and intended usage.
              </p>
            </div>

            <SectionWrapper title="Property Details" icon={Building2} subtitle="Type & Stage">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Property Type</p>
                  <SegmentedControl 
                    options={['House', 'Villa', 'Apartment', 'Commercial']} 
                    selected={state.propertyType} 
                    onChange={(val) => setState({ ...state, propertyType: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Construction Stage</p>
                  <SegmentedControl 
                    options={['Planning', 'Structure', 'Plastering', 'Finishing']} 
                    selected={state.constructionStage} 
                    onChange={(val) => setState({ ...state, constructionStage: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Intended Usage</p>
                  <SegmentedControl 
                    options={['Self-Living', 'Rental', 'Premium Home', 'Commercial']} 
                    selected={state.intendedUsage} 
                    onChange={(val) => setState({ ...state, intendedUsage: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Scale" icon={Scaling} subtitle="Size & Floors">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Size Range (sqft)</p>
                  <SegmentedControl 
                    options={['< 1000', '1000-2000', '2000-4000', '4000+']} 
                    selected={state.propertySize} 
                    onChange={(val) => setState({ ...state, propertySize: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Number of Floors</p>
                  <SegmentedControl 
                    options={['G Only', 'G+1', 'G+2', 'G+3+']} 
                    selected={state.floorsCount} 
                    onChange={(val) => setState({ ...state, floorsCount: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Expected <span className="text-luxury-gold">Quality.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Select the overall quality level for your electrical setup.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'Standard', icon: Trophy, desc: 'Reliable components with focus on safety and value.', color: 'text-blue-500', bg: 'bg-blue-50' },
                { id: 'Classic', icon: Shield, desc: 'Enhanced safety features and popular designer brands.', color: 'text-luxury-gold', bg: 'bg-luxury-gold/10' },
                { id: 'Luxury', icon: Gem, desc: 'Premium international brands with high-end aesthetics.', color: 'text-purple-500', bg: 'bg-purple-50' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setState({ ...state, qualityLevel: item.id })}
                  className={`p-6 rounded-[32px] border-2 transition-all text-left flex gap-6 items-center ${
                    state.qualityLevel === item.id
                      ? 'bg-luxury-gold/5 border-luxury-gold shadow-xl shadow-luxury-gold/10'
                      : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.bg} ${item.color}`}>
                    <item.icon size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-black text-[var(--ink)]">{item.id}</p>
                    <p className="text-xs font-bold text-[var(--muted)] leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Core <span className="text-luxury-gold">Components.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Confirm the scope of your electrical components.
              </p>
            </div>

            <SectionWrapper title="Electrical Scope" icon={ClipboardCheck} subtitle="What's included?">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Complete Setup (Wiring + Switches + DB)',
                  'Only Wiring & Points',
                  'Only Switches & Sockets',
                  'Upgrades & Replacements'
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setState({ ...state, coreComponents: item })}
                    className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between ${
                      state.coreComponents === item
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    <span className="text-[13px] font-black">{item}</span>
                    {state.coreComponents === item && <Check size={18} />}
                  </button>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 5:
      case 6:
      case 7:
        const componentType = step === 5 ? 'switches' : step === 6 ? 'wiring' : 'mcb';
        const tierKey = step === 5 ? 'switchTier' : step === 6 ? 'wireTier' : 'mcbTier';
        const selectionKey = step === 5 ? 'selectedSwitchBrands' : step === 6 ? 'selectedWireBrands' : 'selectedMcbBrands';
        const currentTier = state[tierKey as keyof ElectricalState] as string;
        const currentSelection = state[selectionKey as keyof ElectricalState] as string[];

        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                {step === 5 ? 'Switches' : step === 6 ? 'Wiring' : 'MCB/DB'} <span className="text-luxury-gold">Brands.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Select a quality tier and choose your preferred brands.
              </p>
            </div>

            <SectionWrapper title="Quality Tier" icon={Trophy} subtitle="Select tier first">
              <SegmentedControl 
                options={['No Preference', 'Standard', 'Classic', 'Luxury']} 
                selected={currentTier || 'No Preference'} 
                onChange={(val) => setState({ ...state, [tierKey]: val === 'No Preference' ? '' : val, [selectionKey]: [] })} 
              />
            </SectionWrapper>

            <AnimatePresence mode="wait">
              {currentTier && (
                <motion.div
                  key={currentTier}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black text-[var(--ink)] uppercase tracking-wider">{currentTier} Brands</h3>
                    <span className="text-[10px] font-bold text-[var(--muted)]">Optional</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {BRANDS_DATA[componentType as keyof typeof BRANDS_DATA][currentTier as 'Standard' | 'Classic' | 'Luxury'].map((brand) => (
                      <BrandCard 
                        key={brand.name}
                        name={brand.name}
                        tags={brand.tags}
                        selected={currentSelection.includes(brand.name)}
                        onToggle={() => {
                          const newSelection = currentSelection.includes(brand.name)
                            ? currentSelection.filter(b => b !== brand.name)
                            : [...currentSelection, brand.name];
                          setState({ ...state, [selectionKey]: newSelection });
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      case 8:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Additional <span className="text-luxury-gold">Systems.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Select any upgrades or additional electrical systems.
              </p>
            </div>

            <SectionWrapper title="Upgrades" icon={Sparkles} subtitle="Optional additions">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Inverter / UPS Setup', icon: Battery },
                  { id: 'CCTV System', icon: Wifi },
                  { id: 'Smart Home Automation', icon: Cpu },
                  { id: 'Solar Integration', icon: Sun },
                  { id: 'EV Charging Point', icon: Car },
                  { id: 'Video Door Phone', icon: Phone },
                  { id: 'Fire Alarm System', icon: Activity },
                  { id: 'Intercom Setup', icon: Phone }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const newSystems = state.additionalSystems.includes(item.id)
                        ? state.additionalSystems.filter(s => s !== item.id)
                        : [...state.additionalSystems, item.id];
                      setState({ ...state, additionalSystems: newSystems });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center flex flex-col items-center gap-2 ${
                      state.additionalSystems.includes(item.id)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.id}
                  </button>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 9:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Responsibility <span className="text-luxury-gold">Model.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Choose how you want to engage with the contractor.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'Labour Only', desc: 'You provide all materials; contractor provides skilled labour.', icon: User },
                { id: 'Labour + Material', desc: 'Contractor sources materials and provides labour.', icon: Truck },
                { id: 'Complete Design & Execution', desc: 'End-to-end service including planning, sourcing, and setup.', icon: Sparkles, recommended: true }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setState({ ...state, responsibilityModel: item.id })}
                  className={`p-5 rounded-[24px] border transition-all text-left flex gap-4 items-start relative ${
                    state.responsibilityModel === item.id
                      ? 'bg-luxury-gold/5 border-luxury-gold shadow-lg shadow-luxury-gold/5'
                      : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${state.responsibilityModel === item.id ? 'bg-luxury-gold text-white' : 'bg-[var(--bg)] text-[var(--muted)]'}`}>
                    <item.icon size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className={`text-[13px] font-black ${state.responsibilityModel === item.id ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}>{item.id}</p>
                    <p className="text-[10px] font-bold text-[var(--muted)] leading-relaxed">{item.desc}</p>
                  </div>
                  {item.recommended && (
                    <div className="absolute top-4 right-4 px-2 py-0.5 bg-luxury-gold text-white text-[8px] font-black uppercase tracking-widest rounded">
                      Recommended
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 10:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Site <span className="text-luxury-gold">Readiness.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                What is the current stage of your site?
              </p>
            </div>

            <SectionWrapper title="Site Stage" icon={Construction} subtitle="Technical readiness">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Open Structure (Brick/Block)', 
                  'Wall-Complete (Plastered)', 
                  'Finished Stage (Painted/Ready)'
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => setState({ ...state, siteReadiness: status })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.siteReadiness === status
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 11:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Timeline & <span className="text-luxury-gold">Input.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Finalize requirement and add specific instructions.
              </p>
            </div>

            <SectionWrapper title="Requirement Timeline" icon={Clock} subtitle="Urgency">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Start Requirement</p>
                <SegmentedControl 
                  options={['Immediate', 'Within 3 Days', '1 Week', 'Flexible']} 
                  selected={state.urgency} 
                  onChange={(val) => setState({ ...state, urgency: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Final Input" icon={MessageSquare} subtitle="Optional instructions">
              <textarea 
                value={state.specificInstructions}
                onChange={(e) => setState({ ...state, specificInstructions: e.target.value })}
                placeholder="Special requirements, site constraints, or specific notes for the contractor..."
                className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors h-32 resize-none"
              />
            </SectionWrapper>
          </motion.div>
        );
      case 12:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Contractor <span className="text-luxury-gold">Selection.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Choose your electrical expert or let us suggest the best fit.
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
                  <Zap size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-[var(--ink)]">Select Manually</p>
                  <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Choose Experts</p>
                </div>
              </button>

              <button
                onClick={() => setState({ ...state, selectionMode: 'suggestion', selectedContractorIds: [] })}
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
                    <h3 className="text-[11px] font-black text-[var(--ink)] uppercase tracking-wider">Electrical Experts</h3>
                    <span className="text-[10px] font-bold text-[var(--muted)]">{state.selectedContractorIds.length} Selected</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {MOCK_ELECTRICAL_CONTRACTORS.map((contractor) => (
                      <ContractorCard 
                        key={contractor.id} 
                        contractor={contractor} 
                        selected={state.selectedContractorIds.includes(contractor.id)}
                        onToggle={() => {
                          const newIds = state.selectedContractorIds.includes(contractor.id)
                            ? state.selectedContractorIds.filter(id => id !== contractor.id)
                            : [...state.selectedContractorIds, contractor.id];
                          setState({ ...state, selectedContractorIds: newIds });
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
                    <h3 className="text-xl font-black text-white">Safety-First Matching</h3>
                    <p className="text-[var(--muted)] text-xs font-medium leading-relaxed">
                      Our system will analyze your wiring type, electrical load, and technical specifications to route your RFQ to the most qualified licensed electrical contractor.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-[var(--paper)]/5 rounded-2xl border border-white/10">
                      <ShieldCheck size={20} className="text-luxury-gold mx-auto mb-2" />
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">Licensed Experts</p>
                    </div>
                    <div className="p-4 bg-[var(--paper)]/5 rounded-2xl border border-white/10">
                      <Activity size={20} className="text-luxury-gold mx-auto mb-2" />
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">Safety Audited</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      case 13:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 pb-32"
          >
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-luxury-gold" />
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">Review & Submit</h2>
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your electrical requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Project Basics" 
                icon={Building2} 
                items={[
                  { label: 'Requirement', value: state.requirementType },
                  { label: 'Type', value: state.propertyType },
                  { label: 'Stage', value: state.constructionStage },
                  { label: 'Usage', value: state.intendedUsage }
                ]}
              />

              <ReviewSection 
                title="Quality & Scope" 
                icon={ShieldCheck} 
                items={[
                  { label: 'Quality', value: state.qualityLevel },
                  { label: 'Scope', value: state.coreComponents }
                ]}
              />

              <ReviewSection 
                title="Brands" 
                icon={Settings} 
                items={[
                  { label: 'Switches', value: state.selectedSwitchBrands.length > 0 ? state.selectedSwitchBrands : 'No Preference' },
                  { label: 'Wiring', value: state.selectedWireBrands.length > 0 ? state.selectedWireBrands : 'No Preference' },
                  { label: 'MCB/DB', value: state.selectedMcbBrands.length > 0 ? state.selectedMcbBrands : 'No Preference' }
                ]}
              />

              <ReviewSection 
                title="Execution & Site" 
                icon={Construction} 
                items={[
                  { label: 'Upgrades', value: state.additionalSystems },
                  { label: 'Model', value: state.responsibilityModel },
                  { label: 'Readiness', value: state.siteReadiness }
                ]}
              />
            </div>

            <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[32px] p-8 space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-luxury-gold transition-colors">
                    <User size={18} />
                  </div>
                  <input 
                    type="text"
                    value={state.userName}
                    onChange={(e) => setState({ ...state, userName: e.target.value })}
                    placeholder="Your Full Name"
                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-4 focus:ring-luxury-gold/5 focus:border-luxury-gold/50 transition-all"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-luxury-gold transition-colors">
                    <Phone size={18} />
                  </div>
                  <input 
                    type="tel"
                    value={state.userPhone}
                    onChange={(e) => setState({ ...state, userPhone: e.target.value })}
                    placeholder="WhatsApp Number"
                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-4 focus:ring-luxury-gold/5 focus:border-luxury-gold/50 transition-all"
                  />
                </div>
              </div>

              <p className="text-[10px] text-[var(--muted)] text-center font-medium leading-relaxed px-4">
                By submitting, you agree to share these details with the selected electrical contractors for quotation purposes.
              </p>
            </div>
          </motion.div>
        );
      case 14:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-12"
          >
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute -top-2 -right-2 w-10 h-10 bg-luxury-gold rounded-2xl flex items-center justify-center text-white shadow-lg rotate-12"
              >
                <Sparkles size={20} />
              </motion.div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[var(--ink)] tracking-tight">RFQ Published!</h2>
              <p className="text-[var(--muted)] font-semibold text-sm">Your electrical requirement is now live.</p>
            </div>

            <div className="bg-luxury-dark rounded-[32px] p-8 space-y-6 shadow-2xl shadow-orange-500/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-luxury-gold/20 transition-colors" />
              
              <div className="space-y-2 relative">
                <p className="text-[10px] font-black text-luxury-gold uppercase tracking-[0.3em]">Reference Number</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-black text-white tracking-wider">{state.rfqNumber}</span>
                  <button className="p-2 bg-[var(--paper)]/10 hover:bg-[var(--paper)]/20 rounded-xl text-white transition-colors">
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4 relative">
                <div className="text-left space-y-1">
                  <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Status</p>
                  <p className="text-xs font-black text-green-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Active
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Routing</p>
                  <p className="text-xs font-black text-white">
                    {state.selectionMode === 'manual' ? `${state.selectedContractorIds.length} Contractors` : 'Auto-Matching'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)]">
                <div className="w-10 h-10 bg-[var(--paper)] rounded-xl flex items-center justify-center text-luxury-gold shadow-sm">
                  <MessageSquare size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-[var(--ink)]">WhatsApp Updates</p>
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-tight">You'll receive quotes on WhatsApp</p>
                </div>
              </div>
            </div>

            <button
              onClick={onComplete}
              className="w-full py-5 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
            >
              Back to Dashboard
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-premium-cream z-[60] flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between bg-[var(--paper)] border-b border-[var(--line)]">
        <button 
          onClick={step === 1 ? onBack : () => setStep(step - 1)}
          className="p-3 bg-[var(--bg)] rounded-2xl text-[var(--ink)] border border-[var(--line)] active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 mx-4">
          <RFQStepBar step={step} totalSteps={13} />
        </div>
        <div className="w-11" />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
          {renderStep()}
      </div>

      {/* Footer */}
      {step < 14 && (
        <div className="p-6 bg-[var(--paper)] border-t border-[var(--line)]">
          <div className="max-w-4xl mx-auto">
            <button
              disabled={!isStepValid()}
              onClick={() => step === 13 ? handleFinalSubmit() : setStep(step + 1)}
              className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all uppercase tracking-widest ${
                isStepValid() 
                  ? 'bg-luxury-gold text-[var(--ink)] shadow-xl shadow-luxury-gold/20 active:scale-[0.98]' 
                  : 'bg-[var(--paper)] text-[var(--muted)] cursor-not-allowed shadow-none'
              }`}
            >
              {step === 13 ? 'Publish RFQ' : 'Next Section'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
