import React, { useState } from 'react';
import { Box, Typography, Paper, Tooltip, IconButton, Button, ToggleButton, ToggleButtonGroup, Dialog, DialogContent } from '@mui/material';
import { motion } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import { wardrobeItems, type StyleItem } from '../../../../data/styleStudioData';
import { toast } from 'react-toastify';

const OutfitBuilder: React.FC = () => {
    const [category, setCategory] = useState<'men' | 'women'>('men');

    // Filter wardrobe based on category
    const shirts = wardrobeItems.filter(item => item.category === category && item.type === 'shirt');
    const pants = wardrobeItems.filter(item => item.category === category && item.type === 'pant');

    const [selectedOutfit, setSelectedOutfit] = useState<{ shirt: StyleItem | null; pant: StyleItem | null }>({
        shirt: null,
        pant: null
    });

    const [resultOpen, setResultOpen] = useState(false);

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

    const handleGenerate = () => {
        if (!selectedOutfit.shirt || !selectedOutfit.pant) {
            toast.warning("Please select both a top and a bottom to generate a look!");
            return;
        }
        setResultOpen(true);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Wardrobe Section */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 0 }}>
                <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight={700}>Wardrobe</Typography>
                        <ToggleButtonGroup
                            value={category}
                            exclusive
                            onChange={(_, newCat) => { if (newCat) { setCategory(newCat); setSelectedOutfit({ shirt: null, pant: null }); } }}
                            size="small"
                        >
                            <ToggleButton value="men">Men</ToggleButton>
                            <ToggleButton value="women">Women</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Typography variant="subtitle2" color="text.secondary" mb={1}>Tops</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, overflowX: 'auto', pb: 1, '::-webkit-scrollbar': { height: 6 } }}>
                        {shirts.map(item => (
                            <motion.div
                                key={item.id}
                                draggable
                                onDragStart={(e: any) => handleDragStart(e, item)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ flexShrink: 0, cursor: 'grab' }}
                            >
                                <Box
                                    component="img"
                                    src={item.img}
                                    alt={item.name}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 2,
                                        objectFit: 'cover',
                                        border: '1px solid #eee'
                                    }}
                                />
                            </motion.div>
                        ))}
                    </Box>

                    <Typography variant="subtitle2" color="text.secondary" mb={1}>Bottoms</Typography>
                    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, '::-webkit-scrollbar': { height: 6 } }}>
                        {pants.map(item => (
                            <motion.div
                                key={item.id}
                                draggable
                                onDragStart={(e: any) => handleDragStart(e, item)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ flexShrink: 0, cursor: 'grab' }}
                            >
                                <Box
                                    component="img"
                                    src={item.img}
                                    alt={item.name}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 2,
                                        objectFit: 'cover',
                                        border: '1px solid #eee'
                                    }}
                                />
                            </motion.div>
                        ))}
                    </Box>
                </Paper>
            </Box>

            {/* Canvas / Model Section */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 70%' }, minWidth: 0 }}>
                <Box
                    sx={{
                        height: '600px',
                        bgcolor: '#f0f0f0',
                        borderRadius: 4,
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        overflow: 'hidden',
                        flexDirection: 'column'
                    }}
                >
                    {/* Action Bar */}
                    <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 1, zIndex: 10 }}>
                        <Tooltip title="Reset Outfit">
                            <IconButton onClick={() => setSelectedOutfit({ shirt: null, pant: null })} sx={{ bgcolor: 'white' }}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Virtual Mannequin Model Layout */}
                    <Box sx={{
                        width: 320,
                        height: 550,
                        position: 'relative',
                        // Mannequin silhouette background could go here
                        // bgcolor: 'rgba(255,255,255,0.5)',
                        // borderRadius: 20,
                        // border: '2px solid white'
                        mt: -5 // offset for button space
                    }}>
                        {/* Shirt Zone (Upper Body) */}
                        <Box
                            onDrop={(e) => handleDrop(e, 'shirt')}
                            onDragOver={handleDragOver}
                            sx={{
                                position: 'absolute',
                                top: 20,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 220,
                                height: 260,
                                zIndex: 2, // Shirt goes over pants usually
                                border: selectedOutfit.shirt ? 'none' : '2px dashed #bbb',
                                borderRadius: 2,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                transition: 'all 0.3s'
                            }}
                        >
                            {selectedOutfit.shirt ? (
                                <Box
                                    component="img"
                                    src={selectedOutfit.shirt.img}
                                    sx={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.2))' }}
                                />
                            ) : (
                                <Typography color="text.disabled">Drop Top Here</Typography>
                            )}
                        </Box>

                        {/* Pant Zone (Lower Body) */}
                        <Box
                            onDrop={(e) => handleDrop(e, 'pant')}
                            onDragOver={handleDragOver}
                            sx={{
                                position: 'absolute',
                                bottom: 40,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 200,
                                height: 280,
                                zIndex: 1,
                                border: selectedOutfit.pant ? 'none' : '2px dashed #bbb',
                                borderRadius: 2,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                transition: 'all 0.3s'
                            }}
                        >
                            {selectedOutfit.pant ? (
                                <Box
                                    component="img"
                                    src={selectedOutfit.pant.img}
                                    sx={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.2))' }}
                                />
                            ) : (
                                <Typography color="text.disabled">Drop Bottom Here</Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Generate Button */}
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AutoAwesomeIcon />}
                        onClick={handleGenerate}
                        sx={{
                            position: 'absolute',
                            bottom: 30,
                            zIndex: 20,
                            bgcolor: 'black',
                            color: 'white',
                            px: 4,
                            py: 1.5,
                            borderRadius: 10,
                            '&:hover': { bgcolor: '#333' }
                        }}
                    >
                        Generate Look
                    </Button>
                </Box>
            </Box>

            {/* Result Modal */}
            <Dialog
                open={resultOpen}
                onClose={() => setResultOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
            >
                <DialogContent sx={{ p: 0, position: 'relative' }}>
                    <IconButton
                        onClick={() => setResultOpen(false)}
                        sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(255,255,255,0.8)', zIndex: 10 }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f8f8' }}>
                        <Typography variant="h5" fontWeight={800} mb={3}>Your Curated Look</Typography>

                        {/* Combined Image Container */}
                        <Box sx={{
                            width: 300,
                            height: 450,
                            mx: 'auto',
                            borderRadius: 4,
                            bgcolor: 'white',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                            position: 'relative',
                            overflow: 'hidden',
                            mb: 4
                        }}>
                            {/* Recreate the overlap layout here cleanly */}
                            {selectedOutfit.shirt && (
                                <Box
                                    component="img"
                                    src={selectedOutfit.shirt.img}
                                    sx={{
                                        position: 'absolute',
                                        top: 30,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 200,
                                        zIndex: 2,
                                        filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.2))'
                                    }}
                                />
                            )}
                            {selectedOutfit.pant && (
                                <Box
                                    component="img"
                                    src={selectedOutfit.pant.img}
                                    sx={{
                                        position: 'absolute',
                                        bottom: 50,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 180,
                                        zIndex: 1,
                                        filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.2))'
                                    }}
                                />
                            )}
                        </Box>

                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<ShareIcon />}
                            sx={{ bgcolor: 'black', color: 'white', py: 1.5, borderRadius: 2 }}
                        >
                            Share This Look
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default OutfitBuilder;
