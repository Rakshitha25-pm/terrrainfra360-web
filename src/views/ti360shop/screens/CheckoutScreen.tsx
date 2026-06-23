/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCart } from '../state/CartContext';
import { useShopMode } from '../state/ShopModeContext';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { ArrowLeft, Trash2, ShieldCheck, MapPin, CreditCard, ChevronRight, AlertCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';

export function CheckoutScreen({ onNavigate }: { onNavigate: (s: any) => void }) {
  const { items, removeFromCart, updateQty, clearCart } = useCart();
  const { isVerifiedB2B, businessProfile, mode } = useShopMode();
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'NET30'>('ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);

  const cartProducts = items.map(item => ({
    ...item,
    product: MOCK_PRODUCTS.find(p => p.id === item.productId)!
  }));

  const subtotal = cartProducts.reduce((acc, item) => acc + (item.resolvedPrice * item.qty), 0);
  
  // GST Math
  const cgst = subtotal * 0.09; 
  const sgst = subtotal * 0.09;
  const igst = 0; 
  const totalGst = cgst + sgst + igst;
  const total = subtotal + totalGst;

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem('tf360_orders_v1') || '[]');
        saved.unshift({
          id: 'ORD-' + Date.now().toString().slice(-6),
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          total,
          status: 'PLACED',
          isB2B: mode === 'b2b',
          items: items.length,
          paymentMethod,
        });
        localStorage.setItem('tf360_orders_v1', JSON.stringify(saved));
      } catch {}
      setIsProcessing(false);
      clearCart();
      onNavigate('ORDERS');
    }, 2000);
  };

  const isB2B = mode === 'b2b';
  const canCheckout = true; // Business is approved by default in context now

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#111] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('SHOP')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight leading-none">{isB2B ? 'Wholesale Order' : 'Your Order'}</h1>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{isB2B ? 'Finalize Procurement' : 'Complete Your Purchase'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-white/40 uppercase tracking-widest">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Secure Business Checkout</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Cart Items */}
          <section className="bg-[#111] rounded-3xl shadow-sm overflow-hidden border border-white/8">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/30">
              <h2 className="font-black text-lg tracking-tight">Order Items ({items.length})</h2>
              {isB2B && (
              <div className="flex items-center gap-2 bg-emerald-500/15 text-emerald-300 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                <ShieldCheck size={12} />
                Business Account Verified
              </div>
              )}
            </div>
            <div className="divide-y divide-white/5">
              {cartProducts.length === 0 ? (
                <div className="p-16 text-center text-white/40 font-medium italic">{isB2B ? 'Your wholesale cart is empty' : 'Your cart is empty'}</div>
              ) : (
                cartProducts.map(item => (
                  <div key={item.productId} className="p-8 flex gap-6 hover:bg-white/5 transition-colors">
                    <div className="h-24 w-24 rounded-2xl overflow-hidden bg-black/30 border border-white/8">
                      <img src={item.product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-black text-base text-white leading-tight">{item.product.name}</h3>
                        <button onClick={() => removeFromCart(item.productId)} className="text-white/30 hover:text-red-500 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{isB2B ? 'Wholesale Rate' : 'Price'}</span>
                        <span className="text-xs font-black text-emerald-400">₹{item.resolvedPrice.toLocaleString()} / unit</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-white/5 rounded-xl p-1.5 border border-white/8">
                          <button 
                            onClick={() => updateQty(item.productId, Math.max(isB2B ? (item.product.b2b?.moq || 1) : 1, item.qty - 1), isB2B ? 'b2b' : 'b2c', MOCK_PRODUCTS)}
                            className="w-10 h-10 flex items-center justify-center bg-[#111] rounded-lg shadow-sm text-white hover:bg-[#f97316] hover:text-white transition-all disabled:opacity-30"
                            disabled={item.qty <= (isB2B ? (item.product.b2b?.moq || 1) : 1)}
                          >
                            <span className="text-xl">−</span>
                          </button>
                          <span className="w-16 text-center font-black text-sm">{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.productId, item.qty + 1, isB2B ? 'b2b' : 'b2c', MOCK_PRODUCTS)}
                            className="w-10 h-10 flex items-center justify-center bg-[#111] rounded-lg shadow-sm text-white hover:bg-[#f97316] hover:text-white transition-all"
                          >
                            <span className="text-xl">+</span>
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Item Total</p>
                          <p className="font-black text-xl text-white">₹{(item.resolvedPrice * item.qty).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Address Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`bg-[#111] p-6 rounded-2xl shadow-sm border ${isB2B ? 'border-blue-500/25' : 'border-white/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm uppercase flex items-center gap-2">
                  <MapPin size={16} className="text-[#f97316]" />
                  {isB2B ? 'Bill to Address' : 'Delivery Address'}
                </h3>
                <button className="text-[#f97316] text-xs font-bold">Edit</button>
              </div>
              <p className="text-sm font-bold">Suraj Vyas</p>
              <p className="text-sm text-white/50">123, Marketplace Street, Commercial Hub</p>
              <p className="text-sm text-white/50">Bangalore, Karnataka - 560001</p>
            </div>

            {isB2B && (
              <div className="bg-[#111] p-6 rounded-2xl shadow-sm border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm uppercase flex items-center gap-2">
                    <TruckIcon size={16} className="text-blue-400" />
                    Ship to Address
                  </h3>
                  <button className="text-[#f97316] text-xs font-bold">Change</button>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded inline-block mb-2">
                  <Info size={12} />
                  <span>IGST applied for inter-state shipping</span>
                </div>
                <p className="text-sm font-bold">Construction Site #42</p>
                <p className="text-sm text-white/50">Near Tech Park Plaza, Whitefield</p>
                <p className="text-sm text-white/50">Bangalore, Karnataka - 560066</p>
              </div>
            )}
          </section>

          {/* Payment Methods */}
          <section className="bg-[#111] rounded-2xl shadow-sm p-6 border border-white/10">
            <h2 className="font-bold text-lg mb-4">Payment Method</h2>
            <div className="space-y-3">
              <div 
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'ONLINE' ? 'border-[#f97316] bg-[#f97316]/5' : 'border-white/8'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-500/15 rounded-lg flex items-center justify-center text-blue-400">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Online / Razorpay</p>
                    <p className="text-xs text-white/50">UPI, Cards, Net Banking</p>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'ONLINE' ? 'border-[#f97316]' : 'border-white/25'}`}>
                  {paymentMethod === 'ONLINE' && <div className="h-2.5 w-2.5 bg-[#f97316] rounded-full" />}
                </div>
              </div>

              {isB2B && (
                <div 
                  onClick={() => isVerifiedB2B && setPaymentMethod('NET30')}
                  className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${!isVerifiedB2B ? 'opacity-50 cursor-not-allowed' : ''} ${paymentMethod === 'NET30' ? 'border-[#f97316] bg-[#f97316]/5' : 'border-white/8'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-500/15 rounded-lg flex items-center justify-center text-emerald-400">
                      <ZapIcon size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">Net-30 Credit</p>
                        <span className="bg-green-600 text-white text-[8px] px-1 rounded">PRE-APPROVED</span>
                      </div>
                      <p className="text-xs text-white/50">Credit Limit: ₹1,00,000 | Available: ₹1,00,000</p>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'NET30' ? 'border-[#f97316]' : 'border-white/25'}`}>
                    {paymentMethod === 'NET30' && <div className="h-2.5 w-2.5 bg-[#f97316] rounded-full" />}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-[#111] rounded-2xl shadow-sm p-6 border border-white/10 sticky top-28">
            <h3 className="font-bold text-lg mb-6">Order Summary</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-white/50">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Shipping</span>
                <span className="text-emerald-400 font-bold uppercase text-xs">Free</span>
              </div>
              {isB2B ? (
                <>
                  <div className="flex justify-between text-white/50">
                    <span>CGST (9%)</span>
                    <span>₹{cgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>SGST (9%)</span>
                    <span>₹{sgst.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-white/50">
                  <span>GST Total</span>
                  <span>₹{totalGst.toLocaleString()}</span>
                </div>
              )}
              
              <div className="h-px bg-white/10 my-4" />
              
              <div className="flex justify-between text-xl font-bold text-white">
                <span>Order Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              {isB2B && (
                <div className="mt-6">
                  <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">PO Number (Optional)</label>
                  <input type="text" className="w-full h-10 px-3 rounded-lg border border-white/10 focus:border-[#f97316] outline-none" placeholder="e.g. PO-78921" />
                </div>
              )}

              <button 
                onClick={handlePlaceOrder}
                disabled={!canCheckout || cartProducts.length === 0 || isProcessing}
                className="w-full h-14 bg-[#f97316] text-white rounded-xl font-bold text-lg mt-6 hover:bg-orange-600 disabled:bg-white/10 disabled:text-white/40 transition-all flex items-center justify-center gap-3"
              >
                {isProcessing ? 'Processing...' : (isB2B ? 'Place Business Order' : 'Proceed to Pay')}
                {!isProcessing && <ChevronRight size={20} />}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                <ShieldCheck size={14} />
                <span>PCI-DSS Validated</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TruckIcon({ size, className }: { size: number, className?: string }) {
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
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-3v10h2" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function ZapIcon({ size, className }: { size: number, className?: string }) {
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
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
