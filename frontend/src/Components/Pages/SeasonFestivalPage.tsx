import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, CircularProgress, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ProductCard from '../SpecifiedComponents/Product/ProductCard';
import apiService from '../../services/api.service';

interface SeasonFestivalPageProps {
    type: 'season' | 'festival';
}

// ─── Full-Screen Canvas Animation ─────────────────────────────────────
const AnimationOverlay: React.FC<{
    animationType: string;
    name: string;
    icon: string;
    onAnimationEnd: () => void;
}> = ({ animationType, name, icon, onAnimationEnd }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        const particles: {
            x: number; y: number; size: number; speed: number;
            opacity: number; char: string; angle: number; drift: number;
            vx: number; vy: number;
        }[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const config: Record<string, {
            chars: string[]; count: number;
            minSpeed: number; maxSpeed: number;
            minSize: number; maxSize: number;
        }> = {
            snow: { chars: ['❄', '❅', '❆', '✦', '•'], count: 120, minSpeed: 0.5, maxSpeed: 2, minSize: 10, maxSize: 28 },
            rain: { chars: ['|', '│', '┃'], count: 200, minSpeed: 8, maxSpeed: 16, minSize: 10, maxSize: 18 },
            breeze: { chars: ['~', '≈', '∿', '🍃'], count: 60, minSpeed: 1, maxSpeed: 3, minSize: 14, maxSize: 28 },
            fall: { chars: ['🍂', '🍁', '🍃', '🌰'], count: 70, minSpeed: 0.8, maxSpeed: 2.5, minSize: 16, maxSize: 30 },
            sparkle: { chars: ['✦', '✧', '⋆', '·', '✹'], count: 100, minSpeed: 0.2, maxSpeed: 0.8, minSize: 8, maxSize: 24 },
            glow: { chars: ['◉', '○', '◎', '✦', '⊙'], count: 80, minSpeed: 0.1, maxSpeed: 0.5, minSize: 10, maxSize: 28 },
            bloom: { chars: ['🌸', '🌺', '🌷', '💮'], count: 50, minSpeed: 0.5, maxSpeed: 1.5, minSize: 16, maxSize: 30 },
            groom: { chars: ['🍃', '🌿', '☘', '~'], count: 60, minSpeed: 1, maxSpeed: 3, minSize: 14, maxSize: 28 },
        };

        const c = config[animationType] || config.sparkle;

        // Initialize particles spread across the screen
        for (let i = 0; i < c.count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: c.minSize + Math.random() * (c.maxSize - c.minSize),
                speed: c.minSpeed + Math.random() * (c.maxSpeed - c.minSpeed),
                opacity: 0.2 + Math.random() * 0.8,
                char: c.chars[Math.floor(Math.random() * c.chars.length)],
                angle: Math.random() * Math.PI * 2,
                drift: (Math.random() - 0.5) * 1.5,
                vx: 0,
                vy: 0,
            });
        }

        // Rain-specific color
        const rainColor = 'rgba(100, 180, 255, ';

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                if (animationType === 'rain') {
                    // Draw rain streaks as lines
                    ctx.strokeStyle = `${rainColor}${p.opacity})`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + p.drift * 2, p.y + p.speed * 3);
                    ctx.stroke();

                    p.y += p.speed;
                    p.x += p.drift * 0.5;
                } else if (animationType === 'sparkle' || animationType === 'glow') {
                    // Twinkling effect
                    p.opacity = 0.1 + Math.abs(Math.sin(p.angle)) * 0.9;
                    ctx.globalAlpha = p.opacity;
                    ctx.font = `${p.size}px serif`;
                    ctx.fillStyle = animationType === 'glow' ? '#FFD700' : '#ffffff';
                    ctx.fillText(p.char, p.x, p.y);

                    p.angle += 0.03 + Math.random() * 0.02;
                    p.x += Math.cos(p.angle) * 0.3;
                    p.y += Math.sin(p.angle) * 0.3;
                } else if (animationType === 'snow') {
                    ctx.globalAlpha = p.opacity;
                    ctx.font = `${p.size}px serif`;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(p.char, p.x, p.y);

                    p.y += p.speed;
                    p.x += Math.sin(p.angle) * 0.8;
                    p.angle += 0.01;
                } else if (animationType === 'breeze') {
                    ctx.globalAlpha = p.opacity;
                    ctx.font = `${p.size}px serif`;
                    ctx.fillStyle = '#a8e6cf';
                    ctx.fillText(p.char, p.x, p.y);

                    p.x += p.speed * 1.5;
                    p.y += Math.sin(p.angle) * 0.5;
                    p.angle += 0.02;
                } else {
                    // fall, bloom, groom
                    ctx.globalAlpha = p.opacity;
                    ctx.font = `${p.size}px serif`;
                    ctx.fillText(p.char, p.x, p.y);

                    p.y += p.speed;
                    p.x += Math.sin(p.angle) * p.drift;
                    p.angle += 0.015;
                }

                // Wrap around
                if (p.y > canvas.height + 40) {
                    p.y = -40;
                    p.x = Math.random() * canvas.width;
                }
                if (p.x > canvas.width + 40) p.x = -40;
                if (p.x < -40) p.x = canvas.width + 40;
            });

            ctx.globalAlpha = 1;
            animId = requestAnimationFrame(animate);
        };

        animate();

        // Fade out after 6 seconds, call onAnimationEnd after 7s total
        const fadeTimer = setTimeout(() => setFadeOut(true), 6000);
        const endTimer = setTimeout(() => onAnimationEnd(), 7000);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            clearTimeout(fadeTimer);
            clearTimeout(endTimer);
        };
    }, [animationType, onAnimationEnd]);

    // Background gradients per type
    const bgGradients: Record<string, string> = {
        snow: 'radial-gradient(ellipse at 50% 0%, #1a1a3e 0%, #0a0a1a 60%, #000000 100%)',
        rain: 'radial-gradient(ellipse at 50% 0%, #0d1b2a 0%, #0a0f1a 60%, #000000 100%)',
        breeze: 'radial-gradient(ellipse at 50% 80%, #0a1f0a 0%, #050f05 60%, #000000 100%)',
        fall: 'radial-gradient(ellipse at 50% 80%, #2a1500 0%, #150a00 60%, #000000 100%)',
        sparkle: 'radial-gradient(ellipse at 50% 50%, #1a0a2e 0%, #0a0015 60%, #000000 100%)',
        glow: 'radial-gradient(ellipse at 50% 50%, #2a1a00 0%, #150d00 60%, #000000 100%)',
        bloom: 'radial-gradient(ellipse at 50% 80%, #1a0a1a 0%, #0a050a 60%, #000000 100%)',
        groom: 'radial-gradient(ellipse at 50% 80%, #0a1f0a 0%, #050f05 60%, #000000 100%)',
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: bgGradients[animationType] || bgGradients.sparkle,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 1s ease-out',
                opacity: fadeOut ? 0 : 1,
                pointerEvents: fadeOut ? 'none' : 'auto',
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                }}
            />
            {/* Center Text */}
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', px: 3 }}>
                {icon && (
                    <Typography sx={{
                        fontSize: { xs: 56, md: 80 },
                        lineHeight: 1,
                        mb: 2,
                        animation: 'sfp-float 3s ease-in-out infinite',
                        '@keyframes sfp-float': {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-12px)' },
                        },
                    }}>
                        {icon}
                    </Typography>
                )}
                <Typography
                    variant="h1"
                    sx={{
                        color: '#ffffff',
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 800,
                        fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
                        textShadow: '0 0 40px rgba(255,255,255,0.15)',
                        letterSpacing: '4px',
                        animation: 'sfp-fadeUp 1.5s ease-out',
                        '@keyframes sfp-fadeUp': {
                            '0%': { opacity: 0, transform: 'translateY(30px)' },
                            '100%': { opacity: 1, transform: 'translateY(0)' },
                        },
                    }}
                >
                    {name}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        color: 'rgba(255,255,255,0.6)',
                        mt: 2,
                        fontWeight: 300,
                        letterSpacing: '2px',
                        animation: 'sfp-fadeUp 1.5s ease-out 0.3s both',
                    }}
                >
                    EXCLUSIVE COLLECTION
                </Typography>
            </Box>
        </Box>
    );
};

