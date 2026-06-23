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
  Clock,
  Building2,
  Settings2,
  Construction,
  Info,
  Maximize2,
  Star,
  ShieldAlert,
  Trash2,
  DoorOpen,
  Maximize,
  Eye,
  Lightbulb,
  Droplets
} from 'lucide-react';
import { RFQStepBar } from './RFQStepBar';

interface WardrobeRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface WardrobeState {
  // Screen 1
  areas: string[];
  quantity: string;
  sizePerWardrobe: string;
  wardrobeType: string;
  // Screen 2
  coreMaterial: string;
  shutterFinish: string;
  internalConfig: string[];
  hardwareLevel: string;
  // Screen 3
  accessories: string[];
  externalDesign: string;
  handleType: string;
  mirrorRequirement: string;
  // Screen 4
  lighting: string[];
  loftInclusion: string;
  floorLevel: string;
  liftAvailability: string;
  // Screen 5
  workTiming: string;
  existingCondition: string;
  budgetExpectation: string;
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

export const WardrobeRFQFlow: React.FC<WardrobeRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WardrobeState>({
    areas: [],
    quantity: '',
    sizePerWardrobe: '',
    wardrobeType: '',
    coreMaterial: '',
    shutterFinish: '',
    internalConfig: [],
    hardwareLevel: '',
    accessories: [],
    externalDesign: '',
    handleType: '',
    mirrorRequirement: '',
    lighting: [],
    loftInclusion: '',
    floorLevel: '',
    liftAvailability: '',
    workTiming: '',
    existingCondition: '',
    budgetExpectation: '',
    specialRequirements: '',
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const isStepValid = () => {
    if (step === 1) return state.areas.length > 0 && state.quantity !== '' && state.sizePerWardrobe !== '' && state.wardrobeType !== '';
    if (step === 2) return state.coreMaterial !== '' && state.shutterFinish !== '' && state.internalConfig.length > 0 && state.hardwareLevel !== '';
    if (step === 3) return state.accessories.length > 0 && state.externalDesign !== '' && state.handleType !== '' && state.mirrorRequirement !== '';
    if (step === 4) return state.lighting.length > 0 && state.loftInclusion !== '' && state.floorLevel !== '' && state.liftAvailability !== '';
    if (step === 5) return state.workTiming !== '' && state.existingCondition !== '' && state.budgetExpectation !== '';
    if (step === 6) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-WARDROBE-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Wardrobe', { ...state, rfqNumber: rfqNum });
    setStep(7);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Basic <span className="text-luxury-gold">Details.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the scope and scale of your wardrobes.
              </p>
            </div>

            <SectionWrapper title="Areas" icon={Layout} subtitle="Multi-select areas">
              <div className="grid grid-cols-2 gap-2">
                {['Master Bedroom', 'Guest Bedroom', 'Kids Room', 'Dressing Area', 'Walk-in Wardrobe', 'Multiple Rooms'].map((area) => (
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
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Quantity & Size" icon={Maximize} subtitle="Number and dimensions">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Number of Wardrobes</p>
                <SegmentedControl 
                  options={['1', '2', '3', '4+']} 
                  selected={state.quantity} 
                  onChange={(val) => setState({ ...state, quantity: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Approx Size per Wardrobe</p>
                <SegmentedControl 
                  options={['4 ft', '6 ft', '8 ft', '10 ft', 'Custom Range']} 
                  selected={state.sizePerWardrobe} 
                  onChange={(val) => setState({ ...state, sizePerWardrobe: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Wardrobe Type" icon={DoorOpen} subtitle="Compulsory selection">
              <div className="grid grid-cols-2 gap-2">
                {['Hinged Wardrobe', 'Sliding Wardrobe', 'Walk-in Wardrobe', 'Glass Wardrobe', 'Need Suggestion'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setState({ ...state, wardrobeType: type })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all ${
                      state.wardrobeType === type
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
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Materials & <span className="text-luxury-gold">Config.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Core materials and internal organization.
              </p>
            </div>

            <SectionWrapper title="Core Material" icon={Box} subtitle="Bangalore-ready durability">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'BWP Plywood', title: 'BWP Plywood', desc: 'Boiling Water Proof - Best for long life', icon: Droplets },
                  { id: 'HDHMR', title: 'HDHMR', desc: 'High Density High Moisture Resistance', icon: ShieldAlert },
                  { id: 'Commercial Plywood', title: 'Commercial Plywood', desc: 'Standard MR Grade Plywood', icon: Box },
                  { id: 'MDF/HDF', title: 'MDF / HDF', desc: 'Engineered Wood - Budget Friendly', icon: Layers },
                  { id: 'Need Recommendation', title: 'Help Me Choose', desc: 'Expert guidance based on usage', icon: Info },
                ].map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => setState({ ...state, coreMaterial: mat.id })}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      state.coreMaterial === mat.id
                        ? 'bg-luxury-gold/5 border-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] hover:border-[var(--line)]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      state.coreMaterial === mat.id ? 'bg-luxury-gold text-white' : 'bg-[var(--bg)] text-[var(--muted)]'
                    }`}>
                      <mat.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-[var(--ink)]">{mat.title}</p>
                      <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-tight">{mat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Shutter Finish" icon={Sparkles} subtitle="External aesthetics">
              <div className="grid grid-cols-2 gap-2">
                {['Laminate Finish', 'Acrylic Finish', 'PU Paint Finish', 'Membrane Finish', 'Veneer Finish', 'Glass Shutters', 'Mirror Finish', 'Combination'].map((type) => (
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

            <SectionWrapper title="Internal Configuration" icon={Settings2} subtitle="Multi-select components">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Hanging Sections', 'Shelves', 'Drawers', 'Lockable Drawers', 
                  'Loft Storage', 'Shoe Racks', 'Saree Pull-outs', 
                  'Trouser Pull-outs', 'Jewelry Organizers', 'Open Niches'
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      const newConfig = state.internalConfig.includes(item)
                        ? state.internalConfig.filter(i => i !== item)
                        : [...state.internalConfig, item];
                      setState({ ...state, internalConfig: newConfig });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.internalConfig.includes(item)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {item}
                    {state.internalConfig.includes(item) && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 size={12} className="text-luxury-gold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Hardware Level" icon={Star} subtitle="Brand & quality">
              <SegmentedControl 
                options={['Basic', 'Standard', 'Premium', 'Luxury']} 
                selected={state.hardwareLevel} 
                onChange={(val) => setState({ ...state, hardwareLevel: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Design & <span className="text-luxury-gold">Hardware.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Hardware features and external design.
              </p>
            </div>

            <SectionWrapper title="Accessories" icon={Settings2} subtitle="Multi-select features">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Soft-close Hinges', 'Telescopic Channels', 'Hydraulic Lift-ups', 
                  'Sliding Mechanism', 'Built-in Locks'
                ].map((acc) => (
                  <button
                    key={acc}
                    onClick={() => {
                      const newAcc = state.accessories.includes(acc)
                        ? state.accessories.filter(a => a !== acc)
                        : [...state.accessories, acc];
                      setState({ ...state, accessories: newAcc });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.accessories.includes(acc)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {acc}
                    {state.accessories.includes(acc) && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 size={12} className="text-luxury-gold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="External Design" icon={Sparkles} subtitle="Visual style">
              <div className="grid grid-cols-2 gap-2">
                {['Matte Finish', 'Gloss Finish', 'Dual Tone', 'Wood Finish', 'Mirror Finish', 'Designer Panels'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setState({ ...state, externalDesign: type })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.externalDesign === type
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Handle Type" icon={Settings2} subtitle="Opening style">
              <div className="grid grid-cols-2 gap-2">
                {['Handle-less', 'Gola Profile', 'External Handles', 'Integrated Handles'].map((type) => (
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

            <SectionWrapper title="Mirror Requirement" icon={Eye} subtitle="Mirror placement">
              <SegmentedControl 
                options={['No Mirror', 'External Panel', 'Full-Length', 'Internal Mirror']} 
                selected={state.mirrorRequirement} 
                onChange={(val) => setState({ ...state, mirrorRequirement: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Logistics & <span className="text-luxury-gold">Extras.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Lighting, lofts, and site constraints.
              </p>
            </div>

            <SectionWrapper title="Lighting" icon={Lightbulb} subtitle="Multi-select options">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Internal Lighting', 'Sensor Lights', 'Profile Lighting', 'No Lighting'
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      const newLighting = state.lighting.includes(item)
                        ? state.lighting.filter(l => l !== item)
                        : [...state.lighting, item];
                      setState({ ...state, lighting: newLighting });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.lighting.includes(item)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {item}
                    {state.lighting.includes(item) && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 size={12} className="text-luxury-gold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Loft Inclusion" icon={ArrowUp} subtitle="Include in scope?">
              <SegmentedControl 
                options={['Yes', 'No', 'Not Sure']} 
                selected={state.loftInclusion} 
                onChange={(val) => setState({ ...state, loftInclusion: val })} 
              />
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
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Final <span className="text-luxury-gold">Inputs.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Timing, condition, and budget.
              </p>
            </div>

            <SectionWrapper title="Work Timing" icon={Clock} subtitle="Association rules">
              <SegmentedControl 
                options={['Strict', 'Flexible']} 
                selected={state.workTiming} 
                onChange={(val) => setState({ ...state, workTiming: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Existing Condition" icon={Construction} subtitle="Current site state">
              <SegmentedControl 
                options={['New Installation', 'Old Removal Required']} 
                selected={state.existingCondition} 
                onChange={(val) => setState({ ...state, existingCondition: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Budget Expectation" icon={Wallet} subtitle="Guided selection">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Basic Functional Wardrobe', 'Mid-range Modular Wardrobe', 'Premium Designer Wardrobe', 'Need Cost Guidance'
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => setState({ ...state, budgetExpectation: type })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.budgetExpectation === type
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Special Requests" icon={FileText} subtitle="Optional details">
              <textarea 
                value={state.specialRequirements}
                onChange={(e) => setState({ ...state, specialRequirements: e.target.value })}
                placeholder="E.g. Specific brand models, color codes, or reference links."
                className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors h-32 resize-none"
              />
            </SectionWrapper>
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
                <FileText className="w-10 h-10 text-luxury-gold" />
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">Review & Submit</h2>
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your wardrobe requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Basic Details" 
                icon={Layout} 
                items={[
                  { label: 'Areas', value: state.areas },
                  { label: 'Quantity', value: state.quantity },
                  { label: 'Size', value: state.sizePerWardrobe },
                  { label: 'Type', value: state.wardrobeType }
                ]}
              />

              <ReviewSection 
                title="Materials & Config" 
                icon={Box} 
                items={[
                  { label: 'Core Material', value: state.coreMaterial },
                  { label: 'Shutter Finish', value: state.shutterFinish },
                  { label: 'Internal Config', value: state.internalConfig },
                  { label: 'Hardware Level', value: state.hardwareLevel }
                ]}
              />

              <ReviewSection 
                title="Design & Hardware" 
                icon={Settings2} 
                items={[
                  { label: 'Accessories', value: state.accessories },
                  { label: 'External Design', value: state.externalDesign },
                  { label: 'Handle Type', value: state.handleType },
                  { label: 'Mirror', value: state.mirrorRequirement }
                ]}
              />

              <ReviewSection 
                title="Logistics & Extras" 
                icon={Building2} 
                items={[
                  { label: 'Lighting', value: state.lighting },
                  { label: 'Loft', value: state.loftInclusion },
                  { label: 'Floor', value: state.floorLevel },
                  { label: 'Lift', value: state.liftAvailability }
                ]}
              />

              <ReviewSection 
                title="Final Inputs" 
                icon={Wallet} 
                items={[
                  { label: 'Timing', value: state.workTiming },
                  { label: 'Condition', value: state.existingCondition },
                  { label: 'Budget', value: state.budgetExpectation }
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
                Wardrobe RFQ <span className="text-luxury-gold">Submitted!</span>
              </h2>
              <p className="text-[var(--muted)] text-sm font-semibold max-w-xs mx-auto">
                Thank you, {state.userName}. We will review your wardrobe requirements and contact you soon.
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
          <h1 className="text-sm font-bold text-[var(--ink)] tracking-tight">Wardrobe RFQ</h1>
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
              Next Step
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
