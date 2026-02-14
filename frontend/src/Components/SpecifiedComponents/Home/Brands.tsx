import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { keyframes } from '@mui/system';
import { useCoBrowse } from '../Features/CoBrowsing/CoBrowseContext';

// Infinite scroll animation
const scroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

// Brand logos - using text-based logos for reliability
const brands = [
  { name: 'NIKE', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png' },
  { name: 'ADIDAS', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/200px-Adidas_Logo.svg.png' },
  { name: 'ZARA', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/200px-Zara_Logo.svg.png' },
  { name: 'H&M', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/200px-H%26M-Logo.svg.png' },
  { name: 'LEVIS', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Levi%27s_logo.svg/200px-Levi%27s_logo.svg.png' },
  { name: 'USPA', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6d/U.S._Polo_Assn._logo.svg/200px-U.S._Polo_Assn._logo.svg.png' },
  { name: 'PUMA', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Puma_logo.svg/200px-Puma_logo.svg.png' },
  { name: 'GUCCI', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/1960s_Gucci_Logo.svg/200px-1960s_Gucci_Logo.svg.png' },
  { name: 'TOMMY', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Tommy_Hilfiger_wordmark.svg/200px-Tommy_Hilfiger_wordmark.svg.png' },
  { name: 'CALVIN KLEIN', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Calvin_Klein_logo.svg/200px-Calvin_Klein_logo.svg.png' },
];

const Brands: React.FC = () => {
  // Duplicate brands for seamless infinite scroll
  const duplicatedBrands = [...brands, ...brands];

  const { broadcast, lastEvent, sessionId } = useCoBrowse();
  const [localHover, setLocalHover] = useState(false);
  const [remoteHover, setRemoteHover] = useState(false);

  // Listen for remote hover events
  useEffect(() => {
    if (lastEvent?.type === 'SYNC_STATE' && lastEvent.payload?.action === 'BRAND_HOVER') {
      setRemoteHover(lastEvent.payload.isPaused);
    }
  }, [lastEvent]);

  const handleMouseEnter = () => {
    setLocalHover(true);
    if (sessionId) {
      broadcast('SYNC_STATE', { action: 'BRAND_HOVER', isPaused: true });
    }
  };

  const handleMouseLeave = () => {
    setLocalHover(false);
    if (sessionId) {
      broadcast('SYNC_STATE', { action: 'BRAND_HOVER', isPaused: false });
    }
  };

  const isPaused = localHover || remoteHover;

  return (
    <Box sx={{ py: 6, borderTop: '1px solid #eee', borderBottom: '1px solid #eee', overflow: 'hidden' }}>
      <Container maxWidth={false} sx={{ px: 0 }}>
        <Box 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{ 
            display: 'flex',
            animation: `${scroll} 25s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'fit-content',
            // Removed CSS hover to rely on JS state for sync
          }}
        >
          {duplicatedBrands.map((brand, index) => (
            <Box 
              key={`${brand.name}-${index}`}
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 180,
                height: 60,
                mx: 4,
                opacity: 0.5,
                filter: 'grayscale(100%)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 1,
                  filter: 'grayscale(0%)',
                }
              }}
            >
              <Box 
                component="img" 
                src={brand.logo} 
                alt={brand.name}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  // Fallback to text if image fails
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<span style="font-size: 1.5rem; font-weight: 700; letter-spacing: 2px; color: #333;">${brand.name}</span>`;
                }}
                sx={{ 
                  height: 40, 
                  maxWidth: 150,
                  objectFit: 'contain',
                }} 
              />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Brands;