// ─── Main Page Component ─────────────────────────────────────────────
const SeasonFestivalPage: React.FC<SeasonFestivalPageProps> = ({ type }) => {
    const { name } = useParams<{ name: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState<{ name: string; animationType: string; icon: string } | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [showAnimation, setShowAnimation] = useState(true);
    const [contentVisible, setContentVisible] = useState(false);

    useEffect(() => {
        if (!name) return;
        setShowAnimation(true);
        setContentVisible(false);

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = type === 'season'
                    ? await apiService.getProductsBySeason(name)
                    : await apiService.getProductsByFestival(name);

                const info = type === 'season' ? result.season : result.festival;
                setMeta(info);
                setProducts(result.products || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [name, type]);

    const handleAnimationEnd = () => {
        setShowAnimation(false);
        // Small delay so fade-out completes before content appears
        setTimeout(() => setContentVisible(true), 200);
    };

    // Map backend product shape to frontend ProductCard shape
    const mapProduct = (p: any) => ({
        id: p._id,
        name: p.name,
        price: p.discountPrice || p.price,
        originalPrice: p.discountPrice ? p.price : undefined,
        image: p.images?.[0] || '',
        category: p.category,
        description: p.description || '',
        sizes: p.sizes || [],
        colors: p.colors || [],
        inStock: p.stock > 0,
        stock: p.stock,
    });

    if (loading && !meta) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: '#D5A249' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, px: 3 }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: 'rgba(255,255,255,0.7)' }}>{error}</Typography>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: '#fff', borderColor: '#555' }}>
                    Go Back
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
            {/* Full Screen Animation Intro */}
            {showAnimation && meta && (
                <AnimationOverlay
                    animationType={meta.animationType}
                    name={meta.name}
                    icon={meta.icon}
                    onAnimationEnd={handleAnimationEnd}
                />
            )}

            {/* Page Content — appears after animation */}
            <Box sx={{
                opacity: contentVisible ? 1 : 0,
                transform: contentVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease-out',
            }}>
                {/* Hero banner */}
                <Box sx={{
                    py: { xs: 6, md: 8 },
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
                    borderBottom: '1px solid #1e1e1e',
                }}>
                    <Container maxWidth="lg">
                        {meta?.icon && (
                            <Typography sx={{ fontSize: 48, mb: 1 }}>{meta.icon}</Typography>
                        )}
                        <Typography variant="h3" sx={{
                            color: '#ffffff',
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 800,
                        }}>
                            {meta?.name}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}>
                            {products.length} {products.length === 1 ? 'product' : 'products'} in this collection
                        </Typography>
                    </Container>
                </Box>

                {/* Products */}
                <Container maxWidth="xl" sx={{ py: 5 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/shop')}
                        sx={{ mb: 3, color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
                    >
                        Back to Shop
                    </Button>

                    {products.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {products.map((p: any, idx: number) => (
                                <Box
                                    key={p._id}
                                    sx={{
                                        flex: { xs: '1 1 45%', sm: '1 1 30%', lg: '1 1 22%' },
                                        maxWidth: { xs: '48%', sm: '32%', lg: '24%' },
                                        animation: `sfp-cardIn 0.5s ease-out ${idx * 0.08}s both`,
                                        '@keyframes sfp-cardIn': {
                                            '0%': { opacity: 0, transform: 'translateY(20px)' },
                                            '100%': { opacity: 1, transform: 'translateY(0)' },
                                        },
                                    }}
                                >
                                    <ProductCard {...mapProduct(p)} />
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{
                            textAlign: 'center',
                            py: 10,
                            bgcolor: '#111',
                            borderRadius: 2,
                            border: '1px solid #1e1e1e',
                        }}>
                            <Typography variant="h5" fontWeight={600} sx={{ color: 'rgba(255,255,255,0.5)', mb: 1 }}>
                                No products yet
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', mb: 3 }}>
                                Check back soon for {meta?.name} products!
                            </Typography>
                            <Button variant="outlined" onClick={() => navigate('/shop')} sx={{ color: '#fff', borderColor: '#555' }}>
                                Browse All Products
                            </Button>
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    );
};

export default SeasonFestivalPage;
