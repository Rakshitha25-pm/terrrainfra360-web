/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProductModel } from '../types';
import { useShopMode } from '../state/ShopModeContext';
import { useCart } from '../state/CartContext';
import { ShoppingCart, Plus, Minus, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function ProductCard({ product, onSelect }: { product: ProductModel, onSelect?: () => void, key?: string | number }) {
  const { isVerifiedB2B, mode } = useShopMode();
  const { addToCart } = useCart();
  
  const isB2B = mode === 'b2b' && product.b2b?.available;
  const minQty = isB2B ? product.b2b!.moq : 1;
  const [qty, setQty] = useState(minQty);

  React.useEffect(() => { setQty(minQty); }, [mode, product.id]);

  const price = isB2B ? product.b2b!.price : product.price;

  const handleAddToCart = () => {
    addToCart(product, qty, isB2B ? 'b2b' : 'b2c');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.3)' }}
      className="bg-[#111] rounded-2xl overflow-hidden shadow-sm border border-white/8 flex flex-col group transition-all"
    >
      {/* Image Section */}
      <div 
        className="relative aspect-[16/11] overflow-hidden bg-black/30 cursor-pointer"
        onClick={onSelect}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <div className="bg-black/70 backdrop-blur-md text-[#f97316] text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
            {isB2B ? `MOQ ${product.b2b!.moq}` : `${product.discountPercent}% OFF`}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-2 flex flex-col gap-1.5">
        <div>
          <p className="text-[7px] font-black text-[#f97316] uppercase tracking-widest mb-0.5">{product.category}</p>
          <h3 
            className="font-black text-[10px] text-white line-clamp-1 cursor-pointer hover:text-[#f97316] transition-colors leading-tight"
            onClick={onSelect}
          >
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[7px] font-bold text-white/40 uppercase tracking-tighter">From</span>
              <span className="text-xs font-black text-white">₹{price.toLocaleString()}</span>
            </div>
          </div>
          
          <button 
            onClick={onSelect}
            className="h-5 w-5 bg-orange-500/150 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#f97316] hover:text-white"
          >
            <Plus size={10} />
          </button>
        </div>

        {/* Quick Stepper - Bottom of card */}
        <div className="flex items-center gap-1.5">
          <div className="flex-1 flex items-center bg-black/30 rounded-lg h-6 px-1 group/stepper border border-white/8">
            <button 
              onClick={() => setQty(Math.max(minQty, qty - 1))}
              className="p-1 hover:bg-white/10 rounded-md transition-colors disabled:opacity-20"
              disabled={qty <= minQty}
            >
              <Minus size={8} strokeWidth={3} />
            </button>
            <input 
              type="number" 
              value={qty} 
              readOnly
              className="w-full text-center bg-transparent text-[8px] font-black focus:outline-none"
            />
            <button 
              onClick={() => setQty(qty + 1)}
              className="p-1 hover:bg-white/10 rounded-md transition-colors"
            >
              <Plus size={8} strokeWidth={3} />
            </button>
          </div>
          <button 
            onClick={handleAddToCart}
            className="h-6 w-6 bg-[#f97316] text-white rounded-lg flex items-center justify-center hover:bg-orange-600 transition-all active:scale-90"
          >
            <ShoppingCart size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
