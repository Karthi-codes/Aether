import React from 'react';
import { Box, Container, Typography, Stack, IconButton } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import logo from '../../assets/logo.png';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'white', color: 'black', pt: { xs: 4, md: 8 }, pb: { xs: 2, md: 4 }, borderTop: '1px solid #eee', position: 'relative', overflow: 'hidden' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Logo Section */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 25%' }, mb: { xs: 4, md: 0 } }}>

             <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', maxWidth: 250 }}>
               Premium fashion for the modern individual. Quality meets style.
             </Typography>
          </Box>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Links Columns */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 3, md: 6 }, flex: { xs: '1 1 100%', md: '0 0 auto' } }}>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, fontSize: '0.85rem' }}>SHOP</Typography>
              <Stack spacing={1}>
                {['New Arrivals', 'Men', 'Women', 'Accessories', 'Sale'].map(item => (
                  <Typography key={item} variant="body2" sx={{ color: '#666', cursor: 'pointer', fontSize: '0.8rem', '&:hover': { color: 'black' } }}>{item}</Typography>
                ))}
              </Stack>
            </Box>

            <Box sx={{ minWidth: 120 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, fontSize: '0.85rem' }}>INFORMATION</Typography>
              <Stack spacing={1}>
                {['About Us', 'Contact Us', 'Terms & Conditions', 'Privacy Policy'].map(item => (
                  <Typography key={item} variant="body2" sx={{ color: '#666', cursor: 'pointer', fontSize: '0.8rem', '&:hover': { color: 'black' } }}>{item}</Typography>
                ))}
              </Stack>
            </Box>

             <Box sx={{ minWidth: 120 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, fontSize: '0.85rem' }}>CUSTOMER SERVICE</Typography>
              <Stack spacing={1}>
                {['Search Terms', 'Orders and Returns', 'Contact Us', 'FAQs'].map(item => (
                  <Typography key={item} variant="body2" sx={{ color: '#666', cursor: 'pointer', fontSize: '0.8rem', '&:hover': { color: 'black' } }}>{item}</Typography>
                ))}
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Socials & Bottom */}
        <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid #eee', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#999' }}>© 2024 Aether. All rights reserved.</Typography>
          
          <Stack direction="row" spacing={1}>
            <IconButton size="small" sx={{ color: '#999', '&:hover': { color: 'black' } }}><FacebookIcon fontSize="small" /></IconButton>
            <IconButton size="small" sx={{ color: '#999', '&:hover': { color: 'black' } }}><TwitterIcon fontSize="small" /></IconButton>
            <IconButton size="small" sx={{ color: '#999', '&:hover': { color: 'black' } }}><InstagramIcon fontSize="small" /></IconButton>
            <IconButton size="small" sx={{ color: '#999', '&:hover': { color: 'black' } }}><YouTubeIcon fontSize="small" /></IconButton>
          </Stack>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
             {['VISA', 'MC', 'AMEX', 'PAYPAL'].map(p => (
               <Box key={p} sx={{ bgcolor: '#eee', px: 1, py: 0.5, fontSize: '0.6rem', fontWeight: 700, color: '#666', borderRadius: 0.5 }}>
                 {p}
               </Box>
             ))}
          </Box>
        </Box>
      </Container>

      
      
      {/* Background Decorative Logo */}
      <Box
        component="img"
        src={logo}
        alt=""
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '100%', md: '70%' },
          opacity: 0.6,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
    </Box>
  );
};

export default Footer;
