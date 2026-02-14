import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Typography, Paper, Slider, Alert
} from '@mui/material';
import { ShoppingCart, TrendingDown, LocalShipping, Email, AccountBalanceWallet } from '@mui/icons-material';
import { useAutoPurchase } from '../../../context/AutoPurchaseContext';
import { useWallet } from '../../../context/WalletContext';
import { useAuth } from '../../../context/AuthContext';

// Theme Colors
const GOLD = '#D5A249';
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const LIGHT_GRAY = '#F5F5F5';
const BORDER_GRAY = '#E0E0E0';

interface Props {
    open: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        price: number;
        image: string;
        sizes?: string[];
        colors?: string[];
    };
}

const AutoPurchaseDialog: React.FC<Props> = ({ open, onClose, product }) => {
    const { addAutoPurchase, isMonitoring } = useAutoPurchase();
    const { wallet } = useWallet();
    const { user } = useAuth();

    const [targetPrice, setTargetPrice] = useState(Math.floor(product.price * 0.9));
    const [maxPrice, setMaxPrice] = useState(product.price);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [step, setStep] = useState(1);

    const alreadyMonitoring = isMonitoring(product.id);
    const canAfford = wallet.available >= targetPrice;

    const handleSubmit = () => {
        if (!deliveryAddress.trim()) {
            return;
        }
        addAutoPurchase(product, targetPrice, maxPrice, deliveryAddress);
        onClose();
        setStep(1);
    };

    const handleClose = () => {
        onClose();
        setStep(1);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, p: 1 }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
                <Box sx={{ display: 'inline-flex', p: 2, borderRadius: 2, bgcolor: BLACK, mb: 2 }}>
                    <ShoppingCart sx={{ fontSize: 35, color: GOLD }} />
                </Box>
                <Typography variant="h5" fontWeight={700}>Smart Auto-Purchase</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Set your target price and we'll buy automatically when it drops!
                </Typography>
            </DialogTitle>

            <DialogContent>
                {alreadyMonitoring ? (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        You already have an active auto-purchase for this product.
                    </Alert>
                ) : (
                    <>
                        {/* Product Info */}
                        <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', bgcolor: LIGHT_GRAY, borderRadius: 2 }} elevation={0}>
                            <Box
                                component="img"
                                src={product.image}
                                alt={product.name}
                                sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 2 }}
                            />
                            <Box>
                                <Typography fontWeight={600}>{product.name}</Typography>
                                <Typography variant="h6" fontWeight={700} sx={{ color: GOLD }}>
                                    ₹{product.price.toLocaleString('en-IN')}
                                </Typography>
                            </Box>
                        </Paper>

                        {step === 1 && (
                            <>
                                {/* Price Range */}
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                    Set Your Target Price Range
                                </Typography>

                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Target Price (Buy when price drops to)
                                        </Typography>
                                        <Typography fontWeight={700} sx={{ color: '#4CAF50' }}>
                                            ₹{targetPrice.toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                    <Slider
                                        value={targetPrice}
                                        onChange={(_, v) => setTargetPrice(v as number)}
                                        min={Math.floor(product.price * 0.5)}
                                        max={product.price}
                                        step={100}
                                        sx={{
                                            color: '#4CAF50',
                                            '& .MuiSlider-thumb': { bgcolor: '#4CAF50' }
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Maximum Price (Don't buy above this)
                                        </Typography>
                                        <Typography fontWeight={700} sx={{ color: '#F44336' }}>
                                            ₹{maxPrice.toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                    <Slider
                                        value={maxPrice}
                                        onChange={(_, v) => setMaxPrice(v as number)}
                                        min={targetPrice}
                                        max={Math.floor(product.price * 1.2)}
                                        step={100}
                                        sx={{
                                            color: '#F44336',
                                            '& .MuiSlider-thumb': { bgcolor: '#F44336' }
                                        }}
                                    />
                                </Box>

                                {/* Wallet Balance */}
                                <Paper sx={{
                                    p: 2, mb: 3, borderRadius: 2,
                                    bgcolor: canAfford ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                    border: `1px solid ${canAfford ? '#4CAF50' : '#F44336'}`
                                }} elevation={0}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <AccountBalanceWallet sx={{ color: canAfford ? '#4CAF50' : '#F44336' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Wallet Balance</Typography>
                                            <Typography fontWeight={700} sx={{ color: canAfford ? '#4CAF50' : '#F44336' }}>
                                                ₹{wallet.available.toLocaleString('en-IN')}
                                            </Typography>
                                        </Box>
                                        {!canAfford && (
                                            <Typography variant="caption" color="error" sx={{ ml: 'auto' }}>
                                                Insufficient funds
                                            </Typography>
                                        )}
                                    </Box>
                                </Paper>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                {/* Delivery Address */}
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <LocalShipping sx={{ color: GOLD }} />
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Delivery Address
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="Enter your complete delivery address..."
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&.Mui-focused fieldset': { borderColor: GOLD }
                                            }
                                        }}
                                    />
                                </Box>

                                {/* Email Notification */}
                                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: LIGHT_GRAY, display: 'flex', alignItems: 'center', gap: 2 }} elevation={0}>
                                    <Email sx={{ color: GOLD }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>Email Notification</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            You'll receive a confirmation at {user?.email}
                                        </Typography>
                                    </Box>
                                </Paper>

                                {/* Summary */}
                                <Paper sx={{ p: 2, mt: 3, borderRadius: 2, border: `1px solid ${BORDER_GRAY}` }} elevation={0}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Summary</Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">Product</Typography>
                                        <Typography variant="body2" fontWeight={600}>{product.name}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">Target Price</Typography>
                                        <Typography variant="body2" fontWeight={600} sx={{ color: '#4CAF50' }}>
                                            ₹{targetPrice.toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Max Price</Typography>
                                        <Typography variant="body2" fontWeight={600} sx={{ color: '#F44336' }}>
                                            ₹{maxPrice.toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button onClick={handleClose} sx={{ color: '#666' }}>
                    Cancel
                </Button>
                {!alreadyMonitoring && (
                    <>
                        {step === 1 ? (
                            <Button
                                variant="contained"
                                onClick={() => setStep(2)}
                                disabled={!canAfford}
                                sx={{
                                    bgcolor: BLACK,
                                    color: WHITE,
                                    px: 4,
                                    '&:hover': { bgcolor: '#333' },
                                    '&:disabled': { bgcolor: BORDER_GRAY }
                                }}
                            >
                                Next: Delivery Address
                            </Button>
                        ) : (
                            <>
                                <Button onClick={() => setStep(1)} sx={{ color: BLACK }}>
                                    Back
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={!deliveryAddress.trim()}
                                    startIcon={<TrendingDown />}
                                    sx={{
                                        bgcolor: GOLD,
                                        color: BLACK,
                                        px: 4,
                                        fontWeight: 700,
                                        '&:hover': { bgcolor: '#C4922D' },
                                        '&:disabled': { bgcolor: BORDER_GRAY }
                                    }}
                                >
                                    Start Monitoring
                                </Button>
                            </>
                        )}
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default AutoPurchaseDialog;
