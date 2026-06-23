import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ShoppingBag, Package, Heart, MapPin,
  User, HelpCircle, LogOut, ChevronRight, ArrowLeft,
  Plus, Edit, Trash2, CheckCircle2, Phone, Mail, Layout,
  Linkedin, Twitter, Instagram, Facebook
} from 'lucide-react';
import { ShopAppBar, ProductCard } from '../../components/shop/ShopUI';
import { ShopHomeScreen } from './ShopHomeScreen';
import { ProductDetailScreen } from './ProductDetailScreen';
import { CartScreen } from './CartScreen';
import { CheckoutScreen } from './CheckoutScreen';
import { MyOrdersScreen } from './MyOrdersScreen';
import { ProductComparisonModal } from '../../components/shop/ProductComparisonModal';
import { useShop, ShopProvider } from '../../context/ShopContext';
import { Product, PRODUCTS } from '../../constants/shopData';
import ServicesSection from '../services/ServicesSection';
import PropertiesPage from '../properties/PropertiesPage';

const ProfileView = ({ onBack }: { onBack: () => void }) => {
  const { profile, updateProfile } = useShop();
  const [formData, setFormData] = useState(profile);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-luxury-gold font-black uppercase text-[10px] tracking-widest bg-[var(--paper)] py-3 px-6 rounded-full shadow-lg border border-luxury-gold/20 active:scale-95 transition-all"><ArrowLeft size={16} /> Back to Market</button>

      {/* Success toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 bg-luxury-dark border border-luxury-gold/40 text-white px-6 py-3.5 rounded-2xl shadow-2xl"
          >
            <CheckCircle2 size={18} className="text-luxury-gold shrink-0" />
            <div>
              <p className="text-[12px] font-bold">Profile Updated</p>
              <p className="text-[10px] text-white/50">Your details have been saved successfully.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto bg-[var(--paper)] rounded-[2.5rem] p-10 border border-[var(--line)] shadow-2xl">
        <h1 className="text-3xl font-serif font-black mb-2 text-[var(--ink)]">My Elite Profile</h1>
        <p className="text-[var(--muted)] text-xs mb-10 pb-6 border-b border-[var(--line)]">Manage your industrial procurement identity.</p>
        <div className="space-y-6">
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-luxury-gold mb-2 ml-4">Full Legal Name</p>
            <input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[11px] font-bold outline-none focus:border-luxury-gold text-[var(--ink)]"
            />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-luxury-gold mb-2 ml-4">Electronic Mail</p>
            <input
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[11px] font-bold outline-none focus:border-luxury-gold text-[var(--ink)]"
            />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-luxury-gold mb-2 ml-4">Communication Protocol</p>
            <input
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[11px] font-bold outline-none focus:border-luxury-gold text-[var(--ink)]"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full py-5 bg-luxury-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-luxury-gold transition-all active:scale-95"
          >
            Update Profile Details
          </button>
        </div>
      </div>
    </div>
  );
};

const EMPTY_ADDR = {
  name: '', phone: '', pincode: '', state: '', houseNumber: '',
  line1: '', locality: '', city: '',
  addressType: 'Home' as 'Home' | 'Office',
  openSaturday: false, openSunday: false, isDefault: false,
};

const Field = ({ label, value, onChange, type = 'text', required = true }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) => (
  <div className="relative border-b border-gray-200 pb-1 group focus-within:border-luxury-gold transition-colors">
    <label className="block text-xs text-[var(--muted)] mb-1">{label}{required && ' *'}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-transparent text-sm text-[var(--ink)] outline-none pb-1 placeholder:text-transparent"
    />
  </div>
);

const AddressView = ({ onBack }: { onBack: () => void }) => {
  const { addresses, deleteAddress, setDefaultAddress, addAddress, updateAddress } = useShop();
  const [showForm, setShowForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_ADDR);

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const handleEdit = (addr: any) => {
    setEditingAddr(addr);
    setForm({ ...EMPTY_ADDR, ...addr });
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingAddr(null);
    setForm(EMPTY_ADDR);
  };

  const handleSave = () => {
    const required = [form.name, form.phone, form.pincode, form.state, form.houseNumber, form.line1, form.locality, form.city];
    if (required.some(v => !v.trim())) return;
    if (editingAddr) updateAddress(editingAddr.id, form);
    else addAddress(form);
    handleClose();
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-luxury-gold font-black uppercase text-[10px] tracking-widest bg-[var(--paper)] py-3 px-6 rounded-full shadow-xl border border-luxury-gold/20 active:scale-95 transition-all">
        <ArrowLeft size={16} /> Back to Market
      </button>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-serif font-black text-[var(--ink)]">Saved Addresses</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-luxury-dark text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-luxury-gold transition-all"
          >
            <Plus size={16} /> Add New Address
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map(addr => (
            <div key={addr.id} className={`bg-[var(--paper)] p-6 border-2 shadow-sm relative ${addr.isDefault ? 'border-luxury-gold' : 'border-[var(--line)]'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${addr.isDefault ? 'bg-luxury-gold/10 text-luxury-gold' : 'bg-[var(--bg)] text-[var(--muted)]'}`}>
                    {(addr as any).addressType || 'Home'}
                  </span>
                  {addr.isDefault && <span className="text-[9px] font-black uppercase tracking-widest text-luxury-gold">· Default</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(addr)} className="w-7 h-7 flex items-center justify-center text-[var(--muted)] hover:text-luxury-gold transition-colors"><Edit size={13} /></button>
                  <button onClick={() => deleteAddress(addr.id)} className="w-7 h-7 flex items-center justify-center text-[var(--muted)] hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="font-bold text-sm text-[var(--ink)] mb-0.5">{addr.name}</p>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {(addr as any).houseNumber && `${(addr as any).houseNumber}, `}{addr.line1}{(addr as any).locality && `, ${(addr as any).locality}`}
              </p>
              <p className="text-xs text-[var(--muted)]">{addr.city}, {addr.state} - {addr.pincode}</p>
              <p className="text-xs text-[var(--muted)] mt-1">Mobile: {addr.phone}</p>
              {!addr.isDefault && (
                <button onClick={() => setDefaultAddress(addr.id)} className="mt-3 text-[10px] font-black uppercase tracking-widest text-luxury-gold border border-luxury-gold/30 px-3 py-1 hover:bg-luxury-gold hover:text-white transition-all">
                  Set as Default
                </button>
              )}
            </div>
          ))}
          {addresses.length === 0 && (
            <div className="col-span-full py-20 text-center bg-[var(--paper)] border-2 border-dashed border-[var(--line)]">
              <MapPin size={48} className="mx-auto text-[var(--muted)] opacity-20 mb-4" />
              <p className="text-[var(--muted)] font-bold">No addresses saved yet.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="bg-[var(--paper)] w-full sm:max-w-md max-h-[92vh] overflow-y-auto flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[var(--paper)] border-b border-[var(--line)] px-5 py-4 flex items-center justify-between z-10">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--ink)]">
                  {editingAddr ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button onClick={handleClose} className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors"><X size={18} /></button>
              </div>

              <div className="px-5 py-6 space-y-5 flex-1">
                <Field label="Name" value={form.name} onChange={v => set('name', v)} />
                <Field label="Mobile" value={form.phone} onChange={v => set('phone', v)} type="tel" />

                <div className="h-px bg-gray-100 my-2" />

                <div className="grid grid-cols-2 gap-6">
                  <Field label="Pincode" value={form.pincode} onChange={v => set('pincode', v)} />
                  <Field label="State" value={form.state} onChange={v => set('state', v)} />
                </div>

                <Field label="House Number/Tower/Block" value={form.houseNumber} onChange={v => set('houseNumber', v)} />
                <Field label="Address (Building, Street, Area)" value={form.line1} onChange={v => set('line1', v)} />
                <Field label="Locality / Town" value={form.locality} onChange={v => set('locality', v)} />
                <Field label="City / District" value={form.city} onChange={v => set('city', v)} />

                <div className="h-px bg-gray-100 my-2" />

                {/* Address Type */}
                <div>
                  <p className="text-xs text-[var(--muted)] mb-3">Type of Address *</p>
                  <div className="flex gap-6">
                    {(['Home', 'Office'] as const).map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <div
                          onClick={() => set('addressType', type)}
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${form.addressType === type ? 'border-luxury-gold' : 'border-gray-400'}`}
                        >
                          {form.addressType === type && <div className="w-2 h-2 rounded-full bg-luxury-gold" />}
                        </div>
                        <span className="text-sm text-[var(--ink)]">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {form.addressType === 'Office' && (
                  <div className="space-y-2">
                    <p className="text-xs text-[var(--muted)]">Is your office open on weekends?</p>
                    {[{ key: 'openSaturday', label: 'Open on Saturday' }, { key: 'openSunday', label: 'Open on Sunday' }].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => set(key, !(form as any)[key])}
                          className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${(form as any)[key] ? 'border-luxury-gold bg-luxury-gold' : 'border-gray-400'}`}
                        >
                          {(form as any)[key] && <div className="w-2 h-2 bg-white" />}
                        </div>
                        <span className="text-sm text-luxury-gold">{label}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="h-px bg-gray-100 my-2" />

                {/* Default checkbox */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => set('isDefault', !form.isDefault)}
                    className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${form.isDefault ? 'border-luxury-gold bg-luxury-gold' : 'border-gray-400'}`}
                  >
                    {form.isDefault && <div className="w-2 h-2 bg-white" />}
                  </div>
                  <span className="text-sm text-[var(--muted)]">Make this as my default address</span>
                </label>
              </div>

              {/* Footer buttons */}
              <div className="sticky bottom-0 grid grid-cols-2 border-t border-[var(--line)]">
                <button
                  onClick={handleClose}
                  className="py-4 text-[11px] font-black uppercase tracking-widest text-[var(--muted)] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="py-4 text-[11px] font-black uppercase tracking-widest text-white bg-gray-400 hover:bg-luxury-gold transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SupportView = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-[var(--bg)] p-6">
    <button onClick={onBack} className="mb-8 flex items-center gap-2 text-luxury-gold font-black uppercase text-[10px] tracking-widest bg-[var(--paper)] py-3 px-6 rounded-full shadow-xl border border-luxury-gold/20 active:scale-95 transition-all"><ArrowLeft size={16} /> Back to Market</button>
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-serif font-black mb-4 text-[var(--ink)]">Concierge Support</h1>
      <p className="text-[var(--muted)] text-sm mb-12 italic max-w-lg mx-auto">Instant resolution for your industrial procurement complexities. Guaranteed priority response.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Phone, title: 'Priority Hotline', desc: '+91 800 555 1234', color: 'bg-green-500' },
          { icon: Mail, title: 'Direct Intelligence', desc: 'support@ti360.com', color: 'bg-blue-500' },
          { icon: Layout, title: 'Interactive FAQ', desc: 'Browse the Archives', color: 'bg-luxury-gold' }
        ].map((item, i) => (
          <div key={i} className="bg-[var(--paper)] p-10 rounded-[2.5rem] border border-[var(--line)] shadow-lg hover:shadow-2xl transition-all cursor-pointer">
            <div className={`w-16 h-16 ${item.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl`}>
              <item.icon size={32} />
            </div>
            <h3 className="font-serif font-black text-xl mb-2 text-[var(--ink)]">{item.title}</h3>
            <p className="text-xs text-[var(--muted)] font-medium italic">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ShopFooter = () => (
  <footer className="bg-luxury-dark text-white py-20 mt-20">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-4xl font-serif font-black mb-6 tracking-tighter">TI360<span className="text-luxury-gold">SHOP</span></h2>
          <p className="text-white/40 text-sm max-w-sm mb-8 leading-relaxed italic">The definitive marketplace for luxury raw materials and high-end industrial essentials. Redefining procurement for the elite.</p>
          <div className="flex gap-4">
            {[Instagram, Linkedin, Twitter, Facebook].map((Icon, i) => (
              <button key={i} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-luxury-gold hover:text-white transition-all"><Icon size={18} /></button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-luxury-gold mb-6">Explore</h4>
          <ul className="space-y-4">
            {['Flooring', 'Hardware', 'Electrical', 'Sanitary'].map((item, i) => (
              <li key={i} className="text-sm font-medium text-white/60 hover:text-white transition-colors cursor-pointer">{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-luxury-gold mb-6">Legal Protocol</h4>
          <ul className="space-y-4">
            {['Terms of Trade', 'Privacy Protocol', 'Supply Integrity', 'Returns Policy'].map((item, i) => (
              <li key={i} className="text-sm font-medium text-white/60 hover:text-white transition-colors cursor-pointer">{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="pt-10 border-t border-white/5 flex flex-col md:row items-center justify-between gap-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 text-center">© 2026 Technoventive Innovations Pvt Ltd. All Rights Reserved.</p>
        <div className="flex gap-8">
           <img src="https://img.icons8.com/color/48/visa.png" className="h-6 grayscale opacity-30 invert" alt="visa" />
           <img src="https://img.icons8.com/color/48/mastercard.png" className="h-6 grayscale opacity-30 invert" alt="master" />
           <img src="https://img.icons8.com/color/48/paypal.png" className="h-6 grayscale opacity-30 invert" alt="paypal" />
        </div>
      </div>
    </div>
  </footer>
);

const OtpAuthModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const { login, signup } = useShop();
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sendOtp = () => {
    if (phone.length < 10) { setError('Enter a valid 10-digit number'); return; }
    const mock = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mock);
    setError('');
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('otp'); }, 1500);
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits];
    next[i] = val;
    setOtpDigits(next);
    setError('');
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i: number, e: { key: string }) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const verifyOtp = () => {
    const entered = otpDigits.join('');
    if (entered.length < 6) { setError('Enter the complete 6-digit OTP'); return; }
    if (entered !== generatedOtp) { setError('Incorrect OTP. Please try again.'); return; }
    setError('');
    setStep('name');
  };

  const completeAuth = () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    signup(name, phone, '', '');
    onSuccess();
  };

  const handleLoginReturning = () => {
    login(phone, '');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
        className="bg-[var(--paper)] w-full sm:max-w-sm rounded-t-[2rem] sm:rounded-[2rem] border border-[var(--line)] shadow-2xl overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-luxury-gold via-yellow-300 to-luxury-gold" />
        <div className="p-7">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif font-black text-[var(--ink)] leading-tight">
                {step === 'phone' ? 'Sign In / Sign Up' : step === 'otp' ? 'Verify OTP' : 'Almost Done'}
              </h2>
              <p className="text-[9px] text-[var(--muted)] uppercase tracking-[0.25em] mt-1 font-bold">
                {step === 'phone' ? "We'll send a one-time password" : step === 'otp' ? `OTP sent to +91 ${phone}` : 'Tell us your name'}
              </p>
            </div>
            <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors mt-1"><X size={20} /></button>
          </div>

          {step === 'phone' && (
            <>
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)] pointer-events-none">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  autoFocus
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  placeholder="10-digit mobile number"
                  className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg)] border border-[var(--line)] rounded-xl text-xs font-medium text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold transition-colors"
                />
              </div>
              {error && <p className="text-red-500 text-[9px] font-bold mb-3 ml-1">{error}</p>}
              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full py-4 bg-luxury-gold text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-xl shadow-lg shadow-luxury-gold/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
              >
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="bg-luxury-gold/10 border border-luxury-gold/30 rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
                <span className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest">Demo OTP</span>
                <span className="text-base font-black text-luxury-gold tracking-[0.3em]">{generatedOtp}</span>
              </div>
              <div className="flex gap-2 justify-center mb-4">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    autoFocus={i === 0}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className={`w-11 h-12 text-center text-xl font-black bg-[var(--bg)] border-2 rounded-xl text-[var(--ink)] focus:outline-none transition-colors ${digit ? 'border-luxury-gold' : 'border-[var(--line)] focus:border-luxury-gold'}`}
                  />
                ))}
              </div>
              {error && <p className="text-red-500 text-[9px] font-bold mb-3 text-center">{error}</p>}
              <button onClick={verifyOtp} className="w-full py-4 bg-luxury-gold text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-xl shadow-lg shadow-luxury-gold/20 hover:opacity-90 active:scale-95 transition-all">
                Verify & Continue
              </button>
              <button onClick={() => { setStep('phone'); setOtpDigits(['','','','','','']); setError(''); }} className="w-full mt-3 py-2 text-[9px] font-bold text-[var(--muted)] hover:text-luxury-gold transition-colors tracking-widest uppercase">
                Change Number
              </button>
            </>
          )}

          {step === 'name' && (
            <>
              <input
                value={name}
                autoFocus
                onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="Your full name"
                onKeyDown={e => e.key === 'Enter' && completeAuth()}
                className="w-full px-4 py-3.5 bg-[var(--bg)] border border-[var(--line)] rounded-xl text-xs font-medium text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-luxury-gold transition-colors mb-3"
              />
              {error && <p className="text-red-500 text-[9px] font-bold mb-3 ml-1">{error}</p>}
              <button onClick={completeAuth} className="w-full py-4 bg-luxury-gold text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-xl shadow-lg shadow-luxury-gold/20 hover:opacity-90 active:scale-95 transition-all mb-3">
                Create Account
              </button>
              <button onClick={handleLoginReturning} className="w-full py-3 border border-[var(--line)] rounded-xl text-[9px] font-bold text-[var(--muted)] hover:border-luxury-gold hover:text-luxury-gold transition-colors tracking-widest uppercase">
                Already a member? Sign In
              </button>
            </>
          )}

          <p className="text-center text-[8px] text-[var(--muted)] mt-5 leading-relaxed">
            By continuing, you agree to our <span className="text-luxury-gold cursor-pointer">Terms of Service</span> & <span className="text-luxury-gold cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const ShopContent = ({ onExit, theme, toggleTheme }: { onExit?: () => void, theme?: string, toggleTheme?: () => void }) => {
  const [view, setView] = useState<'home' | 'detail' | 'cart' | 'checkout' | 'orders' | 'orderSuccess' | 'category' | 'wishlist' | 'profile' | 'addresses' | 'support' | 'services' | 'properties'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForCheckout, setAuthForCheckout] = useState(false);
  const { cart, favorites, profile, compareList, clearCompare, toggleCompare, isLoggedIn, logout } = useShop();

  const goToCheckout = () => {
    if (!isLoggedIn) { setAuthForCheckout(true); setShowAuthModal(true); } else { setView('checkout'); }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setView('detail');
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setView('category');
  };

  const handleViewHome = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setView('home');
  };

  const handleBuyNow = (product: Product) => {
    handleProductSelect(product);
    // In detail screen, Buy Now will handle checkout
  };

  const DrawerItem = ({ icon: Icon, label, onClick }: any) => (
    <button 
      onClick={() => { onClick(); setIsDrawerOpen(false); }}
      className="w-full flex items-center justify-between p-4 hover:bg-luxury-gold/5 transition-colors border-b border-[var(--line)] group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 text-luxury-gold flex items-center justify-center group-hover:bg-luxury-gold group-hover:text-white transition-all">
          <Icon size={20} />
        </div>
        <span className="text-xs font-bold tracking-widest uppercase text-[var(--ink)]">{label}</span>
      </div>
      <ChevronRight size={16} className="text-[var(--line)]" />
    </button>
  );

  return (
    <div className="relative">
      {(view === 'home' || view === 'category' || view === 'wishlist' || view === 'profile' || view === 'addresses' || view === 'support' || view === 'orders') && view !== 'services' && view !== 'properties' && (
        <ShopAppBar 
          onOpenDrawer={() => setIsDrawerOpen(true)} 
          onGoToCart={() => setView('cart')}
          onGoToWishlist={() => setView('wishlist')}
          itemCount={cart.reduce((acc, item) => acc + item.qty, 0)}
          wishlistCount={favorites.length}
          onViewHome={handleViewHome}
          onExitShop={onExit || (() => window.location.href = '/')} 
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      <AnimatePresence mode="wait">
        {(view === 'home' || (view === 'category' && !selectedCategory)) && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ShopHomeScreen 
              onSelectProduct={handleProductSelect} 
              onCategorySelect={handleCategorySelect}
              searchQuery={searchQuery}
            />
          </motion.div>
        )}

        {view === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ProfileView onBack={() => setView('home')} />
          </motion.div>
        )}

        {view === 'addresses' && (
          <motion.div key="addresses" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <AddressView onBack={() => setView('home')} />
          </motion.div>
        )}

        {view === 'support' && (
          <motion.div key="support" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <SupportView onBack={() => setView('home')} />
          </motion.div>
        )}

        {view === 'category' && selectedCategory && (
          <motion.div key="category" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="min-h-screen bg-[var(--bg)] pb-20">
               <div className="p-6">
                 <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setView('home')} className="w-10 h-10 rounded-full flex items-center justify-center bg-luxury-dark text-white shadow-lg hover:bg-luxury-gold transition-colors">
                      <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 flex-1">
                       <h1 className="text-3xl font-serif font-black tracking-tight text-[var(--ink)]">{selectedCategory}</h1>
                       <span className="h-px flex-1 bg-[var(--line)] ml-4" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                   {PRODUCTS.filter(p => p.category === selectedCategory).map(p => (
                     <ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />
                   ))}
                 </div>
               </div>
            </div>
          </motion.div>
        )}

        {view === 'wishlist' && (
          <motion.div key="wishlist" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="min-h-screen bg-[var(--bg)] pb-20">
               <div className="p-6">
                 <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setView('home')} className="w-10 h-10 rounded-full flex items-center justify-center bg-luxury-dark text-white shadow-lg hover:bg-luxury-gold transition-colors">
                      <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 flex-1">
                       <h1 className="text-3xl font-serif font-black tracking-tight text-[var(--ink)]">My Wishlist</h1>
                       <span className="h-px flex-1 bg-[var(--line)] ml-4" />
                    </div>
                 </div>
                 {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {PRODUCTS.filter(p => favorites.includes(p.id)).map(p => (
                        <ProductCard key={p.id} product={p} onClick={() => handleProductSelect(p)} />
                      ))}
                    </div>
                 ) : (
                    <div className="text-center py-20">
                       <Heart size={48} className="mx-auto text-[var(--muted)] opacity-20 mb-4" />
                       <p className="text-[var(--muted)] font-bold">Your wishlist is empty.</p>
                    </div>
                 )}
               </div>
            </div>
          </motion.div>
        )}
        
        {view === 'detail' && selectedProduct && (
          <motion.div key="detail" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 120 }}>
            <ProductDetailScreen 
              product={selectedProduct} 
              onBack={() => setView('home')} 
              onBuyNow={goToCheckout}
              onSelectProduct={handleProductSelect}
            />
          </motion.div>
        )}

        {view === 'cart' && (
          <motion.div key="cart" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}>
            <CartScreen onBack={() => setView('home')} onCheckout={goToCheckout} />
          </motion.div>
        )}

        {view === 'checkout' && (
          <motion.div key="checkout" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
            <CheckoutScreen onBack={() => setView('cart')} onOrderSuccess={() => setView('orderSuccess')} />
          </motion.div>
        )}

        {view === 'orders' && (
          <motion.div key="orders" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}>
            <MyOrdersScreen onBack={() => setView('home')} />
          </motion.div>
        )}

        {view === 'services' && (
          <motion.div key="services" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 120 }}>
            <ServicesSection onBack={() => setView('home')} />
          </motion.div>
        )}

        {view === 'properties' && (
          <motion.div key="properties" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 120 }}>
            <PropertiesPage onBack={() => setView('home')} isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuthModal(true)} />
          </motion.div>
        )}

        {view === 'orderSuccess' && (
          <motion.div 
            key="success" 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="fixed inset-0 z-[100] bg-[var(--bg)] flex flex-col items-center justify-center p-6 text-center"
          >
             <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white mb-8 shadow-2xl shadow-green-500/20">
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                 <ShoppingBag size={48} />
               </motion.div>
             </div>
             <h2 className="text-3xl font-serif font-black text-[var(--ink)] mb-4">Confirmed! 🎉</h2>
             <p className="text-[var(--muted)] text-sm max-w-xs mb-10 leading-relaxed italic">Your procurement request has been successfully dispatched. Monitor your history for live updates.</p>
             <div className="flex flex-col gap-4 w-full max-w-xs">
                <button onClick={() => setView('home')} className="w-full py-4 bg-luxury-dark text-white text-[10px] font-bold tracking-widest uppercase rounded-xl">Back to Market</button>
                <button onClick={() => setView('orders')} className="w-full py-4 bg-luxury-gold text-white text-[10px] font-bold tracking-widest uppercase rounded-xl">View My Orders</button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-[var(--paper)] z-[101] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Profile Header */}
              <div className="relative bg-luxury-dark px-6 pt-12 pb-6">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="absolute top-5 left-5 text-white/50 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                {isLoggedIn ? (
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-16 h-16 rounded-full bg-luxury-gold flex items-center justify-center text-white font-serif text-2xl font-black shadow-lg shadow-luxury-gold/30 shrink-0">
                        {profile?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-white/50 uppercase tracking-[0.3em] font-bold mb-0.5">Hello,</p>
                        <p className="text-lg font-serif font-black text-white leading-tight line-clamp-1">{profile?.name || 'TI360 User'}</p>
                        {profile?.phone && <p className="text-[10px] text-white/60 mt-0.5">+91 {profile.phone}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-luxury-gold/20 border border-luxury-gold/30 rounded-full text-[8px] font-black text-luxury-gold uppercase tracking-widest">
                        ★ Elite Member
                      </span>
                      <button
                        onClick={() => { setView('profile'); setIsDrawerOpen(false); }}
                        className="text-[9px] text-white/40 hover:text-luxury-gold transition-colors font-bold uppercase tracking-widest underline underline-offset-2"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-6">
                    <p className="text-white font-serif font-black text-xl mb-1">Welcome</p>
                    <p className="text-white/50 text-xs mb-5">To access account and manage orders</p>
                    <button
                      onClick={() => { setAuthForCheckout(false); setShowAuthModal(true); setIsDrawerOpen(false); }}
                      className="px-8 py-2.5 border border-luxury-gold text-luxury-gold rounded text-[11px] font-black uppercase tracking-[0.2em] hover:bg-luxury-gold hover:text-white active:scale-95 transition-all"
                    >
                      Login / Signup
                    </button>
                  </div>
                )}
              </div>

              {/* Nav items */}
              <div className="flex-1 overflow-y-auto">
                {/* Explore */}
                <div className="px-5 pt-5 pb-1">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">Explore</p>
                </div>
                <DrawerItem icon={User} label="My Profile" onClick={() => setView('profile')} />

                {/* My Account */}
                <div className="px-5 pt-5 pb-1">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">My Account</p>
                </div>
                <DrawerItem icon={Package} label="My Orders" onClick={() => setView('orders')} />
                <DrawerItem icon={ShoppingBag} label="My Cart" onClick={() => setView('cart')} />
                <DrawerItem icon={Heart} label="Wishlist" onClick={() => setView('wishlist')} />
                <DrawerItem icon={MapPin} label="Saved Addresses" onClick={() => { if (!isLoggedIn) { setAuthForCheckout(false); setShowAuthModal(true); } else { setView('addresses'); } }} />

                {/* Support */}
                <div className="px-5 pt-5 pb-1">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">Help</p>
                </div>
                <DrawerItem icon={HelpCircle} label="Help & Support" onClick={() => setView('support')} />
                {isLoggedIn && (
                  <button
                    onClick={() => { logout(); setIsDrawerOpen(false); }}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-500/5 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                      <LogOut size={18} />
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase text-red-500">Sign Out</span>
                  </button>
                )}
                <div className="h-6" />
              </div>

              <div className="px-5 py-4 border-t border-[var(--line)]">
                <p className="text-[8px] text-center text-[var(--muted)] font-black uppercase tracking-[0.2em]">TI360 Procurement · v2.4.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {view === 'home' && <ShopFooter />}

      {/* Floating Compare Shelf */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-[90] bg-luxury-dark border-t-2 border-luxury-gold shadow-2xl"
          >
            <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center gap-4">
              {/* Badge */}
              <div className="w-11 h-11 rounded-full bg-luxury-gold flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg shadow-luxury-gold/30">
                {compareList.length}
              </div>
              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="text-luxury-gold text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-0.5">Comparison Shelf</p>
                <p className="text-white/50 text-[9px] font-medium leading-none">
                  {compareList.length === 1
                    ? `Add another ${PRODUCTS.find(p => p.id === compareList[0])?.category} item`
                    : '2 products selected — ready to compare'}
                </p>
              </div>
              {/* Thumbnails */}
              <div className="flex gap-2 shrink-0">
                {compareList.map((id: string) => {
                  const p = PRODUCTS.find(pr => pr.id === id);
                  if (!p) return null;
                  return (
                    <div key={id} className="w-10 h-10 rounded-lg overflow-hidden border border-luxury-gold/40">
                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  );
                })}
                {compareList.length === 1 && (
                  <div className="w-10 h-10 rounded-lg border border-dashed border-luxury-gold/30 flex items-center justify-center text-luxury-gold/40 text-xl font-bold">?</div>
                )}
              </div>
              {/* Actions */}
              <button onClick={clearCompare} className="text-white/50 hover:text-white text-[9px] font-black uppercase tracking-widest shrink-0 transition-colors px-2">
                Clear All
              </button>
              <button
                onClick={() => { if (compareList.length === 2) setShowCompareModal(true); }}
                disabled={compareList.length < 2}
                className="px-5 py-2.5 bg-luxury-gold text-white text-[9px] font-black uppercase tracking-widest rounded-xl shrink-0 disabled:opacity-35 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all"
              >
                Compare Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompareModal && compareList.length === 2 && (() => {
          const a = PRODUCTS.find(p => p.id === compareList[0]);
          const b = PRODUCTS.find(p => p.id === compareList[1]);
          if (!a || !b) return null;
          return (
            <ProductComparisonModal
              productA={a}
              productB={b}
              onClose={() => setShowCompareModal(false)}
              onRemoveA={() => { toggleCompare(a.id); setShowCompareModal(false); }}
              onRemoveB={() => { toggleCompare(b.id); setShowCompareModal(false); }}
              onClearAll={() => { clearCompare(); setShowCompareModal(false); }}
              onGoToCart={() => { clearCompare(); setShowCompareModal(false); setView('cart'); }}
            />
          );
        })()}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <OtpAuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => { setShowAuthModal(false); if (authForCheckout) { setAuthForCheckout(false); setView('checkout'); } }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export const ShopContainer = ({ onExit, theme, toggleTheme }: { onExit?: () => void, theme?: string, toggleTheme?: () => void }) => (
  <ShopProvider>
    <ShopContent onExit={onExit} theme={theme} toggleTheme={toggleTheme} />
  </ShopProvider>
);
