import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { Product } from '../types';
import { useAuth } from './AuthContext';

// Re-export type for convenience
export type { Product } from '../types';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  totalItems: number;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

// Local storage key - will be user-specific
const WISHLIST_STORAGE_PREFIX = 'aether_wishlist';
const API_URL = 'http://localhost:8080/api/user';

// Helper to get user-specific wishlist key
const getWishlistStorageKey = (userId: string | null): string => {
  return userId ? `${WISHLIST_STORAGE_PREFIX}_user_${userId}` : WISHLIST_STORAGE_PREFIX;
};

// Helper to load wishlist from localStorage
const loadWishlistFromStorage = (userId: string | null): Product[] => {
  try {
    const key = getWishlistStorageKey(userId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save wishlist to localStorage
const saveWishlistToStorage = (items: Product[], userId: string | null) => {
  try {
    const key = getWishlistStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save wishlist:', error);
  }
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated, user, setOnLoginCallback, setOnLogoutCallback } = useAuth();
  const userId = user?.id || null;

  const [items, setItems] = useState<Product[]>([]);

  // Load wishlist when user changes
  useEffect(() => {
    if (userId) {
      const storedWishlist = loadWishlistFromStorage(userId);
      setItems(storedWishlist);
    } else {
      setItems([]);
    }
  }, [userId]);

  // Sync wishlist with backend when items change (only if authenticated)
  useEffect(() => {
    if (userId) {
      saveWishlistToStorage(items, userId);
    }

    if (isAuthenticated && token) {
      // Map items for backend (backend expects productId, not id)
      const itemsForBackend = items.map(item => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = item;
        return {
          ...rest,
          productId: id
        };
      });

      // Save to backend
      fetch(`${API_URL}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ items: itemsForBackend }),
      }).catch(error => console.error('Failed to sync wishlist with backend:', error));
    }
  }, [items, isAuthenticated, token, userId]);

  // Load wishlist from backend on login
  const loadWishlistFromBackend = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          // Map backend items (productId) to frontend items (id)
          const mappedItems = data.items.map((item: any) => ({
            ...item,
            id: item.productId || item.id // Fallback just in case
          }));
          setItems(mappedItems);
        } else {
          // No items in backend, clear local state
          setItems([]);
        }
      }
    } catch (error) {
      console.error('Failed to load wishlist from backend:', error);
    }
  }, [token]);

  // Clear wishlist on logout
  const clearWishlistOnLogout = useCallback(() => {
    setItems([]);
    // Clear only the current user's wishlist from localStorage
    if (userId) {
      const key = getWishlistStorageKey(userId);
      localStorage.removeItem(key);
    }
  }, [userId]);

  // Register callbacks with AuthContext
  useEffect(() => {
    setOnLoginCallback(loadWishlistFromBackend);
    setOnLogoutCallback(clearWishlistOnLogout);
  }, [setOnLoginCallback, setOnLogoutCallback, loadWishlistFromBackend, clearWishlistOnLogout]);

  const addToWishlist = useCallback((product: Product) => {
    setItems(prev => {
      if (prev.some(item => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });

    if (isAuthenticated && token) {
      fetch(`${API_URL}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id }),
      }).catch(error => console.error('Failed to add to wishlist:', error));
    }
  }, [isAuthenticated, token]);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));

    if (isAuthenticated && token) {
      fetch(`${API_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).catch(error => console.error('Failed to remove from wishlist:', error));
    }
  }, [isAuthenticated, token]);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.id === productId);
  }, [items]);

  const totalItems = useMemo(() => items.length, [items]);

  const value = useMemo(() => ({
    items,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    totalItems,
    isInWishlist
  }), [items, addToWishlist, removeFromWishlist, clearWishlist, totalItems, isInWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
