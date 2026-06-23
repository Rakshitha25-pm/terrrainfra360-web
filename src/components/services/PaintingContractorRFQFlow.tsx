import React, { useState, useEffect } from 'react';
import { submitServiceRFQ } from '../../lib/serviceRfq';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Paintbrush, 
  Building2, 
  Scaling, 
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
  User,
  Phone,
  Copy,
  Sparkles,
  Layers,
  Palette,
  Maximize2,
  Layout
} from 'lucide-react';
import { PaintingContractor } from '../rfq-types';
import { MOCK_PAINTING_CONTRACTORS } from '../rfq-constants';
import { RFQStepBar } from './RFQStepBar';

interface PaintingContractorRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface PaintingState {
  // Step 1: Project Basics
  projectType: string;
  requirementType: string;
  // Step 2: Scope & Scale
  paintingAreas: string[];
  propertySize: string;
  roomsCount: string;
  floorsCount: string;
  // Step 3: Surface Condition
  wallCondition: string;
  preparationWork: string[];
  // Step 4: Paint Type & Finish
  paintType: string;
  finishPreference: string;
  // Step 5: Execution Model & Add-ons
  executionModel: string;
  materialResponsibility: string;
  preferredBrands: string[];
  addOnServices: string[];
  // Step 6: Site Conditions
  propertyStatus: string;
  furnitureStatus: string;
  // Step 7: Timeline & Final Input
  startUrgency: string;
  completionSpeed: string;
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

const ContractorCard: React.FC<{ contractor: PaintingContractor, selected: boolean, onToggle: () => void }> = ({ contractor, selected, onToggle }) => (
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

      <div>
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Brands</p>
        <div className="flex flex-wrap gap-1">
          {contractor.brands.map((b, i) => (
            <span key={i} className="px-2 py-0.5 bg-luxury-gold/5 border border-luxury-gold/10 rounded-md text-[9px] font-bold text-luxury-gold">
              {b}
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

      <div className="flex gap-2 pt-2">
        {contractor.portfolioImages.slice(0, 2).map((img, i) => (
          <div key={i} className="flex-1 h-16 rounded-xl overflow-hidden border border-[var(--line)]">
            <img src={img} alt="Portfolio" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        ))}
      </div>
    </div>

    {selected && (
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-luxury-gold rounded-full flex items-center justify-center text-white shadow-lg">
        <Check size={14} strokeWidth={3} />
      </div>
    )}
  </div>
);

export const PaintingContractorRFQFlow: React.FC<PaintingContractorRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<PaintingState>({
    projectType: '',
    requirementType: '',
    paintingAreas: [],
    propertySize: '',
    roomsCount: '',
    floorsCount: '',
    wallCondition: '',
    preparationWork: [],
    paintType: '',
    finishPreference: '',
    executionModel: '',
    materialResponsibility: '',
    preferredBrands: [],
    addOnServices: [],
    propertyStatus: '',
    furnitureStatus: '',
    startUrgency: '',
    completionSpeed: '',
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
    if (step === 1) return state.projectType !== '' && state.requirementType !== '';
    if (step === 2) return state.paintingAreas.length > 0 && state.propertySize !== '';
    if (step === 3) return state.wallCondition !== '' && state.preparationWork.length > 0;
    if (step === 4) return state.paintType !== '' && state.finishPreference !== '';
    if (step === 5) return state.executionModel !== '' && state.materialResponsibility !== '';
    if (step === 6) return state.propertyStatus !== '' && state.furnitureStatus !== '';
    if (step === 7) return state.startUrgency !== '';
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
    return `TI360-PNT-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Painting', { ...state, rfqNumber: rfqNum });
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
                Identify the project type and painting requirement.
              </p>
            </div>

            <SectionWrapper title="Project Context" icon={Building2} subtitle="Type & Requirement">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Project Type</p>
                  <SegmentedControl 
                    options={['Apartment', 'Villa', 'Independent House', 'Commercial', 'Renovation']} 
                    selected={state.projectType} 
                    onChange={(val) => setState({ ...state, projectType: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Painting Requirement</p>
                  <div className="grid grid-cols-1 gap-2">
                    {['New Painting', 'Repainting', 'Touch-up Work'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setState({ ...state, requirementType: type })}
                        className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                          state.requirementType === type
                            ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
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
                Scope & <span className="text-luxury-gold">Scale.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the areas and overall size of the work.
              </p>
            </div>

            <SectionWrapper title="Painting Areas" icon={Maximize2} subtitle="Multi-select scope">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Interior Walls', 'Exterior Walls', 'Ceilings', 
                  'Doors & Windows', 'Grills', 'Full Property'
                ].map((area) => (
                  <button
                    key={area}
                    onClick={() => {
                      const newAreas = state.paintingAreas.includes(area)
                        ? state.paintingAreas.filter(a => a !== area)
                        : [...state.paintingAreas, area];
                      setState({ ...state, paintingAreas: newAreas });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.paintingAreas.includes(area)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Property Scale" icon={Scaling} subtitle="Size & Quantity">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Property Size</p>
                  <SegmentedControl 
                    options={['< 1000 sqft', '1000-2000 sqft', '2000-4000 sqft', '4000+ sqft']} 
                    selected={state.propertySize} 
                    onChange={(val) => setState({ ...state, propertySize: val })} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Rooms</p>
                    <SegmentedControl 
                      options={['1BHK', '2BHK', '3BHK', '4BHK+']} 
                      selected={state.roomsCount} 
                      onChange={(val) => setState({ ...state, roomsCount: val })} 
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Floors</p>
                    <SegmentedControl 
                      options={['G Only', 'G+1', 'G+2', 'G+3+']} 
                      selected={state.floorsCount} 
                      onChange={(val) => setState({ ...state, floorsCount: val })} 
                    />
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
                Surface <span className="text-luxury-gold">Condition.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Wall health and required preparation work.
              </p>
            </div>

            <SectionWrapper title="Wall Condition" icon={ClipboardCheck} subtitle="Major cost driver">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'New Walls (Fresh)', 
                  'Good Condition (Repaint)', 
                  'Minor Cracks / Flaking', 
                  'Major Damage / Dampness'
                ].map((condition) => (
                  <button
                    key={condition}
                    onClick={() => setState({ ...state, wallCondition: condition })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.wallCondition === condition
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Preparation Work" icon={Hammer} subtitle="Required services">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Putty Work', 'Primer Coat', 'Crack Filling', 
                  'Sanding', 'Full Prep', 'Damp Proofing'
                ].map((prep) => (
                  <button
                    key={prep}
                    onClick={() => {
                      const newPrep = state.preparationWork.includes(prep)
                        ? state.preparationWork.filter(p => p !== prep)
                        : [...state.preparationWork, prep];
                      setState({ ...state, preparationWork: newPrep });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.preparationWork.includes(prep)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {prep}
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
                Paint & <span className="text-luxury-gold">Finish.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Select your preferred material and final look.
              </p>
            </div>

            <SectionWrapper title="Paint Type" icon={Palette} subtitle="Material selection">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Distemper (Economy)', 
                  'Emulsion (Standard)', 
                  'Premium Paint (Luxury)', 
                  'Texture Paint', 
                  'Exterior Coatings'
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => setState({ ...state, paintType: type })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.paintType === type
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Finish Preference" icon={Sparkles} subtitle="The final look">
              <SegmentedControl 
                options={['Matte', 'Satin', 'Gloss', 'Textured']} 
                selected={state.finishPreference} 
                onChange={(val) => setState({ ...state, finishPreference: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Execution <span className="text-luxury-gold">Model.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define responsibility and add-on services.
              </p>
            </div>

            <SectionWrapper title="Scope Model" icon={ClipboardCheck} subtitle="Responsibility">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Execution Type</p>
                  <SegmentedControl 
                    options={['Labour Only', 'Labour + Material', 'Turnkey']} 
                    selected={state.executionModel} 
                    onChange={(val) => setState({ ...state, executionModel: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Material Provided By</p>
                  <SegmentedControl 
                    options={['Client', 'Contractor']} 
                    selected={state.materialResponsibility} 
                    onChange={(val) => setState({ ...state, materialResponsibility: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Preferred Brands" icon={ShieldCheck} subtitle="Multi-select brands">
              <div className="grid grid-cols-2 gap-2">
                {['Asian Paints', 'Berger', 'Dulux', 'Nippon', 'Kansai Nerolac', 'Jotun'].map((brand) => (
                  <button
                    key={brand}
                    onClick={() => {
                      const newBrands = state.preferredBrands.includes(brand)
                        ? state.preferredBrands.filter(b => b !== brand)
                        : [...state.preferredBrands, brand];
                      setState({ ...state, preferredBrands: newBrands });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.preferredBrands.includes(brand)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Add-on Services" icon={Sparkles} subtitle="Optional extras">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Waterproofing', 'Texture Design', 'Stencil Work', 
                  'Wood Polish', 'Metal Painting', 'Exterior Coatings'
                ].map((service) => (
                  <button
                    key={service}
                    onClick={() => {
                      const newServices = state.addOnServices.includes(service)
                        ? state.addOnServices.filter(s => s !== service)
                        : [...state.addOnServices, service];
                      setState({ ...state, addOnServices: newServices });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.addOnServices.includes(service)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {service}
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
                Site <span className="text-luxury-gold">Conditions.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Property status and furniture readiness.
              </p>
            </div>

            <SectionWrapper title="Property Status" icon={MapPin} subtitle="Execution context">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Vacant (Empty)', 
                  'Occupied (Living there)', 
                  'Under Construction'
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => setState({ ...state, propertyStatus: status })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.propertyStatus === status
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Furniture Status" icon={Truck} subtitle="Preparation level">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Furniture Fully Cleared', 
                  'Needs Shifting / Covering', 
                  'Fully Furnished'
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => setState({ ...state, furnitureStatus: status })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.furnitureStatus === status
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {status}
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
                    selected={state.startUrgency} 
                    onChange={(val) => setState({ ...state, startUrgency: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Completion Speed</p>
                  <SegmentedControl 
                    options={['Standard', 'Express (Fast)', 'Flexible']} 
                    selected={state.completionSpeed} 
                    onChange={(val) => setState({ ...state, completionSpeed: val })} 
                  />
                </div>
              </div>
            </SectionWrapper>

            <SectionWrapper title="Final Input" icon={MessageSquare} subtitle="Optional instructions">
              <textarea 
                value={state.specificInstructions}
                onChange={(e) => setState({ ...state, specificInstructions: e.target.value })}
                placeholder="Color preferences, design ideas, site constraints, or special instructions..."
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
                Choose your painting expert or let us suggest the best fit.
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
                  <Paintbrush size={24} />
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
                    <h3 className="text-[11px] font-black text-[var(--ink)] uppercase tracking-wider">Painting Experts</h3>
                    <span className="text-[10px] font-bold text-[var(--muted)]">{state.selectedContractorIds.length} Selected</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {MOCK_PAINTING_CONTRACTORS.map((contractor) => (
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
                      Our system will analyze your surface condition, paint type, and execution model to route your RFQ to the most qualified painting contractor in our network.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-[var(--paper)]/5 rounded-2xl border border-white/10">
                      <ShieldCheck size={20} className="text-luxury-gold mx-auto mb-2" />
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">Premium Finish</p>
                    </div>
                    <div className="p-4 bg-[var(--paper)]/5 rounded-2xl border border-white/10">
                      <Palette size={20} className="text-luxury-gold mx-auto mb-2" />
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">Color Experts</p>
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
                <Paintbrush className="w-10 h-10 text-luxury-gold" />
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">Review & Submit</h2>
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your painting requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Project Basics" 
                icon={Building2} 
                items={[
                  { label: 'Type', value: state.projectType },
                  { label: 'Requirement', value: state.requirementType }
                ]}
              />

              <ReviewSection 
                title="Scope & Scale" 
                icon={Maximize2} 
                items={[
                  { label: 'Areas', value: state.paintingAreas },
                  { label: 'Size', value: state.propertySize },
                  { label: 'Rooms', value: state.roomsCount },
                  { label: 'Floors', value: state.floorsCount }
                ]}
              />

              <ReviewSection 
                title="Condition & Finish" 
                icon={Palette} 
                items={[
                  { label: 'Condition', value: state.wallCondition },
                  { label: 'Paint Type', value: state.paintType },
                  { label: 'Finish', value: state.finishPreference }
                ]}
              />

              <ReviewSection 
                title="Execution" 
                icon={ClipboardCheck} 
                items={[
                  { label: 'Model', value: state.executionModel },
                  { label: 'Materials', value: state.materialResponsibility },
                  { label: 'Brands', value: state.preferredBrands }
                ]}
              />

              <ReviewSection 
                title="Site & Timeline" 
                icon={Clock} 
                items={[
                  { label: 'Status', value: state.propertyStatus },
                  { label: 'Furniture', value: state.furnitureStatus },
                  { label: 'Start', value: state.startUrgency }
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
                By submitting, you agree to share these details with the selected painting contractors for quotation purposes.
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
              <p className="text-[var(--muted)] font-semibold text-sm">Your painting requirement is now live.</p>
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
