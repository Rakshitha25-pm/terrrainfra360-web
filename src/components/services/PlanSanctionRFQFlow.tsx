import React, { useState } from 'react';
import { submitServiceRFQ } from '../../lib/serviceRfq';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Building2,
  DraftingCompass,
  Map,
  FileCheck,
  HardHat,
  Scale,
  History,
  Zap,
  Check,
  FileText,
  Clock,
  AlertTriangle,
  Sparkles,
  Landmark,
  Activity,
  Layers,
  ClipboardList,
  ShieldCheck,
  Search,
  Info,
  ArrowUpRight
} from 'lucide-react';
import { RFQStepBar } from './RFQStepBar';

interface PlanSanctionRFQFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

interface PlanSanctionState {
  // Step 1: Project & Sanction Context
  projectType: string;
  projectScale: string;
  authority: string;
  // Step 2: Plan Sanction Requirement
  sanctionRequirement: string[];
  // Step 3: Document Readiness
  documents: string[];
  // Step 4: Technical & Compliance Readiness
  drawingsReady: boolean;
  structuralDetailsAvailable: boolean;
  nocStatus: string;
  siteIrregularity: boolean;
  complianceConcerns: string[];
  // Step 5: Application Status & Case Complexity
  applicationStatus: string;
  complexity: string;
  urgency: string;
  // Step 6: Support Outcome
  supportOutcomes: string[];
  supportDepth: string;
  // Final
  userName: string;
  userPhone: string;
  rfqNumber: string;
}

const BlueprintCard = ({ children, title, step, icon: Icon }: { children: React.ReactNode, title: string, step: number, icon: any }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-luxury-gold/10 rounded-2xl flex items-center justify-center text-luxury-gold shadow-sm">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-lg font-black text-[var(--ink)] tracking-tight">{title}</h3>
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Section 0{step}</p>
      </div>
    </div>
    <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[32px] p-6 shadow-sm space-y-6">
      {children}
    </div>
  </div>
);

const TechnicalOption = ({ selected, onClick, label, icon: Icon, description }: { key?: React.Key, selected: boolean, onClick: () => void, label: string, icon?: any, description?: string }) => (
  <button
    onClick={onClick}
    className={`w-full p-4 rounded-2xl border transition-all text-left flex items-start gap-4 group ${
      selected 
        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold shadow-lg shadow-luxury-gold/5' 
        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--paper)]'
    }`}
  >
    {Icon && (
      <div className={`mt-0.5 p-2 rounded-lg transition-colors ${selected ? 'bg-luxury-gold text-white' : 'bg-[var(--paper)] text-[var(--muted)]'}`}>
        <Icon size={18} />
      </div>
    )}
    <div className="flex-1">
      <p className={`text-[13px] font-black tracking-tight ${selected ? 'text-luxury-gold' : 'text-[var(--ink)]'}`}>{label}</p>
      {description && <p className={`text-[10px] font-medium mt-0.5 ${selected ? 'text-luxury-gold/70' : 'text-[var(--muted)]'}`}>{description}</p>}
    </div>
    {selected && <CheckCircle2 size={18} className="text-luxury-gold shrink-0 mt-1" />}
  </button>
);

const StatusToggle = ({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) => (
  <div className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)]">
    <span className="text-[11px] font-black text-[var(--ink)] uppercase tracking-tight">{label}</span>
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-luxury-gold' : 'bg-[var(--line)]'}`}
    >
      <motion.div 
        animate={{ x: active ? 26 : 2 }}
        className="absolute top-1 left-1 w-4 h-4 bg-[var(--paper)] rounded-full shadow-sm"
      />
    </button>
  </div>
);

