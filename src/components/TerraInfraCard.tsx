// TerraInfra360 Card — promo section + application form modal.
// Ported from the TI360 app's card application screen: applicant type,
// employment / business details, card tier, applicant details, a live card
// preview, and a working "Submit Application" that persists the request
// (locally always, best-effort to Firestore `card_applications`).
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard, X, User as UserIcon, IdCard, Phone, Mail, Check,
  Building2, Briefcase, TrendingUp, ShieldCheck, Sparkles,
} from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type Applicant = 'Individual' | 'Business';
type Tier = 'Silver' | 'Gold' | 'Platinum';

const TIERS: { id: Tier; grad: string; perk: string }[] = [
  { id: 'Silver', grad: 'linear-gradient(135deg,#9aa3ad,#4b5563)', perk: '1% cashback on materials' },
  { id: 'Gold', grad: 'linear-gradient(135deg,#f6d365,#b8860b)', perk: '3% cashback + priority RFQs' },
  { id: 'Platinum', grad: 'linear-gradient(135deg,#3a4757,#0f172a)', perk: '5% cashback + dedicated manager' },
];

function Segmented<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => {
        const on = o === value;
        return (
          <button key={o} onClick={() => onChange(o)}
            className="py-3 rounded-xl text-[12.5px] font-black cursor-pointer transition-all"
            style={{
              background: on ? 'rgba(249,115,22,0.12)' : '#141110',
              color: on ? '#f97316' : 'rgba(250,250,247,0.6)',
              border: `1.4px solid ${on ? 'rgba(249,115,22,0.55)' : 'rgba(255,255,255,0.08)'}`,
            }}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function FieldInput({ icon: Icon, value, onChange, placeholder, type = 'text' }: { icon: typeof UserIcon; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#141110', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Icon size={16} className="text-orange-500 shrink-0" />
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-transparent outline-none text-sm font-medium text-white placeholder:text-white/30"
      />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 mt-5">{children}</p>;
}

export function CardApplicationModal({ onClose }: { onClose: () => void }) {
  const [applicant, setApplicant] = useState<Applicant>('Individual');
  const [employment, setEmployment] = useState<'Salaried' | 'Self-employed'>('Salaried');
  const [bizType, setBizType] = useState<'Proprietorship' | 'LLP' | 'Private Limited'>('LLP');
  const [nature, setNature] = useState('');
  const [amount, setAmount] = useState('');
  const [tier, setTier] = useState<Tier>('Silver');
  const [name, setName] = useState('');
  const [pan, setPan] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [doneNo, setDoneNo] = useState<string | null>(null);

  const tierObj = TIERS.find((t) => t.id === tier)!;
  const valid = name.trim() && pan.trim() && contact.trim() && email.trim();
  const amountLabel = applicant === 'Individual' && employment === 'Salaried' ? 'Monthly income (Rs)' : 'Monthly turnover (Rs)';

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    const appNo = 'TF-CARD-' + Date.now().toString(36).toUpperCase();
    const data: Record<string, unknown> = {
      applicationNo: appNo,
      applicantType: applicant,
      employment: applicant === 'Individual' ? employment : null,
      businessType: applicant === 'Business' ? bizType : null,
      nature: nature.trim(),
      monthlyAmount: amount.trim(),
      cardTier: tier,
      fullName: name.trim(),
      pan: pan.trim().toUpperCase(),
      contact: contact.trim(),
      email: email.trim(),
    };
    try {
      const list = JSON.parse(localStorage.getItem('tf360_card_apps_v1') || '[]');
      list.unshift({ ...data, createdAt: Date.now() });
      localStorage.setItem('tf360_card_apps_v1', JSON.stringify(list.slice(0, 50)));
    } catch { /* noop */ }
    try {
      await addDoc(collection(db, 'card_applications'), { ...data, userUid: auth.currentUser?.uid || null, createdAt: serverTimestamp() });
    } catch { /* noop */ }
    setBusy(false);
    setDoneNo(appNo);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-[600]" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed inset-x-0 top-[3vh] bottom-[3vh] z-[610] mx-auto w-[min(560px,94vw)] flex flex-col rounded-3xl overflow-hidden"
        style={{ background: '#0a0807', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 90px rgba(0,0,0,0.7)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <CreditCard size={18} className="text-orange-500" />
            <h2 className="text-white font-black text-[15px]">TerraInfra360 Card</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer" style={{ background: '#1a1714' }}>
            <X size={16} className="text-white/60" />
          </button>
        </div>

        {doneNo ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(52,211,153,0.15)' }}>
              <Check size={40} className="text-emerald-400" />
            </div>
            <h3 className="text-white font-black text-xl">Application submitted</h3>
            <p className="text-white/55 text-sm mt-2 leading-relaxed">Your TerraInfra360 {tier} Card application is in. Our team will reach out on {contact || 'your number'} within 48 hours.</p>
            <p className="text-orange-500 font-black tracking-wider mt-4 text-sm">{doneNo}</p>
            <button onClick={onClose} className="mt-7 px-8 py-3 rounded-full text-white font-black text-xs uppercase tracking-widest cursor-pointer" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>Done</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
              {/* live card preview */}
              <div className="rounded-2xl p-5 mb-2 relative overflow-hidden" style={{ background: tierObj.grad, minHeight: 150 }}>
                <div className="flex items-start justify-between">
                  <span className="text-white font-black tracking-tight text-lg">TerraInfra360</span>
                  <span className="text-white/90 text-[11px] font-black uppercase tracking-[0.2em]">{tier}</span>
                </div>
                <div className="w-11 h-8 rounded-md mt-6" style={{ background: 'rgba(255,255,255,0.35)' }} />
                <p className="text-white/95 font-bold tracking-wider mt-6 uppercase text-sm">{name || 'YOUR NAME'}</p>
                <p className="text-white/70 text-[10px] mt-1">{tierObj.perk}</p>
              </div>

              <Label>Your details</Label>
              <div className="space-y-2.5">
                <FieldInput icon={UserIcon} value={name} onChange={setName} placeholder="Full name" />
                <FieldInput icon={IdCard} value={pan} onChange={setPan} placeholder="PAN number" />
                <FieldInput icon={Phone} value={contact} onChange={setContact} placeholder="Contact number" type="tel" />
                <FieldInput icon={Mail} value={email} onChange={setEmail} placeholder="Email address" type="email" />
              </div>
              <Label>Applicant type</Label>
              <Segmented options={['Individual', 'Business'] as Applicant[]} value={applicant} onChange={setApplicant} />

              {applicant === 'Individual' ? (
                <>
                  <Label>Employment</Label>
                  <Segmented options={['Salaried', 'Self-employed'] as ('Salaried' | 'Self-employed')[]} value={employment} onChange={setEmployment} />
                  {employment === 'Self-employed' && (
                    <div className="mt-3"><FieldInput icon={Briefcase} value={nature} onChange={setNature} placeholder="Nature of employment" /></div>
                  )}
                </>
              ) : (
                <>
                  <Label>Business</Label>
                  <Segmented options={['Proprietorship', 'LLP', 'Private Limited'] as ('Proprietorship' | 'LLP' | 'Private Limited')[]} value={bizType} onChange={setBizType} />
                  <div className="mt-3"><FieldInput icon={Building2} value={nature} onChange={setNature} placeholder="Nature of business" /></div>
                </>
              )}
              <div className="mt-3"><FieldInput icon={TrendingUp} value={amount} onChange={setAmount} placeholder={amountLabel} type="number" /></div>

              <Label>Card preference</Label>
              <div className="grid grid-cols-3 gap-3">
                {TIERS.map((tt) => {
                  const on = tt.id === tier;
                  return (
                    <button key={tt.id} onClick={() => setTier(tt.id)}
                      className="rounded-xl p-2 cursor-pointer transition-all flex flex-col items-center gap-2"
                      style={{ background: '#141110', border: `1.4px solid ${on ? 'rgba(249,115,22,0.6)' : 'rgba(255,255,255,0.08)'}` }}>
                      <div className="w-full h-10 rounded-md" style={{ background: tt.grad }} />
                      <span className="text-[11px] font-black" style={{ color: on ? '#f97316' : 'rgba(250,250,247,0.7)' }}>{tt.id}</span>
                    </button>
                  );
                })}
              </div>

              <div className="h-2" />
            </div>

            <div className="px-5 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <button onClick={submit} disabled={!valid || busy}
                className="w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest cursor-pointer disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 10px 26px rgba(249,115,22,0.3)' }}>
                {busy ? 'Submitting...' : 'Submit Application'}
              </button>
              {!valid && <p className="text-center text-[11px] text-white/35 mt-2">Fill name, PAN, contact and email to apply.</p>}
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}

export function TerraInfraCardSection() {
  const [open, setOpen] = useState(false);
  return (
    <section className="py-20 px-6 bg-[#0a0807] border-t border-white/5">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* clickable card visual */}
        <button onClick={() => setOpen(true)} className="group text-left cursor-pointer" aria-label="Apply for the TerraInfra360 Card">
          <div className="rounded-3xl p-7 relative overflow-hidden transition-transform group-hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg,#3a4757,#0f172a)', minHeight: 220, boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
            <div className="flex items-start justify-between">
              <span className="text-white font-black tracking-tight text-2xl">TerraInfra360</span>
              <CreditCard size={26} className="text-white/80" />
            </div>
            <div className="w-14 h-10 rounded-md mt-10" style={{ background: 'rgba(255,255,255,0.35)' }} />
            <div className="flex items-end justify-between mt-8">
              <p className="text-white/90 font-bold tracking-[0.2em] uppercase text-sm">Build Your Legacy</p>
              <span className="text-white/70 text-[11px] font-black uppercase tracking-[0.2em]">Platinum</span>
            </div>
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full" style={{ background: 'rgba(249,115,22,0.18)', filter: 'blur(40px)' }} />
          </div>
        </button>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">TerraInfra360 Card</span>
          </div>
          <h2 className="text-white leading-[1.05] mb-4" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 600, fontSize: 'clamp(2rem,4vw,3.2rem)', letterSpacing: '-1px' }}>
            One card for every build.
          </h2>
          <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-md">
            Cashback on materials, priority RFQs, and flexible limits for individuals and businesses. Choose Silver, Gold or Platinum.
          </p>
          <div className="space-y-2.5 mb-8">
            {[
              { i: Sparkles, t: 'Up to 5% cashback on every material purchase' },
              { i: ShieldCheck, t: 'Backed by AU Small Finance Bank, RBI approved' },
              { i: TrendingUp, t: 'Limits that scale with your monthly turnover' },
            ].map((b, n) => (
              <div key={n} className="flex items-center gap-3">
                <b.i size={16} className="text-orange-500 shrink-0" />
                <span className="text-white/75 text-sm">{b.t}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-black text-xs uppercase tracking-widest cursor-pointer hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 10px 26px rgba(249,115,22,0.3)' }}>
            <CreditCard size={15} /> Apply for the Card
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && <CardApplicationModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}
