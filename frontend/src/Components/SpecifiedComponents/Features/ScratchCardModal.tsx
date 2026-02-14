import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { useAuth } from '../../../context/AuthContext';

interface ScratchCardProps {
    open: boolean;
    onClose: () => void;
    scratchCardData: {
        id: string;
        orderAmount: number;
        expiresAt: string;
    } | null;
    onRedeem?: (discountAmount: number) => void;
}

const ScratchCardModal: React.FC<ScratchCardProps> = ({ open, onClose, scratchCardData, onRedeem }) => {
    const { token, updateUser, user } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isScratched, setIsScratched] = useState(false);
    const [isScratching, setIsScratching] = useState(false);
    const [discountData, setDiscountData] = useState<{ percentage: number; amount: number } | null>(null);
    const [isRedeemed, setIsRedeemed] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Initialize canvas with scratch layer
    useEffect(() => {
        if (open && canvasRef.current && !isScratched) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Gold gradient background
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, '#D5A249');
                gradient.addColorStop(0.5, '#F5D78E');
                gradient.addColorStop(1, '#D5A249');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Add scratch text
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 + 8);
            }
        }
    }, [open, isScratched]);

    const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || isScratched) return;

        setIsScratching(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();

        // Check scratched percentage
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let clearedPixels = 0;
        for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] === 0) clearedPixels++;
        }
        const percentScratched = (clearedPixels / (imageData.data.length / 4)) * 100;

        if (percentScratched > 40) {
            revealCard();
        }
    };

    const revealCard = async () => {
        if (isScratched || !scratchCardData || !token) return;

        setIsScratched(true);
        setShowConfetti(true);

        // Call API to scratch the card
        try {
            const response = await fetch(`http://localhost:8080/api/scratch-cards/${scratchCardData.id}/scratch`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDiscountData({
                    percentage: data.scratchCard.discountPercentage,
                    amount: data.scratchCard.discountAmount
                });
            } else {
                // Fallback with smaller random discount for demo (2-5%)
                const randomPercent = Math.floor(Math.random() * 4) + 2; // 2-5%
                const amount = (scratchCardData.orderAmount * randomPercent) / 100;
                setDiscountData({ percentage: randomPercent, amount: Math.round(amount * 100) / 100 });
            }
        } catch (error) {
            // Fallback for demo (2-5%)
            const randomPercent = Math.floor(Math.random() * 4) + 2;
            const amount = (scratchCardData.orderAmount * randomPercent) / 100;
            setDiscountData({ percentage: randomPercent, amount: Math.round(amount * 100) / 100 });
        }

        setTimeout(() => setShowConfetti(false), 3000);
    };

    const handleRedeem = async () => {
        if (!scratchCardData || !token || !discountData) return;

        try {
            const response = await fetch(`http://localhost:8080/api/scratch-cards/${scratchCardData.id}/redeem`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                updateUser({ walletBalance: data.newWalletBalance });
                setIsRedeemed(true);
                onRedeem?.(discountData.amount);
            } else {
                // Demo fallback - update local wallet
                const newBalance = (user?.walletBalance || 0) + discountData.amount;
                updateUser({ walletBalance: newBalance });
                setIsRedeemed(true);
                onRedeem?.(discountData.amount);
            }
        } catch (error) {
            // Demo fallback
            const newBalance = (user?.walletBalance || 0) + discountData.amount;
            updateUser({ walletBalance: newBalance });
            setIsRedeemed(true);
            onRedeem?.(discountData.amount);
        }
    };

    const handleClose = () => {
        setIsScratched(false);
        setIsScratching(false);
        setDiscountData(null);
        setIsRedeemed(false);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    maxWidth: 380,
                    width: '100%',
                    overflow: 'visible',
                    bgcolor: '#1a1a1a'
                }
            }}
        >
            <DialogContent sx={{ p: 0, position: 'relative' }}>
                <IconButton
                    onClick={handleClose}
                    sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 10 }}
                >
                    <CloseIcon />
                </IconButton>

                {/* Confetti Effect */}
                {showConfetti && (
                    <Box sx={{
                        position: 'absolute',
                        top: -20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: 60,
                        animation: 'bounce 0.5s ease infinite'
                    }}>
                        <CelebrationIcon sx={{ color: '#FFD700', fontSize: 60 }} />
                    </Box>
                )}

                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="overline" sx={{ color: '#D5A249', letterSpacing: 3 }}>
                        🎉 CONGRATULATIONS! 🎉
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: 'white', mt: 1, mb: 3 }}>
                        You Won a Scratch Card!
                    </Typography>

                    {/* Scratch Card Area */}
                    <Box sx={{ position: 'relative', width: 280, height: 150, mx: 'auto', mb: 3 }}>
                        {/* Revealed Content */}
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: '#2C2C2C',
                                borderRadius: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px dashed #D5A249'
                            }}
                        >
                            {discountData ? (
                                <>
                                    <Typography variant="h3" fontWeight={800} sx={{ color: '#D5A249' }}>
                                        {discountData.percentage}% OFF
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: 'white', mt: 1 }}>
                                        ${discountData.amount.toFixed(2)} Wallet Credit
                                    </Typography>
                                </>
                            ) : (
                                <Typography sx={{ color: '#666' }}>Scratch to reveal!</Typography>
                            )}
                        </Box>

                        {/* Scratch Canvas */}
                        {!isScratched && (
                            <canvas
                                ref={canvasRef}
                                width={280}
                                height={150}
                                onMouseMove={isScratching ? handleScratch : undefined}
                                onMouseDown={() => setIsScratching(true)}
                                onMouseUp={() => setIsScratching(false)}
                                onMouseLeave={() => setIsScratching(false)}
                                onTouchMove={handleScratch}
                                onClick={handleScratch}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: 12,
                                    cursor: 'pointer'
                                }}
                            />
                        )}
                    </Box>

                    {/* Action Buttons */}
                    {isScratched && discountData && !isRedeemed && (
                        <Button
                            variant="contained"
                            startIcon={<AccountBalanceWalletIcon />}
                            onClick={handleRedeem}
                            fullWidth
                            sx={{
                                bgcolor: '#D5A249',
                                color: 'black',
                                py: 1.5,
                                fontWeight: 700,
                                fontSize: '1rem',
                                '&:hover': { bgcolor: '#c49a3e' }
                            }}
                        >
                            Add ${discountData.amount.toFixed(2)} to Wallet
                        </Button>
                    )}

                    {isRedeemed && (
                        <Box sx={{ bgcolor: '#4CAF50', borderRadius: 2, p: 2, mt: 2 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
                                ✓ Added to Your Wallet!
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                                New balance: ${user?.walletBalance?.toFixed(2) || '0.00'}
                            </Typography>
                        </Box>
                    )}

                    <Typography variant="caption" sx={{ display: 'block', color: '#666', mt: 2 }}>
                        Valid for 30 days from order date
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ScratchCardModal;
