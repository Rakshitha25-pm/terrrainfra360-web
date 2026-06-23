import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MapPin, CreditCard, Banknote, ShieldCheck, ChevronRight, Loader2, X, Package } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const CheckoutScreen = ({ onBack, onOrderSuccess }: any) => {
  const { cart, addresses, placeOrder, addAddress, updateAddress } = useShop();
  const [selectedAddressId, setSelectedAddressId] = useState(addresses.find(a => a.isDefault)?.id || addresses[0]?.id || '');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', pincode: '', state: '', houseNumber: '', line1: '', locality: '', city: '', addressType: 'Home' as 'Home' | 'Office', openSaturday: false, openSunday: false, isDefault: false });

  const subtotal = cart.reduce((acc, item) => acc + (item.variant?.price || item.product.price) * item.qty, 0);
  const deliveryFee = subtotal > 9999 ? 0 : 199;
  const codFee = paymentMethod === 'COD' ? 30 : 0;
  const grandTotal = subtotal + deliveryFee + codFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    placeOrder(paymentMethod);
    setIsProcessing(false);
    onOrderSuccess();
  };

  const handleSaveAddress = () => {
    if (editingAddress) {
      updateAddress(editingAddress.id, newAddr);
    } else {
      addAddress(newAddr);
    }
    setShowAddAddress(false);
    setEditingAddress(null);
    setNewAddr({ name: '', phone: '', pincode: '', state: '', houseNumber: '', line1: '', locality: '', city: '', addressType: 'Home', openSaturday: false, openSunday: false, isDefault: false });
  };

  const startEdit = (addr: any) => {
    setEditingAddress(addr);
    setNewAddr({ ...addr });
    setShowAddAddress(true);
  };

  return (
    <div className="bg-[var(--bg)] min-h-screen pb-32">
      <div className="sticky top-0 z-50 bg-luxury-dark border-b border-luxury-gold/20 px-4 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-white hover:text-luxury-gold transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-serif font-black text-white">Order Summary</h2>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-8">

        {/* Order Items */}
        <section className="bg-[var(--paper)] p-6 rounded-[2rem] border border-[var(--line)] shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold mb-6 flex items-center gap-2">
            <Package size={14} /> Order Items ({cart.reduce((s: number, i: any) => s + i.qty, 0)} items)
          </h3>
          <div className="space-y-4">
            {cart.map((item: any) => {
              const price = item.variant?.price || item.product.price;
              return (
                <div key={item.key} className="flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[var(--line)]">
                    <img src={item.product.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-[var(--ink)] line-clamp-2 leading-snug">{item.product.title}</p>
                    {item.variant && <p className="text-[9px] text-luxury-gold font-bold mt-0.5">{item.variant.label}</p>}
                    <p className="text-[9px] text-[var(--muted)] mt-0.5 uppercase tracking-widest">{item.product.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] bg-[var(--bg)] border border-[var(--line)] rounded-full px-3 py-1 font-bold text-[var(--muted)]">Qty: {item.qty}</span>
                      <span className="text-sm font-black text-[var(--ink)]">₹{(price * item.qty).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-[var(--paper)] p-8 rounded-[2rem] border border-[var(--line)] shadow-sm">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold flex items-center gap-2">
               <MapPin size={14} /> Shipping Information
             </h3>
             <button 
               onClick={() => { setEditingAddress(null); setNewAddr({ name: '', phone: '', pincode: '', state: '', houseNumber: '', line1: '', locality: '', city: '', addressType: 'Home', openSaturday: false, openSunday: false, isDefault: false }); setShowAddAddress(true); }}
               className="text-[10px] font-black text-[var(--muted)] hover:text-luxury-gold uppercase border-b border-transparent hover:border-luxury-gold transition-all"
             >
               Add New Address
             </button>
           </div>
           
           <div className="space-y-4">
             {addresses.map(addr => (
               <div 
                 key={addr.id}
                 onClick={() => setSelectedAddressId(addr.id)}
                 className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative group ${selectedAddressId === addr.id ? 'border-luxury-gold bg-luxury-gold/5 shadow-inner' : 'border-[var(--line)] bg-[var(--bg)]'}`}
               >
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAddressId === addr.id ? 'border-luxury-gold' : 'border-[var(--line)]'}`}>
                        {selectedAddressId === addr.id && <div className="w-2 h-2 bg-luxury-gold rounded-full" />}
                      </div>
                      <span className="text-xs font-black text-[var(--ink)]">{addr.name}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEdit(addr); }}
                      className="text-[10px] font-bold text-luxury-gold hover:underline"
                    >
                      Edit
                    </button>
                 </div>
                 <p className="text-[11px] text-[var(--muted)] leading-relaxed pl-6">{addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                 <p className="text-[11px] font-bold text-[var(--ink)] mt-3 pl-6">{addr.phone}</p>
               </div>
             ))}
             {addresses.length === 0 && (
                <button 
                  onClick={() => setShowAddAddress(true)}
                  className="w-full py-10 border-2 border-dashed border-[var(--line)] rounded-3xl text-[var(--muted)] hover:border-luxury-gold hover:text-luxury-gold transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  + Create Shipping Address
                </button>
             )}
           </div>
        </section>

        <AnimatePresence>
          {showAddAddress && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="bg-[var(--paper)] w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative"
               >
                  <button onClick={() => setShowAddAddress(false)} className="absolute top-8 right-8 text-[var(--muted)]"><X size={20} /></button>
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-luxury-gold/10 text-luxury-gold flex items-center justify-center mx-auto mb-4">
                      <MapPin size={32} />
                    </div>
                    <h3 className="text-2xl font-serif font-black">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 gap-4">
                       <div className="space-y-1">
                         <p className="text-[8px] font-black uppercase tracking-widest text-luxury-gold ml-4">Consignee Name</p>
                         <input 
                           placeholder="Full Legal Name"
                           value={newAddr.name}
                           onChange={e => setNewAddr({...newAddr, name: e.target.value})}
                           className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[11px] font-bold focus:border-luxury-gold outline-none"
                         />
                       </div>
                       <div className="space-y-1">
                         <p className="text-[8px] font-black uppercase tracking-widest text-luxury-gold ml-4">Contact Protocol</p>
                         <input 
                           placeholder="Phone / Mobile Number"
                           value={newAddr.phone}
                           onChange={e => setNewAddr({...newAddr, phone: e.target.value})}
                           className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[11px] font-bold focus:border-luxury-gold outline-none"
                         />
                       </div>
                       <div className="space-y-1">
                         <p className="text-[8px] font-black uppercase tracking-widest text-luxury-gold ml-4">Spatial Coordinates</p>
                         <textarea 
                           placeholder="Street, Studio, Apartment"
                           value={newAddr.line1}
                           onChange={e => setNewAddr({...newAddr, line1: e.target.value})}
                           className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[11px] font-bold focus:border-luxury-gold outline-none h-24 resize-none"
                         />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <p className="text-[8px] font-black uppercase tracking-widest text-luxury-gold ml-4">Region/City</p>
                           <input 
                             placeholder="City"
                             value={newAddr.city}
                             onChange={e => setNewAddr({...newAddr, city: e.target.value})}
                             className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[11px] font-bold focus:border-luxury-gold outline-none"
                           />
                         </div>
                         <div className="space-y-1">
                           <p className="text-[8px] font-black uppercase tracking-widest text-luxury-gold ml-4">Routing Code</p>
                           <input 
                             placeholder="Pincode"
                             value={newAddr.pincode}
                             onChange={e => setNewAddr({...newAddr, pincode: e.target.value})}
                             className="w-full p-4 bg-[var(--bg)] border border-[var(--line)] rounded-2xl text-[11px] font-bold focus:border-luxury-gold outline-none"
                           />
                         </div>
                       </div>
                     </div>
                  </div>
                  <button 
                    onClick={handleSaveAddress}
                    className="w-full mt-10 py-5 bg-luxury-dark text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-luxury-gold transition-all shadow-xl"
                  >
                    Confirm Details
                  </button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        <section className="bg-[var(--paper)] p-8 rounded-[2rem] border border-[var(--line)] shadow-sm">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-luxury-gold mb-8 flex items-center gap-2">
             <CreditCard size={14} /> Settlement Mode
           </h3>
           <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${paymentMethod === 'ONLINE' ? 'border-luxury-gold bg-luxury-gold/5 shadow-inner' : 'border-[var(--line)] bg-[var(--bg)]'}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'ONLINE' ? 'bg-luxury-gold text-white' : 'bg-white text-[var(--muted)] border border-[var(--line)]'}`}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-[var(--ink)]">Digital Settlement</h4>
                    <p className="text-[10px] text-[var(--muted)]">Secured by SSL (UPI, Cards, Netbanking)</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setPaymentMethod('COD')}
                className={`p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${paymentMethod === 'COD' ? 'border-luxury-gold bg-luxury-gold/5 shadow-inner' : 'border-[var(--line)] bg-[var(--bg)]'}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-luxury-gold text-white' : 'bg-white text-[var(--muted)] border border-[var(--line)]'}`}>
                    <Banknote size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-[var(--ink)]">Pay on Delivery</h4>
                    <p className="text-[10px] text-[var(--muted)]">+ ₹30 logistical handling fee</p>
                  </div>
                </div>
              </button>
           </div>
        </section>

        <section className="bg-[var(--paper)] p-8 rounded-[2rem] border border-[var(--line)] shadow-sm">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold mb-8 italic">Quotation Ledger</h3>
           <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold text-[var(--muted)]">
                <span>Material Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[var(--muted)]">
                <span>Shipping Optimization</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>{deliveryFee === 0 ? 'COMPLIMENTARY' : `₹${deliveryFee}`}</span>
              </div>
              {paymentMethod === 'COD' && (
                <div className="flex justify-between text-xs font-bold text-[var(--muted)]">
                  <span>COD Handling Protocol</span>
                  <span>₹30</span>
                </div>
              )}
              <div className="pt-6 border-t border-[var(--line)] flex justify-between items-end">
                <span className="text-sm font-serif font-black uppercase tracking-widest">Total Payable</span>
                <span className="text-3xl font-black text-luxury-gold">₹{grandTotal.toLocaleString()}</span>
              </div>
           </div>
        </section>

        <div className="bg-luxury-gold/5 border border-luxury-gold/20 p-6 rounded-3xl flex items-start gap-4">
           <ShieldCheck size={24} className="text-luxury-gold shrink-0 mt-1" />
           <div>
              <p className="text-[10px] font-black text-luxury-gold uppercase tracking-[0.1em] mb-1">TI360 Assurance Coverage</p>
              <p className="text-[10px] text-[var(--muted)] font-medium leading-relaxed">Enterprise-grade encryption and specialized logistics handling. Your material integrity is our priority.</p>
           </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--paper)]/80 backdrop-blur-xl border-t border-[var(--line)] p-6">
        <div className="max-w-3xl mx-auto">
          <button 
            disabled={isProcessing || !selectedAddressId}
            onClick={handlePlaceOrder}
            className="w-full h-18 bg-luxury-dark text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-3xl hover:bg-luxury-gold transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-40 disabled:scale-100 active:scale-95 shadow-luxury-gold/10"
          >
            {isProcessing ? (
              <>
                <Loader2 size={24} className="animate-spin text-luxury-gold" />
                Validating Transaction...
              </>
            ) : (
              <>
                Confirm Procurement <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
