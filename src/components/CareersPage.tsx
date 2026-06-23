import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ArrowRight, MapPin, Briefcase, Clock, Users,
  TrendingUp, BookOpen, Heart, Zap, CheckCircle2, X,
  Building2, Search, Send, ChevronRight, Star,
} from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const WHY_US = [
  {
    icon: TrendingUp,
    title: 'Career Growth',
    desc: 'Clear progression paths with mentorship, skill development programs, and fast-track opportunities for high performers.',
  },
  {
    icon: Zap,
    title: 'Innovative Projects',
    desc: 'Work on cutting-edge real estate tech, construction platforms, and digital-first solutions that shape the industry.',
  },
  {
    icon: Users,
    title: 'Collaborative Team',
    desc: 'A flat, inclusive culture where every voice matters. Work alongside architects, engineers, designers, and tech leaders.',
  },
  {
    icon: BookOpen,
    title: 'Learning & Development',
    desc: 'Sponsored certifications, weekly knowledge sessions, access to industry conferences, and an internal learning library.',
  },
];

const PERKS = [
  'Competitive salary + performance bonus',
  'Health & dental insurance',
  'Flexible work hours',
  'Remote-friendly roles',
  'Annual team retreats',
  'Equipment allowance',
  'Paid parental leave',
  'Learning budget ₹25,000/year',
];

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  experience: string;
  openings: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
  salary?: string;
  postedDays: number;
}

const JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Senior Full-Stack Engineer',
    department: 'Technology',
    location: 'Bengaluru / Remote',
    type: 'Full-time',
    experience: '4–7 years',
    openings: 2,
    description: 'Build and scale the core TerraInfra 360 platform — from real estate listing flows to RFQ automation and vendor management systems.',
    responsibilities: [
      'Design and develop scalable backend services using Node.js / Python',
      'Build responsive React + TypeScript frontend features',
      'Integrate Firebase, Firestore, and third-party APIs',
      'Collaborate with product, design, and construction domain experts',
      'Conduct code reviews and mentor junior engineers',
      'Participate in architecture planning and technical roadmap',
    ],
    requirements: [
      '4+ years of full-stack development experience',
      'Proficiency in React, TypeScript, and Node.js',
      'Experience with Firebase or similar BaaS platforms',
      'Strong understanding of REST APIs and data modeling',
      'Excellent problem-solving and communication skills',
    ],
    niceToHave: [
      'Experience in real estate or construction tech',
      'Knowledge of Tailwind CSS and component libraries',
      'Familiarity with CI/CD and cloud infrastructure',
    ],
    salary: '₹18L – ₹32L per annum',
    postedDays: 3,
  },
  {
    id: 'j2',
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Bengaluru',
    type: 'Full-time',
    experience: '2–5 years',
    openings: 1,
    description: 'Own the end-to-end design experience for our web and mobile platform — from user research to pixel-perfect handoffs.',
    responsibilities: [
      'Design user flows, wireframes, and high-fidelity prototypes',
      'Conduct user research, usability testing, and competitive audits',
      'Maintain and evolve the TerraInfra 360 design system',
      'Collaborate closely with engineering for faithful implementation',
      'Design marketing assets and landing pages',
    ],
    requirements: [
      '2+ years of product design experience',
      'Proficiency in Figma and prototyping tools',
      'Strong portfolio demonstrating UX thinking and visual craft',
      'Experience designing for mobile-first, responsive applications',
      'Ability to work in a fast-paced, iterative environment',
    ],
    niceToHave: [
      'Experience designing for real estate or fintech products',
      'Basic understanding of HTML/CSS',
      'Motion design skills (Lottie, After Effects)',
    ],
    salary: '₹10L – ₹18L per annum',
    postedDays: 7,
  },
  {
    id: 'j3',
    title: 'Business Development Manager',
    department: 'Sales & Growth',
    location: 'Bengaluru',
    type: 'Full-time',
    experience: '3–6 years',
    openings: 2,
    description: 'Drive vendor partnerships, property listings, and B2B client acquisition across Bengaluru and expand to new markets.',
    responsibilities: [
      'Identify and onboard new vendors, contractors, and property developers',
      'Manage the full sales cycle from lead generation to deal closure',
      'Build long-term relationships with real estate developers and investors',
      'Collaborate with marketing to create targeted outreach campaigns',
      'Track pipeline metrics and report to leadership weekly',
    ],
    requirements: [
      '3+ years in B2B sales, real estate, or construction industry',
      'Strong negotiation and relationship-building skills',
      'Excellent communication in Kannada, Hindi, and English',
      'Proven track record of meeting or exceeding targets',
    ],
    niceToHave: [
      'Existing network in Bengaluru real estate market',
      'Experience with CRM tools like Salesforce or HubSpot',
    ],
    salary: '₹12L – ₹22L + incentives',
    postedDays: 5,
  },
  {
    id: 'j4',
    title: 'Construction Project Manager',
    department: 'Operations',
    location: 'Bengaluru',
    type: 'Full-time',
    experience: '5–10 years',
    openings: 1,
    description: 'Oversee end-to-end construction projects for residential and commercial clients — from planning and procurement to handover.',
    responsibilities: [
      'Lead project planning, scheduling, and budgeting',
      'Coordinate with architects, structural engineers, and contractors',
      'Conduct regular site visits and quality inspections',
      'Manage client communication and project status reporting',
      'Ensure compliance with local building codes and safety standards',
      'Resolve on-site issues and vendor disputes promptly',
    ],
    requirements: [
      'B.E. / B.Tech in Civil Engineering or Architecture',
      '5+ years of residential or commercial project management',
      'Experience using AutoCAD, MS Project, or similar tools',
      'Strong leadership and conflict resolution skills',
      'Familiarity with Bengaluru construction regulations',
    ],
    salary: '₹14L – ₹24L per annum',
    postedDays: 10,
  },
  {
    id: 'j5',
    title: 'Digital Marketing Specialist',
    department: 'Marketing',
    location: 'Remote / Bengaluru',
    type: 'Full-time',
    experience: '2–4 years',
    openings: 1,
    description: 'Own our digital presence — SEO, paid ads, social media, and content marketing — to grow brand awareness and qualified leads.',
    responsibilities: [
      'Plan and execute SEO, SEM, and social media campaigns',
      'Manage Meta, Google, and LinkedIn ad accounts',
      'Create and publish engaging content across platforms',
      'Track performance metrics and optimize for ROI',
      'Collaborate with design for creatives and landing pages',
    ],
    requirements: [
      '2+ years of digital marketing experience',
      'Hands-on experience with Google Ads and Meta Ads Manager',
      'Strong analytical skills with Google Analytics / GA4',
      'Excellent copywriting and content creation skills',
    ],
    niceToHave: [
      'Experience marketing real estate or construction brands',
      'Video editing skills for reels and shorts',
      'Knowledge of marketing automation tools',
    ],
    salary: '₹8L – ₹14L per annum',
    postedDays: 2,
  },
  {
    id: 'j6',
    title: 'Interior Design Consultant',
    department: 'Design & Services',
    location: 'Bengaluru',
    type: 'Full-time',
    experience: '2–5 years',
    openings: 3,
    description: 'Help homeowners and commercial clients transform their spaces — from concept and mood boards to execution oversight.',
    responsibilities: [
      'Meet clients to understand their vision, needs, and budget',
      'Prepare space plans, 3D renders, and material specifications',
      'Source and recommend furniture, fittings, and finishes',
      'Coordinate with vendors and contractors during execution',
      'Ensure design quality and timely delivery',
    ],
    requirements: [
      'Degree or diploma in Interior Design or Architecture',
      '2+ years of residential or commercial interior design',
      'Proficiency in AutoCAD, SketchUp, or 3ds Max',
      'Strong aesthetic sensibility and client communication skills',
    ],
    salary: '₹6L – ₹12L per annum',
    postedDays: 8,
  },
];

