import React, { useState } from 'react';
import { submitServiceRFQ } from '../../lib/serviceRfq';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Building2,
  Star,
  ShieldAlert,
  Users,
  Calendar,
  Zap,
  ClipboardCheck,
  MapPin,
  Briefcase,
  Check,
  FileText,
  Clock,
  AlertTriangle,
  Search,
  Info,
  Sparkles,
  Gavel,
  History,
  CheckSquare,
  Activity,
  FileSearch,
  Landmark,
  GanttChartSquare
} from 'lucide-react';
import { LiaisoningSpecialist } from '../rfq-types';
import { MOCK_LIAISONING_SPECIALISTS } from '../rfq-constants';
import { RFQStepBar } from './RFQStepBar';

interface GovernmentApprovalsRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface GovernmentApprovalsState {
  // Step 1: Project & Authority Context
  projectType: string;
  projectStage: string;
  authority: string;
  // Step 2: Government Approvals Required
  approvalsRequired: string[];
  // Step 3: Document Readiness & Status
  documents: string[];
  applicationStatus: string;
  knownObjections: string;
  // Step 4: Support Expectations
  serviceExpectations: string[];
  supportDepth: string;
  // Step 5: Complexity & Urgency
  complexity: string;
  urgency: string;
  trackingExpectations: string[];
  // Step 6: Specialist Selection
  selectionMode: 'manual' | 'suggestion' | '';
  selectedSpecialistIds: string[];
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

interface SpecialistCardProps {
  key?: React.Key;
  specialist: LiaisoningSpecialist;
  selected: boolean;
  onToggle: () => void;
}

const SpecialistCard = ({ specialist, selected, onToggle }: SpecialistCardProps) => (
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
        <h4 className="text-sm font-black text-[var(--ink)] group-hover:text-luxury-gold transition-colors">{specialist.name}</h4>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
          <MapPin size={12} />
          {specialist.practiceLocation}
        </div>
      </div>
      <div className="flex items-center gap-1 bg-luxury-gold/10 px-2 py-1 rounded-lg">
        <Star size={10} className="text-luxury-gold fill-luxury-gold" />
        <span className="text-[10px] font-black text-luxury-gold">{specialist.rating}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="space-y-1">
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Experience</p>
        <p className="text-[11px] font-black text-[var(--ink)]">{specialist.experience}</p>
      </div>
      <div className="space-y-1 text-right">
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Cases Handled</p>
        <p className="text-[11px] font-black text-[var(--ink)]">{specialist.casesCompleted}+</p>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Authority Specialization</p>
        <div className="flex flex-wrap gap-1">
          {specialist.authoritySpecialization.map((auth, i) => (
            <span key={i} className="px-2 py-0.5 bg-[var(--bg)] border border-[var(--line)] rounded-md text-[9px] font-bold text-[var(--muted)]">
              {auth}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Project Strengths</p>
        <div className="flex flex-wrap gap-1">
          {specialist.projectTypeSpecialization.map((type, i) => (
            <span key={i} className="px-2 py-0.5 bg-luxury-gold/10 border border-luxury-gold/20 rounded-md text-[9px] font-bold text-luxury-gold">
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-[var(--line)]">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">
          <Briefcase size={12} />
          Full Lifecycle Management
        </div>
        <div className={`text-[9px] font-black uppercase tracking-widest ${specialist.availability.includes('Today') ? 'text-green-500' : 'text-luxury-gold'}`}>
          {specialist.availability}
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

export const GovernmentApprovalsRFQFlow: React.FC<GovernmentApprovalsRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<GovernmentApprovalsState>({
    projectType: '',
    projectStage: '',
    authority: '',
    approvalsRequired: [],
    documents: [],
    applicationStatus: '',
    knownObjections: '',
    serviceExpectations: [],
    supportDepth: '',
    complexity: '',
    urgency: '',
    trackingExpectations: [],
    selectionMode: '',
    selectedSpecialistIds: [],
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  const isStepValid = () => {
    if (step === 1) return state.projectType !== '' && state.projectStage !== '' && state.authority !== '';
    if (step === 2) return state.approvalsRequired.length > 0;
    if (step === 3) return state.documents.length > 0 && state.applicationStatus !== '' && state.knownObjections !== '';
    if (step === 4) return state.serviceExpectations.length > 0 && state.supportDepth !== '';
    if (step === 5) return state.complexity !== '' && state.urgency !== '' && state.trackingExpectations.length > 0;
    if (step === 6) {
      if (state.selectionMode === 'suggestion') return true;
      if (state.selectionMode === 'manual') return state.selectedSpecialistIds.length > 0;
      return false;
    }
    if (step === 7) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-GOV-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Government Approvals', { ...state, rfqNumber: rfqNum });
    setStep(8);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Project & <span className="text-luxury-gold">Authority.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the project type, stage, and governing jurisdiction.
              </p>
            </div>

            <SectionWrapper title="Project Context" icon={Building2} subtitle="Type & Stage">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Project Type</p>
                <SegmentedControl 
                  options={['Residential', 'Commercial', 'Mixed Use', 'Apartment', 'Villa', 'Layout / Land Development', 'Institutional']} 
                  selected={state.projectType} 
                  onChange={(val) => setState({ ...state, projectType: val })} 
                />
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1 mt-4">Project Stage</p>
                <SegmentedControl 
                  options={['Pre-construction', 'During Construction', 'Post-construction / Pre-occupation', 'Utility Handover Stage']} 
                  selected={state.projectStage} 
                  onChange={(val) => setState({ ...state, projectStage: val })} 
                />
              </div>
            </SectionWrapper>

            <SectionWrapper title="Governing Authority" icon={Landmark} subtitle="Jurisdiction">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'BBMP (Bruhat Bengaluru Mahanagara Palike)', 
                  'BDA (Bangalore Development Authority)', 
                  'BWSSB (Water Supply & Sewerage Board)', 
                  'BESCOM (Electricity Supply Company)', 
                  'Fire & Emergency Services Department', 
                  'KSPCB (Pollution Control Board)',
                  'Environmental Impact Assessment (EIA)',
                  'Not Sure'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, authority: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.authority === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
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
                Government <span className="text-luxury-gold">Approvals.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Select the specific government approvals required.
              </p>
            </div>

            <SectionWrapper title="Required Approvals" icon={ClipboardCheck} subtitle="Multi-select requirements">
              <div className="grid grid-cols-1 gap-2">
                {[
                  'BBMP Building Plan Sanction', 
                  'BWSSB NOC for Water/Sewerage', 
                  'BESCOM Load Sanction & Connection', 
                  'Fire Force Clearance / NOC', 
                  'Environmental Clearance (EC)', 
                  'KSPCB Consent to Establish/Operate', 
                  'Road Cutting / Trenching Permission', 
                  'Commencement Certificate (CC)',
                  'Occupancy Certificate (OC)',
                  'Forest / Tree Officer Clearance'
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      const newApprovals = state.approvalsRequired.includes(item)
                        ? state.approvalsRequired.filter(a => a !== item)
                        : [...state.approvalsRequired, item];
                      setState({ ...state, approvalsRequired: newApprovals });
                    }}
                    className={`p-4 rounded-2xl text-[12px] font-bold border transition-all flex items-center gap-3 ${
                      state.approvalsRequired.includes(item)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${state.approvalsRequired.includes(item) ? 'bg-luxury-gold border-luxury-gold text-white' : 'bg-[var(--paper)] border-[var(--line)]'}`}>
                      {state.approvalsRequired.includes(item) && <Check size={12} strokeWidth={4} />}
                    </div>
                    {item}
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
                Document <span className="text-luxury-gold">Readiness.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define your current documentation and application status.
              </p>
            </div>

            <SectionWrapper title="Available Documents" icon={FileText} subtitle="Multi-select availability">
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Sale Deed & Title Documents', 
                  'Khata Certificate & Extract', 
                  'Up-to-date Tax Receipts', 
                  'Survey Sketch / Tippani', 
                  'Architectural Submission Drawings', 
                  'Structural Stability Report', 
                  'Sanctioned Plan (if revision)', 
                  'Prior Correspondence with Dept.', 
                  'Existing NOCs'
                ].map((doc) => (
                  <button
                    key={doc}
                    onClick={() => {
                      const newDocs = state.documents.includes(doc)
                        ? state.documents.filter(d => d !== doc)
                        : [...state.documents, doc];
                      setState({ ...state, documents: newDocs });
                    }}
                    className={`p-4 rounded-2xl text-[11px] font-bold border transition-all text-center ${
                      state.documents.includes(doc)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                    }`}
                  >
                    {doc}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Application Context" icon={History} subtitle="Status & Objections">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Application Status</p>
                  <SegmentedControl 
                    options={['Fresh Application', 'Resubmission', 'Pending Follow-up', 'Correction / Revision Case', 'Objection Case', 'Not Sure']} 
                    selected={state.applicationStatus} 
                    onChange={(val) => setState({ ...state, applicationStatus: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Known Objections / Gaps?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['Yes, Objections Exist', 'No Known Objections', 'Not Sure'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setState({ ...state, knownObjections: v })}
                        className={`p-4 rounded-2xl text-[12px] font-bold border transition-all ${
                          state.knownObjections === v
                            ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--muted)]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionWrapper>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-3xl font-black text-[var(--ink)] leading-tight">
                Support <span className="text-luxury-gold">Expectations.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the level of support required for your government approvals.
              </p>
            </div>

            <SectionWrapper title="Support Scope" icon={Zap} subtitle="Multi-select expectations">
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Document Scrutiny Before Submission', 
                  'Filing Support', 
                  'Department Follow-up', 
                  'Objection Handling', 
                  'Re-submission Support', 
                  'Coordination with Architect / Structural Consultant', 
                  'Inspection Coordination', 
                  'Utility Approval Follow-up', 
                  'Full Approval Lifecycle Management'
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

            <SectionWrapper title="Support Depth" icon={ShieldAlert} subtitle="Management Level">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Approval Advisory Only', 
                  'Submission Support Only', 
                  'Follow-up Support Only', 
                  'Complete Case Management until Milestone Closure'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, supportDepth: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.supportDepth === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
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
                Complexity & <span className="text-luxury-gold">Urgency.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Define the case complexity and delivery timeline.
              </p>
            </div>

            <SectionWrapper title="Case Complexity" icon={AlertTriangle} subtitle="Risk assessment">
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Standard Case', 
                  'Multi-Department Case', 
                  'Delay-Prone Case', 
                  'Objection-Sensitive Case', 
                  'Deviation-Sensitive Case', 
                  'Urgent Approval Case'
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setState({ ...state, complexity: v })}
                    className={`p-4 rounded-2xl text-[13px] font-black border transition-all text-left ${
                      state.complexity === v
                        ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                        : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line)]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </SectionWrapper>

            <SectionWrapper title="Technical & Urgency" icon={CheckSquare} subtitle="Compliance & Timeline">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Urgency</p>
                  <SegmentedControl 
                    options={['Immediate', 'Within 1 Week', 'Within 1 Month', 'Flexible']} 
                    selected={state.urgency} 
                    onChange={(val) => setState({ ...state, urgency: val })} 
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Technical Compliance Checks</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      'Setbacks & Open Spaces Compliance', 
                      'Parking Requirements Compliance', 
                      'FAR / FSI Calculation Check', 
                      'Usage / Zonal Compliance', 
                      'Rainwater Harvesting Compliance',
                      'STP / Waste Management Compliance'
                    ].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          const newTracking = state.trackingExpectations.includes(item)
                            ? state.trackingExpectations.filter(t => t !== item)
                            : [...state.trackingExpectations, item];
                          setState({ ...state, trackingExpectations: newTracking });
                        }}
                        className={`p-4 rounded-2xl text-[12px] font-bold border transition-all flex items-center gap-3 ${
                          state.trackingExpectations.includes(item)
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5'
                            : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${state.trackingExpectations.includes(item) ? 'bg-luxury-gold border-luxury-gold text-white' : 'bg-[var(--paper)] border-[var(--line)]'}`}>
                          {state.trackingExpectations.includes(item) && <Check size={12} strokeWidth={4} />}
                        </div>
                        {item}
                      </button>
                    ))}
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
                Expert <span className="text-luxury-gold">Selection.</span>
              </h2>
              <p className="text-[var(--muted)] font-semibold text-xs leading-relaxed">
                Choose your approval specialist or let us suggest the best fit.
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
                onClick={() => setState({ ...state, selectionMode: 'suggestion', selectedSpecialistIds: [] })}
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
                    <h3 className="text-[11px] font-black text-[var(--ink)] uppercase tracking-wider">Approval Specialists</h3>
                    <span className="text-[10px] font-bold text-[var(--muted)]">{state.selectedSpecialistIds.length} Selected</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {MOCK_LIAISONING_SPECIALISTS.map((specialist) => (
                      <SpecialistCard 
                        key={specialist.id} 
                        specialist={specialist} 
                        selected={state.selectedSpecialistIds.includes(specialist.id)}
                        onToggle={() => {
                          const newIds = state.selectedSpecialistIds.includes(specialist.id)
                            ? state.selectedSpecialistIds.filter(id => id !== specialist.id)
                            : [...state.selectedSpecialistIds, specialist.id];
                          setState({ ...state, selectedSpecialistIds: newIds });
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
                      Our system will analyze your project type, authority jurisdiction, and approval complexity to route your RFQ to the most qualified government approval specialist in our network.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-[var(--paper)]/5 rounded-2xl border border-white/10">
                      <ShieldAlert size={20} className="text-luxury-gold mx-auto mb-2" />
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">Verified Experts</p>
                    </div>
                    <div className="p-4 bg-[var(--paper)]/5 rounded-2xl border border-white/10">
                      <Zap size={20} className="text-luxury-gold mx-auto mb-2" />
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">Fast Routing</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                <Activity className="w-10 h-10 text-luxury-gold" />
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">Review & Submit</h2>
              <p className="text-[var(--muted)] text-xs font-semibold">Verify your government approval requirements.</p>
            </div>

            <div className="space-y-6">
              <ReviewSection 
                title="Project & Authority" 
                icon={Building2} 
                items={[
                  { label: 'Type', value: state.projectType },
                  { label: 'Stage', value: state.projectStage },
                  { label: 'Authority', value: state.authority }
                ]}
              />

              <ReviewSection 
                title="Approvals Required" 
                icon={ClipboardCheck} 
                items={[
                  { label: 'Approvals', value: state.approvalsRequired }
                ]}
              />

              <ReviewSection 
                title="Compliance & Support" 
                icon={ShieldAlert} 
                items={[
                  { label: 'Status', value: state.applicationStatus },
                  { label: 'Support', value: state.supportDepth }
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
      case 8:
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
              <h2 className="text-3xl font-black text-[var(--ink)]">RFQ Submitted!</h2>
              <p className="text-[var(--muted)] font-medium">Your government approval request is now live.</p>
            </div>

            <div className="bg-[var(--bg)] rounded-3xl p-6 w-full border border-[var(--line)] space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[var(--line)]">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">RFQ Number</span>
                <span className="text-sm font-black text-[var(--ink)]">{state.rfqNumber}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Status</span>
                <span className="px-3 py-1 bg-luxury-gold/10 text-luxury-gold text-[10px] font-black rounded-full uppercase tracking-widest">Processing</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 w-full">
              <button 
                onClick={onComplete}
                className="w-full py-5 bg-orange-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-all"
              >
                Go to Dashboard
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
      <div className="px-6 pt-8 pb-6 flex items-center justify-between bg-[var(--paper)]/80 backdrop-blur-md border-b border-[var(--line)]">
        <button 
          onClick={step === 1 ? onBack : () => setStep(step - 1)}
          className="p-3 bg-[var(--bg)] rounded-2xl text-[var(--ink)] border border-[var(--line)] active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 mx-4">
          <RFQStepBar step={step} totalSteps={7} />
        </div>
        <div className="w-11" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
          {renderStep()}
      </div>

      {/* Footer */}
      {step < 8 && (
        <div className="p-6 bg-[var(--paper)] border-t border-[var(--line)]">
          <div className="max-w-4xl mx-auto">
            <button
              disabled={!isStepValid()}
              onClick={() => step === 7 ? handleFinalSubmit() : setStep(step + 1)}
              className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all uppercase tracking-widest ${
                isStepValid()
                  ? 'bg-luxury-gold text-[var(--ink)] shadow-xl shadow-luxury-gold/20 active:scale-[0.98]'
                  : 'bg-[var(--paper)] text-[var(--muted)] cursor-not-allowed shadow-none'
              }`}
            >
              {step === 7 ? 'Publish RFQ' : 'Next Section'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
