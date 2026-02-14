import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';


const Newsletter: React.FC = () => {

  const [email, setEmail] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setSnackbarOpen(true);
    setEmail('');
    setError('');
  };

  const benefits = [
    { icon: <LocalShippingOutlinedIcon sx={{ fontSize: 28 }} />, title: 'Free Shipping', desc: 'On orders $200+' },
    { icon: <CardGiftcardOutlinedIcon sx={{ fontSize: 28 }} />, title: 'Exclusive Offers', desc: 'Members only' },
    { icon: <VerifiedOutlinedIcon sx={{ fontSize: 28 }} />, title: 'Early Access', desc: 'New arrivals' },
    { icon: <DiamondOutlinedIcon sx={{ fontSize: 28 }} />, title: 'VIP Rewards', desc: 'Earn points' }
  ];

  return (
    <Box
      sx={{
        py: { xs: 10, md: 14 },
        background: 'linear-gradient(180deg, #ffffff 0%, #f5f0e8 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Decorative Text */}
      <Typography
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: { xs: '6rem', md: '15rem' },
          fontWeight: 900,
          color: 'rgba(0,0,0,0.06)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          fontFamily: '"Playfair Display", serif'
        }}
      >
        AETHER
      </Typography>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Benefits Bar */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 2, md: 4 },
            mb: 10,
            justifyContent: 'center'
          }}
        >
          {benefits.map((benefit, index) => (
            <Box
              key={index}
              sx={{
                flex: { xs: '1 1 45%', md: '1 1 20%' },
                maxWidth: { xs: '45%', md: '24%' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 1.5,
                p: 3,
                borderRadius: 3,
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: 'white',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Box sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#D5A249',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {benefit.icon}
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>{benefit.title}</Typography>
                <Typography variant="caption" color="text.secondary">{benefit.desc}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Newsletter Form */}
        <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
          {/* Decorative Element */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 3 }}>
            <Box sx={{ width: 60, height: 1, bgcolor: '#D5A249' }} />
            <Typography sx={{ color: '#D5A249', letterSpacing: 4, fontSize: '0.7rem', fontWeight: 600 }}>
              JOIN THE FAMILY
            </Typography>
            <Box sx={{ width: 60, height: 1, bgcolor: '#D5A249' }} />
          </Box>

          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 400,
              '& span': { fontStyle: 'italic', fontWeight: 300 }
            }}
          >
            Subscribe & <span>Save 15%</span>
          </Typography>

          <Typography
            sx={{
              mb: 5,
              color: 'text.secondary',
              lineHeight: 1.8
            }}
          >
            Be the first to know about new collections, exclusive offers, and style inspiration
            delivered straight to your inbox.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              gap: 0,
              maxWidth: 500,
              mx: 'auto',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <TextField
              fullWidth
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={!!error}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  borderRadius: 0,
                  '& fieldset': { border: 'none' },
                  color: 'inherit'
                },
                '& .MuiOutlinedInput-input': {
                  py: 2.5,
                  px: 3,
                  '&::placeholder': {
                    color: 'inherit'
                  }
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                px: 4,
                bgcolor: '#2C2C2C',
                color: 'white',
                fontWeight: 700,
                borderRadius: 0,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#D5A249', color: '#0a0a0a' }
              }}
            >
              SUBSCRIBE
            </Button>
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 2, fontSize: '0.85rem' }}>
              {error}
            </Typography>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </Typography>
        </Box>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{
            bgcolor: '#2C2C2C',
            color: 'white',
            '& .MuiAlert-icon': { color: '#D5A249' },
            borderRadius: 2
          }}
        >
          Welcome to AETHER! Check your inbox for your 15% discount code 🎉
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Newsletter;
