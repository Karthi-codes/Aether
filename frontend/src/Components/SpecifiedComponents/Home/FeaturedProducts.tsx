import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EastIcon from '@mui/icons-material/East';
import ProductCard from '../Product/ProductCard';
import type { Product } from '../../../types';

const FeaturedProducts: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products?featured=true');
        if (response.ok) {
          const data = await response.json();
          // Map backend data to frontend format
          const mappedProducts = data.slice(0, 8).map((p: any) => ({
            ...p,
            id: p._id,
            image: p.images && p.images.length > 0 ? p.images[0] : ''
          }));
          setFeaturedProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const productsPerView = 4;
  const maxSlide = Math.max(0, Math.ceil(featuredProducts.length / productsPerView) - 1);

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  return (
    <Box sx={{ py: { xs: 10, md: 16 }, bgcolor: '#fafafa', position: 'relative', overflow: 'hidden' }}>
      {/* Background Decorative */}
      <Typography
        sx={{
          position: 'absolute',
          top: '50%',
          left: -100,
          transform: 'translateY(-50%) rotate(-90deg)',
          fontSize: { xs: '8rem', md: '12rem' },
          fontWeight: 900,
          color: 'rgba(0,0,0,0.02)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          fontFamily: '"Playfair Display", serif'
        }}
      >
        AETHER
      </Typography>

      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: { xs: 6, md: 8 }, flexWrap: 'wrap', gap: 3 }}>
          <Box>
            {/* Decorative Line + Label */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ width: 60, height: 2, bgcolor: '#D5A249' }} />
              <Typography sx={{ color: '#D5A249', letterSpacing: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                CURATED SELECTION
              </Typography>
            </Box>

            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                fontWeight: 400,
                lineHeight: 1.2,
                '& span': { fontStyle: 'italic', fontWeight: 300 }
              }}
            >
              Featured <span>Products</span>
            </Typography>

            <Typography sx={{ color: 'text.secondary', mt: 2, maxWidth: 400, lineHeight: 1.7 }}>
              Handpicked pieces that define contemporary elegance. Each item crafted with exceptional attention to detail.
            </Typography>
          </Box>

          {/* Navigation & View All */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Carousel Controls */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={prevSlide}
                disabled={currentSlide === 0}
                sx={{
                  width: 50,
                  height: 50,
                  border: '1px solid',
                  borderColor: currentSlide === 0 ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.3)',
                  color: currentSlide === 0 ? 'rgba(0,0,0,0.2)' : '#2C2C2C',
                  '&:hover': { bgcolor: '#2C2C2C', color: 'white', borderColor: '#2C2C2C' }
                }}
              >
                <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                onClick={nextSlide}
                disabled={currentSlide === maxSlide}
                sx={{
                  width: 50,
                  height: 50,
                  border: '1px solid',
                  borderColor: currentSlide === maxSlide ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.3)',
                  color: currentSlide === maxSlide ? 'rgba(0,0,0,0.2)' : '#2C2C2C',
                  '&:hover': { bgcolor: '#2C2C2C', color: 'white', borderColor: '#2C2C2C' }
                }}
              >
                <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* View All */}
            <Box
              onClick={() => navigate('/shop')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                color: '#2C2C2C',
                fontWeight: 600,
                fontSize: '0.9rem',
                letterSpacing: 1,
                transition: 'all 0.3s',
                '&:hover': { color: '#D5A249' },
                '&:hover .arrow': { transform: 'translateX(4px)' }
              }}
            >
              View All
              <EastIcon className="arrow" sx={{ fontSize: 20, transition: 'transform 0.3s' }} />
            </Box>
          </Box>
        </Box>

        {/* Products Carousel */}
        <Box sx={{ position: 'relative' }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>Loading...</Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: {
                  xs: 'none',
                  md: `translateX(-${currentSlide * 100}%)`
                },
                overflowX: { xs: 'auto', md: 'visible' },
                pb: { xs: 2, md: 0 },
                '&::-webkit-scrollbar': { display: 'none' }
              }}
            >
              {featuredProducts.map((product, index) => (
                <Box
                  key={product.id}
                  sx={{
                    minWidth: { xs: 280, sm: 300, md: 'calc(25% - 18px)' },
                    opacity: { md: (index >= currentSlide * productsPerView && index < (currentSlide + 1) * productsPerView) ? 1 : 0.4 },
                    transition: 'opacity 0.4s'
                  }}
                >
                  <ProductCard {...product} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Progress Indicator */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', gap: 2, mt: 8 }}>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
            {String(currentSlide + 1).padStart(2, '0')}
          </Typography>
          <Box sx={{ width: 200, height: 2, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1, overflow: 'hidden' }}>
            <Box
              sx={{
                width: `${((currentSlide + 1) / (maxSlide + 1)) * 100}%`,
                height: '100%',
                bgcolor: '#D5A249',
                transition: 'width 0.4s'
              }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
            {String(maxSlide + 1).padStart(2, '0')}
          </Typography>
        </Box>

        {/* Bottom CTA Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 10,
            pt: 10,
            borderTop: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: '1rem' }}>
              Explore our complete collection of premium essentials
            </Typography>
            <Box
              onClick={() => navigate('/shop')}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: '#2C2C2C',
                color: 'white',
                px: 5,
                py: 2,
                cursor: 'pointer',
                fontWeight: 600,
                letterSpacing: 2,
                fontSize: '0.85rem',
                transition: 'all 0.3s',
                '&:hover': { bgcolor: '#D5A249', color: '#0a0a0a' },
                '&:hover .arrow': { transform: 'translateX(4px)' }
              }}
            >
              SHOP ALL PRODUCTS
              <EastIcon className="arrow" sx={{ fontSize: 18, transition: 'transform 0.3s' }} />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedProducts;
