import React, { useState, useMemo, useEffect } from 'react';
import { Box, Container, Typography, Chip, Button, Pagination } from '@mui/material';
import { Link } from 'react-router-dom';
import VerifiedIcon from '@mui/icons-material/Verified';
import RecyclingIcon from '@mui/icons-material/Recycling';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ProductCard from '../SpecifiedComponents/Product/ProductCard';

import type { Product } from '../../types';

const PRODUCTS_PER_PAGE = 8;

const OutletHub: React.FC = () => {

    const [currentPage, setCurrentPage] = useState(1);
    const [filterCondition, setFilterCondition] = useState<'all' | 'refurbished' | 'open-box'>('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRefurbished = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/products');
                if (response.ok) {
                    const data = await response.json();
                    const mapped = data
                        .filter((p: any) => p.isRefurbished)
                        .map((p: any) => ({
                            ...p,
                            id: p._id,
                            image: p.images && p.images.length > 0 ? p.images[0] : ''
                        }));
                    setProducts(mapped);
                }
            } catch (error) {
                console.error('Error fetching refurbished products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRefurbished();
    }, []);

    const refurbishedProducts = useMemo(() => {
        let result = [...products];
        if (filterCondition !== 'all') {
            result = result.filter(p => (p as any).condition === filterCondition);
        }
        return result;
    }, [products, filterCondition]);

    const totalPages = Math.ceil(refurbishedProducts.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return refurbishedProducts.slice(start, start + PRODUCTS_PER_PAGE);
    }, [refurbishedProducts, currentPage]);

    if (loading) return null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
            {/* Hero Banner */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                    color: '#2C2C2C',
                    py: 8,
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative Elements */}
                <Box sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(213, 162, 73, 0.1)',
                    filter: 'blur(40px)'
                }} />

                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                        <RecyclingIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                        <Typography variant="overline" sx={{ color: '#4CAF50', letterSpacing: 4, fontSize: '0.9rem' }}>
                            SUSTAINABLE SHOPPING
                        </Typography>
                    </Box>

                    <Typography variant="h2" fontWeight={800} sx={{ fontFamily: '"Playfair Display", serif', mb: 2 }}>
                        Outlet Hub
                    </Typography>

                    <Typography variant="h6" sx={{ opacity: 0.8, maxWidth: 600, mx: 'auto', mb: 4 }}>
                        Premium returned items, professionally inspected and verified.
                        Same quality, better prices.
                    </Typography>

                    {/* Trust Badges */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Chip
                            icon={<VerifiedIcon />}
                            label="Inspected & Verified"
                            sx={{ bgcolor: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', fontWeight: 600 }}
                        />
                        <Chip
                            icon={<LocalOfferIcon />}
                            label="Up to 40% Off"
                            sx={{ bgcolor: 'rgba(213, 162, 73, 0.2)', color: '#D5A249', fontWeight: 600 }}
                        />
                        <Chip
                            icon={<RecyclingIcon />}
                            label="Eco-Friendly"
                            sx={{ bgcolor: 'rgba(33, 150, 243, 0.2)', color: '#2196F3', fontWeight: 600 }}
                        />
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ py: 6 }}>
                {/* Filter Chips */}
                <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={600}>Filter by condition:</Typography>
                    <Chip
                        label="All Items"
                        onClick={() => { setFilterCondition('all'); setCurrentPage(1); }}
                        sx={{
                            bgcolor: filterCondition === 'all' ? '#2C2C2C' : 'transparent',
                            color: filterCondition === 'all' ? 'white' : 'text.primary',
                            border: '1px solid #ddd',
                            fontWeight: 600,
                            '&:hover': { bgcolor: filterCondition === 'all' ? '#2C2C2C' : '#f5f5f5' }
                        }}
                    />
                    <Chip
                        label="Refurbished"
                        icon={<RecyclingIcon sx={{ fontSize: 18 }} />}
                        onClick={() => { setFilterCondition('refurbished'); setCurrentPage(1); }}
                        sx={{
                            bgcolor: filterCondition === 'refurbished' ? '#2196F3' : 'transparent',
                            color: filterCondition === 'refurbished' ? 'white' : 'text.primary',
                            border: '1px solid #ddd',
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: filterCondition === 'refurbished' ? 'white' : '#2196F3' },
                            '&:hover': { bgcolor: filterCondition === 'refurbished' ? '#2196F3' : '#f5f5f5' }
                        }}
                    />
                    <Chip
                        label="Open-Box"
                        onClick={() => { setFilterCondition('open-box'); setCurrentPage(1); }}
                        sx={{
                            bgcolor: filterCondition === 'open-box' ? '#9C27B0' : 'transparent',
                            color: filterCondition === 'open-box' ? 'white' : 'text.primary',
                            border: '1px solid #ddd',
                            fontWeight: 600,
                            '&:hover': { bgcolor: filterCondition === 'open-box' ? '#9C27B0' : '#f5f5f5' }
                        }}
                    />
                </Box>

                {/* Products Grid */}
                {paginatedProducts.length > 0 ? (
                    <>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 3
                            }}
                        >
                            {paginatedProducts.map(product => (
                                <Box
                                    key={product.id}
                                    sx={{
                                        flex: { xs: '1 1 45%', sm: '1 1 30%', lg: '1 1 22%' },
                                        maxWidth: { xs: '48%', sm: '32%', lg: '24%' }
                                    }}
                                >
                                    <ProductCard {...product} />
                                </Box>
                            ))}
                        </Box>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={(_, page) => setCurrentPage(page)}
                                    color="standard"
                                    sx={{
                                        '& .Mui-selected': { bgcolor: '#2C2C2C !important', color: 'white' }
                                    }}
                                />
                            </Box>
                        )}
                    </>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 2 }}>
                        <RecyclingIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                        <Typography variant="h5" fontWeight={600} color="text.secondary">
                            No items found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                            Check back soon for more outlet deals!
                        </Typography>
                        <Button component={Link} to="/shop" variant="outlined">
                            Browse Regular Shop
                        </Button>
                    </Box>
                )}

                {/* Info Section */}
                <Box sx={{
                    mt: 8,
                    p: 4,
                    bgcolor: 'white',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: '#eee'
                }}>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 3, textAlign: 'center' }}>
                        Why Shop Outlet?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Box sx={{ flex: '1 1 250px', textAlign: 'center' }}>
                            <VerifiedIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                            <Typography variant="h6" fontWeight={600}>Quality Guaranteed</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Every item is professionally inspected and verified before listing
                            </Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 250px', textAlign: 'center' }}>
                            <LocalOfferIcon sx={{ fontSize: 40, color: '#D5A249', mb: 1 }} />
                            <Typography variant="h6" fontWeight={600}>Amazing Savings</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Save up to 40% on premium products with the same great quality
                            </Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 250px', textAlign: 'center' }}>
                            <RecyclingIcon sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                            <Typography variant="h6" fontWeight={600}>Sustainable Choice</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Reduce waste and support sustainable fashion practices
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default OutletHub;
