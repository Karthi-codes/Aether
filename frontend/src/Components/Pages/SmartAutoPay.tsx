import { useState, useEffect } from 'react';
import {
    Box, Typography, Container, Paper, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, Chip, Fade, Zoom, Tabs, Tab, IconButton,
    Tooltip, LinearProgress, Alert, InputAdornment, Card, CardMedia,
    CardContent
} from '@mui/material';
import {
    AutoMode, MonitorHeart, History, TrendingDown,
    NotificationsActive, Delete, Edit, CheckCircle, Search,
    AccountBalanceWallet, Bolt, ArrowDownward, ArrowUpward, Timeline,
    Receipt, Close, AddAlert
} from '@mui/icons-material';
import { useAutoPurchase } from '../../context/AutoPurchaseContext';
import { useWallet } from '../../context/WalletContext';
import { toast } from 'react-toastify';
import type { Product } from '../../types';

// Theme Colors
const GOLD = '#D5A249';
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const LIGHT_GRAY = '#F5F5F5';
const BORDER_GRAY = '#E0E0E0';
const SUCCESS = '#4CAF50';
const ERROR = '#F44336';
const INFO = '#2196F3';

const SmartAutoPay: React.FC = () => {
    const {
        autoPurchaseItems,
        purchaseHistory,
        priceChangeLogs,
        addAutoPurchase,
        removeAutoPurchase,
        updateTargetPrice
    } = useAutoPurchase();
    const { wallet } = useWallet();

    const [tabValue, setTabValue] = useState(0);
    const [setupDialogOpen, setSetupDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState('');
    const [editTargetPrice, setEditTargetPrice] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [targetPrice, setTargetPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelItemId, setCancelItemId] = useState('');

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/products');
                if (response.ok) {
                    const data = await response.json();
                    const mapped = data.map((p: any) => ({
                        ...p,
                        id: p._id,
                        image: p.images && p.images.length > 0 ? p.images[0] : ''
                    }));
                    setProducts(mapped);
                }
            } catch (error) {
                console.error('Error fetching products for SmartAutoPay:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    const activeItems = autoPurchaseItems.filter(i => i.status === 'active');
    const completedItems = autoPurchaseItems.filter(i => i.status === 'purchased');
    const failedItems = autoPurchaseItems.filter(i => i.status === 'insufficient_funds');



    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSetupAutoPay = () => {
        if (!selectedProduct) return;
        const target = parseFloat(targetPrice);
        const max = parseFloat(maxPrice);

        if (isNaN(target) || target <= 0) {
            toast.error('Please enter a valid target price');
            return;
        }
        if (isNaN(max) || max <= 0) {
            toast.error('Please enter a valid maximum price');
            return;
        }
        if (target > max) {
            toast.error('Target price cannot be greater than maximum price');
            return;
        }
        if (target > selectedProduct.price) {
            toast.warning('Target price is higher than current price — auto-purchase will trigger immediately!');
        }
        if (!deliveryAddress.trim()) {
            toast.error('Please enter a delivery address');
            return;
        }

        addAutoPurchase(selectedProduct, target, max, deliveryAddress);
        setSetupDialogOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setSelectedProduct(null);
        setTargetPrice('');
        setMaxPrice('');
        setDeliveryAddress('');
        setSearchQuery('');
    };

    const handleEditTargetPrice = () => {
        const newPrice = parseFloat(editTargetPrice);
        if (isNaN(newPrice) || newPrice <= 0) {
            toast.error('Invalid price');
            return;
        }
        updateTargetPrice(editingItemId, newPrice);
        setEditDialogOpen(false);
    };

    const handleConfirmCancel = async () => {
        await removeAutoPurchase(cancelItemId);
        setCancelDialogOpen(false);
    };

    const getPriceChangePercent = (item: any) => {
        if (!item.originalPrice) return 0;
        return ((item.currentPrice - item.originalPrice) / item.originalPrice * 100);
    };

    if (loading) return null;

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            {/* Header */}
            <Fade in timeout={500}>
                <Box sx={{ mb: 5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, display: 'flex' }}>
                            <Bolt sx={{ fontSize: 32, color: GOLD }} />
                        </Box>
                        <Box>
                            <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: BLACK }}>
                                SmartAutoPay
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body1" sx={{ ml: 8, color: '#666' }}>
                        Set your target price and let us automatically purchase when the admin updates to your desired price.
                    </Typography>
                </Box>
            </Fade>

            {/* Stats Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2.5, mb: 4 }}>
                <Zoom in timeout={200}>
                    <Paper elevation={0} sx={{
                        p: 3, borderRadius: 3, bgcolor: BLACK, color: WHITE,
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', bgcolor: GOLD, opacity: 0.1 }} />
                        <MonitorHeart sx={{ color: GOLD, mb: 1 }} />
                        <Typography variant="h3" fontWeight={800} sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                            {activeItems.length}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>
                            ACTIVELY MONITORING
                        </Typography>
                    </Paper>
                </Zoom>

                <Zoom in timeout={300}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: WHITE, border: `1px solid ${BORDER_GRAY}` }}>
                        <CheckCircle sx={{ color: SUCCESS, mb: 1 }} />
                        <Typography variant="h3" fontWeight={800} sx={{ color: SUCCESS, fontFamily: '"DM Sans", sans-serif' }}>
                            {completedItems.length}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', letterSpacing: 1 }}>
                            AUTO-PURCHASED
                        </Typography>
                    </Paper>
                </Zoom>

                <Zoom in timeout={400}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: WHITE, border: `1px solid ${BORDER_GRAY}` }}>
                        <AccountBalanceWallet sx={{ color: GOLD, mb: 1 }} />
                        <Typography variant="h3" fontWeight={800} sx={{ fontFamily: '"DM Sans", sans-serif', color: BLACK }}>
                            {formatCurrency(wallet.available)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', letterSpacing: 1 }}>
                            WALLET BALANCE
                        </Typography>
                    </Paper>
                </Zoom>

                <Zoom in timeout={500}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: WHITE, border: `1px solid ${BORDER_GRAY}` }}>
                        <Timeline sx={{ color: INFO, mb: 1 }} />
                        <Typography variant="h3" fontWeight={800} sx={{ fontFamily: '"DM Sans", sans-serif', color: BLACK }}>
                            {priceChangeLogs.length}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', letterSpacing: 1 }}>
                            PRICE UPDATES
                        </Typography>
                    </Paper>
                </Zoom>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden', border: `1px solid ${BORDER_GRAY}` }} elevation={0}>
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        bgcolor: WHITE,
                        '& .MuiTabs-indicator': { backgroundColor: GOLD, height: 3 },
                        '& .MuiTab-root': { fontWeight: 600, fontSize: '0.9rem', textTransform: 'none', py: 2.5, color: '#666' }
                    }}
                >
                    <Tab icon={<MonitorHeart sx={{ mb: 0.5 }} />} label="Active Monitors" sx={{ '&.Mui-selected': { color: `${BLACK} !important` } }} />
                    <Tab icon={<History sx={{ mb: 0.5 }} />} label="Purchase History" sx={{ '&.Mui-selected': { color: `${BLACK} !important` } }} />
                    <Tab icon={<Timeline sx={{ mb: 0.5 }} />} label="Price Change Log" sx={{ '&.Mui-selected': { color: `${BLACK} !important` } }} />
                </Tabs>
            </Paper>

            {/* Active Monitors Tab */}
            {tabValue === 0 && (
                <Fade in timeout={400}>
                    <Box>
                        {/* Add New Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<AddAlert />}
                                onClick={() => setSetupDialogOpen(true)}
                                sx={{
                                    bgcolor: BLACK, color: WHITE, fontWeight: 700, borderRadius: 2, px: 4, py: 1.5,
                                    '&:hover': { bgcolor: '#333' },
                                    transition: 'all 0.3s'
                                }}
                            >
                                Set Up SmartAutoPay
                            </Button>
                        </Box>

                        {/* Active Items */}
                        {activeItems.length === 0 ? (
                            <Paper elevation={0} sx={{
                                p: 8, textAlign: 'center', borderRadius: 3,
                                border: `2px dashed ${BORDER_GRAY}`, bgcolor: LIGHT_GRAY
                            }}>
                                <AutoMode sx={{ fontSize: 70, color: '#ccc', mb: 2 }} />
                                <Typography variant="h5" sx={{ color: '#666', mb: 1 }} fontWeight={600}>
                                    No active monitors
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#999', mb: 3 }}>
                                    Set up SmartAutoPay to automatically purchase products when the admin drops the price to your target.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddAlert />}
                                    onClick={() => setSetupDialogOpen(true)}
                                    sx={{
                                        borderColor: GOLD, color: BLACK, fontWeight: 600, borderRadius: 2,
                                        '&:hover': { borderColor: GOLD, bgcolor: 'rgba(213,162,73,0.05)' }
                                    }}
                                >
                                    Get Started
                                </Button>
                            </Paper>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {activeItems.map((item, index) => {
                                    const priceChange = getPriceChangePercent(item);
                                    const progressToTarget = item.originalPrice > 0
                                        ? Math.max(0, Math.min(100, ((item.originalPrice - item.currentPrice) / (item.originalPrice - item.targetPrice)) * 100))
                                        : 0;

                                    return (
                                        <Fade in timeout={200 + index * 100} key={item._id}>
                                            <Paper elevation={0} sx={{
                                                p: 3, borderRadius: 3, border: `1px solid ${BORDER_GRAY}`,
                                                bgcolor: WHITE, transition: 'all 0.3s',
                                                '&:hover': { borderColor: GOLD, boxShadow: '0 4px 20px rgba(213,162,73,0.15)' }
                                            }}>
                                                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                                                    {/* Product Image */}
                                                    <Box sx={{
                                                        width: 90, height: 90, borderRadius: 2, overflow: 'hidden', flexShrink: 0,
                                                        border: `1px solid ${BORDER_GRAY}`
                                                    }}>
                                                        <img
                                                            src={item.productImage}
                                                            alt={item.productName}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </Box>

                                                    {/* Product Info */}
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="h6" fontWeight={700} sx={{ color: BLACK, mb: 0.5 }} noWrap>
                                                            {item.productName}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', mb: 1.5 }}>
                                                            <Chip
                                                                icon={<MonitorHeart sx={{ fontSize: 16, color: `${SUCCESS} !important` }} />}
                                                                label="Monitoring"
                                                                size="small"
                                                                sx={{ bgcolor: 'rgba(76,175,80,0.1)', color: SUCCESS, fontWeight: 600, border: `1px solid rgba(76,175,80,0.3)` }}
                                                            />
                                                            <Typography variant="caption" sx={{ color: '#999' }}>
                                                                Since {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                            </Typography>
                                                        </Box>

                                                        {/* Price Progress */}
                                                        <Box sx={{ mb: 1 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                <Typography variant="caption" sx={{ color: '#999' }}>Progress to target</Typography>
                                                                <Typography variant="caption" fontWeight={600} sx={{ color: progressToTarget >= 100 ? SUCCESS : GOLD }}>
                                                                    {isFinite(progressToTarget) ? `${Math.round(progressToTarget)}%` : '0%'}
                                                                </Typography>
                                                            </Box>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={isFinite(progressToTarget) ? Math.min(100, progressToTarget) : 0}
                                                                sx={{
                                                                    height: 6, borderRadius: 3, bgcolor: LIGHT_GRAY,
                                                                    '& .MuiLinearProgress-bar': { bgcolor: progressToTarget >= 100 ? SUCCESS : GOLD, borderRadius: 3 }
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>

                                                    {/* Price Info */}
                                                    <Box sx={{
                                                        display: 'flex', gap: 3, alignItems: 'center',
                                                        flexShrink: 0, flexWrap: { xs: 'wrap', sm: 'nowrap' }
                                                    }}>
                                                        <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                                                            <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.3 }}>CURRENT</Typography>
                                                            <Typography variant="h5" fontWeight={800} sx={{ color: BLACK, fontFamily: '"DM Sans", sans-serif' }}>
                                                                {formatCurrency(item.currentPrice)}
                                                            </Typography>
                                                            {priceChange !== 0 && (
                                                                <Chip
                                                                    size="small"
                                                                    icon={priceChange < 0 ? <ArrowDownward sx={{ fontSize: 14 }} /> : <ArrowUpward sx={{ fontSize: 14 }} />}
                                                                    label={`${Math.abs(priceChange).toFixed(1)}%`}
                                                                    sx={{
                                                                        bgcolor: priceChange < 0 ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
                                                                        color: priceChange < 0 ? SUCCESS : ERROR,
                                                                        fontWeight: 600, fontSize: '0.7rem', height: 22, mt: 0.5,
                                                                        '& .MuiChip-icon': { color: priceChange < 0 ? SUCCESS : ERROR }
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>

                                                        <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                                                            <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.3 }}>TARGET</Typography>
                                                            <Typography variant="h5" fontWeight={800} sx={{ color: GOLD, fontFamily: '"DM Sans", sans-serif' }}>
                                                                {formatCurrency(item.targetPrice)}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                                                            <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.3 }}>LOWEST</Typography>
                                                            <Typography variant="h6" fontWeight={700} sx={{ color: SUCCESS, fontFamily: '"DM Sans", sans-serif' }}>
                                                                {formatCurrency(item.lowestPriceSeen)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    {/* Actions */}
                                                    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                                                        <Tooltip title="Edit target price">
                                                            <IconButton
                                                                onClick={() => {
                                                                    setEditingItemId(item._id);
                                                                    setEditTargetPrice(item.targetPrice.toString());
                                                                    setEditDialogOpen(true);
                                                                }}
                                                                sx={{
                                                                    bgcolor: LIGHT_GRAY, '&:hover': { bgcolor: BORDER_GRAY }
                                                                }}
                                                            >
                                                                <Edit sx={{ fontSize: 20, color: BLACK }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Cancel">
                                                            <IconButton
                                                                onClick={() => {
                                                                    setCancelItemId(item._id);
                                                                    setCancelDialogOpen(true);
                                                                }}
                                                                sx={{
                                                                    bgcolor: 'rgba(244,67,54,0.05)', '&:hover': { bgcolor: 'rgba(244,67,54,0.1)' }
                                                                }}
                                                            >
                                                                <Delete sx={{ fontSize: 20, color: ERROR }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Fade>
                                    );
                                })}
                            </Box>
                        )}
                        {/* Failed Items */}
                        {failedItems.length > 0 && (
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: ERROR }}>
                                    ⚠️ Failed (Insufficient Funds)
                                </Typography>
                                {failedItems.map(item => (
                                    <Paper key={item._id} elevation={0} sx={{
                                        p: 2.5, borderRadius: 2, border: `1px solid rgba(244,67,54,0.3)`,
                                        bgcolor: 'rgba(244,67,54,0.02)', mb: 1.5, display: 'flex', alignItems: 'center', gap: 2
                                    }}>
                                        <Box sx={{ width: 50, height: 50, borderRadius: 1.5, overflow: 'hidden' }}>
                                            <img src={item.productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography fontWeight={600}>{item.productName}</Typography>
                                            <Typography variant="caption" sx={{ color: ERROR }}>
                                                Price reached {formatCurrency(item.currentPrice)} but wallet balance was insufficient
                                            </Typography>
                                        </Box>
                                        <Button
                                            size="small"
                                            onClick={() => removeAutoPurchase(item._id)}
                                            sx={{ color: '#999', fontWeight: 600 }}
                                        >
                                            Dismiss
                                        </Button>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Fade>
            )}

            {/* Purchase History Tab */}
            {tabValue === 1 && (
                <Fade in timeout={400}>
                    <Box>
                        {purchaseHistory.length === 0 ? (
                            <Paper elevation={0} sx={{
                                p: 8, textAlign: 'center', borderRadius: 3,
                                border: `2px dashed ${BORDER_GRAY}`, bgcolor: LIGHT_GRAY
                            }}>
                                <Receipt sx={{ fontSize: 70, color: '#ccc', mb: 2 }} />
                                <Typography variant="h5" sx={{ color: '#666' }} fontWeight={600}>
                                    No auto-purchases yet
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#999', mt: 1 }}>
                                    When a product hits your target price, it will be purchased automatically
                                </Typography>
                            </Paper>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {purchaseHistory.map((item, index) => (
                                    <Fade in timeout={200 + index * 100} key={item._id || index}>
                                        <Paper elevation={0} sx={{
                                            p: 3, borderRadius: 3, border: `1px solid ${BORDER_GRAY}`,
                                            bgcolor: WHITE
                                        }}>
                                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                                <Box sx={{ width: 70, height: 70, borderRadius: 2, overflow: 'hidden' }}>
                                                    <img src={item.productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="h6" fontWeight={700}>{item.productName}</Typography>
                                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                                        Auto-purchased on {item.purchasedAt ? new Date(item.purchasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="h5" fontWeight={800} sx={{ color: SUCCESS }}>
                                                        {formatCurrency(item.currentPrice)}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                                        Target was {formatCurrency(item.targetPrice)}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: item.status === 'purchased' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                                                        color: item.status === 'purchased' ? SUCCESS : '#FF9800',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </Box>
                                        </Paper>
                                    </Fade>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Fade>
            )}

            {/* Price Change Log Tab */}
            {tabValue === 2 && (
                <Fade in timeout={400}>
                    <Box>
                        <Alert
                            severity="info"
                            icon={<NotificationsActive sx={{ color: GOLD }} />}
                            sx={{
                                mb: 3, borderRadius: 2, bgcolor: LIGHT_GRAY, border: `1px solid ${BORDER_GRAY}`,
                                color: BLACK, '& .MuiAlert-icon': { color: GOLD }
                            }}
                        >
                            Prices are updated exclusively by the admin. Your SmartAutoPay will trigger automatically when the price drops to your target.
                        </Alert>

                        {priceChangeLogs.length === 0 ? (
                            <Paper elevation={0} sx={{
                                p: 8, textAlign: 'center', borderRadius: 3,
                                border: `2px dashed ${BORDER_GRAY}`, bgcolor: LIGHT_GRAY
                            }}>
                                <Timeline sx={{ fontSize: 70, color: '#ccc', mb: 2 }} />
                                <Typography variant="h5" sx={{ color: '#666' }} fontWeight={600}>
                                    No price changes yet
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#999', mt: 1 }}>
                                    When the admin changes product prices, they'll appear here.
                                </Typography>
                            </Paper>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {priceChangeLogs.map((log, index) => {
                                    const isDecrease = log.newPrice < log.oldPrice;
                                    const changePercent = ((log.newPrice - log.oldPrice) / log.oldPrice * 100).toFixed(1);

                                    return (
                                        <Fade in timeout={200 + index * 80} key={index}>
                                            <Paper elevation={0} sx={{
                                                p: 2.5, borderRadius: 2, bgcolor: LIGHT_GRAY,
                                                transition: 'all 0.2s',
                                                '&:hover': { bgcolor: BORDER_GRAY, transform: 'translateX(5px)' }
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                                    <Box sx={{
                                                        p: 1.5, borderRadius: 2,
                                                        bgcolor: isDecrease ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
                                                        color: isDecrease ? SUCCESS : ERROR
                                                    }}>
                                                        {isDecrease ? <TrendingDown /> : <ArrowUpward />}
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight={600} sx={{ color: BLACK }}>
                                                            {log.productName}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#666' }}>
                                                            {new Date(log.changedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(log.changedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • Changed by {log.changedBy}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ textAlign: 'right' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography variant="body2" sx={{ color: '#999', textDecoration: 'line-through' }}>
                                                                {formatCurrency(log.oldPrice)}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: '#999' }}>→</Typography>
                                                            <Typography variant="h6" fontWeight={700} sx={{ color: isDecrease ? SUCCESS : ERROR }}>
                                                                {formatCurrency(log.newPrice)}
                                                            </Typography>
                                                        </Box>
                                                        <Chip
                                                            size="small"
                                                            label={`${isDecrease ? '' : '+'}${changePercent}%`}
                                                            sx={{
                                                                bgcolor: isDecrease ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
                                                                color: isDecrease ? SUCCESS : ERROR,
                                                                fontWeight: 600, fontSize: '0.7rem', height: 22, mt: 0.5
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Fade>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Fade>
            )}

            {/* Setup SmartAutoPay Dialog */}
            <Dialog
                open={setupDialogOpen}
                onClose={() => { setSetupDialogOpen(false); resetForm(); }}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, bgcolor: WHITE } }}
            >
                <DialogTitle sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: BLACK }}>
                            <Bolt sx={{ color: GOLD, fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight={700}>Set Up SmartAutoPay</Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Choose a product and set your target price
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={() => { setSetupDialogOpen(false); resetForm(); }}>
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {!selectedProduct ? (
                        // Product Selection
                        <Box>
                            <TextField
                                fullWidth
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Search sx={{ color: '#999' }} /></InputAdornment>
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&.Mui-focused fieldset': { borderColor: GOLD }
                                    }
                                }}
                            />

                            <Box sx={{
                                display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                gap: 2, maxHeight: 400, overflowY: 'auto', pr: 1,
                                '&::-webkit-scrollbar': { width: 6 },
                                '&::-webkit-scrollbar-track': { bgcolor: LIGHT_GRAY, borderRadius: 3 },
                                '&::-webkit-scrollbar-thumb': { bgcolor: BORDER_GRAY, borderRadius: 3 }
                            }}>
                                {filteredProducts.map((product: Product) => (
                                    <Card
                                        key={product.id}
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setMaxPrice(product.price.toString());
                                        }}
                                        sx={{
                                            cursor: 'pointer', borderRadius: 2, border: `1px solid ${BORDER_GRAY}`,
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: GOLD, boxShadow: '0 4px 15px rgba(213,162,73,0.2)', transform: 'translateY(-2px)' }
                                        }}
                                        elevation={0}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="120"
                                            image={product.image}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            <Typography variant="body2" fontWeight={600} noWrap>{product.name}</Typography>
                                            <Typography variant="h6" fontWeight={800} sx={{ color: BLACK }}>
                                                {formatCurrency(product.price)}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#999' }}>{product.category}</Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </Box>
                    ) : (
                        // Price Setup
                        <Box>
                            <Paper elevation={0} sx={{
                                p: 3, mb: 3, borderRadius: 2, bgcolor: LIGHT_GRAY, border: `1px solid ${BORDER_GRAY}`,
                                display: 'flex', gap: 3, alignItems: 'center'
                            }}>
                                <Box sx={{ width: 80, height: 80, borderRadius: 2, overflow: 'hidden' }}>
                                    <img src={selectedProduct.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight={700}>{selectedProduct.name}</Typography>
                                    <Typography variant="body2" sx={{ color: '#666' }}>{selectedProduct.category}</Typography>
                                    <Typography variant="h5" fontWeight={800} sx={{ color: GOLD, mt: 0.5 }}>
                                        Current: {formatCurrency(selectedProduct.price)}
                                    </Typography>
                                </Box>
                                <Button
                                    size="small"
                                    onClick={() => setSelectedProduct(null)}
                                    sx={{ color: '#999' }}
                                >
                                    Change
                                </Button>
                            </Paper>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Target Price (Buy at or below)"
                                    type="number"
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Typography sx={{ color: GOLD, fontWeight: 700 }}>₹</Typography></InputAdornment>
                                    }}
                                    helperText="Auto-purchase triggers when price ≤ this"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: GOLD } },
                                        '& .MuiInputLabel-root.Mui-focused': { color: GOLD }
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Maximum Price (Safety limit)"
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Typography sx={{ color: GOLD, fontWeight: 700 }}>₹</Typography></InputAdornment>
                                    }}
                                    helperText="Won't purchase above this price"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: GOLD } },
                                        '& .MuiInputLabel-root.Mui-focused': { color: GOLD }
                                    }}
                                />
                            </Box>

                            <TextField
                                fullWidth
                                label="Delivery Address"
                                multiline
                                rows={2}
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                sx={{
                                    mt: 2,
                                    '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: GOLD } },
                                    '& .MuiInputLabel-root.Mui-focused': { color: GOLD }
                                }}
                            />

                            <Alert
                                severity="info"
                                icon={<Bolt sx={{ color: GOLD }} />}
                                sx={{
                                    mt: 3, borderRadius: 2, bgcolor: 'rgba(213,162,73,0.05)',
                                    border: `1px solid rgba(213,162,73,0.2)`,
                                    '& .MuiAlert-icon': { color: GOLD },
                                    color: BLACK
                                }}
                            >
                                <Typography variant="body2" fontWeight={600}>How it works:</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    When the admin updates this product's price to ₹{targetPrice || '___'} or below,
                                    the amount will be automatically deducted from your wallet and the order will be placed instantly.
                                </Typography>
                            </Alert>
                        </Box>
                    )}
                </DialogContent>

                {selectedProduct && (
                    <DialogActions sx={{ p: 3, gap: 2 }}>
                        <Button onClick={() => { setSetupDialogOpen(false); resetForm(); }} sx={{ color: '#666', fontWeight: 600 }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSetupAutoPay}
                            disabled={!targetPrice || !maxPrice || !deliveryAddress}
                            startIcon={<Bolt />}
                            sx={{
                                px: 4, py: 1.5, bgcolor: BLACK, color: WHITE, fontWeight: 700, borderRadius: 2,
                                '&:hover': { bgcolor: '#333' },
                                '&:disabled': { bgcolor: BORDER_GRAY }
                            }}
                        >
                            Activate SmartAutoPay
                        </Button>
                    </DialogActions>
                )}
            </Dialog>

            {/* Edit Target Price Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle fontWeight={700}>Update Target Price</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                        Changing your target price will re-evaluate the auto-purchase trigger.
                    </Typography>
                    <TextField
                        fullWidth
                        label="New Target Price"
                        type="number"
                        value={editTargetPrice}
                        onChange={(e) => setEditTargetPrice(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Typography sx={{ color: GOLD, fontWeight: 700 }}>₹</Typography></InputAdornment>
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: GOLD } },
                            '& .MuiInputLabel-root.Mui-focused': { color: GOLD }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setEditDialogOpen(false)} sx={{ color: '#666' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleEditTargetPrice}
                        sx={{ bgcolor: BLACK, color: WHITE, borderRadius: 2, fontWeight: 600, px: 3 }}
                    >
                        Update Price
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <Dialog
                open={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle fontWeight={700}>Stop Monitoring?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to stop SmartAutoPay for this product? This will remove the automatic purchase trigger.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setCancelDialogOpen(false)} sx={{ color: '#666' }} disabled={loading}>No, Go Back</Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            setLoading(true);
                            await handleConfirmCancel();
                            setLoading(false);
                        }}
                        disabled={loading}
                        sx={{ bgcolor: ERROR, color: WHITE, borderRadius: 2, fontWeight: 600, px: 3, '&:hover': { bgcolor: '#d32f2f' } }}
                    >
                        {loading ? 'Cancelling...' : 'Yes, Stop Monitor'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SmartAutoPay;
