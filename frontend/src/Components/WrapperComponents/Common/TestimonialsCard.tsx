import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

interface Item {
    id: number | string;
    title: string;
    description: string;
    image: string;
}

interface TestimonialsCardProps {
    items: Item[];
    autoPlay?: boolean;
    autoPlayInterval?: number;
}

export const TestimonialsCard: React.FC<TestimonialsCardProps> = ({
    items,
    autoPlay = true,
    autoPlayInterval = 4000,
}) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!autoPlay) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % items.length);
        }, autoPlayInterval);
        return () => clearInterval(timer);
    }, [autoPlay, autoPlayInterval, items.length]);

    if (!items || items.length === 0) return null;

    const currentItem = items[index];

    return (
        <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            py: 4,
            overflow: 'hidden'
        }}>
            <Box sx={{ position: "relative", width: "100%", maxWidth: 600, height: 400 }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentItem.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.9 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 4,
                                overflow: "hidden",
                                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                                bgcolor: "background.paper",
                            }}
                        >
                            {/* Image Section */}
                            <Box sx={{ height: "70%", overflow: "hidden", position: "relative" }}>
                                <Box
                                    component="img"
                                    src={currentItem.image}
                                    alt={currentItem.title}
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                                {/* Gradient Overlay */}
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '50%',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                                }} />
                            </Box>

                            {/* Content Section */}
                            <Box sx={{
                                p: 3,
                                height: "30%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff'
                            }}>
                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                    {currentItem.title}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {currentItem.description}
                                </Typography>
                            </Box>
                        </Box>
                    </motion.div>
                </AnimatePresence>

                {/* Indicators */}
                <Box sx={{
                    position: 'absolute',
                    bottom: -40,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1
                }}>
                    {items.map((_, i) => (
                        <Box
                            key={i}
                            onClick={() => setIndex(i)}
                            sx={{
                                width: i === index ? 24 : 8,
                                height: 8,
                                borderRadius: 4,
                                bgcolor: i === index ? 'primary.main' : 'grey.400',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    );
};
