import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Slide data with images and text content
const heroSlides = [
  {
    leftImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop',
    rightImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop',
    subtitle: 'SUMMER 2024 COLLECTION',
    title: 'FINAL\nCLEARANCE',
    description: 'Take 20% Off "Sale Must-Haves"',
  },
  {
    leftImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop',
    rightImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop',
    subtitle: 'NEW ARRIVALS',
    title: 'SPRING\nESSENTIALS',
    description: 'Discover the Latest Trends',
  },
  {
    leftImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop',
    rightImage: 'https://i.pinimg.com/1200x/91/bb/53/91bb53ac491a324952e9ab3200b70819.jpg',
    subtitle: 'LIMITED EDITION',
    title: 'EXCLUSIVE\nSTYLES',
    description: 'Premium Quality Fashion',
  },
  {
    leftImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop',
    rightImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop',
    subtitle: 'WEEKEND SALE',
    title: 'UP TO\n50% OFF',
    description: 'Don\'t Miss These Deals',
  },
];

const imageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const textVariants = {
  enter: {
    y: 30,
    opacity: 0,
  },
  center: {
    y: 0,
    opacity: 1,
  },
  exit: {
    y: -30,
    opacity: 0,
  },
};

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Auto-rotate slides every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentSlide = heroSlides[currentIndex];

  return (
    <Box sx={{ width: '100%', bgcolor: '#f5f5f5', overflow: 'hidden' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: 'auto', md: '80vh' },
            gap: { xs: 2, md: 4 }
          }}
        >
          {/* Left Image (Women) */}
          <Box 
            sx={{ 
              flex: 1, 
              height: { xs: 250, sm: 350, md: 600 },
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.img
                key={`left-${currentIndex}`}
                src={currentSlide.leftImage}
                alt="Women's Fashion"
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                }}
              />
            </AnimatePresence>
          </Box>

          {/* Center Content */}
          <Box sx={{ flex: 1, textAlign: 'center', px: { xs: 1, md: 2 }, position: 'relative', minHeight: { xs: 200, md: 300 } }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentIndex}`}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <Typography variant="overline" sx={{ letterSpacing: 2, color: '#666' }}>
                  {currentSlide.subtitle}
                </Typography>
                
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 700,
                    fontSize: { xs: '2rem', sm: '3rem', lg: '5rem' },
                    lineHeight: 1.1,
                    mt: 2,
                    mb: 1,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {currentSlide.title}
                </Typography>

                <Typography variant="body1" sx={{ mb: 4, letterSpacing: 1, color: '#666' }}>
                  {currentSlide.description}
                </Typography>
              </motion.div>
            </AnimatePresence>

            <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', px: { xs: 2, sm: 0 } }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/shop?category=Women')}
                sx={{ 
                  borderRadius: 0, 
                  color: 'black', 
                  borderColor: 'black',
                  px: { xs: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': { bgcolor: 'black', color: 'white' }
                }}
              >
                SHOP WOMEN'S
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/shop?category=Men')}
                sx={{ 
                  borderRadius: 0, 
                  color: 'black', 
                  borderColor: 'black',
                  px: { xs: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': { bgcolor: 'black', color: 'white' }
                }}
              >
                SHOP MEN'S
              </Button>
            </Box>

            {/* Dots Indicator */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 6 }}>
              {heroSlides.map((_, i) => (
                <Box 
                  key={i}
                  onClick={() => goToSlide(i)}
                  sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: i === currentIndex ? 'black' : '#ccc',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: i === currentIndex ? 'scale(1.2)' : 'scale(1)',
                    '&:hover': { bgcolor: i === currentIndex ? 'black' : '#999' }
                  }} 
                />
              ))}
            </Box>
          </Box>

          {/* Right Image (Men) */}
          <Box 
            sx={{ 
              flex: 1, 
              height: { xs: 250, sm: 350, md: 600 },
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.img
                key={`right-${currentIndex}`}
                src={currentSlide.rightImage}
                alt="Men's Fashion"
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                }}
              />
            </AnimatePresence>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
