import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined';
import HeadphonesOutlinedIcon from '@mui/icons-material/HeadphonesOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';

const features = [
    {
        icon: <LocalShippingOutlinedIcon sx={{ fontSize: 40 }} />,
        title: 'Free Shipping',
        description: 'On all orders over $200'
    },
    {
        icon: <HttpsOutlinedIcon sx={{ fontSize: 40 }} />,
        title: 'Secure Payment',
        description: '100% secure payment'
    },
    {
        icon: <ReplayOutlinedIcon sx={{ fontSize: 40 }} />,
        title: '30 Day Returns',
        description: 'If goods have problems'
    },
    {
        icon: <HeadphonesOutlinedIcon sx={{ fontSize: 40 }} />,
        title: '24/7 Support',
        description: 'Dedicated support'
    }
];

const Features: React.FC = () => {
  return (
    <Box sx={{ py: 8, bgcolor: '#f9f9f9', borderTop: '1px solid #eee' }}>
      <Container maxWidth="xl">
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: { xs: 3, md: 4 },
            justifyContent: 'center'
          }}
        >
          {features.map((feature) => (
            <Box 
              key={feature.title}
              sx={{ 
                flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' },
                maxWidth: { xs: '100%', sm: '48%', md: '24%' },
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                justifyContent: { xs: 'center', md: 'flex-start' } 
              }}
            >
              <Box sx={{ color: '#D5A249' }}>
                {feature.icon}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Features;
