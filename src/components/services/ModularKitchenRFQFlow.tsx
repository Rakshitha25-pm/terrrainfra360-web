import React, { useState, useEffect } from 'react';
import { submitServiceRFQ } from '../../lib/serviceRfq';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Zap, 
  ChevronDown,
  Sparkles,
  Wallet,
  Truck,
  User,
  Phone,
  FileText,
  Copy,
  Layout,
  Box,
  ArrowUp,
  Wind,
  Clock,
  Building2,
  Settings2,
  Construction,
  Info,
  Maximize2,
  UtensilsCrossed,
  Droplets,
  Flame,
  Lightbulb,
  Star,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { RFQStepBar } from './RFQStepBar';

interface ModularKitchenRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface KitchenState {
  // Step 1: Layout & Size
  layout: string;
  sizeRange: string;
  cabinetDepth: string;
  // Step 2: Materials & Finishes
  carcassMaterial: string;
  shutterFinish: string;
  // Step 3: Countertop & Backsplash
  countertop: string;
  backsplash: string;
  // Step 4: Storage Units
  storageUnits: string[];
  // Step 5: Hardware & Accessories
  hardwareLevel: string;
  accessories: string[];
  // Step 6: Appliances
  appliances: string[];
  applianceResponsibility: string;
  // Step 7: Electrical & Plumbing
  electricalPoints: string;
  plumbingMods: string;
  chimneyDucting: string;
  // Step 8: Kitchen Lighting
  lighting: string[];
  // Step 9: Aesthetics
  aestheticFinish: string;
  handleType: string;
  // Step 10: Budget & Site Constraints
  expectationLevel: string;
  floorLevel: string;
  liftAvailability: string;
  workTiming: string;
  kitchenCondition: string;
  demolitionRequired: string;
  // Step 11: Special Requirements
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

export const ModularKitchenRFQFlow: React.FC<ModularKitchenRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [state, setState] = useState<KitchenState>({
    layout: '',
    sizeRange: '',
    cabinetDepth: '',
    carcassMaterial: '',
    shutterFinish: '',
    countertop: '',
    backsplash: '',
    storageUnits: [],
    hardwareLevel: '',
    accessories: [],
    appliances: [],
    applianceResponsibility: '',
    electricalPoints: '',
    plumbingMods: '',
    chimneyDucting: '',
    lighting: [],
    aestheticFinish: '',
    handleType: '',
    expectationLevel: '',
    floorLevel: '',
    liftAvailability: '',
    workTiming: '',
    kitchenCondition: '',
    demolitionRequired: '',
    specialRequirements: '',
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const isStepValid = () => {
    if (step === 1) return state.layout !== '' && state.sizeRange !== '' && state.cabinetDepth !== '';
    if (step === 2) return state.carcassMaterial !== '' && state.shutterFinish !== '';
    if (step === 3) return state.countertop !== '' && state.backsplash !== '';
    if (step === 4) return state.storageUnits.length > 0;
    if (step === 5) return state.hardwareLevel !== '' && state.accessories.length > 0;
    if (step === 6) return state.appliances.length > 0 && state.applianceResponsibility !== '';
    if (step === 7) return state.electricalPoints !== '' && state.plumbingMods !== '' && state.chimneyDucting !== '';
    if (step === 8) return state.lighting.length > 0;
    if (step === 9) return state.aestheticFinish !== '' && state.handleType !== '';
    if (step === 10) return state.expectationLevel !== '' && state.floorLevel !== '' && state.liftAvailability !== '' && state.workTiming !== '' && state.kitchenCondition !== '' && state.demolitionRequired !== '';
    if (step === 12) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-KITCHEN-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Modular Kitchen', { ...state, rfqNumber: rfqNum });
    setStep(13);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Layout & <span className="text-luxury-gold">Size.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the shape and scale of your kitchen.
              </p>
            </div>

            <SectionWrapper title="Kitchen Layout" icon={Layout} subtitle="Compulsory selection">
              <div className="grid grid-cols-2 gap-2">
                {['Straight Kitchen', 'L-Shaped Kitchen', 'U-Shaped Kitchen', 'Parallel Kitchen', 'Island Kitchen', 'Need Suggestion'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setState({ ...state, layout: type })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all ${
                      state.layout === type
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Size Range" icon={Maximize2} subtitle="Approximate area">
              <SegmentedControl 
                options={['Below 50 sqft', '50–100 sqft', '100–150 sqft', 'Above 150 sqft', 'Not Sure']} 
                selected={state.sizeRange} 
                onChange={(val) => setState({ ...state, sizeRange: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Cabinet Depth" icon={ArrowUp} subtitle="Standard or custom">
              <TextInput 
                label="Clear Depth" 
                icon={Maximize2} 
                placeholder="E.g. 24 for base, 12 for wall"
                value={state.cabinetDepth}
                onChange={(val) => setState({ ...state, cabinetDepth: val })}
                suffix="Inches"
              />
            </SectionWrapper>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Materials & <span className="text-luxury-gold">Finishes.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Core structure and shutter aesthetics.
              </p>
            </div>

            <SectionWrapper title="Carcass Material" icon={Box} subtitle="Internal structure">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'BWP Plywood', title: 'BWP Plywood', desc: 'Boiling Water Proof - Best for Kitchen', icon: Droplets },
                  { id: 'HDHMR', title: 'HDHMR', desc: 'High Density High Moisture Resistance', icon: ShieldAlert },
                  { id: 'Commercial Plywood', title: 'Commercial Plywood', desc: 'Standard MR Grade Plywood', icon: Box },
                  { id: 'MDF/HDF', title: 'MDF / HDF', desc: 'Engineered Wood - Budget Friendly', icon: Layers },
                  { id: 'Need Recommendation', title: 'Help Me Choose', desc: 'Expert guidance based on usage', icon: Info },
                ].map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => setState({ ...state, carcassMaterial: mat.id })}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      state.carcassMaterial === mat.id
                        ? 'bg-luxury-gold/5 border-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      state.carcassMaterial === mat.id ? 'bg-luxury-gold text-white' : 'bg-[var(--bg)] text-[var(--muted)]'
                    }`}>
                      <mat.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-[var(--ink)]">{mat.title}</p>
                      <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-tight">{mat.desc}</p>
                    </div>
                    {state.carcassMaterial === mat.id && (
                      <div className="ml-auto">
                        <CheckCircle2 size={20} className="text-luxury-gold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Shutter Finish" icon={Sparkles} subtitle="External look">
              <div className="grid grid-cols-2 gap-2">
                {['Laminate Finish', 'Acrylic Finish', 'PU Paint Finish', 'Membrane Finish', 'Veneer Finish', 'Glass Shutters', 'Combination'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setState({ ...state, shutterFinish: type })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.shutterFinish === type
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {type}
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
                Countertop & <span className="text-luxury-gold">Backsplash.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Work surfaces and wall protection.
              </p>
            </div>

            <SectionWrapper title="Countertop Material" icon={Layers} subtitle="Work surface">
              <div className="grid grid-cols-2 gap-2">
                {['Granite', 'Quartz', 'Marble', 'Solid Surface', 'Not Decided'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setState({ ...state, countertop: type })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.countertop === type
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Backsplash Type" icon={Construction} subtitle="Wall finish">
              <div className="grid grid-cols-2 gap-2">
                {['Tiles', 'Glass', 'Quartz Matching', 'Laminate', 'Need Suggestion'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setState({ ...state, backsplash: type })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.backsplash === type
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {type}
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
                Storage <span className="text-luxury-gold">Configuration.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Functional units for your kitchen.
              </p>
            </div>

            <SectionWrapper title="Storage Units" icon={UtensilsCrossed} subtitle="Multi-select units">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Base Cabinets', 'Wall Cabinets', 'Tall Units', 'Pantry Units', 
                  'Loft Storage', 'Corner Units', 'Bottle Pull-outs', 
                  'Cutlery Units', 'Open Shelving'
                ].map((unit) => (
                  <button
                    key={unit}
                    onClick={() => {
                      const newUnits = state.storageUnits.includes(unit)
                        ? state.storageUnits.filter(u => u !== unit)
                        : [...state.storageUnits, unit];
                      setState({ ...state, storageUnits: newUnits });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.storageUnits.includes(unit)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {unit}
                    {state.storageUnits.includes(unit) && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 size={12} className="text-luxury-gold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Hardware & <span className="text-luxury-gold">Accessories.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Functional hardware and internal fittings.
              </p>
            </div>

            <SectionWrapper title="Hardware Level" icon={Settings2} subtitle="Brand & quality">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'Basic Hardware', title: 'Basic', desc: 'Functional local brands', icon: Box },
                  { id: 'Branded Standard', title: 'Standard', desc: 'Hettich / Ebco', icon: ShieldAlert },
                  { id: 'Premium Hardware', title: 'Premium', desc: 'Blum / Hafele', icon: Star },
                  { id: 'Imported Premium', title: 'Luxury', desc: 'High-end imported brands', icon: Sparkles },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setState({ ...state, hardwareLevel: tier.id })}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      state.hardwareLevel === tier.id
                        ? 'bg-luxury-gold/5 border-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      state.hardwareLevel === tier.id ? 'bg-luxury-gold text-white' : 'bg-[var(--bg)] text-[var(--muted)]'
                    }`}>
                      <tier.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-[var(--ink)]">{tier.title}</p>
                      <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-tight">{tier.desc}</p>
                    </div>
                    {state.hardwareLevel === tier.id && (
                      <div className="ml-auto">
                        <CheckCircle2 size={20} className="text-luxury-gold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Accessories" icon={UtensilsCrossed} subtitle="Multi-select fittings">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Soft-close Hinges', 'Tandem Drawers', 'Hydraulic Lift-ups', 
                  'Magic Corner', 'Tall Unit Pull-outs', 'Under-sink Units', 
                  'Built-in Dustbin', 'Cutlery Organizers'
                ].map((acc) => (
                  <button
                    key={acc}
                    onClick={() => {
                      const newAcc = state.accessories.includes(acc)
                        ? state.accessories.filter(a => a !== acc)
                        : [...state.accessories, acc];
                      setState({ ...state, accessories: newAcc });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all ${
                      state.accessories.includes(acc)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    {acc}
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
                Appliance <span className="text-luxury-gold">Integration.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Kitchen appliances and responsibility.
              </p>
            </div>

            <SectionWrapper title="Appliances Needed" icon={Flame} subtitle="Multi-select appliances">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Hob', 'Chimney', 'Built-in Oven', 'Microwave', 
                  'Dishwasher', 'Refrigerator Space', 'Fully Integrated'
                ].map((app) => (
                  <button
                    key={app}
                    onClick={() => {
                      const newApp = state.appliances.includes(app)
                        ? state.appliances.filter(a => a !== app)
                        : [...state.appliances, app];
                      setState({ ...state, appliances: newApp });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all ${
                      state.appliances.includes(app)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Appliance Responsibility" icon={Info} subtitle="Who provides them?">
              <SegmentedControl 
                options={['Client Provided', 'Contractor Provided', 'Need Suggestion']} 
                selected={state.applianceResponsibility} 
                onChange={(val) => setState({ ...state, applianceResponsibility: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Electrical & <span className="text-luxury-gold">Plumbing.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Infrastructure and modifications.
              </p>
            </div>

            <SectionWrapper title="New Electrical Points" icon={Zap} subtitle="Power requirements">
              <SegmentedControl 
                options={['Yes', 'No', 'Partial']} 
                selected={state.electricalPoints} 
                onChange={(val) => setState({ ...state, electricalPoints: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Plumbing Modifications" icon={Droplets} subtitle="Water & drainage">
              <SegmentedControl 
                options={['Yes', 'No']} 
                selected={state.plumbingMods} 
                onChange={(val) => setState({ ...state, plumbingMods: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Chimney Ducting" icon={Wind} subtitle="Exhaust setup">
              <SegmentedControl 
                options={['Yes', 'No', 'Not Sure']} 
                selected={state.chimneyDucting} 
                onChange={(val) => setState({ ...state, chimneyDucting: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 8:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Kitchen <span className="text-luxury-gold">Lighting.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Functional and decorative lighting.
              </p>
            </div>

            <SectionWrapper title="Lighting Types" icon={Lightbulb} subtitle="Multi-select options">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Under-cabinet lighting', 'Profile lighting', 'Ceiling lights', 'None'
                ].map((light) => (
                  <button
                    key={light}
                    onClick={() => {
                      const newLight = state.lighting.includes(light)
                        ? state.lighting.filter(l => l !== light)
                        : [...state.lighting, light];
                      setState({ ...state, lighting: newLight });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all ${
                      state.lighting.includes(light)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    {light}
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
                Finish & <span className="text-luxury-gold">Aesthetics.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Visual style and handle preferences.
              </p>
            </div>

            <SectionWrapper title="Aesthetic Finish" icon={Sparkles} subtitle="Overall look">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'aesthetic' ? null : 'aesthetic')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.aestheticFinish ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.aestheticFinish || 'Select Aesthetic Finish'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'aesthetic' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'aesthetic' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['Matte Finish', 'Gloss Finish', 'Dual Tone', 'Wood Finish', 'Designer Finish'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setState({ ...state, aestheticFinish: type });
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                            state.aestheticFinish === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
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

            <SectionWrapper title="Handle Type" icon={Settings2} subtitle="Opening style & hardware">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Handle-less (Gola)', 'Profile Handles', 'External Pulls', 
                  'Knobs', 'Edge Profile', 'Push-to-Open', 'Integrated J-Pull', 'Mixed Style'
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => setState({ ...state, handleType: type })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.handleType === type
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 10:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Budget & <span className="text-luxury-gold">Constraints.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Expectations and site logistics.
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
                      {['Basic Functional Kitchen', 'Mid-range Modular Kitchen', 'Premium Designer Kitchen', 'Need Cost Guidance'].map((type) => (
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

            <SectionWrapper title="Floor Level" icon={Building2} subtitle="Project height">
              <SegmentedControl 
                options={['1–5', '6–10', '10+']} 
                selected={state.floorLevel} 
                onChange={(val) => setState({ ...state, floorLevel: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Lift Availability" icon={Truck} subtitle="Material logistics">
              <SegmentedControl 
                options={['Yes', 'No']} 
                selected={state.liftAvailability} 
                onChange={(val) => setState({ ...state, liftAvailability: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Work Timing" icon={Clock} subtitle="Association rules">
              <SegmentedControl 
                options={['Strict', 'Flexible']} 
                selected={state.workTiming} 
                onChange={(val) => setState({ ...state, workTiming: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Existing Condition" icon={Construction} subtitle="Current site state">
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'condition' ? null : 'condition')}
                  className="w-full p-4 bg-[var(--paper)] border border-[var(--line)] rounded-xl flex items-center justify-between shadow-sm active:bg-[var(--bg)] transition-colors"
                >
                  <span className={`text-[13px] font-bold ${state.kitchenCondition ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {state.kitchenCondition || 'Select Condition'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-300 ${activeDropdown === 'condition' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'condition' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl shadow-2xl z-30 overflow-hidden"
                    >
                      {['Bare Shell', 'Semi-finished', 'Old Kitchen Removal Required'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setState({ ...state, kitchenCondition: type });
                            setActiveDropdown(null);
                          }}
                          className={`w-full p-4 text-left hover:bg-[var(--bg)] transition-colors text-[13px] font-bold border-b border-[var(--line)] last:border-0 ${
                            state.kitchenCondition === type ? 'text-luxury-gold bg-luxury-gold/5' : 'text-[var(--ink)]'
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

            <SectionWrapper title="Demolition Required?" icon={Trash2} subtitle="Civil work">
              <SegmentedControl 
                options={['Yes', 'No']} 
                selected={state.demolitionRequired} 
                onChange={(val) => setState({ ...state, demolitionRequired: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 11:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Special <span className="text-luxury-gold">Requests.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Any specific requirement or reference image.
              </p>
            </div>

            <SectionWrapper title="Additional Info" icon={FileText} subtitle="Optional details">
              <textarea 
                value={state.specialRequirements}
                onChange={(e) => setState({ ...state, specialRequirements: e.target.value })}
                placeholder="E.g. Specific brand models, color codes, or reference links."
                className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors h-32 resize-none"
              />
            </SectionWrapper>
          </motion.div>
        );
      case 12:
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
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your kitchen requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Layout & Size" 
                icon={Layout} 
                items={[
                  { label: 'Layout', value: state.layout },
                  { label: 'Size Range', value: state.sizeRange },
                  { label: 'Cabinet Depth', value: state.cabinetDepth }
                ]}
              />

              <ReviewSection 
                title="Materials & Finishes" 
                icon={Box} 
                items={[
                  { label: 'Carcass', value: state.carcassMaterial },
                  { label: 'Shutter', value: state.shutterFinish }
                ]}
              />

              <ReviewSection 
                title="Countertop & Backsplash" 
                icon={Layers} 
                items={[
                  { label: 'Countertop', value: state.countertop },
                  { label: 'Backsplash', value: state.backsplash }
                ]}
              />

              <ReviewSection 
                title="Storage Units" 
                icon={UtensilsCrossed} 
                items={[
                  { label: 'Units', value: state.storageUnits }
                ]}
              />

              <ReviewSection 
                title="Hardware & Accessories" 
                icon={Settings2} 
                items={[
                  { label: 'Hardware', value: state.hardwareLevel },
                  { label: 'Accessories', value: state.accessories }
                ]}
              />

              <ReviewSection 
                title="Appliances" 
                icon={Flame} 
                items={[
                  { label: 'Appliances', value: state.appliances },
                  { label: 'Responsibility', value: state.applianceResponsibility }
                ]}
              />

              <ReviewSection 
                title="Electrical & Plumbing" 
                icon={Zap} 
                items={[
                  { label: 'Electrical', value: state.electricalPoints },
                  { label: 'Plumbing', value: state.plumbingMods },
                  { label: 'Ducting', value: state.chimneyDucting }
                ]}
              />

              <ReviewSection 
                title="Lighting" 
                icon={Lightbulb} 
                items={[
                  { label: 'Types', value: state.lighting }
                ]}
              />

              <ReviewSection 
                title="Aesthetics" 
                icon={Sparkles} 
                items={[
                  { label: 'Finish', value: state.aestheticFinish },
                  { label: 'Handles', value: state.handleType }
                ]}
              />

              <ReviewSection 
                title="Budget & Constraints" 
                icon={Wallet} 
                items={[
                  { label: 'Expectation', value: state.expectationLevel },
                  { label: 'Floor', value: state.floorLevel },
                  { label: 'Lift', value: state.liftAvailability },
                  { label: 'Timing', value: state.workTiming },
                  { label: 'Condition', value: state.kitchenCondition },
                  { label: 'Demolition', value: state.demolitionRequired }
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
      case 13:
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
                Kitchen RFQ <span className="text-luxury-gold">Submitted!</span>
              </h2>
              <p className="text-[var(--muted)] text-sm font-semibold max-w-xs mx-auto">
                Thank you, {state.userName}. We will review your modular kitchen requirements and contact you soon.
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
          <h1 className="text-sm font-bold text-[var(--ink)] tracking-tight">Kitchen RFQ</h1>
          <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest">Step {step} of 13</p>
        </div>
        <div className="w-10 h-10" />
      </div>

      <div className="bg-[var(--paper)] border-b border-[var(--line)] px-6 py-3">
        <RFQStepBar step={step} totalSteps={13} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-32 no-scrollbar">
          {renderStep()}
      </div>

      {/* Footer Navigation */}
      {step < 12 && (
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
