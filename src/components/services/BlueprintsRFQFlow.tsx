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
  Layout,
  Box,
  Clock,
  Building2,
  Maximize2,
  Star,
  ShieldAlert,
  FileCode,
  Settings,
  Users,
  Calendar,
  Zap,
  Ruler,
  ClipboardCheck,
  HardDrive,
  RefreshCw,
  AlertCircle,
  Scale,
  Stamp,
  Gavel,
  User,
  Phone,
  Sparkles
} from 'lucide-react';
import { RFQStepBar } from './RFQStepBar';

interface BlueprintsRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface BlueprintsState {
  // Step 1: Purpose & Classification
  purpose: string;
  projectType: string;
  jurisdiction: string;
  // Step 2: Scope & Input Readiness
  drawingScope: string[];
  inputReadiness: string[];
  // Step 3: Compliance & Regulations
  setbackConsidered: string;
  farAwareness: string;
  vastuRequirement: string;
  approvalAssistance: string;
  // Step 4: Detailing & Standards
  detailingLevel: string;
  drawingFormat: string[];
  stampRequired: string;
  // Step 5: Execution & Timeline
  onSiteUse: string;
  contractorCoordination: string;
  revisionExpectation: string;
  timeline: string;
  priorityLevel: string;
  technicalNotes: string;
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

export const BlueprintsRFQFlow: React.FC<BlueprintsRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<BlueprintsState>({
    purpose: '',
    projectType: '',
    jurisdiction: '',
    drawingScope: [],
    inputReadiness: [],
    setbackConsidered: '',
    farAwareness: '',
    vastuRequirement: '',
    approvalAssistance: '',
    detailingLevel: '',
    drawingFormat: [],
    stampRequired: '',
    onSiteUse: '',
    contractorCoordination: '',
    revisionExpectation: '',
    timeline: '',
    priorityLevel: '',
    technicalNotes: '',
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  const isStepValid = () => {
    if (step === 1) return state.purpose !== '' && state.projectType !== '' && state.jurisdiction !== '';
    if (step === 2) return state.drawingScope.length > 0 && state.inputReadiness.length > 0;
    if (step === 3) return state.setbackConsidered !== '' && state.farAwareness !== '' && state.vastuRequirement !== '' && state.approvalAssistance !== '';
    if (step === 4) return state.detailingLevel !== '' && state.drawingFormat.length > 0 && state.stampRequired !== '';
    if (step === 5) return state.onSiteUse !== '' && state.contractorCoordination !== '' && state.revisionExpectation !== '' && state.timeline !== '' && state.priorityLevel !== '';
    if (step === 6) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-BLUE-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Blueprints', { ...state, rfqNumber: rfqNum });
    setStep(7);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Purpose & <span className="text-luxury-gold">Classification.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the legal and technical intent of your blueprints.
              </p>
            </div>

            <SectionWrapper title="Primary Purpose" icon={Gavel} subtitle="Legal & technical intent">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Approval Submission (BBMP/BDA/Panchayat)', 
                  'Construction Execution', 
                  'Bank Loan Processing', 
                  'Complete End-to-End Documentation'
                ].map((purpose) => (
                  <button
                    key={purpose}
                    onClick={() => setState({ ...state, purpose: purpose })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.purpose === purpose
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {purpose}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Project Classification" icon={Building2} subtitle="Type & Jurisdiction">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Project Type</p>
                <SegmentedControl 
                  options={['Residential', 'Commercial', 'Mixed Use']} 
                  selected={state.projectType} 
                  onChange={(val) => setState({ ...state, projectType: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Authority Jurisdiction</p>
                <SegmentedControl 
                  options={['BBMP', 'BDA', 'Panchayat', 'Not Sure']} 
                  selected={state.jurisdiction} 
                  onChange={(val) => setState({ ...state, jurisdiction: val })} 
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
                Scope & <span className="text-luxury-gold">Readiness.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Select required drawings and confirm input availability.
              </p>
            </div>

            <SectionWrapper title="Blueprint Scope" icon={Layers} subtitle="Multi-select disciplines">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Architectural Blueprints', 'Structural Drawings', 
                  'Electrical Blueprints', 'Plumbing Blueprints', 
                  'Site Layout Plans'
                ].map((scope) => (
                  <button
                    key={scope}
                    onClick={() => {
                      const newScope = state.drawingScope.includes(scope)
                        ? state.drawingScope.filter(s => s !== scope)
                        : [...state.drawingScope, scope];
                      setState({ ...state, drawingScope: newScope });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.drawingScope.includes(scope)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {scope}
                    {state.drawingScope.includes(scope) && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 size={12} className="text-luxury-gold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Input Readiness" icon={ClipboardCheck} subtitle="Available data">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Architectural Plans', 'Structural Designs', 
                  'Site Measurements', 'Need Scratch Development'
                ].map((input) => (
                  <button
                    key={input}
                    onClick={() => {
                      const newInputs = state.inputReadiness.includes(input)
                        ? state.inputReadiness.filter(i => i !== input)
                        : [...state.inputReadiness, input];
                      setState({ ...state, inputReadiness: newInputs });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.inputReadiness.includes(input)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {input}
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
                Compliance & <span className="text-luxury-gold">Regulations.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Bangalore-specific regulatory constraints.
              </p>
            </div>

            <SectionWrapper title="Regulatory Inputs" icon={ShieldAlert} subtitle="Compliance check">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Setback Rules Considered?</p>
                <SegmentedControl 
                  options={['Yes', 'No', 'Need Guidance']} 
                  selected={state.setbackConsidered} 
                  onChange={(val) => setState({ ...state, setbackConsidered: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">FAR / Ground Coverage Known?</p>
                <SegmentedControl 
                  options={['Yes', 'No', 'Need Calculation']} 
                  selected={state.farAwareness} 
                  onChange={(val) => setState({ ...state, farAwareness: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Vastu Guidelines</p>
                <SegmentedControl 
                  options={['Strict', 'Partial', 'Not Required']} 
                  selected={state.vastuRequirement} 
                  onChange={(val) => setState({ ...state, vastuRequirement: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Approval Support" icon={Scale} subtitle="Assistance level">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Approval Assistance Required?</p>
                <SegmentedControl 
                  options={['Yes', 'No', 'Maybe']} 
                  selected={state.approvalAssistance} 
                  onChange={(val) => setState({ ...state, approvalAssistance: val })} 
                />
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Detailing & <span className="text-luxury-gold">Standards.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Specify the level of technical detailing and standards.
              </p>
            </div>

            <SectionWrapper title="Detailing Level" icon={Maximize2} subtitle="Execution clarity">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Basic Approval Drawings', 
                  'Detailed Construction Blueprints', 
                  'Fully Coordinated Execution Drawings'
                ].map((level) => (
                  <button
                    key={level}
                    onClick={() => setState({ ...state, detailingLevel: level })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.detailingLevel === level
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Documentation Standards" icon={HardDrive} subtitle="Format & Stamp">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Drawing Format (Multi-select)</p>
                <div className="grid grid-cols-2 gap-2">
                  {['DWG (AutoCAD)', 'PDF', 'DXF', 'Print Copies'].map((format) => (
                    <button
                      key={format}
                      onClick={() => {
                        const newFormats = state.drawingFormat.includes(format)
                          ? state.drawingFormat.filter(f => f !== format)
                          : [...state.drawingFormat, format];
                        setState({ ...state, drawingFormat: newFormats });
                      }}
                      className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                        state.drawingFormat.includes(format)
                          ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                          : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Licensed Professional Stamp/Signature?</p>
                <SegmentedControl 
                  options={['Required', 'Not Required']} 
                  selected={state.stampRequired} 
                  onChange={(val) => setState({ ...state, stampRequired: val })} 
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
                Execution & <span className="text-luxury-gold">Timeline.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                On-site coordination and delivery schedule.
              </p>
            </div>

            <SectionWrapper title="Execution Clarity" icon={Settings} subtitle="Site coordination">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Used Directly On-Site?</p>
                <SegmentedControl 
                  options={['Yes', 'No']} 
                  selected={state.onSiteUse} 
                  onChange={(val) => setState({ ...state, onSiteUse: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Contractor Coordination Needed?</p>
                <SegmentedControl 
                  options={['Yes', 'No']} 
                  selected={state.contractorCoordination} 
                  onChange={(val) => setState({ ...state, contractorCoordination: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Revision Expectation</p>
                <SegmentedControl 
                  options={['Fixed (2-3)', 'Flexible']} 
                  selected={state.revisionExpectation} 
                  onChange={(val) => setState({ ...state, revisionExpectation: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Timeline & Priority" icon={Calendar} subtitle="Delivery planning">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Timeline</p>
                <SegmentedControl 
                  options={['Immediate (2-3d)', '1 Week', '2-3 Weeks', 'Flexible']} 
                  selected={state.timeline} 
                  onChange={(val) => setState({ ...state, timeline: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Priority Level</p>
                <SegmentedControl 
                  options={['High', 'Medium', 'Low']} 
                  selected={state.priorityLevel} 
                  onChange={(val) => setState({ ...state, priorityLevel: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Technical Notes" icon={FileText} subtitle="Optional details">
              <textarea 
                value={state.technicalNotes}
                onChange={(e) => setState({ ...state, technicalNotes: e.target.value })}
                placeholder="E.g. Exact plot dimensions, survey details, or special authority conditions."
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
                <FileCode className="w-10 h-10 text-luxury-gold" />
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">Review & Submit</h2>
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your blueprint requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Purpose & Classification" 
                icon={Gavel} 
                items={[
                  { label: 'Purpose', value: state.purpose },
                  { label: 'Project', value: state.projectType },
                  { label: 'Jurisdiction', value: state.jurisdiction }
                ]}
              />

              <ReviewSection 
                title="Scope & Readiness" 
                icon={Layers} 
                items={[
                  { label: 'Scope', value: state.drawingScope },
                  { label: 'Readiness', value: state.inputReadiness }
                ]}
              />

              <ReviewSection 
                title="Compliance" 
                icon={ShieldAlert} 
                items={[
                  { label: 'Setbacks', value: state.setbackConsidered },
                  { label: 'FAR', value: state.farAwareness },
                  { label: 'Vastu', value: state.vastuRequirement },
                  { label: 'Assistance', value: state.approvalAssistance }
                ]}
              />

              <ReviewSection 
                title="Detailing & Standards" 
                icon={Maximize2} 
                items={[
                  { label: 'Level', value: state.detailingLevel },
                  { label: 'Format', value: state.drawingFormat },
                  { label: 'Stamp', value: state.stampRequired }
                ]}
              />

              <ReviewSection 
                title="Execution & Timeline" 
                icon={Calendar} 
                items={[
                  { label: 'On-Site', value: state.onSiteUse },
                  { label: 'Coordination', value: state.contractorCoordination },
                  { label: 'Timeline', value: state.timeline },
                  { label: 'Priority', value: state.priorityLevel }
                ]}
              />

              {state.technicalNotes && (
                <ReviewSection 
                  title="Technical Notes" 
                  icon={FileText} 
                  items={[{ label: 'Details', value: state.technicalNotes }]}
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
                Blueprints RFQ <span className="text-luxury-gold">Submitted!</span>
              </h2>
              <p className="text-[var(--muted)] text-sm font-semibold max-w-xs mx-auto">
                Thank you, {state.userName}. Our technical consultants will review your blueprint requirements and contact you soon.
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
          <h1 className="text-sm font-bold text-[var(--ink)] tracking-tight">Blueprints RFQ</h1>
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
