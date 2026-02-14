import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import { apiService } from '../services/api.service';
import { toast } from 'react-toastify';
import type { Product } from '../types';

export interface AutoPurchaseItem {
    purchasePrice: any;
    id: string;
    _id: string; // Changed from id to _id for MongoDB
    userId: string;
    productId: string;
    productName: string;
    productImage: string;
    targetPrice: number;
    currentPrice: number;
    maxPrice: number;
    originalPrice: number;
    lowestPriceSeen: number;
    status: 'active' | 'purchased' | 'cancelled' | 'insufficient_funds';
    createdAt: string;
    purchasedAt?: string;
    deliveryAddress?: string;
}

export interface PurchaseHistoryItem { // This might be redundant if we use AutoPurchaseItem for history too
    _id: string;
    productId: string;
    productName: string;
    productImage: string;
    purchasePrice?: number; // In AutoPurchaseItem it's currentPrice?
    targetPrice: number;
    purchasedAt: string;
    deliveryAddress: string;
    status: string; // 'active' | 'purchased' etc
}

export interface PriceChangeLog {
    productId: string;
    productName: string;
    oldPrice: number;
    newPrice: number;
    changedAt: string;
    changedBy: string;
}

export interface AutoPurchaseContextType {
    autoPurchaseItems: AutoPurchaseItem[];
    purchaseHistory: AutoPurchaseItem[]; // Reuse AutoPurchaseItem for history
    priceChangeLogs: PriceChangeLog[];
    addAutoPurchase: (product: Product | any, targetPrice: number, maxPrice: number, deliveryAddress: string) => Promise<void>;
    removeAutoPurchase: (id: string) => Promise<void>;
    updateTargetPrice: (id: string, newTargetPrice: number) => Promise<void>;
    getAutoPurchaseForProduct: (productId: string) => AutoPurchaseItem | undefined;
    isMonitoring: (productId: string) => boolean;
    refreshData: () => Promise<void>;
}

const AutoPurchaseContext = createContext<AutoPurchaseContextType | null>(null);

export const useAutoPurchase = () => {
    const ctx = useContext(AutoPurchaseContext);
    if (!ctx) throw new Error('useAutoPurchase must be used inside AutoPurchaseProvider');
    return ctx;
};

export const AutoPurchaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const { refreshWallet } = useWallet();

    const [autoPurchaseItems, setAutoPurchaseItems] = useState<AutoPurchaseItem[]>([]);
    const [purchaseHistory, setPurchaseHistory] = useState<AutoPurchaseItem[]>([]); // We'll store history here
    const [priceChangeLogs, setPriceChangeLogs] = useState<PriceChangeLog[]>([]);

    const fetchData = useCallback(async () => {
        if (!token) return;
        try {
            // items from backend are mixed active/purchased/cancelled?
            // items from backend are mixed active/purchased/cancelled?
            // Backend `getAutoPurchases` returned only active.
            // Backend `getAutoPurchaseHistory` returned purchased.

            // Let's call both
            const [activeItems, historyItems, logs] = await Promise.all([
                apiService.getAutoPurchases(token),
                apiService.getAutoPurchaseHistory(token),
                apiService.getPriceChangeLogs()
            ]);

            // Map _id to id for frontend compatibility
            const mapId = (item: any) => ({ ...item, id: item._id || item.id });
            setAutoPurchaseItems(activeItems.map(mapId));
            setPurchaseHistory(historyItems.map(mapId));
            setPriceChangeLogs(logs);
        } catch (error) {
            console.error('Failed to fetch auto-purchase data', error);
        }
    }, [token]);

    // Initial load
    useEffect(() => {
        if (token) {
            fetchData();
        } else {
            setAutoPurchaseItems([]);
            setPurchaseHistory([]);
            setPriceChangeLogs([]);
        }
    }, [token, fetchData]);

    // Poll for updates (simple way to get price changes and purchase status updates)
    // In a real app, WebSockets would be better.
    useEffect(() => {
        if (!token) return;
        const interval = setInterval(fetchData, 10000); // 10 seconds poll
        return () => clearInterval(interval);
    }, [token, fetchData]);

    const addAutoPurchase = async (product: any, targetPrice: number, maxPrice: number, deliveryAddress: string) => {
        if (!token) {
            toast.error("You must be logged in to set up AutoPurchase");
            return;
        }

        try {
            await apiService.addAutoPurchase({
                productId: product.id || product._id, // Handle varying ID fields
                productName: product.name,
                productImage: product.image,
                targetPrice,
                maxPrice,
                currentPrice: product.price,
                deliveryAddress
            }, token);

            toast.success(`✅ SmartAutoPay set for ${product.name}`);
            refreshWallet(); // Wallet balance deducted (reserved)
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to set up AutoPurchase");
        }
    };

    const removeAutoPurchase = async (id: string) => {
        if (!token) return;
        try {
            await apiService.removeAutoPurchase(id, token);
            toast.info('SmartAutoPay cancelled');
            refreshWallet(); // Funds refunded
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to cancel');
        }
    };

    const updateTargetPrice = async (id: string, newTargetPrice: number) => {
        if (!token) return;
        try {
            await apiService.updateTargetPrice(id, newTargetPrice, token);
            toast.success(`Target price updated to ₹${newTargetPrice.toLocaleString('en-IN')}`);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update price');
        }
    };

    const getAutoPurchaseForProduct = useCallback((productId: string) => {
        return autoPurchaseItems.find(item => item.productId === productId && item.status === 'active');
    }, [autoPurchaseItems]);

    const isMonitoring = useCallback((productId: string) => {
        return autoPurchaseItems.some(item => item.productId === productId && item.status === 'active');
    }, [autoPurchaseItems]);

    return (
        <AutoPurchaseContext.Provider value={{
            autoPurchaseItems,
            purchaseHistory,
            priceChangeLogs,
            addAutoPurchase,
            removeAutoPurchase,
            updateTargetPrice,
            getAutoPurchaseForProduct,
            isMonitoring,
            refreshData: fetchData
        }}>
            {children}
        </AutoPurchaseContext.Provider>
    );
};
