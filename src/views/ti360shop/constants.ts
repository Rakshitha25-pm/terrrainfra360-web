/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COLORS = {
  amazonYellow: '#f97316',
  amazonDark: '#1A1A1A',
  amazonLightDark: '#232F3E',
  amazonBackground: '#0a0a0a',
  white: '#FFFFFF',
  textSecondary: '#565959',
  error: '#BA000D',
};

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const STORAGE_KEYS = {
  CART: 'tf360_cart_items_v2',
  SHOP_MODE: 'tf360_shop_mode_v1',
  B2B_VERIFIED: 'tf360_b2b_verified_v1',
};
