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
  Search
} from 'lucide-react';
import { FlooringContractor } from '../rfq-types';
import { MOCK_FLOORING_CONTRACTORS } from '../rfq-constants';
import { RFQStepBar } from './RFQStepBar';

interface FlooringContractorRFQProps {
  onBack: () => void;
  onComplete: (data: any) => void;
}

interface FlooringState {
  requirementType: string;
  propertyType: string;
  currentStage: string;
  areas: string[];
  uniformFlooring: boolean | null;
  materialCategory: string;
  intent: string;
  finishTier: string;
  selectedBrands: string[];
  stonePreference: string;
  coreScope: string[];
  additionalScope: string[];
  layoutPattern: string;
  formatSize: string;
  skirtingPreference: string;
  performancePriorities: string[];
  responsibilityModel: string;
  materialProvider: string;
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

const ContractorCard: React.FC<{ contractor: FlooringContractor, selected: boolean, onToggle: () => void }> = ({ contractor, selected, onToggle }) => (
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

export const FlooringContractorRFQ: React.FC<FlooringContractorRFQProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<FlooringState>({
    requirementType: 'Complete Flooring Work',
    propertyType: '',
    currentStage: '',
    areas: [],
    uniformFlooring: null,
    materialCategory: '',
    intent: '',
    finishTier: 'classic',
    selectedBrands: [],
    stonePreference: '',
    coreScope: [],
    additionalScope: [],
    layoutPattern: '',
    formatSize: '',
    skirtingPreference: '',
    performancePriorities: [],
    responsibilityModel: 'Complete Supply & Installation',
    materialProvider: '',
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
                Flooring <span className="text-luxury-gold">Requirement.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Choose the type of flooring work you need.
              </p>
            </div>

            <SectionWrapper title="Work Type" icon={Layers} subtitle="Select requirement">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'Complete Flooring Work', desc: 'Full scope from base prep to final handover. (Recommended for new projects)', icon: Sparkles, recommended: true },
                  { id: 'Partial Area Flooring', desc: 'Flooring for specific rooms or sections only.', icon: LayoutGrid },
                  { id: 'Replacement of Existing', desc: 'Remove old flooring and install new ones.', icon: Trash2 },
                  { id: 'Polishing / Restoration', desc: 'Revive existing marble, granite or wood.', icon: Palette },
                  { id: 'Repair / Rectification', desc: 'Fixing cracks, loose tiles, or slope issues.', icon: Construction }
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
                Help us understand the context of your site.
              </p>
            </div>

            <SectionWrapper title="Property Details" icon={Building2} subtitle="Type & Stage">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Property Type</p>
                  <SegmentedControl 
                    options={['Apartment', 'House / Villa', 'Office', 'Retail', 'Commercial']} 
                    selected={state.propertyType} 
                    onChange={(val) => setState({ ...state, propertyType: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Current Site Stage</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'bare', title: 'Bare Slab Stage', desc: 'RCC slab visible, needs full levelling.' },
                      { id: 'screed', title: 'Screed-Ready Stage', desc: 'Base levelling done, ready for material.' },
                      { id: 'finishing', title: 'Under-Construction Finishing', desc: 'Walls done, flooring is the next step.' },
                      { id: 'removal', title: 'Existing Flooring Removal', desc: 'Old tiles/stone need to be hacked first.' },
                      { id: 'occupied', title: 'Occupied Renovation', desc: 'Furniture present, phased work needed.' }
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
                Which zones need flooring?
              </p>
            </div>

            <SectionWrapper title="Zones" icon={LayoutGrid} subtitle="Select all that apply">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Living Room', 'Bedrooms', 'Kitchen', 'Dining', 'Bathrooms', 
                  'Balcony', 'Staircase', 'Terrace', 'Utility', 'Parking', 
                  'Office Area', 'Full Property'
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

            {state.areas.length > 1 && (
              <SectionWrapper title="Consistency" icon={Scaling} subtitle="Material uniform look">
                <div className="flex gap-3">
                  <button
                    onClick={() => setState({ ...state, uniformFlooring: true })}
                    className={`flex-1 p-4 rounded-2xl border transition-all text-center ${
                      state.uniformFlooring === true ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold' : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    <p className="text-[11px] font-black">Uniform Look</p>
                  </button>
                  <button
                    onClick={() => setState({ ...state, uniformFlooring: false })}
                    className={`flex-1 p-4 rounded-2xl border transition-all text-center ${
                      state.uniformFlooring === false ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold' : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    <p className="text-[11px] font-black">Mixed Finishes</p>
                  </button>
                </div>
              </SectionWrapper>
            )}
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Material <span className="text-luxury-gold">Category.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Choose your preferred category or get suggestions.
              </p>
            </div>

            <SectionWrapper title="Materials" icon={Layers} subtitle="Select category">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Vitrified Tiles', 'Ceramic Tiles', 'Marble', 'Granite', 
                  'Wooden Flooring', 'Laminate', 'SPC / Vinyl', 'Kota Stone', 
                  'Terrazzo', 'Concrete Finish', 'Outdoor Pavers', 'Need Suggestion'
                ].map((mat) => (
                  <button
                    key={mat}
                    onClick={() => setState({ ...state, materialCategory: mat })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.materialCategory === mat
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            {state.materialCategory === 'Need Suggestion' && (
              <SectionWrapper title="Goal" icon={Sparkles} subtitle="What is your priority?">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'maintenance', label: 'Easy Cleaning', icon: Sparkles },
                    { id: 'premium', label: 'Premium Look', icon: Star },
                    { id: 'natural', label: 'Natural Stone', icon: Layers },
                    { id: 'budget', label: 'Budget Friendly', icon: ArrowUpRight },
                    { id: 'warm', label: 'Warm Wood', icon: Home },
                    { id: 'rental', label: 'Rental Focused', icon: UserCheck }
                  ].map((intent) => (
                    <button
                      key={intent.id}
                      onClick={() => setState({ ...state, intent: intent.id })}
                      className={`p-3 rounded-xl border flex items-center gap-2 text-[10px] font-bold transition-all ${
                        state.intent === intent.id ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold' : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                      }`}
                    >
                      <intent.icon size={14} />
                      {intent.label}
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
                Quality <span className="text-luxury-gold">Tier.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the quality range for your {state.materialCategory}.
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
              {state.materialCategory.includes('Tiles') && [
                { name: 'Kajaria', tags: ['Recommended'] },
                { name: 'Somany', tags: ['Durable'] },
                { name: 'Simpolo', tags: ['Luxury'] },
                { name: 'Johnson', tags: ['Budget'] }
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
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Core <span className="text-luxury-gold">Scope.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                What should the contractor handle?
              </p>
            </div>

            <SectionWrapper title="Scope" icon={ClipboardCheck} subtitle="What's included?">
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'levelling', title: 'Base Levelling / Screeding', desc: 'Preparing the floor level before laying.' },
                  { id: 'adhesive', title: 'Adhesive / Mortar Application', desc: 'Main bonding material for tiles/stone.' },
                  { id: 'laying', title: 'Laying & Joint Alignment', desc: 'Precision placement and spacing.' },
                  { id: 'skirting', title: 'Skirting Installation', desc: 'Wall-floor junction finish.' },
                  { id: 'grouting', title: 'Grout Filling / Epoxy', desc: 'Filling joints for hygiene and look.' },
                  { id: 'polishing', title: 'Polishing / Sealing', desc: 'Final finish for natural stone.' }
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
      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Layout & <span className="text-luxury-gold">Design.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                How should the material be laid?
              </p>
            </div>

            <SectionWrapper title="Patterns" icon={Layout} subtitle="Select style">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'straight', title: 'Straight Lay', icon: Maximize },
                  { id: 'staggered', title: 'Staggered', icon: Layers },
                  { id: 'diagonal', title: 'Diagonal', icon: ArrowUpRight },
                  { id: 'herringbone', title: 'Herringbone', icon: LayoutGrid },
                  { id: 'chevron', title: 'Chevron', icon: LayoutGrid },
                  { id: 'bookmatch', title: 'Book-Matched', icon: Sparkles }
                ].map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => setState({ ...state, layoutPattern: pattern.id })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center flex flex-col items-center gap-2 ${
                      state.layoutPattern === pattern.id
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    <pattern.icon size={18} />
                    {pattern.title}
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
                Practical <span className="text-luxury-gold">Needs.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                What performance features are most important?
              </p>
            </div>

            <SectionWrapper title="Performance" icon={ShieldCheck} subtitle="Priorities">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cleaning', label: 'Easy Cleaning', icon: Sparkles },
                  { id: 'antiskid', label: 'Anti-Skid Safety', icon: ShieldCheck },
                  { id: 'maintenance', label: 'Low Maintenance', icon: Clock },
                  { id: 'stain', label: 'Stain Resistance', icon: Droplets },
                  { id: 'pet', label: 'Pet Friendly', icon: Home },
                  { id: 'water', label: 'Water Resistance', icon: Droplets }
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
                Choose how you want to engage with the contractor.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'Labour Only', desc: 'You provide all materials; contractor provides skilled labour.', icon: User },
                { id: 'Labour + Material', desc: 'Contractor sources materials and provides labour.', icon: Truck },
                { id: 'Complete Supply & Installation', desc: 'End-to-end service including planning, sourcing, and setup.', icon: Sparkles, recommended: true }
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
                {['Vacant Site', 'Under Construction', 'Occupied', 'Furnished', 'Phased Handover'].map(cond => (
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
                Choose your flooring expert.
              </p>
            </div>

            <div className="space-y-4">
              {MOCK_FLOORING_CONTRACTORS.map((contractor) => (
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
              <Layers size={20} />
            </div>
            <span className="font-black text-[var(--ink)] tracking-tight">Flooring RFQ</span>
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
          className="flex-2 flex-grow py-4 rounded-2xl font-black text-sm bg-luxury-gold text-white shadow-xl shadow-luxury-gold/20 active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-2"
        >
          {step === totalSteps ? 'Submit RFQ' : 'Next'}
        </button>
      </div>
    </div>
    </>
  );
};
