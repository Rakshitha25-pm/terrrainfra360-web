import React, { useState } from 'react';
import { submitServiceRFQ } from '../../lib/serviceRfq';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Layers, 
  Zap, 
  Paintbrush, 
  Maximize2,
  ChevronDown,
  Sparkles,
  Wallet,
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
  Copy,
  Layout,
  Lightbulb,
  Box,
  ArrowUp,
  Wind,
  Clock,
  Building2
} from 'lucide-react';
import { RFQStepBar } from './RFQStepBar';

interface FalseCeilingRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface FalseCeilingState {
  // Step 1: Design Intent & Coverage
  areas: string[];
  preferredType: string;
  // Step 2: Lighting Integration
  lightingType: string;
  lightingResponsibility: string;
  // Step 3: Material & Finish
  materialPreference: string;
  finishType: string;
  // Step 4: Technical Constraints
  ceilingHeight: string;
  acType: string;
  beamsPresent: string;
  // Step 5: Scope Clarity
  electricalIntegration: boolean;
  paintingIncluded: boolean;
  corniceRequired: string;
  // Step 6: Budget Alignment
  expectationLevel: string;
  // Step 7: Execution Constraints
  timingRestrictions: string;
  floorLevel: string;
  liftAccess: string;
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
  <div className="flex p-1.5 bg-[var(--bg)] rounded-2xl border border-[var(--line)]">
    {options.map((option) => (
      <button
        key={option}
        onClick={() => onChange(option)}
        className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all ${
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

const Toggle = ({ label, enabled, onChange }: { label: string, enabled: boolean, onChange: (val: boolean) => void }) => (
  <div className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)]">
    <span className="text-[13px] font-bold text-[var(--ink)]">{label}</span>
    <button 
      onClick={() => onChange(!enabled)}
      className={`w-14 h-8 rounded-full transition-all relative ${enabled ? 'bg-luxury-gold' : 'bg-[var(--line)]'}`}
    >
      <motion.div 
        animate={{ x: enabled ? 26 : 4 }}
        className="absolute top-1 w-6 h-6 bg-[var(--paper)] rounded-full shadow-sm"
      />
      <span className={`absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase tracking-tighter transition-opacity ${enabled ? 'opacity-100 text-white pr-6' : 'opacity-100 text-[var(--muted)] pl-6'}`}>
        {enabled ? 'Yes' : 'No'}
      </span>
    </button>
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

const TextInput = ({ label, value, onChange, icon: Icon, placeholder, type = "text" }: { label: string, value: string, onChange: (val: string) => void, icon: any, placeholder?: string, type?: string }) => (
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
        className="w-full pl-12 pr-4 py-4 bg-[var(--paper)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors shadow-sm"
      />
    </div>
  </div>
);

export const FalseCeilingRFQFlow: React.FC<FalseCeilingRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [state, setState] = useState<FalseCeilingState>({
    areas: [],
    preferredType: '',
    lightingType: '',
    lightingResponsibility: '',
    materialPreference: 'Gypsum Board', // Default suggestion
    finishType: '',
    ceilingHeight: '',
    acType: '',
    beamsPresent: '',
    electricalIntegration: false,
    paintingIncluded: false,
    corniceRequired: '',
    expectationLevel: '',
    timingRestrictions: '',
    floorLevel: '',
    liftAccess: '',
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  const isStepValid = () => {
    if (step === 1) return state.areas.length > 0 && state.preferredType !== '';
    if (step === 2) return state.lightingType !== '' && state.lightingResponsibility !== '';
    if (step === 3) return state.materialPreference !== '' && state.finishType !== '';
    if (step === 4) return state.ceilingHeight !== '' && state.acType !== '' && state.beamsPresent !== '';
    if (step === 5) return state.corniceRequired !== '';
    if (step === 6) return state.expectationLevel !== '';
    if (step === 7) return state.timingRestrictions !== '' && state.floorLevel !== '' && state.liftAccess !== '';
    if (step === 8) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-CEIL-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('False Ceiling', { ...state, rfqNumber: rfqNum });
    setStep(9);
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
                Design & <span className="text-luxury-gold">Coverage.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define where and how you want your ceiling.
              </p>
            </div>

            <SectionWrapper title="Areas for Ceiling" icon={Layout} subtitle="Multi-select areas">
              <div className="grid grid-cols-2 gap-2">
                {['Living Room', 'Bedrooms', 'Kitchen', 'Dining', 'Entire House', 'Custom Selection'].map((area) => (
                  <button
                    key={area}
                    onClick={() => {
                      const newAreas = state.areas.includes(area)
                        ? state.areas.filter(a => a !== area)
                        : [...state.areas, area];
                      setState({ ...state, areas: newAreas });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all ${
                      state.areas.includes(area)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Preferred Ceiling Type" icon={Layers} subtitle="Select design style">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'preferredType' ? null : 'preferredType')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.preferredType ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.preferredType || 'Select Ceiling Type'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'preferredType' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'preferredType' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['Plain Gypsum', 'Cove Lighting Ceiling', 'Layered/Designer Ceiling', 'Grid Ceiling', 'Need Suggestion'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setState({ ...state, preferredType: type });
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                            state.preferredType === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
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
                Lighting <span className="text-luxury-gold">Integration.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Major cost driver for ceiling projects.
              </p>
            </div>

            <SectionWrapper title="Lighting Type" icon={Lightbulb} subtitle="Within the ceiling">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'lightingType' ? null : 'lightingType')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.lightingType ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.lightingType || 'Select Lighting Type'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'lightingType' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'lightingType' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['Spotlights', 'Cove Lights', 'Profile Lights', 'Chandeliers Provision', 'Combination'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setState({ ...state, lightingType: type });
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                            state.lightingType === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
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

            <SectionWrapper title="Lighting Responsibility" icon={User} subtitle="Supply of fixtures">
              <SegmentedControl 
                options={['Client-provided', 'Contractor-supplied', 'Need Recommendation']} 
                selected={state.lightingResponsibility} 
                onChange={(val) => setState({ ...state, lightingResponsibility: val })} 
              />
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
                Material & <span className="text-luxury-gold">Finish.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Most common in Bangalore is Gypsum.
              </p>
            </div>

            <SectionWrapper title="Ceiling Material" icon={Box} subtitle="Core material preference">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'materialPreference' ? null : 'materialPreference')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.materialPreference ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.materialPreference || 'Select Material'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'materialPreference' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'materialPreference' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['Gypsum Board', 'POP', 'Metal Grid', 'PVC', 'Not Sure'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setState({ ...state, materialPreference: type });
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                            state.materialPreference === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
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

            <SectionWrapper title="Finish Type" icon={Paintbrush} subtitle="Final look & feel">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'finishType' ? null : 'finishType')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.finishType ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.finishType || 'Select Finish Type'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'finishType' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'finishType' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['Paint Finish', 'Texture', 'Dual Tone', 'Designer Finish'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setState({ ...state, finishType: type });
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                            state.finishType === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
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
                Technical <span className="text-luxury-gold">Constraints.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Ceiling design depends heavily on these.
              </p>
            </div>

            <SectionWrapper title="Floor-to-Ceiling Height" icon={ArrowUp} subtitle="Current height">
              <SegmentedControl 
                options={['Below 9 ft', '9–10 ft', 'Above 10 ft', 'Not Sure']} 
                selected={state.ceilingHeight} 
                onChange={(val) => setState({ ...state, ceilingHeight: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="AC Type" icon={Wind} subtitle="Cooling system integration">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'acType' ? null : 'acType')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.acType ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.acType || 'Select AC Type'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'acType' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'acType' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['Split AC', 'Cassette AC', 'Central AC', 'Not Decided'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setState({ ...state, acType: type });
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                            state.acType === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
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

            <SectionWrapper title="Beams or Drops" icon={Maximize2} subtitle="Structural elements">
              <SegmentedControl 
                options={['Yes', 'No', 'Not Sure']} 
                selected={state.beamsPresent} 
                onChange={(val) => setState({ ...state, beamsPresent: val })} 
              />
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
                Scope <span className="text-luxury-gold">Clarity.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define what is included in the quote.
              </p>
            </div>

            <SectionWrapper title="Scope Integration" icon={Zap} subtitle="Electrical & Painting">
              <div className="space-y-4">
                <Toggle 
                  label="Electrical + Ceiling Integration?" 
                  enabled={state.electricalIntegration} 
                  onChange={(val) => setState({ ...state, electricalIntegration: val })} 
                />
                <Toggle 
                  label="Painting included in scope?" 
                  enabled={state.paintingIncluded} 
                  onChange={(val) => setState({ ...state, paintingIncluded: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Cornice / Molding" icon={Sparkles} subtitle="Decorative elements">
              <SegmentedControl 
                options={['Yes', 'No', 'Suggest me']} 
                selected={state.corniceRequired} 
                onChange={(val) => setState({ ...state, corniceRequired: val })} 
              />
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
                Budget <span className="text-luxury-gold">Alignment.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Helps us price per sq ft without friction.
              </p>
            </div>

            <SectionWrapper title="Expectation Level" icon={Wallet} subtitle="Design complexity">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'Basic functional', desc: 'Simple plain ceilings with basic lighting.' },
                  { id: 'Aesthetic standard', desc: 'Cove lighting and standard designer patterns.' },
                  { id: 'Premium designer ceiling', desc: 'Multi-layered, complex patterns and premium finishes.' }
                ].map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setState({ ...state, expectationLevel: level.id })}
                    className={`p-6 rounded-[24px] text-left border transition-all ${
                      state.expectationLevel === level.id
                        ? 'bg-luxury-gold/10 border-luxury-gold shadow-lg shadow-luxury-gold/10'
                        : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
                    }`}
                  >
                    <p className={`text-sm font-black ${state.expectationLevel === level.id ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}>
                      {level.id}
                    </p>
                    <p className="text-[11px] font-medium text-[var(--muted)] mt-1">{level.desc}</p>
                  </button>
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
                Execution <span className="text-luxury-gold">Constraints.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Critical logistics for Bangalore sites.
              </p>
            </div>

            <SectionWrapper title="Work Timing" icon={Clock} subtitle="Association rules">
              <SegmentedControl 
                options={['Strict', 'Flexible', 'Not Sure']} 
                selected={state.timingRestrictions} 
                onChange={(val) => setState({ ...state, timingRestrictions: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Working Floor Level" icon={Building2} subtitle="Project height">
              <SegmentedControl 
                options={['1–5', '6–10', '10+']} 
                selected={state.floorLevel} 
                onChange={(val) => setState({ ...state, floorLevel: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Lift Access" icon={Truck} subtitle="Material logistics">
              <SegmentedControl 
                options={['Yes', 'No', 'Service Lift']} 
                selected={state.liftAccess} 
                onChange={(val) => setState({ ...state, liftAccess: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 8:
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
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your false ceiling requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Design & Coverage" 
                icon={Layout} 
                items={[
                  { label: 'Areas', value: state.areas },
                  { label: 'Ceiling Type', value: state.preferredType }
                ]}
              />

              <ReviewSection 
                title="Lighting Integration" 
                icon={Lightbulb} 
                items={[
                  { label: 'Lighting Type', value: state.lightingType },
                  { label: 'Responsibility', value: state.lightingResponsibility }
                ]}
              />

              <ReviewSection 
                title="Material & Finish" 
                icon={Box} 
                items={[
                  { label: 'Material', value: state.materialPreference },
                  { label: 'Finish', value: state.finishType }
                ]}
              />

              <ReviewSection 
                title="Technical Details" 
                icon={Maximize2} 
                items={[
                  { label: 'Ceiling Height', value: state.ceilingHeight },
                  { label: 'AC Type', value: state.acType },
                  { label: 'Beams Present', value: state.beamsPresent }
                ]}
              />

              <ReviewSection 
                title="Scope & Budget" 
                icon={Wallet} 
                items={[
                  { label: 'Electrical Integration', value: state.electricalIntegration },
                  { label: 'Painting Included', value: state.paintingIncluded },
                  { label: 'Cornice Required', value: state.corniceRequired },
                  { label: 'Expectation Level', value: state.expectationLevel }
                ]}
              />

              <ReviewSection 
                title="Execution Logistics" 
                icon={Truck} 
                items={[
                  { label: 'Timing', value: state.timingRestrictions },
                  { label: 'Floor Level', value: state.floorLevel },
                  { label: 'Lift Access', value: state.liftAccess }
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
      case 9:
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
                Ceiling RFQ <span className="text-luxury-gold">Submitted!</span>
              </h2>
              <p className="text-[var(--muted)] text-sm font-semibold max-w-xs mx-auto">
                Thank you, {state.userName}. We will review your false ceiling requirements and contact you soon.
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
          <h1 className="text-sm font-bold text-[var(--ink)] tracking-tight">False Ceiling RFQ</h1>
          <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest">Step {step} of 9</p>
        </div>
        <div className="w-10 h-10" />
      </div>

      <div className="bg-[var(--paper)] border-b border-[var(--line)] px-6 py-3">
        <RFQStepBar step={step} totalSteps={9} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-32 no-scrollbar">
          {renderStep()}
      </div>

      {/* Footer Navigation */}
      {step < 8 && (
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
              Next Step
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
