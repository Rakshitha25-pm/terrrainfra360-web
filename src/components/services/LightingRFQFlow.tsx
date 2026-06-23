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
  Star,
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
  Building2,
  Sun,
  Settings2,
  Construction,
  Info
} from 'lucide-react';
import { RFQStepBar } from './RFQStepBar';

interface LightingRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface LightingState {
  // Step 1: Areas & Style
  areas: string[];
  lightingPurpose: string;
  // Step 2: Fixture Types
  fixtures: string[];
  spotlightCount: string;
  // Step 3: Technical & Mounting
  requirementType: string;
  wiringNeeded: string;
  mountingType: string;
  // Step 4: Switching & Automation
  switchingPreference: string;
  smartIntegration: string;
  // Step 5: Supply & Quality
  supplyResponsibility: string;
  needBrandSuggestions: string;
  qualityLevel: string;
  // Step 6: Budget & Color Tone
  expectationLevel: string;
  colorTone: string;
  // Step 7: Site Constraints
  ceilingStatus: string;
  ceilingHeight: string;
  workTiming: string;
  liftAccess: string;
  parkingStatus: string;
  floorLevel: string;
  // Step 8: Special Requirements
  specialRequirements: string;
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

export const LightingRFQFlow: React.FC<LightingRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [state, setState] = useState<LightingState>({
    areas: [],
    lightingPurpose: '',
    fixtures: [],
    spotlightCount: '',
    requirementType: '',
    wiringNeeded: '',
    mountingType: '',
    switchingPreference: '',
    smartIntegration: '',
    supplyResponsibility: '',
    needBrandSuggestions: '',
    qualityLevel: '',
    expectationLevel: '',
    colorTone: '',
    ceilingStatus: '',
    ceilingHeight: '',
    workTiming: '',
    liftAccess: '',
    parkingStatus: '',
    floorLevel: '',
    specialRequirements: '',
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  const isStepValid = () => {
    if (step === 1) return state.areas.length > 0 && state.lightingPurpose !== '';
    if (step === 2) return state.fixtures.length > 0;
    if (step === 3) return state.requirementType !== '' && state.wiringNeeded !== '' && state.mountingType !== '';
    if (step === 4) return state.switchingPreference !== '' && state.smartIntegration !== '';
    if (step === 5) return state.supplyResponsibility !== '' && state.needBrandSuggestions !== '' && state.qualityLevel !== '';
    if (step === 6) return state.expectationLevel !== '' && state.colorTone !== '';
    if (step === 7) return state.ceilingStatus !== '' && state.workTiming !== '' && state.liftAccess !== '' && state.parkingStatus !== '' && state.floorLevel !== '';
    if (step === 9) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-LIGHT-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Lighting', { ...state, rfqNumber: rfqNum });
    setStep(10);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Area & <span className="text-luxury-gold">Purpose.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define where and why you need lighting.
              </p>
            </div>

            <SectionWrapper title="Areas for Lighting" icon={Layout} subtitle="Multi-select areas">
              <div className="grid grid-cols-2 gap-2">
                {['Living Room', 'Bedrooms', 'Kitchen', 'Dining', 'Bathrooms', 'Balcony', 'Pooja Room', 'Utility', 'Entire House'].map((area) => (
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

            <SectionWrapper title="Purpose & Style" icon={Sun} subtitle="Design intent">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'purpose' ? null : 'purpose')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.lightingPurpose ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.lightingPurpose || 'Select Purpose'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'purpose' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'purpose' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['Functional Lighting', 'Ambient Lighting', 'Decorative Lighting', 'Task Lighting', 'Layered Lighting', 'Need Suggestion'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setState({ ...state, lightingPurpose: type });
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                            state.lightingPurpose === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
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
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Fixture <span className="text-luxury-gold">Selection.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Choose the types of lights you need.
              </p>
            </div>

            <SectionWrapper title="Lighting Fixtures" icon={Lightbulb} subtitle="Multi-select fixtures">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Spotlights', 'COB lights', 'Panel lights', 'Cove lights', 
                  'LED strip lights', 'Profile lights', 'Pendant lights', 
                  'Chandeliers', 'Wall lights', 'Mirror lights', 
                  'Track lights', 'Under-cabinet lights', 'Step lights', 
                  'Outdoor or Balcony lights'
                ].map((fixture) => (
                  <button
                    key={fixture}
                    onClick={() => {
                      const newFixtures = state.fixtures.includes(fixture)
                        ? state.fixtures.filter(f => f !== fixture)
                        : [...state.fixtures, fixture];
                      setState({ ...state, fixtures: newFixtures });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all ${
                      state.fixtures.includes(fixture)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    {fixture}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            {state.fixtures.includes('Spotlights') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <SectionWrapper title="Spotlight Details" icon={Maximize2} subtitle="Quantity or area">
                  <TextInput 
                    label="Number of Spotlights" 
                    icon={Lightbulb} 
                    placeholder="E.g. 12 or approx area in sqft"
                    value={state.spotlightCount}
                    onChange={(val) => setState({ ...state, spotlightCount: val })}
                    suffix="Units"
                  />
                </SectionWrapper>
              </motion.div>
            )}
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Technical & <span className="text-luxury-gold">Mounting.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Execution details for installation.
              </p>
            </div>

            <SectionWrapper title="Requirement Type" icon={Construction} subtitle="Scope of installation">
              <SegmentedControl 
                options={['New Points', 'Replacement', 'Both']} 
                selected={state.requirementType} 
                onChange={(val) => setState({ ...state, requirementType: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Wiring Needed?" icon={Zap} subtitle="Electrical infrastructure">
              <SegmentedControl 
                options={['New Wiring', 'Fixture Only']} 
                selected={state.wiringNeeded} 
                onChange={(val) => setState({ ...state, wiringNeeded: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Mounting Type" icon={Layers} subtitle="Installation style">
              <SegmentedControl 
                options={['Ceiling-integrated', 'Surface-mounted']} 
                selected={state.mountingType} 
                onChange={(val) => setState({ ...state, mountingType: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Switching & <span className="text-luxury-gold">Automation.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Control and smart features.
              </p>
            </div>

            <SectionWrapper title="Switching Preference" icon={Settings2} subtitle="Control interface">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'switching' ? null : 'switching')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.switchingPreference ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.switchingPreference || 'Select Switching'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'switching' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'switching' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['Basic Switches', 'Dimmers', 'Smart Switches', 'Full Home Automation'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setState({ ...state, switchingPreference: type });
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                            state.switchingPreference === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
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

            <SectionWrapper title="Smart Integration?" icon={Zap} subtitle="Future-ready lighting">
              <SegmentedControl 
                options={['Yes', 'No', 'Maybe Later']} 
                selected={state.smartIntegration} 
                onChange={(val) => setState({ ...state, smartIntegration: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Supply & <span className="text-luxury-gold">Quality.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Material responsibility and brand level.
              </p>
            </div>

            <SectionWrapper title="Material Supply" icon={Truck} subtitle="Who provides the fixtures?">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'supply' ? null : 'supply')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.supplyResponsibility ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.supplyResponsibility || 'Select Responsibility'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'supply' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'supply' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['Client Will Supply Lights', 'Contractor Will Supply Lights', 'Mixed Responsibility'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setState({ ...state, supplyResponsibility: type });
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                            state.supplyResponsibility === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
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

            <SectionWrapper title="Need Brand Suggestions?" icon={Info} subtitle="Expert guidance">
              <SegmentedControl 
                options={['Yes', 'No']} 
                selected={state.needBrandSuggestions} 
                onChange={(val) => setState({ ...state, needBrandSuggestions: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Quality Level" icon={Sparkles} subtitle="Product tier & brands">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'Basic', title: 'Basic', desc: 'Local brands, functional focus', icon: Box },
                  { id: 'Branded Mid-Range', title: 'Mid-Range', desc: 'Philips, Havells, Wipro', icon: ShieldAlert },
                  { id: 'Premium', title: 'Premium', desc: 'Tisva, Jaquar, Panasonic', icon: Star },
                  { id: 'Imported Premium', title: 'Luxury', desc: 'Flos, Artemide, Custom', icon: Sparkles },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setState({ ...state, qualityLevel: tier.id })}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      state.qualityLevel === tier.id
                        ? 'bg-luxury-gold/5 border-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      state.qualityLevel === tier.id ? 'bg-luxury-gold text-white' : 'bg-[var(--bg)] text-[var(--muted)]'
                    }`}>
                      <tier.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-[var(--ink)]">{tier.title}</p>
                      <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-tight">{tier.desc}</p>
                    </div>
                    {state.qualityLevel === tier.id && (
                      <div className="ml-auto">
                        <CheckCircle2 size={20} className="text-luxury-gold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Budget & <span className="text-luxury-gold">Tone.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Expectation level and color preferences.
              </p>
            </div>

            <SectionWrapper title="Expectation Level" icon={Wallet} subtitle="Budget guidance">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'expectation' ? null : 'expectation')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.expectationLevel ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.expectationLevel || 'Select Expectation'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'expectation' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'expectation' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['Basic Setup', 'Mid-Range Layered Lighting', 'Premium Decorative Lighting', 'Need Cost Guidance'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setState({ ...state, expectationLevel: type });
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                            state.expectationLevel === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
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

            <SectionWrapper title="Preferred Color Tone" icon={Sun} subtitle="Atmosphere preference">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'tone' ? null : 'tone')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.colorTone ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.colorTone || 'Select Color Tone'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'tone' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'tone' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['Warm White', 'Neutral White', 'Cool White', 'Mixed Lighting', 'Need Suggestion'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setState({ ...state, colorTone: type });
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                            state.colorTone === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
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
      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Site <span className="text-luxury-gold">Constraints.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Logistics for installation in Bangalore.
              </p>
            </div>

            <SectionWrapper title="Ceiling Status" icon={Layers} subtitle="Site readiness">
              <SegmentedControl 
                options={['Ceiling Ready', 'Not Ready']} 
                selected={state.ceilingStatus} 
                onChange={(val) => setState({ ...state, ceilingStatus: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Ceiling Height" icon={ArrowUp} subtitle="Custom measurement">
              <TextInput 
                label="Clear Height" 
                icon={Maximize2} 
                placeholder="E.g. 9.5 or 10"
                value={state.ceilingHeight}
                onChange={(val) => setState({ ...state, ceilingHeight: val })}
                suffix="Feet"
              />
            </SectionWrapper>

            <SectionWrapper title="Work Timing" icon={Clock} subtitle="Association rules">
              <SegmentedControl 
                options={['Flexible', 'Restricted']} 
                selected={state.workTiming} 
                onChange={(val) => setState({ ...state, workTiming: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Lift Access" icon={Truck} subtitle="Material logistics">
              <SegmentedControl 
                options={['Available', 'Not Available']} 
                selected={state.liftAccess} 
                onChange={(val) => setState({ ...state, liftAccess: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Parking" icon={ParkingCircle} subtitle="Contractor vehicle">
              <SegmentedControl 
                options={['Available', 'Limited']} 
                selected={state.parkingStatus} 
                onChange={(val) => setState({ ...state, parkingStatus: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Floor Level" icon={Building2} subtitle="Project height">
              <SegmentedControl 
                options={['Ground to 5th', '6th to 10th', 'Above 10th']} 
                selected={state.floorLevel} 
                onChange={(val) => setState({ ...state, floorLevel: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 8:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Special <span className="text-luxury-gold">Requests.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Any specific lighting requirement or reference.
              </p>
            </div>

            <SectionWrapper title="Additional Info" icon={FileText} subtitle="Optional details">
              <textarea 
                value={state.specialRequirements}
                onChange={(e) => setState({ ...state, specialRequirements: e.target.value })}
                placeholder="E.g. Specific brand models, smart home ecosystem preference, etc."
                className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors h-32 resize-none"
              />
            </SectionWrapper>
          </motion.div>
        );
      case 9:
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
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your lighting requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Areas & Purpose" 
                icon={Layout} 
                items={[
                  { label: 'Areas', value: state.areas },
                  { label: 'Purpose', value: state.lightingPurpose }
                ]}
              />

              <ReviewSection 
                title="Lighting Fixtures" 
                icon={Lightbulb} 
                items={[
                  { label: 'Fixtures', value: state.fixtures },
                  ...(state.fixtures.includes('Spotlights') ? [{ label: 'Spotlight Count', value: state.spotlightCount }] : [])
                ]}
              />

              <ReviewSection 
                title="Technical & Mounting" 
                icon={Construction} 
                items={[
                  { label: 'Requirement', value: state.requirementType },
                  { label: 'Wiring', value: state.wiringNeeded },
                  { label: 'Mounting', value: state.mountingType }
                ]}
              />

              <ReviewSection 
                title="Switching & Automation" 
                icon={Settings2} 
                items={[
                  { label: 'Switching', value: state.switchingPreference },
                  { label: 'Smart Integration', value: state.smartIntegration }
                ]}
              />

              <ReviewSection 
                title="Supply & Quality" 
                icon={Truck} 
                items={[
                  { label: 'Supply', value: state.supplyResponsibility },
                  { label: 'Brand Suggestions', value: state.needBrandSuggestions },
                  { label: 'Quality Level', value: state.qualityLevel }
                ]}
              />

              <ReviewSection 
                title="Budget & Tone" 
                icon={Wallet} 
                items={[
                  { label: 'Expectation', value: state.expectationLevel },
                  { label: 'Color Tone', value: state.colorTone }
                ]}
              />

              <ReviewSection 
                title="Site Constraints" 
                icon={Building2} 
                items={[
                  { label: 'Ceiling Status', value: state.ceilingStatus },
                  { label: 'Ceiling Height', value: state.ceilingHeight },
                  { label: 'Work Timing', value: state.workTiming },
                  { label: 'Lift Access', value: state.liftAccess },
                  { label: 'Parking', value: state.parkingStatus },
                  { label: 'Floor Level', value: state.floorLevel }
                ]}
              />

              {state.specialRequirements && (
                <ReviewSection 
                  title="Special Requests" 
                  icon={FileText} 
                  items={[{ label: 'Details', value: state.specialRequirements }]}
                />
              )}
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
      case 10:
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
                Lighting RFQ <span className="text-luxury-gold">Submitted!</span>
              </h2>
              <p className="text-[var(--muted)] text-sm font-semibold max-w-xs mx-auto">
                Thank you, {state.userName}. We will review your lighting requirements and contact you soon.
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
          <h1 className="text-sm font-bold text-[var(--ink)] tracking-tight">Lighting RFQ</h1>
          <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest">Step {step} of 10</p>
        </div>
        <div className="w-10 h-10" />
      </div>

      <div className="bg-[var(--paper)] border-b border-[var(--line)] px-6 py-3">
        <RFQStepBar step={step} totalSteps={10} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-32 no-scrollbar">
          {renderStep()}
      </div>

      {/* Footer Navigation */}
      {step < 9 && (
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
