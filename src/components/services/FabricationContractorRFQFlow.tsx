import React, { useState, useEffect } from 'react';
import { submitServiceRFQ } from '../../lib/serviceRfq';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Hammer, 
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
  Copy,
  Sparkles,
  Layers,
  Layout,
  Settings,
  Activity,
  Maximize2,
  Box,
  Palette,
  Ruler
} from 'lucide-react';
import { FabricationContractor } from '../rfq-types';
import { MOCK_FABRICATION_CONTRACTORS } from '../rfq-constants';
import { RFQStepBar } from './RFQStepBar';

interface FabricationContractorRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

type FabricationCategory = 'Steel / MS Fabrication' | 'Windows & Aluminium Works' | 'ACP & Facade Works' | 'Mixed Fabrication' | 'Not Sure' | '';

interface FabricationState {
  // Common Screen 1
  category: FabricationCategory;
  projectType: string;
  workType: string;

  // Steel / MS Branch
  steelItems: string[];
  steelMaterial: string;
  steelDesignStyle: string;
  steelFinish: string;
  steelQuantity: string;
  steelScope: string[];
  
  // Windows & Aluminium Branch
  winSystemType: string[];
  winFrameMaterial: string;
  winGlassSpec: string;
  winQuantity: string;
  winFeatures: string[];
  winScope: string[];

  // ACP & Facade Branch
  facadeType: string[];
  facadeBuildingType: string;
  facadeAreaHeight: string;
  facadeMaterialFinish: string;
  facadeSupportStructure: string;
  facadeScope: string[];

  // Mixed / Not Sure Branch
  mixedItems: string;
  mixedApproxRequirement: string;
  mixedSiteVisitNeeded: boolean;
  mixedRecommendationPreference: string;

  // Common Final Steps
  siteConditions: string;
  timeline: string;
  specificInstructions: string;
  
  // Selection
  selectionMode: 'manual' | 'suggestion' | '';
  selectedContractorIds: string[];
  
