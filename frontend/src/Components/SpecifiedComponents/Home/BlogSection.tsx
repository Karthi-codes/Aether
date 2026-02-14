import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const articles = [
  {
    title: 'How to Layer Sweaters',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
    date: 'OCT 12, 2024'
  },
  {
    title: 'The Best Gym Bags',
    image: 'https://images.unsplash.com/photo-1518602164578-cd0074062767?q=80&w=1000&auto=format&fit=crop',
    date: 'OCT 08, 2024'
  },
  {
    title: 'Winter Essentials',
    image: 'https://images.unsplash.com/photo-1548624149-f321924d6219?q=80&w=1000&auto=format&fit=crop',
    date: 'OCT 01, 2024'
  }
];

const BlogSection: React.FC = () => {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 1 }}>FROM OUR BLOG</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {articles.map((article) => (
            <Box key={article.title} sx={{ cursor: 'pointer' }}>
              <Box 
                sx={{ 
                  height: 250, 
                  backgroundImage: `url(${article.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  mb: 2
                }} 
              />
              <Typography variant="overline" color="text.secondary">{article.date}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{article.title}</Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default BlogSection;
