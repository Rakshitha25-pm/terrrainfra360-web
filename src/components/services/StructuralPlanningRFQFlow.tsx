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
  HardHat,
  Activity,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { StructuralEngineer } from '../rfq-types';
import { MOCK_STRUCTURAL_ENGINEERS } from '../rfq-constants';
import { RFQStepBar } from './RFQStepBar';

interface StructuralPlanningRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface StructuralState {
  // Step 1: Project Type & Scale
  projectType: string;
  buildingScale: string;
  parkingType: string;
  // Step 2: Input Readiness
  archPlansAvailable: string;
  soilTestAvailable: string;
  soilTestRequired: string;
  surveyFinalized: string;
  // Step 3: Structural System & Foundation
  structuralSystem: string;
  foundationType: string;
  // Step 4: Structural Scope
  scope: string[];
  // Step 5: Detailing & Compliance
  detailingLevel: string;
  authorityApproval: string;
  // Step 6: Load & Usage
  usageType: string[];
  specialLoads: string[];
  // Step 7: Coordination & Support
  archCoordination: string;
  siteVisits: string;
  constructionSupport: string;
  // Step 8: Timeline & Urgency
  timeline: string;
  priority: string;
  concerns: string;
  // Step 9: Engineer Selection
  selectionMode: 'manual' | 'suggestion' | '';
  selectedEngineerIds: string[];
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
                {item.value || 'N/A'}
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

interface EngineerCardProps {
  engineer: StructuralEngineer;
  selected: boolean;
  onToggle: () => void;
}

const EngineerCard: React.FC<EngineerCardProps> = ({ engineer, selected, onToggle }) => (
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
        <h4 className="text-sm font-black text-[var(--ink)] group-hover:text-luxury-gold transition-colors">{engineer.name}</h4>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
          <MapPin size={12} />
          {engineer.practiceLocation}
        </div>
      </div>
      <div className="flex items-center gap-1 bg-luxury-gold/10 px-2 py-1 rounded-lg">
        <Star size={10} className="text-luxury-gold fill-luxury-gold" />
        <span className="text-[10px] font-black text-luxury-gold">{engineer.rating}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="space-y-1">
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Experience</p>
        <p className="text-[11px] font-black text-[var(--ink)]">{engineer.experience}</p>
      </div>
      <div className="space-y-1 text-right">
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Projects Designed</p>
        <p className="text-[11px] font-black text-[var(--ink)]">{engineer.projectsDesigned}+</p>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Specialization</p>
        <div className="flex flex-wrap gap-1">
          {engineer.specialization.map((spec, i) => (
            <span key={i} className="px-2 py-0.5 bg-[var(--bg)] border border-[var(--line)] rounded-md text-[9px] font-bold text-[var(--muted)]">
              {spec}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Software Expertise</p>
        <div className="flex flex-wrap gap-1">
          {engineer.softwareExpertise.map((sw, i) => (
            <span key={i} className="px-2 py-0.5 bg-luxury-gold/5 border border-luxury-gold/10 rounded-md text-[9px] font-bold text-luxury-gold">
              {sw}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-[var(--line)]">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">
          <ShieldCheck size={12} className={engineer.siteSupportCapability ? 'text-green-500' : 'text-[var(--muted)]'} />
          {engineer.siteSupportCapability ? 'Site Support Available' : 'Design Only'}
        </div>
        <div className={`text-[9px] font-black uppercase tracking-widest ${engineer.availability.includes('Today') ? 'text-green-500' : 'text-luxury-gold'}`}>
          {engineer.availability}
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

export const StructuralPlanningRFQFlow: React.FC<StructuralPlanningRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<StructuralState>({
    projectType: '',
    buildingScale: '',
    parkingType: '',
    archPlansAvailable: '',
    soilTestAvailable: '',
    soilTestRequired: '',
    surveyFinalized: '',
    structuralSystem: '',
    foundationType: '',
    scope: [],
    detailingLevel: '',
    authorityApproval: '',
    usageType: [],
    specialLoads: [],
    archCoordination: '',
    siteVisits: '',
    constructionSupport: '',
    timeline: '',
    priority: '',
    concerns: '',
    selectionMode: '',
    selectedEngineerIds: [],
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  const isStepValid = () => {
    if (step === 1) return state.projectType !== '' && state.buildingScale !== '' && state.parkingType !== '';
    if (step === 2) return state.archPlansAvailable !== '' && state.soilTestAvailable !== '' && state.surveyFinalized !== '';
    if (step === 3) return state.structuralSystem !== '' && state.foundationType !== '';
    if (step === 4) return state.scope.length > 0;
    if (step === 5) return state.detailingLevel !== '' && state.authorityApproval !== '';
    if (step === 6) return state.usageType.length > 0;
    if (step === 7) return state.archCoordination !== '' && state.siteVisits !== '' && state.constructionSupport !== '';
    if (step === 8) return state.timeline !== '' && state.priority !== '';
    if (step === 9) {
      if (state.selectionMode === 'suggestion') return true;
      if (state.selectionMode === 'manual') return state.selectedEngineerIds.length > 0;
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
    return `TI360-STR-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Structural Planning', { ...state, rfqNumber: rfqNum });
    setStep(11);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Project Type & <span className="text-luxury-gold">Scale.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the structural complexity and building height.
              </p>
            </div>

            <SectionWrapper title="Structural Intent" icon={Building2} subtitle="Project Type">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Residential Building', 'Commercial Building', 
                  'Villa', 'Multi-Storey Rental Building', 
                  'Mixed Use Development', 'Layout Development with Infrastructure'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, projectType: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.projectType === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Building Scale" icon={Maximize} subtitle="Floors & Parking">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Number of Floors</p>
                  <SegmentedControl 
                    options={['Ground Only', 'G+1', 'G+2', 'G+3', 'G+4+', 'High-Rise']} 
                    selected={state.buildingScale} 
                    onChange={(val) => setState({ ...state, buildingScale: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Parking/Basement</p>
                  <SegmentedControl 
                    options={['No Basement', 'Basement Planned', 'Stilt Parking', 'Both']} 
                    selected={state.parkingType} 
                    onChange={(val) => setState({ ...state, parkingType: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Input <span className="text-luxury-gold">Readiness.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Structural design requires precise architectural and site data.
              </p>
            </div>

            <SectionWrapper title="Available Inputs" icon={ClipboardCheck} subtitle="Technical Readiness">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Architectural Plans</p>
                  <SegmentedControl 
                    options={['Yes', 'No', 'In Progress']} 
                    selected={state.archPlansAvailable} 
                    onChange={(val) => setState({ ...state, archPlansAvailable: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Soil Test Report</p>
                  <SegmentedControl 
                    options={['Yes', 'No', 'Need Assistance']} 
                    selected={state.soilTestAvailable} 
                    onChange={(val) => setState({ ...state, soilTestAvailable: val })} 
                  />
                </div>
                {state.soilTestAvailable === 'No' && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Soil Test Requirement</p>
                    <SegmentedControl 
                      options={['Required', 'Not Required', 'Need Guidance']} 
                      selected={state.soilTestRequired} 
                      onChange={(val) => setState({ ...state, soilTestRequired: val })} 
                    />
                  </div>
                )}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Survey Details Finalized?</p>
                  <SegmentedControl 
                    options={['Yes', 'No']} 
                    selected={state.surveyFinalized} 
                    onChange={(val) => setState({ ...state, surveyFinalized: val })} 
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
                System & <span className="text-luxury-gold">Foundation.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the structural framework and foundation logic.
              </p>
            </div>

            <SectionWrapper title="Structural System" icon={Layers} subtitle="Framework Type">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'RCC Framed Structure', 'Load Bearing Structure', 
                  'Steel Structure', 'Composite Structure', 'Need Recommendation'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, structuralSystem: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.structuralSystem === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Foundation Expectations" icon={Home} subtitle="Sub-structure Type">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Isolated Footing', 'Combined Footing', 
                  'Raft Foundation', 'Pile Foundation', 'Not Sure'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, foundationType: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.foundationType === v
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
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Structural <span className="text-luxury-gold">Scope.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Select the specific design deliverables required.
              </p>
            </div>

            <SectionWrapper title="Scope Requirements" icon={PenTool} subtitle="Multi-select deliverables">
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Column Layout', 'Beam Layout', 'Slab Design', 
                  'Staircase Structural Design', 'Footing/Foundation Design', 
                  'Retaining Walls', 'Basement Structure', 
                  'Structural Stability Certificate'
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      const newScope = state.scope.includes(item)
                        ? state.scope.filter(s => s !== item)
                        : [...state.scope, item];
                      setState({ ...state, scope: newScope });
                    }}
                    className={`p-4 rounded-2xl text-[13px] font-bold border transition-all flex items-center justify-between ${
                      state.scope.includes(item)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {item}
                    {state.scope.includes(item) && <CheckCircle2 size={18} />}
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
                Detailing & <span className="text-luxury-gold">Compliance.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the depth of drawings and authority requirements.
              </p>
            </div>

            <SectionWrapper title="Detailing Level" icon={FileText} subtitle="Output Depth">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Basic Structural Layout', 'Detailed Structural Drawings', 
                  'Structural Design with Calculations', 
                  'Complete Structural Package with BOQ and Site Support'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, detailingLevel: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.detailingLevel === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Authority Approval" icon={ShieldAlert} subtitle="Compliance Requirement">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Drawings for Authority Approval?</p>
                <SegmentedControl 
                  options={['Yes', 'No', 'Not Sure']} 
                  selected={state.authorityApproval} 
                  onChange={(val) => setState({ ...state, authorityApproval: val })} 
                />
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Load & <span className="text-luxury-gold">Usage.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Structural safety depends on accurate load assumptions.
              </p>
            </div>

            <SectionWrapper title="Building Usage" icon={Users} subtitle="Multi-select usage">
              <div className="grid grid-cols-2 gap-2">
                {['Residential', 'Rental', 'Commercial', 'Mixed'].map((u) => (
                  <button
                    key={u}
                    onClick={() => {
                      const newUsage = state.usageType.includes(u)
                        ? state.usageType.filter(item => item !== u)
                        : [...state.usageType, u];
                      setState({ ...state, usageType: newUsage });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.usageType.includes(u)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Special Load Considerations" icon={Activity} subtitle="Multi-select loads">
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Heavy Interiors', 'Water Tanks', 'Terrace Usage', 
                  'Solar Panels', 'Lift Load'
                ].map((load) => (
                  <button
                    key={load}
                    onClick={() => {
                      const newLoads = state.specialLoads.includes(load)
                        ? state.specialLoads.filter(l => l !== load)
                        : [...state.specialLoads, load];
                      setState({ ...state, specialLoads: newLoads });
                    }}
                    className={`p-4 rounded-2xl text-[13px] font-bold border transition-all flex items-center justify-between ${
                      state.specialLoads.includes(load)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {load}
                    {state.specialLoads.includes(load) && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Coordination & <span className="text-luxury-gold">Support.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the level of professional coordination.
              </p>
            </div>

            <SectionWrapper title="Support Requirements" icon={HardHat} subtitle="Coordination depth">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Coordination with Architect Required?</p>
                  <SegmentedControl 
                    options={['Yes', 'No']} 
                    selected={state.archCoordination} 
                    onChange={(val) => setState({ ...state, archCoordination: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Site Visits Required?</p>
                  <SegmentedControl 
                    options={['Yes', 'No']} 
                    selected={state.siteVisits} 
                    onChange={(val) => setState({ ...state, siteVisits: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Construction Stage Support Required?</p>
                  <SegmentedControl 
                    options={['Yes', 'No']} 
                    selected={state.constructionSupport} 
                    onChange={(val) => setState({ ...state, constructionSupport: val })} 
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
                Timeline & <span className="text-luxury-gold">Urgency.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the delivery schedule and priority.
              </p>
            </div>

            <SectionWrapper title="Timeline & Priority" icon={Calendar} subtitle="Schedule expectations">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Structural Design Timeline</p>
                  <SegmentedControl 
                    options={['3-5 Days', '1 Week', '2 Weeks', 'Flexible']} 
                    selected={state.timeline} 
                    onChange={(val) => setState({ ...state, timeline: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Priority Level</p>
                  <SegmentedControl 
                    options={['High', 'Medium', 'Low']} 
                    selected={state.priority} 
                    onChange={(val) => setState({ ...state, priority: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Specific Concerns" icon={AlertTriangle} subtitle="Optional technical notes">
              <textarea 
                value={state.concerns}
                onChange={(e) => setState({ ...state, concerns: e.target.value })}
                placeholder="Any specific structural concern or requirement (e.g., soil issues, heavy equipment, specific material preference)..."
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
                Engineer <span className="text-luxury-gold">Selection.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Choose your structural expert or let us suggest the best fit.
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
                onClick={() => setState({ ...state, selectionMode: 'suggestion', selectedEngineerIds: [] })}
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
                    <h3 className="text-[11px] font-black text-[var(--ink)] uppercase tracking-wider">Structural Experts</h3>
                    <span className="text-[10px] font-bold text-[var(--muted)]">{state.selectedEngineerIds.length} Selected</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {MOCK_STRUCTURAL_ENGINEERS.map((engineer) => (
                      <EngineerCard 
                        key={engineer.id} 
                        engineer={engineer} 
                        selected={state.selectedEngineerIds.includes(engineer.id)}
                        onToggle={() => {
                          const newIds = state.selectedEngineerIds.includes(engineer.id)
                            ? state.selectedEngineerIds.filter(id => id !== engineer.id)
                            : [...state.selectedEngineerIds, engineer.id];
                          setState({ ...state, selectedEngineerIds: newIds });
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
                    <Cpu size={40} className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white">Expert Matching</h3>
                    <p className="text-[var(--muted)] text-xs font-medium leading-relaxed">
                      Our system will analyze your building scale, structural system, and soil context to route your RFQ to the most qualified structural engineer in our network.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-[var(--paper)]/5 rounded-2xl border border-white/10">
                      <ShieldCheck size={20} className="text-luxury-gold mx-auto mb-2" />
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">Safety Verified</p>
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
                <Layers className="w-10 h-10 text-luxury-gold" />
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">Review & Submit</h2>
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your structural planning requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Project & Scale" 
                icon={Building2} 
                items={[
                  { label: 'Type', value: state.projectType },
                  { label: 'Scale', value: state.buildingScale },
                  { label: 'Parking', value: state.parkingType }
                ]}
              />

              <ReviewSection 
                title="Input Readiness" 
                icon={ClipboardCheck} 
                items={[
                  { label: 'Arch Plans', value: state.archPlansAvailable },
                  { label: 'Soil Test', value: state.soilTestAvailable },
                  { label: 'Survey', value: state.surveyFinalized }
                ]}
              />

              <ReviewSection 
                title="System & Foundation" 
                icon={Home} 
                items={[
                  { label: 'System', value: state.structuralSystem },
                  { label: 'Foundation', value: state.foundationType }
                ]}
              />

              <ReviewSection 
                title="Scope & Detailing" 
                icon={PenTool} 
                items={[
                  { label: 'Scope', value: state.scope },
                  { label: 'Detailing', value: state.detailingLevel },
                  { label: 'Approval', value: state.authorityApproval }
                ]}
              />

              <ReviewSection 
                title="Load & Usage" 
                icon={Activity} 
                items={[
                  { label: 'Usage', value: state.usageType },
                  { label: 'Special Loads', value: state.specialLoads }
                ]}
              />

              <ReviewSection 
                title="Coordination" 
                icon={HardHat} 
                items={[
                  { label: 'Arch Coord', value: state.archCoordination },
                  { label: 'Site Visits', value: state.siteVisits },
                  { label: 'Support', value: state.constructionSupport }
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
                Confirm & Submit Structural RFQ
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
                Structural RFQ <span className="text-luxury-gold">Submitted!</span>
              </h2>
              <p className="text-[var(--muted)] text-sm font-semibold max-w-xs mx-auto">
                Thank you, {state.userName}. Your structural planning request has been sent to the selected engineers.
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
          <h1 className="text-sm font-bold text-[var(--ink)] tracking-tight">Structural Planning RFQ</h1>
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