const DEPARTMENTS = ['All', 'Technology', 'Design', 'Sales & Growth', 'Operations', 'Marketing', 'Design & Services'];

// ── Apply Modal ───────────────────────────────────────────────────────────────

function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', linkedin: '', notice: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.phone) return;
    setSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="w-full sm:max-w-lg bg-[var(--paper)] rounded-t-[2rem] sm:rounded-[2rem] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--paper)]/95 backdrop-blur-sm px-6 py-4 border-b border-[var(--line)] flex items-center justify-between rounded-t-[2rem]">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">Apply for</p>
            <h3 className="font-serif text-lg font-bold text-[var(--ink)]">{job.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--ink)]/5 flex items-center justify-center hover:bg-[var(--ink)]/10 transition-colors">
            <X className="w-4 h-4 text-[var(--ink)]" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-serif font-bold mb-2 text-[var(--ink)]">Application Submitted!</h4>
              <p className="text-[var(--muted)] text-sm mb-6">Our HR team will review your profile and get back to you within 5–7 business days.</p>
              <button onClick={onClose} className="px-8 py-3 bg-luxury-dark text-white text-xs font-bold tracking-widest uppercase rounded-full hover:bg-luxury-gold transition-all">Close</button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Full Name *', key: 'name' as const, placeholder: 'Your full name', type: 'text' },
                { label: 'Email Address *', key: 'email' as const, placeholder: 'your@email.com', type: 'email' },
                { label: 'Phone Number *', key: 'phone' as const, placeholder: '10-digit mobile number', type: 'tel' },
                { label: 'LinkedIn / Portfolio URL', key: 'linkedin' as const, placeholder: 'https://linkedin.com/in/...', type: 'url' },
                { label: 'Notice Period', key: 'notice' as const, placeholder: 'e.g. Immediate / 30 days / 60 days', type: 'text' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-1.5 block">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    className="w-full h-12 px-4 rounded-xl bg-[var(--ink)]/5 border-none outline-none text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:ring-2 focus:ring-luxury-gold/20"
                    value={form[key]}
                    onChange={e => set(key, key === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value)}
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-1.5 block">Why do you want to join TerraInfra 360?</label>
                <textarea
                  placeholder="Tell us a bit about yourself and why this role excites you..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--ink)]/5 border-none text-sm text-[var(--ink)] placeholder:text-[var(--muted)] resize-none outline-none focus:ring-2 focus:ring-luxury-gold/20"
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                />
              </div>
              <button
                className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 bg-luxury-dark text-white text-sm hover:bg-luxury-gold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!form.name || !form.email || !form.phone}
                onClick={handleSubmit}
              >
                <Send className="w-4 h-4" /> Submit Application
              </button>
              <p className="text-[10px] text-[var(--muted)] text-center">
                We respect your privacy. Your information will only be used for this application.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Job Detail View ───────────────────────────────────────────────────────────

