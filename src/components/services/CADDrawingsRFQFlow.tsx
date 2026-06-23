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
  User,
  Phone,
  Calendar,
  Zap,
  Ruler,
  ClipboardCheck,
  HardDrive,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { RFQStepBar } from './RFQStepBar';

interface CADDrawingsRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface CADState {
  // Step 1: Context & Scope
  projectType: string;
  drawingScope: string[];
  inputAvailability: string[];
  measurementsVerified: string;
  // Step 2: Detailing & Components
  detailingLevel: string;
  drawingComponents: string[];
  // Step 3: Technical Standards
  preferredScale: string;
  fileFormats: string[];
  layerStandards: string;
  plotDimensions: string;
  // Step 4: Coordination & Collaboration
  structuralAvailable: string;
  electricalPlanningStatus: string;
  plumbingRequired: string;
  siteCoordination: string;
  // Step 5: Timeline & Approvals
  revisionExpectation: string;
  timeline: string;
  priorityLevel: string;
  authorityApprovals: string;
  draftingInstructions: string;
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

export const CADDrawingsRFQFlow: React.FC<CADDrawingsRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<CADState>({
    projectType: '',
    drawingScope: [],
    inputAvailability: [],
    measurementsVerified: '',
    detailingLevel: '',
    drawingComponents: [],
    preferredScale: '',
    fileFormats: [],
    layerStandards: '',
    plotDimensions: '',
    structuralAvailable: '',
    electricalPlanningStatus: '',
    plumbingRequired: '',
    siteCoordination: '',
    revisionExpectation: '',
    timeline: '',
    priorityLevel: '',
    authorityApprovals: '',
    draftingInstructions: '',
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  const isStepValid = () => {
    if (step === 1) return state.projectType !== '' && state.drawingScope.length > 0 && state.inputAvailability.length > 0 && state.measurementsVerified !== '';
    if (step === 2) return state.detailingLevel !== '' && state.drawingComponents.length > 0;
    if (step === 3) return state.preferredScale !== '' && state.fileFormats.length > 0 && state.layerStandards !== '' && state.plotDimensions !== '';
    if (step === 4) return state.structuralAvailable !== '' && state.electricalPlanningStatus !== '' && state.plumbingRequired !== '' && state.siteCoordination !== '';
    if (step === 5) return state.revisionExpectation !== '' && state.timeline !== '' && state.priorityLevel !== '' && state.authorityApprovals !== '';
    if (step === 6) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-CAD-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('C A D Drawings', { ...state, rfqNumber: rfqNum });
    setStep(7);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Context & <span className="text-luxury-gold">Scope.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the project type and required drawing package.
              </p>
            </div>

            <SectionWrapper title="Project Type" icon={Building2} subtitle="Primary category">
              <SegmentedControl 
                options={['Residential', 'Commercial', 'Mixed Use']} 
                selected={state.projectType} 
                onChange={(val) => setState({ ...state, projectType: val })} 
              />
            </SectionWrapper>

            <SectionWrapper title="Drawing Scope" icon={FileCode} subtitle="Multi-select requirements">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Architectural CAD', 'Structural CAD', 'Electrical Layouts', 
                  'Plumbing Drawings', 'Working Drawings Pkg'
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

            <SectionWrapper title="Available Inputs" icon={ClipboardCheck} subtitle="What do you have?">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'PDF Plans', 'Hand Sketches', 'Site Measurements', 'No Drawings'
                ].map((input) => (
                  <button
                    key={input}
                    onClick={() => {
                      const newInputs = state.inputAvailability.includes(input)
                        ? state.inputAvailability.filter(i => i !== input)
                        : [...state.inputAvailability, input];
                      setState({ ...state, inputAvailability: newInputs });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.inputAvailability.includes(input)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {input}
                  </button>
                ))}
              </div>
              <div className="mt-4 p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)]">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-3">Measurements Verified?</p>
                <SegmentedControl 
                  options={['Yes, Accurate', 'No, Need Verification']} 
                  selected={state.measurementsVerified} 
                  onChange={(val) => setState({ ...state, measurementsVerified: val })} 
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
                Detailing & <span className="text-luxury-gold">Components.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Specify the level of detail and specific drawings needed.
              </p>
            </div>

            <SectionWrapper title="Detailing Level" icon={Maximize2} subtitle="Precision requirement">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Basic 2D CAD Plans', 'Dimensioned Working Drawings', 
                  'Execution-Level (Annotations/Sections)', 'Shop Drawing Level'
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

            <SectionWrapper title="Drawing Components" icon={Layers} subtitle="Multi-select components">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Floor Plans', 'Elevations', 'Sections', 'Staircase Details', 
                  'Door/Window Details', 'Furniture Layout', 'False Ceiling', 
                  'Electrical Layout', 'Plumbing Layout'
                ].map((comp) => (
                  <button
                    key={comp}
                    onClick={() => {
                      const newComp = state.drawingComponents.includes(comp)
                        ? state.drawingComponents.filter(c => c !== comp)
                        : [...state.drawingComponents, comp];
                      setState({ ...state, drawingComponents: newComp });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.drawingComponents.includes(comp)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {comp}
                    {state.drawingComponents.includes(comp) && (
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
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Technical <span className="text-luxury-gold">Standards.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Drafting standards and delivery formats.
              </p>
            </div>

            <SectionWrapper title="Scale & Standards" icon={Ruler} subtitle="Drafting preferences">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Preferred Scale</p>
                <SegmentedControl 
                  options={['1:50', '1:100', 'Custom']} 
                  selected={state.preferredScale} 
                  onChange={(val) => setState({ ...state, preferredScale: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Layer Standards?</p>
                <SegmentedControl 
                  options={['Follow Standard', 'No Preference']} 
                  selected={state.layerStandards} 
                  onChange={(val) => setState({ ...state, layerStandards: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Delivery Formats" icon={HardDrive} subtitle="Multi-select formats">
              <div className="grid grid-cols-2 gap-2">
                {['DWG (AutoCAD)', 'PDF', 'DXF', 'BIM (Revit)'].map((format) => (
                  <button
                    key={format}
                    onClick={() => {
                      const newFormats = state.fileFormats.includes(format)
                        ? state.fileFormats.filter(f => f !== format)
                        : [...state.fileFormats, format];
                      setState({ ...state, fileFormats: newFormats });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all relative flex items-center justify-center text-center ${
                      state.fileFormats.includes(format)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Plot Dimensions" icon={Maximize2} subtitle="Essential technical data">
              <TextInput 
                label="Exact Plot Dimensions" 
                icon={Ruler} 
                placeholder="E.g. 30x40 ft, 40x60 ft"
                value={state.plotDimensions}
                onChange={(val) => setState({ ...state, plotDimensions: val })}
              />
            </SectionWrapper>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Coordination <span className="text-luxury-gold">& Collaboration.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Avoid execution conflicts through better planning.
              </p>
            </div>

            <SectionWrapper title="Technical Coordination" icon={Settings} subtitle="Existing drawings">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Structural Drawings Available?</p>
                <SegmentedControl 
                  options={['Yes', 'No', 'In Progress']} 
                  selected={state.structuralAvailable} 
                  onChange={(val) => setState({ ...state, structuralAvailable: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Electrical Planning</p>
                <SegmentedControl 
                  options={['Done', 'Include in CAD', 'Not Required']} 
                  selected={state.electricalPlanningStatus} 
                  onChange={(val) => setState({ ...state, electricalPlanningStatus: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Plumbing Layouts</p>
                <SegmentedControl 
                  options={['Required', 'Not Required']} 
                  selected={state.plumbingRequired} 
                  onChange={(val) => setState({ ...state, plumbingRequired: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Site Collaboration" icon={Users} subtitle="Team coordination">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Coordination with Site/Contractor?</p>
                <SegmentedControl 
                  options={['Yes', 'No']} 
                  selected={state.siteCoordination} 
                  onChange={(val) => setState({ ...state, siteCoordination: val })} 
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
                Timeline & <span className="text-luxury-gold">Approvals.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Delivery schedule and authority requirements.
              </p>
            </div>

            <SectionWrapper title="Revisions & Timeline" icon={RefreshCw} subtitle="Delivery planning">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Revision Expectation</p>
                <SegmentedControl 
                  options={['Fixed (2-3)', 'Flexible']} 
                  selected={state.revisionExpectation} 
                  onChange={(val) => setState({ ...state, revisionExpectation: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Delivery Timeline</p>
                <SegmentedControl 
                  options={['2-3 Days', '1 Week', '2 Weeks', 'Flexible']} 
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

            <SectionWrapper title="Authority Approvals" icon={ShieldAlert} subtitle="Bangalore specific">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Used for BBMP/BDA Submissions?</p>
                <SegmentedControl 
                  options={['Yes', 'No']} 
                  selected={state.authorityApprovals} 
                  onChange={(val) => setState({ ...state, authorityApprovals: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Drafting Instructions" icon={FileText} subtitle="Optional details">
              <textarea 
                value={state.draftingInstructions}
                onChange={(e) => setState({ ...state, draftingInstructions: e.target.value })}
                placeholder="E.g. Specific layer naming or drafting standards."
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
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your CAD technical requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Context & Scope" 
                icon={Building2} 
                items={[
                  { label: 'Project', value: state.projectType },
                  { label: 'Scope', value: state.drawingScope },
                  { label: 'Inputs', value: state.inputAvailability },
                  { label: 'Verified', value: state.measurementsVerified }
                ]}
              />

              <ReviewSection 
                title="Detailing" 
                icon={Maximize2} 
                items={[
                  { label: 'Level', value: state.detailingLevel },
                  { label: 'Components', value: state.drawingComponents }
                ]}
              />

              <ReviewSection 
                title="Technical" 
                icon={Ruler} 
                items={[
                  { label: 'Scale', value: state.preferredScale },
                  { label: 'Formats', value: state.fileFormats },
                  { label: 'Plot', value: state.plotDimensions }
                ]}
              />

              <ReviewSection 
                title="Coordination" 
                icon={Settings} 
                items={[
                  { label: 'Structural', value: state.structuralAvailable },
                  { label: 'Electrical', value: state.electricalPlanningStatus },
                  { label: 'Plumbing', value: state.plumbingRequired }
                ]}
              />

              <ReviewSection 
                title="Timeline" 
                icon={Calendar} 
                items={[
                  { label: 'Revision', value: state.revisionExpectation },
                  { label: 'Timeline', value: state.timeline },
                  { label: 'Priority', value: state.priorityLevel },
                  { label: 'Authority', value: state.authorityApprovals }
                ]}
              />

              {state.draftingInstructions && (
                <ReviewSection 
                  title="Instructions" 
                  icon={FileText} 
                  items={[{ label: 'Details', value: state.draftingInstructions }]}
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
                <Zap size={20} />
              </motion.div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[var(--ink)] leading-tight">
                CAD RFQ <span className="text-luxury-gold">Submitted!</span>
              </h2>
              <p className="text-[var(--muted)] text-sm font-semibold max-w-xs mx-auto">
                Thank you, {state.userName}. Our technical team will review your CAD requirements and contact you soon.
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
          <h1 className="text-sm font-bold text-[var(--ink)] tracking-tight">CAD Drawings RFQ</h1>
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
