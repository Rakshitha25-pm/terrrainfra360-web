import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const CartScreen = ({ onBack, onCheckout }: any) => {
  const { cart, removeFromCart, updateCartQty } = useShop();

  const subtotal = cart.reduce((acc, item) => acc + (item.variant?.price || item.product.price) * item.qty, 0);
  const mrpTotal = cart.reduce((acc, item) => acc + (item.variant?.mrp || item.product.mrp) * item.qty, 0);
  const discountTotal = mrpTotal - subtotal;
  const deliveryFee = subtotal > 9999 ? 0 : 199;
  const grandTotal = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="bg-[var(--bg)] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-32 h-32 rounded-full bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center mb-8">
           <ShoppingBag size={48} className="text-luxury-gold opacity-20" />
        </div>
        <h2 className="text-2xl font-serif font-black text-[var(--ink)] mb-3">Your cart is empty</h2>
        <p className="text-[var(--muted)] text-sm max-w-xs mb-8">Looks like you haven't added any premium products to your cart yet.</p>
        <button 
          onClick={onBack}
          className="px-8 py-4 bg-luxury-gold text-white text-xs font-bold tracking-widest uppercase rounded-full shadow-lg hover:scale-105 transition-all"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg)] min-h-screen pb-32">
      <div className="sticky top-0 z-50 bg-luxury-dark border-b border-luxury-gold/20 px-4 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-white hover:text-luxury-gold transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-lg font-serif font-black text-white">Your Cart</h2>
          <p className="text-[10px] text-white/50 uppercase font-bold tracking-[0.2em]">{cart.length} Items Selected</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-600 rounded-lg text-[10px] font-bold">
          <Truck size={14} /> 
          {subtotal > 9999 ? "Congratulations! You've unlocked FREE delivery." : `Add ₹${(10000 - subtotal).toLocaleString()} more for FREE delivery.`}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                key={item.key}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-[var(--paper)] rounded-2xl p-4 border border-[var(--line)] shadow-sm flex gap-4"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                  <img src={item.product.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--ink)] line-clamp-1">{item.product.title}</h3>
                    {item.variant && <p className="text-[10px] text-luxury-gold font-bold uppercase mt-0.5">{item.variant.label}</p>}
                    <p className="text-[10px] text-[var(--muted)] mt-0.5">{item.product.brand}</p>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[var(--ink)]">₹{(item.variant?.price || item.product.price).toLocaleString()}</span>
                        { (item.variant?.mrp || item.product.mrp) > (item.variant?.price || item.product.price) && (
                           <span className="text-[10px] text-[var(--muted)] line-through">₹{(item.variant?.mrp || item.product.mrp).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-[var(--bg)] border border-[var(--line)] rounded-lg px-1">
                      <button onClick={() => updateCartQty(item.key, -1)} className="w-8 h-8 flex items-center justify-center text-luxury-gold"><Minus size={14} /></button>
                      <span className="w-6 text-center text-xs font-bold">{item.qty}</span>
                      <button onClick={() => updateCartQty(item.key, 1)} className="w-8 h-8 flex items-center justify-center text-luxury-gold"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
                
                <button onClick={() => removeFromCart(item.key)} className="text-[var(--muted)] hover:text-red-500 transition-colors self-start p-1">
                   <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bill Summary */}
        <div className="bg-[var(--paper)] rounded-3xl p-6 border border-[var(--line)] shadow-sm space-y-4">
           <h3 className="text-[10px] font-bold tracking-widest uppercase text-luxury-gold">Price Details</h3>
           <div className="space-y-3">
             <div className="flex justify-between text-sm">
               <span className="text-[var(--muted)]">Total MRP</span>
               <span className="text-[var(--ink)] font-medium">₹{mrpTotal.toLocaleString()}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-[var(--muted)]">Discount</span>
               <span className="text-green-600 font-bold">- ₹{discountTotal.toLocaleString()}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-[var(--muted)]">Delivery Fee</span>
               <span className="text-[var(--ink)] font-medium">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
             </div>
             <div className="pt-4 border-t border-[var(--line)] flex justify-between">
               <span className="text-base font-serif font-black text-[var(--ink)] uppercase tracking-widest">Grand Total</span>
               <span className="text-xl font-black text-luxury-gold">₹{grandTotal.toLocaleString()}</span>
             </div>
           </div>
           
           <div className="flex items-center gap-3 p-3 bg-luxury-gold/5 border border-luxury-gold/20 rounded-xl">
             <ShieldCheck size={20} className="text-luxury-gold" />
             <p className="text-[10px] text-luxury-gold leading-tight">Secure Checkout with 1-Year Warranty on select items.</p>
           </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--paper)]/80 backdrop-blur-xl border-t border-[var(--line)] p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-[var(--muted)] uppercase font-bold">Checkout Total</p>
            <p className="text-lg font-black text-[var(--ink)]">₹{grandTotal.toLocaleString()}</p>
          </div>
          <button 
            onClick={onCheckout}
            className="flex-1 h-14 bg-luxury-gold text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-xl hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            Checkout Securely <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