function JobDetail({ job, onBack, onApply }: { job: Job; onBack: () => void; onApply: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-[var(--bg)]"
    >
      <div className="sticky top-0 z-10 bg-[var(--paper)]/90 backdrop-blur-xl border-b border-[var(--line)]">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
          <button onClick={onBack} className="w-9 h-9 rounded-full hover:bg-[var(--ink)]/5 flex items-center justify-center transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4 text-[var(--ink)]" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">Job Details</p>
            <p className="font-bold text-sm truncate text-[var(--ink)]">{job.title}</p>
          </div>
          <button
            onClick={onApply}
            className="px-5 h-9 rounded-full text-xs font-bold uppercase tracking-wider bg-luxury-dark text-white hover:bg-luxury-gold transition-all shrink-0"
          >
            Apply Now
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--ink)]/8 text-[var(--ink)]">{job.department}</span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-[var(--line)] text-[var(--ink)]">{job.type}</span>
            {job.openings > 1 && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">{job.openings} openings</span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold mb-4 text-[var(--ink)]">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)] mb-4">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{job.experience}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />Posted {job.postedDays}d ago</span>
          </div>
          {job.salary && (
            <div className="inline-flex items-center gap-2 bg-luxury-gold/10 text-luxury-gold px-4 py-2 rounded-full text-sm font-bold">
              <Star className="w-3.5 h-3.5" /> {job.salary}
            </div>
          )}
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-serif font-bold mb-3 text-[var(--ink)]">About the Role</h2>
          <p className="text-[var(--muted)] leading-relaxed">{job.description}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-serif font-bold mb-4 text-[var(--ink)]">What You'll Do</h2>
          <ul className="space-y-3">
            {job.responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-luxury-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-luxury-gold" />
                </div>
                <span className="text-sm leading-relaxed text-[var(--ink)]">{r}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-serif font-bold mb-4 text-[var(--ink)]">What We're Looking For</h2>
          <ul className="space-y-3">
            {job.requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--ink)]/5 flex items-center justify-center shrink-0 mt-0.5">
                  <ChevronRight className="w-3 h-3 text-[var(--ink)]" />
                </div>
                <span className="text-sm leading-relaxed text-[var(--ink)]">{r}</span>
              </li>
            ))}
          </ul>
        </section>

        {job.niceToHave && (
          <section className="mb-8">
            <h2 className="text-lg font-serif font-bold mb-4 text-[var(--ink)]">Nice to Have</h2>
            <ul className="space-y-2">
              {job.niceToHave.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-[var(--muted)]">
                  <span className="text-luxury-gold mt-1">+</span>
                  <span className="text-sm leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 p-6 rounded-2xl bg-luxury-gold/5 border border-luxury-gold/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-base mb-1 text-[var(--ink)]">Interested in this role?</p>
            <p className="text-[var(--muted)] text-sm">Apply now — we review applications within 5–7 business days.</p>
          </div>
          <button onClick={onApply} className="px-8 h-12 rounded-full font-bold shrink-0 gap-2 bg-luxury-dark text-white hover:bg-luxury-gold transition-all flex items-center text-sm">
            <Send className="w-4 h-4" /> Apply Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CareersPage({ onBack }: { onBack: () => void }) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [activeDept, setActiveDept] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = JOBS.filter(j => {
    const matchDept = activeDept === 'All' || j.department === activeDept;
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  if (selectedJob) {
    return (
      <>
        <JobDetail
          job={selectedJob}
          onBack={() => setSelectedJob(null)}
          onApply={() => setApplyJob(selectedJob)}
        />
        <AnimatePresence>
          {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[420px] md:min-h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/images/landing/services_bg.jpg"
            alt="Office culture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-zinc-950/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 py-24">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-10 bg-white/40" />
              <span className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-bold">We're Hiring</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white leading-tight mb-5">
              Build the Future of <br /><span className="italic font-light">Real Estate</span>
            </h1>
            <p className="text-white/60 text-base md:text-lg font-light leading-relaxed mb-8 max-w-xl">
              Join TerraInfra 360 and work at the intersection of construction, technology, and design. We're building the platform that transforms how India builds and invests.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#positions">
                <button className="rounded-full h-12 px-8 bg-white text-zinc-900 hover:bg-white/90 font-bold text-sm gap-2 flex items-center transition-all">
                  View Open Positions <ArrowRight className="w-4 h-4" />
                </button>
              </a>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white text-sm">
                <Building2 className="w-4 h-4 text-white/60" />
                <span className="font-medium">{JOBS.length} open roles</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Why Work With Us ──────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-[var(--bg)]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 md:mb-12">
            <motion.span
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-luxury-gold/80 text-xs uppercase tracking-[0.2em] font-bold mb-2 block"
            >
              Life at TerraInfra 360
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl md:text-4xl font-serif font-bold text-[var(--ink)]"
            >
              Why Work With Us
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {WHY_US.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] hover:shadow-lg hover:border-luxury-gold/20 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-luxury-gold" />
                  </div>
                  <h3 className="font-bold text-base mb-2 text-[var(--ink)]">{item.title}</h3>
                  <p className="text-[var(--muted)] text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Perks strip */}
          <motion.div
            initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-8 p-6 rounded-2xl bg-[var(--ink)]/5 border border-[var(--line)]"
          >
            <p className="text-xs uppercase tracking-widest font-bold text-[var(--muted)] mb-4 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-luxury-gold" /> Employee Perks & Benefits
            </p>
            <div className="flex flex-wrap gap-2">
              {PERKS.map((p, i) => (
                <span key={i} className="px-3 py-1.5 bg-[var(--paper)] rounded-full text-xs font-medium border border-[var(--line)] flex items-center gap-1.5 text-[var(--ink)]">
                  <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" /> {p}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Open Positions ────────────────────────────────────────── */}
      <section id="positions" className="py-14 md:py-20 bg-[var(--ink)]/[0.03]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <motion.span
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="text-luxury-gold/80 text-xs uppercase tracking-[0.2em] font-bold mb-2 block"
              >
                {filtered.length} Position{filtered.length !== 1 ? 's' : ''} Available
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[var(--ink)]">Open Positions</h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                placeholder="Search roles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 h-10 rounded-full bg-[var(--paper)] border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)] outline-none focus:ring-2 focus:ring-luxury-gold/20 px-4"
              />
            </div>
          </div>

          {/* Department filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {DEPARTMENTS.map(dept => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  activeDept === dept
                    ? 'bg-luxury-dark text-white border-luxury-dark shadow-md'
                    : 'bg-[var(--paper)] border-[var(--line)] text-[var(--muted)] hover:border-luxury-gold/30 hover:text-luxury-gold'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Job Cards */}
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-16 text-[var(--muted)]"
              >
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No positions found for "{search}"</p>
                <p className="text-sm mt-1">Try a different search term or department filter.</p>
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {filtered.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="bg-[var(--paper)] rounded-2xl border border-[var(--line)] p-5 hover:shadow-md hover:border-luxury-gold/20 transition-all duration-200 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--ink)]/8 text-[var(--ink)]">{job.department}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[var(--line)] text-[var(--ink)]">{job.type}</span>
                          {job.openings > 1 && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">{job.openings} openings</span>
                          )}
                          <span className="text-[10px] text-[var(--muted)] font-medium">{job.postedDays}d ago</span>
                        </div>
                        <h3 className="font-serif text-lg font-bold mb-1 group-hover:text-luxury-gold transition-colors text-[var(--ink)]">{job.title}</h3>
                        <p className="text-[var(--muted)] text-sm leading-relaxed line-clamp-2 mb-3">{job.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.experience}</span>
                          {job.salary && <span className="flex items-center gap-1 text-luxury-gold font-bold"><Star className="w-3.5 h-3.5" />{job.salary}</span>}
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <button
                          className="rounded-full h-9 px-4 text-xs font-bold border border-[var(--line)] text-[var(--ink)] hover:border-luxury-gold hover:text-luxury-gold transition-all"
                          onClick={() => setSelectedJob(job)}
                        >
                          View Details
                        </button>
                        <button
                          className="rounded-full h-9 px-4 text-xs font-bold gap-1.5 bg-luxury-dark text-white hover:bg-luxury-gold transition-all flex items-center"
                          onClick={() => { setSelectedJob(job); setApplyJob(job); }}
                        >
                          Apply Now <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Join CTA ──────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-luxury-dark">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-2xl"
          >
            <p className="text-white/40 text-xs uppercase tracking-[0.3em] font-bold mb-3">Don't see the right role?</p>
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
              Send us your <span className="italic font-light">resume anyway</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              We're always on the lookout for exceptional talent. Drop your CV and we'll reach out when a matching opportunity comes up.
            </p>
            <a href="mailto:careers@terrainfra360.com">
              <button className="rounded-full h-12 px-8 bg-white text-zinc-900 hover:bg-luxury-gold hover:text-white font-bold text-sm gap-2 flex items-center transition-all">
                <Send className="w-4 h-4" /> Send Your Resume
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}
      </AnimatePresence>
    </div>
  );
}
