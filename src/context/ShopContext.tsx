import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductVariant } from '../constants/shopData';

interface Address {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  state: string;
  houseNumber: string;
  line1: string;
  locality: string;
  city: string;
  addressType: 'Home' | 'Office';
  openSaturday?: boolean;
  openSunday?: boolean;
  isDefault: boolean;
}

interface CartItem {
  key: string;
  product: Product;
  variant?: ProductVariant;
  qty: number;
}

interface Order {
  id: string;
  orderCode: string;
  date: string;
  status: 'PLACED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'ONLINE' | 'COD';
  address?: Address;
  items: CartItem[];
  total: number;
}

interface Profile {
  name: string;
  email: string;
  phone: string;
}

interface UserRecord {
  profile: Profile;
  orders: Order[];
  addresses: Address[];
  favorites: string[];
}

interface ShopContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, qty?: number) => void;
  removeFromCart: (key: string) => void;
  updateCartQty: (key: string, delta: number) => void;
  clearCart: () => void;

  favorites: string[];
  toggleFavorite: (productId: string) => void;

  profile: Profile;
  updateProfile: (data: Partial<Profile>) => void;

  addresses: Address[];
  addAddress: (addr: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, addr: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  orders: Order[];
  placeOrder: (paymentMethod: 'ONLINE' | 'COD') => void;
  cancelOrder: (orderId: string) => void;
  reorder: (order: Order) => void;

  compareList: string[];
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;

  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;

  isLoggedIn: boolean;
  login: (phoneOrEmail: string, password: string) => void;
  signup: (name: string, phone: string, email: string, password: string) => void;
  logout: () => void;
}

const STORAGE_KEY = 'ti360_users';
const SESSION_KEY = 'ti360_session';

const loadAllUsers = (): Record<string, UserRecord> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveAllUsers = (users: Record<string, UserRecord>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

const normalizePhone = (phone: string) => phone.replace(/\D/g, '').slice(-10);

const defaultProfile = (): Profile => ({ name: 'TI360 User', email: '', phone: '' });

const ShopContext = createContext<ShopContextType | null>(null);

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside ShopProvider');
  return ctx;
};

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  // Restore session on mount
  const [currentPhone, setCurrentPhone] = useState<string>(() => {
    try { return localStorage.getItem(SESSION_KEY) || ''; } catch { return ''; }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem(SESSION_KEY));

  const loadUser = (phone: string): UserRecord => {
    const all = loadAllUsers();
    return all[phone] ?? {
      profile: defaultProfile(),
      orders: [],
      addresses: [],
      favorites: [],
    };
  };

  const [profile, setProfile] = useState<Profile>(() =>
    currentPhone ? loadUser(currentPhone).profile : defaultProfile()
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    currentPhone ? loadUser(currentPhone).orders : []
  );
  const [addresses, setAddresses] = useState<Address[]>(() =>
    currentPhone ? loadUser(currentPhone).addresses : []
  );
  const [favorites, setFavorites] = useState<string[]>(() =>
    currentPhone ? loadUser(currentPhone).favorites : []
  );

  const [cart, setCart] = useState<CartItem[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Persist user data whenever it changes and user is logged in
  useEffect(() => {
    if (!isLoggedIn || !currentPhone) return;
    const all = loadAllUsers();
    all[currentPhone] = { profile, orders, addresses, favorites };
    saveAllUsers(all);
  }, [profile, orders, addresses, favorites, isLoggedIn, currentPhone]);

  const login = (phoneOrEmail: string, _password: string) => {
    const phone = normalizePhone(phoneOrEmail) || phoneOrEmail.trim();
    const userData = loadUser(phone);
    setCurrentPhone(phone);
    setProfile(userData.profile.phone ? userData.profile : { ...userData.profile, phone });
    setOrders(userData.orders);
    setAddresses(userData.addresses);
    setFavorites(userData.favorites);
    setIsLoggedIn(true);
    localStorage.setItem(SESSION_KEY, phone);
  };

  const signup = (name: string, phone: string, email: string, _password: string) => {
    const key = normalizePhone(phone) || phone.trim();
    const all = loadAllUsers();
    // If user already exists, merge; otherwise create fresh
    const existing = all[key];
    const newProfile: Profile = { name, phone, email };
    all[key] = {
      profile: newProfile,
      orders: existing?.orders ?? [],
      addresses: existing?.addresses ?? [],
      favorites: existing?.favorites ?? [],
    };
    saveAllUsers(all);
    setCurrentPhone(key);
    setProfile(newProfile);
    setOrders(all[key].orders);
    setAddresses(all[key].addresses);
    setFavorites(all[key].favorites);
    setIsLoggedIn(true);
    localStorage.setItem(SESSION_KEY, key);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentPhone('');
    setProfile(defaultProfile());
    setOrders([]);
    setAddresses([]);
    setFavorites([]);
    setCart([]);
    localStorage.removeItem(SESSION_KEY);
  };

  const addToCart = (product: Product, variant?: ProductVariant, qty: number = 1) => {
    const key = product.id + (variant?.id || '');
    setCart(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { key, product, variant, qty }];
    });
  };

  const removeFromCart = (key: string) => setCart(prev => prev.filter(i => i.key !== key));

  const updateCartQty = (key: string, delta: number) => {
    setCart(prev =>
      prev.map(i => i.key === key ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
    );
  };

  const clearCart = () => setCart([]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const updateProfile = (data: Partial<Profile>) => setProfile(prev => ({ ...prev, ...data }));

  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newAddr: Address = { ...addr, id: Date.now().toString() };
    setAddresses(prev => {
      const updated = addr.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev;
      return [...updated, newAddr];
    });
  };

  const updateAddress = (id: string, addr: Partial<Address>) => {
    setAddresses(prev => {
      let updated = prev;
      if (addr.isDefault) updated = prev.map(a => ({ ...a, isDefault: false }));
      return updated.map(a => a.id === id ? { ...a, ...addr } : a);
    });
  };

  const deleteAddress = (id: string) => setAddresses(prev => prev.filter(a => a.id !== id));

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const placeOrder = (paymentMethod: 'ONLINE' | 'COD') => {
    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
    const subtotal = cart.reduce((acc, item) => acc + (item.variant?.price || item.product.price) * item.qty, 0);
    const deliveryFee = subtotal > 9999 ? 0 : 199;
    const codFee = paymentMethod === 'COD' ? 30 : 0;
    const newOrder: Order = {
      id: Date.now().toString(),
      orderCode: `TI360-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      date: new Date().toISOString(),
      status: 'PLACED',
      paymentMethod,
      address: defaultAddr,
      items: [...cart],
      total: subtotal + deliveryFee + codFee,
    };
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
  };

  const reorder = (order: Order) => {
    order.items.forEach(item => addToCart(item.product, item.variant));
  };

  const toggleCompare = (productId: string) => {
    setCompareList(prev => {
      if (prev.includes(productId)) return prev.filter(id => id !== productId);
      if (prev.length >= 2) return prev;
      return [...prev, productId];
    });
  };

  const clearCompare = () => setCompareList([]);

  const addRecentlyViewed = (productId: string) => {
    setRecentlyViewed(prev => [productId, ...prev.filter(id => id !== productId)].slice(0, 10));
  };

  return (
    <ShopContext.Provider value={{
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      favorites, toggleFavorite,
      profile, updateProfile,
      addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
      orders, placeOrder, cancelOrder, reorder,
      compareList, toggleCompare, clearCompare,
      recentlyViewed, addRecentlyViewed,
      isLoggedIn, login, signup, logout,
    }}>
      {children}
    </ShopContext.Provider>
  );
};
