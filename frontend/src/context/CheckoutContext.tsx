import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { CartItem } from '../types';
import { useAuth } from "./AuthContext"
import { useWallet } from "./WalletContext";
import { toast } from 'react-toastify';

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  shippingMethod: 'standard' | 'express';
  shippingCost: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'try-and-buy' | 'returned' | 'return-rejected' | 'completed';
  createdAt: string;
}

interface CheckoutContextType {
  shippingInfo: ShippingInfo | null;
  setShippingInfo: (info: ShippingInfo) => void;
  currentOrder: Order | null;
  createOrder: (items: CartItem[], paymentMethod: string) => Order;
  clearCheckout: () => void;
  orderHistory: Order[];
  cancelOrder: (orderId: string) => void;
  createTryBuyOrder: (product: CartItem, shippingInfo: ShippingInfo) => Promise<boolean>;
  processTryBuyReturn: (orderId: string, accepted: boolean, rejectionReason?: string) => void;
  confirmTryBuyPurchase: (orderId: string) => void;
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

const SHIPPING_STORAGE_KEY = 'aether_shipping';
const ORDERS_STORAGE_KEY = 'aether_orders';

const loadShippingFromStorage = (): ShippingInfo | null => {
  try {
    const stored = localStorage.getItem(SHIPPING_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const loadOrdersFromStorage = (): Order[] => {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ATH-${timestamp}-${randomPart}`;
};

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { wallet, freezeFunds, unfreezeFunds, deduct } = useWallet();
  const [shippingInfo, setShippingInfoState] = useState<ShippingInfo | null>(() => loadShippingFromStorage());
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>(() => loadOrdersFromStorage());


  // Load data when user changes
  React.useEffect(() => {
    if (user?.id) {
      try {
        const storedShipping = localStorage.getItem(`${SHIPPING_STORAGE_KEY}_${user.id}`);
        if (storedShipping) setShippingInfoState(JSON.parse(storedShipping));

        const storedOrders = localStorage.getItem(`${ORDERS_STORAGE_KEY}_${user.id}`);
        if (storedOrders) setOrderHistory(JSON.parse(storedOrders));
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    } else {
      setShippingInfoState(null);
      setOrderHistory([]);
      setCurrentOrder(null);
    }
  }, [user?.id]);

  const setShippingInfo = useCallback((info: ShippingInfo) => {
    setShippingInfoState(info);
    if (user?.id) {
      try {
        localStorage.setItem(`${SHIPPING_STORAGE_KEY}_${user.id}`, JSON.stringify(info));
      } catch (error) {
        console.error('Failed to save shipping info:', error);
      }
    }
  }, [user?.id]);


  const createOrder = useCallback((items: CartItem[], paymentMethod: string): Order => {
    if (!shippingInfo) {
      throw new Error('Shipping info is required to create an order');
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Use the cost calculated in Shipping step
    let finalShippingCost = shippingInfo.shippingCost;

    // Apply Free Shipping Logic
    if (shippingInfo.shippingMethod === 'standard' && subtotal >= 300) {
      finalShippingCost = 0;
    } else if (shippingInfo.shippingMethod === 'express' && subtotal >= 600) {
      finalShippingCost = 0;
    }

    const shippingCost = finalShippingCost;

    const order: Order = {
      id: generateOrderId(),
      items: [...items],
      shippingInfo,
      paymentMethod,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      status: 'processing',
      createdAt: new Date().toISOString()
    };

    setCurrentOrder(order);

    const newHistory = [order, ...orderHistory];
    setOrderHistory(newHistory);

    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save order:', error);
    }

    return order;
  }, [shippingInfo, orderHistory]);

  const clearCheckout = useCallback(() => {
    setCurrentOrder(null);
  }, []);

  const cancelOrder = useCallback((orderId: string) => {
    const updatedHistory = orderHistory.map(order =>
      order.id === orderId
        ? { ...order, status: 'cancelled' as const }
        : order
    );

    setOrderHistory(updatedHistory);

    if (user?.id) {
      try {
        localStorage.setItem(`${ORDERS_STORAGE_KEY}_${user.id}`, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Failed to save order history:', error);
      }
    }

    setCurrentOrder(curr =>
      curr && curr.id === orderId
        ? { ...curr, status: 'cancelled' as const }
        : curr
    );
  }, [orderHistory, user?.id]);

  const createTryBuyOrder = useCallback(async (product: CartItem, shippingInfo: ShippingInfo): Promise<boolean> => {
    // 1. Check Wallet Balance & Freeze
    if (wallet.available < product.price) {
      toast.error("Insufficient wallet balance for Try Before You Buy.");
      return false;
    }

    const frozen = freezeFunds(product.price);
    if (!frozen) {
      toast.error("Failed to freeze funds.");
      return false;
    }

    // 2. Create Order
    const order: Order = {
      id: generateOrderId(),
      items: [product],
      shippingInfo,
      paymentMethod: 'TryBeforeYouBuy',
      subtotal: product.price,
      shippingCost: 0, // Usually free for TBYB or handle differently
      total: product.price,
      status: 'try-and-buy',
      createdAt: new Date().toISOString()
    };

    const newHistory = [order, ...orderHistory];
    setOrderHistory(newHistory);
    if (user?.id) {
      localStorage.setItem(`${ORDERS_STORAGE_KEY}_${user.id}`, JSON.stringify(newHistory));
    }

    toast.success("Try Before You Buy Order Placed! Funds Frozen.");
    return true;
  }, [wallet.available, freezeFunds, orderHistory, user?.id]);

  const processTryBuyReturn = useCallback((orderId: string, accepted: boolean, rejectionReason?: string) => {
    const order = orderHistory.find(o => o.id === orderId);
    if (!order) return;

    if (accepted) {
      // Return Accepted -> Unfreeze Funds
      unfreezeFunds(order.total);
      toast.success("Return Accepted. Funds Unfrozen.");

      updateOrderStatus(orderId, 'returned');
    } else {
      // Return Rejected -> Deduct Funds (from Frozen)
      // We assume 'unfreeze' happens automatically if we deduct? 
      // No, based on WalletContext logic:
      // deduct(amount, true) -> decreases frozen.
      // available was already decreased when frozen.
      const success = deduct(order.total, true);
      if (success) {
        toast.error(`Return Rejected: ${rejectionReason}. Amount Debited.`);
        updateOrderStatus(orderId, 'return-rejected');
      } else {
        toast.error("Error processing deduction.");
      }
    }
  }, [orderHistory, unfreezeFunds, deduct]);

  const confirmTryBuyPurchase = useCallback((orderId: string) => {
    const order = orderHistory.find(o => o.id === orderId);
    if (!order) return;

    const success = deduct(order.total, true); // Deduct from frozen
    if (success) {
      toast.success("Purchase Confirmed!");
      updateOrderStatus(orderId, 'completed');
    }
  }, [orderHistory, deduct]);

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrderHistory(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status } : o);
      if (user?.id) {
        localStorage.setItem(`${ORDERS_STORAGE_KEY}_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const value = useMemo(() => ({
    shippingInfo,
    setShippingInfo,
    currentOrder,
    createOrder,
    clearCheckout,
    orderHistory,
    cancelOrder,
    createTryBuyOrder,
    processTryBuyReturn,
    confirmTryBuyPurchase
  }), [shippingInfo, setShippingInfo, currentOrder, createOrder, clearCheckout, orderHistory, cancelOrder, createTryBuyOrder, processTryBuyReturn, confirmTryBuyPurchase]);

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error('useCheckout must be used within CheckoutProvider');
  return context;
};
