import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Categories: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    {
      title: 'WOMEN',
      subtitle: 'NEW COLLECTION',
      image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=1000&auto=format&fit=crop',
      link: '/shop?category=Women'
    },
    {
      title: 'MEN',
      subtitle: 'ESSENTIALS',
      image: ' https://i.pinimg.com/1200x/53/29/2a/53292afc709e42ee45061d4a21939540.jpg',
      link: '/shop?category=Men'
    },
    {
      title: 'ACCESSORIES',
      subtitle: 'FINISHING TOUCHES',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
      link: '/shop?category=Accessories'
    }
  ];

  return (
    <Box sx={{ py: 10, bgcolor: 'white' }}>
      <Container maxWidth="xl">
        <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
                mb: 6, 
                fontFamily: '"Playfair Display", serif', 
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 500,
                letterSpacing: '-0.02em'
            }}
        >
            Shop by Category
        </Typography>

        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}
        >
          {categories.map((cat, _index) => (
            <Box 
              key={cat.title}
              component={motion.div}
              whileHover="hover"
              initial="rest"
              onClick={() => navigate(cat.link)}
              data-cursor="explore"
              sx={{ 
                flex: { xs: '1 1 100%', md: '1 1 30%' },
                position: 'relative',
                height: { xs: 400, md: 600 },
                overflow: 'hidden',
                cursor: 'none', // Hide default hand cursor
                bgcolor: '#f5f5f5',
                '&:hover .bg-image': { transform: 'scale(1.1)' }
              }}
            >
                {/* Background Image */}
                <Box
                    className="bg-image"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${cat.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)',
                    }}
                />

                {/* Overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
                        transition: 'background 0.3s ease'
                    }}
                />

                {/* Content */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        p: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: 'white',
                        textAlign: 'center'
                    }}
                >
                    <Typography 
                        variant="caption" 
                        component={motion.div}
                        variants={{ rest: { y: 0, opacity: 0.8 }, hover: { y: -10, opacity: 1 } }}
                        sx={{ letterSpacing: '0.2em', mb: 1, textTransform: 'uppercase', fontWeight: 600 }}
                    >
                        {cat.subtitle}
                    </Typography>
                    
                    <Typography 
                        variant="h3" 
                        component={motion.h3}
                        variants={{ rest: { y: 0 }, hover: { y: -10 } }}
                        sx={{ 
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 500,
                            letterSpacing: '0.05em',
                            mb: 2
                        }}
                    >
                        {cat.title}
                    </Typography>

                    
                </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Categories;

