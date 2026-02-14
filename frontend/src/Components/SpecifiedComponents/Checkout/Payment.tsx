import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Stepper, Step, StepLabel, Dialog, DialogContent, CircularProgress, Alert, Paper, Divider, Chip, Fade, Zoom,
  InputAdornment, Collapse, FormControl, Select, MenuItem
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShieldIcon from '@mui/icons-material/Shield';

import { useCart } from '../../../context/CartContext';
import { useCheckout } from '../../../context/CheckoutContext';
import { useAuth } from '../../../context/AuthContext';
import { useScratchCards } from '../../../context/ScratchCardContext';
import { toast } from 'react-toastify';
import ScratchCardModal from '../Features/ScratchCardModal';
import QRCode from 'react-qr-code';

// Theme colors
const GOLD = '#D5A249';
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const LIGHT = '#F5F5F5';
const BORDER = '#E0E0E0';
const SUCCESS = '#4CAF50';


interface CardErrors {
  [key: string]: string;
}

// UPI App branding
// SVG Icons for Payment Apps
const GPayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.43 12.38H7.31v-1.6h5.16c-0.1-0.74-0.45-1.39-0.96-1.85-0.56-0.5-1.36-0.84-2.45-0.84-2.1 0-3.8 1.48-4.44 3.47h-0.03L2.9 10.12l-0.1 0.38c1.33-4.05 5.16-6.94 9.68-6.94 2.5 0 4.6 0.88 6.13 2.29l-1.9 1.9c-1.12-1.09-2.65-1.74-4.23-1.74-3.37 0-6.22 2.3-7.24 5.4l1.8 1.42c1.02-3.1 3.87-5.4 7.24-5.4 1.34 0 2.55 0.47 3.5 1.25l2.6-2.6C18.33 3.4 15.82 2.5 12.48 2.5c-5.38 0-9.92 3.47-11.45 8.35L1 10.87v0.06C2.55 15.77 7.15 19.3 12.48 19.3c5.44 0 10.15-3.66 11.52-8.7H12.43v1.78z" fill="#4285F4" />
    <path d="M12.43 12.38v1.6h7.22c-0.24 1.3-1.02 2.97-2.64 4.07l2.12 1.63c2.4-2.22 3.75-5.5 3.75-9.3 0-0.78-0.07-1.54-0.2-2.27l-10.25 0.27z" fill="#34A853" />
    <path d="M4.62 13.57l1.8-1.42c0.26 0.77 0.65 1.47 1.15 2.08L5.5 15.93C4.65 14.88 4.07 13.68 4.62 13.57z" fill="#FBBC05" />
    <path d="M16.7 15.7c-1.34 0.9-3.04 1.44-5 1.44-2.73 0-5.07-1.54-6.08-3.78l-1.8 1.42C5.55 17.9 9.25 21 13.9 21c2.62 0 4.8-0.86 6.43-2.35l-2.13-1.65-1.5 0.7z" fill="#EA4335" />
    {/* Adding a simple text representation or simplified path for GPay if full logo is complex */}
  </svg>
);

const PhonePeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#5F259F" />
    <path d="M14.5 7.5h-5c-0.8 0-1.5 0.7-1.5 1.5v6c0 0.8 0.7 1.5 1.5 1.5h5c0.8 0 1.5-0.7 1.5-1.5v-6c0-0.8-0.7-1.5-1.5-1.5z" stroke="white" strokeWidth="2" />
    <path d="M11 11.5l2 2" stroke="white" strokeWidth="2" />
    <path d="M13 11.5l-2 2" stroke="white" strokeWidth="2" />
  </svg>
);

const PaytmIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6h-16c-1.1 0-2 0.9-2 2v8c0 1.1 0.9 2 2 2h16c1.1 0 2-0.9 2-2v-8c0-1.1-0.9-2-2-2z" fill="#00BAF2" />
    <path d="M7 10h10" stroke="white" strokeWidth="2" />
    <path d="M7 14h6" stroke="white" strokeWidth="2" />
  </svg>
);

const BhimIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="2" fill="#00897B" />
    <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" />
    <path d="M12 9v6" stroke="white" strokeWidth="2" />
    <path d="M9 12h6" stroke="white" strokeWidth="2" />
  </svg>
);

// UPI App branding
const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', color: '#4285F4', logo: <GPayIcon />, tagline: 'A simple and secure way to pay' },
  { id: 'phonepe', name: 'PhonePe', color: '#5F259F', logo: <PhonePeIcon />, tagline: "India's #1 payment app" },
  { id: 'paytm', name: 'Paytm', color: '#00BAF2', logo: <PaytmIcon />, tagline: 'Superfast & secure' },
  { id: 'bhim', name: 'BHIM UPI', color: '#00897B', logo: <BhimIcon />, tagline: 'Powered by NPCI' },
];

const BANKS = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda',
  'Canara Bank', 'Union Bank of India', 'Indian Bank'
];


const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { totalPrice, totalItems, items, clearCart } = useCart();
  const { shippingInfo, createOrder, currentOrder } = useCheckout();
  const { user, token, updateUser, isAuthenticated } = useAuth();
  const { addScratchCard } = useScratchCards();

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [cardErrors, setCardErrors] = useState<CardErrors>({});
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [scratchCardData, setScratchCardData] = useState<{
    id: string;
    orderAmount: number;
    expiresAt: string;
  } | null>(null);

  // Card Data
  const [cardData, setCardData] = useState({
    cardNumber: '', cardName: '', expiry: '', cvv: ''
  });

  // UPI Data
  const [upiMethod, setUpiMethod] = useState<'vpa' | 'qr' | 'app'>('app');
  const [upiId, setUpiId] = useState('');
  const [upiIdError, setUpiIdError] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');

  // Net Banking
  const [selectedBank, setSelectedBank] = useState('');

  // Redirect if not authenticated, no shipping info, or empty cart
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue checkout');
      navigate('/login');
      return;
    }
    if (items.length === 0 && !currentOrder) {
      navigate('/checkout/cart');
    } else if (!shippingInfo && items.length > 0) {
      navigate('/checkout/shipping');
    }
  }, [items, shippingInfo, currentOrder, isAuthenticated, navigate]);

  const shippingMethod = shippingInfo?.shippingMethod || 'standard';
  const shippingCost = shippingInfo?.shippingCost || 0;
  const finalTotal = totalPrice + shippingCost;

  // UPI QR value
  const upiQrValue = `upi://pay?pa=aether@ybl&pn=AETHER&am=${finalTotal}&cu=INR&tn=Order-${Date.now()}`;

  // ─── Card helpers ───
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ').slice(0, 19) : '';
  };

  const formatExpiry = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    return cleaned;
  };

  const validateCard = (): boolean => {
    const errors: CardErrors = {};
    const cardNumber = cardData.cardNumber.replace(/\s/g, '');
    if (!cardNumber) errors.cardNumber = 'Card number is required';
    else if (cardNumber.length < 15 || cardNumber.length > 16) errors.cardNumber = 'Please enter a valid card number';
    if (!cardData.cardName.trim()) errors.cardName = 'Cardholder name is required';
    const expiry = cardData.expiry.replace('/', '');
    if (!expiry) errors.expiry = 'Expiry date is required';
    else if (expiry.length < 4) errors.expiry = 'Please enter a valid expiry date';
    else {
      const month = parseInt(expiry.slice(0, 2));
      const year = 2000 + parseInt(expiry.slice(2, 4));
      const now = new Date();
      if (month < 1 || month > 12) errors.expiry = 'Invalid month';
      else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1))
        errors.expiry = 'Card has expired';
    }
    if (!cardData.cvv) errors.cvv = 'CVV is required';
    else if (cardData.cvv.length < 3) errors.cvv = 'Please enter a valid CVV';
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'cardNumber') formattedValue = formatCardNumber(value);
    else if (name === 'expiry') formattedValue = formatExpiry(value);
    else if (name === 'cvv') formattedValue = value.replace(/\D/g, '').slice(0, 4);
    setCardData(prev => ({ ...prev, [name]: formattedValue }));
    if (cardErrors[name]) setCardErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ─── UPI validation ───
  const validateUpi = (): boolean => {
    if (upiMethod === 'vpa') {
      if (!upiId.trim()) { setUpiIdError('Please enter your UPI ID'); return false; }
      if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) { setUpiIdError('Enter a valid UPI ID (e.g., name@upi)'); return false; }
      setUpiIdError('');
    }
    return true;
  };

  // ─── Net Banking validation ───
  const validateNetBanking = (): boolean => {
    if (!selectedBank) { toast.error('Please select a bank'); return false; }
    return true;
  };

  // ─── Submit ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !token) { toast.error('Please login to complete your purchase'); navigate('/login'); return; }
    if (paymentMethod === 'card' && !validateCard()) return;
    if (paymentMethod === 'upi' && !validateUpi()) return;
    if (paymentMethod === 'netbanking' && !validateNetBanking()) return;
    if (paymentMethod === 'wallet' && (user?.walletBalance ?? 0) < finalTotal) { toast.error('Insufficient wallet balance'); return; }

    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      const localOrder = createOrder(items, paymentMethod);
      setOrderId(localOrder.id);

      try {
        const { apiService } = await import('../../../services/api.service');
        const result = await apiService.createOrder({
          items: items.map(item => ({
            productId: item.id, name: item.name, price: item.price,
            quantity: item.quantity, image: item.image
          })),
          totalAmount: finalTotal,
          shippingAddress: shippingInfo,
          paymentMethod: paymentMethod
        }, token);

        if (paymentMethod === 'wallet' && result.newWalletBalance !== undefined) {
          updateUser({ walletBalance: result.newWalletBalance });
        }

        if (result.scratchCard) {
          const cardData = {
            id: result.scratchCard.id,
            orderAmount: result.scratchCard.orderAmount,
            expiresAt: result.scratchCard.expiresAt
          };
          setScratchCardData(cardData);
          addScratchCard({ ...cardData, isScratched: false, isRedeemed: false });
          toast.success('🎉 You earned cashback! Check your Rewards!', { position: 'top-center', autoClose: 5000 });
        } else {
          toast.success('Order placed successfully!');
        }
      } catch (apiError: any) {
        console.error('Backend API order error:', apiError);
        if (apiError.message) toast.error(apiError.message);
        if (finalTotal >= 100) {
          const demoCard = {
            id: 'demo-' + Date.now(),
            orderAmount: finalTotal,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          setScratchCardData(demoCard);
          addScratchCard({ ...demoCard, isScratched: false, isRedeemed: false });
          toast.success('🎉 You earned cashback! Check your Rewards!', { position: 'top-center', autoClose: 5000 });
        } else {
          toast.error('Order placed, but failed to generate reward. continuing...');
        }
      }

      clearCart();
      setIsProcessing(false);
      setIsSuccess(true);
    } catch (error: any) {
      setIsProcessing(false);
      console.error('Order creation failed:', error);
      toast.error(error.message || 'Failed to create order. Please try again.');
    }
  };

  const handleSuccessClose = () => navigate('/');

  const getPaymentMethodLabel = () => {
    switch (paymentMethod) {
      case 'upi': return upiMethod === 'app' ? UPI_APPS.find(a => a.id === selectedUpiApp)?.name || 'UPI' : 'UPI';
      case 'card': return 'Card';
      case 'wallet': return 'Aether Wallet';
      case 'netbanking': return selectedBank || 'Net Banking';
      default: return paymentMethod;
    }
  };

  // ─── Payment methods list ───
  const paymentMethods = [
    {
      id: 'upi', name: 'UPI',
      icon: <PhoneAndroidIcon />,
      description: 'GPay • PhonePe • Paytm • BHIM',
      badge: 'POPULAR'
    },
    {
      id: 'card', name: 'Card',
      icon: <CreditCardIcon />,
      description: 'Visa • Mastercard • RuPay',
      badge: null
    },
    {
      id: 'wallet', name: 'Wallet',
      icon: <AccountBalanceWalletIcon />,
      description: `Balance: ₹${user?.walletBalance?.toLocaleString('en-IN') || '0'}`,
      badge: null
    },
    {
      id: 'netbanking', name: 'Net Banking',
      icon: <AccountBalanceIcon />,
      description: 'All Indian banks supported',
      badge: null
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Stepper */}
      <Stepper activeStep={2} sx={{
        mb: 6,
        '& .MuiStepIcon-root.Mui-active': { color: GOLD },
        '& .MuiStepIcon-root.Mui-completed': { color: BLACK }
      }}>
        <Step completed><StepLabel>Cart</StepLabel></Step>
        <Step completed><StepLabel>Shipping</StepLabel></Step>
        <Step><StepLabel>Payment</StepLabel></Step>
      </Stepper>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {/* Left: Payment Form */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 58%' }, maxWidth: { md: '62%' } }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>

            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
              <ShieldIcon sx={{ color: SUCCESS, fontSize: 28 }} />
              <Box>
                <Typography variant="h5" fontWeight={700}>Select Payment Method</Typography>
                <Typography variant="body2" color="text.secondary">All transactions are encrypted and secure</Typography>
              </Box>
            </Box>

            {/* Payment Method Selector */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
              {paymentMethods.map((method, index) => (
                <Zoom in timeout={200 + index * 100} key={method.id}>
                  <Paper
                    elevation={0}
                    onClick={() => setPaymentMethod(method.id)}
                    sx={{
                      flex: '1 1 calc(50% - 12px)',
                      minWidth: '140px',
                      p: 2.5,
                      border: paymentMethod === method.id ? `2px solid ${BLACK}` : `1px solid ${BORDER}`,
                      borderRadius: 3,
                      cursor: 'pointer',
                      bgcolor: paymentMethod === method.id ? '#FAFAFA' : WHITE,
                      transition: 'all 0.25s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        bgcolor: '#FAFAFA',
                        borderColor: paymentMethod === method.id ? BLACK : '#999',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    {method.badge && (
                      <Chip
                        label={method.badge}
                        size="small"
                        sx={{
                          position: 'absolute', top: 8, right: 8,
                          bgcolor: GOLD, color: BLACK,
                          fontWeight: 800, fontSize: '0.6rem', height: 20,
                          letterSpacing: '0.5px'
                        }}
                      />
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        p: 1, borderRadius: 2,
                        bgcolor: paymentMethod === method.id ? BLACK : LIGHT,
                        color: paymentMethod === method.id ? GOLD : '#555',
                        display: 'flex', transition: 'all 0.25s'
                      }}>
                        {method.icon}
                      </Box>
                      <Box>
                        <Typography fontWeight={700} sx={{ fontSize: '0.95rem', color: paymentMethod === method.id ? BLACK : '#555' }}>
                          {method.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999', lineHeight: 1.2 }}>
                          {method.description}
                        </Typography>
                      </Box>
                    </Box>
                    {paymentMethod === method.id && (
                      <CheckCircleIcon sx={{
                        position: 'absolute', bottom: 8, right: 8,
                        color: SUCCESS, fontSize: 20
                      }} />
                    )}
                  </Paper>
                </Zoom>
              ))}
            </Box>

            {/* ═══════════════════════════════════════════ */}
            {/* UPI Payment Section                         */}
            {/* ═══════════════════════════════════════════ */}
            <Collapse in={paymentMethod === 'upi'}>
              <Fade in={paymentMethod === 'upi'}>
                <Box sx={{ mt: 2, p: 3, bgcolor: WHITE, borderRadius: 3, border: `1px solid ${BORDER}` }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneAndroidIcon sx={{ color: GOLD }} />
                    Pay via UPI
                  </Typography>

                  {/* Sub-method tabs */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    {[
                      { key: 'app', label: 'UPI App', icon: '📱' },
                      { key: 'vpa', label: 'UPI ID', icon: '🆔' },
                      { key: 'qr', label: 'QR Code', icon: '📷' }
                    ].map(tab => (
                      <Chip
                        key={tab.key}
                        label={`${tab.icon} ${tab.label}`}
                        onClick={() => setUpiMethod(tab.key as 'vpa' | 'qr' | 'app')}
                        sx={{
                          bgcolor: upiMethod === tab.key ? BLACK : LIGHT,
                          color: upiMethod === tab.key ? WHITE : '#555',
                          fontWeight: 600, fontSize: '0.85rem', px: 1,
                          cursor: 'pointer', border: `1px solid ${upiMethod === tab.key ? BLACK : BORDER}`,
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: upiMethod === tab.key ? '#333' : '#ECECEC'
                          }
                        }}
                      />
                    ))}
                  </Box>

                  {/* UPI App Selection */}
                  {upiMethod === 'app' && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                      {UPI_APPS.map(app => (
                        <Paper
                          key={app.id}
                          elevation={0}
                          onClick={() => setSelectedUpiApp(app.id)}
                          sx={{
                            p: 2, borderRadius: 2.5,
                            border: selectedUpiApp === app.id ? `2px solid ${app.color}` : `1px solid ${BORDER}`,
                            cursor: 'pointer',
                            bgcolor: selectedUpiApp === app.id ? `${app.color}08` : WHITE,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: app.color, bgcolor: `${app.color}05` }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center' }}>{app.logo}</Box>
                            <Box>
                              <Typography fontWeight={700} sx={{ fontSize: '0.9rem' }}>{app.name}</Typography>
                              <Typography variant="caption" sx={{ color: '#999' }}>{app.tagline}</Typography>
                            </Box>
                            {selectedUpiApp === app.id && (
                              <VerifiedIcon sx={{ ml: 'auto', color: app.color, fontSize: 20 }} />
                            )}
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {/* UPI VPA */}
                  {upiMethod === 'vpa' && (
                    <Box>
                      <TextField
                        fullWidth
                        label="UPI ID"
                        placeholder="yourname@okicici, yourname@ybl, 9876543210@paytm"
                        value={upiId}
                        onChange={(e) => { setUpiId(e.target.value); setUpiIdError(''); }}
                        error={!!upiIdError}
                        helperText={upiIdError || 'Enter your UPI Virtual Payment Address'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography sx={{ color: GOLD, fontWeight: 700 }}>UPI</Typography>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused fieldset': { borderColor: GOLD }
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: GOLD }
                        }}
                      />
                      <Alert severity="info" icon={<LockIcon sx={{ fontSize: 18 }} />} sx={{ mt: 2, borderRadius: 2, bgcolor: LIGHT }}>
                        A payment request will be sent to your UPI app. Open the app to approve.
                      </Alert>
                    </Box>
                  )}

                  {/* QR Code */}
                  {upiMethod === 'qr' && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{
                        display: 'inline-flex', p: 3, bgcolor: WHITE, borderRadius: 3,
                        border: `2px solid ${BORDER}`, mb: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                      }}>
                        <QRCode value={upiQrValue} size={200} level="H" />
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        Scan with any UPI app
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 2 }}>
                        Google Pay • PhonePe • Paytm • BHIM • Any UPI App
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Typography variant="h4" fontWeight={800} sx={{ color: BLACK }}>
                          ₹{finalTotal.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                      <Chip
                        label="UPI ID: aether@ybl"
                        icon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                        onClick={() => { navigator.clipboard.writeText('aether@ybl'); toast.success('UPI ID copied!'); }}
                        sx={{
                          mt: 2, bgcolor: LIGHT, fontWeight: 600, cursor: 'pointer',
                          '&:hover': { bgcolor: BORDER }
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Fade>
            </Collapse>

            {/* ═══════════════════════════════════════════ */}
            {/* Card Payment Section                        */}
            {/* ═══════════════════════════════════════════ */}
            <Collapse in={paymentMethod === 'card'}>
              <Fade in={paymentMethod === 'card'}>
                <Box sx={{ mt: 2, p: 3, bgcolor: WHITE, borderRadius: 3, border: `1px solid ${BORDER}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <LockIcon fontSize="small" sx={{ color: SUCCESS }} />
                    <Typography variant="subtitle1" fontWeight={700}>Secure Card Payment</Typography>
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                      <Typography variant="caption" sx={{ bgcolor: '#1A1F71', color: WHITE, px: 1, py: 0.3, borderRadius: 1, fontWeight: 700 }}>VISA</Typography>
                      <Typography variant="caption" sx={{ bgcolor: '#EB001B', color: WHITE, px: 1, py: 0.3, borderRadius: 1, fontWeight: 700 }}>MC</Typography>
                      <Typography variant="caption" sx={{ bgcolor: '#097A44', color: WHITE, px: 1, py: 0.3, borderRadius: 1, fontWeight: 700 }}>RuPay</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 100%' }}>
                      <TextField fullWidth required label="Card Number" name="cardNumber"
                        placeholder="1234 5678 9012 3456" value={cardData.cardNumber}
                        onChange={handleCardChange} error={!!cardErrors.cardNumber}
                        helperText={cardErrors.cardNumber} inputProps={{ maxLength: 19 }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: GOLD } } }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 100%' }}>
                      <TextField fullWidth required label="Cardholder Name" name="cardName"
                        placeholder="JOHN DOE" value={cardData.cardName}
                        onChange={handleCardChange} error={!!cardErrors.cardName}
                        helperText={cardErrors.cardName}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: GOLD } } }}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 45%' } }}>
                      <TextField fullWidth required label="Expiry Date" name="expiry"
                        placeholder="MM/YY" value={cardData.expiry}
                        onChange={handleCardChange} error={!!cardErrors.expiry}
                        helperText={cardErrors.expiry} inputProps={{ maxLength: 5 }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: GOLD } } }}
                      />
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 45%' } }}>
                      <TextField fullWidth required label="CVV" name="cvv" type="password"
                        placeholder="•••" value={cardData.cvv}
                        onChange={handleCardChange} error={!!cardErrors.cvv}
                        helperText={cardErrors.cvv} inputProps={{ maxLength: 4 }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: GOLD } } }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </Collapse>

            {/* ═══════════════════════════════════════════ */}
            {/* Wallet Payment Section                      */}
            {/* ═══════════════════════════════════════════ */}
            <Collapse in={paymentMethod === 'wallet'}>
              <Fade in={paymentMethod === 'wallet'}>
                <Box sx={{ mt: 2, p: 3, bgcolor: WHITE, borderRadius: 3, border: `1px solid ${BORDER}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#FFF8E1', borderRadius: '50%', color: GOLD }}>
                        <AccountBalanceWalletIcon fontSize="large" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>Aether Wallet</Typography>
                        <Typography variant="body2" color="text.secondary">Instant payment, zero fees</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" display="block" color="text.secondary">AVAILABLE BALANCE</Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ color: GOLD, fontFamily: '"DM Sans", monospace' }}>
                        ₹{user?.walletBalance?.toLocaleString('en-IN') || '0.00'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {(user?.walletBalance ?? 0) >= finalTotal ? (
                    <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />} sx={{ borderRadius: 2 }}>
                      <Typography fontWeight={600}>Balance covers this purchase.</Typography>
                      The amount of <strong>₹{finalTotal.toLocaleString('en-IN')}</strong> will be deducted instantly.
                    </Alert>
                  ) : (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      <Typography fontWeight={600}>Insufficient Funds</Typography>
                      You need <strong>₹{(finalTotal - (user?.walletBalance || 0)).toLocaleString('en-IN')}</strong> more.
                      <Button size="small" onClick={() => navigate('/wallet')} sx={{ ml: 1, color: GOLD, fontWeight: 700 }}>
                        Add Funds →
                      </Button>
                    </Alert>
                  )}
                </Box>
              </Fade>
            </Collapse>

            {/* ═══════════════════════════════════════════ */}
            {/* Net Banking Section                         */}
            {/* ═══════════════════════════════════════════ */}
            <Collapse in={paymentMethod === 'netbanking'}>
              <Fade in={paymentMethod === 'netbanking'}>
                <Box sx={{ mt: 2, p: 3, bgcolor: WHITE, borderRadius: 3, border: `1px solid ${BORDER}` }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceIcon sx={{ color: GOLD }} />
                    Select Your Bank
                  </Typography>

                  {/* Popular Banks Grid */}
                  <Typography variant="caption" sx={{ color: '#999', mb: 1.5, display: 'block', fontWeight: 600, letterSpacing: '0.5px' }}>
                    POPULAR BANKS
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 3 }}>
                    {BANKS.slice(0, 6).map(bank => (
                      <Paper
                        key={bank}
                        elevation={0}
                        onClick={() => setSelectedBank(bank)}
                        sx={{
                          p: 2, borderRadius: 2,
                          border: selectedBank === bank ? `2px solid ${GOLD}` : `1px solid ${BORDER}`,
                          cursor: 'pointer',
                          bgcolor: selectedBank === bank ? 'rgba(213,162,73,0.05)' : WHITE,
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: GOLD, bgcolor: 'rgba(213,162,73,0.03)' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <AccountBalanceIcon sx={{ color: selectedBank === bank ? GOLD : '#999', fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={selectedBank === bank ? 700 : 500}>{bank}</Typography>
                          {selectedBank === bank && (
                            <CheckCircleIcon sx={{ ml: 'auto', color: GOLD, fontSize: 18 }} />
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>

                  {/* Other banks dropdown */}
                  <Typography variant="caption" sx={{ color: '#999', mb: 1, display: 'block', fontWeight: 600, letterSpacing: '0.5px' }}>
                    OTHER BANKS
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={BANKS.slice(6).includes(selectedBank) ? selectedBank : ''}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      displayEmpty
                      sx={{ borderRadius: 2, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GOLD } }}
                    >
                      <MenuItem value="" disabled>Select another bank...</MenuItem>
                      {BANKS.slice(6).map(bank => (
                        <MenuItem key={bank} value={bank}>{bank}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Alert severity="info" icon={<LockIcon sx={{ fontSize: 18 }} />} sx={{ mt: 2, borderRadius: 2, bgcolor: LIGHT }}>
                    You'll be redirected to your bank's secure portal to complete the payment.
                  </Alert>
                </Box>
              </Fade>
            </Collapse>

            {/* Shipping Summary */}
            {shippingInfo && (
              <Box sx={{ mt: 4, p: 3, bgcolor: LIGHT, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Shipping To:</Typography>
                <Typography variant="body2">
                  {shippingInfo.firstName} {shippingInfo.lastName}<br />
                  {shippingInfo.address}{shippingInfo.apartment && `, ${shippingInfo.apartment}`}<br />
                  {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                  {shippingInfo.email} • {shippingInfo.phone}
                </Typography>
              </Box>
            )}

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/checkout/shipping')}
                sx={{ px: 4, borderColor: BLACK, color: BLACK, borderRadius: 2, fontWeight: 600 }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isProcessing}
                sx={{
                  px: 6, py: 1.5, bgcolor: BLACK, color: WHITE, fontWeight: 700, borderRadius: 2,
                  fontSize: '1rem', letterSpacing: '0.5px',
                  '&:hover': { bgcolor: '#333' },
                  '&:disabled': { bgcolor: '#e0e0e0' }
                }}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${finalTotal.toLocaleString('en-IN')}`}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Right: Order Summary */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, maxWidth: { md: '38%' } }}>
          <Box sx={{ bgcolor: WHITE, borderRadius: 3, p: 3, position: 'sticky', top: 100, border: `1px solid ${BORDER}` }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Order Summary</Typography>

            {/* Items preview */}
            <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2, pr: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: BORDER, borderRadius: 2 } }}>
              {items.map(item => (
                <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Box sx={{ width: 50, height: 50, borderRadius: 1.5, overflow: 'hidden', border: `1px solid ${BORDER}`, flexShrink: 0 }}>
                    <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{item.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Qty: {item.quantity}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography color="text.secondary" variant="body2">Subtotal ({totalItems} items)</Typography>
              <Typography fontWeight={600} variant="body2">₹{totalPrice.toLocaleString('en-IN')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography color="text.secondary" variant="body2">Shipping ({shippingMethod})</Typography>
              <Typography fontWeight={600} variant="body2" sx={{ color: shippingCost === 0 ? SUCCESS : 'inherit' }}>
                {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString('en-IN')}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography color="text.secondary" variant="body2">Paying via</Typography>
              <Chip label={getPaymentMethodLabel()} size="small" sx={{ bgcolor: LIGHT, fontWeight: 600, fontSize: '0.75rem' }} />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={800}>Total</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: BLACK }}>₹{finalTotal.toLocaleString('en-IN')}</Typography>
            </Box>

            {/* Security badge */}
            <Box sx={{ mt: 4, p: 2.5, bgcolor: LIGHT, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ShieldIcon fontSize="small" sx={{ color: SUCCESS }} />
                <Typography variant="caption" fontWeight={700}>100% Secure Payment</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                Protected by 256-bit SSL encryption. RBI compliant. Your card details are never stored.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                <Chip label="🔒 SSL" size="small" sx={{ bgcolor: WHITE, fontSize: '0.65rem', height: 22 }} />
                <Chip label="🏦 RBI" size="small" sx={{ bgcolor: WHITE, fontSize: '0.65rem', height: 22 }} />
                <Chip label="🛡️ PCI DSS" size="small" sx={{ bgcolor: WHITE, fontSize: '0.65rem', height: 22 }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Processing/Success Dialog */}
      <Dialog
        open={isProcessing || isSuccess}
        PaperProps={{
          sx: { p: 4, textAlign: 'center', minWidth: { xs: '90%', sm: 420 }, borderRadius: 4 }
        }}
      >
        <DialogContent>
          {isProcessing && (
            <>
              <Box sx={{
                display: 'inline-flex', p: 3, borderRadius: '50%',
                bgcolor: LIGHT, mb: 3
              }}>
                <CircularProgress size={50} sx={{ color: GOLD }} />
              </Box>
              <Typography variant="h5" fontWeight={700}>Processing Payment...</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please wait while we securely process your order
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                <Chip label="🔒 Encrypted" size="small" sx={{ bgcolor: LIGHT }} />
                <Chip label="🛡️ Secure" size="small" sx={{ bgcolor: LIGHT }} />
              </Box>
            </>
          )}
          {isSuccess && (
            <>
              <Zoom in timeout={600}>
                <CheckCircleIcon sx={{ fontSize: 90, color: SUCCESS, mb: 2 }} />
              </Zoom>
              <Typography variant="h4" fontWeight={700}>Order Confirmed!</Typography>
              <Typography variant="body1" sx={{ mt: 2, mb: 0.5 }}>
                Order ID: <strong>{orderId}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Paid via {getPaymentMethodLabel()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                We've sent a confirmation email with your order details.
                Thank you for shopping with AETHER!
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSuccessClose}
                sx={{ bgcolor: BLACK, py: 1.5, fontWeight: 700, borderRadius: 2 }}
              >
                Continue Shopping
              </Button>
              {scratchCardData && (
                <Typography variant="caption" sx={{ display: 'block', mt: 2, color: GOLD, fontWeight: 600 }}>
                  🎉 You won a scratch card! Check the popup.
                </Typography>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Scratch Card Modal */}
      <ScratchCardModal
        open={showScratchCard}
        onClose={() => setShowScratchCard(false)}
        scratchCardData={scratchCardData}
        onRedeem={(amount) => {
          toast.success(`₹${amount.toLocaleString('en-IN')} added to your wallet!`);
        }}
      />
    </Container>
  );
};

export default Payment;
