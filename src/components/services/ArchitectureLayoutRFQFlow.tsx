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
  MapPin,
  Briefcase,
  Languages,
  Clock,
  Search,
  Check,
  Info,
  AlertTriangle,
  ArrowUpRight,
  Compass,
  Palette,
  Home,
  Wind,
  Sun,
  Layout,
  Eye,
  PenTool,
  Maximize,
  Image as ImageIcon,
  DoorOpen,
  Move,
  Focus
} from 'lucide-react';
import { Architect } from '../rfq-types';
import { MOCK_ARCHITECTS } from '../rfq-constants';
import { RFQStepBar } from './RFQStepBar';

interface ArchitectureLayoutRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface ArchitectureLayoutState {
  // Step 1: Intent & Scale
  intent: string;
  scale: string;
  // Step 2: Spatial Philosophy
  philosophy: string;
  priority: string;
  // Step 3: Lifestyle & Usage
  familyType: string;
  lifestylePattern: string;
  spaceUsage: string[];
  // Step 4: Zoning & Behavior
  kitchenType: string;
  bedroomType: string;
  livingType: string;
  utilityType: string;
  staircaseType: string;
  // Step 5: Circulation & Access
  circulation: string;
  access: string;
  // Step 6: Site & Vastu
  orientation: string;
  ventilation: string;
  light: string;
  privacy: string;
  vastu: string;
  // Step 7: Deliverables & Flexibility
  deliverables: string;
  multipleOptions: boolean;
  freedom: string;
  // Step 8: Timeline & Engagement
  urgency: string;
  involvement: string;
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

interface ArchitectCardProps {
  architect: Architect;
  selected: boolean;
  onToggle: () => void;
}

const ArchitectCard: React.FC<ArchitectCardProps> = ({ architect, selected, onToggle }) => (
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
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Layouts Done</p>
        <p className="text-[11px] font-black text-[var(--ink)]">{architect.projectsCompleted}+</p>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Layout Thinking Samples</p>
        <div className="grid grid-cols-2 gap-2">
          {architect.portfolioImages.map((img, i) => (
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

export const ArchitectureLayoutRFQFlow: React.FC<ArchitectureLayoutRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<ArchitectureLayoutState>({
    intent: '',
    scale: '',
    philosophy: '',
    priority: '',
    familyType: '',
    lifestylePattern: '',
    spaceUsage: [],
    kitchenType: '',
    bedroomType: '',
    livingType: '',
    utilityType: '',
    staircaseType: '',
    circulation: '',
    access: '',
    orientation: '',
    ventilation: '',
    light: '',
    privacy: '',
    vastu: '',
    deliverables: '',
    multipleOptions: false,
    freedom: '',
    urgency: '',
    involvement: '',
    inspiration: '',
    selectionMode: '',
    selectedArchitectIds: [],
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  const isStepValid = () => {
    if (step === 1) return state.intent !== '' && state.scale !== '';
    if (step === 2) return state.philosophy !== '' && state.priority !== '';
    if (step === 3) return state.familyType !== '' && state.lifestylePattern !== '' && state.spaceUsage.length > 0;
    if (step === 4) return state.kitchenType !== '' && state.bedroomType !== '' && state.livingType !== '' && state.utilityType !== '' && state.staircaseType !== '';
    if (step === 5) return state.circulation !== '' && state.access !== '';
    if (step === 6) return state.orientation !== '' && state.ventilation !== '' && state.light !== '' && state.privacy !== '' && state.vastu !== '';
    if (step === 7) return state.deliverables !== '' && state.freedom !== '';
    if (step === 8) return state.urgency !== '' && state.involvement !== '';
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
    return `TI360-LAY-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Architecture Layout', { ...state, rfqNumber: rfqNum });
    setStep(11);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Intent & <span className="text-luxury-gold">Scale.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the core logic and scope of your layout design.
              </p>
            </div>

            <SectionWrapper title="Layout Intent" icon={Sparkles} subtitle="The primary goal">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Personalized Home Layout', 'Rental-Optimized Layout', 
                  'Luxury Spatial Planning', 'Compact Space Optimization', 
                  'Commercial Space Planning', 'Mixed Use Planning'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, intent: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.intent === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Scale & Scope" icon={Building2} subtitle="Depth of planning">
              <div className="space-y-4">
                <SegmentedControl 
                  options={['Single Floor', 'Multi-Floor', 'Villa Layout', 'Apartment Unit', 'Full Building Strategy']} 
                  selected={state.scale} 
                  onChange={(val) => setState({ ...state, scale: val })} 
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
                Spatial <span className="text-luxury-gold">Philosophy.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the core core of your architectural layout.
              </p>
            </div>

            <SectionWrapper title="Planning Approach" icon={Palette} subtitle="Spatial language">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Open Plan Living', 'Zoned Privacy Planning', 
                  'Indoor-Outdoor Integration', 'Efficient Compact Layout', 
                  'Need Suggestion'
                ].map((style) => (
                  <button
                    key={style}
                    onClick={() => setState({ ...state, philosophy: style })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.philosophy === style
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Priority Selection" icon={Compass} subtitle="Functional focus">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Maximum Space Utilization', 'Comfort Living', 
                  'Luxury Spaciousness', 'Rental Efficiency', 
                  'Balanced Approach'
                ].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setState({ ...state, priority: priority })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.priority === priority
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {priority}
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
                Lifestyle & <span className="text-luxury-gold">Usage.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define how you live and use your space.
              </p>
            </div>

            <SectionWrapper title="Living Context" icon={Users} subtitle="Family & Lifestyle">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Family Type</p>
                <SegmentedControl 
                  options={['Bachelor', 'Couple', 'Family with Kids', 'Multi-Generational']} 
                  selected={state.familyType} 
                  onChange={(val) => setState({ ...state, familyType: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Lifestyle Pattern</p>
                <SegmentedControl 
                  options={['Private Living', 'Social Hosting', 'Work-from-Home', 'Hybrid Living']} 
                  selected={state.lifestylePattern} 
                  onChange={(val) => setState({ ...state, lifestylePattern: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Space Usage Preferences" icon={Maximize} subtitle="Multi-select priorities">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Dedicated Workspaces', 'Entertainment Zones', 
                  'Utility Separation', 'Guest Privacy Zones', 
                  'Multi-functional Spaces'
                ].map((exp) => (
                  <button
                    key={exp}
                    onClick={() => {
                      const newExp = state.spaceUsage.includes(exp)
                        ? state.spaceUsage.filter(e => e !== exp)
                        : [...state.spaceUsage, exp];
                      setState({ ...state, spaceUsage: newExp });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.spaceUsage.includes(exp)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {exp}
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
                Zoning & <span className="text-luxury-gold">Behavior.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define spatial relationships and behavior.
              </p>
            </div>

            <SectionWrapper title="Spatial Relationships" icon={Layout} subtitle="Zoning preferences">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Kitchen Type</p>
                  <SegmentedControl 
                    options={['Open Kitchen', 'Closed Kitchen']} 
                    selected={state.kitchenType} 
                    onChange={(val) => setState({ ...state, kitchenType: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Bedroom Type</p>
                  <SegmentedControl 
                    options={['Attached Bathrooms', 'Common Bathrooms']} 
                    selected={state.bedroomType} 
                    onChange={(val) => setState({ ...state, bedroomType: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Living Spaces</p>
                  <SegmentedControl 
                    options={['Formal Living', 'Informal Living', 'Both Separate']} 
                    selected={state.livingType} 
                    onChange={(val) => setState({ ...state, livingType: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Utility Zones</p>
                  <SegmentedControl 
                    options={['Separate Utility', 'Integrated Utility']} 
                    selected={state.utilityType} 
                    onChange={(val) => setState({ ...state, utilityType: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Staircase Type</p>
                  <SegmentedControl 
                    options={['Internal Staircase', 'External Staircase']} 
                    selected={state.staircaseType} 
                    onChange={(val) => setState({ ...state, staircaseType: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Circulation & <span className="text-luxury-gold">Access.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define movement flow and entry logic.
              </p>
            </div>

            <SectionWrapper title="Movement Flow" icon={Move} subtitle="Circulation expectations">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Spacious Movement Flow', 'Efficient Compact Circulation', 
                  'Segregated Private/Public Movement', 'Not Sure'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, circulation: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.circulation === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Entry & Access" icon={DoorOpen} subtitle="Access preferences">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Grand Entry', 'Functional Entry', 
                  'Dual Access (Rental/Comm)', 'Need Suggestion'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, access: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.access === v
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
                Site & <span className="text-luxury-gold">Vastu.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define site responsiveness and compliance.
              </p>
            </div>

            <SectionWrapper title="Environmental Response" icon={Wind} subtitle="Layout level priorities">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Orientation Sensitivity</p>
                  <SegmentedControl 
                    options={['Very Important', 'Moderate', 'Not Important']} 
                    selected={state.orientation} 
                    onChange={(val) => setState({ ...state, orientation: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Ventilation Priority</p>
                  <SegmentedControl 
                    options={['Basic', 'Cross Ventilation', 'Maximum Natural Flow']} 
                    selected={state.ventilation} 
                    onChange={(val) => setState({ ...state, ventilation: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Natural Light Preference</p>
                  <SegmentedControl 
                    options={['Standard', 'High', 'Maximum Daylight']} 
                    selected={state.light} 
                    onChange={(val) => setState({ ...state, light: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Privacy from Neighbors</p>
                  <SegmentedControl 
                    options={['High', 'Medium', 'Low']} 
                    selected={state.privacy} 
                    onChange={(val) => setState({ ...state, privacy: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Vastu Consideration" icon={Focus} subtitle="Compliance level">
              <SegmentedControl 
                options={['Strict Vastu', 'Partial Vastu', 'No Vastu']} 
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
                Deliverables & <span className="text-luxury-gold">Flexibility.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the output depth and creative freedom.
              </p>
            </div>

            <SectionWrapper title="Layout Deliverables" icon={FileText} subtitle="Expected outputs">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Concept Layout Only', 'Concept + Furniture Layout', 
                  'Multi-Option Layout Exploration', 'Final Optimized Layout Plan'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, deliverables: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.deliverables === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Options & Freedom" icon={Sparkles} subtitle="Design flexibility">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)]">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-[var(--ink)]">Multiple Options</p>
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Compare different layouts</p>
                  </div>
                  <button 
                    onClick={() => setState({ ...state, multipleOptions: !state.multipleOptions })}
                    className={`w-12 h-6 rounded-full transition-all relative ${state.multipleOptions ? 'bg-luxury-gold' : 'bg-[var(--line)]'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-[var(--paper)] rounded-full transition-all ${state.multipleOptions ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Architect Freedom Level</p>
                  <SegmentedControl 
                    options={['High (Open)', 'Moderate (Guided)', 'Low (Defined)']} 
                    selected={state.freedom} 
                    onChange={(val) => setState({ ...state, freedom: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 8:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Timeline & <span className="text-luxury-gold">Engagement.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define urgency and involvement level.
              </p>
            </div>

            <SectionWrapper title="Urgency & Involvement" icon={Calendar} subtitle="Engagement expectations">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Layout Design Urgency</p>
                  <SegmentedControl 
                    options={['Immediate', '1-2 Weeks', 'Flexible']} 
                    selected={state.urgency} 
                    onChange={(val) => setState({ ...state, urgency: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Client Involvement</p>
                  <SegmentedControl 
                    options={['Minimal', 'Collaborative', 'Highly Involved']} 
                    selected={state.involvement} 
                    onChange={(val) => setState({ ...state, involvement: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Inspiration" icon={ImageIcon} subtitle="Optional references">
              <textarea 
                value={state.inspiration}
                onChange={(e) => setState({ ...state, inspiration: e.target.value })}
                placeholder="Any reference layout, inspiration, or specific requirement..."
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
                Choose your layout expert or let us suggest the best fit.
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
                    <h3 className="text-[11px] font-black text-[var(--ink)] uppercase tracking-wider">Layout Experts</h3>
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
                      Our system will analyze your lifestyle patterns, zoning preferences, and site context to route your RFQ to the most qualified layout architect in our network.
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
                <Layout className="w-10 h-10 text-luxury-gold" />
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">Review & Submit</h2>
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your layout design requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Intent & Scale" 
                icon={Sparkles} 
                items={[
                  { label: 'Intent', value: state.intent },
                  { label: 'Scale', value: state.scale }
                ]}
              />

              <ReviewSection 
                title="Spatial Philosophy" 
                icon={Palette} 
                items={[
                  { label: 'Philosophy', value: state.philosophy },
                  { label: 'Priority', value: state.priority }
                ]}
              />

              <ReviewSection 
                title="Lifestyle & Usage" 
                icon={Users} 
                items={[
                  { label: 'Family', value: state.familyType },
                  { label: 'Lifestyle', value: state.lifestylePattern },
                  { label: 'Usage', value: state.spaceUsage }
                ]}
              />

              <ReviewSection 
                title="Zoning & Behavior" 
                icon={Layout} 
                items={[
                  { label: 'Kitchen', value: state.kitchenType },
                  { label: 'Bedroom', value: state.bedroomType },
                  { label: 'Living', value: state.livingType },
                  { label: 'Utility', value: state.utilityType },
                  { label: 'Staircase', value: state.staircaseType }
                ]}
              />

              <ReviewSection 
                title="Circulation & Access" 
                icon={Move} 
                items={[
                  { label: 'Circulation', value: state.circulation },
                  { label: 'Access', value: state.access }
                ]}
              />

              <ReviewSection 
                title="Site & Vastu" 
                icon={Wind} 
                items={[
                  { label: 'Orientation', value: state.orientation },
                  { label: 'Ventilation', value: state.ventilation },
                  { label: 'Light', value: state.light },
                  { label: 'Privacy', value: state.privacy },
                  { label: 'Vastu', value: state.vastu }
                ]}
              />

              <ReviewSection 
                title="Deliverables & Flexibility" 
                icon={FileText} 
                items={[
                  { label: 'Deliverables', value: state.deliverables },
                  { label: 'Multi-Options', value: state.multipleOptions },
                  { label: 'Freedom', value: state.freedom }
                ]}
              />

              <ReviewSection 
                title="Timeline & Engagement" 
                icon={Calendar} 
                items={[
                  { label: 'Urgency', value: state.urgency },
                  { label: 'Involvement', value: state.involvement }
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
                Confirm & Submit Layout RFQ
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
                Layout RFQ <span className="text-luxury-gold">Submitted!</span>
              </h2>
              <p className="text-[var(--muted)] text-sm font-semibold max-w-xs mx-auto">
                Thank you, {state.userName}. Your spatial planning request has been sent to the selected architects.
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
          <h1 className="text-sm font-bold text-[var(--ink)] tracking-tight">Layout Design RFQ</h1>
          <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest">Step {step} of 11</p>
        </div>
        <div className="w-10 h-10" />
      </div>

      <div className="bg-[var(--paper)] border-b border-[var(--line)] px-6 py-3">
        <RFQStepBar step={step} totalSteps={11} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-32 no-scrollbar">
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
                  ? 'bg-luxury-gold text-white shadow-luxury-gold/20' 
                  : 'bg-[var(--paper)] text-[var(--muted)] cursor-not-allowed shadow-none'
              }`}
            >
              {step === 9 ? 'Review RFQ' : 'Next Step'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
