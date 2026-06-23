import React, { useState, useEffect } from 'react';
import { submitServiceRFQ } from '../../lib/serviceRfq';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  MapPin, 
  Ruler, 
  Home, 
  Calendar, 
  ArrowRight, 
  Building2,
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronDown,
  LayoutGrid,
  Utensils,
  Armchair,
  Hammer,
  Zap,
  Lightbulb,
  Fan,
  AirVent,
  ToggleLeft,
  ToggleRight,
  Paintbrush,
  DoorOpen,
  Grid3X3,
  Box,
  Wallet,
  Users,
  ShieldAlert,
  Truck,
  ParkingCircle,
  Briefcase,
  Upload,
  Image as ImageIcon,
  Video,
  User,
  Phone,
  FileText,
  Copy
} from 'lucide-react';
import { RFQStepBar } from './RFQStepBar';

interface InteriorRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
  selectedService: string;
}

type RFQState = {
  location: string;
  spaceType: string;
  area: string;
  configuration: string;
  projectType: string;
  siteCondition: string;
  timeline: string;
  // Step 2: Modular Works
  kitchenType: string;
  kitchenRequired: string;
  wardrobeType: string;
  wardrobeCount: number;
  tvUnitRequired: string;
  crockeryUnitRequired: string;
  additionalUnits: string[];
  coreMaterial: string;
  finishMaterial: string;
  // Step 3: Civil & False Ceiling
  wallDemolition: boolean;
  newPartitions: boolean;
  partitionType: string;
  partitionRequired: string;
  partitionMaterial: string;
  ceilingType: string;
  falseCeiling: string;
  civilChanges: string;
  // Step 4 extra
  electricalRewiring: string;
  lightingAutomation: string;
  // Step 4: Electrical & Lighting
  wiringType: string;
  lightCount: number;
  fanCount: number;
  acCount: number;
  switchboardCount: number;
  needBrandGuidance: boolean;
  brandPreference: string;
  // Step 5: Flooring & Wall Finishes
  newFlooring: boolean;
  flooringType: string;
  modifyWallFinish: boolean;
  wallFinishes: string[];
  // Step 6: Doors & Windows
  newDoors: boolean;
  doorFinishType: string;
  hardwareQuality: string;
  // Step 7: Budget & Execution
  finishExpectation: string;
  exploredSqftPricing: boolean;
  possessionDate: string;
  idealMoveInDate: string;
  delayPenalty: boolean;
  decisionMaker: string;
  designerInvolved: boolean;
  contractorsEvaluating: number;
  associationRulesAware: boolean;
  workTimings: string;
  liftUsageCharges: boolean;
  materialAccess: string;
  parkingAvailable: boolean;
  // Step 8: Commercial & Intake
  commercialScope: string;
  paymentTerms: string;
  warrantyExpectation: string;
  executionPreference: string;
  costOptimization: boolean;
  threeDDesign: string;
  scopeExtension: string;
  previousIssues: string;
  workScopeInclusion: string[];
  materialPreference: string;
  brandExpectation: string;
  pricingFormat: string;
  // Step 9: Media Upload
  mediaFiles: File[];
  hasPlans: boolean;
  // Step 10: Contact & Submit
  userName: string;
  userPhone: string;
  rfqNumber: string;
};

