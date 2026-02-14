import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, TextField, Switch, Button, Paper, Chip, LinearProgress } from "@mui/material";
import { useWallet } from "../../../context/WalletContext";
import { ShoppingCart, TrendingDown, CheckCircle, Error, Timer, PlayArrow, Stop } from "@mui/icons-material";
import { toast } from "react-toastify";

// Theme Colors
const GOLD = '#D5A249';
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const LIGHT_GRAY = '#F5F5F5';
const BORDER_GRAY = '#E0E0E0';

type EngineState = "IDLE" | "ARMED" | "MONITORING" | "EXECUTING" | "SUCCESS" | "FAILED";

interface Props {
  productId: string;
  productName?: string;
  initialPrice: number;
  onPurchaseSuccess?: () => void;
}

const stateConfig: Record<EngineState, { color: string; icon: React.ReactNode; label: string }> = {
  IDLE: { color: '#666', icon: <Stop />, label: 'Idle' },
  ARMED: { color: GOLD, icon: <Timer />, label: 'Armed' },
  MONITORING: { color: '#2196F3', icon: <TrendingDown />, label: 'Monitoring' },
  EXECUTING: { color: '#FF9800', icon: <ShoppingCart />, label: 'Executing...' },
  SUCCESS: { color: '#4CAF50', icon: <CheckCircle />, label: 'Success!' },
  FAILED: { color: '#F44336', icon: <Error />, label: 'Failed' },
};

