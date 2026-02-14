import React, { useState } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import OutfitBuilder from './OutfitBuilder';
import BrandSpotlight from './BrandSpotlight';
import SiteReviews from './SiteReviews';


const StyleStudio: React.FC = () => {

    const [activeTab, setActiveTab] = useState(0);

    const tabs = ['Outfit Builder', 'Brand Spotlight', 'Community Reviews'];

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#f8f9fa',
            color: '#1a1a1a',
            pb: 8
        }}>
            {/* Hero Section */}
            <Box sx={{
                height: '40vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(45deg, #f5f5f5 30%, #e0e0e0 90%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography variant="h2" sx={{
                            fontWeight: 800,
                            mb: 2,
                            letterSpacing: '0.1em',
                            background: 'linear-gradient(45deg, #D4AF37, #FDC830)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            STYLE STUDIO
                        </Typography>
                        <Typography variant="h5" sx={{ opacity: 0.8, maxWidth: 600, mx: 'auto' }}>
                            Curate. Customize. Create.
                        </Typography>
                    </motion.div>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ mt: -5, position: 'relative', zIndex: 10 }}>
                <Paper elevation={1} sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    bgcolor: 'white'
                }}>
                    {/* Tabs */}
                    <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
                        {tabs.map((tab, index) => (
                            <Box
                                key={tab}
                                onClick={() => setActiveTab(index)}
                                sx={{
                                    flex: 1,
                                    py: 3,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    bgcolor: activeTab === index
                                        ? '#f5f5f5'
                                        : 'transparent',
                                    borderBottom: activeTab === index ? '3px solid #D4AF37' : 'none',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <Typography variant="button" fontWeight={700} sx={{
                                    color: activeTab === index ? '#D4AF37' : 'text.secondary'
                                }}>
                                    {tab}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ p: 4, minHeight: 600 }}>
                        <AnimatePresence mode="wait">
                            {activeTab === 0 && (
                                <motion.div
                                    key="builder"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <OutfitBuilder />
                                </motion.div>
                            )}
                            {activeTab === 1 && (
                                <motion.div
                                    key="brands"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <BrandSpotlight />
                                </motion.div>
                            )}
                            {activeTab === 2 && (
                                <motion.div
                                    key="reviews"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <SiteReviews />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default StyleStudio;
