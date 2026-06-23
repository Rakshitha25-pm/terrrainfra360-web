/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, ProductModel, ShopMode } from '../types';
import { STORAGE_KEYS } from '../constants';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductModel, qty: number, mode: ShopMode) => void;
  updateQty: (productId: string, qty: number, mode: ShopMode, products: ProductModel[]) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
  }, [items]);

  const resolveUnit = (product: ProductModel, qty: number, mode: ShopMode): number => {
    if (mode === 'b2b' && product.b2b?.available) {
      const tiers = product.b2b.tiers || [];
      // Sort tiers by minQty descending to find the highest matching tier
      const matchingTier = [...tiers]
        .sort((a, b) => b.minQty - a.minQty)
        .find(tier => qty >= tier.minQty);
      
      return matchingTier ? matchingTier.unitPrice : product.b2b.price;
    }
    return product.price;
  };

  const addToCart = (product: ProductModel, qty: number, mode: ShopMode) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      const price = resolveUnit(product, qty, mode);
      
      if (existing) {
        const newQty = existing.qty + qty;
        const newPrice = resolveUnit(product, newQty, mode);
        return prev.map(i => i.productId === product.id ? { ...i, qty: newQty, resolvedPrice: newPrice, mode } : i);
      }
      return [...prev, { productId: product.id, qty, mode, resolvedPrice: price }];
    });
  };

  const updateQty = (productId: string, qty: number, mode: ShopMode, products: ProductModel[]) => {
    setItems(prev => {
      const product = products.find(p => p.id === productId);
      if (!product) return prev;
      
      const price = resolveUnit(product, qty, mode);
      return prev.map(i => i.productId === productId ? { ...i, qty, resolvedPrice: price, mode } : i);
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeFromCart, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
