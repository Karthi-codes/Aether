import React from 'react';
import { Box, Container, Typography,  } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SplitBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Left Banner */}
          <Box
            key="left-banner"
            onClick={() => navigate('/shop')}
            data-cursor="discover"
            sx={{
              flex: 1,
              width: '100%',
              height: { xs: 250, sm: 300, md: 400 },
              bgcolor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              px: { xs: 4, md: 8 },
              backgroundImage: 'url("https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=1000&auto=format&fit=crop")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'none',
              transition: 'transform 0.5s',
              '&:hover': {
                transform: 'scale(0.98)'
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
              <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 600 }}>NEW ARRIVALS</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, mb: 3, maxWidth: 300, fontSize: { xs: '2rem', md: '3rem' } }}>
                TOUCH OF<br />COLOR
              </Typography>
              
            </Box>
          </Box>

          {/* Right Banner */}
          <Box
            key="right-banner"
            onClick={() => navigate('/shop')}
            data-cursor="discover"
            sx={{
              flex: 1,
              width: '100%',
              height: { xs: 250, sm: 300, md: 400 },
              bgcolor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              textAlign: 'right',
              px: { xs: 4, md: 8 },
              backgroundImage: 'url("https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'none',
              transition: 'transform 0.5s',
              '&:hover': {
                transform: 'scale(0.98)'
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
              <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 600 }}>NEW FOR AUTUMN</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, mb: 3, maxWidth: 400, fontSize: { xs: '2rem', md: '3rem' } }}>
                THIS SEASON'S<br />BOMBER JACKETS
              </Typography>
             
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SplitBanner;
