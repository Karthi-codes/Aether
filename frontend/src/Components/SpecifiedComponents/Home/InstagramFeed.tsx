import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const images = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop'
];

const InstagramFeed: React.FC = () => {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="xl" sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="body1" sx={{ color: '#666' }}>@Aether Follow Us On Instagram</Typography>
      </Container>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' } }}>
        {images.map((url, i) => (
          <Box 
            key={i}
            sx={{ 
              height: 250, 
              backgroundImage: `url(${url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              cursor: 'pointer',
              position: 'relative',
              '&:hover::after': {
                content: '""',
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                bgcolor: 'rgba(0,0,0,0.3)'
              }
            }} 
          />
        ))}
      </Box>
    </Box>
  );
};

export default InstagramFeed;