  // User Info
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

const ContractorCard: React.FC<{ contractor: FabricationContractor, selected: boolean, onToggle: () => void }> = ({ contractor, selected, onToggle }) => (
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

export const FabricationContractorRFQFlow: React.FC<FabricationContractorRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<FabricationState>({
    category: '',
    projectType: '',
    workType: '',
    steelItems: [],
    steelMaterial: '',
    steelDesignStyle: '',
    steelFinish: '',
    steelQuantity: '',
    steelScope: [],
    winSystemType: [],
    winFrameMaterial: '',
    winGlassSpec: '',
    winQuantity: '',
    winFeatures: [],
    winScope: [],
    facadeType: [],
    facadeBuildingType: '',
    facadeAreaHeight: '',
    facadeMaterialFinish: '',
    facadeSupportStructure: '',
    facadeScope: [],
    mixedItems: '',
    mixedApproxRequirement: '',
    mixedSiteVisitNeeded: false,
    mixedRecommendationPreference: '',
    siteConditions: '',
    timeline: '',
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
    if (step === 1) return state.category !== '' && state.projectType !== '' && state.workType !== '';
    
    // Branching Logic
    if (state.category === 'Steel / MS Fabrication') {
      if (step === 2) return state.steelItems.length > 0;
      if (step === 3) return state.steelMaterial !== '' && state.steelDesignStyle !== '';
      if (step === 4) return state.steelFinish !== '' && state.steelQuantity !== '';
    } else if (state.category === 'Windows & Aluminium Works') {
      if (step === 2) return state.winSystemType.length > 0;
      if (step === 3) return state.winFrameMaterial !== '' && state.winGlassSpec !== '';
      if (step === 4) return state.winQuantity !== '' && state.winScope.length > 0;
    } else if (state.category === 'ACP & Facade Works') {
      if (step === 2) return state.facadeType.length > 0;
      if (step === 3) return state.facadeBuildingType !== '' && state.facadeAreaHeight !== '';
      if (step === 4) return state.facadeMaterialFinish !== '' && state.facadeScope.length > 0;
    } else {
      // Mixed / Not Sure
      if (step === 2) return state.mixedItems.trim() !== '';
      if (step === 3) return state.mixedApproxRequirement !== '';
    }

    // Common Final Steps
    const finalStepOffset = state.category === 'Mixed Fabrication' || state.category === 'Not Sure' ? 4 : 5;
    if (step === finalStepOffset) return state.siteConditions !== '' && state.timeline !== '';
    if (step === finalStepOffset + 1) {
      if (state.selectionMode === 'suggestion') return true;
      if (state.selectionMode === 'manual') return state.selectedContractorIds.length > 0;
      return false;
    }
    if (step === finalStepOffset + 2) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }

    return true;
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-FAB-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Fabrication', { ...state, rfqNumber: rfqNum });
    setStep(step + 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Fabrication <span className="text-luxury-gold">Category.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Select the type of fabrication work needed.
              </p>
            </div>

            <SectionWrapper title="Work Context" icon={Hammer} subtitle="Category & Type">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Fabrication Category</p>
                  <div className="grid grid-cols-1 gap-2">
                    {['Steel / MS Fabrication', 'Windows & Aluminium Works', 'ACP & Facade Works', 'Mixed Fabrication', 'Not Sure'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setState({ ...state, category: cat as FabricationCategory })}
                        className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                          state.category === cat
                            ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Project Type</p>
                  <SegmentedControl 
                    options={['Residential', 'Commercial', 'Villa', 'Apartment', 'Renovation', 'Industrial-lite']} 
                    selected={state.projectType} 
                    onChange={(val) => setState({ ...state, projectType: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Work Type</p>
                  <SegmentedControl 
                    options={['New Work', 'Replacement', 'Repair', 'Expansion']} 
                    selected={state.workType} 
                    onChange={(val) => setState({ ...state, workType: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );

      // --- Steel / MS Branch ---
      case 2:
        if (state.category === 'Steel / MS Fabrication') {
          return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
              <div className="col-span-3 space-y-2">
                <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                  Steel <span className="text-luxury-gold">Items.</span>
                </h2>
                <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">Select the items to be fabricated.</p>
              </div>
              <SectionWrapper title="Fabrication Items" icon={Layers} subtitle="Multi-select">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Gates', 'Grills', 'Railings', 'Staircases', 
                    'Pergolas', 'Sheds', 'Structural Steel', 
                    'Compound Gates', 'Custom Metal Works'
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        const newItems = state.steelItems.includes(item)
                          ? state.steelItems.filter(i => i !== item)
                          : [...state.steelItems, item];
                        setState({ ...state, steelItems: newItems });
                      }}
                      className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                        state.steelItems.includes(item)
                          ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                          : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </SectionWrapper>
            </motion.div>
          );
        }
        if (state.category === 'Windows & Aluminium Works') {
          return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
              <div className="col-span-3 space-y-2">
                <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                  System <span className="text-luxury-gold">Type.</span>
                </h2>
                <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">Select the window/aluminium systems needed.</p>
              </div>
              <SectionWrapper title="System Selection" icon={Layout} subtitle="Multi-select">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Windows', 'Sliding Doors', 'Balcony Enclosures', 
                    'Glass Partitions', 'Casement Doors', 'Ventilators'
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        const newItems = state.winSystemType.includes(item)
                          ? state.winSystemType.filter(i => i !== item)
                          : [...state.winSystemType, item];
                        setState({ ...state, winSystemType: newItems });
                      }}
                      className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                        state.winSystemType.includes(item)
                          ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                          : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </SectionWrapper>
            </motion.div>
          );
        }
        if (state.category === 'ACP & Facade Works') {
          return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
              <div className="col-span-3 space-y-2">
                <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                  Facade <span className="text-luxury-gold">Type.</span>
                </h2>
                <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">Select the facade elevation work needed.</p>
              </div>
              <SectionWrapper title="Facade Selection" icon={Maximize2} subtitle="Multi-select">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'ACP Cladding', 'Facade Elevation Work', 'Canopy Cladding', 
                    'Signage Structure', 'Glass Facade', 'Louvers'
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        const newItems = state.facadeType.includes(item)
                          ? state.facadeType.filter(i => i !== item)
                          : [...state.facadeType, item];
                        setState({ ...state, facadeType: newItems });
                      }}
                      className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                        state.facadeType.includes(item)
                          ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                          : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </SectionWrapper>
            </motion.div>
          );
        }
        // Mixed / Not Sure
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Required <span className="text-luxury-gold">Items.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">Describe what items you need fabricated.</p>
            </div>
            <SectionWrapper title="Items Description" icon={MessageSquare} subtitle="What do you need?">
              <textarea 
                value={state.mixedItems}
                onChange={(e) => setState({ ...state, mixedItems: e.target.value })}
                placeholder="E.g. I need a main gate, 3 window grills, and a small shed for the terrace..."
                className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors h-40 resize-none"
              />
            </SectionWrapper>
          </motion.div>
        );

      case 3:
        if (state.category === 'Steel / MS Fabrication') {
          return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
              <div className="col-span-3 space-y-2">
                <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                  Material & <span className="text-luxury-gold">Style.</span>
                </h2>
                <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">Define the material and design style.</p>
              </div>
              <SectionWrapper title="Specifications" icon={Settings} subtitle="Material & Design">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Material Type</p>
                    <SegmentedControl 
                      options={['Mild Steel (MS)', 'Stainless Steel (SS)', 'Cast Iron', 'Wrought Iron']} 
                      selected={state.steelMaterial} 
                      onChange={(val) => setState({ ...state, steelMaterial: val })} 
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Design Style</p>
                    <SegmentedControl 
                      options={['Modern / Minimal', 'Traditional / Ornate', 'Industrial', 'Custom Design']} 
                      selected={state.steelDesignStyle} 
                      onChange={(val) => setState({ ...state, steelDesignStyle: val })} 
                    />
                  </div>
                </div>
              </SectionWrapper>
            </motion.div>
          );
        }
        if (state.category === 'Windows & Aluminium Works') {
          return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
              <div className="col-span-3 space-y-2">
                <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                  Frame & <span className="text-luxury-gold">Glass.</span>
                </h2>
                <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">Select frame material and glass specifications.</p>
              </div>
              <SectionWrapper title="Technical Specs" icon={Settings} subtitle="Frame & Glass">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Frame Material</p>
                    <SegmentedControl 
                      options={['Aluminium (Standard)', 'Aluminium (Thermal Break)', 'UPVC', 'Slim Profile']} 
                      selected={state.winFrameMaterial} 
                      onChange={(val) => setState({ ...state, winFrameMaterial: val })} 
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Glass Type</p>
                    <SegmentedControl 
                      options={['Single Glazed', 'Double Glazed (DGU)', 'Toughened', 'Reflective / Tinted']} 
                      selected={state.winGlassSpec} 
                      onChange={(val) => setState({ ...state, winGlassSpec: val })} 
                    />
                  </div>
                </div>
              </SectionWrapper>
            </motion.div>
          );
        }
        if (state.category === 'ACP & Facade Works') {
          return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
              <div className="col-span-3 space-y-2">
                <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                  Building & <span className="text-luxury-gold">Scale.</span>
                </h2>
                <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">Define building type and coverage area.</p>
              </div>
              <SectionWrapper title="Project Scale" icon={Scaling} subtitle="Building & Area">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Building Type</p>
                    <SegmentedControl 
                      options={['Single Storey', 'Low Rise (G+3)', 'High Rise', 'Commercial Complex']} 
                      selected={state.facadeBuildingType} 
                      onChange={(val) => setState({ ...state, facadeBuildingType: val })} 
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Coverage Area / Height</p>
                    <SegmentedControl 
                      options={['< 500 sqft', '500-2000 sqft', '2000-5000 sqft', '5000+ sqft']} 
                      selected={state.facadeAreaHeight} 
                      onChange={(val) => setState({ ...state, facadeAreaHeight: val })} 
                    />
                  </div>
                </div>
              </SectionWrapper>
            </motion.div>
          );
        }
        // Mixed / Not Sure
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Approx <span className="text-luxury-gold">Requirement.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">Scale and support preferences.</p>
            </div>
            <SectionWrapper title="Scale & Support" icon={Scaling} subtitle="Requirement Details">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Approximate Requirement</p>
                  <SegmentedControl 
                    options={['Minor Repair', 'Small Project', 'Medium Project', 'Large / Full Site']} 
                    selected={state.mixedApproxRequirement} 
                    onChange={(val) => setState({ ...state, mixedApproxRequirement: val })} 
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)]">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-[var(--ink)]">Site Visit Needed?</p>
                    <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-tight">Contractor to measure on-site</p>
                  </div>
                  <button 
                    onClick={() => setState({ ...state, mixedSiteVisitNeeded: !state.mixedSiteVisitNeeded })}
                    className={`w-12 h-6 rounded-full transition-all relative ${state.mixedSiteVisitNeeded ? 'bg-luxury-gold' : 'bg-[var(--line)]'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-[var(--paper)] rounded-full transition-all ${state.mixedSiteVisitNeeded ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Recommendation Preference</p>
                  <SegmentedControl 
                    options={['Expert Suggestion', 'I know what I want', 'Need Design Help']} 
                    selected={state.mixedRecommendationPreference} 
                    onChange={(val) => setState({ ...state, mixedRecommendationPreference: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );

      case 4:
        if (state.category === 'Steel / MS Fabrication') {
          return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
              <div className="col-span-3 space-y-2">
                <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                  Finish & <span className="text-luxury-gold">Quantity.</span>
                </h2>
                <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">Define finishing and approximate quantity.</p>
              </div>
              <SectionWrapper title="Final Specs" icon={Palette} subtitle="Finish & Quantity">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Finishing Type</p>
                    <SegmentedControl 
                      options={['Primer Only', 'Enamel Paint', 'Powder Coated', 'Galvanized']} 
                      selected={state.steelFinish} 
                      onChange={(val) => setState({ ...state, steelFinish: val })} 
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Approximate Quantity</p>
                    <SegmentedControl 
                      options={['1-2 Items', '3-5 Items', 'Full Property', 'By Weight (Kgs)']} 
                      selected={state.steelQuantity} 
                      onChange={(val) => setState({ ...state, steelQuantity: val })} 
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Installation Scope</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['Fabrication Only', 'Installation Included', 'Transport Included', 'Painting Included'].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            const newScope = state.steelScope.includes(s)
                              ? state.steelScope.filter(i => i !== s)
                              : [...state.steelScope, s];
                            setState({ ...state, steelScope: newScope });
                          }}
                          className={`p-3 rounded-xl text-[11px] font-bold border transition-all ${
                            state.steelScope.includes(s)
                              ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                              : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionWrapper>
            </motion.div>
          );
        }
        if (state.category === 'Windows & Aluminium Works') {
          return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
              <div className="col-span-3 space-y-2">
                <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                  Quantity & <span className="text-luxury-gold">Scope.</span>
                </h2>
                <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">Define quantity and execution scope.</p>
              </div>
              <SectionWrapper title="Execution Details" icon={Ruler} subtitle="Quantity & Scope">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Quantity (Approx)</p>
                    <SegmentedControl 
                      options={['1-3 Units', '4-8 Units', 'Entire House', 'Commercial Project']} 
                      selected={state.winQuantity} 
                      onChange={(val) => setState({ ...state, winQuantity: val })} 
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Execution Scope</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['Measurement', 'Fabrication', 'Installation', 'Old Removal', 'Post-service Warranty'].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            const newScope = state.winScope.includes(s)
                              ? state.winScope.filter(i => i !== s)
                              : [...state.winScope, s];
                            setState({ ...state, winScope: newScope });
                          }}
                          className={`p-3 rounded-xl text-[11px] font-bold border transition-all ${
                            state.winScope.includes(s)
                              ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                              : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionWrapper>
            </motion.div>
          );
        }
        if (state.category === 'ACP & Facade Works') {
          return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
              <div className="col-span-3 space-y-2">
                <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                  Material & <span className="text-luxury-gold">Scope.</span>
                </h2>
                <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">Define material finish and execution scope.</p>
              </div>
              <SectionWrapper title="Facade Specs" icon={Palette} subtitle="Material & Scope">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Material Finish</p>
                    <SegmentedControl 
                      options={['Solid Color', 'Metallic', 'Wooden Finish', 'Marble Finish', 'Glass']} 
                      selected={state.facadeMaterialFinish} 
                      onChange={(val) => setState({ ...state, facadeMaterialFinish: val })} 
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Execution Scope</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['Design', 'Structural Support', 'Cladding', 'Glazing', 'Scaffolding'].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            const newScope = state.facadeScope.includes(s)
                              ? state.facadeScope.filter(i => i !== s)
                              : [...state.facadeScope, s];
                            setState({ ...state, facadeScope: newScope });
                          }}
                          className={`p-3 rounded-xl text-[11px] font-bold border transition-all ${
                            state.facadeScope.includes(s)
                              ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                              : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionWrapper>
            </motion.div>
          );
        }
        // Mixed / Not Sure Branch skips Step 4 and goes straight to common final step
        return null;

      case 5:
        // Common Final Step for Steel, Windows, Facade
        // For Mixed/Not Sure, Step 4 is the final common step
        const isMixed = state.category === 'Mixed Fabrication' || state.category === 'Not Sure';
        if (isMixed && step === 5) return null; // Handled by step 4 logic below
        
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Site & <span className="text-luxury-gold">Timeline.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">Finalize site conditions and urgency.</p>
            </div>
            <SectionWrapper title="Execution Context" icon={Clock} subtitle="Site & Timeline">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Site Conditions</p>
                  <SegmentedControl 
                    options={['Under Construction', 'Renovation', 'Occupied', 'Open Site']} 
                    selected={state.siteConditions} 
                    onChange={(val) => setState({ ...state, siteConditions: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Timeline</p>
                  <SegmentedControl 
                    options={['Immediate', 'Within 1 Week', '2-4 Weeks', 'Flexible']} 
                    selected={state.timeline} 
                    onChange={(val) => setState({ ...state, timeline: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Special Instructions</p>
                  <textarea 
                    value={state.specificInstructions}
                    onChange={(e) => setState({ ...state, specificInstructions: e.target.value })}
                    placeholder="Any specific design requirements, site access issues, or notes..."
                    className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors h-24 resize-none"
                  />
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );

      case 6:
        // This step is either Site & Timeline for Mixed, or Selection for others
        if (state.category === 'Mixed Fabrication' || state.category === 'Not Sure') {
          // Site & Timeline for Mixed
          return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
              <div className="col-span-3 space-y-2">
                <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                  Site & <span className="text-luxury-gold">Timeline.</span>
                </h2>
                <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">Finalize site conditions and urgency.</p>
              </div>
              <SectionWrapper title="Execution Context" icon={Clock} subtitle="Site & Timeline">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Site Conditions</p>
                    <SegmentedControl 
                      options={['Under Construction', 'Renovation', 'Occupied', 'Open Site']} 
                      selected={state.siteConditions} 
                      onChange={(val) => setState({ ...state, siteConditions: val })} 
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Timeline</p>
                    <SegmentedControl 
                      options={['Immediate', 'Within 1 Week', '2-4 Weeks', 'Flexible']} 
                      selected={state.timeline} 
                      onChange={(val) => setState({ ...state, timeline: val })} 
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Special Instructions</p>
                    <textarea 
                      value={state.specificInstructions}
                      onChange={(e) => setState({ ...state, specificInstructions: e.target.value })}
                      placeholder="Any specific design requirements, site access issues, or notes..."
                      className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold/50 transition-colors h-24 resize-none"
                    />
                  </div>
                </div>
              </SectionWrapper>
            </motion.div>
          );
        }
        // Selection for Steel, Windows, Facade
        return renderSelectionStep();

      case 7:
        // Selection for Mixed, or Review for others
        if (state.category === 'Mixed Fabrication' || state.category === 'Not Sure') {
          return renderSelectionStep();
        }
        return renderReviewStep();

      case 8:
        // Review for Mixed, or Success for others
        if (state.category === 'Mixed Fabrication' || state.category === 'Not Sure') {
          return renderReviewStep();
        }
        return renderSuccessStep();

      case 9:
        // Success for Mixed
        return renderSuccessStep();

      default:
        return null;
    }
  };

  const renderSelectionStep = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
      <div className="col-span-3 space-y-2">
        <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
          Contractor <span className="text-luxury-gold">Selection.</span>
        </h2>
        <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
          Choose your fabrication expert or let us suggest the best fit.
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
            <Hammer size={24} />
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
              <h3 className="text-[11px] font-black text-[var(--ink)] uppercase tracking-wider">Fabrication Experts</h3>
              <span className="text-[10px] font-bold text-[var(--muted)]">{state.selectedContractorIds.length} Selected</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {MOCK_FABRICATION_CONTRACTORS
                .filter(c => c.specialization.includes(state.category) || state.category === 'Mixed Fabrication' || state.category === 'Not Sure')
                .map((contractor) => (
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
              <h3 className="text-xl font-black text-white">Precision Matching</h3>
              <p className="text-[var(--muted)] text-xs font-medium leading-relaxed">
                Our system will analyze your {state.category} requirements, material specs, and project scale to route your RFQ to the most qualified fabrication expert.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-[var(--paper)]/5 rounded-2xl border border-white/10">
                <ShieldCheck size={20} className="text-luxury-gold mx-auto mb-2" />
                <p className="text-[9px] font-black text-white uppercase tracking-widest">Quality Assured</p>
              </div>
              <div className="p-4 bg-[var(--paper)]/5 rounded-2xl border border-white/10">
                <Activity size={20} className="text-luxury-gold mx-auto mb-2" />
                <p className="text-[9px] font-black text-white uppercase tracking-widest">Expert Vetted</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderReviewStep = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pb-32"
    >
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Hammer className="w-10 h-10 text-luxury-gold" />
        </div>
        <h2 className="text-2xl font-black text-[var(--ink)]">Review & Submit</h2>
        <p className="text-[var(--muted)] text-xs font-semibold">Verify your fabrication requirements.</p>
      </div>

      <div className="space-y-6">
        <ReviewSection 
          title="Project Basics" 
          icon={Building2} 
          items={[
            { label: 'Category', value: state.category },
            { label: 'Type', value: state.projectType },
            { label: 'Work', value: state.workType }
          ]}
        />

        {state.category === 'Steel / MS Fabrication' && (
          <ReviewSection 
            title="Steel Specs" 
            icon={Settings} 
            items={[
              { label: 'Items', value: state.steelItems },
              { label: 'Material', value: state.steelMaterial },
              { label: 'Style', value: state.steelDesignStyle },
              { label: 'Finish', value: state.steelFinish }
            ]}
          />
        )}

        {state.category === 'Windows & Aluminium Works' && (
          <ReviewSection 
            title="Window Specs" 
            icon={Layout} 
            items={[
              { label: 'Systems', value: state.winSystemType },
              { label: 'Frame', value: state.winFrameMaterial },
              { label: 'Glass', value: state.winGlassSpec },
              { label: 'Quantity', value: state.winQuantity }
            ]}
          />
        )}

        {state.category === 'ACP & Facade Works' && (
          <ReviewSection 
            title="Facade Specs" 
            icon={Maximize2} 
            items={[
              { label: 'Facade', value: state.facadeType },
              { label: 'Building', value: state.facadeBuildingType },
              { label: 'Area', value: state.facadeAreaHeight },
              { label: 'Finish', value: state.facadeMaterialFinish }
            ]}
          />
        )}

        {(state.category === 'Mixed Fabrication' || state.category === 'Not Sure') && (
          <ReviewSection 
            title="Requirement" 
            icon={MessageSquare} 
            items={[
              { label: 'Items', value: state.mixedItems },
              { label: 'Scale', value: state.mixedApproxRequirement },
              { label: 'Site Visit', value: state.mixedSiteVisitNeeded }
            ]}
          />
        )}

        <ReviewSection 
          title="Execution & Site" 
          icon={Clock} 
          items={[
            { label: 'Conditions', value: state.siteConditions },
            { label: 'Timeline', value: state.timeline }
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
          By submitting, you agree to share these details with the selected fabrication experts for quotation purposes.
        </p>
      </div>
    </motion.div>
  );

  const renderSuccessStep = () => (
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
        <p className="text-[var(--muted)] font-semibold text-sm">Your fabrication requirement is now live.</p>
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
              {state.selectionMode === 'manual' ? `${state.selectedContractorIds.length} Experts` : 'Auto-Matching'}
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

  const isFinalStep = () => {
    const isMixed = state.category === 'Mixed Fabrication' || state.category === 'Not Sure';
    if (isMixed) return step === 9;
    return step === 8;
  };

  const isReviewStep = () => {
    const isMixed = state.category === 'Mixed Fabrication' || state.category === 'Not Sure';
    if (isMixed) return step === 8;
    return step === 7;
  };

  return (
    <div className="fixed inset-0 bg-premium-cream z-[60] flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between bg-[var(--paper)] border-b border-[var(--line)]">
        <button 
          onClick={step === 1 ? onBack : prevStep}
          className="p-3 bg-[var(--bg)] rounded-2xl text-[var(--ink)] border border-[var(--line)] active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 mx-4">
          <RFQStepBar step={step} totalSteps={8} />
        </div>
        <div className="w-11" />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
          {renderStep()}
      </div>

      {/* Footer */}
      {!isFinalStep() && (
        <div className="p-6 bg-[var(--paper)] border-t border-[var(--line)]">
          <div className="max-w-4xl mx-auto">
            <button
              disabled={!isStepValid()}
              onClick={() => {
                if (isReviewStep()) {
                  handleFinalSubmit();
                } else {
                  nextStep();
                }
              }}
              className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all uppercase tracking-widest ${
                isStepValid() 
                  ? 'bg-luxury-gold text-[var(--ink)] shadow-xl shadow-luxury-gold/20 active:scale-[0.98]' 
                  : 'bg-[var(--paper)] text-[var(--muted)] cursor-not-allowed shadow-none'
              }`}
            >
              {isReviewStep() ? 'Publish RFQ' : 'Next Section'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
