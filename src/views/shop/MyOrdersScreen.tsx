import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Package, ChevronRight, Clock, 
  CheckCircle2, Truck, XCircle, Search, AlertCircle,
  MapPin, CreditCard, ShoppingBag
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

const TrackingStepper = ({ status }: { status: string }) => {
  const steps = [
    { id: 'PLACED', label: 'Order Placed', icon: Package },
    { id: 'SHIPPED', label: 'Material In Transit', icon: Truck },
    { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStatusIndex = (s: string) => {
    const map: any = { 'PLACED': 0, 'SHIPPED': 1, 'DELIVERED': 2, 'CANCELLED': -1 };
    return map[s] ?? 0;
  };

  const currentIndex = getStatusIndex(status);

  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">
        <XCircle size={20} />
        <span className="text-xs font-black uppercase tracking-widest italic">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-start pt-4 pb-8 px-2">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        
        return (
          <div key={step.id} className="flex flex-col items-center gap-2 relative flex-1">
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className={`absolute top-4 left-1/2 w-full h-[2px] z-0 ${i < currentIndex ? 'bg-luxury-gold' : 'bg-luxury-gold/20'}`} />
            )}
            
            <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500 ${isCompleted ? 'bg-luxury-gold border-luxury-gold text-white shadow-lg' : 'bg-[var(--paper)] border-luxury-gold/20 text-luxury-gold/40'}`}>
              <Icon size={16} className={isCurrent ? 'animate-pulse' : ''} />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] text-center max-w-[60px] leading-tight ${isCompleted ? 'text-luxury-gold' : 'text-luxury-gold/30'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const MyOrdersScreen = ({ onBack }: { onBack: () => void }) => {
  const { orders, cancelOrder, reorder } = useShop();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  if (orders.length === 0) {
    return (
      <div className="bg-[var(--bg)] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-32 h-32 rounded-full bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center mb-8">
           <Package size={48} className="text-luxury-gold opacity-20" />
        </div>
        <h2 className="text-2xl font-serif font-black text-[var(--ink)] mb-3">No orders yet</h2>
        <p className="text-[var(--muted)] text-sm max-w-xs mb-8 italic">Your procurement history is empty. Start building your project today.</p>
        <button 
          onClick={onBack}
          className="px-10 py-4 bg-luxury-dark text-white text-[10px] font-bold tracking-[0.3em] uppercase rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          Explore Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg)] min-h-screen pb-20">
      {/* Dynamic Header */}
      <div className="sticky top-0 left-0 right-0 z-50 bg-luxury-dark border-b border-luxury-gold/20 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={selectedOrderId ? () => setSelectedOrderId(null) : onBack} className="text-white hover:text-luxury-gold transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-serif font-black text-white tracking-tight">
            {selectedOrderId ? 'Order Details' : 'Procurements'}
          </h1>
        </div>
        {!selectedOrderId && <div className="text-luxury-gold/50"><Search size={24} /></div>}
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {selectedOrderId && selectedOrder ? (
            <motion.div 
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               <div className="bg-[var(--paper)] rounded-3xl border border-[var(--line)] p-8 shadow-sm">
                  <div className="flex justify-between items-start mb-10 pb-6 border-b border-[var(--line)]">
                     <div>
                       <p className="text-[10px] font-black text-luxury-gold uppercase tracking-widest mb-1">PROCURMENT CODE</p>
                       <p className="text-lg font-black text-[var(--ink)]">{selectedOrder.orderCode}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">DATE</p>
                       <p className="text-sm font-bold text-[var(--ink)]">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                     </div>
                  </div>

                  <div className="mb-12">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-luxury-gold mb-6">Live Tracking Flow</h3>
                     <TrackingStepper status={selectedOrder.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                     <div className="space-y-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-luxury-gold flex items-center gap-2">
                          <MapPin size={12} /> Shipping Destination
                        </h3>
                        <div className="p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)]">
                          <p className="text-[11px] font-black text-[var(--ink)] mb-1">{selectedOrder.address?.name || 'Primary Site'}</p>
                          <p className="text-[10px] text-[var(--muted)] leading-relaxed italic line-clamp-2">
                            {selectedOrder.address ? `${selectedOrder.address.line1}, ${selectedOrder.address.city}, ${selectedOrder.address.pincode}` : 'Registered Corporate Site Address'}
                          </p>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-luxury-gold flex items-center gap-2">
                          <CreditCard size={12} /> Payment Method
                        </h3>
                        <div className="p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)]">
                          <p className="text-[11px] font-black text-[var(--ink)] mb-1">{selectedOrder.paymentMethod === 'ONLINE' ? 'Digital Clearing House' : 'Cash on Deployment'}</p>
                          <p className="text-[10px] text-[var(--muted)] font-medium">Transaction complete via secured gateway.</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-luxury-gold mb-4">Included Materials</h3>
                     {selectedOrder.items.map((item, idx) => (
                       <div key={idx} className="flex gap-5 p-4 bg-[var(--bg)] rounded-2xl border border-[var(--line)]">
                          <img src={item.product.imageUrl} className="w-20 h-20 rounded-xl object-cover shadow-inner" alt="" />
                          <div className="flex-1 py-1">
                             <p className="text-sm font-black text-[var(--ink)] leading-tight mb-1">{item.product.title}</p>
                             <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mb-2">{item.product.brand} • x{item.qty}</p>
                             <p className="text-base font-black text-luxury-gold">₹{((item.variant?.price || item.product.price) * item.qty).toLocaleString()}</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="mt-10 pt-8 border-t border-[var(--line)] space-y-4">
                     <div className="flex justify-between items-end">
                        <span className="text-sm font-serif font-black text-[var(--ink)]">Total Valuation</span>
                        <span className="text-3xl font-black text-luxury-gold">₹{selectedOrder.total.toLocaleString()}</span>
                     </div>
                  </div>

                  <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => { reorder(selectedOrder); onBack(); }}
                      className="w-full py-5 bg-luxury-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:bg-luxury-gold transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={16} /> Reorder Pack
                    </button>
                    
                    {selectedOrder.status === 'PLACED' && (
                      <button 
                        onClick={() => { cancelOrder(selectedOrder.id); setSelectedOrderId(null); }}
                        className="w-full py-5 bg-[var(--paper)] text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 border border-red-100 shadow-sm active:scale-95"
                      >
                         <AlertCircle size={16} /> Cancel Order
                      </button>
                    )}
                  </div>
               </div>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {orders.map((order, i) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className="bg-[var(--paper)] rounded-[2rem] border border-[var(--line)] overflow-hidden shadow-sm hover:shadow-2xl hover:border-luxury-gold/30 transition-all cursor-pointer group"
                >
                  <div className="p-6 flex items-center justify-between border-b border-[var(--line)] bg-luxury-gold/5">
                    <div>
                      <p className="text-[9px] font-black text-luxury-gold uppercase tracking-[0.2em] mb-1">PROCURMENT {order.orderCode}</p>
                      <p className="text-[10px] text-[var(--muted)] font-bold">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                      order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
                      order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-5">
                      <div className="flex -space-x-5 overflow-hidden shrink-0">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-14 h-14 rounded-2xl border-4 border-[var(--paper)] overflow-hidden shadow-md bg-[var(--paper)]">
                            <img src={item.product.imageUrl} className="w-full h-full object-cover" alt="" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-14 h-14 rounded-2xl border-4 border-[var(--paper)] bg-luxury-dark text-white flex items-center justify-center text-[10px] font-black shadow-md z-10 relative">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest mb-1">Procurement Total</p>
                            <p className="text-2xl font-black text-luxury-gold">₹{order.total.toLocaleString()}</p>
                          </div>
                          <button className="flex items-center gap-2 text-luxury-dark group-hover:text-luxury-gold transition-colors font-black text-[10px] uppercase tracking-widest pb-1 border-b-2 border-luxury-gold/0 group-hover:border-luxury-gold/50">
                            Details <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                      <div className="mt-8 pt-6 border-t border-[var(--line)]">
                         <TrackingStepper status={order.status} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
