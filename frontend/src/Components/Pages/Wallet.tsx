import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, CircularProgress, Tabs, Tab, Alert, Chip, Skeleton, Fade, Zoom } from '@mui/material';
import { AccountBalanceWallet, History, CallMade, CallReceived, Send, Refresh, Add, ContentCopy, CheckCircle, TrendingUp, TrendingDown, CreditCard, QrCode2 } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api.service';
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';

// Theme Colors - Black, White & Gold
const GOLD = '#D5A249';
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const LIGHT_GRAY = '#F5F5F5';
const BORDER_GRAY = '#E0E0E0';

const Wallet: React.FC = () => {
    const { token, user, updateUser } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openAddFunds, setOpenAddFunds] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [copied, setCopied] = useState(false);

    // Transfer State
    const [recipientEmail, setRecipientEmail] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);

    // Quick amount presets
    const quickAmounts = [500, 1000, 2000, 5000];

    const fetchWalletData = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await apiService.getWallet(token);
            setBalance(data.balance);
            setTransactions(data.transactions);
        } catch (error) {
            console.error('Error fetching wallet:', error);
            // toast.error('Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, [token]);

    const handleAddFunds = async () => {
        const amount = parseFloat(amountToAdd);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            const result = await apiService.addFunds(amount, token!);
            toast.success('Funds added successfully');
            setOpenAddFunds(false);
            setAmountToAdd('');
            setBalance(result.balance);
            updateUser({ walletBalance: result.balance }); // Sync with AuthContext
            fetchWalletData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add funds');
        }
    };

    const handleTransfer = async () => {
        const amount = parseFloat(transferAmount);
        if (!recipientEmail || isNaN(amount) || amount <= 0) {
            toast.error('Please enter valid details');
            return;
        }

        if (amount > balance) {
            toast.error('Insufficient balance');
            return;
        }

        try {
            setTransferLoading(true);
            const result = await apiService.transferFunds(recipientEmail, amount, token!);
            toast.success('Transfer successful!');
            setRecipientEmail('');
            setTransferAmount('');
            setTabValue(0); // Go back to overview
            setBalance(result.balance);
            updateUser({ walletBalance: result.balance }); // Sync with AuthContext
            fetchWalletData();
        } catch (error: any) {
            toast.error(error.message || 'Transfer failed');
        } finally {
            setTransferLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(user?.email || '');
        setCopied(true);
        toast.success('Wallet ID copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const getTransactionStats = () => {
        const deposits = transactions.filter(tx => tx.type === 'deposit').reduce((sum, tx) => sum + tx.amount, 0);
        const withdrawals = transactions.filter(tx => tx.type !== 'deposit').reduce((sum, tx) => sum + tx.amount, 0);
        return { deposits, withdrawals };
    };

    const stats = getTransactionStats();

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Skeleton variant="text" width={200} height={50} sx={{ mb: 2 }} />
                <Skeleton variant="text" width={350} height={30} sx={{ mb: 4 }} />
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <Skeleton variant="rounded" width={400} height={220} sx={{ borderRadius: 4 }} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: 2 }} />
                        <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: 2 }} />
                        <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
                    </Box>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            {/* Header */}
            <Fade in timeout={500}>
                <Box sx={{ mb: 5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            display: 'flex',
                            color: '#000000ff',
                        }}>
                            <AccountBalanceWallet sx={{ fontSize: 32, color: '#000000' }} />
                        </Box>
                        <Box>
                            <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: BLACK }}>
                                My Wallet
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body1" sx={{ ml: 8, color: '#666' }}>
                        Manage your funds, view transactions, and transfer money securely.
                    </Typography>
                </Box>
            </Fade>

            {/* Tabs */}
            <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden', border: `1px solid ${BORDER_GRAY}` }} elevation={0}>
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    centered
                    sx={{
                        bgcolor: WHITE,
                        '& .MuiTabs-indicator': { backgroundColor: GOLD, height: 3 },
                        '& .MuiTab-root': { fontWeight: 600, fontSize: '1rem', textTransform: 'none', py: 2.5, px: 5, color: '#666' }
                    }}
                >
                    <Tab
                        icon={<AccountBalanceWallet sx={{ mb: 0.5 }} />}
                        label="Overview"
                        sx={{ '&.Mui-selected': { color: `${BLACK} !important` } }}
                    />
                    <Tab
                        icon={<Send sx={{ mb: 0.5 }} />}
                        label="Send Money"
                        sx={{ '&.Mui-selected': { color: `${BLACK} !important` } }}
                    />
                    <Tab
                        icon={<QrCode2 sx={{ mb: 0.5 }} />}
                        label="Receive"
                        sx={{ '&.Mui-selected': { color: `${BLACK} !important` } }}
                    />
                </Tabs>
            </Paper>

            {/* Overview Tab */}
            {tabValue === 0 && (
                <Fade in timeout={400}>
                    <Box>
                        {/* Stats Row */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
                            {/* Balance Card */}
                            <Zoom in timeout={300}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        background: BLACK,
                                        color: WHITE,
                                        borderRadius: 3,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        gridColumn: { md: 'span 2' },
                                        minHeight: 200,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    {/* Decorative Gold Circle */}
                                    <Box sx={{
                                        position: 'absolute', top: -80, right: -80, width: 250, height: 250,
                                        borderRadius: '50%', background: GOLD, opacity: 0.1
                                    }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                                        <Box>
                                            <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 3, fontSize: '0.7rem', color: GOLD }}>
                                                AVAILABLE BALANCE
                                            </Typography>
                                            <Typography variant="h2" sx={{ fontWeight: 800, mt: 1, fontFamily: '"DM Sans", sans-serif', letterSpacing: -1, color: WHITE }}>
                                                {formatCurrency(balance)}
                                            </Typography>
                                        </Box>
                                        <CreditCard sx={{ fontSize: 50, color: GOLD, opacity: 0.5 }} />
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1, mt: 3 }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ opacity: 0.5, letterSpacing: 1, color: WHITE }}>ACCOUNT HOLDER</Typography>
                                            <Typography variant="subtitle1" fontWeight={600} sx={{ letterSpacing: 1, textTransform: 'uppercase', color: WHITE }}>
                                                {user?.name || 'AETHER USER'}
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            startIcon={<Add />}
                                            onClick={() => setOpenAddFunds(true)}
                                            sx={{
                                                borderRadius: 2,
                                                px: 4,
                                                py: 1.5,
                                                bgcolor: GOLD,
                                                color: BLACK,
                                                fontWeight: 700,
                                                '&:hover': { bgcolor: '#C4922D' },
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            Add Money
                                        </Button>
                                    </Box>
                                </Paper>
                            </Zoom>

                            {/* Stats Cards */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Paper sx={{
                                    p: 3, borderRadius: 2, flex: 1, display: 'flex', alignItems: 'center', gap: 2,
                                    border: `1px solid ${BORDER_GRAY}`, bgcolor: WHITE
                                }} elevation={0}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
                                        <TrendingUp sx={{ color: '#4CAF50' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#666' }}>Total Received</Typography>
                                        <Typography variant="h6" fontWeight={700} sx={{ color: '#4CAF50' }}>
                                            +{formatCurrency(stats.deposits)}
                                        </Typography>
                                    </Box>
                                </Paper>
                                <Paper sx={{
                                    p: 3, borderRadius: 2, flex: 1, display: 'flex', alignItems: 'center', gap: 2,
                                    border: `1px solid ${BORDER_GRAY}`, bgcolor: WHITE
                                }} elevation={0}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(244, 67, 54, 0.1)' }}>
                                        <TrendingDown sx={{ color: '#F44336' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#666' }}>Total Spent</Typography>
                                        <Typography variant="h6" fontWeight={700} sx={{ color: '#F44336' }}>
                                            -{formatCurrency(stats.withdrawals)}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>

                        {/* Recent Activity */}
                        <Paper sx={{ p: 4, borderRadius: 3, bgcolor: WHITE, border: `1px solid ${BORDER_GRAY}` }} elevation={0}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <History sx={{ color: GOLD }} />
                                    <Typography variant="h5" fontWeight={700} sx={{ color: BLACK }}>
                                        Recent Activity
                                    </Typography>
                                    <Chip
                                        label={`${transactions.length} transactions`}
                                        size="small"
                                        sx={{ bgcolor: LIGHT_GRAY, color: BLACK, fontWeight: 600 }}
                                    />
                                </Box>
                                <Tooltip title="Refresh">
                                    <IconButton onClick={fetchWalletData} sx={{ bgcolor: LIGHT_GRAY, '&:hover': { bgcolor: BORDER_GRAY } }}>
                                        <Refresh sx={{ color: BLACK }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {transactions.length === 0 ? (
                                <Box sx={{ p: 6, textAlign: 'center', border: `2px dashed ${BORDER_GRAY}`, borderRadius: 3, bgcolor: LIGHT_GRAY }}>
                                    <History sx={{ fontSize: 60, color: '#999', mb: 2 }} />
                                    <Typography variant="h6" sx={{ color: '#666' }} gutterBottom>No transactions yet</Typography>
                                    <Typography variant="body2" sx={{ color: '#999' }}>
                                        Add funds to your wallet to get started!
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {transactions.slice(0, 8).map((tx: any, index: number) => (
                                        <Fade in timeout={200 + index * 100} key={tx._id}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2.5,
                                                    borderRadius: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2.5,
                                                    bgcolor: LIGHT_GRAY,
                                                    transition: 'all 0.2s',
                                                    '&:hover': { bgcolor: BORDER_GRAY, transform: 'translateX(5px)' }
                                                }}
                                            >
                                                <Box sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    bgcolor: tx.type === 'deposit' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                                    color: tx.type === 'deposit' ? '#4CAF50' : '#F44336'
                                                }}>
                                                    {tx.type === 'deposit' ? <CallReceived /> : <CallMade />}
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: BLACK }}>
                                                        {tx.description}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#666' }}>
                                                        {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        color: tx.type === 'deposit' ? '#4CAF50' : '#F44336',
                                                        fontWeight: 700,
                                                        fontFamily: '"DM Sans", sans-serif'
                                                    }}
                                                >
                                                    {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                </Typography>
                                            </Paper>
                                        </Fade>
                                    ))}
                                </Box>
                            )}
                        </Paper>
                    </Box>
                </Fade>
            )}

            {/* Transfer Tab */}
            {tabValue === 1 && (
                <Fade in timeout={400}>
                    <Container maxWidth="sm">
                        <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 3, mt: 2, bgcolor: WHITE, border: `1px solid ${BORDER_GRAY}` }}>
                            <Box sx={{ textAlign: 'center', mb: 5 }}>
                                <Box sx={{
                                    display: 'inline-flex',
                                    p: 2.5,
                                    borderRadius: 3,
                                    bgcolor: BLACK,
                                    mb: 3
                                }}>
                                    <Send sx={{ fontSize: 45, color: GOLD }} />
                                </Box>
                                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontFamily: '"Playfair Display", serif', color: BLACK }}>
                                    Send Money
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#666' }}>
                                    Transfer funds instantly to any Aether user.
                                </Typography>
                            </Box>

                            {/* Available Balance */}
                            <Paper sx={{
                                p: 3, mb: 4, borderRadius: 2,
                                bgcolor: LIGHT_GRAY,
                                border: `1px solid ${BORDER_GRAY}`,
                                textAlign: 'center'
                            }} elevation={0}>
                                <Typography variant="caption" sx={{ color: '#666' }}>Available Balance</Typography>
                                <Typography variant="h4" fontWeight={700} sx={{ color: BLACK }}>
                                    {formatCurrency(balance)}
                                </Typography>
                            </Paper>

                            <TextField
                                fullWidth
                                label="Recipient's Email Address"
                                placeholder="friend@example.com"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&.Mui-focused fieldset': { borderColor: GOLD }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: GOLD }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Amount"
                                type="number"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&.Mui-focused fieldset': { borderColor: GOLD }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: GOLD }
                                }}
                                InputProps={{
                                    startAdornment: <Typography sx={{ mr: 1, color: GOLD, fontWeight: 700 }}>₹</Typography>
                                }}
                            />

                            {/* Quick Amounts */}
                            <Box sx={{ display: 'flex', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
                                {quickAmounts.map((amt) => (
                                    <Chip
                                        key={amt}
                                        label={`₹${amt.toLocaleString('en-IN')}`}
                                        onClick={() => setTransferAmount(amt.toString())}
                                        sx={{
                                            px: 1,
                                            fontWeight: 600,
                                            bgcolor: transferAmount === amt.toString() ? BLACK : LIGHT_GRAY,
                                            color: transferAmount === amt.toString() ? WHITE : BLACK,
                                            border: `1px solid ${BORDER_GRAY}`,
                                            '&:hover': { bgcolor: transferAmount === amt.toString() ? BLACK : BORDER_GRAY }
                                        }}
                                    />
                                ))}
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleTransfer}
                                disabled={transferLoading || !recipientEmail || !transferAmount}
                                sx={{
                                    py: 2,
                                    bgcolor: BLACK,
                                    color: WHITE,
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    '&:hover': { bgcolor: '#333' },
                                    borderRadius: 2,
                                    '&:disabled': { bgcolor: BORDER_GRAY }
                                }}
                            >
                                {transferLoading ? <CircularProgress size={28} color="inherit" /> : `Send ${transferAmount ? formatCurrency(parseFloat(transferAmount)) : ''}`}
                            </Button>

                            <Alert
                                severity="info"
                                icon={<CheckCircle sx={{ color: GOLD }} />}
                                sx={{
                                    mt: 4, borderRadius: 2,
                                    bgcolor: LIGHT_GRAY,
                                    border: `1px solid ${BORDER_GRAY}`,
                                    color: BLACK,
                                    '& .MuiAlert-icon': { color: GOLD }
                                }}
                            >
                                Transactions are secure, instant, and irreversible.
                            </Alert>
                        </Paper>
                    </Container>
                </Fade>
            )}

            {/* Receive Tab */}
            {tabValue === 2 && (
                <Fade in timeout={400}>
                    <Container maxWidth="sm">
                        <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 3, mt: 2, textAlign: 'center', bgcolor: WHITE, border: `1px solid ${BORDER_GRAY}` }}>
                            <Box sx={{
                                display: 'inline-flex',
                                p: 2.5,
                                borderRadius: 3,
                                bgcolor: BLACK,
                                mb: 3
                            }}>
                                <QrCode2 sx={{ fontSize: 45, color: GOLD }} />
                            </Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontFamily: '"Playfair Display", serif', color: BLACK }}>
                                Receive Money
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
                                Share your wallet ID or QR code to receive funds.
                            </Typography>

                            {/* QR Code */}
                            <Box sx={{
                                p: 4,
                                bgcolor: WHITE,
                                display: 'inline-block',
                                borderRadius: 3,
                                border: `2px solid ${BLACK}`,
                                mb: 4
                            }}>
                                <QRCode
                                    value={user?.email || 'unknown'}
                                    size={200}
                                    fgColor={BLACK}
                                    level="H"
                                />
                            </Box>

                            {/* Wallet ID */}
                            <Paper
                                onClick={copyToClipboard}
                                sx={{
                                    p: 2.5,
                                    bgcolor: LIGHT_GRAY,
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    border: `1px solid ${BORDER_GRAY}`,
                                    '&:hover': { bgcolor: BORDER_GRAY, borderColor: GOLD }
                                }}
                                elevation={0}
                            >
                                <Typography variant="subtitle1" fontWeight={600} sx={{ fontFamily: 'monospace', letterSpacing: 0.5, color: BLACK }}>
                                    {user?.email}
                                </Typography>
                                <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                                    <IconButton size="small" sx={{ color: copied ? '#4CAF50' : '#666' }}>
                                        {copied ? <CheckCircle /> : <ContentCopy />}
                                    </IconButton>
                                </Tooltip>
                            </Paper>

                            <Typography variant="caption" sx={{ mt: 3, display: 'block', color: '#666' }}>
                                Tap to copy your wallet ID
                            </Typography>
                        </Paper>
                    </Container>
                </Fade>
            )}

            {/* Add Funds Dialog */}
            <Dialog
                open={openAddFunds}
                onClose={() => setOpenAddFunds(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 3, p: 2, minWidth: 400,
                        bgcolor: WHITE,
                        border: `1px solid ${BORDER_GRAY}`
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, borderRadius: 2, bgcolor: BLACK, mb: 2 }}>
                        <Add sx={{ fontSize: 35, color: GOLD }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} sx={{ color: BLACK }}>Add Money</Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                        Top up your wallet balance
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Enter Amount"
                        type="number"
                        variant="outlined"
                        value={amountToAdd}
                        onChange={(e) => setAmountToAdd(e.target.value)}
                        InputProps={{
                            startAdornment: <Typography sx={{ mr: 1, color: GOLD, fontWeight: 700, fontSize: '1.2rem' }}>₹</Typography>
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                fontSize: '1.2rem',
                                '&.Mui-focused fieldset': { borderColor: GOLD }
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: GOLD }
                        }}
                    />

                    {/* Quick Amount Chips */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {quickAmounts.map((amt) => (
                            <Chip
                                key={amt}
                                label={`₹${amt.toLocaleString('en-IN')}`}
                                onClick={() => setAmountToAdd(amt.toString())}
                                sx={{
                                    px: 2,
                                    py: 2.5,
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    bgcolor: amountToAdd === amt.toString() ? BLACK : LIGHT_GRAY,
                                    color: amountToAdd === amt.toString() ? WHITE : BLACK,
                                    border: `1px solid ${BORDER_GRAY}`,
                                    '&:hover': { bgcolor: amountToAdd === amt.toString() ? BLACK : BORDER_GRAY }
                                }}
                            />
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button onClick={() => setOpenAddFunds(false)} sx={{ color: '#666', fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddFunds}
                        variant="contained"
                        disabled={!amountToAdd || parseFloat(amountToAdd) <= 0}
                        sx={{
                            px: 4,
                            py: 1.5,
                            bgcolor: BLACK,
                            color: WHITE,
                            fontWeight: 700,
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#333' },
                            '&:disabled': { bgcolor: BORDER_GRAY }
                        }}
                    >
                        Add {amountToAdd ? formatCurrency(parseFloat(amountToAdd)) : 'Money'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Wallet;
