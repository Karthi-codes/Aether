import React, { useState, useEffect } from 'react';
import { Box, Container, Tabs, Tab } from '@mui/material';
import ProductCard from '../Product/ProductCard';
import type { Product } from '../../../types';

const ProductTabs: React.FC = () => {
  const [value, setValue] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products');
        if (response.ok) {
          const data = await response.json();
          const mapped = data.map((p: any) => ({
            ...p,
            id: p._id,
            image: p.images && p.images.length > 0 ? p.images[0] : ''
          }));
          setProducts(mapped);
        }
      } catch (error) {
        console.error('Error fetching products for tabs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const getProducts = () => {
    switch (value) {
      case 0: return products.slice(0, 4); // New
      case 1: return products.slice(4, 8); // Special
      case 2: return products.filter(p => p.isFeatured).slice(0, 4); // Featured
      default: return products.slice(0, 4);
    }
  };

  const tabStyle = {
    textTransform: 'uppercase',
    color: '#999',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    opacity: 0.8,
    letterSpacing: '1px',
    position: 'relative',
    transition: 'all 0.3s ease',
    px: 3,
    '&:hover': { opacity: 1, color: 'black' },
    '&.Mui-selected': { color: 'black', opacity: 1 },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 8,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: 2,
      bgcolor: '#D5A249',
      transition: 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    '&:hover::after': { width: '40%' },
    '&.Mui-selected::after': { width: '40%' }
  };

  if (loading) return null;

  return (
    <Box sx={{ py: { xs: 5, md: 10 } }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 8 } }}>
          <Tabs
            value={value}
            onChange={handleChange}
            centered
            sx={{
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTabs-flexContainer': { gap: { xs: 1, md: 4 } },
              '& .MuiTabs-scroller': { overflow: { xs: 'auto !important', md: 'hidden !important' } }
            }}
          >
            <Tab label="New Products" sx={tabStyle} disableRipple />
            <Tab label="Special Products" sx={tabStyle} disableRipple />
            <Tab label="Featured Products" sx={tabStyle} disableRipple />
          </Tabs>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: { xs: 2, md: 4 },
            animation: 'fadeIn 0.5s ease-in-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}
          key={value} // Re-trigger animation on tab change
        >
          {getProducts().map((product, index) => (
            <Box
              key={product.id}
              sx={{
                opacity: 0,
                animation: `fadeIn 0.5s ease-in-out ${index * 0.1}s forwards` // Staggered animation
              }}
            >
              <ProductCard {...product} />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default ProductTabs;
