import React, { useState } from 'react';
import {
    Box, Typography, Paper, Tooltip, IconButton, Button,
    ToggleButton, ToggleButtonGroup, Dialog, DialogContent,
    Chip, LinearProgress, Skeleton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DiamondIcon from '@mui/icons-material/Diamond';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import PaletteIcon from '@mui/icons-material/Palette';
import { wardrobeItems, type StyleItem } from '../../../../data/styleStudioData';
import { toast } from 'react-toastify';

interface OutfitAnalysis {
    score: number;
    vibe: string;
    colorHarmony: string;
    occasions: string[];
    tips: string[];
    complementaryAccessories: string[];
    seasonBest: string;
}

const OutfitBuilder: React.FC = () => {
    const [category, setCategory] = useState<'men' | 'women'>('men');
    const shirts = wardrobeItems.filter(item => item.category === category && item.type === 'shirt');
    const pants = wardrobeItems.filter(item => item.category === category && item.type === 'pant');

    const [selectedOutfit, setSelectedOutfit] = useState<{ shirt: StyleItem | null; pant: StyleItem | null }>({
        shirt: null,
        pant: null
    });

    const [resultOpen, setResultOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<OutfitAnalysis | null>(null);

    const handleDragStart = (e: any, item: StyleItem) => {
        e.dataTransfer.setData('item', JSON.stringify(item));
    };

    const handleDrop = (e: any, slot: 'shirt' | 'pant') => {
        e.preventDefault();
        try {
            const item = JSON.parse(e.dataTransfer.getData('item'));
            if (item.category !== category) {
                toast.warning(`Cannot mix men's and women's items!`);
                return;
            }
            if (item.type === slot) {
                setSelectedOutfit(prev => ({ ...prev, [slot]: item }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDragOver = (e: any) => {
        e.preventDefault();
    };

    const handleItemClick = (item: StyleItem) => {
        if (item.type === 'shirt') {
            setSelectedOutfit(prev => ({ ...prev, shirt: item }));
        } else if (item.type === 'pant') {
            setSelectedOutfit(prev => ({ ...prev, pant: item }));
        }
    };

    const handleGenerate = async () => {
        if (!selectedOutfit.shirt || !selectedOutfit.pant) {
            toast.warning("Please select both a top and a bottom to generate a look!");
            return;
        }

        setResultOpen(true);
        setLoading(true);
        setAnalysis(null);

        try {
            const response = await fetch('http://localhost:8080/api/outfit/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shirtName: selectedOutfit.shirt.name,
                    pantName: selectedOutfit.pant.name,
                    category
                })
            });

            if (!response.ok) throw new Error('Analysis failed');
            const data: OutfitAnalysis = await response.json();
            setAnalysis(data);
        } catch (err) {
            console.error('Failed to analyze outfit:', err);
            toast.error('Style analysis unavailable. Showing preview only.');
            // Provide inline fallback
            setAnalysis({
                score: 8,
                vibe: 'Classic',
                colorHarmony: `${selectedOutfit.shirt!.name} and ${selectedOutfit.pant!.name} create a well-balanced, versatile combination.`,
                occasions: ['Casual Outing', 'Weekend Brunch', 'Coffee Date'],
                tips: ['Add a statement accessory to elevate the look', 'Roll up sleeves for a relaxed touch', 'Clean sneakers tie this outfit together'],
                complementaryAccessories: ['Leather Watch', 'White Sneakers', 'Canvas Tote'],
                seasonBest: 'All-Season'
            });
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return '#4CAF50';
        if (score >= 6) return '#FF9800';
        return '#f44336';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 9) return 'Perfect Match!';
        if (score >= 8) return 'Great Combo';
        if (score >= 6) return 'Good Pairing';
        return 'Try Another';
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Wardrobe Section */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 0 }}>
                <Paper sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid #f0f0f0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight={700}>Wardrobe</Typography>
                        <ToggleButtonGroup
                            value={category}
                            exclusive
                            onChange={(_, newCat) => {
                                if (newCat) {
                                    setCategory(newCat);
                                    setSelectedOutfit({ shirt: null, pant: null });
                                }
                            }}
                            size="small"
                            sx={{
                                '& .MuiToggleButton-root': {
                                    borderRadius: '20px !important',
                                    px: 2,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    border: '1px solid #ddd !important',
                                    '&.Mui-selected': { bgcolor: '#1a1a1a', color: 'white', borderColor: '#1a1a1a !important' }
                                }
                            }}
                        >
                            <ToggleButton value="men">Men</ToggleButton>
                            <ToggleButton value="women">Women</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Typography variant="subtitle2" color="text.secondary" mb={1.5} sx={{ letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        Tops
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, overflowX: 'auto', pb: 1, '::-webkit-scrollbar': { height: 4 }, '::-webkit-scrollbar-thumb': { bgcolor: '#ddd', borderRadius: 2 } }}>
                        {shirts.map(item => (
                            <motion.div
                                key={item.id}
                                draggable
                                onDragStart={(e: any) => handleDragStart(e, item)}
                                whileHover={{ scale: 1.08, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ flexShrink: 0, cursor: 'grab' }}
                                onClick={() => handleItemClick(item)}
                            >
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: selectedOutfit.shirt?.id === item.id ? '3px solid #D5A249' : '2px solid #eee',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        boxShadow: selectedOutfit.shirt?.id === item.id ? '0 4px 12px rgba(213,162,73,0.3)' : 'none'
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={item.img}
                                        alt={item.name}
                                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    {selectedOutfit.shirt?.id === item.id && (
                                        <Box sx={{
                                            position: 'absolute', top: 4, right: 4,
                                            width: 18, height: 18, borderRadius: '50%',
                                            bgcolor: '#D5A249', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <CheckCircleIcon sx={{ fontSize: 14, color: 'white' }} />
                                        </Box>
                                    )}
                                </Box>
                                <Typography variant="caption" sx={{
                                    display: 'block', mt: 0.5, fontSize: '0.6rem',
                                    textAlign: 'center', color: 'text.secondary', maxWidth: 80,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }}>
                                    {item.name}
                                </Typography>
                            </motion.div>
                        ))}
                    </Box>

                    <Typography variant="subtitle2" color="text.secondary" mb={1.5} sx={{ letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        Bottoms
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, '::-webkit-scrollbar': { height: 4 }, '::-webkit-scrollbar-thumb': { bgcolor: '#ddd', borderRadius: 2 } }}>
                        {pants.map(item => (
                            <motion.div
                                key={item.id}
                                draggable
                                onDragStart={(e: any) => handleDragStart(e, item)}
                                whileHover={{ scale: 1.08, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ flexShrink: 0, cursor: 'grab' }}
                                onClick={() => handleItemClick(item)}
                            >
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: selectedOutfit.pant?.id === item.id ? '3px solid #D5A249' : '2px solid #eee',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        boxShadow: selectedOutfit.pant?.id === item.id ? '0 4px 12px rgba(213,162,73,0.3)' : 'none'
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={item.img}
                                        alt={item.name}
                                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    {selectedOutfit.pant?.id === item.id && (
                                        <Box sx={{
                                            position: 'absolute', top: 4, right: 4,
                                            width: 18, height: 18, borderRadius: '50%',
                                            bgcolor: '#D5A249', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <CheckCircleIcon sx={{ fontSize: 14, color: 'white' }} />
                                        </Box>
                                    )}
                                </Box>
                                <Typography variant="caption" sx={{
                                    display: 'block', mt: 0.5, fontSize: '0.6rem',
                                    textAlign: 'center', color: 'text.secondary', maxWidth: 80,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }}>
                                    {item.name}
                                </Typography>
                            </motion.div>
                        ))}
                    </Box>

                    {/* Helper text */}
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2, textAlign: 'center', fontStyle: 'italic' }}>
                        Click or drag items to build your outfit
                    </Typography>
                </Paper>
            </Box>

            {/* Canvas / Model Section */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 70%' }, minWidth: 0 }}>
                <Box
                    sx={{
                        height: '600px',
                        bgcolor: '#fafafa',
                        borderRadius: 4,
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundImage: 'radial-gradient(circle, #e8e8e8 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                        overflow: 'hidden',
                        flexDirection: 'column',
                        border: '1px solid #eee'
                    }}
                >
                    {/* Action Bar */}
                    <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 1, zIndex: 10 }}>
                        <Tooltip title="Reset Outfit">
                            <IconButton
                                onClick={() => setSelectedOutfit({ shirt: null, pant: null })}
                                sx={{
                                    bgcolor: 'white',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    '&:hover': { bgcolor: '#fff', transform: 'rotate(180deg)' },
                                    transition: 'all 0.3s'
                                }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Category Badge */}
                    <Chip
                        label={category === 'men' ? "MEN'S STUDIO" : "WOMEN'S STUDIO"}
                        sx={{
                            position: 'absolute', top: 20, left: 20,
                            bgcolor: 'white', fontWeight: 700, letterSpacing: 1,
                            fontSize: '0.65rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                    />

                    {/* Mannequin Layout */}
                    <Box sx={{ width: 320, height: 520, position: 'relative', mt: -3 }}>
                        {/* Shirt Zone */}
                        <Box
                            onDrop={(e) => handleDrop(e, 'shirt')}
                            onDragOver={handleDragOver}
                            sx={{
                                position: 'absolute',
                                top: 10,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 240,
                                height: 250,
                                zIndex: 2,
                                border: selectedOutfit.shirt ? 'none' : '2px dashed #ccc',
                                borderRadius: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                bgcolor: selectedOutfit.shirt ? 'transparent' : 'rgba(255,255,255,0.6)',
                                overflow: 'hidden'
                            }}
                        >
                            <AnimatePresence mode="wait">
                                {selectedOutfit.shirt ? (
                                    <motion.div
                                        key={selectedOutfit.shirt.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.4 }}
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        <Box
                                            component="img"
                                            src={selectedOutfit.shirt.img}
                                            sx={{
                                                width: '100%', height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: 3,
                                                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))'
                                            }}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <Typography color="text.disabled" fontSize="0.85rem" fontWeight={500}>
                                            Drop Top Here
                                        </Typography>
                                        <Typography color="text.disabled" fontSize="0.65rem" mt={0.5}>
                                            or click from wardrobe
                                        </Typography>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Box>

                        {/* Pant Zone */}
                        <Box
                            onDrop={(e) => handleDrop(e, 'pant')}
                            onDragOver={handleDragOver}
                            sx={{
                                position: 'absolute',
                                bottom: 20,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 220,
                                height: 260,
                                zIndex: 1,
                                border: selectedOutfit.pant ? 'none' : '2px dashed #ccc',
                                borderRadius: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                bgcolor: selectedOutfit.pant ? 'transparent' : 'rgba(255,255,255,0.6)',
                                overflow: 'hidden'
                            }}
                        >
                            <AnimatePresence mode="wait">
                                {selectedOutfit.pant ? (
                                    <motion.div
                                        key={selectedOutfit.pant.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.4 }}
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        <Box
                                            component="img"
                                            src={selectedOutfit.pant.img}
                                            sx={{
                                                width: '100%', height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: 3,
                                                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))'
                                            }}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <Typography color="text.disabled" fontSize="0.85rem" fontWeight={500}>
                                            Drop Bottom Here
                                        </Typography>
                                        <Typography color="text.disabled" fontSize="0.65rem" mt={0.5}>
                                            or click from wardrobe
                                        </Typography>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Box>
                    </Box>

                    {/* Generate Button */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ position: 'absolute', bottom: 24, zIndex: 20 }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AutoAwesomeIcon />}
                            onClick={handleGenerate}
                            disabled={!selectedOutfit.shirt || !selectedOutfit.pant}
                            sx={{
                                bgcolor: '#1a1a1a',
                                color: 'white',
                                px: 5,
                                py: 1.5,
                                borderRadius: 10,
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                '&:hover': { bgcolor: '#333' },
                                '&.Mui-disabled': { bgcolor: '#ccc', color: '#999' }
                            }}
                        >
                            Generate Look ✨
                        </Button>
                    </motion.div>
                </Box>
            </Box>

            {/* AI Result Modal */}
            <Dialog
                open={resultOpen}
                onClose={() => setResultOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        overflow: 'hidden',
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogContent sx={{ p: 0, position: 'relative' }}>
                    <IconButton
                        onClick={() => setResultOpen(false)}
                        sx={{
                            position: 'absolute', top: 12, right: 12,
                            bgcolor: 'rgba(255,255,255,0.9)', zIndex: 10,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* Loading State */}
                    {loading && (
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                style={{ display: 'inline-block', marginBottom: 24 }}
                            >
                                <AutoAwesomeIcon sx={{ fontSize: 48, color: '#D5A249' }} />
                            </motion.div>
                            <Typography variant="h6" fontWeight={700} mb={1}>Analyzing Your Look...</Typography>
                            <Typography variant="body2" color="text.secondary" mb={3}>
                                Our AI stylist is evaluating your outfit combination
                            </Typography>
                            <LinearProgress sx={{
                                maxWidth: 300, mx: 'auto', borderRadius: 4, height: 6,
                                bgcolor: '#f0f0f0',
                                '& .MuiLinearProgress-bar': { bgcolor: '#D5A249', borderRadius: 4 }
                            }} />

                            {/* Skeleton Preview */}
                            <Box sx={{ display: 'flex', gap: 3, mt: 4, maxWidth: 400, mx: 'auto' }}>
                                <Skeleton variant="rounded" width={180} height={220} sx={{ borderRadius: 3 }} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton variant="text" width="80%" height={30} />
                                    <Skeleton variant="text" width="60%" />
                                    <Skeleton variant="rounded" width="100%" height={60} sx={{ mt: 2, borderRadius: 2 }} />
                                    <Skeleton variant="rounded" width="100%" height={40} sx={{ mt: 1, borderRadius: 2 }} />
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* Results */}
                    {!loading && analysis && (
                        <Box sx={{ bgcolor: '#fafafa' }}>
                            {/* Header */}
                            <Box sx={{
                                background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                                color: 'white',
                                p: 4,
                                pb: 5,
                                textAlign: 'center'
                            }}>
                                <Typography variant="overline" sx={{ letterSpacing: 3, color: '#D5A249' }}>
                                    AI STYLE ANALYSIS
                                </Typography>
                                <Typography variant="h4" fontWeight={800} mt={1}>
                                    Your Curated Look
                                </Typography>
                            </Box>

                            {/* Content */}
                            <Box sx={{ p: { xs: 3, md: 4 }, mt: -3 }}>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                                    {/* Outfit Preview Card */}
                                    <Box sx={{
                                        flex: '0 0 auto',
                                        width: { xs: '100%', md: 280 },
                                        bgcolor: 'white',
                                        borderRadius: 4,
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                    }}>
                                        {/* Score Badge */}
                                        <Box sx={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', p: 2, borderBottom: '1px solid #f0f0f0'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{
                                                    width: 44, height: 44, borderRadius: '50%',
                                                    bgcolor: getScoreColor(analysis.score),
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: 800, fontSize: '1.1rem'
                                                }}>
                                                    {analysis.score}
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" fontWeight={700} fontSize="0.7rem">
                                                        {getScoreLabel(analysis.score)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block" fontSize="0.6rem">
                                                        STYLE SCORE
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip
                                                label={analysis.vibe}
                                                size="small"
                                                sx={{
                                                    bgcolor: '#1a1a1a', color: 'white',
                                                    fontWeight: 700, fontSize: '0.65rem',
                                                    letterSpacing: 1
                                                }}
                                            />
                                        </Box>

                                        {/* Outfit Images */}
                                        {selectedOutfit.shirt && (
                                            <Box sx={{ position: 'relative', height: 180 }}>
                                                <Box
                                                    component="img"
                                                    src={selectedOutfit.shirt.img}
                                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <Box sx={{
                                                    position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5,
                                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                                    color: 'white'
                                                }}>
                                                    <Typography variant="caption" fontWeight={600}>
                                                        {selectedOutfit.shirt.name}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                        {selectedOutfit.pant && (
                                            <Box sx={{ position: 'relative', height: 180, borderTop: '2px solid white' }}>
                                                <Box
                                                    component="img"
                                                    src={selectedOutfit.pant.img}
                                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <Box sx={{
                                                    position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5,
                                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                                    color: 'white'
                                                }}>
                                                    <Typography variant="caption" fontWeight={600}>
                                                        {selectedOutfit.pant.name}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Analysis Details */}
                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                        {/* Color Harmony */}
                                        <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #f0f0f0' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <PaletteIcon sx={{ fontSize: 18, color: '#D5A249' }} />
                                                <Typography variant="subtitle2" fontWeight={700}>Color Harmony</Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                                                {analysis.colorHarmony}
                                            </Typography>
                                        </Paper>

                                        {/* Best For */}
                                        <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #f0f0f0' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                <CalendarMonthIcon sx={{ fontSize: 18, color: '#D5A249' }} />
                                                <Typography variant="subtitle2" fontWeight={700}>Best For</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {analysis.occasions.map((occ, i) => (
                                                    <Chip
                                                        key={i}
                                                        label={occ}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#f5f0e8', color: '#8B6914',
                                                            fontWeight: 600, fontSize: '0.7rem'
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Paper>

                                        {/* Style Tips */}
                                        <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #f0f0f0' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                <TipsAndUpdatesIcon sx={{ fontSize: 18, color: '#D5A249' }} />
                                                <Typography variant="subtitle2" fontWeight={700}>Style Tips</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {analysis.tips.map((tip, i) => (
                                                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                        <Typography color="text.secondary" fontSize="0.8rem" mt={0.1}>•</Typography>
                                                        <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                                                            {tip}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Paper>

                                        {/* Accessories + Season Row */}
                                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #f0f0f0', flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                    <DiamondIcon sx={{ fontSize: 18, color: '#D5A249' }} />
                                                    <Typography variant="subtitle2" fontWeight={700} fontSize="0.75rem">Accessories</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {analysis.complementaryAccessories.map((acc, i) => (
                                                        <Chip
                                                            key={i}
                                                            label={acc}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.65rem', borderColor: '#ddd' }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Paper>
                                            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #f0f0f0', flex: '0 0 130px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                <WbSunnyIcon sx={{ fontSize: 24, color: '#D5A249', mb: 0.5 }} />
                                                <Typography variant="caption" fontWeight={700} fontSize="0.7rem">
                                                    {analysis.seasonBest}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled" fontSize="0.55rem">
                                                    BEST SEASON
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Action Button */}
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<ShareIcon />}
                                    sx={{
                                        mt: 3,
                                        bgcolor: '#1a1a1a', color: 'white',
                                        py: 1.5, borderRadius: 3,
                                        fontWeight: 700, letterSpacing: 0.5,
                                        '&:hover': { bgcolor: '#333' }
                                    }}
                                    onClick={() => {
                                        toast.success('Look saved! Sharing coming soon 🎉');
                                    }}
                                >
                                    Share This Look
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default OutfitBuilder;
