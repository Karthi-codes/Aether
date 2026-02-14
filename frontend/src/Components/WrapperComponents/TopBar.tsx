import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';

const scrollAnimation = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const offers = [
  "SEASON SALE: UP TO 50% OFF SELECT STYLES",
  "NEW ARRIVALS JUST DROPPED • SHOP NOW",
  "SIGN UP FOR EXCLUSIVE ACCESS TO NEW DROPS",
  "LIMITED TIME OFFER: BUY 2 GET 10% OFF"
];

const TopBar: React.FC = () => {
  return (
    <Box sx={{ 
      bgcolor: 'black', 
      color: 'white', 
      py: 0.8, 
      overflow: 'hidden', 
      whiteSpace: 'nowrap',
      position: 'relative',
      zIndex: 10
    }}>
      <Box sx={{ 
        display: 'inline-flex', 
        animation: `${scrollAnimation} 30s linear infinite`,
        width: 'max-content',
        '&:hover': {
          animationPlayState: 'paused'
        }
      }}>
        {/* Duplicating the offers array to create a seamless infinite scroll effect */}
        {[...offers, ...offers].map((offer, index) => (
          <Typography 
            key={index} 
            component="span"
            variant="caption" 
            sx={{ 
              mx: 4, 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              letterSpacing: 1.5,
              display: 'inline-block' 
            }}
          >
            {offer}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default TopBar;
