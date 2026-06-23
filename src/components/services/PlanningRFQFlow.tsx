import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Target, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ClipboardCheck, 
  Search, 
  Check,
  Building2,
  Landmark,
  FileText
} from 'lucide-react';
import { RFQStepBar } from './RFQStepBar';

interface PlanningRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface PlanningState {
  planningIntent: string;
  currentStatus: string;
  locationOfInterest: string;
  budgetRange: string;
  timeline: string;
  familySize: string;
  priorities: string[];
  serviceExpectations: string[];
  userName: string;
  userPhone: string;
  rfqId: string;
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

const ReviewSection = ({ title, icon: Icon, items }: { title: string, icon: any, items: { label: string, value: string | string[] }[] }) => (
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
              <p className="text-[11px] font-black text-[var(--ink)]">{item.value || 'N/A'}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PlanningRFQFlow: React.FC<PlanningRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<PlanningState>({
    planningIntent: '',
    currentStatus: '',
    locationOfInterest: '',
    budgetRange: '',
    timeline: '',
    familySize: '',
    priorities: [],
    serviceExpectations: [],
    userName: '',
    userPhone: '',
    rfqId: ''
  });

  const isStepValid = () => {
    if (step === 1) return state.planningIntent !== '' && state.currentStatus !== '';
    if (step === 2) return state.locationOfInterest !== '' && state.budgetRange !== '';
    if (step === 3) return state.timeline !== '' && state.familySize !== '';
    if (step === 4) return state.priorities.length > 0;
    if (step === 5) return state.serviceExpectations.length > 0;
    if (step === 6) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const handleFinalSubmit = () => {
    const id = `TI360-PLN-${Math.floor(1000 + Math.random() * 9000)}`;
    setState(prev => ({ ...prev, rfqId: id }));
    setStep(7);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Planning <span className="text-luxury-gold">Intent.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define what you are planning to achieve.
              </p>
            </div>

            <SectionWrapper title="What are you planning?" icon={Target} subtitle="Primary Goal">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Planning to Buy Land/Plot',
                  'Planning to Build a New Home',
                  'Planning a Major Renovation',
                  'Planning a Commercial Project',
                  'Planning for Investment Property',
                  'Just Exploring Options'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, planningIntent: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.planningIntent === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Current Status" icon={Compass} subtitle="Where are you now?">
              <SegmentedControl 
                options={['Just Started', 'Researching', 'Budgeting', 'Ready to Execute']} 
                selected={state.currentStatus} 
                onChange={(val) => setState({ ...state, currentStatus: val })} 
              />
            </SectionWrapper>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Location & <span className="text-luxury-gold">Budget.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Help us understand your geographic and financial scope.
              </p>
            </div>

            <SectionWrapper title="Location of Interest" icon={MapPin} subtitle="Preferred Area">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-luxury-gold transition-colors" />
                <input 
                  type="text"
                  value={state.locationOfInterest}
                  onChange={(e) => setState({ ...state, locationOfInterest: e.target.value })}
                  placeholder="e.g., North Bangalore, Whitefield..."
                  className="w-full pl-12 pr-6 py-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] focus:outline-none focus:border-luxury-gold/50 transition-colors"
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Budget Range" icon={DollarSign} subtitle="Estimated Investment">
              <div className="grid grid-cols-2 gap-2">
                {[
                  '₹20L - ₹50L', '₹50L - ₹1Cr', 
                  '₹1Cr - ₹2.5Cr', '₹2.5Cr - ₹5Cr', 
                  '₹5Cr+', 'Not Decided'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, budgetRange: v })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.budgetRange === v
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {v}
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
                Timeline & <span className="text-luxury-gold">Scale.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                When do you want to start and for whom?
              </p>
            </div>

            <SectionWrapper title="Expected Timeline" icon={Calendar} subtitle="Start Date">
              <SegmentedControl 
                options={['Immediate', '3-6 Months', '6-12 Months', 'Exploring Only']} 
                selected={state.timeline} 
                onChange={(val) => setState({ ...state, timeline: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Family Size" icon={Users} subtitle="Occupancy">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Bachelor/Single', 'Couple', 
                  'Small Family (3-4)', 'Large Family (5+)', 
                  'Joint Family', 'Commercial Use'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, familySize: v })}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.familySize === v
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
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
                Planning <span className="text-luxury-gold">Priorities.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                What matters most in your planning phase?
              </p>
            </div>

            <SectionWrapper title="Key Priorities" icon={Sparkles} subtitle="Multi-select">
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Vastu Compliance',
                  'Modern Architecture',
                  'Cost Optimization',
                  'Legal & Approval Clarity',
                  'Sustainable/Green Building',
                  'Smart Home Technology',
                  'Fast Execution'
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      const newPriorities = state.priorities.includes(item)
                        ? state.priorities.filter(p => p !== item)
                        : [...state.priorities, item];
                      setState({ ...state, priorities: newPriorities });
                    }}
                    className={`p-4 rounded-2xl text-[12px] font-bold border transition-all flex items-center gap-3 ${
                      state.priorities.includes(item)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${state.priorities.includes(item) ? 'bg-luxury-gold border-luxury-gold text-white' : 'bg-[var(--paper)] border-[var(--line)]'}`}>
                      {state.priorities.includes(item) && <Check size={12} strokeWidth={4} />}
                    </div>
                    {item}
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
                Service <span className="text-luxury-gold">Expectations.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                What kind of support are you looking for?
              </p>
            </div>

            <SectionWrapper title="Support Needed" icon={ClipboardCheck} subtitle="Multi-select">
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Land/Plot Identification',
                  'Architectural Conceptualization',
                  'Budget Estimation & Feasibility',
                  'Legal Due Diligence',
                  'Approval & Liaisoning Guidance',
                  'Contractor Matching',
                  'End-to-End Project Management'
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      const newExpectations = state.serviceExpectations.includes(item)
                        ? state.serviceExpectations.filter(e => e !== item)
                        : [...state.serviceExpectations, item];
                      setState({ ...state, serviceExpectations: newExpectations });
                    }}
                    className={`p-4 rounded-2xl text-[12px] font-bold border transition-all flex items-center gap-3 ${
                      state.serviceExpectations.includes(item)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${state.serviceExpectations.includes(item) ? 'bg-luxury-gold border-luxury-gold text-white' : 'bg-[var(--paper)] border-[var(--line)]'}`}>
                      {state.serviceExpectations.includes(item) && <Check size={12} strokeWidth={4} />}
                    </div>
                    {item}
                  </button>
                ))}
              </div>
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
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your planning requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Intent & Status" 
                icon={Target} 
                items={[
                  { label: 'Intent', value: state.planningIntent },
                  { label: 'Status', value: state.currentStatus }
                ]}
              />

              <ReviewSection 
                title="Scope & Budget" 
                icon={MapPin} 
                items={[
                  { label: 'Location', value: state.locationOfInterest },
                  { label: 'Budget', value: state.budgetRange },
                  { label: 'Timeline', value: state.timeline }
                ]}
              />

              <ReviewSection 
                title="Preferences" 
                icon={Sparkles} 
                items={[
                  { label: 'Priorities', value: state.priorities },
                  { label: 'Support', value: state.serviceExpectations }
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
      case 7:
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
              <h2 className="text-3xl font-black text-[var(--ink)] tracking-tight">Planning RFQ Submitted!</h2>
              <p className="text-[var(--muted)] font-medium">Our planning experts will review your intent and get back to you within 24 hours.</p>
            </div>

            <div className="bg-[var(--bg)] rounded-3xl p-6 w-full max-w-xs border border-[var(--line)] space-y-1">
              <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">RFQ Reference</p>
              <p className="text-xl font-black text-[var(--ink)] tracking-wider">{state.rfqId}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full max-w-xs pt-4">
              <button 
                onClick={onComplete}
                className="w-full py-5 bg-orange-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/30 active:scale-95 transition-transform"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-premium-cream z-50 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between bg-premium-cream/80 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={step === 1 ? onBack : () => setStep(step - 1)} 
          className="p-3 bg-[var(--paper)] rounded-2xl text-[var(--ink)] shadow-sm border border-[var(--line)] active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex-1 mx-4">
          <RFQStepBar step={step} totalSteps={6} />
        </div>

        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      {step < 7 && (
        <div className="p-6 bg-premium-cream/80 backdrop-blur-md border-t border-[var(--line)]">
          <button
            disabled={!isStepValid()}
            onClick={step === 6 ? handleFinalSubmit : () => setStep(step + 1)}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              isStepValid() 
                ? 'bg-luxury-gold text-[var(--ink)] shadow-luxury-gold/20 active:scale-[0.98]' 
                : 'bg-[var(--line)] text-[var(--muted)] cursor-not-allowed shadow-none'
            }`}
          >
            {step === 6 ? 'Submit Planning RFQ' : 'Continue'}
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