export const PlanSanctionRFQFlow: React.FC<PlanSanctionRFQFlowProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<PlanSanctionState>({
    projectType: '',
    projectScale: '',
    authority: '',
    sanctionRequirement: [],
    documents: [],
    drawingsReady: false,
    structuralDetailsAvailable: false,
    nocStatus: '',
    siteIrregularity: false,
    complianceConcerns: [],
    applicationStatus: '',
    complexity: '',
    urgency: '',
    supportOutcomes: [],
    supportDepth: '',
    userName: '',
    userPhone: '',
    rfqNumber: '',
  });

  const isStepValid = () => {
    if (step === 1) return state.projectType !== '' && state.projectScale !== '' && state.authority !== '';
    if (step === 2) return state.sanctionRequirement.length > 0;
    if (step === 3) return state.documents.length > 0;
    if (step === 4) return state.nocStatus !== '';
    if (step === 5) return state.applicationStatus !== '' && state.complexity !== '' && state.urgency !== '';
    if (step === 6) return state.supportOutcomes.length > 0 && state.supportDepth !== '';
    if (step === 7) {
      const phoneRegex = /^[6-9]\d{9}$/;
      return state.userName.trim().length >= 3 && phoneRegex.test(state.userPhone.replace(/\D/g, '').slice(-10));
    }
    return true;
  };

  const generateRFQNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TI360-SANC-${random}`;
  };

  const handleFinalSubmit = () => {
    const rfqNum = generateRFQNumber();
    setState(prev => ({ ...prev, rfqNumber: rfqNum }));
    submitServiceRFQ('Plan Sanction', { ...state, rfqNumber: rfqNum });
    setStep(8);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-4xl font-black text-[var(--ink)] leading-[0.9] tracking-tighter italic">
                PROJECT <span className="text-luxury-gold">CONTEXT.</span>
              </h2>
              <p className="text-[var(--muted)] font-mono text-[10px] uppercase tracking-widest">Technical Parameters & Jurisdiction</p>
            </div>

            <BlueprintCard title="Building Specification" step={1} icon={Building2}>
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Project Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Residential', 'Commercial', 'Mixed Use', 'Apartment Building', 'Villa', 'Small Rental Building'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setState({ ...state, projectType: v })}
                        className={`p-3 rounded-xl text-[11px] font-black border transition-all ${
                          state.projectType === v
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--muted)] hover:border-[var(--line)]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Project Scale</p>
                  <div className="flex flex-wrap gap-2">
                    {['Ground Only', 'G+1', 'G+2', 'G+3', 'G+4+'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setState({ ...state, projectScale: v })}
                        className={`px-4 py-2 rounded-xl text-[11px] font-black border transition-all ${
                          state.projectScale === v
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--muted)]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Sanctioning Authority</p>
                  <div className="grid grid-cols-1 gap-2">
                    {['BBMP / Greater Bengaluru Authority area', 'BDA-linked area', 'Panchayat', 'Not Sure'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setState({ ...state, authority: v })}
                        className={`p-4 rounded-2xl text-[12px] font-black border transition-all text-left flex justify-between items-center ${
                          state.authority === v
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)]'
                        }`}
                      >
                        {v}
                        {state.authority === v && <CheckCircle2 size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </BlueprintCard>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-4xl font-black text-[var(--ink)] leading-[0.9] tracking-tighter italic">
                SANCTION <span className="text-luxury-gold">PATH.</span>
              </h2>
              <p className="text-[var(--muted)] font-mono text-[10px] uppercase tracking-widest">Submission Requirements</p>
            </div>

            <BlueprintCard title="Requirement Matrix" step={2} icon={Layers}>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'Fresh Plan Sanction Application', desc: 'New building proposal submission' },
                  { label: 'Plan Revision / Modified Sanction', desc: 'Changes to existing approved plan' },
                  { label: 'Resubmission After Objection', desc: 'Correcting issues flagged by authority' },
                  { label: 'Deviation / Correction Support', desc: 'Handling technical discrepancies' },
                  { label: 'Sanction Status Follow-up', desc: 'Tracking pending applications' },
                  { label: 'Fee / Demand Note Coordination', desc: 'Payment stage management' },
                  { label: 'End-to-End Plan Sanction Management', desc: 'Full lifecycle ownership' },
                  { label: 'Need Guidance on Applicable Submission Path', desc: 'Expert advisory required' }
                ].map((item) => (
                  <TechnicalOption 
                    key={item.label}
                    label={item.label}
                    description={item.desc}
                    selected={state.sanctionRequirement.includes(item.label)}
                    onClick={() => {
                      const newReqs = state.sanctionRequirement.includes(item.label)
                        ? state.sanctionRequirement.filter(r => r !== item.label)
                        : [...state.sanctionRequirement, item.label];
                      setState({ ...state, sanctionRequirement: newReqs });
                    }}
                  />
                ))}
              </div>
            </BlueprintCard>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-4xl font-black text-[var(--ink)] leading-[0.9] tracking-tighter italic">
                DOCUMENT <span className="text-luxury-gold">VAULT.</span>
              </h2>
              <p className="text-[var(--muted)] font-mono text-[10px] uppercase tracking-widest">Submission Readiness Checklist</p>
            </div>

            <BlueprintCard title="Document Inventory" step={3} icon={FileCheck}>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Sale Deed', 'Khata Certificate / Extract', 'Tax Paid Receipts', 
                  'Survey Sketch', 'Application Forms', 'Affidavits / Indemnity Documents',
                  'Architectural Drawings', 'Structural Drawings', 'Soil Test Report',
                  'Prior Sanctioned Plan / Objection Memo'
                ].map((doc) => (
                  <button
                    key={doc}
                    onClick={() => {
                      const newDocs = state.documents.includes(doc)
                        ? state.documents.filter(d => d !== doc)
                        : [...state.documents, doc];
                      setState({ ...state, documents: newDocs });
                    }}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      state.documents.includes(doc)
                        ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={16} className={state.documents.includes(doc) ? 'text-luxury-gold' : 'text-[var(--muted)]'} />
                      <span className="text-[12px] font-bold">{doc}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${state.documents.includes(doc) ? 'bg-luxury-gold border-luxury-gold text-white' : 'bg-[var(--paper)] border-[var(--line)]'}`}>
                      {state.documents.includes(doc) && <Check size={12} strokeWidth={4} />}
                    </div>
                  </button>
                ))}
              </div>
            </BlueprintCard>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-4xl font-black text-[var(--ink)] leading-[0.9] tracking-tighter italic">
                TECHNICAL <span className="text-luxury-gold">CHECK.</span>
              </h2>
              <p className="text-[var(--muted)] font-mono text-[10px] uppercase tracking-widest">Compliance & Readiness Status</p>
            </div>

            <BlueprintCard title="Compliance Dashboard" step={4} icon={DraftingCompass}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-3">
                  <StatusToggle 
                    label="Architectural Drawings Ready?" 
                    active={state.drawingsReady} 
                    onToggle={() => setState({ ...state, drawingsReady: !state.drawingsReady })} 
                  />
                  <StatusToggle 
                    label="Structural Details Available?" 
                    active={state.structuralDetailsAvailable} 
                    onToggle={() => setState({ ...state, structuralDetailsAvailable: !state.structuralDetailsAvailable })} 
                  />
                  <StatusToggle 
                    label="Site Dimensional Irregularity?" 
                    active={state.siteIrregularity} 
                    onToggle={() => setState({ ...state, siteIrregularity: !state.siteIrregularity })} 
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">NOC Status</p>
                  <div className="grid grid-cols-1 gap-2">
                    {['All Required NOCs Obtained', 'Some NOCs Pending', 'NOCs Not Yet Applied', 'Not Sure'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setState({ ...state, nocStatus: v })}
                        className={`p-4 rounded-2xl text-[12px] font-bold border transition-all text-left ${
                          state.nocStatus === v
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--muted)]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Known Compliance Concerns</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Setbacks', 'Parking', 'Usage Type', 'Height Limits', 'FAR/FSI', 'None'].map((v) => (
                      <button
                        key={v}
                        onClick={() => {
                          const newConcerns = state.complianceConcerns.includes(v)
                            ? state.complianceConcerns.filter(c => c !== v)
                            : [...state.complianceConcerns, v];
                          setState({ ...state, complianceConcerns: newConcerns });
                        }}
                        className={`p-3 rounded-xl text-[11px] font-bold border transition-all ${
                          state.complianceConcerns.includes(v)
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--muted)]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </BlueprintCard>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-4xl font-black text-[var(--ink)] leading-[0.9] tracking-tighter italic">
                CASE <span className="text-luxury-gold">FILE.</span>
              </h2>
              <p className="text-[var(--muted)] font-mono text-[10px] uppercase tracking-widest">Status & Complexity Profile</p>
            </div>

            <BlueprintCard title="Complexity Profile" step={5} icon={History}>
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Application Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Fresh Case', 'Pending File', 'Objection Case', 'Revision Case', 'Architect Change Case', 'Not Sure'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setState({ ...state, applicationStatus: v })}
                        className={`p-3 rounded-xl text-[11px] font-black border transition-all ${
                          state.applicationStatus === v
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--muted)]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Case Complexity</p>
                  <div className="grid grid-cols-1 gap-2">
                    {['Standard Case', 'Multi-NOC Case', 'Delay-Prone Case', 'Objection-Sensitive Case', 'Urgent Sanction Case'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setState({ ...state, complexity: v })}
                        className={`p-4 rounded-2xl text-[12px] font-bold border transition-all text-left ${
                          state.complexity === v
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--muted)]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Urgency</p>
                  <div className="flex gap-2">
                    {['Immediate', 'Within 1 Week', 'Within 1 Month', 'Flexible'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setState({ ...state, urgency: v })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${
                          state.urgency === v
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--muted)]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </BlueprintCard>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-3 gap-4 items-stretch">
            <div className="col-span-3 space-y-2">
              <h2 className="font-display text-4xl font-black text-[var(--ink)] leading-[0.9] tracking-tighter italic">
                SERVICE <span className="text-luxury-gold">SLA.</span>
              </h2>
              <p className="text-[var(--muted)] font-mono text-[10px] uppercase tracking-widest">Support Outcome Expectations</p>
            </div>

            <BlueprintCard title="Support Matrix" step={6} icon={Zap}>
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Desired Outcomes</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      'Document Scrutiny Before Filing', 
                      'Submission Support', 
                      'Authority Follow-up', 
                      'Objection Reply / Resubmission', 
                      'Fee / Demand Note Coordination', 
                      'Site Inspection Coordination', 
                      'Full Sanction Lifecycle Management Until Approval'
                    ].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          const newOutcomes = state.supportOutcomes.includes(item)
                            ? state.supportOutcomes.filter(o => o !== item)
                            : [...state.supportOutcomes, item];
                          setState({ ...state, supportOutcomes: newOutcomes });
                        }}
                        className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                          state.supportOutcomes.includes(item)
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                            : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${state.supportOutcomes.includes(item) ? 'bg-luxury-gold border-luxury-gold text-white' : 'bg-[var(--paper)] border-[var(--line)]'}`}>
                          {state.supportOutcomes.includes(item) && <Check size={12} strokeWidth={4} />}
                        </div>
                        <span className="text-[12px] font-bold">{item}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Support Depth</p>
                  <div className="grid grid-cols-1 gap-2">
                    {['Advisory Only', 'Filing Assistance Only', 'Follow-up Only', 'Complete End-to-End Management'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setState({ ...state, supportDepth: v })}
                        className={`p-4 rounded-2xl text-[12px] font-black border transition-all text-left ${
                          state.supportDepth === v
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                            : 'bg-[var(--paper)] border-[var(--line)] text-[var(--ink)]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </BlueprintCard>
          </motion.div>
        );
      case 7:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pb-32">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-luxury-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-luxury-gold/10">
                <ClipboardList className="w-10 h-10 text-luxury-gold" />
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)] uppercase tracking-tighter italic">Review & <span className="text-luxury-gold">Validate.</span></h2>
              <p className="text-[var(--muted)] text-[10px] font-black uppercase tracking-widest">Final Technical Scrutiny</p>
            </div>

            <div className="space-y-4">
              <div className="bg-luxury-dark text-white rounded-[32px] p-6 space-y-6 shadow-2xl shadow-orange-500/30">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Project Type</p>
                    <p className="text-xs font-bold">{state.projectType}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Scale</p>
                    <p className="text-xs font-bold">{state.projectScale}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Authority</p>
                    <p className="text-xs font-bold">{state.authority}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Complexity</p>
                    <p className="text-xs font-bold">{state.complexity}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Requirements</p>
                    <div className="flex flex-wrap gap-1">
                      {state.sanctionRequirement.map((r, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[var(--paper)]/10 rounded text-[9px] font-bold">{r}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Documents Provided</p>
                    <div className="flex flex-wrap gap-1">
                      {state.documents.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[var(--paper)]/10 rounded text-[9px] font-bold">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Contact Name</p>
                  <input 
                    type="text"
                    value={state.userName}
                    onChange={(e) => setState({ ...state, userName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-6 py-4 bg-[var(--paper)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] focus:outline-none focus:border-luxury-gold transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Mobile Number</p>
                  <input 
                    type="tel"
                    value={state.userPhone}
                    onChange={(e) => setState({ ...state, userPhone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full px-6 py-4 bg-[var(--paper)] border border-[var(--line)] rounded-2xl text-[13px] font-bold text-[var(--ink)] focus:outline-none focus:border-luxury-gold transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 8:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center space-y-8 py-12">
            <div className="relative">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                className="w-32 h-32 bg-luxury-gold rounded-[40px] flex items-center justify-center text-white shadow-2xl shadow-luxury-gold/30"
              >
                <CheckCircle2 size={64} />
              </motion.div>
              <div className="absolute -inset-4 border-2 border-dashed border-luxury-gold/20 rounded-[50px] animate-spin-slow" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[var(--ink)] uppercase tracking-tighter italic">Sanction RFQ <span className="text-luxury-gold">Live.</span></h2>
              <p className="text-[var(--muted)] font-medium text-sm">Your building plan sanction request has been successfully filed.</p>
            </div>

            <div className="bg-[var(--bg)] rounded-[32px] p-8 w-full border border-[var(--line)] space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[var(--line)]">
                <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">File Number</span>
                <span className="text-sm font-black text-[var(--ink)]">{state.rfqNumber}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Current Status</span>
                <span className="px-3 py-1 bg-luxury-gold text-white text-[9px] font-black rounded-full uppercase tracking-widest">Technical Scrutiny</span>
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
      {/* Technical Header */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between bg-[var(--paper)] border-b border-[var(--line)]">
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

      {/* Technical Footer */}
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
              {step === 7 ? 'Execute Filing' : 'Next Section'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
