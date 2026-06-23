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
  Lightbulb,
  Palette,
  Armchair,
  Users,
  Calendar,
  Car
} from 'lucide-react';
import { RFQStepBar } from './RFQStepBar';

interface DecorRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface DecorState {
  // Step 1: Scope & Style
  areas: string[];
  stylePreference: string;
  colorPalette: string;
  // Step 2: Decor Components & Soft Furnishings
  components: string[];
  curtainType: string;
  fabricQuality: string;
  furnishingScope: string;
  // Step 3: Furniture & Lighting
  looseFurnitureRequired: string;
  furnitureItems: string[];
  decorLighting: string[];
  // Step 4: Lifestyle & Budget
  familyType: string;
  lifestylePreference: string;
  budgetExpectation: string;
  // Step 5: Execution & Constraints
  timeline: string;
  workTiming: string;
  accessConstraints: string;
  parkingAvailability: string;
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

export const DecorRFQFlow: React.FC<DecorRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<DecorState>({
    areas: [],
    stylePreference: '',
    colorPalette: '',
    components: [],
    curtainType: '',
    fabricQuality: '',
    furnishingScope: '',
    looseFurnitureRequired: '',
    furnitureItems: [],
    decorLighting: [],
    familyType: '',
    lifestylePreference: '',
    budgetExpectation: '',
    timeline: '',
    workTiming: '',
    accessConstraints: '',
    parkingAvailability: '',
    specialRequirements: '',
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  const isStepValid = () => {
    if (step === 1) return state.areas.length > 0 && state.stylePreference !== '' && state.colorPalette !== '';
    if (step === 2) return state.components.length > 0 && state.curtainType !== '' && state.fabricQuality !== '' && state.furnishingScope !== '';
    if (step === 3) {
      if (state.looseFurnitureRequired === 'Yes' && state.furnitureItems.length === 0) return false;
      return state.looseFurnitureRequired !== '' && state.decorLighting.length > 0;
    }
    if (step === 4) return state.familyType !== '' && state.lifestylePreference !== '' && state.budgetExpectation !== '';
    if (step === 5) return state.timeline !== '' && state.workTiming !== '' && state.accessConstraints !== '' && state.parkingAvailability !== '';
    if (step === 6) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-DECOR-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Decor', { ...state, rfqNumber: rfqNum });
    setStep(7);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Scope & <span className="text-luxury-gold">Style.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the areas and aesthetic direction.
              </p>
            </div>

            <SectionWrapper title="Areas to Style" icon={Layout} subtitle="Multi-select areas">
              <div className="grid grid-cols-2 gap-2">
                {['Living Room', 'Bedrooms', 'Dining Area', 'Balcony', 'Entry/Foyer', 'Pooja Room', 'Entire House'].map((area) => (
                  <button
                    key={area}
                    onClick={() => {
                      const newAreas = state.areas.includes(area)
                        ? state.areas.filter(a => a !== area)
                        : [...state.areas, area];
                      setState({ ...state, areas: newAreas });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.areas.includes(area)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {area}
                    {state.areas.includes(area) && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 size={12} className="text-luxury-gold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Decor Style" icon={Sparkles} subtitle="Overall aesthetic">
              <div className="grid grid-cols-2 gap-2">
                {['Modern Minimal', 'Contemporary', 'South Indian', 'Scandinavian', 'Luxury', 'Industrial', 'Bohemian', 'Need Suggestion'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setState({ ...state, stylePreference: style })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.stylePreference === style
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Color Palette" icon={Palette} subtitle="Preferred tones">
              <div className="grid grid-cols-2 gap-2">
                {['Warm Tones', 'Neutral', 'Pastels', 'Bold Colors', 'Dark Theme', 'Need Suggestion'].map((palette) => (
                  <button
                    key={palette}
                    onClick={() => setState({ ...state, colorPalette: palette })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.colorPalette === palette
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {palette}
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
                Decor <span className="text-luxury-gold">Components.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Selection of elements and soft furnishings.
              </p>
            </div>

            <SectionWrapper title="Decor Elements" icon={Layers} subtitle="Multi-select components">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Curtains & Blinds', 'Wallpapers/Panels', 'Wall Art', 'Decorative Mirrors', 
                  'Rugs & Carpets', 'Cushions', 'Indoor Plants', 'Decorative Lighting', 
                  'Showpieces', 'TV Wall Styling', 'Balcony Decor'
                ].map((comp) => (
                  <button
                    key={comp}
                    onClick={() => {
                      const newComp = state.components.includes(comp)
                        ? state.components.filter(c => c !== comp)
                        : [...state.components, comp];
                      setState({ ...state, components: newComp });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.components.includes(comp)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {comp}
                    {state.components.includes(comp) && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 size={12} className="text-luxury-gold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Soft Furnishings Details" icon={Box} subtitle="Curtains & quality">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Curtains Type</p>
                <SegmentedControl 
                  options={['Sheer', 'Blackout', 'Combination', 'Blinds']} 
                  selected={state.curtainType} 
                  onChange={(val) => setState({ ...state, curtainType: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Fabric Quality</p>
                <SegmentedControl 
                  options={['Basic', 'Mid-range', 'Premium']} 
                  selected={state.fabricQuality} 
                  onChange={(val) => setState({ ...state, fabricQuality: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Scope</p>
                <SegmentedControl 
                  options={['Supply Only', 'Supply + Installation']} 
                  selected={state.furnishingScope} 
                  onChange={(val) => setState({ ...state, furnishingScope: val })} 
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
                Furniture & <span className="text-luxury-gold">Lighting.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Loose furniture and decorative lighting.
              </p>
            </div>

            <SectionWrapper title="Loose Furniture" icon={Armchair} subtitle="Requirement & items">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Required?</p>
                <SegmentedControl 
                  options={['Yes', 'No', 'Maybe']} 
                  selected={state.looseFurnitureRequired} 
                  onChange={(val) => setState({ ...state, looseFurnitureRequired: val })} 
                />
                
                {state.looseFurnitureRequired === 'Yes' && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {['Sofa', 'Chairs', 'Coffee Table', 'Side Tables', 'Accent Chairs', 'Dining Chairs'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          const newItems = state.furnitureItems.includes(item)
                            ? state.furnitureItems.filter(i => i !== item)
                            : [...state.furnitureItems, item];
                          setState({ ...state, furnitureItems: newItems });
                        }}
                        className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                          state.furnitureItems.includes(item)
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                            : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                        }`}
                      >
                        {item}
                        {state.furnitureItems.includes(item) && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 size={12} className="text-luxury-gold" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Decor Lighting" icon={Lightbulb} subtitle="Multi-select fixtures">
              <div className="grid grid-cols-2 gap-2">
                {['Table Lamps', 'Floor Lamps', 'Hanging Lights', 'Wall Sconces'].map((light) => (
                  <button
                    key={light}
                    onClick={() => {
                      const newLights = state.decorLighting.includes(light)
                        ? state.decorLighting.filter(l => l !== light)
                        : [...state.decorLighting, light];
                      setState({ ...state, decorLighting: newLights });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.decorLighting.includes(light)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {light}
                    {state.decorLighting.includes(light) && (
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
                Lifestyle & <span className="text-luxury-gold">Budget.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Family needs and budget expectations.
              </p>
            </div>

            <SectionWrapper title="Lifestyle Inputs" icon={Users} subtitle="Family & preference">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Family Type</p>
                <SegmentedControl 
                  options={['Bachelor', 'Couple', 'Family with Kids', 'Elderly']} 
                  selected={state.familyType} 
                  onChange={(val) => setState({ ...state, familyType: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Preference</p>
                <SegmentedControl 
                  options={['Low Maintenance', 'Aesthetic Focused', 'Balanced']} 
                  selected={state.lifestylePreference} 
                  onChange={(val) => setState({ ...state, lifestylePreference: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Budget Expectation" icon={Wallet} subtitle="Guided selection">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Basic Decor Setup', 'Mid-range Styled Home', 'Premium Designer Decor', 'Need Cost Guidance'
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
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Execution <span className="text-luxury-gold">Constraints.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Timeline and site logistics.
              </p>
            </div>

            <SectionWrapper title="Timeline & Timing" icon={Calendar} subtitle="Installation planning">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Timeline</p>
                <SegmentedControl 
                  options={['Immediate', 'Within 2–4 Weeks', 'Flexible']} 
                  selected={state.timeline} 
                  onChange={(val) => setState({ ...state, timeline: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Work Timing</p>
                <SegmentedControl 
                  options={['Strict', 'Flexible']} 
                  selected={state.workTiming} 
                  onChange={(val) => setState({ ...state, workTiming: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Site Logistics" icon={Car} subtitle="Access & parking">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Access Constraints?</p>
                <SegmentedControl 
                  options={['Yes', 'No']} 
                  selected={state.accessConstraints} 
                  onChange={(val) => setState({ ...state, accessConstraints: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Parking Availability</p>
                <SegmentedControl 
                  options={['Easy', 'Limited']} 
                  selected={state.parkingAvailability} 
                  onChange={(val) => setState({ ...state, parkingAvailability: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Special Requests" icon={FileText} subtitle="Optional details">
              <textarea 
                value={state.specialRequirements}
                onChange={(e) => setState({ ...state, specialRequirements: e.target.value })}
                placeholder="E.g. Any inspiration or reference links."
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
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your decor requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Scope & Style" 
                icon={Layout} 
                items={[
                  { label: 'Areas', value: state.areas },
                  { label: 'Style', value: state.stylePreference },
                  { label: 'Palette', value: state.colorPalette }
                ]}
              />

              <ReviewSection 
                title="Components" 
                icon={Layers} 
                items={[
                  { label: 'Elements', value: state.components },
                  { label: 'Curtains', value: state.curtainType },
                  { label: 'Fabric', value: state.fabricQuality },
                  { label: 'Scope', value: state.furnishingScope }
                ]}
              />

              <ReviewSection 
                title="Furniture & Lighting" 
                icon={Armchair} 
                items={[
                  { label: 'Loose Furniture', value: state.looseFurnitureRequired },
                  { label: 'Items', value: state.furnitureItems },
                  { label: 'Lighting', value: state.decorLighting }
                ]}
              />

              <ReviewSection 
                title="Lifestyle & Budget" 
                icon={Users} 
                items={[
                  { label: 'Family', value: state.familyType },
                  { label: 'Preference', value: state.lifestylePreference },
                  { label: 'Budget', value: state.budgetExpectation }
                ]}
              />

              <ReviewSection 
                title="Execution" 
                icon={Calendar} 
                items={[
                  { label: 'Timeline', value: state.timeline },
                  { label: 'Timing', value: state.workTiming },
                  { label: 'Access', value: state.accessConstraints },
                  { label: 'Parking', value: state.parkingAvailability }
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
                Decor RFQ <span className="text-luxury-gold">Submitted!</span>
              </h2>
              <p className="text-[var(--muted)] text-sm font-semibold max-w-xs mx-auto">
                Thank you, {state.userName}. We will review your decor requirements and contact you soon.
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
          <h1 className="text-sm font-bold text-[var(--ink)] tracking-tight">Decor RFQ</h1>
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
