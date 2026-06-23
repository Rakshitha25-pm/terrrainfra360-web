/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useShopMode } from '../state/ShopModeContext';
import { GSTIN_REGEX, COLORS } from '../constants';
import { ArrowLeft, CheckCircle2, Upload, FileText, Building2, UserCircle, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export function BusinessOnboardingScreen({ onNavigate }: { onNavigate: (s: any) => void }) {
  const { setBusinessProfile } = useShopMode();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    gstin: '',
    pan: '',
    contactName: '',
    contactPhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const profile = {
        ...formData,
        status: 'PENDING' as const,
        creditLimit: 100000,
        creditDays: 30,
        creditUsed: 0,
        billingAddress: {
          id: 'addr_1',
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          isDefault: true,
        }
      };
      setBusinessProfile(profile);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111] p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Application Submitted!</h1>
          <p className="text-white/50">
            Our verification team will review your business documents within 24-48 hours. 
            In the meantime, you can continue browsing the Wholesale catalog.
          </p>
          <button 
            onClick={() => onNavigate('SHOP')}
            className="w-full bg-orange-500/150 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-colors"
          >
            Continue Browsing
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col">
      <header className="bg-[#111] border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <button onClick={() => onNavigate('SHOP')} className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Business Registration</h1>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-8">
        {/* Progress Stepper */}
        <div className="flex justify-between relative mt-4">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2" />
          {[1, 2, 3].map((s) => (
            <div key={s} className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s ? 'bg-[#f97316] text-white' : 'bg-white/10 text-white/50'}`}>
              {s}
            </div>
          ))}
        </div>

        <div className="bg-[#111] rounded-2xl p-8 shadow-sm border border-white/8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="text-[#f97316]" />
                  <h2 className="text-lg font-bold">Company Details</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase mb-1">Company Name</label>
                    <input name="companyName" value={formData.companyName} onChange={handleChange} required className="w-full h-12 px-4 rounded-xl border border-white/10 focus:border-[#f97316] outline-none" placeholder="e.g. Terra Infrastructure Ltd" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase mb-1">GSTIN</label>
                    <input name="gstin" value={formData.gstin} onChange={handleChange} required className="w-full h-12 px-4 rounded-xl border border-white/10 focus:border-[#f97316] outline-none uppercase" placeholder="e.g. 29AAAAA0000A1Z5" />
                    {formData.gstin && !GSTIN_REGEX.test(formData.gstin.toUpperCase()) && (
                      <p className="mt-1 text-xs text-red-500">Invalid GSTIN format</p>
                    )}
                  </div>
                  <div className="pt-4 p-6 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-4 text-center group cursor-pointer hover:border-[#f97316] transition-colors">
                    <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center text-white/40 group-hover:text-[#f97316] group-hover:bg-[#f97316]/10 transition-colors">
                      <Upload size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Upload GST Certificate</p>
                      <p className="text-xs text-white/40">PDF or Image (Max 5MB)</p>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={handleNext} disabled={!formData.companyName || !formData.gstin} className="w-full bg-orange-500/150 text-white h-14 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 disabled:opacity-50 transition-all">
                  Continue
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <UserCircle className="text-[#f97316]" />
                  <h2 className="text-lg font-bold">Contact Person</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase mb-1">Full Name</label>
                    <input name="contactName" value={formData.contactName} onChange={handleChange} required className="w-full h-12 px-4 rounded-xl border border-white/10 focus:border-[#f97316] outline-none" placeholder="e.g. Suraj Vyas" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase mb-1">Phone Number</label>
                    <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} required className="w-full h-12 px-4 rounded-xl border border-white/10 focus:border-[#f97316] outline-none" placeholder="e.g. +91 9876543210" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={handleBack} className="flex-1 bg-white/10 h-14 rounded-xl font-bold">Back</button>
                  <button type="button" onClick={handleNext} disabled={!formData.contactName || !formData.contactPhone} className="flex-[2] bg-orange-500/150 text-white h-14 rounded-xl font-bold">Continue</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="text-[#f97316]" />
                  <h2 className="text-lg font-bold">Billing Address</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase mb-1">Street Address</label>
                    <input name="street" value={formData.street} onChange={handleChange} required className="w-full h-12 px-4 rounded-xl border border-white/10 focus:border-[#f97316] outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase mb-1">City</label>
                      <input name="city" value={formData.city} onChange={handleChange} required className="w-full h-12 px-4 rounded-xl border border-white/10 focus:border-[#f97316] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase mb-1">State</label>
                      <input name="state" value={formData.state} onChange={handleChange} required className="w-full h-12 px-4 rounded-xl border border-white/10 focus:border-[#f97316] outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase mb-1">ZIP Code</label>
                    <input name="zipCode" value={formData.zipCode} onChange={handleChange} required className="w-full h-12 px-4 rounded-xl border border-white/10 focus:border-[#f97316] outline-none" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={handleBack} className="flex-1 bg-white/10 h-14 rounded-xl font-bold">Back</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] bg-[#f97316] text-white h-14 rounded-xl font-bold flex items-center justify-center gap-2">
                    {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
