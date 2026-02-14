import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TestimonialsCard } from '../../../WrapperComponents/Common/TestimonialsCard';

interface BrandProduct {
    id: string;
    name: string;
    img: string;
    price: number;
    category: 'men' | 'women';
    type: string;
}

interface BrandProfile {
    _id: string;
    name: string;
    logo: string;
    coverImage: string;
    color: string;
    products: BrandProduct[];
}

const BrandSpotlight: React.FC = () => {
    const [brands, setBrands] = useState<BrandProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeBrandIndex, setActiveBrandIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8080/api/brand-spotlights');
                if (!response.ok) throw new Error('Failed to fetch brands');
                const data = await response.json();
                setBrands(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchBrands();
    }, []);

    const activeBrand = activeBrandIndex !== null ? brands[activeBrandIndex] : null;

    // Map products to TestimonialsCard items format
    const productItems = activeBrand?.products.map((product) => ({
        id: product.id,
        title: product.name,
        description: `₹${product.price?.toLocaleString()} - ${product.category === 'men' ? "Men's" : "Women's"} ${product.type}`,
        image: product.img
    })) || [];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress sx={{ color: '#D4AF37' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="error" mb={2}>Failed to load brands</Typography>
                <Typography variant="body2" color="text.secondary">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <AnimatePresence mode="wait">
                {!activeBrand ? (
                    <motion.div
                        key="brand-list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Typography variant="h4" fontWeight={800} textAlign="center" mb={6}>
                            Premium Partners
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 4,
                            justifyContent: 'center'
                        }}>
                            {brands.map((brand, index) => (
                                <Box key={brand._id || brand.name} sx={{ width: { xs: '100%', sm: 'calc(50% - 32px)', md: 'calc(33.33% - 32px)' } }}>
                                    <motion.div
                                        whileHover={{ y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setActiveBrandIndex(index)}
                                    >
                                        <Box sx={{
                                            height: 350,
                                            position: 'relative',
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                        }}>
                                            <Box
                                                component="img"
                                                src={brand.coverImage}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.5s',
                                                    '&:hover': { transform: 'scale(1.05)' }
                                                }}
                                            />
                                            <Box sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                p: 3,
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                                            }}>
                                                {brand.logo ? (
                                                    <Box component="img" src={brand.logo} sx={{ height: 30, filter: 'brightness(0) invert(1)', mb: 1, maxWidth: 100, objectFit: 'contain' }} />
                                                ) : (
                                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>{brand.name}</Typography>
                                                )}
                                                <Typography variant="subtitle2" sx={{ color: 'white', opacity: 0.9 }}>
                                                    View Collection — {brand.products.length} items
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </motion.div>
                                </Box>
                            ))}
                        </Box>
                    </motion.div>
                ) : (
                    <motion.div
                        key="brand-details"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Brand Details Header */}
                        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => setActiveBrandIndex(null)}
                                sx={{ color: '#dcaf2bff' }}
                            >
                                Back to Brands
                            </Button>
                            <Typography variant="h4" fontWeight={800}>{activeBrand.name} Collection</Typography>
                        </Box>

                        <Box sx={{
                            position: 'relative',
                            height: 200,
                            borderRadius: 4,
                            overflow: 'hidden',
                            mb: 6,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}>
                            <Box
                                component="img"
                                src={activeBrand.coverImage}
                                sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                            />
                            <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 4,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                            }}>
                                <Typography variant="h4" color="white" fontWeight={800}>{activeBrand.name}</Typography>
                            </Box>
                        </Box>

                        {/* Product Carousel using TestimonialsCard */}
                        {productItems.length > 0 ? (
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h5" textAlign="center" mb={2} fontWeight={600}>Featured Products</Typography>
                                <TestimonialsCard
                                    items={productItems}
                                    autoPlay={true}
                                    autoPlayInterval={3000}
                                />
                            </Box>
                        ) : (
                            <Typography variant="body1" color="text.secondary" sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                                No products currently available for this brand.
                            </Typography>
                        )}

                        {/* All Products Grid */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 8 }}>
                            <Typography variant="h6" sx={{ width: '100%', mb: 2 }}>All {activeBrand.name} Items</Typography>
                            {activeBrand.products.map((product) => (
                                <Box key={product.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
                                    <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                        <Box sx={{ height: 200, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                                            <Box
                                                component="img"
                                                src={product.img}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.3s',
                                                    '&:hover': { transform: 'scale(1.05)' }
                                                }}
                                            />
                                        </Box>
                                        <CardContent>
                                            <Typography variant="subtitle2" fontWeight={700}>{product.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{product.category === 'men' ? "Men's" : "Women's"} {product.type}</Typography>
                                            <Typography variant="subtitle1" color="primary" mt={1}>₹{product.price?.toLocaleString() || 'N/A'}</Typography>
                                        </CardContent>
                                    </Card>
                                </Box>
                            ))}
                        </Box>

                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default BrandSpotlight;
