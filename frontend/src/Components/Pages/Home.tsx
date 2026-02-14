import React from 'react';
import { Box } from '@mui/material';
import Hero from '../SpecifiedComponents/Home/Hero';
import Categories from '../SpecifiedComponents/Home/Categories';
import ProductTabs from '../SpecifiedComponents/Home/ProductTabs';
import SplitBanner from '../SpecifiedComponents/Home/SplitBanner';
import Brands from '../SpecifiedComponents/Home/Brands';
import InstagramFeed from '../SpecifiedComponents/Home/InstagramFeed';
import Newsletter from '../SpecifiedComponents/Home/Newsletter';

const Home: React.FC = () => {
  return (
    <Box>
      <Hero />
      <Categories />
      <ProductTabs />
      <SplitBanner /> {/* Reuse for "Trending Now" section layout */}
      <Brands />
      <InstagramFeed />
      <Newsletter />
    </Box>
  );
};

export default Home;

