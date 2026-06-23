/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ShopMode = 'b2c' | 'b2b';

export interface B2BPriceTier {
  minQty: number;
  maxQty: number | null; // null means infinite
  unitPrice: number;
  discountPercent: number;
}

export interface ProductModel {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  discountPercent: number;
  gstPercent: number;
  image: string;
  variants: string[];
  vendorIds: string[];
  vendorBusinessName: string;
  category: string;
  
  // B2B Fields
  b2b?: {
    available: boolean;
    price: number;
    mrp: number;
    discountPercent: number;
    moq: number;
    tiers: B2BPriceTier[];
  };
}

export type BusinessStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BusinessProfile {
  companyName: string;
  gstin: string;
  pan: string;
  contactName: string;
  contactPhone: string;
  billingAddress: AddressModel;
  gstCertificateUrl?: string;
  status: BusinessStatus;
  creditLimit: number;
  creditDays: number;
  creditUsed: number;
}

export interface AddressModel {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface CartItem {
  productId: string;
  qty: number;
  mode: ShopMode;
  resolvedPrice: number;
}

export interface OrderModel {
  id: string;
  userId: string;
  items: CartItem[];
  gstTotal: number;
  total: number;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  address: AddressModel;
  createdAt: string;
  
  // B2B specific
  isB2B: boolean;
  poNumber?: string;
  gstinSnapshot?: string;
  cgst: number;
  sgst: number;
  igst: number;
  creditTerms?: string;
  invoiceUrl?: string;
}
