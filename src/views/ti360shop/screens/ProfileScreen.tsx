/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useShopMode } from '../state/ShopModeContext';
import { ArrowLeft, Building2, ShieldCheck, Mail, Phone, MapPin, ExternalLink, Zap } from 'lucide-react';

export function ProfileScreen({ onNavigate }: { onNavigate: (s: any) => void }) {
  const { isVerifiedB2B, businessProfile } = useShopMode();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#111] border-b border-white/10 px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => onNavigate('SHOP')} className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Business Profile</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* User Card */}
        <section className="bg-[#111] rounded-2xl p-6 shadow-sm border border-white/10 flex items-center gap-6">
          <div className="h-20 w-20 bg-[#f97316] rounded-full flex items-center justify-center text-3xl font-black text-white">
            SV
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{businessProfile?.contactName || 'Suraj Vyas'}</h2>
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-2 text-sm text-white/50 font-medium">
                <Mail size={14} />
                <span>surajvysya20@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50 font-medium">
                <Phone size={14} />
                <span>+91 9876543210</span>
              </div>
            </div>
          </div>
        </section>

        {/* Business Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-white/40 uppercase tracking-widest px-2">Wholesale Membership</h3>
          
          <div className="bg-[#111] rounded-3xl shadow-sm border border-white/8 overflow-hidden">
            <div className="p-6">
              {!businessProfile ? (
                <div className="text-center py-6">
                  <p className="text-white/50 mb-4">You haven't registered your business yet.</p>
                  <button 
                    onClick={() => onNavigate('ONBOARDING')}
                    className="bg-orange-500/150 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600"
                  >
                    Complete Registration
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-black/30 p-6 rounded-2xl border border-white/8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-[#111] rounded-xl flex items-center justify-center text-[#f97316] shadow-sm">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <p className="font-black text-lg text-white leading-tight">{businessProfile.companyName}</p>
                        <p className="text-xs text-white/40 font-bold mt-0.5">GSTIN: {businessProfile.gstin}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      businessProfile.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-300' :
                      businessProfile.status === 'PENDING' ? 'bg-yellow-500/15 text-yellow-300' :
                      'bg-red-500/100/15 text-red-300'
                    }`}>
                      {businessProfile.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 border border-white/8 rounded-2xl bg-blue-500/100/10">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Available Credit</p>
                      <p className="text-2xl font-black text-blue-400">₹{businessProfile.creditLimit.toLocaleString()}</p>
                      <p className="text-[10px] text-blue-400 font-bold mt-1 uppercase tracking-tighter">Net-{businessProfile.creditDays} Billing Cycle</p>
                    </div>
                    <div className="p-6 border border-white/8 rounded-2xl bg-black/30">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Documentation</p>
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#f97316] cursor-pointer hover:underline">
                          <ExternalLink size={14} />
                          <span>GST Certificate</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#f97316] cursor-pointer hover:underline">
                          <ExternalLink size={14} />
                          <span>Business PAN</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {businessProfile.status === 'APPROVED' && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/25">
                      <div className="h-10 w-10 bg-green-600 text-white rounded-xl flex items-center justify-center">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-emerald-300 leading-none">Verified Wholesale Partner</p>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase mt-1">Direct Factory Pricing Enabled</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest px-2">Support & Legal</h3>
          <div className="bg-[#111] rounded-2xl border border-white/10 divide-y divide-white/5">
            <button className="w-full text-left p-4 hover:bg-white/5 transition-colors flex justify-between items-center">
              <span>Customer Support</span>
              <ChevronRight size={18} className="text-white/30" />
            </button>
            <button className="w-full text-left p-4 hover:bg-white/5 transition-colors flex justify-between items-center">
              <span>Privacy Policy</span>
              <ChevronRight size={18} className="text-white/30" />
            </button>
            <button className="w-full text-left p-4 hover:bg-white/5 transition-colors flex justify-between items-center">
              <span>Terms of Service</span>
              <ChevronRight size={18} className="text-white/30" />
            </button>
          </div>
        </section>

        <button className="w-full p-4 bg-[#111] text-red-600 font-bold rounded-2xl border border-white/10 hover:bg-red-500/100/10 transition-colors mt-8">
          Sign Out
        </button>
      </main>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
