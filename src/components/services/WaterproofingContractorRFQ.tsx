import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Home, 
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
  Sparkles,
  Layers,
  Layout,
  Settings,
  Palette,
  Maximize,
  LayoutGrid,
  Droplets,
  Trash2,
  ArrowUpRight,
  UserCheck,
  Info,
  ExternalLink,
  Search,
  Waves,
  AlertTriangle,
  SearchCode,
  CloudRain,
  Sun
} from 'lucide-react';
import { WaterproofingContractor } from '../rfq-types';
import { MOCK_WATERPROOFING_CONTRACTORS } from '../rfq-constants';
import { RFQStepBar } from './RFQStepBar';

interface WaterproofingContractorRFQProps {
  onBack: () => void;
  onComplete: (data: any) => void;
}

interface WaterproofingState {
  requirementType: string;
  propertyType: string;
  currentStage: string;
  areas: string[];
  affectedZone: string;
  problems: string[];
  source: string;
  preventiveAreas: string[];
  substrateCondition: string;
  accessibility: string;
  finishTier: string;
  selectedBrands: string[];
  coreScope: string[];
  performancePriorities: string[];
  responsibilityModel: string;
  warrantyExpectation: string;
  siteCondition: string;
  timeline: string;
  notes: string;
  selectedContractorId: string;
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

const ContractorCard: React.FC<{ contractor: WaterproofingContractor, selected: boolean, onToggle: () => void }> = ({ contractor, selected, onToggle }) => (
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

export const WaterproofingContractorRFQ: React.FC<WaterproofingContractorRFQProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WaterproofingState>({
    requirementType: 'New Waterproofing Work',
    propertyType: '',
    currentStage: '',
    areas: [],
    affectedZone: '',
    problems: [],
    source: '',
    preventiveAreas: [],
    substrateCondition: '',
    accessibility: '',
    finishTier: 'classic',
    selectedBrands: [],
    coreScope: [],
    performancePriorities: [],
    responsibilityModel: 'Complete Diagnosis & Execution',
    warrantyExpectation: '',
    siteCondition: '',
    timeline: '',
    notes: '',
    selectedContractorId: ''
  });

  const totalSteps = 12;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Waterproofing <span className="text-luxury-gold">Requirement.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Choose the type of waterproofing work you need.
              </p>
            </div>

            <SectionWrapper title="Work Type" icon={Waves} subtitle="Select requirement">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'New Waterproofing Work', desc: 'Preventive treatment for new construction.', icon: Sparkles, recommended: true },
                  { id: 'Leakage / Seepage Rectification', desc: 'Fixing active water issues in existing property.', icon: AlertTriangle },
                  { id: 'Re-Waterproofing', desc: 'Replacing old, failed waterproofing systems.', icon: Layers },
                  { id: 'Dampness Treatment', desc: 'Fixing wall dampness and paint peeling.', icon: Droplets },
                  { id: 'Inspection & Diagnosis', desc: 'Not sure of the source? Get an expert check first.', icon: SearchCode }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setState({ ...state, requirementType: item.id }); nextStep(); }}
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
                Project <span className="text-luxury-gold">Basics.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Help us understand the context of your property.
              </p>
            </div>

            <SectionWrapper title="Property Details" icon={Building2} subtitle="Type & Stage">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Property Type</p>
                  <SegmentedControl 
                    options={['Apartment', 'House / Villa', 'Commercial', 'Office', 'Warehouse']} 
                    selected={state.propertyType} 
                    onChange={(val) => setState({ ...state, propertyType: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Current Site Stage</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'new-const', title: 'New Construction', desc: 'Preventive planning during build.' },
                      { id: 'finishing', title: 'Finishing Stage', desc: 'Final waterproofing before tiling/painting.' },
                      { id: 'occupied', title: 'Completed & Occupied', desc: 'Live property with active or preventive needs.' },
                      { id: 'renovation', title: 'Under Renovation', desc: 'Old property being upgraded.' }
                    ].map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => setState({ ...state, currentStage: stage.id })}
                        className={`p-4 rounded-2xl border transition-all text-left ${
                          state.currentStage === stage.id
                            ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                        }`}
                      >
                        <p className="text-[11px] font-black">{stage.title}</p>
                        <p className="text-[9px] font-bold text-[var(--muted)]">{stage.desc}</p>
                      </button>
                    ))}
                  </div>
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
                Areas <span className="text-luxury-gold">Selection.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Which zones need treatment?
              </p>
            </div>

            <SectionWrapper title="Zones" icon={LayoutGrid} subtitle="Select all that apply">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Terrace', 'Balcony', 'Bathroom', 'Kitchen', 'Utility', 
                  'External Wall', 'Internal Wall', 'Basement', 'Water Tank', 
                  'Planter Box', 'Podium', 'Sunken Slab'
                ].map((area) => (
                  <button
                    key={area}
                    onClick={() => {
                      const newAreas = state.areas.includes(area)
                        ? state.areas.filter(a => a !== area)
                        : [...state.areas, area];
                      setState({ ...state, areas: newAreas });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.areas.includes(area)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-sm'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 4:
        const isRectification = state.requirementType !== 'New Waterproofing Work';
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                {isRectification ? 'Problem' : 'Preventive'} <span className="text-luxury-gold">Details.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                {isRectification ? 'What issues are you seeing at the site?' : 'Which areas do you want to protect?'}
              </p>
            </div>

            {isRectification ? (
              <SectionWrapper title="Issues" icon={AlertTriangle} subtitle="Select symptoms">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Active Leakage', 'Damp Patches', 'Paint Peeling', 'Wall Bubbling', 
                    'Ceiling Seepage', 'Bathroom Leakage', 'Water Ponding', 'Cracks'
                  ].map((prob) => (
                    <button
                      key={prob}
                      onClick={() => {
                        const newProbs = state.problems.includes(prob)
                          ? state.problems.filter(p => p !== prob)
                          : [...state.problems, prob];
                        setState({ ...state, problems: newProbs });
                      }}
                      className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                        state.problems.includes(prob)
                          ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-sm'
                          : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                      }`}
                    >
                      {prob}
                    </button>
                  ))}
                </div>
              </SectionWrapper>
            ) : (
              <SectionWrapper title="Protection" icon={ShieldCheck} subtitle="Select zones">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Terrace Preventive', 'Bathroom Preventive', 'Basement Preventive', 
                    'Tank Preventive', 'Podium Preventive', 'Wall Preventive'
                  ].map((area) => (
                    <button
                      key={area}
                      onClick={() => {
                        const newAreas = state.preventiveAreas.includes(area)
                          ? state.preventiveAreas.filter(a => a !== area)
                          : [...state.preventiveAreas, area];
                        setState({ ...state, preventiveAreas: newAreas });
                      }}
                      className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                        state.preventiveAreas.includes(area)
                          ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-sm'
                          : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </SectionWrapper>
            )}
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Surface & <span className="text-luxury-gold">Substrate.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Treatment depends heavily on the existing condition.
              </p>
            </div>

            <SectionWrapper title="Substrate" icon={Layers} subtitle="Surface condition">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'New Concrete', 'Screed Ready', 'Tiled Surface', 'Plastered Wall', 
                  'Painted Wall', 'Cracked Surface', 'Treated Before', 'Unknown'
                ].map(cond => (
                  <button
                    key={cond}
                    onClick={() => setState({ ...state, substrateCondition: cond })}
                    className={`p-4 rounded-2xl text-[11px] font-black border transition-all text-left ${
                      state.substrateCondition === cond
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-sm'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {cond}
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
                Quality <span className="text-luxury-gold">Tier.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the performance and brand level.
              </p>
            </div>

            <SectionWrapper title="Tier" icon={ShieldCheck} subtitle="Select quality level">
              <SegmentedControl 
                options={['Standard', 'Classic', 'Luxury']} 
                selected={state.finishTier} 
                onChange={(val) => setState({ ...state, finishTier: val })} 
              />
            </SectionWrapper>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Dr. Fixit', tags: ['Recommended'] },
                { name: 'Fosroc', tags: ['Premium'] },
                { name: 'Sika', tags: ['Luxury'] },
                { name: 'Asian Paints', tags: ['Reliable'] }
              ].map((brand) => (
                <button
                  key={brand.name}
                  onClick={() => {
                    const newBrands = state.selectedBrands.includes(brand.name)
                      ? state.selectedBrands.filter(b => b !== brand.name)
                      : [...state.selectedBrands, brand.name];
                    setState({ ...state, selectedBrands: newBrands });
                  }}
                  className={`p-4 rounded-2xl border transition-all text-left space-y-2 ${
                    state.selectedBrands.includes(brand.name) ? 'bg-luxury-gold/5 border-luxury-gold' : 'bg-[var(--paper)] border-[var(--line)]'
                  }`}
                >
                  <p className="text-[11px] font-black">{brand.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {brand.tags.map(tag => (
                      <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-[var(--paper)] rounded text-[var(--muted)] font-bold uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Treatment <span className="text-luxury-gold">Scope.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Ensure all critical steps are included.
              </p>
            </div>

            <SectionWrapper title="Scope" icon={ClipboardCheck} subtitle="What's included?">
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'prep', title: 'Surface Preparation', desc: 'Cleaning, hacking, and substrate readying.' },
                  { id: 'crack', title: 'Crack Opening & Repair', desc: 'V-groove filling with polymer mortar.' },
                  { id: 'coating', title: 'Chemical / Polymer Coating', desc: 'Main waterproofing barrier application.' },
                  { id: 'membrane', title: 'Membrane Application', desc: 'APP or PVC membrane for heavy duty areas.' },
                  { id: 'joints', title: 'Joint & Corner Sealing', desc: 'Upturn treatment and corner reinforcement.' },
                  { id: 'testing', title: 'Water / Flood Testing', desc: 'Final verification of leak-proof status.' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const newScope = state.coreScope.includes(item.id)
                        ? state.coreScope.filter(s => s !== item.id)
                        : [...state.coreScope, item.id];
                      setState({ ...state, coreScope: newScope });
                    }}
                    className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
                      state.coreScope.includes(item.id)
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-sm'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    <div>
                      <p className="text-[11px] font-black">{item.title}</p>
                      <p className="text-[9px] font-bold text-[var(--muted)]">{item.desc}</p>
                    </div>
                    {state.coreScope.includes(item.id) && <Check size={16} />}
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
                Performance <span className="text-luxury-gold">Priorities.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                What outcome do you want to prioritize?
              </p>
            </div>

            <SectionWrapper title="Performance" icon={ShieldCheck} subtitle="Priorities">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'stop-leak', label: 'Stop Leakage', icon: AlertTriangle },
                  { id: 'prevent', label: 'Prevent Future', icon: ShieldCheck },
                  { id: 'longlife', label: 'Long Life', icon: Clock },
                  { id: 'non-invasive', label: 'Minimal Breaking', icon: Sparkles },
                  { id: 'monsoon', label: 'Monsoon Ready', icon: CloudRain },
                  { id: 'uv', label: 'UV Resistance', icon: Sun }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const newPrio = state.performancePriorities.includes(item.id)
                        ? state.performancePriorities.filter(p => p !== item.id)
                        : [...state.performancePriorities, item.id];
                      setState({ ...state, performancePriorities: newPrio });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center flex flex-col items-center gap-2 ${
                      state.performancePriorities.includes(item.id)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-sm'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
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
                Choose your engagement model.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'Labour Only', desc: 'You provide all materials; contractor provides skilled labour.', icon: User },
                { id: 'Labour + Material', desc: 'Contractor sources materials and provides labour.', icon: Truck },
                { id: 'Complete Diagnosis & Execution', desc: 'End-to-end responsibility. (Recommended)', recommended: true }
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
                Site <span className="text-luxury-gold">Conditions.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Logistics and access details.
              </p>
            </div>

            <SectionWrapper title="Conditions" icon={Construction} subtitle="Site status">
              <div className="grid grid-cols-1 gap-2">
                {['Occupied Property', 'Vacant Site', 'Furniture at Risk', 'Upper Floor', 'High-Rise'].map(cond => (
                  <button
                    key={cond}
                    onClick={() => setState({ ...state, siteCondition: cond })}
                    className={`p-4 rounded-2xl text-[11px] font-black border transition-all text-left ${
                      state.siteCondition === cond
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-sm'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {cond}
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
                Timeline & <span className="text-luxury-gold">Notes.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                When do you want to start?
              </p>
            </div>

            <SectionWrapper title="Timeline" icon={Clock} subtitle="Start date">
              <SegmentedControl 
                options={['Immediately', '1 Week', '15 Days', 'Flexible']} 
                selected={state.timeline} 
                onChange={(val) => setState({ ...state, timeline: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Final Input" icon={MessageSquare} subtitle="Optional notes">
              <textarea 
                value={state.notes}
                onChange={(e) => setState({ ...state, notes: e.target.value })}
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
                Choose your waterproofing expert.
              </p>
            </div>

            <div className="space-y-4">
              {MOCK_WATERPROOFING_CONTRACTORS.map((contractor) => (
                <ContractorCard 
                  key={contractor.id}
                  contractor={contractor}
                  selected={state.selectedContractorId === contractor.id}
                  onToggle={() => setState({ ...state, selectedContractorId: contractor.id })}
                />
              ))}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <>
    <div className="min-h-screen bg-[var(--paper)] pb-24">
      <div className="px-2 pt-4">
        <div className="flex items-center justify-between mb-8">
          <button onClick={prevStep} className="p-2 hover:bg-[var(--paper)] rounded-full transition-all">
            <ChevronLeft size={24} className="text-[var(--ink)]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-luxury-gold rounded-lg text-white">
              <Waves size={20} />
            </div>
            <span className="font-black text-[var(--ink)] tracking-tight">Waterproofing RFQ</span>
          </div>
          <div className="w-10" />
        </div>

        <div className="mb-8">
          <RFQStepBar step={step} totalSteps={totalSteps} />
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>

    <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--paper)]/80 backdrop-blur-lg border-t border-[var(--line)]">
      <div className="max-w-4xl mx-auto flex gap-3">
        <button
          onClick={prevStep}
          className="flex-1 py-4 rounded-2xl font-black text-sm border border-[var(--line)] text-[var(--muted)] hover:border-luxury-gold hover:text-luxury-gold transition-all uppercase tracking-widest"
        >
          Previous
        </button>
        <button
          onClick={step === totalSteps ? () => onComplete({}) : nextStep}
          className="flex-2 flex-grow py-4 rounded-2xl font-black text-sm bg-luxury-gold text-white shadow-xl shadow-luxury-gold/20 active:scale-[0.98] transition-all uppercase tracking-widest"
        >
          {step === totalSteps ? 'Submit RFQ' : 'Next'}
        </button>
      </div>
    </div>
    </>
  );
};
