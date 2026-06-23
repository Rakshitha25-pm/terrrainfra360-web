import React, { useState } from 'react';
import { submitServiceRFQ } from '../../lib/serviceRfq';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
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
  Clock,
  Building2,
  Info,
  Maximize2,
  Star,
  MapPin,
  Compass,
  ShieldAlert,
  Home,
  Briefcase,
  TrendingUp,
  Landmark,
  Navigation,
  ArrowUp,
  Car,
  Wind,
  Droplets,
  Trash2,
  Calendar,
  Zap
} from 'lucide-react';
import { RFQStepBar } from './RFQStepBar';

interface LayoutPlanningRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface PlanningState {
  // Step 1: Project Intent
  projectType: string;
  primaryGoal: string;
  developmentType: string;
  plotSizeRange: string;
  // Step 2: Site Details
  exactDimensionsAvailable: string;
  plotShape: string;
  siteFacing: string;
  roadAccesses: string;
  roadWidth: string;
  // Step 3: Regulatory & Structure
  jurisdiction: string;
  zoningType: string;
  setbackAwareness: string;
  numberOfFloors: string;
  basementRequirement: string;
  parkingNeeds: string[];
  // Step 4: Unit & Usage
  numberOfUnits: string;
  unitTypes: string[];
  floorConfiguration: string;
  rentalOptimization: string;
  // Step 5: Space Planning & Design
  planningPriorities: string;
  ventilationPreference: string;
  vastuRequirement: string;
  staircasePlacement: string;
  liftRequirement: string;
  // Step 6: Infrastructure & Timeline
  waterSource: string;
  sewageSystem: string;
  rainwaterHarvesting: string;
  deliverableLevel: string;
  approvalDrawingsRequired: string;
  constructionTimeline: string;
  urgencyLevel: string;
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

export const LayoutPlanningRFQFlow: React.FC<LayoutPlanningRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<PlanningState>({
    projectType: '',
    primaryGoal: '',
    developmentType: '',
    plotSizeRange: '',
    exactDimensionsAvailable: '',
    plotShape: '',
    siteFacing: '',
    roadAccesses: '',
    roadWidth: '',
    jurisdiction: '',
    zoningType: '',
    setbackAwareness: '',
    numberOfFloors: '',
    basementRequirement: '',
    parkingNeeds: [],
    numberOfUnits: '',
    unitTypes: [],
    floorConfiguration: '',
    rentalOptimization: '',
    planningPriorities: '',
    ventilationPreference: '',
    vastuRequirement: '',
    staircasePlacement: '',
    liftRequirement: '',
    waterSource: '',
    sewageSystem: '',
    rainwaterHarvesting: '',
    deliverableLevel: '',
    approvalDrawingsRequired: '',
    constructionTimeline: '',
    urgencyLevel: '',
    specialRequirements: '',
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  const isStepValid = () => {
    if (step === 1) return state.projectType !== '' && state.primaryGoal !== '' && state.developmentType !== '' && state.plotSizeRange !== '';
    if (step === 2) return state.exactDimensionsAvailable !== '' && state.plotShape !== '' && state.siteFacing !== '' && state.roadAccesses !== '' && state.roadWidth !== '';
    if (step === 3) return state.jurisdiction !== '' && state.zoningType !== '' && state.setbackAwareness !== '' && state.numberOfFloors !== '' && state.basementRequirement !== '' && state.parkingNeeds.length > 0;
    if (step === 4) return state.numberOfUnits !== '' && state.unitTypes.length > 0 && state.floorConfiguration !== '' && state.rentalOptimization !== '';
    if (step === 5) return state.planningPriorities !== '' && state.ventilationPreference !== '' && state.vastuRequirement !== '' && state.staircasePlacement !== '' && state.liftRequirement !== '';
    if (step === 6) return state.waterSource !== '' && state.sewageSystem !== '' && state.rainwaterHarvesting !== '' && state.deliverableLevel !== '' && state.approvalDrawingsRequired !== '' && state.constructionTimeline !== '' && state.urgencyLevel !== '';
    if (step === 7) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-PLAN-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Layout Planning', { ...state, rfqNumber: rfqNum });
    setStep(8);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Project <span className="text-luxury-gold">Intent.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the core purpose and scale of your development.
              </p>
            </div>

            <SectionWrapper title="Project Type" icon={Building2} subtitle="Primary category">
              <div className="grid grid-cols-2 gap-2">
                {['Residential', 'Commercial', 'Mixed Use', 'Land Development'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setState({ ...state, projectType: type })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all ${
                      state.projectType === type
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Primary Goal" icon={TrendingUp} subtitle="Investment objective">
              <div className="grid grid-cols-2 gap-2">
                {['Self-use Home', 'Rental Income', 'Investment Build', 'Sell After Construction'].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setState({ ...state, primaryGoal: goal })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all ${
                      state.primaryGoal === goal
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Development Type" icon={Layout} subtitle="Building configuration">
              <div className="grid grid-cols-2 gap-2">
                {['Single Unit', 'Multi-unit Building', 'Rental Floors', 'Villas', 'Layout Development'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setState({ ...state, developmentType: type })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all ${
                      state.developmentType === type
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Plot Size Range" icon={Maximize2} subtitle="Approximate area">
              <SegmentedControl 
                options={['< 1200 sqft', '1200-2400 sqft', '2400-4000 sqft', '> 4000 sqft']} 
                selected={state.plotSizeRange} 
                onChange={(val) => setState({ ...state, plotSizeRange: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Site <span className="text-luxury-gold">Details.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Physical characteristics of your land.
              </p>
            </div>

            <SectionWrapper title="Dimensions & Shape" icon={Box} subtitle="Geometry of plot">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Exact Dimensions Available?</p>
                <SegmentedControl 
                  options={['Yes', 'No']} 
                  selected={state.exactDimensionsAvailable} 
                  onChange={(val) => setState({ ...state, exactDimensionsAvailable: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Plot Shape</p>
                <SegmentedControl 
                  options={['Regular', 'Irregular']} 
                  selected={state.plotShape} 
                  onChange={(val) => setState({ ...state, plotShape: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Orientation" icon={Compass} subtitle="Site facing">
              <div className="grid grid-cols-3 gap-2">
                {['North', 'South', 'East', 'West', 'North-East', 'Corner Plot'].map((facing) => (
                  <button
                    key={facing}
                    onClick={() => setState({ ...state, siteFacing: facing })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all ${
                      state.siteFacing === facing
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {facing}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Road Access" icon={Navigation} subtitle="Connectivity">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Number of Road Accesses</p>
                <SegmentedControl 
                  options={['1', '2', '3+']} 
                  selected={state.roadAccesses} 
                  onChange={(val) => setState({ ...state, roadAccesses: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Road Width (Approx)</p>
                <SegmentedControl 
                  options={['< 20 ft', '20-30 ft', '30-40 ft', '> 40 ft']} 
                  selected={state.roadWidth} 
                  onChange={(val) => setState({ ...state, roadWidth: val })} 
                />
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Regulatory & <span className="text-luxury-gold">Structure.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Local constraints and building scale.
              </p>
            </div>

            <SectionWrapper title="Regulatory Awareness" icon={ShieldAlert} subtitle="Compliance check">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Jurisdiction</p>
                <SegmentedControl 
                  options={['BBMP', 'BDA', 'Panchayat', 'Not Sure']} 
                  selected={state.jurisdiction} 
                  onChange={(val) => setState({ ...state, jurisdiction: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Zoning Type</p>
                <SegmentedControl 
                  options={['Residential', 'Commercial', 'Mixed', 'Not Sure']} 
                  selected={state.zoningType} 
                  onChange={(val) => setState({ ...state, zoningType: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Setback Awareness</p>
                <SegmentedControl 
                  options={['Aware', 'Need Guidance']} 
                  selected={state.setbackAwareness} 
                  onChange={(val) => setState({ ...state, setbackAwareness: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Built Structure" icon={ArrowUp} subtitle="Floors & basement">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Number of Floors</p>
                <SegmentedControl 
                  options={['G Only', 'G+1', 'G+2', 'G+3', 'G+4+']} 
                  selected={state.numberOfFloors} 
                  onChange={(val) => setState({ ...state, numberOfFloors: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Basement Requirement</p>
                <SegmentedControl 
                  options={['Yes', 'No', 'Maybe']} 
                  selected={state.basementRequirement} 
                  onChange={(val) => setState({ ...state, basementRequirement: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Parking Needs" icon={Car} subtitle="Multi-select requirements">
              <div className="grid grid-cols-3 gap-2">
                {['2-Wheeler', 'Single Car', 'Multiple Cars', 'Guest Parking'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      const newNeeds = state.parkingNeeds.includes(item)
                        ? state.parkingNeeds.filter(i => i !== item)
                        : [...state.parkingNeeds, item];
                      setState({ ...state, parkingNeeds: newNeeds });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.parkingNeeds.includes(item)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {item}
                    {state.parkingNeeds.includes(item) && (
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
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Unit & <span className="text-luxury-gold">Usage.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Planning the internal distribution of space.
              </p>
            </div>

            <SectionWrapper title="Unit Planning" icon={Layers} subtitle="Quantity & types">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Number of Units</p>
                <SegmentedControl 
                  options={['1', '2', '3-5', '6-10', '10+']} 
                  selected={state.numberOfUnits} 
                  onChange={(val) => setState({ ...state, numberOfUnits: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Unit Types (Multi-select)</p>
                <div className="grid grid-cols-2 gap-2">
                  {['1BHK', '2BHK', '3BHK', '4BHK+', 'Studio', 'Duplex'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        const newTypes = state.unitTypes.includes(type)
                          ? state.unitTypes.filter(t => t !== type)
                          : [...state.unitTypes, type];
                        setState({ ...state, unitTypes: newTypes });
                      }}
                      className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                        state.unitTypes.includes(type)
                          ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                          : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                      }`}
                    >
                      {type}
                      {state.unitTypes.includes(type) && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 size={12} className="text-luxury-gold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Usage Strategy" icon={TrendingUp} subtitle="Optimization goals">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Floor Configuration</p>
                <SegmentedControl 
                  options={['Same for all floors', 'Different configurations']} 
                  selected={state.floorConfiguration} 
                  onChange={(val) => setState({ ...state, floorConfiguration: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Rental Optimization Priority</p>
                <SegmentedControl 
                  options={['High', 'Medium', 'Low']} 
                  selected={state.rentalOptimization} 
                  onChange={(val) => setState({ ...state, rentalOptimization: val })} 
                />
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Space & <span className="text-luxury-gold">Design.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Priorities for living and compliance.
              </p>
            </div>

            <SectionWrapper title="Planning Logic" icon={Layout} subtitle="Core priorities">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Planning Priorities</p>
                <SegmentedControl 
                  options={['Max Space Utilization', 'Comfort Living', 'Balanced Approach']} 
                  selected={state.planningPriorities} 
                  onChange={(val) => setState({ ...state, planningPriorities: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Ventilation Preference</p>
                <SegmentedControl 
                  options={['Maximum', 'Standard', 'Minimal (AC Focused)']} 
                  selected={state.ventilationPreference} 
                  onChange={(val) => setState({ ...state, ventilationPreference: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Compliance & Features" icon={Star} subtitle="Vastu & access">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Vastu Requirement</p>
                <SegmentedControl 
                  options={['Mandatory', 'Partial', 'Not Required']} 
                  selected={state.vastuRequirement} 
                  onChange={(val) => setState({ ...state, vastuRequirement: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Staircase Placement</p>
                <SegmentedControl 
                  options={['Inside', 'Outside', 'Both']} 
                  selected={state.staircasePlacement} 
                  onChange={(val) => setState({ ...state, staircasePlacement: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Lift Requirement</p>
                <SegmentedControl 
                  options={['Yes', 'No', 'Future Provision']} 
                  selected={state.liftRequirement} 
                  onChange={(val) => setState({ ...state, liftRequirement: val })} 
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
                Infra & <span className="text-luxury-gold">Timeline.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Infrastructure planning and project schedule.
              </p>
            </div>

            <SectionWrapper title="Infrastructure" icon={Zap} subtitle="Utilities planning">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Water Source</p>
                <SegmentedControl 
                  options={['Borewell', 'Cauvery', 'Both']} 
                  selected={state.waterSource} 
                  onChange={(val) => setState({ ...state, waterSource: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Sewage System</p>
                <SegmentedControl 
                  options={['Connected', 'Septic Tank']} 
                  selected={state.sewageSystem} 
                  onChange={(val) => setState({ ...state, sewageSystem: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Rainwater Harvesting</p>
                <SegmentedControl 
                  options={['Yes', 'No']} 
                  selected={state.rainwaterHarvesting} 
                  onChange={(val) => setState({ ...state, rainwaterHarvesting: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Deliverables" icon={FileText} subtitle="Output level">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Expected Output</p>
                <div className="grid grid-cols-1 gap-2">
                  {['Basic Layout', 'Detailed Floor Plans', '2D + 3D Visualization', 'Full Architectural Package'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setState({ ...state, deliverableLevel: level })}
                      className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-left ${
                        state.deliverableLevel === level
                          ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                          : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Approval Drawings Required?</p>
                <SegmentedControl 
                  options={['Yes', 'No']} 
                  selected={state.approvalDrawingsRequired} 
                  onChange={(val) => setState({ ...state, approvalDrawingsRequired: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Project Timeline" icon={Calendar} subtitle="Schedule & urgency">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Construction Start</p>
                <SegmentedControl 
                  options={['Immediate', '1-3 Months', '3-6 Months', 'Planning Only']} 
                  selected={state.constructionTimeline} 
                  onChange={(val) => setState({ ...state, constructionTimeline: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Urgency Level</p>
                <SegmentedControl 
                  options={['High', 'Medium', 'Low']} 
                  selected={state.urgencyLevel} 
                  onChange={(val) => setState({ ...state, urgencyLevel: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Special Requirements" icon={FileText} subtitle="Optional details">
              <textarea 
                value={state.specialRequirements}
                onChange={(e) => setState({ ...state, specialRequirements: e.target.value })}
                placeholder="E.g. Specific setbacks, future floor plans, or reference designs."
                className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors h-32 resize-none"
              />
            </SectionWrapper>
          </motion.div>
        );
      case 7:
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
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your planning requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Project Intent" 
                icon={Building2} 
                items={[
                  { label: 'Type', value: state.projectType },
                  { label: 'Goal', value: state.primaryGoal },
                  { label: 'Development', value: state.developmentType },
                  { label: 'Plot Size', value: state.plotSizeRange }
                ]}
              />

              <ReviewSection 
                title="Site Details" 
                icon={Compass} 
                items={[
                  { label: 'Dimensions', value: state.exactDimensionsAvailable },
                  { label: 'Shape', value: state.plotShape },
                  { label: 'Facing', value: state.siteFacing },
                  { label: 'Road Access', value: state.roadAccesses },
                  { label: 'Road Width', value: state.roadWidth }
                ]}
              />

              <ReviewSection 
                title="Regulatory & Structure" 
                icon={ShieldAlert} 
                items={[
                  { label: 'Jurisdiction', value: state.jurisdiction },
                  { label: 'Zoning', value: state.zoningType },
                  { label: 'Floors', value: state.numberOfFloors },
                  { label: 'Parking', value: state.parkingNeeds }
                ]}
              />

              <ReviewSection 
                title="Unit & Usage" 
                icon={Layers} 
                items={[
                  { label: 'Units', value: state.numberOfUnits },
                  { label: 'Unit Types', value: state.unitTypes },
                  { label: 'Config', value: state.floorConfiguration },
                  { label: 'Rental Opt', value: state.rentalOptimization }
                ]}
              />

              <ReviewSection 
                title="Space & Design" 
                icon={Layout} 
                items={[
                  { label: 'Priorities', value: state.planningPriorities },
                  { label: 'Vastu', value: state.vastuRequirement },
                  { label: 'Staircase', value: state.staircasePlacement },
                  { label: 'Lift', value: state.liftRequirement }
                ]}
              />

              <ReviewSection 
                title="Infra & Timeline" 
                icon={Zap} 
                items={[
                  { label: 'Water', value: state.waterSource },
                  { label: 'Sewage', value: state.sewageSystem },
                  { label: 'Timeline', value: state.constructionTimeline }
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
      case 8:
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
                Planning RFQ <span className="text-luxury-gold">Submitted!</span>
              </h2>
              <p className="text-[var(--muted)] text-sm font-semibold max-w-xs mx-auto">
                Thank you, {state.userName}. Our planning consultants will review your site details and contact you soon.
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
          <h1 className="text-sm font-bold text-[var(--ink)] tracking-tight">Planning RFQ</h1>
          <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest">Step {step} of 8</p>
        </div>
        <div className="w-10 h-10" />
      </div>

      <div className="bg-[var(--paper)] border-b border-[var(--line)] px-6 py-3">
        <RFQStepBar step={step} totalSteps={8} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-32 no-scrollbar">
          {renderStep()}
      </div>

      {/* Footer Navigation */}
      {step < 7 && (
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
