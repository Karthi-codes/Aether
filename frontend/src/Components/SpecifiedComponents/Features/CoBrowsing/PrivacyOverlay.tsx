import React from 'react';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import HttpsIcon from '@mui/icons-material/Https';

interface PrivacyOverlayProps {
  isVisible: boolean;
  message?: string;
}

const PrivacyOverlay: React.FC<PrivacyOverlayProps> = ({ isVisible, message = "Partner is in a private area" }) => {
  return (
    <Backdrop
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 9999,
        backdropFilter: 'blur(15px)',
        backgroundColor: 'rgba(255,255,255,0.7)', // Light theme blur
        flexDirection: 'column',
        gap: 3
      }}
      open={isVisible}
    >
        <Box sx={{ 
            p: 5, 
            bgcolor: 'white', 
            borderRadius: 6, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            maxWidth: '400px', 
            textAlign: 'center', 
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: '1px solid rgba(233,30,99,0.1)'
        }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(233, 30, 99, 0.05)', borderRadius: '50%', mb: 2 }}>
                <HttpsIcon sx={{ fontSize: 40, color: '#E91E63' }} /> {/* Pink Lock */}
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#333', fontFamily: '"Playfair Display", serif' }}>
                Private Moment 🙈
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
                {message || "Your partner is viewing a private page."}
            </Typography>
            <Typography variant="body2" sx={{ color: '#E91E63', mt: 3, fontWeight: 500 }}>
                Waiting for them to return...
            </Typography>
            <CircularProgress size={24} sx={{ mt: 2, color: '#E91E63' }} />
        </Box>
    </Backdrop>
  );
};

export default PrivacyOverlay;
