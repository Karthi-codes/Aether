import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { Product, CartItem } from '../types';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

// Re-export types for convenience
export type { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isInCart: (productId: string, size?: string, color?: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

// Local storage key - will be user-specific
const CART_STORAGE_PREFIX = 'aether_cart';
const API_URL = 'http://localhost:8080/api/user';

// Helper to get user-specific cart key
// const getCartStorageKey = (userId: string | null): string => {
//   return userId ? `${CART_STORAGE_PREFIX}_user_${userId}` : CART_STORAGE_PREFIX;
// };

// Helper to load cart from localStorage
// const loadCartFromStorage = (userId: string | null): CartItem[] => {
//   try {
//     const key = getCartStorageKey(userId);
//     const stored = localStorage.getItem(key);
//     return stored ? JSON.parse(stored) : [];
//   } catch {
//     return [];
//   }
// };

// Helper to save cart to localStorage
// const saveCartToStorage = (items: CartItem[], userId: string | null) => {
//   try {
//     const key = getCartStorageKey(userId);
//     localStorage.setItem(key, JSON.stringify(items));
//   } catch (error) {
//     console.error('Failed to save cart:', error);
//   }
// };

// Helper to clear all cart data from localStorage
// const clearAllCartStorage = () => {
//   try {
//     // Clear old global key
//     localStorage.removeItem(CART_STORAGE_PREFIX);

//     // Clear all user-specific keys
//     const keys = Object.keys(localStorage);
//     keys.forEach(key => {
//       if (key.startsWith(CART_STORAGE_PREFIX)) {
//         localStorage.removeItem(key);
//       }
//     });
//   } catch (error) {
//     console.error('Failed to clear cart storage:', error);
//   }
// };

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  // const userId = user?.id || null;

  const [items, setItems] = useState<CartItem[]>([]);

  // 1. Initial Load
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && token) {
        // Load from Backend
        try {
          const response = await fetch(`${API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            // Map backend items to frontend format if needed, or ensure backend sends correct format
            // Assuming backend sends items matching CartItem interface roughly
            const loadedItems = data.items.map((item: any) => ({
              id: item.productId,
              name: item.name,
              price: item.price,
              image: item.image,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor,
              quantity: item.quantity,
              // Default props if missing
              category: '',
              description: '',
              sizes: [item.selectedSize],
              colors: [item.selectedColor],
              inStock: true
            }));
            setItems(loadedItems);
          }
        } catch (error) {
          console.error('Failed to load cart from backend:', error);
        }
      } else {
        // Load from LocalStorage (Guest)
        // We use a generic 'guest_cart' key since we might not have a userId yet/ever for guests
        const saved = localStorage.getItem(CART_STORAGE_PREFIX + '_guest');
        if (saved) {
          setItems(JSON.parse(saved));
        }
      }
    };
    loadCart();
  }, [isAuthenticated, token]);

  // 2. Save to LocalStorage (Guest Only)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(CART_STORAGE_PREFIX + '_guest', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);


  const addToCart = useCallback(async (product: Product, size: string, color: string, quantity = 1) => {
    if (!size || !color) {
      toast.warning('Please select size and color');
      return;
    }

    // Optimistic UI Update
    const newItem = { ...product, selectedSize: size, selectedColor: color, quantity };

    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id && item.selectedSize === size && item.selectedColor === color);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, newItem];
    });


    if (isAuthenticated && token) {
      try {
        await fetch(`${API_URL}/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            quantity,
            selectedSize: size,
            selectedColor: color
          }),
        });
      } catch (error) {
        console.error('Add to cart API error:', error);
        // Revert optimistic update? Or just warn.
        toast.error('Failed to save to cart');
      }
    } else {
      toast.success('Added to cart');
    }
  }, [isAuthenticated, token]);

  const removeFromCart = useCallback(async (productId: string, size: string, color: string) => {
    setItems(prev => prev.filter(item => !(item.id === productId && item.selectedSize === size && item.selectedColor === color)));

    if (isAuthenticated && token) {
      try {
        await fetch(`${API_URL}/cart/remove`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, selectedSize: size, selectedColor: color }),
        });
      } catch (error) {
        console.error('Remove from cart API error:', error);
      }
    }
  }, [isAuthenticated, token]);

  const updateQuantity = useCallback(async (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setItems(prev => prev.map(item =>
      item.id === productId && item.selectedSize === size && item.selectedColor === color
        ? { ...item, quantity }
        : item
    ));

    if (isAuthenticated && token) {
      try {
        await fetch(`${API_URL}/cart/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity, selectedSize: size, selectedColor: color }),
        });
      } catch (error) {
        console.error('Update cart API error:', error);
      }
    }
  }, [isAuthenticated, token, removeFromCart]);

  const clearCart = useCallback(async () => {
    setItems([]);
    if (!isAuthenticated) {
      localStorage.removeItem(CART_STORAGE_PREFIX + '_guest');
    } else if (token) {
      try {
        await fetch(`${API_URL}/cart`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Clear cart API error:', error);
      }
    }
  }, [isAuthenticated, token]);

  const isInCart = useCallback((productId: string, size?: string, color?: string) => {
    if (size && color) {
      return items.some(item => item.id === productId && item.selectedSize === size && item.selectedColor === color);
    }
    return items.some(item => item.id === productId);
  }, [items]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isInCart
  }), [items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, isInCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