export const SmartAutoPurchase: React.FC<Props> = ({
  productName = "Product",
  initialPrice,
  onPurchaseSuccess,
}) => {
  const { wallet, deduct } = useWallet();

  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [targetPrice, setTargetPrice] = useState<number>(Math.floor(initialPrice * 0.9)); // Default 10% below
  const [enabled, setEnabled] = useState(false);
  const [engineState, setEngineState] = useState<EngineState>("IDLE");
  const [message, setMessage] = useState<string>("");
  const [priceHistory, setPriceHistory] = useState<number[]>([initialPrice]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const executedRef = useRef(false);

  // Simulate price changes (in real app, this would be WebSocket/API)
  useEffect(() => {
    const priceSimulator = setInterval(() => {
      setCurrentPrice((prev) => {
        const fluctuation = Math.floor(Math.random() * 20 - 10);
        const newPrice = Math.max(50, prev + fluctuation);
        setPriceHistory(history => [...history.slice(-9), newPrice]);
        return newPrice;
      });
    }, 3000);

    return () => clearInterval(priceSimulator);
  }, []);

  // Monitoring Logic
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (engineState !== "SUCCESS" && engineState !== "FAILED") {
        setEngineState("IDLE");
      }
      return;
    }

    setEngineState("ARMED");

    intervalRef.current = setInterval(() => {
      setEngineState("MONITORING");

      if (
        !executedRef.current &&
        currentPrice <= targetPrice &&
        wallet.available >= currentPrice
      ) {
        executedRef.current = true;
        executePurchase();
      }
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, currentPrice, targetPrice, wallet.available]);

  const executePurchase = () => {
    setEngineState("EXECUTING");

    // Simulate processing delay
    setTimeout(() => {
      const success = deduct(currentPrice);

      if (success) {
        setEngineState("SUCCESS");
        setMessage(`Purchased ${productName} at ₹${currentPrice}! 🎉`);
        toast.success(`Auto-purchased ${productName} at ₹${currentPrice}!`);
        setEnabled(false);
        onPurchaseSuccess?.();
      } else {
        setEngineState("FAILED");
        setMessage("Insufficient wallet balance.");
        toast.error("Auto-purchase failed: Insufficient balance");
      }
    }, 1500);
  };

  const resetEngine = () => {
    setEnabled(false);
    executedRef.current = false;
    setEngineState("IDLE");
    setMessage("");
  };

  const priceChange = currentPrice - initialPrice;
  const priceChangePercent = ((priceChange / initialPrice) * 100).toFixed(1);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        backgroundColor: WHITE,
        border: `1px solid ${BORDER_GRAY}`,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        width: '100%',
        maxWidth: 450,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: BLACK }}>
            <ShoppingCart sx={{ color: GOLD }} />
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: BLACK }}>
            Smart Auto-Purchase
          </Typography>
        </Box>
        <Chip
          icon={stateConfig[engineState].icon as React.ReactElement}
          label={stateConfig[engineState].label}
          size="small"
          sx={{
            bgcolor: `${stateConfig[engineState].color}15`,
            color: stateConfig[engineState].color,
            fontWeight: 600,
            '& .MuiChip-icon': { color: stateConfig[engineState].color }
          }}
        />
      </Box>

      {/* Progress bar when monitoring */}
      {(engineState === "MONITORING" || engineState === "EXECUTING") && (
        <LinearProgress
          sx={{
            borderRadius: 1,
            bgcolor: LIGHT_GRAY,
            '& .MuiLinearProgress-bar': {
              bgcolor: engineState === "EXECUTING" ? '#FF9800' : GOLD
            }
          }}
        />
      )}

      {/* Price Display */}
      <Paper sx={{ p: 3, borderRadius: 2, bgcolor: LIGHT_GRAY, border: `1px solid ${BORDER_GRAY}` }} elevation={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
            Current Price
          </Typography>
          <Chip
            label={`${priceChange >= 0 ? '+' : ''}${priceChangePercent}%`}
            size="small"
            sx={{
              bgcolor: priceChange >= 0 ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
              color: priceChange >= 0 ? '#F44336' : '#4CAF50',
              fontWeight: 600
            }}
          />
        </Box>
        <Typography variant="h3" fontWeight={800} sx={{ color: BLACK, fontFamily: '"DM Sans", sans-serif' }}>
          ₹{currentPrice.toLocaleString('en-IN')}
        </Typography>

        {/* Mini Price Chart */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, mt: 2, height: 30 }}>
          {priceHistory.map((price, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                height: `${(price / Math.max(...priceHistory)) * 100}%`,
                minHeight: 4,
                bgcolor: price <= targetPrice ? '#4CAF50' : (i === priceHistory.length - 1 ? GOLD : '#ddd'),
                borderRadius: 0.5,
                transition: 'all 0.3s'
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Wallet Balance */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: LIGHT_GRAY, borderRadius: 2 }}>
        <Typography sx={{ color: '#666' }}>Wallet Balance</Typography>
        <Typography variant="h6" fontWeight={700} sx={{ color: wallet.available >= currentPrice ? '#4CAF50' : '#F44336' }}>
          ₹{wallet.available.toLocaleString('en-IN')}
        </Typography>
      </Box>

      {/* Target Price Input */}
      <TextField
        label="Target Price (Auto-buy when price drops to)"
        type="number"
        value={targetPrice}
        onChange={(e) => setTargetPrice(Number(e.target.value))}
        fullWidth
        disabled={enabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&.Mui-focused fieldset': { borderColor: GOLD }
          },
          '& .MuiInputLabel-root.Mui-focused': { color: GOLD }
        }}
        InputProps={{
          startAdornment: <Typography sx={{ mr: 1, color: GOLD, fontWeight: 700 }}>₹</Typography>
        }}
        helperText={`System will auto-purchase when price ≤ ₹${targetPrice.toLocaleString('en-IN')}`}
      />

      {/* Enable Toggle */}
      <Paper
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderRadius: 2,
          bgcolor: enabled ? `${GOLD}15` : LIGHT_GRAY,
          border: `1px solid ${enabled ? GOLD : BORDER_GRAY}`,
          transition: 'all 0.3s'
        }}
        elevation={0}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PlayArrow sx={{ color: enabled ? GOLD : '#666' }} />
          <Box>
            <Typography fontWeight={600} sx={{ color: BLACK }}>Enable Auto-Purchase</Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              {enabled ? 'Monitoring price changes...' : 'Toggle to start monitoring'}
            </Typography>
          </Box>
        </Box>
        <Switch
          checked={enabled}
          onChange={(e) => {
            executedRef.current = false;
            setMessage("");
            setEnabled(e.target.checked);
          }}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': { color: GOLD },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: GOLD }
          }}
        />
      </Paper>

      {/* Status Message */}
      {message && (
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: engineState === "SUCCESS" ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
            border: `1px solid ${engineState === "SUCCESS" ? '#4CAF50' : '#F44336'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
          elevation={0}
        >
          {engineState === "SUCCESS" ? <CheckCircle sx={{ color: '#4CAF50' }} /> : <Error sx={{ color: '#F44336' }} />}
          <Typography sx={{ color: engineState === "SUCCESS" ? '#4CAF50' : '#F44336', fontWeight: 600 }}>
            {message}
          </Typography>
        </Paper>
      )}

      {/* Reset Button */}
      <Button
        variant="outlined"
        onClick={resetEngine}
        startIcon={<Stop />}
        sx={{
          borderColor: BORDER_GRAY,
          color: BLACK,
          fontWeight: 600,
          borderRadius: 2,
          '&:hover': { borderColor: BLACK, bgcolor: LIGHT_GRAY }
        }}
      >
        Reset Engine
      </Button>
    </Paper>
  );
};

export default SmartAutoPurchase;
