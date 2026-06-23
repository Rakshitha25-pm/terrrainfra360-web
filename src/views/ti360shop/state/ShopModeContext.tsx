/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShopMode, BusinessProfile } from '../types';
import { STORAGE_KEYS } from '../constants';

interface ShopModeContextType {
  mode: ShopMode;
  setMode: (mode: ShopMode) => void;
  isVerifiedB2B: boolean;
  businessProfile: BusinessProfile | null;
  markVerified: (verified: boolean) => void;
  setBusinessProfile: (profile: BusinessProfile) => void;
}

const ShopModeContext = createContext<ShopModeContextType | undefined>(undefined);

export function ShopModeProvider({ children }: { children: React.ReactNode }) {
  const [isVerifiedB2B, setIsVerifiedB2B] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.B2B_VERIFIED) === 'true' || true; // Defaulting to true for demo speed
  });

  const [mode, setModeState] = useState<ShopMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOP_MODE);
    return saved === 'b2b' ? 'b2b' : 'b2c';
  });

  const [businessProfile, setBusinessProfileState] = useState<BusinessProfile | null>(() => {
    return {
      companyName: 'Terra Infrastructure Ltd',
      gstin: '29AAAAA0000A1Z5',
      pan: 'ABCDE1234F',
      contactName: 'Suraj Vyas',
      contactPhone: '+91 9876543210',
      billingAddress: {
        id: 'addr_1',
        street: '123, Marketplace St',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        isDefault: true,
      },
      status: 'APPROVED',
      creditLimit: 1000000,
      creditDays: 30,
      creditUsed: 0
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.B2B_VERIFIED, String(isVerifiedB2B));
  }, [isVerifiedB2B]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOP_MODE, mode);
  }, [mode]);

  const setMode = (m: ShopMode) => setModeState(m);

  const markVerified = (verified: boolean) => {
    setIsVerifiedB2B(verified);
  };

  const setBusinessProfile = (profile: BusinessProfile) => {
    setBusinessProfileState(profile);
  };

  return (
    <ShopModeContext.Provider value={{ 
      mode, 
      setMode, 
      isVerifiedB2B, 
      businessProfile, 
      markVerified, 
      setBusinessProfile 
    }}>
      {children}
    </ShopModeContext.Provider>
  );
}

export function useShopMode() {
  const context = useContext(ShopModeContext);
  if (context === undefined) {
    throw new Error('useShopMode must be used within a ShopModeProvider');
  }
  return context;
}
