import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'motion/react';
import {
  Menu, X, ShoppingBag, Heart, Search, ArrowRight, ArrowLeft, Plus,
  MapPin, Instagram, Linkedin, Globe, Phone, Mail,
  ChevronRight, Star, Home, PenTool, Layout, Layers,
  Building2, Briefcase, ShieldCheck, Send, MessageSquare, User, Wrench,
  Check, Crown, Bed, Bath, Maximize, Car, Wifi, Zap, Key, Droplets,
  TrendingUp, Award, Users, Clock, Flame, Target, Download,
  Sun, Moon,
} from 'lucide-react';
import { useTheme } from './lib/theme';
import { PACKAGES } from './components/services/packages-data';

const PKG_PRICES: Record<string, string> = {
  standard: '₹1,980',
  classic: '₹2,150',
  premium: '₹2,450',
  signature_elite: '₹2,950',
};

import ServicesSection from './views/services/ServicesSection';
import PropertiesPage, { PostPropertyModal } from './views/properties/PropertiesPage';
import TI360Shop from './views/ti360shop';
import CareersPage from './components/CareersPage';
import { SignupModal } from './components/SignupModal';
import { LoginModal, getLoggedInPhone } from './components/LoginModal';
import { NotificationBell } from './components/NotificationBell';
import { FlutterHome } from './components/FlutterHome';
import { PortalEntryModal, type PortalKind } from './components/PortalEntry';
import { PortalFrame } from './components/PortalFrame';
import { ContractorPortal } from './components/ContractorPortal';
import { VendorPortal } from './components/VendorPortal';
import { ProfilePage } from './views/profile/ProfilePage';
import { PropertyDetailOverlay } from './views/properties/components/PropertyDetailOverlay';
import { useT } from './lib/i18n';

/* ─── Animated Counter ─────────────────────────── */
const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── Custom Cursor ─────────────────────────────── */
const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const innerSpring = { damping: 28, stiffness: 800 };
  const outerSpring = { damping: 18, stiffness: 250 };
  const ix = useSpring(cursorX, innerSpring);
  const iy = useSpring(cursorY, innerSpring);
  const ox = useSpring(cursorX, outerSpring);
  const oy = useSpring(cursorY, outerSpring);

  useEffect(() => {
    const move = (e: MouseEvent) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[9999] bg-orange-500"
        style={{ translateX: ix, translateY: iy, left: -6, top: -6, boxShadow: '0 0 12px rgba(249,115,22,0.9)' }}
      />
      <motion.div
        className="fixed top-0 left-0 w-9 h-9 rounded-full pointer-events-none z-[9998] border border-orange-500/60"
        style={{ translateX: ox, translateY: oy, left: -18, top: -18 }}
      />
    </>
  );
};