const SectionWrapper = ({ children, title, icon: Icon, subtitle }: { children: React.ReactNode, title: string, icon: any, subtitle?: string }) => (
  <div className="p-6 rounded-[32px] bg-[var(--paper)] border border-[var(--line)] shadow-sm space-y-6">
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <h3 className="font-display font-black text-[var(--ink)] text-lg tracking-tight">{title}</h3>
          {subtitle && <p className="text-[var(--muted)] text-[10px] font-bold uppercase tracking-wider">{subtitle}</p>}
        </div>
      </div>
    </div>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

interface PillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const Pill: React.FC<PillProps> = ({ label, selected, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 border ${
      selected 
        ? 'bg-luxury-gold border-luxury-gold text-white shadow-lg shadow-luxury-gold/20' 
        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--muted)] hover:border-luxury-gold/30'
    }`}
  >
    {label}
  </motion.button>
);

const SegmentedControl = ({ options, selected, onChange }: { options: string[], selected: string, onChange: (val: string) => void }) => (
  <div className="flex p-1 bg-[var(--bg)] rounded-2xl border border-[var(--line)] w-full">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`flex-1 py-2.5 rounded-xl text-[11px] font-black tracking-tight transition-all duration-300 ${
          selected === opt 
            ? 'bg-[var(--paper)] text-luxury-gold shadow-sm' 
            : 'text-[var(--muted)] hover:text-[var(--muted)]'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

const Toggle = ({ label, enabled, onChange }: { label: string, enabled: boolean, onChange: (val: boolean) => void }) => (
  <button 
    onClick={() => onChange(!enabled)}
    className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
  >
    <span className="text-[13px] font-bold text-[var(--ink)]">{label}</span>
    <div className={`w-16 h-8 rounded-full transition-all duration-300 relative flex items-center px-1 ${enabled ? 'bg-luxury-gold' : 'bg-[var(--line)]'}`}>
      <div className="absolute inset-0 flex items-center justify-between px-2.5">
        <span className={`text-[9px] font-black uppercase tracking-tighter transition-opacity duration-300 ${enabled ? 'opacity-100 text-white' : 'opacity-0'}`}>
          Yes
        </span>
        <span className={`text-[9px] font-black uppercase tracking-tighter transition-opacity duration-300 ${enabled ? 'opacity-0' : 'opacity-100 text-[var(--muted)]'}`}>
          No
        </span>
      </div>
      <motion.div 
        animate={{ x: enabled ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-6 h-6 rounded-full bg-[var(--paper)] shadow-sm z-10"
      />
    </div>
  </button>
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

const TextInput = ({ label, value, onChange, icon: Icon, placeholder, type = "text" }: { label: string, value: string, onChange: (val: string) => void, icon: any, placeholder?: string, type?: string }) => (
  <div className="space-y-2">
    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">{label}</p>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
        <Icon size={16} />
      </div>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors shadow-sm"
      />
    </div>
  </div>
);

const NumberInput = ({ label, value, onChange, icon: Icon }: { label: string, value: number, onChange: (val: number) => void, icon: any }) => (
  <div className="flex items-center justify-between p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-sm">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[var(--bg)] flex items-center justify-center text-[var(--muted)]">
        <Icon size={16} />
      </div>
      <span className="text-[13px] font-bold text-[var(--ink)]">{label}</span>
    </div>
    <div className="flex items-center gap-4">
      <button 
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--muted)] active:bg-[var(--bg)]"
      >
        -
      </button>
      <span className="text-sm font-black text-[var(--ink)] w-6 text-center">{value}</span>
      <button 
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--muted)] active:bg-[var(--bg)]"
      >
        +
      </button>
    </div>
  </div>
);

export const InteriorRFQFlow: React.FC<InteriorRFQFlowProps> = ({ onBack, onComplete, selectedService }) => {
  const [step, setStep] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [state, setState] = useState<RFQState>({
    location: '',
    spaceType: '',
    area: '',
    configuration: '',
    projectType: '',
    siteCondition: '',
    timeline: '',
    kitchenType: '',
    kitchenRequired: '',
    wardrobeType: '',
    wardrobeCount: 0,
    tvUnitRequired: '',
    crockeryUnitRequired: '',
    additionalUnits: [],
    coreMaterial: '',
    finishMaterial: 'Laminate',
    wallDemolition: false,
    newPartitions: false,
    partitionType: '',
    partitionRequired: '',
    partitionMaterial: '',
    ceilingType: '',
    falseCeiling: '',
    civilChanges: '',
    electricalRewiring: '',
    lightingAutomation: '',
    wiringType: '',
    lightCount: 0,
    fanCount: 0,
    acCount: 0,
    switchboardCount: 0,
    needBrandGuidance: false,
    brandPreference: '',
    newFlooring: false,
    flooringType: '',
    modifyWallFinish: false,
    wallFinishes: [],
    newDoors: false,
    doorFinishType: '',
    hardwareQuality: '',
    finishExpectation: '',
    exploredSqftPricing: false,
    possessionDate: '',
    idealMoveInDate: '',
    delayPenalty: false,
    decisionMaker: '',
    designerInvolved: false,
    contractorsEvaluating: 1,
    associationRulesAware: false,
    workTimings: '',
    liftUsageCharges: false,
    materialAccess: '',
    parkingAvailable: false,
    commercialScope: '',
    paymentTerms: '',
    warrantyExpectation: '',
    executionPreference: '',
    costOptimization: false,
    threeDDesign: '',
    scopeExtension: '',
    previousIssues: '',
    workScopeInclusion: [],
    materialPreference: '',
    brandExpectation: '',
    pricingFormat: '',
    mediaFiles: [],
    hasPlans: false,
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const isStepValid = () => {
    if (step === 1) {
      return (
        state.location.trim() !== '' &&
        state.spaceType !== '' &&
        state.area.trim() !== '' &&
        state.projectType !== '' &&
        state.siteCondition !== '' &&
        state.timeline !== ''
      );
    }
    if (step === 2) {
      return (
        state.kitchenType !== '' &&
        state.wardrobeType !== '' &&
        state.coreMaterial !== '' &&
        state.finishMaterial !== ''
      );
    }
    if (step === 3) {
      return (
        state.ceilingType !== '' &&
        (!state.newPartitions || state.partitionType !== '')
      );
    }
    if (step === 4) {
      return (
        state.wiringType !== '' &&
        (!state.needBrandGuidance || state.brandPreference !== '')
      );
    }
    if (step === 5) {
      return (
        (!state.newFlooring || state.flooringType !== '') &&
        (!state.modifyWallFinish || state.wallFinishes.length > 0)
      );
    }
    if (step === 6) {
      return (
        state.doorFinishType !== '' &&
        state.hardwareQuality !== ''
      );
    }
    if (step === 7) {
      return (
        state.finishExpectation !== '' &&
        state.possessionDate !== '' &&
        state.idealMoveInDate !== '' &&
        state.decisionMaker !== '' &&
        state.workTimings !== '' &&
        state.materialAccess !== ''
      );
    }
    if (step === 8) {
      return (
        state.commercialScope !== '' &&
        state.paymentTerms !== '' &&
        state.warrantyExpectation !== '' &&
        state.executionPreference !== '' &&
        state.threeDDesign !== '' &&
        state.scopeExtension !== '' &&
        state.workScopeInclusion.length > 0 &&
        state.materialPreference !== '' &&
        state.brandExpectation !== '' &&
        state.pricingFormat !== ''
      );
    }
    if (step === 9) {
      return true; // Media upload is optional
    }
    if (step === 10) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return (
        state.userName.trim().length >= 3 &&
        phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10))
      );
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-RFQ-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Interior', { ...state, rfqNumber: rfqNum });
    setStep(11);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="grid grid-cols-3 gap-4 items-stretch"
          >
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Project <span className="text-luxury-gold">Basics.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Tell us about your {selectedService.toLowerCase()} project to get started.
              </p>
            </div>

            <SectionWrapper title="Project Location" icon={MapPin} subtitle="Where is the site?">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-luxury-gold transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Enter area or city..." 
                  className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl py-4 pl-12 pr-5 text-[13px] focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all font-bold text-[var(--ink)]" 
                  value={state.location} 
                  onChange={(e) => setState({ ...state, location: e.target.value })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Type of Space" icon={Building2} subtitle="Select the space category">
              <div className="grid grid-cols-2 gap-3">
                {['Apartment', 'Villa', 'Office', 'Retail', 'Clinic', 'Restaurant', 'Showroom'].map((type) => (
                  <Pill 
                    key={type} 
                    label={type} 
                    selected={state.spaceType === type} 
                    onClick={() => setState({ ...state, spaceType: type })} 
                  />
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Area Details" icon={Ruler} subtitle="Carpet / Built-up / Usable area">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="e.g. 1200 sq.ft" 
                  className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl py-4 px-5 text-[13px] focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all font-bold text-[var(--ink)]" 
                  value={state.area} 
                  onChange={(e) => setState({ ...state, area: e.target.value })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Project Type" icon={Sparkles} subtitle="New or Renovation?">
              <div className="flex flex-wrap gap-3">
                {['New Fit-out', 'Renovation'].map((type) => (
                  <Pill 
                    key={type} 
                    label={type} 
                    selected={state.projectType === type} 
                    onClick={() => setState({ ...state, projectType: type })} 
                  />
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Site Condition" icon={Layers} subtitle="Current state of the site">
              <div className="grid grid-cols-1 gap-3">
                {['Empty Shell', 'Warm Shell', 'Fully Operational Renovation'].map((condition) => (
                  <Pill 
                    key={condition} 
                    label={condition} 
                    selected={state.siteCondition === condition} 
                    onClick={() => setState({ ...state, siteCondition: condition })} 
                  />
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Project Timeline" icon={Calendar} subtitle="Completion period">
              <div className="grid grid-cols-2 gap-3">
                {['0-1 months', '0-2 months', '2-4 months', '4-6 months'].map((time) => (
                  <Pill 
                    key={time} 
                    label={time} 
                    selected={state.timeline === time} 
                    onClick={() => setState({ ...state, timeline: time })} 
                  />
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="grid grid-cols-3 gap-4 items-stretch"
          >
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Modular <span className="text-luxury-gold">Works.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Detail your room-wise modular requirements.
              </p>
            </div>

            <SectionWrapper title="Kitchen Layout" icon={Utensils} subtitle="Choose your kitchen shape">
              <div className="grid grid-cols-2 gap-3">
                {['Straight', 'L-shape', 'U-shape', 'Island'].map((type) => (
                  <Pill 
                    key={type} 
                    label={type} 
                    selected={state.kitchenType === type} 
                    onClick={() => setState({ ...state, kitchenType: type })} 
                  />
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Wardrobes" icon={LayoutGrid} subtitle="Select wardrobe style">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'Hinged', label: 'Hinged Wardrobe', desc: 'Classic swing doors' },
                  { id: 'Sliding', label: 'Sliding Wardrobe', desc: 'Space-saving sliding doors' },
                  { id: 'Walk-in', label: 'Walk-in Closet', desc: 'Premium dedicated storage space' }
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setState({ ...state, wardrobeType: item.id })}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      state.wardrobeType === item.id 
                        ? 'border-luxury-gold bg-luxury-gold/5' 
                        : 'border-[var(--line)] bg-[var(--paper)] hover:border-luxury-gold/20'
                    }`}
                  >
                    <p className={`font-bold text-sm ${state.wardrobeType === item.id ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-[var(--muted)] font-medium mt-1">{item.desc}</p>
                  </motion.button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Additional Units" icon={Armchair} subtitle="Select other modular requirements">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'additionalUnits' ? null : 'additionalUnits')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.additionalUnits.length > 0 ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.additionalUnits.length > 0 
                      ? state.additionalUnits.join(', ') 
                      : 'Select Units (TV, Study, etc.)'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'additionalUnits' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'additionalUnits' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['TV Unit', 'Study Table', 'Crockery Unit', 'Pooja Unit', 'Shoe Rack'].map((unit) => (
                        <button
                          key={unit}
                          onClick={() => {
                            const current = state.additionalUnits;
                            const next = current.includes(unit) 
                              ? current.filter(u => u !== unit) 
                              : [...current, unit];
                            setState({ ...state, additionalUnits: next });
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 flex items-center justify-between ${
                            state.additionalUnits.includes(unit) ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
                          }`}
                        >
                          {unit}
                          {state.additionalUnits.includes(unit) && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      ))}
                      <button 
                        onClick={() => setActiveDropdown(null)}
                        className="w-full p-3 bg-luxury-dark text-white text-[11px] font-bold uppercase tracking-widest"
                      >
                        Done
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Material Preference" icon={Layers} subtitle="Core & Finish materials">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Core Material</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['MDF', 'HDF', 'Plywood'].map((mat) => (
                      <Pill 
                        key={mat} 
                        label={mat} 
                        selected={state.coreMaterial === mat} 
                        onClick={() => setState({ ...state, coreMaterial: mat })} 
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-luxury-gold font-bold leading-tight">
                    * Plywood is highly recommended for Bangalore's humidity.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Finish Material</p>
                  <SegmentedControl 
                    options={['Laminate', 'Acrylic', 'PU', 'Veneer']} 
                    selected={state.finishMaterial} 
                    onChange={(val) => setState({ ...state, finishMaterial: val })} 
                  />
                </div>

                <div className="p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)] space-y-2">
                  <p className="text-[10px] font-bold text-[var(--ink)] uppercase tracking-wider">Bangalore Insights:</p>
                  <ul className="space-y-1">
                    <li className="text-[11px] text-[var(--muted)] font-medium flex items-center gap-2">
                      <div className="w-1 h-1 bg-luxury-gold rounded-full" />
                      Mid-range: BWP Plywood + Laminate
                    </li>
                    <li className="text-[11px] text-[var(--muted)] font-medium flex items-center gap-2">
                      <div className="w-1 h-1 bg-luxury-gold rounded-full" />
                      Premium: PU / Acrylic Finishes
                    </li>
                  </ul>
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="grid grid-cols-3 gap-4 items-stretch"
          >
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Civil & <span className="text-luxury-gold">Ceiling.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Structural changes and ceiling design.
              </p>
            </div>

            <SectionWrapper title="Civil Changes" icon={Hammer} subtitle="Wall modifications">
              <div className="space-y-4">
                <Toggle 
                  label="Any wall demolition?" 
                  enabled={state.wallDemolition} 
                  onChange={(val) => setState({ ...state, wallDemolition: val })} 
                />
                <Toggle 
                  label="New partitions?" 
                  enabled={state.newPartitions} 
                  onChange={(val) => setState({ ...state, newPartitions: val })} 
                />
                
                <AnimatePresence>
                  {state.newPartitions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-visible"
                    >
                      <div className="pt-2 space-y-3">
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Partition Material</p>
                        <div className="grid grid-cols-2 gap-3">
                          {['Gypsum', 'Brick'].map((type) => (
                            <Pill 
                              key={type} 
                              label={type} 
                              selected={state.partitionType === type} 
                              onClick={() => setState({ ...state, partitionType: type })} 
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SectionWrapper>

            <SectionWrapper title="False Ceiling" icon={Layers} subtitle="Ceiling type selection">
              <div className="grid grid-cols-1 gap-3">
                {['Plain gypsum', 'Grid ceiling', 'Cove lighting'].map((type) => (
                  <Pill 
                    key={type} 
                    label={type} 
                    selected={state.ceilingType === type} 
                    onClick={() => setState({ ...state, ceilingType: type })} 
                  />
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="grid grid-cols-3 gap-4 items-stretch"
          >
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Electrical & <span className="text-luxury-gold">Lighting.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Wiring, points, and brand preferences.
              </p>
            </div>

            <SectionWrapper title="Wiring Scope" icon={Zap} subtitle="Select wiring requirement">
              <div className="grid grid-cols-1 gap-3">
                {['Redo full wiring', 'Only adding/modifying points'].map((type) => (
                  <Pill 
                    key={type} 
                    label={type} 
                    selected={state.wiringType === type} 
                    onClick={() => setState({ ...state, wiringType: type })} 
                  />
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Point Quantities" icon={Lightbulb} subtitle="Number of points required">
              <div className="space-y-3">
                <NumberInput 
                  label="Lights" 
                  value={state.lightCount} 
                  onChange={(val) => setState({ ...state, lightCount: val })} 
                  icon={Lightbulb}
                />
                <NumberInput 
                  label="Fans" 
                  value={state.fanCount} 
                  onChange={(val) => setState({ ...state, fanCount: val })} 
                  icon={Fan}
                />
                <NumberInput 
                  label="AC points" 
                  value={state.acCount} 
                  onChange={(val) => setState({ ...state, acCount: val })} 
                  icon={AirVent}
                />
                <NumberInput 
                  label="Switchboards" 
                  value={state.switchboardCount} 
                  onChange={(val) => setState({ ...state, switchboardCount: val })} 
                  icon={LayoutGrid}
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Brand Preferences" icon={Sparkles} subtitle="Electrical brand selection">
              <div className="space-y-4">
                <Toggle 
                  label="Need brand guidance?" 
                  enabled={state.needBrandGuidance} 
                  onChange={(val) => setState({ ...state, needBrandGuidance: val })} 
                />

                <AnimatePresence>
                  {state.needBrandGuidance && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-visible"
                    >
                      <div className="pt-2 space-y-3">
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Select Brand Category</p>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { id: 'Budget', label: 'Anchor / GM', desc: 'Budget friendly options' },
                            { id: 'Premium', label: 'Legrand / Schneider', desc: 'Premium quality & design' }
                          ].map((brand) => (
                            <motion.button
                              key={brand.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setState({ ...state, brandPreference: brand.label })}
                              className={`p-4 rounded-xl border-2 text-left transition-all ${
                                state.brandPreference === brand.label 
                                  ? 'border-luxury-gold bg-luxury-gold/5' 
                                  : 'border-[var(--line)] bg-[var(--paper)] hover:border-luxury-gold/20'
                              }`}
                            >
                              <p className={`font-bold text-[13px] ${state.brandPreference === brand.label ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}>
                                {brand.label}
                              </p>
                              <p className="text-[10px] text-[var(--muted)] font-medium mt-0.5">{brand.desc}</p>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="grid grid-cols-3 gap-4 items-stretch"
          >
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Flooring & <span className="text-luxury-gold">Walls.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Surface finishes and material selections.
              </p>
            </div>

            <SectionWrapper title="Flooring Decision" icon={Grid3X3} subtitle="New flooring requirement">
              <div className="space-y-4">
                <Toggle 
                  label="New flooring required?" 
                  enabled={state.newFlooring} 
                  onChange={(val) => setState({ ...state, newFlooring: val })} 
                />
                
                <AnimatePresence>
                  {state.newFlooring && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-visible"
                    >
                      <div className="pt-2 space-y-3">
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Flooring Type</p>
                        <div className="relative">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === 'flooringType' ? null : 'flooringType')}
                            className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                          >
                            <span className={`text-[13px] font-bold ${state.flooringType ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                              {state.flooringType || 'Select Flooring Type (Tile, Marble, etc.)'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'flooringType' ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {activeDropdown === 'flooringType' && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                              >
                                {['Tile', 'Marble', 'Wooden Flooring'].map((type) => (
                                  <button
                                    key={type}
                                    onClick={() => {
                                      setState({ ...state, flooringType: type });
                                      setActiveDropdown(null);
                                    }}
                                    className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                                      state.flooringType === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
                                    }`}
                                  >
                                    {type}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Wall Finishes" icon={Paintbrush} subtitle="Modify wall aesthetics">
              <div className="space-y-4">
                <Toggle 
                  label="Modify wall finish?" 
                  enabled={state.modifyWallFinish} 
                  onChange={(val) => setState({ ...state, modifyWallFinish: val })} 
                />

                <AnimatePresence>
                  {state.modifyWallFinish && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-visible"
                    >
                      <div className="pt-2 space-y-3">
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Wall Finish Selection</p>
                        <div className="grid grid-cols-2 gap-3">
                          {['Paint', 'Wallpaper', 'Texture', 'Panels'].map((finish) => (
                            <Pill 
                              key={finish} 
                              label={finish} 
                              selected={state.wallFinishes.includes(finish)} 
                              onClick={() => {
                                const current = state.wallFinishes;
                                const next = current.includes(finish) 
                                  ? current.filter(f => f !== finish) 
                                  : [...current, finish];
                                setState({ ...state, wallFinishes: next });
                              }} 
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="grid grid-cols-3 gap-4 items-stretch"
          >
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Doors & <span className="text-luxury-gold">Windows.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Installation and refurbishing details.
              </p>
            </div>

            <SectionWrapper title="Door/Window Decision" icon={DoorOpen} subtitle="New or Refurbishing">
              <div className="space-y-4">
                <Toggle 
                  label="Install new doors/windows?" 
                  enabled={state.newDoors} 
                  onChange={(val) => setState({ ...state, newDoors: val })} 
                />
                <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider">
                  {state.newDoors ? 'Status: New Installation' : 'Status: Refurbishing Existing'}
                </p>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Finish Type" icon={Layers} subtitle="Select finish for doors/windows">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'doorFinish' ? null : 'doorFinish')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.doorFinishType ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.doorFinishType || 'Select Finish (Veneer, Laminate, etc.)'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'doorFinish' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'doorFinish' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['Veneer', 'Laminate', 'Paint'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setState({ ...state, doorFinishType: type });
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                            state.doorFinishType === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Hardware Quality" icon={Box} subtitle="Select hardware brand/quality">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'Basic', label: 'Basic', desc: 'Standard quality hardware' },
                  { id: 'Godrej', label: 'Godrej', desc: 'Trusted mid-range brand' },
                  { id: 'Hafele', label: 'Hafele', desc: 'Premium international quality' }
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setState({ ...state, hardwareQuality: item.id })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      state.hardwareQuality === item.id 
                        ? 'border-luxury-gold bg-luxury-gold/5' 
                        : 'border-[var(--line)] bg-[var(--paper)] hover:border-luxury-gold/20'
                    }`}
                  >
                    <p className={`font-bold text-[13px] ${state.hardwareQuality === item.id ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-[var(--muted)] font-medium mt-0.5">{item.desc}</p>
                  </motion.button>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 7:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="grid grid-cols-3 gap-4 items-stretch"
          >
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Budget & <span className="text-luxury-gold">Execution.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Planning your project's financial and site logistics.
              </p>
            </div>

            <SectionWrapper title="Finish Expectations" icon={Wallet} subtitle="Budget Discovery">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Desired Finish Level</p>
                  <SegmentedControl 
                    options={['Rental', 'Mid-range', 'Premium']} 
                    selected={state.finishExpectation} 
                    onChange={(val) => setState({ ...state, finishExpectation: val })} 
                  />
                  <AnimatePresence mode="wait">
                    {state.finishExpectation && (
                      <motion.div
                        key={state.finishExpectation}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="p-4 bg-luxury-gold/5 rounded-xl border border-luxury-gold/10"
                      >
                        <p className="text-[11px] font-bold text-luxury-gold leading-relaxed">
                          {state.finishExpectation === 'Rental' && "Basic finishes: ₹1,500 – ₹2,500 per sqft. Ideal for rental properties or budget-conscious projects."}
                          {state.finishExpectation === 'Mid-range' && "Standard quality: ₹2,500 – ₹4,000 per sqft. Balanced durability and aesthetics for self-use homes."}
                          {state.finishExpectation === 'Premium' && "Luxury interiors: ₹4,000+ per sqft. High-end materials, custom finishes, and designer hardware."}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Toggle 
                  label="Explored per sqft pricing before?" 
                  enabled={state.exploredSqftPricing} 
                  onChange={(val) => setState({ ...state, exploredSqftPricing: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Timeline & Urgency" icon={Calendar} subtitle="Project Schedule">
              <div className="space-y-4">
                <TextInput 
                  label="Possession Expected Date" 
                  icon={Clock} 
                  placeholder="e.g. May 2026"
                  value={state.possessionDate}
                  onChange={(val) => setState({ ...state, possessionDate: val })}
                />
                <TextInput 
                  label="Ideal Move-in Date" 
                  icon={Home} 
                  placeholder="e.g. August 2026"
                  value={state.idealMoveInDate}
                  onChange={(val) => setState({ ...state, idealMoveInDate: val })}
                />
                <Toggle 
                  label="Penalty for delays?" 
                  enabled={state.delayPenalty} 
                  onChange={(val) => setState({ ...state, delayPenalty: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Decision Structure" icon={Users} subtitle="Stakeholders & Evaluation">
              <div className="space-y-6">
                <TextInput 
                  label="Final Decision Maker" 
                  icon={Briefcase} 
                  placeholder="e.g. Self, Spouse, Parents"
                  value={state.decisionMaker}
                  onChange={(val) => setState({ ...state, decisionMaker: val })}
                />
                <Toggle 
                  label="Is a designer involved?" 
                  enabled={state.designerInvolved} 
                  onChange={(val) => setState({ ...state, designerInvolved: val })} 
                />
                <NumberInput 
                  label="Contractors being evaluated" 
                  icon={Search} 
                  value={state.contractorsEvaluating}
                  onChange={(val) => setState({ ...state, contractorsEvaluating: val })}
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Site Constraints" icon={ShieldAlert} subtitle="Bangalore Specific Rules">
              <div className="space-y-6">
                <Toggle 
                  label="Aware of Association Rules?" 
                  enabled={state.associationRulesAware} 
                  onChange={(val) => setState({ ...state, associationRulesAware: val })} 
                />
                <TextInput 
                  label="Permitted Work Timings" 
                  icon={Clock} 
                  placeholder="e.g. 9 AM - 6 PM"
                  value={state.workTimings}
                  onChange={(val) => setState({ ...state, workTimings: val })}
                />
                <Toggle 
                  label="Lift usage charges applicable?" 
                  enabled={state.liftUsageCharges} 
                  onChange={(val) => setState({ ...state, liftUsageCharges: val })} 
                />
                
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Material Loading Access</p>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === 'materialAccess' ? null : 'materialAccess')}
                      className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                    >
                      <span className={`text-[13px] font-bold ${state.materialAccess ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                        {state.materialAccess || 'Select Access Type'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'materialAccess' ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === 'materialAccess' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                        >
                          {['Easy Access', 'Challenging', 'Restricted'].map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                setState({ ...state, materialAccess: type });
                                setActiveDropdown(null);
                              }}
                              className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                                state.materialAccess === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <Toggle 
                  label="Parking availability for workers?" 
                  enabled={state.parkingAvailable} 
                  onChange={(val) => setState({ ...state, parkingAvailable: val })} 
                />
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 8:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="grid grid-cols-3 gap-4 items-stretch"
          >
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Commercial <span className="text-luxury-gold">Intake.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Standardizing project scope and commercial terms.
              </p>
            </div>

            <SectionWrapper title="Commercial Clarity" icon={Wallet} subtitle="Terms & Warranty">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Scope of Work</p>
                  <SegmentedControl 
                    options={['Design + Execution', 'Execution Only']} 
                    selected={state.commercialScope} 
                    onChange={(val) => setState({ ...state, commercialScope: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Payment Terms Preference</p>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === 'paymentTerms' ? null : 'paymentTerms')}
                      className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                    >
                      <span className={`text-[13px] font-bold ${state.paymentTerms ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                        {state.paymentTerms || 'Select Payment Terms'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'paymentTerms' ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === 'paymentTerms' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                        >
                          {['Standard 40-40-20', 'Negotiable', 'Need Suggestion'].map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                setState({ ...state, paymentTerms: type });
                                setActiveDropdown(null);
                              }}
                              className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                                state.paymentTerms === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Warranty Expectation</p>
                  <SegmentedControl 
                    options={['1 Year', '2 Years', '5 Years+']} 
                    selected={state.warrantyExpectation} 
                    onChange={(val) => setState({ ...state, warrantyExpectation: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Contractor Positioning" icon={Hammer} subtitle="Execution & Optimization">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Execution Preference</p>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === 'executionPreference' ? null : 'executionPreference')}
                      className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                    >
                      <span className={`text-[13px] font-bold ${state.executionPreference ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                        {state.executionPreference || 'Select Execution Type'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'executionPreference' ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === 'executionPreference' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                        >
                          {['Factory Modular', 'On-site Carpentry', 'Need Recommendation'].map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                setState({ ...state, executionPreference: type });
                                setActiveDropdown(null);
                              }}
                              className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                                state.executionPreference === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <Toggle 
                  label="Cost Optimization Flexibility?" 
                  enabled={state.costOptimization} 
                  onChange={(val) => setState({ ...state, costOptimization: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Upsell Opportunities" icon={Sparkles} subtitle="Design & Scope Extension">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">3D Design Requirement</p>
                  <SegmentedControl 
                    options={['Yes', 'No', 'Maybe Later']} 
                    selected={state.threeDDesign} 
                    onChange={(val) => setState({ ...state, threeDDesign: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Scope Extension</p>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === 'scopeExtension' ? null : 'scopeExtension')}
                      className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                    >
                      <span className={`text-[13px] font-bold ${state.scopeExtension ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                        {state.scopeExtension || 'Select Scope Extension'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'scopeExtension' ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === 'scopeExtension' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                        >
                          {['Only Interiors', 'Interiors + Decor', 'Full Turnkey'].map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                setState({ ...state, scopeExtension: type });
                                setActiveDropdown(null);
                              }}
                              className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                                state.scopeExtension === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="BOQ Readiness" icon={Layers} subtitle="Structured Selection">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Work Scope Inclusion</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Modular Works', 'Civil & Ceiling', 'Electrical', 'Painting & Finishes', 'Hardware & Accessories'].map((scope) => (
                      <button
                        key={scope}
                        onClick={() => {
                          const newScope = state.workScopeInclusion.includes(scope)
                            ? state.workScopeInclusion.filter(s => s !== scope)
                            : [...state.workScopeInclusion, scope];
                          setState({ ...state, workScopeInclusion: newScope });
                        }}
                        className={`p-3 rounded-xl text-[11px] font-bold border transition-all ${
                          state.workScopeInclusion.includes(scope)
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--muted)]'
                        }`}
                      >
                        {scope}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Material Preference Level</p>
                  <SegmentedControl 
                    options={['Basic', 'Mid-range', 'Premium']} 
                    selected={state.materialPreference} 
                    onChange={(val) => setState({ ...state, materialPreference: val })} 
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Brand Expectation</p>
                  <SegmentedControl 
                    options={['Standard', 'Branded', 'Premium Imported']} 
                    selected={state.brandExpectation} 
                    onChange={(val) => setState({ ...state, brandExpectation: val })} 
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Pricing Format Preference</p>
                  <SegmentedControl 
                    options={['Per Sqft', 'Itemized', 'Both']} 
                    selected={state.pricingFormat} 
                    onChange={(val) => setState({ ...state, pricingFormat: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Trust Building" icon={ShieldAlert} subtitle="Qualitative Insights">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Previous contractor issues (if any)</p>
                <textarea 
                  value={state.previousIssues}
                  onChange={(e) => setState({ ...state, previousIssues: e.target.value })}
                  placeholder="Share any past experiences or concerns..."
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors shadow-sm min-h-[100px] resize-none"
                />
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 9:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="grid grid-cols-3 gap-4 items-stretch"
          >
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Visual <span className="text-luxury-gold">Reference.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Share images or plans for better understanding.
              </p>
            </div>

            <SectionWrapper title="Property Media" icon={Upload} subtitle="Images & Videos">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square rounded-2xl bg-[var(--bg)] border-2 border-dashed border-[var(--line)] flex flex-col items-center justify-center gap-2 text-[var(--muted)] hover:border-luxury-gold/30 hover:bg-luxury-gold/5 transition-all cursor-pointer">
                    <ImageIcon size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Add Images</span>
                  </div>
                  <div className="aspect-square rounded-2xl bg-[var(--bg)] border-2 border-dashed border-[var(--line)] flex flex-col items-center justify-center gap-2 text-[var(--muted)] hover:border-luxury-gold/30 hover:bg-luxury-gold/5 transition-all cursor-pointer">
                    <Video size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Add Videos</span>
                  </div>
                </div>

                <div className="p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--paper)] flex items-center justify-center text-luxury-gold shadow-sm">
                      <Sparkles size={14} />
                    </div>
                    <p className="text-[11px] font-bold text-[var(--muted)] leading-relaxed">
                      Sharing site photos or inspiration images helps us prepare a more accurate BOQ.
                    </p>
                  </div>
                </div>

                <Toggle 
                  label="Do you have floor plans?" 
                  enabled={state.hasPlans} 
                  onChange={(val) => setState({ ...state, hasPlans: val })} 
                />
              </div>
            </SectionWrapper>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Inspiration Examples</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-[4/5] rounded-xl bg-[var(--paper)] overflow-hidden relative group">
                    <img 
                      src={`https://picsum.photos/seed/interior${i}/400/500`} 
                      alt="Inspiration" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 10:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 pb-32"
          >
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-luxury-gold" />
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">Review & Submit</h2>
              <p className="text-[var(--muted)] text-xs font-semibold">Please verify all your requirements below.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Project Basics" 
                icon={MapPin} 
                items={[
                  { label: 'Location', value: state.location },
                  { label: 'Space Type', value: state.spaceType },
                  { label: 'Area', value: `${state.area} sqft` },
                  { label: 'Configuration', value: state.configuration }
                ]}
              />

              <ReviewSection 
                title="Modular Works" 
                icon={Grid3X3} 
                items={[
                  { label: 'Kitchen', value: state.kitchenRequired },
                  { label: 'Wardrobes', value: `${state.wardrobeCount} Units` },
                  { label: 'TV Unit', value: state.tvUnitRequired },
                  { label: 'Crockery Unit', value: state.crockeryUnitRequired }
                ]}
              />

              <ReviewSection 
                title="Civil & Ceiling" 
                icon={Layers} 
                items={[
                  { label: 'False Ceiling', value: state.falseCeiling },
                  { label: 'Civil Changes', value: state.civilChanges },
                  { label: 'Partition', value: state.partitionRequired },
                  { label: 'Partition Material', value: state.partitionMaterial }
                ]}
              />

              <ReviewSection 
                title="Electrical & Lighting" 
                icon={Zap} 
                items={[
                  { label: 'Rewiring', value: state.electricalRewiring },
                  { label: 'Automation', value: state.lightingAutomation },
                  { label: 'Brand Preference', value: state.brandPreference }
                ]}
              />

              <ReviewSection 
                title="Flooring & Walls" 
                icon={Paintbrush} 
                items={[
                  { label: 'New Flooring', value: state.newFlooring },
                  { label: 'Flooring Type', value: state.flooringType },
                  { label: 'Wall Finishes', value: state.wallFinishes }
                ]}
              />

              <ReviewSection 
                title="Doors & Windows" 
                icon={DoorOpen} 
                items={[
                  { label: 'New Doors', value: state.newDoors },
                  { label: 'Finish Type', value: state.doorFinishType },
                  { label: 'Hardware Quality', value: state.hardwareQuality }
                ]}
              />

              <ReviewSection 
                title="Budget & Execution" 
                icon={Wallet} 
                items={[
                  { label: 'Finish Level', value: state.finishExpectation },
                  { label: 'Possession', value: state.possessionDate },
                  { label: 'Ideal Move-in', value: state.idealMoveInDate },
                  { label: 'Decision Maker', value: state.decisionMaker }
                ]}
              />

              <ReviewSection 
                title="Commercial Intake" 
                icon={Briefcase} 
                items={[
                  { label: 'Scope', value: state.commercialScope },
                  { label: 'Payment Terms', value: state.paymentTerms },
                  { label: 'Warranty', value: state.warrantyExpectation },
                  { label: 'Execution', value: state.executionPreference },
                  { label: 'Inclusions', value: state.workScopeInclusion },
                  { label: 'Material Level', value: state.materialPreference },
                  { label: 'Pricing Format', value: state.pricingFormat }
                ]}
              />

              <ReviewSection 
                title="Media & Plans" 
                icon={Upload} 
                items={[
                  { label: 'Floor Plans Available', value: state.hasPlans },
                  { label: 'Media Files', value: `${state.mediaFiles.length} uploaded` }
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
      case 11:
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
                RFQ Submitted <span className="text-luxury-gold">Successfully!</span>
              </h2>
              <p className="text-[var(--muted)] text-sm font-semibold max-w-xs mx-auto">
                Thank you, {state.userName}. Our team will review your requirements and get back to you shortly.
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
                className="w-full py-4 bg-luxury-gold text-[var(--ink)] rounded-2xl font-black text-sm shadow-lg shadow-luxury-gold/20 active:scale-[0.98] transition-all"
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
    <div className="fixed inset-0 bg-premium-bg z-[60] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between bg-[var(--paper)] border-b border-[var(--line)]">
        <button 
          onClick={onBack} 
          className="p-2 bg-[var(--bg)] rounded-full text-[var(--ink)] border border-[var(--line)]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-bold text-[var(--ink)] tracking-tight">Interior RFQ</h1>
          <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest">Step {step} of 11</p>
        </div>
        <div className="w-10 h-10" />
      </div>

      <div className="bg-[var(--paper)] border-b border-[var(--line)] px-6 py-3">
        <RFQStepBar step={step} totalSteps={11} />
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32 no-scrollbar">
        {renderStep()}
      </div>

      {/* Footer Navigation */}
      {step < 10 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-[var(--paper)]/80 backdrop-blur-xl border-t border-[var(--line)] z-50">
          <div className="max-w-md mx-auto">
            <button 
              disabled={!isStepValid()}
              onClick={() => setStep(step + 1)}
              className={`w-full py-4.5 rounded-xl font-black flex items-center justify-center gap-3 transition-all shadow-xl ${
                isStepValid() 
                  ? 'bg-luxury-gold text-[var(--ink)] shadow-luxury-gold/20' 
                  : 'bg-[var(--paper)] text-[var(--muted)] cursor-not-allowed shadow-none'
              }`}
            >
              {step === 1 ? 'Next: Modular Works' : 
               step === 2 ? 'Next: Civil & Ceiling' :
               step === 3 ? 'Next: Electrical & Lighting' :
               step === 4 ? 'Next: Flooring & Walls' :
               step === 5 ? 'Next: Doors & Windows' :
               step === 6 ? 'Next: Budget & Execution' :
               step === 7 ? 'Next: Commercial Intake' :
               step === 8 ? 'Next: Media Upload' :
               step === 9 ? 'Review Summary' :
               'Next Step'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
