import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface ScratchCardData {
    id: string;
    orderAmount: number;
    discountPercentage?: number;
    discountAmount?: number;
    isScratched: boolean;
    isRedeemed: boolean;
    expiresAt: string;
    earnedAt: string;
}

interface ScratchCardContextType {
    scratchCards: ScratchCardData[];
    unscratchedCount: number;
    totalEarnings: number;
    addScratchCard: (card: Omit<ScratchCardData, 'earnedAt'>) => void;
    scratchCard: (cardId: string, percentage: number, amount: number) => void;
    redeemCard: (cardId: string) => Promise<number>;
    clearExpiredCards: () => void;
}

const ScratchCardContext = createContext<ScratchCardContextType | undefined>(undefined);

export const useScratchCards = () => {
    const context = useContext(ScratchCardContext);
    if (!context) {
        throw new Error('useScratchCards must be used within ScratchCardProvider');
    }
    return context;
};

export const ScratchCardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, updateUser, token } = useAuth();
    const [scratchCards, setScratchCards] = useState<ScratchCardData[]>([]);

    // Load from backend on mount or when token changes
    useEffect(() => {
        if (token) {
            fetch('http://localhost:8080/api/scratch-cards', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setScratchCards(data);
                        // Also update localStorage as backup
                        localStorage.setItem('scratchCards', JSON.stringify(data));
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch scratch cards:', err);
                    // Fallback to localStorage if backend fails
                    const saved = localStorage.getItem('scratchCards');
                    if (saved) {
                        try {
                            const cards = JSON.parse(saved);
                            const validCards = cards.filter((card: ScratchCardData) =>
                                new Date(card.expiresAt) > new Date()
                            );
                            setScratchCards(validCards);
                        } catch {
                            setScratchCards([]);
                        }
                    }
                });
        } else {
            // Not authenticated, load from local storage
            const saved = localStorage.getItem('scratchCards');
            if (saved) {
                try {
                    const cards = JSON.parse(saved);
                    const validCards = cards.filter((card: ScratchCardData) =>
                        new Date(card.expiresAt) > new Date()
                    );
                    setScratchCards(validCards);
                } catch {
                    setScratchCards([]);
                }
            } else {
                setScratchCards([]);
            }
        }
    }, [token]);

    // Save to localStorage whenever cards change (keep as backup/cache)
    useEffect(() => {
        localStorage.setItem('scratchCards', JSON.stringify(scratchCards));
    }, [scratchCards]);

    // Count unscratched cards
    const unscratchedCount = scratchCards.filter(card => !card.isScratched).length;

    // Calculate total earnings from redeemed cards
    const totalEarnings = scratchCards
        .filter(card => card.isRedeemed)
        .reduce((sum, card) => sum + (card.discountAmount || 0), 0);

    // Add a new scratch card
    const addScratchCard = useCallback((card: Omit<ScratchCardData, 'earnedAt'>) => {
        const newCard: ScratchCardData = {
            ...card,
            earnedAt: new Date().toISOString()
        };
        setScratchCards(prev => {
            // Avoid duplicates
            if (prev.some(c => c.id === card.id)) return prev;
            return [...prev, newCard];
        });
    }, []);

    // Mark a card as scratched and reveal the discount
    const scratchCard = useCallback(async (cardId: string, percentage: number, amount: number) => {
        // Optimistically update UI
        setScratchCards(prev => prev.map(card =>
            card.id === cardId
                ? { ...card, isScratched: true, discountPercentage: percentage, discountAmount: amount }
                : card
        ));

        // Call backend to persist
        if (token) {
            try {
                const response = await fetch(`http://localhost:8080/api/scratch-cards/${cardId}/scratch`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    // Update with backend confirmed values (should match optimistic unless random seed differs)
                    setScratchCards(prev => prev.map(card =>
                        card.id === cardId
                            ? { ...card, discountPercentage: data.percentage, discountAmount: data.amount }
                            : card
                    ));
                }
            } catch (error) {
                console.error('Failed to scratch card on backend', error);
                // Revert or queue retry? For now, we trust local since backend usually just validates.
            }
        }
    }, [token]);

    // Redeem a card and add to wallet
    const redeemCard = useCallback(async (cardId: string): Promise<number> => {
        const card = scratchCards.find(c => c.id === cardId);
        if (!card || !card.isScratched || card.isRedeemed || !card.discountAmount) {
            return 0;
        }

        const amount = card.discountAmount;

        // Try to call backend API
        if (token) {
            try {
                const response = await fetch(`http://localhost:8080/api/scratch-cards/${cardId}/redeem`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    updateUser({ walletBalance: data.newWalletBalance });
                } else {
                    // Fallback: update locally
                    const newBalance = (user?.walletBalance || 0) + amount;
                    updateUser({ walletBalance: newBalance });
                }
            } catch {
                // Fallback: update locally
                const newBalance = (user?.walletBalance || 0) + amount;
                updateUser({ walletBalance: newBalance });
            }
        } else {
            // Not authenticated, update locally only
            const newBalance = (user?.walletBalance || 0) + amount;
            updateUser({ walletBalance: newBalance });
        }

        // Mark as redeemed
        setScratchCards(prev => prev.map(c =>
            c.id === cardId ? { ...c, isRedeemed: true } : c
        ));

        return amount;
    }, [scratchCards, token, user, updateUser]);

    // Clear expired cards
    const clearExpiredCards = useCallback(() => {
        setScratchCards(prev => prev.filter(card => new Date(card.expiresAt) > new Date()));
    }, []);

    return (
        <ScratchCardContext.Provider value={{
            scratchCards,
            unscratchedCount,
            totalEarnings,
            addScratchCard,
            scratchCard,
            redeemCard,
            clearExpiredCards
        }}>
            {children}
        </ScratchCardContext.Provider>
    );
};
