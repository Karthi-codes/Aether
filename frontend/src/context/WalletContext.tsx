import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { apiService } from "../services/api.service";

interface WalletState {
  available: number;
  frozen: number;
}

interface WalletContextType {
  wallet: WalletState;
  deduct: (amount: number, fromFrozen?: boolean) => boolean;
  addFunds: (amount: number) => void;
  freezeFunds: (amount: number) => boolean;
  unfreezeFunds: (amount: number) => void;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, updateUser } = useAuth();
  const [wallet, setWallet] = useState<WalletState>({
    available: user?.walletBalance || 0,
    frozen: 0,
  });

  // Sync wallet with user data
  useEffect(() => {
    if (user?.walletBalance !== undefined) {
      setWallet(_prev => ({
        available: user.walletBalance,
        frozen: user.frozenBalance || 0
      }));
    } else if (!user) {
      setWallet({
        available: 0,
        frozen: 0
      });
    }
  }, [user]);

  // Fetch wallet data from API
  const refreshWallet = async () => {
    if (!token) return;
    try {
      const data = await apiService.getWallet(token);
      setWallet({
        available: data.balance,
        frozen: data.frozenBalance
      });
      // Update AuthContext user if needed, but AuthContext might not support partial updates deep inside
      updateUser({ walletBalance: data.balance, frozenBalance: data.frozenBalance } as any);
    } catch (error) {
      console.error("Failed to refresh wallet:", error);
    }
  };

  const deduct = (amount: number, fromFrozen: boolean = false): boolean => {
    if (!user) return false;

    if (fromFrozen) {
      if (wallet.frozen >= amount) {
        setWallet(prev => ({
          ...prev,
          frozen: prev.frozen - amount
        }));
        // Note: Frozen funds were already deducted from 'available' when frozen,
        // so we don't change 'available' here. We just reduce 'frozen' liability.
        // Actually, 'frozen' usually means "reserved but still in account".
        // Let's clarify:
        // Option A: Available = Total - Frozen. Deduct from Frozen means reducing Total and Frozen.
        // Option B: Available is what can be spent. Frozen is separate.
        // In this app, `wallet.available` seems to be the main balance content.
        // Let's go with Option A model where `available` is truly available to spend.
        // So `freeze` moves from `available` to `frozen`.
        // `deduct(..., true)` means spending the frozen amount. So it decreases `frozen`.
        // It does NOT affect `available` because that was already reduced during freeze.
        // BUT we need to sync with backend.
        // If backend only has 'walletBalance', we need to be careful.
        // Does backend support frozen? Probably not yet.
        // We will manage frozen state purely frontend for now (as requested "logics in my project").
        // When we deduct from frozen, we effectively consume the reservation.
        // We should update the backend with the new TOTAL balance (Available + Remaining Frozen).
        // Wait, if we deduct from frozen, the money is GONE from the user.
        // So backend balance should be updated.
        // Current Backend Balance = Available + Frozen.
        // New Backend Balance = Available + (Frozen - Amount).

        const newTotal = wallet.available + (wallet.frozen - amount);
        updateUser({ walletBalance: newTotal });
        return true;
      }
      return false;
    } else {
      if (wallet.available >= amount) {
        const newBalance = wallet.available - amount;
        setWallet((prev) => ({
          ...prev,
          available: newBalance,
        }));
        // Backend balance = New Available + Frozen
        updateUser({ walletBalance: newBalance + wallet.frozen });
        return true;
      }
      return false;
    }
  };

  const freezeFunds = (amount: number): boolean => {
    if (wallet.available >= amount) {
      setWallet(prev => ({
        available: prev.available - amount,
        frozen: prev.frozen + amount
      }));
      // Backend balance remains same (Available + Frozen = Total)
      // So no updateUser call needed for backend sync yet, 
      // UNLESS backend needs to know about reservation.
      // For now, we keep it client-side logic as per prompt "check overall logics".
      return true;
    }
    return false;
  };

  const unfreezeFunds = (amount: number) => {
    setWallet(prev => ({
      available: prev.available + amount,
      frozen: Math.max(0, prev.frozen - amount)
    }));
    // Backend balance remains same
  };

  const addFunds = (amount: number) => {
    if (!user) return;
    const newBalance = wallet.available + amount;
    setWallet((prev) => ({
      ...prev,
      available: newBalance,
    }));
    updateUser({ walletBalance: newBalance });
  };

  return (
    <WalletContext.Provider value={{ wallet, deduct, addFunds, freezeFunds, unfreezeFunds, refreshWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
