import React, { useState } from 'react';
import {
    Box, Container, Typography, Card, CardContent, Button,
    Chip, Dialog, DialogContent, IconButton, Tabs, Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { useScratchCards } from '../../context/ScratchCardContext';
import type { ScratchCardData } from '../../context/ScratchCardContext';

import { toast } from 'react-toastify';

const Rewards: React.FC = () => {
    const navigate = useNavigate();
    const { scratchCards, unscratchedCount, totalEarnings, scratchCard, redeemCard } = useScratchCards();

    const [selectedCard, setSelectedCard] = useState<ScratchCardData | null>(null);
    const [isScratching, setIsScratching] = useState(false);
    const [revealedAmount, setRevealedAmount] = useState<number | null>(null);
    const [tabValue, setTabValue] = useState(0);

    // Filter cards by status
    const unscratchedCards = scratchCards.filter(c => !c.isScratched);
    const scratchedCards = scratchCards.filter(c => c.isScratched && !c.isRedeemed);
    const redeemedCards = scratchCards.filter(c => c.isRedeemed);

    const handleScratchReveal = async (card: ScratchCardData) => {
        if (card.isScratched) return;

        setIsScratching(true);

        // Simulate scratching delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate random 2-5% discount
        const percentage = Math.floor(Math.random() * 4) + 2;
        const amount = Math.round((card.orderAmount * percentage) / 100 * 100) / 100;

        scratchCard(card.id, percentage, amount);
        setRevealedAmount(amount);
        setIsScratching(false);
    };

    const handleRedeem = async (card: ScratchCardData) => {
        const amount = await redeemCard(card.id);
        if (amount > 0) {
            toast.success(`🎉 $${amount.toFixed(2)} added to your wallet!`, {
                position: 'top-center',
                autoClose: 3000
            });
            setSelectedCard(null);
            setRevealedAmount(null);
        }
    };

    const daysUntilExpiry = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const CardItem: React.FC<{ card: ScratchCardData }> = ({ card }) => {
        const days = daysUntilExpiry(card.expiresAt);

        return (
            <Card
                onClick={() => !card.isRedeemed && setSelectedCard(card)}
                sx={{
                    cursor: card.isRedeemed ? 'default' : 'pointer',
                    background: card.isRedeemed
                        ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
                        : card.isScratched
                            ? 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)'
                            : 'linear-gradient(135deg, #D5A249 0%, #F5D78E 50%, #D5A249 100%)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    opacity: card.isRedeemed ? 0.7 : 1,
                    '&:hover': card.isRedeemed ? {} : {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(213,162,73,0.3)'
                    }
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <CardGiftcardIcon sx={{
                            fontSize: 40,
                            color: card.isRedeemed ? '#4caf50' : card.isScratched ? '#ff9800' : 'rgba(0,0,0,0.7)'
                        }} />
                        {card.isRedeemed ? (
                            <Chip icon={<CheckCircleIcon />} label="Redeemed" size="small" color="success" />
                        ) : card.isScratched ? (
                            <Chip label="Ready to redeem" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />
                        ) : (
                            <Chip label="Unscratched" size="small" sx={{ bgcolor: 'rgba(0,0,0,0.2)', color: 'white' }} />
                        )}
                    </Box>

                    {card.isScratched && card.discountAmount ? (
                        <Typography variant="h4" fontWeight={800} sx={{ color: card.isRedeemed ? '#2e7d32' : '#e65100' }}>
                            ${card.discountAmount.toFixed(2)}
                        </Typography>
                    ) : (
                        <Typography variant="h5" fontWeight={700} sx={{ color: 'rgba(0,0,0,0.7)' }}>
                            Scratch to Reveal
                        </Typography>
                    )}

                    <Typography variant="body2" sx={{ mt: 1, color: 'rgba(0,0,0,0.6)' }}>
                        Order: ${card.orderAmount.toFixed(2)}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2, color: 'rgba(0,0,0,0.5)' }}>
                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption">
                            {days > 0 ? `${days} days left` : 'Expires today'}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h3" fontWeight={800} sx={{ color: 'inherit' }}>
                        My Rewards
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Scratch cards and cashback earned from your orders
                    </Typography>
                </Box>
            </Box>

            {/* Stats Banner */}
            <Box sx={{
                display: 'flex',
                gap: 3,
                mb: 4,
                p: 3,
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="h3" fontWeight={800} sx={{ color: '#D5A249' }}>
                        {unscratchedCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Unscratched</Typography>
                </Box>
                <Box sx={{ borderLeft: '1px solid #eee', pl: 3, textAlign: 'center', flex: 1 }}>
                    <Typography variant="h3" fontWeight={800} sx={{ color: '#4caf50' }}>
                        ${totalEarnings.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Earned</Typography>
                </Box>
                <Box sx={{ borderLeft: '1px solid #eee', pl: 3, textAlign: 'center', flex: 1 }}>
                    <Typography variant="h3" fontWeight={800} sx={{ color: '#2196f3' }}>
                        {scratchCards.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Cards</Typography>
                </Box>
            </Box>

            {/* Tabs */}
            <Tabs
                value={tabValue}
                onChange={(_, v) => setTabValue(v)}
                sx={{ mb: 4 }}
            >
                <Tab label={`Unscratched (${unscratchedCards.length})`} />
                <Tab label={`Ready to Redeem (${scratchedCards.length})`} />
                <Tab label={`Redeemed (${redeemedCards.length})`} />
            </Tabs>

            {/* Cards */}
            {scratchCards.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CardGiftcardIcon sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary">No scratch cards yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Place an order of $100+ to earn scratch cards!
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/shop')} sx={{ bgcolor: '#D5A249' }}>
                        Start Shopping
                    </Button>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {(tabValue === 0 ? unscratchedCards : tabValue === 1 ? scratchedCards : redeemedCards).map(card => (
                        <Box key={card.id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.33% - 16px)' }, minWidth: 0 }}>
                            <CardItem card={card} />
                        </Box>
                    ))}
                    {(tabValue === 0 ? unscratchedCards : tabValue === 1 ? scratchedCards : redeemedCards).length === 0 && (
                        <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                            <Typography color="text.secondary">No cards in this category</Typography>
                        </Box>
                    )}
                </Box>
            )}

            {/* Scratch Card Dialog */}
            <Dialog
                open={!!selectedCard}
                onClose={() => { setSelectedCard(null); setRevealedAmount(null); }}
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        maxWidth: 400,
                        width: '100%',
                        bgcolor: '#1a1a1a',
                        overflow: 'visible'
                    }
                }}
            >
                <DialogContent sx={{ p: 0, position: 'relative' }}>
                    <IconButton
                        onClick={() => { setSelectedCard(null); setRevealedAmount(null); }}
                        sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 10 }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {selectedCard && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            {selectedCard.isScratched || revealedAmount ? (
                                <>
                                    <CelebrationIcon sx={{ fontSize: 60, color: '#D5A249', mb: 2 }} />
                                    <Typography variant="h3" fontWeight={800} sx={{ color: '#D5A249' }}>
                                        ${(selectedCard.discountAmount || revealedAmount || 0).toFixed(2)}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'white', mt: 1, mb: 3 }}>
                                        Cashback Reward!
                                    </Typography>

                                    {!selectedCard.isRedeemed && (
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            startIcon={<AccountBalanceWalletIcon />}
                                            onClick={() => handleRedeem(selectedCard)}
                                            sx={{
                                                bgcolor: '#D5A249',
                                                color: 'black',
                                                py: 1.5,
                                                fontWeight: 700,
                                                '&:hover': { bgcolor: '#c49a3e' }
                                            }}
                                        >
                                            Add to Wallet
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Typography variant="overline" sx={{ color: '#D5A249', letterSpacing: 3 }}>
                                        🎁 SCRATCH CARD
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700} sx={{ color: 'white', mt: 1, mb: 3 }}>
                                        Reveal Your Reward!
                                    </Typography>

                                    <Box
                                        sx={{
                                            width: 280,
                                            height: 120,
                                            mx: 'auto',
                                            mb: 3,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #D5A249 0%, #F5D78E 50%, #D5A249 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                            '&:hover': { transform: 'scale(1.02)' }
                                        }}
                                        onClick={() => handleScratchReveal(selectedCard)}
                                    >
                                        {isScratching ? (
                                            <Typography sx={{ color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>
                                                Revealing...
                                            </Typography>
                                        ) : (
                                            <Typography sx={{ color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>
                                                TAP TO SCRATCH
                                            </Typography>
                                        )}
                                    </Box>

                                    <Typography variant="caption" sx={{ color: '#666' }}>
                                        From order: ${selectedCard.orderAmount.toFixed(2)}
                                    </Typography>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default Rewards;
