import React, { useState } from 'react';
import { submitServiceRFQ } from '../../lib/serviceRfq';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Building2,
  Star,
  ShieldAlert,
  Users,
  Calendar,
  Zap,
  ClipboardCheck,
  MapPin,
  Briefcase,
  Clock,
  Check,
  Palette,
  Compass,
  Eye,
  Maximize,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Sun,
  Lightbulb,
  DollarSign
} from 'lucide-react';
import { Architect } from '../rfq-types';
import { MOCK_ARCHITECTS } from '../rfq-constants';
import { RFQStepBar } from './RFQStepBar';

interface ElevationDesignRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface ElevationState {
  // Step 1: Building Type & Scale
  buildingType: string;
  floors: string;
  // Step 2: Design Style
  designStyle: string;
  visualImpact: string;
  // Step 3: Materials
  materials: string[];
  // Step 4: Projections & Balconies
  projections: string;
  // Step 5: Lighting
  lighting: string;
  // Step 6: Vastu & Culture
  vastu: string;
  // Step 7: Budget & Deliverables
  budget: string;
  deliverables: string[];
  // Step 8: Flexibility & Timeline
  freedom: string;
  urgency: string;
  inspiration: string;
  // Step 9: Architect Selection
  selectionMode: 'manual' | 'suggestion' | '';
  selectedArchitectIds: string[];
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

interface ArchitectCardProps {
  key?: React.Key;
  architect: Architect;
  selected: boolean;
  onToggle: () => void;
}

const ArchitectCard = ({ architect, selected, onToggle }: ArchitectCardProps) => (
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
        <h4 className="text-sm font-black text-[var(--ink)] group-hover:text-luxury-gold transition-colors">{architect.name}</h4>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
          <MapPin size={12} />
          {architect.practiceLocation}
        </div>
      </div>
      <div className="flex items-center gap-1 bg-luxury-gold/10 px-2 py-1 rounded-lg">
        <Star size={10} className="text-luxury-gold fill-luxury-gold" />
        <span className="text-[10px] font-black text-luxury-gold">{architect.rating}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="space-y-1">
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Experience</p>
        <p className="text-[11px] font-black text-[var(--ink)]">{architect.experience}</p>
      </div>
      <div className="space-y-1 text-right">
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Elevations</p>
        <p className="text-[11px] font-black text-[var(--ink)]">{architect.projectsCompleted}+</p>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Portfolio Preview</p>
        <div className="grid grid-cols-2 gap-2">
          {architect.portfolioImages.slice(0, 2).map((img, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden border border-[var(--line)]">
              <img src={img} alt="Portfolio" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Style Strengths</p>
        <div className="flex flex-wrap gap-1">
          {architect.styleStrength.map((style, i) => (
            <span key={i} className="px-2 py-0.5 bg-[var(--bg)] border border-[var(--line)] rounded-md text-[9px] font-bold text-[var(--muted)]">
              {style}
            </span>
          ))}
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

export const ElevationDesignRFQFlow: React.FC<ElevationDesignRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<ElevationState>({
    buildingType: '',
    floors: '',
    designStyle: '',
    visualImpact: '',
    materials: [],
    projections: '',
    lighting: '',
    vastu: '',
    budget: '',
    deliverables: [],
    freedom: '',
    urgency: '',
    inspiration: '',
    selectionMode: '',
    selectedArchitectIds: [],
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  const isStepValid = () => {
    if (step === 1) return state.buildingType !== '' && state.floors !== '';
    if (step === 2) return state.designStyle !== '' && state.visualImpact !== '';
    if (step === 3) return state.materials.length > 0;
    if (step === 4) return state.projections !== '';
    if (step === 5) return state.lighting !== '';
    if (step === 6) return state.vastu !== '';
    if (step === 7) return state.budget !== '' && state.deliverables.length > 0;
    if (step === 8) return state.freedom !== '' && state.urgency !== '';
    if (step === 9) {
      if (state.selectionMode === 'suggestion') return true;
      if (state.selectionMode === 'manual') return state.selectedArchitectIds.length > 0;
      return false;
    }
    if (step === 10) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-ELV-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Elevation Design', { ...state, rfqNumber: rfqNum });
    setStep(11);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Building <span className="text-luxury-gold">Scale.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the type and height of your building.
              </p>
            </div>

            <SectionWrapper title="Building Type" icon={Building2} subtitle="Primary structure">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Independent House', 'Villa', 'Apartment Building', 
                  'Rental Building (G+2 / G+3)', 'Commercial Building', 'Mixed Use'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, buildingType: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.buildingType === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Number of Floors" icon={Layers} subtitle="Building height">
              <SegmentedControl 
                options={['Ground', 'G+1', 'G+2', 'G+3', 'G+4+']} 
                selected={state.floors} 
                onChange={(val) => setState({ ...state, floors: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Design <span className="text-luxury-gold">Style.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the visual direction and impact.
              </p>
            </div>

            <SectionWrapper title="Style Preference" icon={Palette} subtitle="Visual language">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Modern Minimal', 'Contemporary', 'Luxury', 
                  'Traditional South Indian', 'Industrial', 
                  'Glass Facade', 'Need Suggestion'
                ].map((style) => (
                  <button
                    key={style}
                    onClick={() => setState({ ...state, designStyle: style })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.designStyle === style
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Visual Impact" icon={Eye} subtitle="Expectation">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Simple & Clean Elevation', 'Balanced Design', 
                  'Premium / Eye-catching Elevation', 'Iconic / Standout Design'
                ].map((impact) => (
                  <button
                    key={impact}
                    onClick={() => setState({ ...state, visualImpact: impact })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.visualImpact === impact
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {impact}
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
                Material <span className="text-luxury-gold">Palette.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Select materials for your building's facade.
              </p>
            </div>

            <SectionWrapper title="Facade Materials" icon={Layers} subtitle="Multi-select preferences">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Paint Finish', 'Stone Cladding', 
                  'Wooden Texture Panels', 'Glass Elements', 
                  'Metal/Aluminium Panels', 'Jaali / Screens', 'Combination'
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      const newItems = state.materials.includes(item)
                        ? state.materials.filter(i => i !== item)
                        : [...state.materials, item];
                      setState({ ...state, materials: newItems });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.materials.includes(item)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {item}
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
                Balconies & <span className="text-luxury-gold">Projections.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the structural depth of your facade.
              </p>
            </div>

            <SectionWrapper title="Projection Preference" icon={Maximize} subtitle="Structural depth">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Minimal Projections', 'Functional Balconies', 
                  'Large Sit-out Balconies', 'Designer Facade Elements'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, projections: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.projections === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
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
                Lighting & <span className="text-luxury-gold">Night View.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define how your building looks after sunset.
              </p>
            </div>

            <SectionWrapper title="Lighting Preference" icon={Lightbulb} subtitle="Night aesthetics">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'No Lighting', 'Basic Outdoor Lighting', 
                  'Highlight Lighting', 'Full Facade Lighting Design'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, lighting: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.lighting === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
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
                Vastu & <span className="text-luxury-gold">Culture.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the importance of traditional principles.
              </p>
            </div>

            <SectionWrapper title="Vastu Preference" icon={Compass} subtitle="Traditional alignment">
              <SegmentedControl 
                options={['Strict Vastu', 'Partial', 'Not Required']} 
                selected={state.vastu} 
                onChange={(val) => setState({ ...state, vastu: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Budget & <span className="text-luxury-gold">Deliverables.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the investment and expected outputs.
              </p>
            </div>

            <SectionWrapper title="Budget Orientation" icon={DollarSign} subtitle="Investment level">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Basic Elevation', 'Mid-range Design', 
                  'Premium Facade', 'Luxury Custom Elevation'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, budget: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.budget === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Expected Deliverables" icon={ClipboardCheck} subtitle="Multi-select outputs">
              <div className="grid grid-cols-2 gap-2">
                {[
                  '2D Elevation Design', '3D Elevation Views', 
                  'Multiple Design Options', 'Material Guidance'
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      const newItems = state.deliverables.includes(item)
                        ? state.deliverables.filter(i => i !== item)
                        : [...state.deliverables, item];
                      setState({ ...state, deliverables: newItems });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.deliverables.includes(item)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 8:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Flexibility & <span className="text-luxury-gold">Timeline.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define creative freedom and urgency.
              </p>
            </div>

            <SectionWrapper title="Architect Freedom" icon={Sparkles} subtitle="Creative control">
              <SegmentedControl 
                options={['High', 'Moderate', 'Low']} 
                selected={state.freedom} 
                onChange={(val) => setState({ ...state, freedom: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Timeline" icon={Calendar} subtitle="Urgency">
              <SegmentedControl 
                options={['Immediate', '1–2 Weeks', 'Flexible']} 
                selected={state.urgency} 
                onChange={(val) => setState({ ...state, urgency: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Inspiration" icon={ImageIcon} subtitle="Optional references">
              <textarea 
                value={state.inspiration}
                onChange={(e) => setState({ ...state, inspiration: e.target.value })}
                placeholder="Any reference image, Pinterest link, or inspiration..."
                className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors h-32 resize-none"
              />
            </SectionWrapper>
          </motion.div>
        );
      case 9:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Architect <span className="text-luxury-gold">Selection.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Choose your design expert or let us suggest the best fit.
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
                onClick={() => setState({ ...state, selectionMode: 'suggestion', selectedArchitectIds: [] })}
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
                    <h3 className="text-[11px] font-black text-[var(--ink)] uppercase tracking-wider">Elevation Experts</h3>
                    <span className="text-[10px] font-bold text-[var(--muted)]">{state.selectedArchitectIds.length} Selected</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {MOCK_ARCHITECTS.map((architect) => (
                      <ArchitectCard 
                        key={architect.id} 
                        architect={architect} 
                        selected={state.selectedArchitectIds.includes(architect.id)}
                        onToggle={() => {
                          const newIds = state.selectedArchitectIds.includes(architect.id)
                            ? state.selectedArchitectIds.filter(id => id !== architect.id)
                            : [...state.selectedArchitectIds, architect.id];
                          setState({ ...state, selectedArchitectIds: newIds });
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
                      Our system will analyze your design style, visual impact expectations, and budget to route your RFQ to the most qualified elevation architect in our network.
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
      case 10:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 pb-32"
          >
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="w-10 h-10 text-luxury-gold" />
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">Review & Submit</h2>
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your elevation design requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Building & Style" 
                icon={Building2} 
                items={[
                  { label: 'Type', value: state.buildingType },
                  { label: 'Floors', value: state.floors },
                  { label: 'Style', value: state.designStyle },
                  { label: 'Impact', value: state.visualImpact }
                ]}
              />

              <ReviewSection 
                title="Visual Preferences" 
                icon={Palette} 
                items={[
                  { label: 'Materials', value: state.materials },
                  { label: 'Projections', value: state.projections },
                  { label: 'Lighting', value: state.lighting }
                ]}
              />

              <ReviewSection 
                title="Planning & Budget" 
                icon={DollarSign} 
                items={[
                  { label: 'Vastu', value: state.vastu },
                  { label: 'Budget', value: state.budget },
                  { label: 'Deliverables', value: state.deliverables }
                ]}
              />

              <ReviewSection 
                title="Timeline & Freedom" 
                icon={Calendar} 
                items={[
                  { label: 'Freedom', value: state.freedom },
                  { label: 'Urgency', value: state.urgency }
                ]}
              />

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Full Name</p>
                  <input 
                    type="text"
                    value={state.userName}
                    onChange={(e) => setState({ ...state, userName: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-6 py-4 bg-[var(--paper)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] focus:outline-none focus:border-luxury-gold/50 transition-colors shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Phone Number</p>
                  <input 
                    type="tel"
                    value={state.userPhone}
                    onChange={(e) => setState({ ...state, userPhone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full px-6 py-4 bg-[var(--paper)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] focus:outline-none focus:border-luxury-gold/50 transition-colors shadow-sm"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 11:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center space-y-8 py-12"
          >
            <div className="relative">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                className="w-32 h-32 bg-luxury-gold rounded-[40px] flex items-center justify-center text-white shadow-2xl shadow-luxury-gold/30"
              >
                <CheckCircle2 size={64} />
              </motion.div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border-2 border-dashed border-luxury-gold/30 rounded-[50px]"
              />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[var(--ink)]">RFQ Submitted!</h2>
              <p className="text-[var(--muted)] font-medium">Your elevation design request is now live.</p>
            </div>

            <div className="bg-[var(--bg)] rounded-3xl p-6 w-full border border-[var(--line)] space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[var(--line)]">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">RFQ Number</span>
                <span className="text-sm font-black text-[var(--ink)]">{state.rfqNumber}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Status</span>
                <span className="px-3 py-1 bg-luxury-gold/10 text-luxury-gold text-[10px] font-black rounded-full uppercase tracking-widest">Processing</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 w-full">
              <button 
                onClick={onComplete}
                className="w-full py-5 bg-orange-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-all"
              >
                Go to Dashboard
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
      <div className="px-6 pt-8 pb-6 flex items-center justify-between bg-[var(--paper)]/80 backdrop-blur-md border-b border-[var(--line)]">
        <button 
          onClick={step === 1 ? onBack : () => setStep(step - 1)}
          className="p-3 bg-[var(--bg)] rounded-2xl text-[var(--ink)] border border-[var(--line)] active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 mx-4">
          <RFQStepBar step={step} totalSteps={10} />
        </div>
        <div className="w-11" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
          {renderStep()}
      </div>

      {/* Footer */}
      {step < 11 && (
        <div className="p-6 bg-[var(--paper)] border-t border-[var(--line)]">
          <div className="max-w-4xl mx-auto">
            <button
              disabled={!isStepValid()}
              onClick={() => step === 10 ? handleFinalSubmit() : setStep(step + 1)}
              className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all uppercase tracking-widest ${
                isStepValid()
                  ? 'bg-luxury-gold text-[var(--ink)] shadow-xl shadow-luxury-gold/20 active:scale-[0.98]'
                  : 'bg-[var(--paper)] text-[var(--muted)] cursor-not-allowed shadow-none'
              }`}
            >
              {step === 10 ? 'Publish RFQ' : 'Next Section'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
