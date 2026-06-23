import React, { useState, useEffect } from 'react';
import { submitServiceRFQ } from '../../lib/serviceRfq';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Building2, 
  HardHat, 
  ClipboardCheck, 
  Clock, 
  MapPin, 
  Droplets, 
  Zap, 
  Home, 
  Hammer, 
  ShieldCheck, 
  Banknote, 
  MessageSquare,
  Check,
  Star,
  Briefcase,
  Construction,
  Truck,
  Trash2,
  Scaling,
  User,
  Phone,
  Copy,
  Sparkles
} from 'lucide-react';
import { LabourContractor } from '../rfq-types';
import { MOCK_LABOUR_CONTRACTORS } from '../rfq-constants';
import { RFQStepBar } from './RFQStepBar';

interface LabourContractorRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface LabourState {
  // Step 1: Project Basics
  projectType: string;
  projectStage: string;
  // Step 2: Labour Requirement
  labourScope: string[];
  // Step 3: Engagement Model
  engagementType: string;
  // Step 4: Manpower & Scale
  workersCount: string;
  masonsCount: string;
  helpersCount: string;
  duration: string;
  // Step 5: Site Conditions & Tools
  siteType: string;
  waterAvailable: boolean | null;
  electricityAvailable: boolean | null;
  labourStayAvailable: boolean | null;
  liftingFacility: string;
  toolsProvider: string;
  needScaffolding: boolean | null;
  needShuttering: boolean | null;
  // Step 6: Supervision & Quality
  supervision: string;
  qualityExpectation: string;
  pricingPreference: string;
  paymentCycle: string;
  // Step 7: Timeline & Final Input
  startRequirement: string;
  workType: string;
  specificInstructions: string;
  // Step 8: Selection
  selectionMode: 'manual' | 'suggestion' | '';
  selectedContractorIds: string[];
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

const ReviewSection = ({ title, icon: Icon, items }: { title: string, icon: any, items: { label: string, value: string | boolean | string[] | null }[] }) => (
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

const ContractorCard: React.FC<{ contractor: LabourContractor, selected: boolean, onToggle: () => void }> = ({ contractor, selected, onToggle }) => (
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
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Labour Strength</p>
        <p className="text-[11px] font-black text-[var(--ink)]">{contractor.labourStrength}</p>
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
          <ShieldCheck size={12} />
          {contractor.providesSupervisor ? 'Provides Supervisor' : 'No Supervisor'}
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

export const LabourContractorRFQFlow: React.FC<LabourContractorRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<LabourState>({
    projectType: '',
    projectStage: '',
    labourScope: [],
    engagementType: '',
    workersCount: '',
    masonsCount: '',
    helpersCount: '',
    duration: '',
    siteType: '',
    waterAvailable: null,
    electricityAvailable: null,
    labourStayAvailable: null,
    liftingFacility: '',
    toolsProvider: '',
    needScaffolding: null,
    needShuttering: null,
    supervision: '',
    qualityExpectation: '',
    pricingPreference: '',
    paymentCycle: '',
    startRequirement: '',
    workType: '',
    specificInstructions: '',
    selectionMode: '',
    selectedContractorIds: [],
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const isStepValid = () => {
    if (step === 1) return state.projectType !== '' && state.projectStage !== '';
    if (step === 2) return state.labourScope.length > 0;
    if (step === 3) return state.engagementType !== '';
    if (step === 4) return state.workersCount !== '' && state.masonsCount !== '' && state.helpersCount !== '' && state.duration !== '';
    if (step === 5) return state.siteType !== '' && state.waterAvailable !== null && state.electricityAvailable !== null && state.toolsProvider !== '';
    if (step === 6) return state.supervision !== '' && state.qualityExpectation !== '' && state.pricingPreference !== '' && state.paymentCycle !== '';
    if (step === 7) return state.startRequirement !== '' && state.workType !== '';
    if (step === 8) {
      if (state.selectionMode === 'suggestion') return true;
      if (state.selectionMode === 'manual') return state.selectedContractorIds.length > 0;
      return false;
    }
    if (step === 9) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-LAB-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Labour', { ...state, rfqNumber: rfqNum });
    setStep(10);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Project <span className="text-luxury-gold">Basics.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the context of your construction project.
              </p>
            </div>

            <SectionWrapper title="Project Context" icon={Building2} subtitle="Type & Stage">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Project Type</p>
                <SegmentedControl 
                  options={['Residential', 'Commercial', 'Villa', 'Apartment', 'Renovation']} 
                  selected={state.projectType} 
                  onChange={(val) => setState({ ...state, projectType: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Project Stage</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Excavation', 'Foundation', 'RCC Structure', 
                    'Blockwork', 'Plastering', 'Finishing', 'Full Construction'
                  ].map((stage) => (
                    <button
                      key={stage}
                      onClick={() => setState({ ...state, projectStage: stage })}
                      className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                        state.projectStage === stage
                          ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                          : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
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
                Labour <span className="text-luxury-gold">Requirement.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Select the specific trades you need for your site.
              </p>
            </div>

            <SectionWrapper title="Labour Scope" icon={HardHat} subtitle="Multi-select trades">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'General Labour', 'Mason Work', 'Helpers', 
                  'Shuttering / Centering', 'Bar Bending', 'Concrete Work', 
                  'Plastering', 'Flooring Support', 'Loading/Unloading', 
                  'Cleaning Labour', 'Multi-trade Team'
                ].map((scope) => (
                  <button
                    key={scope}
                    onClick={() => {
                      const newScope = state.labourScope.includes(scope)
                        ? state.labourScope.filter(s => s !== scope)
                        : [...state.labourScope, scope];
                      setState({ ...state, labourScope: newScope });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.labourScope.includes(scope)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {scope}
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
                Engagement <span className="text-luxury-gold">Model.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define how you want to hire and pay the workforce.
              </p>
            </div>

            <SectionWrapper title="Engagement Type" icon={ClipboardCheck} subtitle="Pricing Logic">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Labour Only', 'Labour + Head Mason', 'Labour + Supervisor', 
                  'Daily Wage', 'Contract Basis', 'Per Sqft Work', 'Stage-wise Contract'
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => setState({ ...state, engagementType: type })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.engagementType === type
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
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
                Manpower & <span className="text-luxury-gold">Scale.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the quantity and duration of requirement.
              </p>
            </div>

            <SectionWrapper title="Quantity Clarity" icon={Scaling} subtitle="Worker counts">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Total Workers</p>
                  <SegmentedControl 
                    options={['1–5', '5–10', '10–20', '20+']} 
                    selected={state.workersCount} 
                    onChange={(val) => setState({ ...state, workersCount: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Masons Required</p>
                  <SegmentedControl 
                    options={['None', '1–2', '3–5', '5+']} 
                    selected={state.masonsCount} 
                    onChange={(val) => setState({ ...state, masonsCount: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Helpers Required</p>
                  <SegmentedControl 
                    options={['1–5', '5–10', '10+']} 
                    selected={state.helpersCount} 
                    onChange={(val) => setState({ ...state, helpersCount: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Duration of Work</p>
                  <SegmentedControl 
                    options={['< 1 Week', '1–4 Weeks', '1–3 Months', '3+ Months']} 
                    selected={state.duration} 
                    onChange={(val) => setState({ ...state, duration: val })} 
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
                Site & <span className="text-luxury-gold">Tools.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Execution conditions and responsibilities.
              </p>
            </div>

            <SectionWrapper title="Site Conditions" icon={MapPin} subtitle="Real-world execution">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Site Type</p>
                  <SegmentedControl 
                    options={['Empty Plot', 'Under Construction', 'Renovation', 'Apartment']} 
                    selected={state.siteType} 
                    onChange={(val) => setState({ ...state, siteType: val })} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Water Available?</p>
                    <div className="flex gap-2">
                      {[true, false].map((v) => (
                        <button
                          key={v.toString()}
                          onClick={() => setState({ ...state, waterAvailable: v })}
                          className={`flex-1 py-3 rounded-xl text-[11px] font-bold border transition-all ${
                            state.waterAvailable === v ? 'bg-luxury-gold text-white border-luxury-gold' : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--line)]'
                          }`}
                        >
                          {v ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Electricity?</p>
                    <div className="flex gap-2">
                      {[true, false].map((v) => (
                        <button
                          key={v.toString()}
                          onClick={() => setState({ ...state, electricityAvailable: v })}
                          className={`flex-1 py-3 rounded-xl text-[11px] font-bold border transition-all ${
                            state.electricityAvailable === v ? 'bg-luxury-gold text-white border-luxury-gold' : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--line)]'
                          }`}
                        >
                          {v ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Material Lifting</p>
                  <SegmentedControl 
                    options={['Manual', 'Machine', 'Not Available']} 
                    selected={state.liftingFacility} 
                    onChange={(val) => setState({ ...state, liftingFacility: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Tools & Responsibility" icon={Hammer} subtitle="Avoid disputes">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Who provides tools?</p>
                  <SegmentedControl 
                    options={['Client', 'Contractor', 'Mixed']} 
                    selected={state.toolsProvider} 
                    onChange={(val) => setState({ ...state, toolsProvider: val })} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Need Scaffolding?</p>
                    <div className="flex gap-2">
                      {[true, false].map((v) => (
                        <button
                          key={v.toString()}
                          onClick={() => setState({ ...state, needScaffolding: v })}
                          className={`flex-1 py-3 rounded-xl text-[11px] font-bold border transition-all ${
                            state.needScaffolding === v ? 'bg-luxury-gold text-white border-luxury-gold' : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--line)]'
                          }`}
                        >
                          {v ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Need Shuttering?</p>
                    <div className="flex gap-2">
                      {[true, false].map((v) => (
                        <button
                          key={v.toString()}
                          onClick={() => setState({ ...state, needShuttering: v })}
                          className={`flex-1 py-3 rounded-xl text-[11px] font-bold border transition-all ${
                            state.needShuttering === v ? 'bg-luxury-gold text-white border-luxury-gold' : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--line)]'
                          }`}
                        >
                          {v ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Supervision & <span className="text-luxury-gold">Quality.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Control level and commercial preferences.
              </p>
            </div>

            <SectionWrapper title="Management & Quality" icon={ShieldCheck} subtitle="Control level">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Site Supervision</p>
                  <SegmentedControl 
                    options={['Client/Engineer', 'Contractor', 'Shared']} 
                    selected={state.supervision} 
                    onChange={(val) => setState({ ...state, supervision: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Quality Expectation</p>
                  <SegmentedControl 
                    options={['Basic', 'Standard', 'High Quality']} 
                    selected={state.qualityExpectation} 
                    onChange={(val) => setState({ ...state, qualityExpectation: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Commercial Preference" icon={Banknote} subtitle="Pricing alignment">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Pricing Preference</p>
                  <SegmentedControl 
                    options={['Daily Rate', 'Per Sqft', 'Item Rate', 'Need Suggestion']} 
                    selected={state.pricingPreference} 
                    onChange={(val) => setState({ ...state, pricingPreference: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Payment Cycle</p>
                  <SegmentedControl 
                    options={['Daily', 'Weekly', 'Monthly', 'Milestone']} 
                    selected={state.paymentCycle} 
                    onChange={(val) => setState({ ...state, paymentCycle: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Timeline & <span className="text-luxury-gold">Input.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Finalize requirement and add specific instructions.
              </p>
            </div>

            <SectionWrapper title="Requirement Timeline" icon={Clock} subtitle="Urgency">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Start Requirement</p>
                  <SegmentedControl 
                    options={['Immediate', 'Within 3 Days', '1 Week', 'Flexible']} 
                    selected={state.startRequirement} 
                    onChange={(val) => setState({ ...state, startRequirement: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Work Type</p>
                  <SegmentedControl 
                    options={['Short Term', 'Stage Based', 'Full Project']} 
                    selected={state.workType} 
                    onChange={(val) => setState({ ...state, workType: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Final Input" icon={MessageSquare} subtitle="Optional instructions">
              <textarea 
                value={state.specificInstructions}
                onChange={(e) => setState({ ...state, specificInstructions: e.target.value })}
                placeholder="Any specific instruction, site constraints, or special labour skills required..."
                className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors h-32 resize-none"
              />
            </SectionWrapper>
          </motion.div>
        );
      case 8:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Contractor <span className="text-luxury-gold">Selection.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Choose your labour expert or let us suggest the best fit.
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
                onClick={() => setState({ ...state, selectionMode: 'suggestion', selectedContractorIds: [] })}
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
                    <h3 className="text-[11px] font-black text-[var(--ink)] uppercase tracking-wider">Labour Experts</h3>
                    <span className="text-[10px] font-bold text-[var(--muted)]">{state.selectedContractorIds.length} Selected</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {MOCK_LABOUR_CONTRACTORS.map((contractor) => (
                      <ContractorCard 
                        key={contractor.id} 
                        contractor={contractor} 
                        selected={state.selectedContractorIds.includes(contractor.id)}
                        onToggle={() => {
                          const newIds = state.selectedContractorIds.includes(contractor.id)
                            ? state.selectedContractorIds.filter(id => id !== contractor.id)
                            : [...state.selectedContractorIds, contractor.id];
                          setState({ ...state, selectedContractorIds: newIds });
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
                      Our system will analyze your project stage, labour scope, and engagement model to route your RFQ to the most qualified labour contractor in our network.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-[var(--paper)]/5 rounded-2xl border border-white/10">
                      <ShieldCheck size={20} className="text-luxury-gold mx-auto mb-2" />
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">Verified Labour</p>
                    </div>
                    <div className="p-4 bg-[var(--paper)]/5 rounded-2xl border border-white/10">
                      <Construction size={20} className="text-luxury-gold mx-auto mb-2" />
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">Site Ready</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                <HardHat className="w-10 h-10 text-luxury-gold" />
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">Review & Submit</h2>
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your labour requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Project Basics" 
                icon={Building2} 
                items={[
                  { label: 'Type', value: state.projectType },
                  { label: 'Stage', value: state.projectStage }
                ]}
              />

              <ReviewSection 
                title="Labour Scope" 
                icon={HardHat} 
                items={[
                  { label: 'Trades', value: state.labourScope }
                ]}
              />

              <ReviewSection 
                title="Engagement & Scale" 
                icon={ClipboardCheck} 
                items={[
                  { label: 'Model', value: state.engagementType },
                  { label: 'Total Workers', value: state.workersCount },
                  { label: 'Masons', value: state.masonsCount },
                  { label: 'Helpers', value: state.helpersCount },
                  { label: 'Duration', value: state.duration }
                ]}
              />

              <ReviewSection 
                title="Site & Tools" 
                icon={MapPin} 
                items={[
                  { label: 'Site Type', value: state.siteType },
                  { label: 'Water', value: state.waterAvailable },
                  { label: 'Electricity', value: state.electricityAvailable },
                  { label: 'Tools By', value: state.toolsProvider }
                ]}
              />

              <ReviewSection 
                title="Timeline" 
                icon={Clock} 
                items={[
                  { label: 'Start', value: state.startRequirement },
                  { label: 'Work Type', value: state.workType }
                ]}
              />
            </div>

            <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[32px] p-8 space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-luxury-gold transition-colors">
                    <User size={18} />
                  </div>
                  <input 
                    type="text"
                    value={state.userName}
                    onChange={(e) => setState({ ...state, userName: e.target.value })}
                    placeholder="Your Full Name"
                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-4 focus:ring-luxury-gold/5 focus:border-luxury-gold/50 transition-all"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-luxury-gold transition-colors">
                    <Phone size={18} />
                  </div>
                  <input 
                    type="tel"
                    value={state.userPhone}
                    onChange={(e) => setState({ ...state, userPhone: e.target.value })}
                    placeholder="WhatsApp Number"
                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-4 focus:ring-luxury-gold/5 focus:border-luxury-gold/50 transition-all"
                  />
                </div>
              </div>

              <p className="text-[10px] text-[var(--muted)] text-center font-medium leading-relaxed px-4">
                By submitting, you agree to share these details with the selected labour contractors for quotation purposes.
              </p>
            </div>
          </motion.div>
        );
      case 10:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-12"
          >
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute -top-2 -right-2 w-10 h-10 bg-luxury-gold rounded-2xl flex items-center justify-center text-white shadow-lg rotate-12"
              >
                <Sparkles size={20} />
              </motion.div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[var(--ink)] tracking-tight">RFQ Published!</h2>
              <p className="text-[var(--muted)] font-semibold text-sm">Your labour requirement is now live.</p>
            </div>

            <div className="bg-luxury-dark rounded-[32px] p-8 space-y-6 shadow-2xl shadow-orange-500/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-luxury-gold/20 transition-colors" />
              
              <div className="space-y-2 relative">
                <p className="text-[10px] font-black text-luxury-gold uppercase tracking-[0.3em]">Reference Number</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-black text-white tracking-wider">{state.rfqNumber}</span>
                  <button className="p-2 bg-[var(--paper)]/10 hover:bg-[var(--paper)]/20 rounded-xl text-white transition-colors">
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4 relative">
                <div className="text-left space-y-1">
                  <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Status</p>
                  <p className="text-xs font-black text-green-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Active
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Routing</p>
                  <p className="text-xs font-black text-white">
                    {state.selectionMode === 'manual' ? `${state.selectedContractorIds.length} Contractors` : 'Auto-Matching'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)]">
                <div className="w-10 h-10 bg-[var(--paper)] rounded-xl flex items-center justify-center text-luxury-gold shadow-sm">
                  <MessageSquare size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-[var(--ink)]">WhatsApp Updates</p>
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-tight">You'll receive quotes on WhatsApp</p>
                </div>
              </div>
            </div>

            <button
              onClick={onComplete}
              className="w-full py-5 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
            >
              Back to Dashboard
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-premium-cream z-[60] flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between bg-[var(--paper)] border-b border-[var(--line)]">
        <button 
          onClick={step === 1 ? onBack : () => setStep(step - 1)}
          className="p-3 bg-[var(--bg)] rounded-2xl text-[var(--ink)] border border-[var(--line)] active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 mx-4">
          <RFQStepBar step={step} totalSteps={9} />
        </div>
        <div className="w-11" />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
          {renderStep()}
      </div>

      {/* Footer */}
      {step < 10 && (
        <div className="p-6 bg-[var(--paper)] border-t border-[var(--line)]">
          <div className="max-w-4xl mx-auto">
            <button
              disabled={!isStepValid()}
              onClick={() => step === 9 ? handleFinalSubmit() : setStep(step + 1)}
              className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all uppercase tracking-widest ${
                isStepValid() 
                  ? 'bg-luxury-gold text-[var(--ink)] shadow-xl shadow-luxury-gold/20 active:scale-[0.98]' 
                  : 'bg-[var(--paper)] text-[var(--muted)] cursor-not-allowed shadow-none'
              }`}
            >
              {step === 9 ? 'Publish RFQ' : 'Next Section'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
