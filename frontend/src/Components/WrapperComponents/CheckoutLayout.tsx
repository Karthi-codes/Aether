import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { Outlet, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';


const CheckoutLayout: React.FC = () => {


  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* Minimal Header */}
      <Paper elevation={0} sx={{ bgcolor: 'white', py: 2, borderBottom: '1px solid #eee' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src={logo}
                alt="Aether Logo"
                sx={{
                  height: 40,
                  width: 'auto',
                  filter: 'none'
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '1px',
                  fontFamily: '"Playfair Display", serif'
                }}
              >
                AETHER
              </Typography>
            </Box>
          </Link>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* Simple Footer */}
      <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary', bgcolor: 'white', borderTop: '1px solid #eee' }}>
        <Typography variant="caption">© 2024 AETHER. All rights reserved.</Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 3, justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
            Privacy Policy
          </Typography>
          <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
            Terms of Service
          </Typography>
          <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
            Contact
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CheckoutLayout;