/* ─── Marquee Band ──────────────────────────────── */
const MarqueeBand = ({
  items, reverse = false, speed = 30, bg = 'dark'
}: {
  items: string[]; reverse?: boolean; speed?: number; bg?: 'dark' | 'orange' | 'gray';
}) => {
  const bgClass = bg === 'orange' ? 'bg-orange-500' : bg === 'gray' ? 'bg-neutral-900' : 'bg-black';
  const textClass = bg === 'orange' ? 'text-black' : 'text-white/25';
  const accentClass = bg === 'orange' ? 'text-white' : 'text-orange-500';

  return (
    <div className={`${bgClass} py-4 overflow-hidden whitespace-nowrap border-y border-white/5 select-none`}>
      <motion.div
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
        className="inline-flex"
      >
        {[...Array(2)].map((_, ri) => (
          <span key={ri} className="inline-flex items-center">
            {items.map((item, i) => (
              <span key={i} className="inline-flex items-center">
                <span className={`text-sm font-black uppercase tracking-[0.35em] mx-6 ${textClass}`}>{item}</span>
                <span className={`text-lg mx-4 ${accentClass}`}>✦</span>
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

/* ─── Contact Modal ─────────────────────────────── */
const ContactModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const subjects = ['General Inquiry', 'Construction Project', 'Property Inquiry', 'Service Request', 'Career', 'Vendor / Contractor'];

  const handleSubmit = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
        className="bg-[#111] w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-[2rem] border border-white/8 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 orange-gradient-bg" />
        <div className="p-7">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white leading-tight tracking-tight">Get In Touch</h2>
              <p className="text-[9px] text-orange-500 uppercase tracking-[0.3em] mt-1 font-bold">Response within 24 hours</p>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1"><X size={20} /></button>
          </div>

          {submitted ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-10 text-center">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow-pulse"
              >
                <Check size={28} className="text-white" />
              </motion.div>
              <h3 className="text-xl font-black text-white mb-2">Message Sent!</h3>
              <p className="text-white/40 text-sm">Our team will reach out to you shortly.</p>
              <button onClick={onClose} className="mt-6 px-8 py-3 bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:opacity-90 transition-all">
                Close
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-orange-500 mb-1.5 ml-1">Full Name *</p>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500/50 transition-colors" />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-orange-500 mb-1.5 ml-1">Phone *</p>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500/50 transition-colors" />
                </div>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-orange-500 mb-1.5 ml-1">Email</p>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500/50 transition-colors" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-orange-500 mb-1.5 ml-1">Subject</p>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500/50 transition-colors">
                  <option value="" className="bg-[#111]">Select a subject...</option>
                  {subjects.map(s => <option key={s} value={s} className="bg-[#111]">{s}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-orange-500 mb-1.5 ml-1">Message *</p>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your project..." rows={4} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500/50 transition-colors resize-none" />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!form.name || !form.phone || !form.message}
                className="w-full py-4 orange-gradient-bg text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-xl shadow-lg shadow-orange-500/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
                <Send size={14} /> Send Message
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Package Detail Page ───────────────────────── */
const PKG_HERO: Record<string, string> = {
  standard:       'bg-gradient-to-br from-neutral-900 to-black',
  classic:        'bg-gradient-to-br from-black via-neutral-900 to-orange-950/30',
  premium:        'bg-gradient-to-br from-orange-950 to-black',
  signature_elite:'bg-gradient-to-br from-black via-neutral-900 to-orange-900/20',
};

const PackageDetailPage = ({
  pkg, onBack, onGetQuote,
}: {
  pkg: typeof PACKAGES[0]; onBack: () => void; onGetQuote: () => void;
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const isSignature = pkg.id === 'signature_elite';
  const currentSpec = pkg.specCategories[activeTab];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      className="fixed inset-0 z-[400] bg-black flex flex-col overflow-hidden"
    >
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-md border-b border-white/8 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full border border-white/10 hover:border-orange-500 hover:text-orange-500 transition-all text-white/60">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">{pkg.name} Package</h2>
            <p className="text-[8px] text-orange-500 uppercase tracking-[0.25em] font-bold mt-0.5">{PKG_PRICES[pkg.id]} / sqft</p>
          </div>
        </div>
        <button onClick={onGetQuote} className="px-6 py-2.5 orange-gradient-bg text-white text-[9px] font-black uppercase tracking-[0.25em] rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25">
          <Send size={12} /> Get Quote
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className={`${PKG_HERO[pkg.id]} py-16 px-8 md:px-16 relative overflow-hidden`}>
          <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
          <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-white/30 text-[8px] uppercase tracking-[0.4em] mb-3 font-bold">TerraInfra 360 — Construction Package</p>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-none tracking-tighter">{pkg.name}</h1>
            <p className="text-white/50 text-base font-light leading-relaxed mb-8">{pkg.idealFor}</p>
            <div className="flex flex-wrap gap-3">
              {pkg.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-orange-500/20 text-white/70 text-xs font-medium">
                  <Check size={11} className="text-orange-500 shrink-0" /> {h}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute right-12 top-1/2 -translate-y-1/2 text-right hidden lg:block">
            <p className="text-white/20 text-[8px] uppercase tracking-widest mb-2">Starting from</p>
            <p className="text-7xl font-black text-orange-500 leading-none">{PKG_PRICES[pkg.id]}</p>
            <p className="text-white/25 text-sm mt-2">per sqft · 6–8 months</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 bg-black">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-60 shrink-0">
              <p className="text-[8px] font-black uppercase tracking-[0.35em] text-white/25 mb-4 px-1">Specifications</p>
              <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
                {pkg.specCategories.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <button key={i} onClick={() => setActiveTab(i)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap shrink-0 transition-all ${activeTab === i ? 'bg-orange-500 text-white' : 'bg-white/5 border border-white/8 text-white/40 hover:text-white/70'}`}>
                      <Icon size={12} /> {cat.label}
                    </button>
                  );
                })}
              </div>
              <div className="hidden lg:flex flex-col gap-1">
                {pkg.specCategories.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <button key={i} onClick={() => setActiveTab(i)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${activeTab === i ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}>
                      <Icon size={16} className="shrink-0" /> {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-[#111] rounded-[2rem] border border-white/5 p-8">
                  <div className="flex items-center gap-3 mb-8">
                    {(() => { const Icon = currentSpec.icon; return <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0"><Icon size={20} className="text-orange-500" /></div>; })()}
                    <h3 className="text-2xl font-black text-white tracking-tight">{currentSpec.label}</h3>
                  </div>
                  <div className="space-y-3">
                    {currentSpec.items.map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-3 p-4 rounded-xl bg-white/3 border border-white/5">
                        <div className="w-6 h-6 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={12} className="text-orange-500" />
                        </div>
                        <span className="text-sm text-white/70 leading-relaxed">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  {isSignature && pkg.signatureAddOns && activeTab === 0 && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-5">Exclusive Add-ons</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {pkg.signatureAddOns.map((addon, i) => (
                          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-white text-xs font-medium">
                            <Crown size={11} className="text-orange-500 shrink-0" /> {addon}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-12 p-10 rounded-[2.5rem] bg-[#111] border border-white/5 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/8 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <p className="text-white/25 text-[8px] uppercase tracking-[0.4em] mb-3">Ready to build?</p>
              <h3 className="text-3xl font-black mb-3 tracking-tight">Interested in the {pkg.name} Package?</h3>
              <p className="text-white/40 text-sm mb-8 max-w-md mx-auto leading-relaxed">Submit your plot details and get a detailed quote tailored to your requirements within 24 hours.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={onGetQuote} className="px-10 py-4 orange-gradient-bg text-white font-black text-xs uppercase tracking-widest rounded-full hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20">
                  <Send size={14} /> Get a Custom Quote
                </button>
                <button onClick={onBack} className="px-10 py-4 border border-white/10 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-white/5 transition-all">
                  View Other Packages
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Navbar ────────────────────────────────────── */
const Navbar = ({
  onSectionChange, activeSection, onOpenDrawer, onPostProperty, onSignup,
  loggedIn, onOpenProfile,
}: {
  onSectionChange: (sec: string) => void;
  activeSection: string;
  onOpenDrawer: () => void;
  onPostProperty?: () => void;
  onSignup?: () => void;
  loggedIn?: boolean;
  onOpenProfile?: () => void;
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useT();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('home'), id: 'home' },
    { label: t('services'), id: 'services' },
    { label: t('properties'), id: 'properties' },
    { label: t('shop'), id: 'shop' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className={`fixed top-0 left-0 right-0 z-[300] bg-black backdrop-blur-xl border-b border-white/5 transition-all duration-500 ${
        isScrolled ? 'py-3 shadow-lg shadow-black/50' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSectionChange('home')}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-9 h-9 orange-gradient-bg flex items-center justify-center rounded-lg shadow-lg shadow-orange-500/30">
              <Flame size={18} className="text-white" />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight text-white">
                TERRA<span className="text-orange-500">INFRA</span>
              </span>
              <span className="text-[8px] tracking-[0.4em] font-semibold uppercase text-white/30 -mt-0.5">360 · Build Your Legacy</span>
            </div>
          </motion.div>

          {(activeSection === 'services' || activeSection === 'properties') && (
            <button
              onClick={() => onSectionChange('home')}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 hover:border-orange-500 hover:text-orange-500 text-white/50 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
          )}
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {activeSection === 'home' && navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onSectionChange(link.id)}
              className={`text-xs font-bold tracking-widest uppercase relative group transition-colors ${
                activeSection === link.id ? 'text-orange-500' : 'text-white/60 hover:text-white'
              }`}
            >
              {link.label}
              <motion.span
                className="absolute -bottom-1 left-0 h-0.5 bg-orange-500 block"
                initial={{ width: 0 }}
                animate={{ width: activeSection === link.id ? '100%' : 0 }}
                whileHover={{ width: '100%' }}
              />
            </button>
          ))}

        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications bell - only on the home header; it aggregates notifications from every section. */}
          {activeSection === 'home' && <NotificationBell />}
          {activeSection === 'properties' && (
            <>
              <button className="relative transition-all hover:scale-110 p-2 rounded-full hover:bg-orange-500/10 text-white/50 hover:text-orange-500">
                <Heart size={18} />
              </button>
              <button
                onClick={() => onPostProperty?.()}
                className="hidden sm:flex items-center gap-2 orange-gradient-bg text-white px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase hover:scale-105 transition-transform shadow-lg shadow-orange-500/20"
              >
                <Plus size={13} /> {t('postProperty')}
              </button>
            </>
          )}
          {/* Download App — quick link to mobile app */}
          <a
            href="https://play.google.com/store/apps/details?id=com.tf360.tf360"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase text-white/85 hover:text-orange-500 hover:bg-white/5 transition-all"
          >
            <Download size={13} /> {t('downloadApp')}
          </a>
          {/* Sign Up — prominent CTA, hidden on mobile (drawer has it). */}
          {onSignup && !loggedIn && (
            <button
              onClick={onSignup}
              className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border-2 border-orange-500/60 text-orange-500 hover:bg-orange-500 hover:text-white hover:scale-105 transition-all"
            >
              <User size={13} /> {t('signUp')}
            </button>
          )}
          {/* Profile avatar — replaces Sign Up when authenticated */}
          {loggedIn && onOpenProfile && (
            <button
              onClick={onOpenProfile}
              aria-label="My account"
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-white font-black text-sm hover:scale-110 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                boxShadow: '0 8px 20px rgba(249,115,22,0.35)',
              }}
            >
              <User size={16} />
            </button>
          )}
          <button
            onClick={toggle}
            aria-label="Toggle light/dark theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-full bg-white/5 hover:bg-orange-500/15 text-white/60 hover:text-orange-500 transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={onOpenDrawer}
            className="p-2 rounded-full bg-white/5 hover:bg-orange-500/15 text-white/60 hover:text-orange-500 transition-all"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

/* ─── Hero ──────────────────────────────────────── */
const HERO_CARDS = [
  {
    img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=800',
    label: 'Architecture', sub: '340+ Designs',
    rotate: '-6deg', y: -30,
  },
  {
    img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
    label: 'Interiors', sub: '1,200+ Projects',
    rotate: '3deg', y: 0,
  },
  {
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
    label: 'Properties', sub: '800+ Listings',
    rotate: '-2deg', y: 30,
  },
];

const Hero = ({ onExplore }: { onExplore: () => void }) => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const yContent = useTransform(scrollY, [0, 400], [0, -60]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black flex items-center">
      {/* Full-bleed bg */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=2400"
          alt=""
          className="w-full h-full object-cover brightness-[0.12] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/50" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 z-1 grid-pattern opacity-30 pointer-events-none" />

      {/* Orange glow */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/20 blur-[140px] z-1 pointer-events-none"
      />

      {/* Content */}
      <motion.div
        style={{ opacity, y: yContent }}
        className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-28"
      >
        {/* ── Left: Text ── */}
        <div>
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-8 h-8 orange-gradient-bg rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Flame size={15} className="text-white" />
            </div>
            <span className="text-[10px] font-black tracking-[0.5em] uppercase text-orange-500">TerraInfra 360 · Est. 2024</span>
          </motion.div>

          {/* Heading */}
          <div className="mb-6 overflow-hidden">
            {['BUILD', 'YOUR', 'LEGACY'].map((word, i) => (
              <div key={word} className="overflow-hidden">
                <motion.span
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.75, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className={`block font-black leading-[0.88] tracking-tighter ${
                    word === 'YOUR'
                      ? 'text-gradient text-[clamp(3.5rem,9vw,7.5rem)]'
                      : 'text-white text-[clamp(3.5rem,9vw,7.5rem)]'
                  }`}
                >
                  {word}
                </motion.span>
              </div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="text-white/45 text-base leading-relaxed max-w-lg mb-10 font-light"
          >
            India's premier construction & real estate ecosystem — architectural mastery,
            premium materials, and legacy properties under one roof.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.82, duration: 0.7 }}
            className="flex flex-wrap gap-4 mb-12"
          >
            <motion.button
              onClick={onExplore}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-10 py-4 orange-gradient-bg text-white font-black tracking-[0.18em] uppercase text-xs overflow-hidden shadow-2xl shadow-orange-500/30"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Services <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div className="absolute inset-0 bg-white/15 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 border border-white/15 text-white text-xs font-black tracking-[0.18em] uppercase hover:border-orange-500/60 hover:text-orange-400 transition-all"
            >
              View Properties
            </motion.button>
          </motion.div>

          {/* Mini stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex gap-8"
          >
            {[
              { n: '8,000+', l: 'Projects' },
              { n: '2,400+', l: 'Vendors' },
              { n: '98%', l: 'Satisfaction' },
            ].map(({ n, l }) => (
              <div key={l} className="border-l border-orange-500/30 pl-4">
                <p className="text-xl font-black text-white">{n}</p>
                <p className="text-[9px] text-white/35 uppercase tracking-[0.25em]">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right: Image Cards ── */}
        <div className="hidden lg:block relative h-[520px]">
          {HERO_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, x: 80, rotate: 0 }}
              animate={{ opacity: 1, x: 0, rotate: card.rotate, y: card.y }}
              transition={{ duration: 0.9, delay: 0.4 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.04, rotate: '0deg', y: card.y - 10, zIndex: 20 }}
              className="absolute w-64 h-80 overflow-hidden shadow-2xl shadow-black/60 cursor-pointer"
              style={{
                left: `${i * 90}px`,
                top: `${i * 30}px`,
                zIndex: i + 1,
                borderRadius: '16px',
              }}
            >
              <img src={card.img} alt={card.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              {/* Orange accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 orange-gradient-bg" />
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-[9px] text-orange-400 font-black uppercase tracking-[0.35em] mb-1">{card.sub}</p>
                <p className="text-white font-black text-lg leading-tight">{card.label}</p>
              </div>
              {/* Number badge */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-black">{String(i + 1).padStart(2, '0')}</span>
              </div>
            </motion.div>
          ))}

          {/* Glow behind cards */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-80 h-80 bg-orange-500/12 blur-[100px] rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[8px] tracking-[0.5em] uppercase font-black text-white/25">Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-orange-500/70 to-transparent"
        />
      </motion.div>
    </section>
  );
};

/* ─── Modals ────────────────────────────────────── */
const OurStoryModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-xl overflow-y-auto" onClick={onClose}>
    <motion.div
      initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 200 }}
      className="min-h-full flex items-start justify-center py-12 px-4"
      onClick={e => e.stopPropagation()}
    >
      <div className="bg-[#111] w-full max-w-3xl rounded-[2rem] border border-white/8 shadow-2xl overflow-hidden">
        <div className="relative h-64 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=1500" alt="Our Story" className="w-full h-full object-cover brightness-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111]/95 to-transparent" />
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-orange-500 transition-colors"><X size={18} /></button>
          <div className="absolute bottom-8 left-8">
            <p className="text-orange-500 text-[10px] font-black tracking-[0.35em] uppercase mb-2">TerraInfra 360</p>
            <h2 className="text-4xl font-black text-white tracking-tight">Our Story</h2>
          </div>
        </div>
        <div className="p-10 space-y-8">
          {[
            { label: 'Who We Are', text: 'TerraInfra 360 was founded with a singular mission — to transform India\'s construction and real estate ecosystem into a transparent, world-class experience.' },
            { label: 'Our Mission', text: 'We connect homeowners, investors, architects, interior designers, and contractors through a single trusted platform — empowering every stakeholder with the tools, vendors, and expertise to build smarter.' },
            { label: 'Our Vision', text: 'To become South Asia\'s most trusted luxury construction and property platform — where every project, regardless of scale, is delivered with precision, quality, and transparency.' },
          ].map(({ label, text }) => (
            <div key={label}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-3">{label}</p>
              <p className="text-base leading-relaxed text-white/55">{text}</p>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-6 py-6 border-t border-b border-white/8">
            {[{ num: '2024', label: 'Founded' }, { num: '8,000+', label: 'Projects Delivered' }, { num: '2,400+', label: 'Verified Vendors' }].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-orange-500 mb-1">{num}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/30">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm italic text-white/25">"We don't just build structures. We build legacies." — TerraInfra 360 Founders</p>
        </div>
      </div>
    </motion.div>
  </div>
);

const EliteVendorsModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-xl overflow-y-auto" onClick={onClose}>
    <motion.div
      initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 200 }}
      className="min-h-full flex items-start justify-center py-12 px-4"
      onClick={e => e.stopPropagation()}
    >
      <div className="bg-[#111] w-full max-w-3xl rounded-[2rem] border border-white/8 shadow-2xl overflow-hidden">
        <div className="relative h-64 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1500" alt="Elite Vendors" className="w-full h-full object-cover brightness-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111]/95 to-transparent" />
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-orange-500 transition-colors"><X size={18} /></button>
          <div className="absolute bottom-8 left-8">
            <p className="text-orange-500 text-[10px] font-black tracking-[0.35em] uppercase mb-2">TerraInfra 360</p>
            <h2 className="text-4xl font-black text-white tracking-tight">Elite Vendors</h2>
          </div>
        </div>
        <div className="p-10 space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-3">Our Network</p>
            <p className="text-base leading-relaxed text-white/55">2,400+ verified professionals — each rigorously vetted for quality, reliability, and craftsmanship. From structural engineers to luxury interior designers.</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-4">Vendor Categories</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['Architects', 'Interior Designers', 'Structural Engineers', 'Electrical Contractors', 'Plumbing Specialists', 'Flooring Experts', 'Modular Kitchen Studios', 'Landscape Designers', 'Legal Consultants'].map(cat => (
                <div key={cat} className="px-4 py-3 rounded-xl border border-white/8 bg-white/3 text-xs font-medium text-white/50 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  {cat}
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-orange-500/8 border border-orange-500/20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-3">Become an Elite Vendor</p>
            <p className="text-sm leading-relaxed mb-4 text-white/50">Join our curated network. Contact us at <span className="text-orange-500">vendors@terrainfra360.com</span> to begin the vetting process.</p>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

const SustainabilityModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-xl overflow-y-auto" onClick={onClose}>
    <motion.div
      initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 200 }}
      className="min-h-full flex items-start justify-center py-12 px-4"
      onClick={e => e.stopPropagation()}
    >
      <div className="bg-[#111] w-full max-w-3xl rounded-[2rem] border border-white/8 shadow-2xl overflow-hidden">
        <div className="relative h-64 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1500" alt="Sustainability" className="w-full h-full object-cover brightness-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111]/95 to-transparent" />
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-orange-500 transition-colors"><X size={18} /></button>
          <div className="absolute bottom-8 left-8">
            <p className="text-orange-500 text-[10px] font-black tracking-[0.35em] uppercase mb-2">TerraInfra 360</p>
            <h2 className="text-4xl font-black text-white tracking-tight">Sustainability</h2>
          </div>
        </div>
        <div className="p-10 space-y-6">
          <p className="text-base leading-relaxed text-white/55">Sustainability is woven into every material specification, vendor partnership, and construction practice.</p>
          {[
            { title: 'Responsible Sourcing', desc: 'All materials vetted for ethical sourcing, low environmental impact, and durability.' },
            { title: 'Energy-Efficient Design', desc: 'Passive cooling, solar-ready structures, and LED-integrated lighting plans.' },
            { title: 'Water Conservation', desc: 'Rainwater harvesting provisions, low-flow fittings, and greywater recycling systems.' },
            { title: 'Green Certification Support', desc: 'Guiding clients toward GRIHA and IGBC compliance.' },
          ].map(({ title, desc }) => (
            <div key={title} className="p-5 rounded-xl border border-white/8 bg-white/2">
              <p className="text-sm font-black mb-1.5 text-white">{title}</p>
              <p className="text-xs leading-relaxed text-white/40">{desc}</p>
            </div>
          ))}
          <p className="text-xs italic border-t border-white/8 pt-6 text-white/25">Goal: net-zero construction practices across all TerraInfra 360 projects by 2030.</p>
        </div>
      </div>
    </motion.div>
  </div>
);

/* ─── Footer ────────────────────────────────────── */
const Footer = ({
  onSectionChange, onOpenOurStory, onOpenEliteVendors, onOpenSustainability,
}: {
  onSectionChange: (sec: string) => void;
  onOpenOurStory: () => void;
  onOpenEliteVendors: () => void;
  onOpenSustainability: () => void;
}) => (
  <footer className="bg-black text-white pt-24 pb-12 border-t border-white/5">
    {/* Top orange bar */}
    <div className="h-px orange-gradient-bg w-full mb-16 opacity-30" />

    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 orange-gradient-bg flex items-center justify-center rounded-lg shadow-lg shadow-orange-500/25">
              <Flame size={18} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">TERRA<span className="text-orange-500">INFRA</span> <span className="text-white/40 text-base">360</span></span>
          </div>
          <p className="text-sm leading-relaxed text-white/30 italic">
            "Architectural Excellence Since 2024. Empowering homeowners through innovation and transparency."
          </p>
          <div className="flex gap-3">
            {[
              { href: 'https://www.instagram.com/terrainfra360?igsh=MW1iMzBvMTNmbG15Zw==', Icon: Instagram },
              { href: 'https://www.linkedin.com/company/terrainfra360/', Icon: Linkedin },
              { href: 'https://maps.app.goo.gl/WSWj4dzZovjgsmsf9?g_st=ic', Icon: MapPin },
            ].map(({ href, Icon }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 border border-white/8 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all duration-300 rounded-lg text-white/40 hover:text-white">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-xs font-black tracking-[0.3em] uppercase text-white/30 mb-8">Navigation</h4>
          <ul className="flex flex-col gap-4 text-sm text-white/45">
            {[
              { label: 'Home', id: 'home' },
              { label: 'Services', id: 'services' },
              { label: 'Packages', id: 'packages' },
              { label: 'Marketplace', id: 'shop' },
            ].map(({ label, id }) => (
              <li key={id}>
                <button onClick={() => onSectionChange(id)} className="hover:text-orange-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 h-px bg-orange-500 group-hover:w-4 transition-all duration-300" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-xs font-black tracking-[0.3em] uppercase text-white/30 mb-8">Company</h4>
          <ul className="flex flex-col gap-4 text-sm text-white/45">
            {[
              { label: 'Our Story', action: onOpenOurStory },
              { label: 'Elite Vendors', action: onOpenEliteVendors },
              { label: 'Sustainability', action: onOpenSustainability },
              { label: 'Careers', action: () => onSectionChange('careers') },
            ].map(({ label, action }) => (
              <li key={label}>
                <button onClick={action} className="hover:text-orange-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 h-px bg-orange-500 group-hover:w-4 transition-all duration-300" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs font-black tracking-[0.3em] uppercase text-white/30 mb-8">Contact</h4>
          <div className="flex flex-col gap-5 text-sm text-white/45">
            <div className="flex gap-3">
              <MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" />
              <p>2767, 1st Main Road, Defence Colony Road, Sahakar Nagar, Bengaluru 560092</p>
            </div>
            <div className="flex gap-3">
              <Phone size={16} className="text-orange-500 shrink-0 mt-0.5" />
              <p>+91 98765 43210</p>
            </div>
            <div className="flex gap-3">
              <Mail size={16} className="text-orange-500 shrink-0 mt-0.5" />
              <p>hello@terrainfra360.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs tracking-widest uppercase text-white/20">© 2026 TerraInfra 360. All rights reserved.</p>
        <div className="flex gap-8 text-xs tracking-widest uppercase text-white/20">
          <a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

/* ─── Featured Property Detail ──────────────────── */
const FEAT_AMENITIES = [
  { icon: Car, label: 'Private Parking' },
  { icon: Wifi, label: 'High-Speed Internet' },
  { icon: ShieldCheck, label: '24/7 Security' },
  { icon: Droplets, label: 'Swimming Pool' },
  { icon: Zap, label: 'Power Backup' },
  { icon: Key, label: 'Smart Home' },
];

const FeaturedPropertyDetail = ({ property, onClose }: { property: any; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="fixed inset-0 z-[600] bg-black overflow-y-auto"
  >
    <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-black/95 backdrop-blur-xl border-b border-white/5">
      <button onClick={onClose} className="flex items-center gap-2 text-white/50 hover:text-orange-500 transition-colors text-[10px] font-black tracking-widest uppercase">
        <ArrowLeft size={16} /><span>Back</span>
      </button>
      <span className="text-[10px] font-black tracking-[0.3em] uppercase text-orange-500">Property Details</span>
      <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full border border-white/8 text-white/30 hover:text-orange-500 hover:border-orange-500 transition-colors">
        <X size={14} />
      </button>
    </div>

    <div className="relative h-[55vh] overflow-hidden">
      <img src={property.img} alt={property.title} className="w-full h-full object-cover brightness-50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 p-8 flex items-end justify-between">
        <div>
          <span className="inline-block orange-gradient-bg text-white text-[9px] font-black tracking-[0.25em] uppercase px-3 py-1 mb-3">{property.category}</span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{property.title}</h1>
        </div>
        <div className="text-right">
          <p className="text-orange-500 font-black text-3xl md:text-4xl">{property.price}</p>
          <p className="text-white/30 text-[10px] tracking-widest uppercase mt-1">Asking Price</p>
        </div>
      </div>
    </div>

    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white/40">
          <MapPin size={15} className="text-orange-500 shrink-0" />
          <span className="text-sm font-light tracking-wide">{property.location}</span>
        </div>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={14} className={s <= 4 ? 'text-orange-500 fill-orange-500' : 'text-white/10'} />
          ))}
          <span className="text-[11px] text-white/30 ml-2">4.0 / 5.0 · Premium Listing</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {property.beds > 0 && (
          <div className="card-dark rounded-2xl p-5 flex flex-col items-center gap-2 text-center">
            <Bed size={22} className="text-orange-500" />
            <span className="text-2xl font-black text-white">{property.beds}</span>
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/30">Bedrooms</span>
          </div>
        )}
        {property.baths > 0 && (
          <div className="card-dark rounded-2xl p-5 flex flex-col items-center gap-2 text-center">
            <Bath size={22} className="text-orange-500" />
            <span className="text-2xl font-black text-white">{property.baths}</span>
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/30">Bathrooms</span>
          </div>
        )}
        <div className="card-dark rounded-2xl p-5 flex flex-col items-center gap-2 text-center">
          <Maximize size={22} className="text-orange-500" />
          <span className="text-2xl font-black text-white">{property.sqft}</span>
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/30">Area</span>
        </div>
        <div className="card-dark rounded-2xl p-5 flex flex-col items-center gap-2 text-center">
          <Building2 size={22} className="text-orange-500" />
          <span className="text-base font-black text-white leading-tight">{property.category}</span>
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/30">Type</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-orange-500">About This Property</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <p className="text-white/40 text-sm leading-relaxed font-light">
          {property.title} is an exceptional {property.category?.toLowerCase()} property located in {property.location}.{' '}
          {property.beds > 0 ? `Spanning ${property.sqft} sq ft across ${property.beds} bedrooms and ${property.baths} bathrooms, this property offers a seamless blend of luxury and practicality.` : `Spanning ${property.sqft}, this prime plot presents an extraordinary opportunity for discerning investors.`}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FEAT_AMENITIES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 card-dark rounded-xl px-4 py-3">
            <Icon size={16} className="text-orange-500 shrink-0" />
            <span className="text-xs text-white/60 font-medium">{label}</span>
            <Check size={12} className="text-orange-500 ml-auto shrink-0" />
          </div>
        ))}
      </div>

      <div className="bg-[#111] border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="text-orange-500 text-[10px] font-black tracking-[0.4em] uppercase mb-3">Exclusive Listing</p>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">Interested in <span className="text-orange-500">{property.title}?</span></h3>
            <p className="text-white/30 text-sm font-light">Our advisors are ready to arrange a private viewing.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-7 py-4 orange-gradient-bg text-white text-[10px] font-black tracking-[0.2em] uppercase rounded-xl hover:opacity-90 transition-all">
              <Phone size={13} /> Call Now
            </button>
            <button className="flex items-center justify-center gap-2 px-7 py-4 border border-white/10 text-white text-[10px] font-black tracking-[0.2em] uppercase rounded-xl hover:bg-white/5 transition-all">
              <Mail size={13} /> Send Enquiry
            </button>
          </div>
        </div>
      </div>
      <div className="h-8" />
    </div>
  </motion.div>
);

/* ─── Main App ──────────────────────────────────── */
export default function App() {
  const { t } = useT();
  const [currentSection, setCurrentSection] = useState('home');
  const [showContact, setShowContact] = useState(false);
  const [showPostProperty, setShowPostProperty] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loggedInPhone, setLoggedInPhone] = useState<string | null>(getLoggedInPhone());
  // Keep the customer signed in: restore the phone from the live Firebase
  // session on load, and NEVER clear it on a transient null (page reload /
  // token refresh). Only the explicit Sign Out clears it.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        const ph = u.phoneNumber || getLoggedInPhone();
        if (ph) { setLoggedInPhone(ph); try { localStorage.setItem('tf360_loggedInPhone', ph); } catch { /* noop */ } }
      }
    });
    return () => unsub();
  }, []);
  const [showOurStory, setShowOurStory] = useState(false);
  const [showEliteVendors, setShowEliteVendors] = useState(false);
  const [showSustainability, setShowSustainability] = useState(false);
  const [selectedHomePkg, setSelectedHomePkg] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [featuredPropertyToOpen, setFeaturedPropertyToOpen] = useState<any>(null);
  // Tap = open real PropertyDetailPage with same design used inside the
  // Properties browse section. Holds the Firestore property id.
  const [openPropertyId, setOpenPropertyId] = useState<string | null>(null);
  const [shopProductId, setShopProductId] = useState<string | null>(null);
  const [portalOpen, setPortalOpen] = useState<PortalKind | null>(null);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [portalFrame, setPortalFrame] = useState<{ url: string; title: string; accent: string } | null>(null);
  const PORTAL_APPS: Record<PortalKind, { url: string; accent: string } | undefined> = {
    admin: { url: import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:4002', accent: '#6366f1' },
    vendor: { url: import.meta.env.VITE_VENDOR_PORTAL_URL || 'http://localhost:4001', accent: '#10b981' },
    contractor: import.meta.env.VITE_CONTRACTOR_PORTAL_URL ? { url: import.meta.env.VITE_CONTRACTOR_PORTAL_URL, accent: '#f97316' } : undefined,
  };
  const { scrollYProgress } = useScroll();

  // The ThemeProvider owns the `dark`/`light` class on <html>. Don't
  // force one here or it'll fight the toggle.

  const handleSectionChange = (section: string) => {
    if (section !== 'shop') setShopProductId(null); // stale product id shouldn't reopen later
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black dark">
      <CustomCursor />

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] orange-gradient-bg z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Modals & Overlays */}
      <AnimatePresence>
        {featuredPropertyToOpen && <FeaturedPropertyDetail property={featuredPropertyToOpen} onClose={() => setFeaturedPropertyToOpen(null)} />}
        {/* Real PropertyDetailPage overlay — used when a real Firestore
            property card on the home is tapped. Same component as Properties section. */}
        {openPropertyId && (
          <PropertyDetailOverlay
            propertyId={openPropertyId}
            onClose={() => setOpenPropertyId(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showPostProperty && <PostPropertyModal onClose={() => setShowPostProperty(false)} />}
        {showSignup && (
          <SignupModal
            onClose={() => setShowSignup(false)}
            onSwitchToLogin={() => {
              setShowSignup(false);
              setShowLogin(true);
            }}
          />
        )}
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onSwitchToSignup={() => {
              setShowLogin(false);
              setShowSignup(true);
            }}
            onSuccess={(phone) => {
              // After sign-in just close the modal and stay on the current
              // page (home). The user can open the profile drawer manually
              // via the avatar in the navbar.
              setLoggedInPhone(phone);
              setShowLogin(false);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showOurStory && <OurStoryModal onClose={() => setShowOurStory(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showEliteVendors && <EliteVendorsModal onClose={() => setShowEliteVendors(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showSustainability && <SustainabilityModal onClose={() => setShowSustainability(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {portalOpen === 'vendor' && <VendorPortal onClose={() => setPortalOpen(null)} />}
        {portalOpen === 'contractor' && <ContractorPortal onClose={() => setPortalOpen(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {portalFrame && <PortalFrame url={portalFrame.url} title={portalFrame.title} accent={portalFrame.accent} onClose={() => setPortalFrame(null)} />}
      </AnimatePresence>
      {comingSoon && (
        <div style={{ position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)', zIndex: 9999, background: '#15171A', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 22px', borderRadius: 999, fontSize: 13, fontWeight: 700, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>{comingSoon}</div>
      )}
      <AnimatePresence>
        {selectedHomePkg && (() => {
          const pkg = PACKAGES.find(p => p.id === selectedHomePkg);
          if (!pkg) return null;
          return <PackageDetailPage pkg={pkg} onBack={() => setSelectedHomePkg(null)} onGetQuote={() => { setSelectedHomePkg(null); setShowContact(true); }} />;
        })()}
      </AnimatePresence>

      {/* Hamburger Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-[350] bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm z-[360] bg-[#0d0d0d] flex flex-col overflow-hidden shadow-2xl border-l border-white/5"
            >
              <div className="flex items-center justify-between px-7 py-6 border-b border-white/5">
                <div>
                  <span className="text-xl font-black text-white tracking-tight">TERRA<span className="text-orange-500">INFRA</span></span>
                  <p className="text-[8px] text-white/30 uppercase tracking-[0.3em] mt-0.5">360 · Build Your Legacy</p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-white/30 hover:text-white transition-colors"><X size={22} /></button>
              </div>

              <div className="flex-1 overflow-y-auto px-7 py-6 space-y-1">
                <p className="text-[8px] font-black uppercase tracking-[0.35em] text-white/20 mb-3">Navigate</p>
                {[
                  { label: t('home'), id: 'home', icon: Home },
                  { label: t('services'), id: 'services', icon: Wrench },
                  { label: t('properties'), id: 'properties', icon: Building2 },
                  { label: t('shop'), id: 'shop', icon: ShoppingBag },
                ].map(({ label, id, icon: Icon }) => (
                  <button key={id} onClick={() => { handleSectionChange(id); setIsDrawerOpen(false); }} className="w-full flex items-center gap-4 py-3.5 px-4 rounded-xl hover:bg-orange-500/8 transition-colors group text-left">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                      <Icon size={16} className="text-orange-500" />
                    </div>
                    <span className="text-base font-bold text-white/70 group-hover:text-white transition-colors">{label}</span>
                    <ChevronRight size={14} className="text-white/15 ml-auto group-hover:text-orange-500/60 transition-colors" />
                  </button>
                ))}

                <div className="h-px bg-white/5 my-4" />
                <p className="text-[8px] font-black uppercase tracking-[0.35em] text-white/20 mb-3">Account</p>
                {loggedInPhone ? (
                  <button
                    onClick={() => { setIsDrawerOpen(false); setShowProfile(true); }}
                    className="w-full flex items-center gap-4 py-3.5 px-4 rounded-xl hover:bg-orange-500/8 transition-colors group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0 group-hover:bg-orange-500/25 transition-colors">
                      <User size={16} className="text-orange-500" />
                    </div>
                    <span className="text-base font-bold text-white/70 group-hover:text-white transition-colors">{t('myProfile')}</span>
                    <ChevronRight size={14} className="text-white/15 ml-auto group-hover:text-orange-500/60 transition-colors" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setIsDrawerOpen(false); setShowSignup(true); }}
                      className="w-full flex items-center gap-4 py-3.5 px-4 rounded-xl hover:bg-orange-500/8 transition-colors group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0 group-hover:bg-orange-500/25 transition-colors">
                        <User size={16} className="text-orange-500" />
                      </div>
                      <span className="text-base font-bold text-white/70 group-hover:text-white transition-colors">{t('signUp')}</span>
                      <ChevronRight size={14} className="text-white/15 ml-auto group-hover:text-orange-500/60 transition-colors" />
                    </button>
                    <button
                      onClick={() => { setIsDrawerOpen(false); setShowLogin(true); }}
                      className="w-full flex items-center gap-4 py-3.5 px-4 rounded-xl hover:bg-orange-500/8 transition-colors group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                        <Key size={16} className="text-orange-500" />
                      </div>
                      <span className="text-base font-bold text-white/70 group-hover:text-white transition-colors">{t('signIn')}</span>
                      <ChevronRight size={14} className="text-white/15 ml-auto group-hover:text-orange-500/60 transition-colors" />
                    </button>
                  </>
                )}

                <div className="h-px bg-white/5 my-4" />
                <p className="text-[8px] font-black uppercase tracking-[0.35em] text-white/20 mb-3">Company</p>
                {[
                  { label: 'Careers', icon: Briefcase, action: () => { handleSectionChange('careers'); setIsDrawerOpen(false); } },
                  { label: 'Contact Us', icon: MessageSquare, action: () => { setIsDrawerOpen(false); setShowContact(true); } },
                ].map(({ label, icon: Icon, action }) => (
                  <button key={label} onClick={action} className="w-full flex items-center gap-4 py-3.5 px-4 rounded-xl hover:bg-orange-500/8 transition-colors group text-left">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                      <Icon size={16} className="text-orange-500" />
                    </div>
                    <span className="text-base font-bold text-white/70 group-hover:text-white transition-colors">{label}</span>
                    <ChevronRight size={14} className="text-white/15 ml-auto group-hover:text-orange-500/60 transition-colors" />
                  </button>
                ))}

                <div className="h-px bg-white/5 my-4" />
                <p className="text-[8px] font-black uppercase tracking-[0.35em] text-white/20 mb-3">Portals</p>
                {([
                  { id: 'admin' as PortalKind, label: 'Admin Portal', icon: ShieldCheck },
                  { id: 'vendor' as PortalKind, label: 'Vendor Portal', icon: User },
                  { id: 'contractor' as PortalKind, label: 'Contractor Portal', icon: Star },
                ]).map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => { setIsDrawerOpen(false); const frames: Record<string, { url: string; title: string; accent: string }> = { vendor: { url: import.meta.env.VITE_VENDOR_PORTAL_URL || 'http://localhost:4001/login', title: 'Vendor Portal', accent: '#0C831F' }, admin: { url: import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:4002/login', title: 'Admin Portal', accent: '#C5A059' }, contractor: { url: import.meta.env.VITE_CONTRACTOR_PORTAL_URL || 'http://localhost:4003/auth/login', title: 'Contractor Portal', accent: '#C5A059' } }; setPortalFrame(frames[id]); }} className="w-full flex items-center gap-4 py-3.5 px-4 rounded-xl hover:bg-white/5 transition-colors group text-left border border-transparent hover:border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-orange-500" />
                    </div>
                    <span className="text-base font-bold text-white/70 group-hover:text-white transition-colors">{label}</span>
                    <ChevronRight size={14} className="text-white/15 ml-auto group-hover:text-orange-500/60 transition-colors" />
                  </button>
                ))}
              </div>

              <div className="px-7 py-5 border-t border-white/5">
                <button onClick={() => { setIsDrawerOpen(false); setShowContact(true); }} className="w-full py-3.5 orange-gradient-bg text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-orange-500/20">
                  <MessageSquare size={14} /> Quick Enquiry
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Navbar */}
      {currentSection !== 'shop' && currentSection !== 'services' && currentSection !== 'careers' && currentSection !== 'properties' && (
        <Navbar
          onSectionChange={handleSectionChange}
          activeSection={currentSection}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onPostProperty={() => setShowPostProperty(true)}
          onSignup={loggedInPhone ? undefined : () => setShowSignup(true)}
          loggedIn={!!loggedInPhone}
          onOpenProfile={() => setShowProfile(true)}
        />
      )}

      {/* Profile drawer — slides in from the right */}
      <AnimatePresence>
        {showProfile && (
          <ProfilePage
            onClose={() => setShowProfile(false)}
            onSignedOut={() => {
              setLoggedInPhone(null);
              setShowProfile(false);
            }}
            onOpenMyListings={() => handleSectionChange('properties')}
          />
        )}
      </AnimatePresence>

      <main>
        <AnimatePresence mode="wait">
          {/* ── HOME ── */}
          {currentSection === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              <FlutterHome
                onExploreServices={() => handleSectionChange('services')}
                onOpenProperties={() => handleSectionChange('properties')}
                onOpenProperty={(p) => {
                  // Open the SAME PropertyDetailPage as the Properties section
                  // uses (same hero gallery, contact card, info layout). The
                  // overlay fetches the full PropertyModel by id.
                  if (p.id) setOpenPropertyId(p.id);
                }}
                onOpenShop={() => handleSectionChange('shop')}
                onOpenProduct={(p) => {
                  // Open the clicked product's detail page inside the Shop.
                  if (p?.id) setShopProductId(p.id);
                  handleSectionChange('shop');
                }}
                onPostProperty={() => setShowPostProperty(true)}
                onContactUs={() => setShowContact(true)}
              />

              {/* ── Legacy sections below (kept for reference, hidden) ── */}
              <div className="hidden">
              <Hero onExplore={() => handleSectionChange('services')} />

              {/* Marquee Band 1 */}
              <MarqueeBand items={['Architecture', 'Construction', 'Interiors', 'Properties', 'Materials', 'Vendors']} speed={35} bg="dark" />

              {/* ── Stats ── */}
              <section className="relative py-24 px-6 overflow-hidden">
                {/* Full-bleed bg image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=2000"
                    alt=""
                    className="w-full h-full object-cover brightness-[0.18]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/60" />
                  <div className="absolute inset-0 grid-pattern opacity-20" />
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                  >
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="h-px w-10 bg-orange-500/50" />
                      <span className="text-orange-500 font-black tracking-[0.4em] uppercase text-[10px]">By The Numbers</span>
                      <div className="h-px w-10 bg-orange-500/50" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                      Trusted by <span className="text-gradient">Thousands</span> Across India
                    </h2>
                  </motion.div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {[
                      { icon: Building2, num: 8000, suffix: '+', label: 'Projects Delivered',
                        img: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600' },
                      { icon: Users, num: 2400, suffix: '+', label: 'Verified Vendors',
                        img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600' },
                      { icon: Award, num: 15, suffix: '+', label: 'Industry Awards',
                        img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=600' },
                      { icon: TrendingUp, num: 98, suffix: '%', label: 'Client Satisfaction',
                        img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600' },
                    ].map(({ icon: Icon, num, suffix, label, img }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="relative overflow-hidden rounded-2xl border border-white/8 group cursor-default"
                      >
                        <img src={img} alt={label} className="absolute inset-0 w-full h-full object-cover brightness-[0.2] group-hover:brightness-[0.3] group-hover:scale-105 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                        <div className="absolute top-0 left-0 right-0 h-0.5 orange-gradient-bg opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 p-7 text-center">
                          <div className="w-12 h-12 mx-auto mb-5 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/25 transition-colors">
                            <Icon size={22} className="text-orange-500" />
                          </div>
                          <div className="text-4xl md:text-5xl font-black mb-2 text-orange-500">
                            <AnimatedCounter target={num} suffix={suffix} />
                          </div>
                          <p className="text-xs text-white/40 uppercase tracking-[0.25em] font-bold">{label}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── Expertise ── */}
              <section className="py-24 px-6 overflow-hidden relative">
                <div className="absolute inset-0 z-0">
                  <img
                    src="https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=2000"
                    alt=""
                    className="w-full h-full object-cover brightness-[0.07]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black" />
                </div>
                <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-orange-500/5 blur-[150px] rounded-full pointer-events-none z-[1]" />
                <div className="max-w-7xl mx-auto relative z-[2]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <motion.div
                      initial={{ x: -80, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div className="h-px w-8 bg-orange-500" />
                        <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-[10px]">Our Expertise</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight text-white">
                        Mastering Every Aspect of Your
                        <span className="text-gradient block">Construction Journey</span>
                      </h2>
                      <p className="text-white/40 mb-10 leading-relaxed text-lg font-light">
                        From architectural blueprints and legal approvals to the final brushstroke —
                        a seamless ecosystem built for perfection.
                      </p>

                      <div className="grid grid-cols-2 gap-6 mb-10">
                        {[
                          { n: '2,400+', l: 'Verified Vendors', icon: Users },
                          { n: '8,000+', l: 'Projects Delivered', icon: Building2 },
                          { n: '15+', l: 'Years Combined Exp.', icon: Clock },
                          { n: '98%', l: 'Client Satisfaction', icon: TrendingUp },
                        ].map(({ n, l, icon: Icon }, i) => (
                          <motion.div
                            key={l}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                              <Icon size={18} className="text-orange-500" />
                            </div>
                            <div>
                              <p className="text-xl font-black text-orange-500">{n}</p>
                              <p className="text-[10px] text-white/30 uppercase tracking-widest">{l}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSectionChange('services')}
                        className="flex items-center gap-3 px-8 py-4 orange-gradient-bg text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:opacity-90 transition-all"
                      >
                        Explore Services <ArrowRight size={16} />
                      </motion.button>
                    </motion.div>

                    <motion.div
                      initial={{ x: 80, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      className="relative"
                    >
                      <div className="aspect-[4/5] overflow-hidden rounded-2xl relative">
                        <img
                          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2000"
                          alt="Construction"
                          className="w-full h-full object-cover brightness-75 scale-105 hover:scale-100 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <motion.div
                        initial={{ opacity: 0, x: 30, y: 30 }}
                        whileInView={{ opacity: 1, x: 0, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="absolute -bottom-8 -left-8 w-52 h-52 orange-gradient-bg p-8 hidden md:flex flex-col justify-end shadow-2xl shadow-orange-500/30"
                      >
                        <Layers className="text-white w-10 h-10 mb-3" />
                        <p className="text-white text-xs font-black tracking-[0.2em] uppercase leading-tight">Quality In Every Layer</p>
                      </motion.div>
                      {/* Floating badge */}
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        className="absolute top-6 -right-4 glass-dark rounded-xl px-4 py-3 hidden md:block"
                      >
                        <p className="text-xs font-black text-white">ISO 9001:2015</p>
                        <p className="text-[9px] text-orange-500 uppercase tracking-widest">Certified</p>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* Marquee Band 2 (orange) */}
              <MarqueeBand items={['Premium Quality', 'Trusted Vendors', 'On-Time Delivery', 'Transparent Pricing', 'Expert Design']} speed={40} bg="orange" />

              {/* ── Construction Packages ── */}
              <section className="py-24 px-6 bg-[#080808] overflow-hidden relative">
                <div className="absolute inset-0 dot-pattern opacity-15" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-8">
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="h-px w-8 bg-orange-500" />
                        <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-[10px]">Tailored Excellence</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-white">
                        Our Construction<br />
                        <span className="text-gradient">Packages</span>
                      </h2>
                    </div>
                    <p className="text-white/30 max-w-sm font-light text-right hidden md:block text-sm leading-relaxed">
                      Pre-curated end-to-end home-building tiers — itemised brand and material specifications.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {(() => {
                      const subtitles: Record<string, string> = {
                        standard: 'Safe & Durable',
                        classic: 'Recommended',
                        premium: 'Elite Materials',
                        signature_elite: 'Ultra-Luxury',
                      };
                      const descriptors: Record<string, string> = {
                        standard: 'Essential Grade foundations with quality assured materials.',
                        classic: 'Refined finishes and trusted mid-range brands.',
                        premium: 'Superior European brands with premium specifications.',
                        signature_elite: 'Ready-to-move luxury with smart home integration.',
                      };
                      const pkgImages: Record<string, string> = {
                        standard: 'https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?auto=format&fit=crop&q=80&w=700',
                        classic: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=700',
                        premium: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=700',
                        signature_elite: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=700',
                      };
                      return PACKAGES.map((pkg, idx) => {
                        const num = String(idx + 1).padStart(2, '0');
                        const isSignature = pkg.id === 'signature_elite';
                        return (
                          <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.65 }}
                            whileHover={{ y: -10 }}
                            onClick={() => setSelectedHomePkg(pkg.id)}
                            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/8 hover:border-orange-500/50 transition-all duration-500"
                            style={{ minHeight: 380 }}
                          >
                            {/* Bg image */}
                            <img
                              src={pkgImages[pkg.id]}
                              alt={pkg.name}
                              className="absolute inset-0 w-full h-full object-cover brightness-[0.22] group-hover:brightness-[0.35] group-hover:scale-105 transition-all duration-700"
                            />
                            {/* Dark overlay */}
                            <div className={`absolute inset-0 ${isSignature ? 'bg-gradient-to-t from-orange-950/90 via-black/80 to-black/50' : 'bg-gradient-to-t from-black via-black/75 to-black/40'}`} />
                            {/* Top accent */}
                            <div className={`absolute top-0 left-0 right-0 h-1 orange-gradient-bg ${isSignature ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />

                            {/* Content */}
                            <div className="relative z-10 p-7 flex flex-col h-full" style={{ minHeight: 380 }}>
                              <div className="flex items-start justify-between mb-auto">
                                {isSignature ? (
                                  <div className="flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1">
                                    <Crown size={10} className="text-orange-400" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-orange-400">Best Choice</span>
                                  </div>
                                ) : <div />}
                                <span className="text-5xl font-black text-white/6 select-none">{num}</span>
                              </div>

                              <div className="mt-auto">
                                <h3 className="text-xl font-black text-white mb-1 tracking-tight">{pkg.name}</h3>
                                <p className="text-[9px] font-black tracking-[0.3em] uppercase text-orange-500 mb-4">{subtitles[pkg.id]}</p>
                                <p className="text-2xl font-black text-white mb-1">
                                  {PKG_PRICES[pkg.id]}<span className="text-xs text-white/35 font-medium">/sqft</span>
                                </p>
                                <p className="text-white/40 text-xs font-light leading-relaxed mb-5">{descriptors[pkg.id]}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-500 group-hover:text-white transition-colors flex items-center gap-1.5">
                                    View Details <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                  </span>
                                  <div className="w-8 h-8 rounded-full border border-orange-500/30 flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 transition-all">
                                    <ArrowRight size={12} className="text-orange-500 group-hover:text-white transition-colors" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </section>

              {/* ── Featured Products ── */}
              <section className="bg-black py-24 overflow-hidden relative">
                <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-orange-500/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-orange-600/4 blur-[130px] rounded-full pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                  <div className="flex items-end justify-between mb-14">
                    <div>
                      <div className="flex items-center gap-4 mb-5">
                        <div className="h-px w-12 bg-orange-500/40" />
                        <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-[10px]">Marketplace</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                        Curated <span className="text-gradient">Materials</span>
                      </h2>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      onClick={() => handleSectionChange('shop')}
                      className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-orange-500 transition-colors border border-white/8 hover:border-orange-500/40 px-5 py-2.5 rounded-full"
                    >
                      All Products <ArrowRight size={13} />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { name: 'Pure Oak Tiles', cat: 'Flooring', price: '₹4,500', rating: '4.8',
                        img: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80&w=1000' },
                      { name: 'Industrial Steel Beam', cat: 'Structural', price: '₹12,200', rating: '4.6',
                        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000' },
                      { name: 'Emerald Slate Slabs', cat: 'Facades', price: '₹8,900', rating: '4.9',
                        img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000' },
                      { name: 'Polished Brass Fitting', cat: 'Sanitary', price: '₹2,100', rating: '4.7',
                        img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000' }
                    ].map((prod, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                        whileHover={{ y: -8 }}
                        className="group cursor-pointer rounded-2xl overflow-hidden border border-white/6 hover:border-orange-500/30 transition-all duration-400 bg-[#0d0d0d]"
                        onClick={() => handleSectionChange('shop')}
                      >
                        {/* Image */}
                        <div className="aspect-[4/3] overflow-hidden relative">
                          <img src={prod.img} alt={prod.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-75 group-hover:brightness-90" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          {/* Category badge */}
                          <div className="absolute top-3 left-3">
                            <span className="text-[8px] uppercase tracking-widest text-white bg-orange-500 px-2.5 py-1 rounded font-black">{prod.cat}</span>
                          </div>
                          {/* Rating */}
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                            <Star size={10} className="text-orange-400 fill-orange-400" />
                            <span className="text-[9px] text-white font-black">{prod.rating}</span>
                          </div>
                          {/* Hover overlay CTA */}
                          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                            <div className="orange-gradient-bg text-white text-[9px] tracking-widest uppercase font-black py-2.5 text-center rounded-lg shadow-xl">
                              Quick View
                            </div>
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-4">
                          <h4 className="text-sm font-black mb-1 group-hover:text-orange-400 transition-colors text-white tracking-tight">{prod.name}</h4>
                          <p className="text-orange-500 font-black text-base">{prod.price}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-16 text-center">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSectionChange('shop')}
                      className="px-12 py-5 border border-orange-500/30 text-orange-500 text-xs tracking-[0.4em] uppercase font-black hover:bg-orange-500 hover:text-white transition-all"
                    >
                      Browse All Collections
                    </motion.button>
                  </div>
                </div>
              </section>

              {/* Marquee Band 3 (dark reversed) */}
              <MarqueeBand items={['Interior Design', 'Blueprint Services', 'Legal Support', 'Site Inspection', 'Project Management']} reverse speed={30} bg="gray" />

              {/* ── Core Services ── */}
              <section className="py-24 relative overflow-hidden bg-black">
                <div className="absolute inset-0 grid-pattern opacity-40" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                  <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-4 mb-5">
                      <div className="h-px w-12 bg-orange-500/40" />
                      <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-[10px]">Core Services</span>
                      <div className="h-px w-12 bg-orange-500/40" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                      Comprehensive <span className="text-gradient">Solutions</span>
                    </h2>
                    <div className="w-16 h-0.5 orange-gradient-bg mx-auto" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        icon: PenTool, title: 'Architecture', num: '01',
                        desc: 'Concept, Schematic, and Authority Drawings — precision from first sketch to final approval.',
                        img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=900',
                        tag: '340+ Designs',
                      },
                      {
                        icon: Layout, title: 'Interiors', num: '02',
                        desc: 'Modular Kitchens, Wardrobes, and Full Decor — transforming spaces into extraordinary experiences.',
                        img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=900',
                        tag: '1,200+ Projects',
                      },
                      {
                        icon: Home, title: 'Construction', num: '03',
                        desc: 'End-to-end home building with premium materials and 2,400+ verified contractors.',
                        img: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&q=80&w=900',
                        tag: '8,000+ Built',
                      },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.15, duration: 0.7 }}
                        whileHover={{ y: -8 }}
                        className="group relative overflow-hidden rounded-2xl border border-white/8 hover:border-orange-500/40 transition-all duration-500 cursor-pointer"
                        style={{ minHeight: 420 }}
                      >
                        {/* Background image */}
                        <img
                          src={item.img}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover brightness-[0.3] group-hover:brightness-[0.45] group-hover:scale-105 transition-all duration-700"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
                        {/* Orange top accent */}
                        <div className="absolute top-0 left-0 right-0 h-1 orange-gradient-bg scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                        {/* Content */}
                        <div className="relative z-10 p-8 flex flex-col h-full" style={{ minHeight: 420 }}>
                          {/* Top row */}
                          <div className="flex items-start justify-between mb-auto">
                            <div className="w-14 h-14 bg-orange-500/15 border border-orange-500/25 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-400">
                              <item.icon className="text-orange-500 w-6 h-6 group-hover:text-white transition-colors duration-400" />
                            </div>
                            <span className="text-5xl font-black text-white/8 select-none leading-none">{item.num}</span>
                          </div>

                          {/* Bottom content */}
                          <div className="mt-16">
                            <span className="text-[9px] text-orange-400 font-black uppercase tracking-[0.35em] mb-3 block">{item.tag}</span>
                            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{item.title}</h3>
                            <p className="text-white/45 text-sm font-light leading-relaxed mb-6">{item.desc}</p>
                            <button
                              onClick={() => setShowContact(true)}
                              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 group-hover:text-white transition-colors border-b border-orange-500/30 pb-1 group-hover:border-white/40"
                            >
                              Inquire Now <ChevronRight size={13} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── Featured Properties ── */}
              <section className="py-24 px-6 overflow-hidden bg-[#0a0a0a] relative">
                <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-orange-500/4 blur-[150px] rounded-full pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                  <div className="flex items-end justify-between mb-16 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="h-px w-8 bg-orange-500" />
                        <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-[10px]">Exquisite Living</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                        Featured <span className="text-gradient">Properties</span>
                      </h2>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      onClick={() => handleSectionChange('properties')}
                      className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-white transition-colors border border-orange-500/30 px-6 py-3 rounded-full hover:bg-orange-500 hover:border-orange-500"
                    >
                      View All <ArrowRight size={14} />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      {
                        title: 'The Obsidian Villa', loc: 'Sahakar Nagar, Bengaluru', price: '₹8.5 Cr', type: 'Residential',
                        img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1500',
                        beds: 5, baths: 6, sqft: '6,200', category: 'Residential', location: 'Sahakar Nagar, Bengaluru'
                      },
                      {
                        title: 'Skyline Commercial Hub', loc: 'Hebbal, Bengaluru', price: '₹12.2 Cr', type: 'Commercial',
                        img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1500',
                        beds: 0, baths: 4, sqft: '9,800', category: 'Commercial', location: 'Hebbal, Bengaluru'
                      }
                    ].map((prop, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.15, duration: 0.7 }}
                        className="group cursor-pointer"
                        onClick={() => setFeaturedPropertyToOpen({ title: prop.title, price: prop.price, location: prop.location, beds: prop.beds, baths: prop.baths, sqft: prop.sqft, img: prop.img, category: prop.category })}
                      >
                        <div className="relative aspect-[16/10] overflow-hidden mb-6 rounded-2xl">
                          <img
                            src={prop.img}
                            alt={prop.title}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-107 brightness-60"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute top-5 left-5 py-1 px-3 orange-gradient-bg text-white text-[9px] tracking-widest uppercase font-black shadow-lg rounded-sm">
                            {prop.type}
                          </div>
                          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                            <div>
                              <h3 className="text-xl font-black text-white tracking-tight group-hover:text-orange-400 transition-colors">{prop.title}</h3>
                              <div className="flex items-center gap-2 text-white/45 text-xs mt-1">
                                <MapPin size={12} className="text-orange-500" />
                                {prop.loc}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-black text-orange-500">{prop.price}</span>
                              <p className="text-[9px] uppercase tracking-widest text-white/30">Asking Price</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          {prop.beds > 0 && <span className="text-xs text-white/40 flex items-center gap-1.5"><Bed size={13} className="text-orange-500/70" />{prop.beds} Beds</span>}
                          {prop.baths > 0 && <span className="text-xs text-white/40 flex items-center gap-1.5"><Bath size={13} className="text-orange-500/70" />{prop.baths} Baths</span>}
                          <span className="text-xs text-white/40 flex items-center gap-1.5"><Maximize size={13} className="text-orange-500/70" />{prop.sqft} sqft</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── Newsletter CTA ── */}
              <section className="py-28 px-6 bg-black relative overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-60" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-orange-500/8 blur-[150px] rounded-full pointer-events-none" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-orange-500/5 rounded-full pointer-events-none"
                />

                <div className="max-w-3xl mx-auto text-center relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <div className="h-px w-12 bg-orange-500/40" />
                      <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-[10px]">Stay Connected</span>
                      <div className="h-px w-12 bg-orange-500/40" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                      Join Our<br /><span className="text-gradient">Elite Inner Circle</span>
                    </h2>
                    <p className="text-white/35 mb-12 font-light text-lg max-w-xl mx-auto">
                      Subscribe to receive curated insights, early property access, and marketplace trend reports.
                    </p>

                    <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                      <input
                        type="email"
                        placeholder="Your Email Address"
                        className="flex-1 bg-white/5 border border-white/10 px-6 py-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors text-sm rounded-xl placeholder:text-white/25"
                      />
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-8 py-4 orange-gradient-bg text-white text-[10px] font-black tracking-widest uppercase shadow-xl shadow-orange-500/20 hover:opacity-90 transition-all rounded-xl"
                      >
                        Subscribe
                      </motion.button>
                    </form>
                  </motion.div>
                </div>
              </section>
              </div>

            </motion.div>
          )}

          {/* ── SERVICES ── */}
          {currentSection === 'services' && (
            <motion.div
              key="services"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            >
              <ServicesSection onBack={() => handleSectionChange('home')} onRequestQuote={() => setShowContact(true)} />
            </motion.div>
          )}

          {/* ── PROPERTIES ── */}
          {currentSection === 'properties' && (
            <motion.div
              key="properties"
              className="min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PropertiesPage
                onBack={() => handleSectionChange('home')}
                onSectionChange={handleSectionChange}
                onRequestConsultation={() => setShowContact(true)}
              />
            </motion.div>
          )}

          {/* ── SHOP ── */}
          {currentSection === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <TI360Shop
                onExit={() => handleSectionChange('home')}
                initialProductId={shopProductId}
              />
            </motion.div>
          )}

          {/* ── CAREERS ── */}
          {currentSection === 'careers' && (
            <motion.div
              key="careers"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            >
              <CareersPage onBack={() => handleSectionChange('home')} />
            </motion.div>
          )}

          {/* ── FALLBACK ── */}
          {currentSection !== 'home' && currentSection !== 'services' && currentSection !== 'properties' && currentSection !== 'shop' && currentSection !== 'careers' && (
            <motion.div
              key="fallback"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center text-center bg-black"
            >
              <div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  className="w-14 h-14 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-8 shadow-lg shadow-orange-500/25"
                />
                <h1 className="text-4xl font-black mb-4 capitalize text-white">{currentSection} Page</h1>
                <button
                  onClick={() => handleSectionChange('home')}
                  className="px-8 py-3 orange-gradient-bg text-white text-xs tracking-widest uppercase font-black hover:opacity-90 transition-all"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {currentSection !== 'shop' && currentSection !== 'careers' && (
        <Footer
          onSectionChange={handleSectionChange}
          onOpenOurStory={() => setShowOurStory(true)}
          onOpenEliteVendors={() => setShowEliteVendors(true)}
          onOpenSustainability={() => setShowSustainability(true)}
        />
      )}
    </div>
  );
}
