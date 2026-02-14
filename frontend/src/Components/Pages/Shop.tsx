import React, { useState, useMemo, useEffect } from 'react';
import { Box, Container, Typography, Chip, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel, Slider, Drawer, IconButton, Button, Pagination, InputBase } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import RecyclingIcon from '@mui/icons-material/Recycling';
import ProductCard from '../SpecifiedComponents/Product/ProductCard';
import { products as staticProducts, categories } from '../../data/products';

import type { Product } from '../../types';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CelebrationIcon from '@mui/icons-material/Celebration';

const PRODUCTS_PER_PAGE = 12;

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();


  // Get initial values from URL params
  const initialCategory = searchParams.get('category') || 'All';
  const initialSubCategory = searchParams.get('sub');
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(initialSubCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<number[]>([0, 50000]);
  const [localPriceRange, setLocalPriceRange] = useState<number[]>([0, 50000]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSeasons, setActiveSeasons] = useState<any[]>([]);
  const [activeFestivals, setActiveFestivals] = useState<any[]>([]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products');
        if (response.ok) {
          const data = await response.json();
          // Map backend data to frontend format
          const mappedProducts = data.map((p: any) => ({
            ...p,
            id: p._id, // Ensure ID is mapped
            image: p.images && p.images.length > 0 ? p.images[0] : '',
          }));
          setProducts(mappedProducts);
        } else {
          // Fallback to static products if API fails
          console.warn('API response not OK, using static products');
          setProducts(staticProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to static products on error
        setProducts(staticProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    fetchActiveSeasons();
    fetchActiveFestivals();
  }, []);

  const fetchActiveSeasons = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/seasons/active');
      if (response.ok) {
        const data = await response.json();
        setActiveSeasons(data);
      }
    } catch (error) {
      console.error('Error fetching active seasons:', error);
    }
  };

  const fetchActiveFestivals = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/festivals/active');
      if (response.ok) {
        const data = await response.json();
        setActiveFestivals(data);
      }
    } catch (error) {
      console.error('Error fetching active festivals:', error);
    }
  };

  // Sync URL params with state (URL -> State)
  useEffect(() => {
    const urlCategory = searchParams.get('category') || 'All';
    const urlSub = searchParams.get('sub');
    const urlSearch = searchParams.get('search') || '';

    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
    if (urlSub !== selectedSubCategory) setSelectedSubCategory(urlSub);
    if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
  }, [searchParams]);

  // Sync state with URL params (State -> URL)
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (selectedSubCategory) params.set('sub', selectedSubCategory);
    if (searchQuery) params.set('search', searchQuery);

    // Only update if params actually changed to avoid recursion
    const currentParams = searchParams.toString();
    const newParams = params.toString();
    if (currentParams !== newParams) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedCategory, selectedSubCategory, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubCategory, searchQuery, sortBy, priceRange]);

  // Sync local slider state when filters are cleared or changed externally
  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory === 'Hub') {
      // Only show refurbished products in Hub
      result = result.filter(p => p.isRefurbished);
    } else if (selectedCategory === 'All') {
      // Exclude refurbished products from "All" category - they should only appear in Hub
      result = result.filter(p => !p.isRefurbished);
    } else {
      // For specific categories (Men, Women, etc.), exclude refurbished products
      if (selectedCategory === 'Men') {
        result = result.filter(p => !p.isRefurbished && (p.category === 'Men' || p.category === 'Unisex'));
      } else if (selectedCategory === 'Women') {
        result = result.filter(p => !p.isRefurbished && (p.category === 'Women' || p.category === 'Unisex'));
      } else {
        result = result.filter(p => !p.isRefurbished && p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
      }
    }

    // Filter by sub-category
    if (selectedSubCategory) {
      result = result.filter(p => p.subCategory === selectedSubCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(query)) ||
        p.description.toLowerCase().includes(query) ||
        p.colors.some(c => c.toLowerCase().includes(query))
      );
    }

    // Filter by price
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Featured - keep original order
        break;
    }

    return result;
  }, [products, selectedCategory, selectedSubCategory, searchQuery, sortBy, priceRange]);



  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null); // Clear sub-category when changing main category
    setMobileFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSelectedSubCategory(null);
    setSearchQuery('');
    setPriceRange([0, 50000]);
    setSortBy('featured');
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedSubCategory || searchQuery || priceRange[0] > 0 || priceRange[1] < 50000;

  const FilterContent = () => (
    <Box sx={{ p: { xs: 3, md: 0 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>Filters</Typography>
        {hasActiveFilters && (
          <Button size="small" onClick={handleClearFilters} sx={{ color: '#D5A249' }}>
            Clear All
          </Button>
        )}
      </Box>

      {/* Price Range */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 3, letterSpacing: 0.5 }}>PRICE RANGE</Typography>

        <Box sx={{ px: 1 }}>
          <Slider
            value={localPriceRange}
            onChange={(_, value) => setLocalPriceRange(value as number[])}
            onChangeCommitted={(_, value) => setPriceRange(value as number[])}
            valueLabelDisplay="auto"
            min={0}
            max={50000}
            disableSwap
            sx={{
              color: '#D5A249',
              height: 3,
              padding: '13px 0',
              '& .MuiSlider-thumb': {
                height: 20,
                width: 20,
                backgroundColor: '#D5A249',
                border: 'none',
                boxShadow: 'none',
                transition: '0.2s ease',
                transitionProperty: 'width, height, box-shadow, background-color',
                '&:before': {
                  display: 'none'
                },
                '&:hover, &.Mui-active': {
                  boxShadow: '0 0 0 8px rgba(213, 162, 73, 0.1)',
                  width: 24,
                  height: 24,
                },
              },
              '& .MuiSlider-valueLabel': {
                lineHeight: 1.2,
                fontSize: 12,
                background: 'unset',
                padding: 0,
                width: 32,
                height: 32,
                borderRadius: '50% 50% 50% 0',
                backgroundColor: '#D5A249',
                transformOrigin: 'bottom left',
                transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
                '&:before': { display: 'none' },
                '&.MuiSlider-valueLabelOpen': {
                  transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
                },
                '& > *': {
                  transform: 'rotate(45deg)',
                },
              },
              '& .MuiSlider-track': {
                border: 'none',
                height: 3,
              },
              '& .MuiSlider-rail': {
                opacity: 0.3,
                backgroundColor: 'text.secondary',
                height: 3,
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Box sx={{
            border: '1px solid #eee',
            borderRadius: 2,
            px: 2,
            py: 1,
            minWidth: 80
          }}>
            <Typography variant="caption" color="text.secondary" display="block">Min</Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="body2" fontWeight={600} mr={0.5}>₹</Typography>
              <InputBase
                value={localPriceRange[0]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val) && val >= 0 && val <= 50000) {
                    setLocalPriceRange([val, localPriceRange[1]]);
                  }
                }}
                onBlur={() => {
                  if (localPriceRange[0] > localPriceRange[1]) {
                    setLocalPriceRange([localPriceRange[1], localPriceRange[1]]);
                    setPriceRange([localPriceRange[1], localPriceRange[1]]);
                  } else {
                    setPriceRange(localPriceRange);
                  }
                }}
                inputProps={{
                  min: 0,
                  max: 50000,
                  type: 'number',
                  style: {
                    padding: 0,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'inherit'
                  }
                }}
                sx={{ color: 'inherit' }}
              />
            </Box>
          </Box>
          <Box sx={{ width: 10, height: 1, bgcolor: 'text.disabled' }} />
          <Box sx={{
            border: '1px solid #eee',
            borderRadius: 2,
            px: 2,
            py: 1,
            minWidth: 80,
            textAlign: 'right'
          }}>
            <Typography variant="caption" color="text.secondary" display="block">Max</Typography>
            <Box display="flex" alignItems="center" justifyContent="flex-end">
              <Typography variant="body2" fontWeight={600} mr={0.5}>₹</Typography>
              <InputBase
                value={localPriceRange[1]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val) && val >= 0 && val <= 50000) {
                    setLocalPriceRange([localPriceRange[0], val]);
                  }
                }}
                onBlur={() => {
                  if (localPriceRange[1] < localPriceRange[0]) {
                    setLocalPriceRange([localPriceRange[0], localPriceRange[0]]);
                    setPriceRange([localPriceRange[0], localPriceRange[0]]);
                  } else {
                    setPriceRange(localPriceRange);
                  }
                }}
                inputProps={{
                  min: 0,
                  max: 50000,
                  type: 'number',
                  style: {
                    padding: 0,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textAlign: 'right',
                    color: 'inherit'
                  }
                }}
                sx={{ color: 'inherit' }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Categories */}
      <Box>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Categories</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {categories.map(cat => (
            <Box
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              sx={{
                py: 1.5,
                px: 2,
                cursor: 'pointer',
                borderRadius: 1,
                bgcolor: selectedCategory === cat ? '#2C2C2C' : 'transparent',
                color: selectedCategory === cat ? 'white' : 'text.primary',
                transition: 'all 0.2s',
                fontWeight: selectedCategory === cat ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': { bgcolor: selectedCategory === cat ? '#2C2C2C' : '#f5f5f5' }
              }}
            >
              {cat === 'Hub' && <RecyclingIcon sx={{ fontSize: 18 }} />}
              <Typography variant="body2">{cat}</Typography>
            </Box>
          ))}

          {/* Active Seasons & Festivals in Sidebar */}
          {(activeSeasons.length > 0 || activeFestivals.length > 0) && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: activeSeasons.length > 0 ? '#64B5F6' : '#FF6B35' }}>
                Collections
              </Typography>
              {activeSeasons.map((season: any) => (
                <Box
                  key={season._id}
                  onClick={() => navigate(`/season/${season.name.toLowerCase()}`)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    cursor: 'pointer',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    color: 'text.primary',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  {season.name === 'Winter' ? <AcUnitIcon sx={{ fontSize: 20, color: '#64B5F6' }} /> :
                    season.name === 'Summer' ? <WbSunnyIcon sx={{ fontSize: 20, color: '#FFB74D' }} /> :
                      season.name === 'Rainy' ? <WaterDropIcon sx={{ fontSize: 20, color: '#4FC3F7' }} /> : null}
                  <Typography variant="body2">{season.name}</Typography>
                </Box>
              ))}
              {activeFestivals.map((festival: any) => (
                <Box
                  key={festival._id}
                  onClick={() => navigate(`/festival/${festival.name.toLowerCase()}`)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    cursor: 'pointer',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    color: 'text.primary',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <CelebrationIcon sx={{
                    fontSize: 20,
                    color: festival.name === 'Deepavali' ? '#FF6B35' :
                      festival.name === 'Pongal' ? '#4CAF50' :
                        festival.name === 'Christmas' ? '#E53935' : '#D4AF37'
                  }} />
                  <Typography variant="body2">{festival.name}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Hero Banner */}
      <Box sx={{ bgcolor: '#2C2C2C', color: 'white', py: 8, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="overline" sx={{ color: '#D5A249', letterSpacing: 3 }}>
            {selectedCategory === 'Hub' ? 'SUSTAINABLE SHOPPING' : 'THE COLLECTION'}
          </Typography>
          <Typography variant="h2" fontWeight={800} sx={{ mt: 1, fontFamily: '"Playfair Display", serif' }}>
            {selectedCategory === 'All' ? 'Shop All' : selectedCategory === 'Hub' ? 'Outlet Hub' : selectedCategory}
          </Typography>
          {selectedSubCategory && (
            <Typography variant="h5" sx={{ mt: 1, color: '#D5A249', fontFamily: '"Playfair Display", serif' }}>
              {selectedSubCategory}
            </Typography>
          )}
          <Typography variant="body1" sx={{ opacity: 0.8, mt: 2 }}>
            {selectedCategory === 'Hub'
              ? 'Premium returned items, professionally inspected and verified.'
              : 'Discover our curated selection of premium essentials'}
          </Typography>
        </Container>
      </Box>

      {loading ? (
        <Container maxWidth="xl" sx={{ py: 10, textAlign: 'center' }}>
          <Typography variant="h5">Loading Products...</Typography>
        </Container>
      ) : (
        <Container maxWidth="xl" sx={{ py: 6 }}>
          {/* Top Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            {/* Category Chips (Desktop) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <Chip
                  key={cat}
                  label={cat}
                  icon={cat === 'Hub' ? <RecyclingIcon sx={{ fontSize: '16px !important' }} /> : undefined}
                  onClick={() => handleCategoryChange(cat)}
                  sx={{
                    bgcolor: selectedCategory === cat ? '#2C2C2C' : 'white',
                    color: selectedCategory === cat ? 'white' : 'text.primary',
                    fontWeight: 600,
                    '&:hover': { bgcolor: selectedCategory === cat ? '#2C2C2C' : '#f0f0f0' },
                    '& .MuiChip-icon': {
                      color: selectedCategory === cat ? 'white' : 'inherit'
                    }
                  }}
                />
              ))}
              {selectedSubCategory && (
                <Chip
                  label={selectedSubCategory}
                  onDelete={() => setSelectedSubCategory(null)}
                  sx={{
                    bgcolor: '#2C2C2C',
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-deleteIcon': {
                      color: 'white',
                      '&:hover': { color: '#ddd' }
                    }
                  }}
                />
              )}
            </Box>

            {/* Mobile Filter Button */}
            <Button
              startIcon={<TuneIcon />}
              onClick={() => setMobileFiltersOpen(true)}
              variant="outlined"
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#2C2C2C', borderColor: '#2C2C2C' }}
            >
              Filters {hasActiveFilters && `(${selectedCategory !== 'All' ? 1 : 0})`}
            </Button>

            {/* Search & Sort */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: { xs: 1, md: 0 } }}>
              <TextField
                size="small"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'inherit' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  width: { xs: '100%', sm: 220 },
                  bgcolor: 'white',
                  '& .MuiInputBase-input': {
                    color: 'inherit'
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'inherit',
                    opacity: 1
                  }
                }}
              />
              <FormControl size="small" sx={{ minWidth: 160, bgcolor: 'white' }}>
                <InputLabel sx={{ color: 'inherit', '&.Mui-focused': { color: 'inherit' } }}>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{
                    color: 'inherit',
                    '& .MuiSvgIcon-root': {
                      color: 'inherit'
                    }
                  }}
                >
                  <MenuItem value="featured">Featured</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="name">Name: A-Z</MenuItem>
                  <MenuItem value="name-desc">Name: Z-A</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 4 }}>
            {/* Sidebar Filters (Desktop) */}
            <Box
              sx={{
                width: { xs: '100%', md: 280 },
                flexShrink: 0,
                display: { xs: 'none', md: 'block' }
              }}
            >
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, position: 'sticky', top: 100 }}>
                <FilterContent />
              </Box>
            </Box>

            {/* Product Grid */}
            <Box sx={{ flex: 1 }}>

              {selectedCategory === 'All' && !searchQuery && priceRange[0] === 0 && priceRange[1] === 50000 ? (
                // Sectioned view for "All" category
                <>
                  {/* Men's Section */}
                  {(() => {
                    const menProducts = filteredProducts.filter(p => p.category === 'Men' || (p.category === 'Unisex' && !filteredProducts.some(fp => fp.id === p.id && fp.category === 'Men')));
                    return menProducts.length > 0 && (
                      <Box sx={{ mb: 6 }}>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          sx={{
                            mb: 3,
                            pb: 2,
                            borderBottom: '3px solid #D5A249',
                            fontFamily: '"Playfair Display", serif'
                          }}
                        >
                          Men's Collection
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 3
                          }}
                        >
                          {menProducts.slice(0, 6).map(product => (
                            <Box
                              key={product.id}
                              sx={{
                                flex: { xs: '0 0 calc(50% - 12px)', sm: '0 0 calc(50% - 12px)', md: '0 0 calc(33.333% - 16px)' },
                                maxWidth: { xs: 'calc(50% - 12px)', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' }
                              }}
                            >
                              <ProductCard {...product} />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    );
                  })()}

                  {/* Women's Section */}
                  {(() => {
                    const womenProducts = filteredProducts.filter(p => p.category === 'Women' || (p.category === 'Unisex' && !filteredProducts.some(fp => fp.id === p.id && fp.category === 'Women')));
                    return womenProducts.length > 0 && (
                      <Box sx={{ mb: 6 }}>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          sx={{
                            mb: 3,
                            pb: 2,
                            borderBottom: '3px solid #D5A249',
                            fontFamily: '"Playfair Display", serif'
                          }}
                        >
                          Women's Collection
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 3
                          }}
                        >
                          {womenProducts.slice(0, 6).map(product => (
                            <Box
                              key={product.id}
                              sx={{
                                flex: { xs: '0 0 calc(50% - 12px)', sm: '0 0 calc(50% - 12px)', md: '0 0 calc(33.333% - 16px)' },
                                maxWidth: { xs: 'calc(50% - 12px)', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' }
                              }}
                            >
                              <ProductCard {...product} />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    );
                  })()}

                  {/* Accessories Section */}
                  {(() => {
                    const accessoriesProducts = filteredProducts.filter(p => p.category === 'Accessories');
                    return accessoriesProducts.length > 0 && (
                      <Box sx={{ mb: 6 }}>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          sx={{
                            mb: 3,
                            pb: 2,
                            borderBottom: '3px solid #D5A249',
                            fontFamily: '"Playfair Display", serif'
                          }}
                        >
                          Accessories
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 3
                          }}
                        >
                          {accessoriesProducts.slice(0, 6).map(product => (
                            <Box
                              key={product.id}
                              sx={{
                                flex: { xs: '0 0 calc(50% - 12px)', sm: '0 0 calc(50% - 12px)', md: '0 0 calc(33.333% - 16px)' },
                                maxWidth: { xs: 'calc(50% - 12px)', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' }
                              }}
                            >
                              <ProductCard {...product} />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    );
                  })()}

                  {/* Footwear Section */}
                  {(() => {
                    const footwearProducts = filteredProducts.filter(p =>
                      p.subCategory && ['Heels', 'Sneakers', 'Boots', 'Sandals', 'Formal'].includes(p.subCategory)
                    );
                    return footwearProducts.length > 0 && (
                      <Box sx={{ mb: 6 }}>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          sx={{
                            mb: 3,
                            pb: 2,
                            borderBottom: '3px solid #D5A249',
                            fontFamily: '"Playfair Display", serif'
                          }}
                        >
                          Footwear
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 3
                          }}
                        >
                          {footwearProducts.slice(0, 6).map(product => (
                            <Box
                              key={product.id}
                              sx={{
                                flex: { xs: '0 0 calc(50% - 12px)', sm: '0 0 calc(50% - 12px)', md: '0 0 calc(33.333% - 16px)' },
                                maxWidth: { xs: 'calc(50% - 12px)', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' }
                              }}
                            >
                              <ProductCard {...product} />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    );
                  })()}

                  {/* Outerwear Section */}
                  {(() => {
                    const outerwearProducts = filteredProducts.filter(p =>
                      p.subCategory && ['Outerwear', 'Jackets', 'Coats'].includes(p.subCategory)
                    );
                    return outerwearProducts.length > 0 && (
                      <Box sx={{ mb: 6 }}>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          sx={{
                            mb: 3,
                            pb: 2,
                            borderBottom: '3px solid #D5A249',
                            fontFamily: '"Playfair Display", serif'
                          }}
                        >
                          Outerwear
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 3
                          }}
                        >
                          {outerwearProducts.slice(0, 6).map(product => (
                            <Box
                              key={product.id}
                              sx={{
                                flex: { xs: '0 0 calc(50% - 12px)', sm: '0 0 calc(50% - 12px)', md: '0 0 calc(33.333% - 16px)' },
                                maxWidth: { xs: 'calc(50% - 12px)', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' }
                              }}
                            >
                              <ProductCard {...product} />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    );
                  })()}
                </>
              ) : (
                // Regular grid view for specific categories or filtered results
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Showing {paginatedProducts.length} of {filteredProducts.length} products
                    </Typography>
                    {hasActiveFilters && (
                      <Button size="small" onClick={handleClearFilters} startIcon={<CloseIcon />} sx={{ display: { md: 'none' } }}>
                        Clear Filters
                      </Button>
                    )}
                  </Box>

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
                              flex: { xs: '0 0 calc(50% - 12px)', sm: '0 0 calc(50% - 12px)', md: '0 0 calc(33.333% - 16px)' },
                              maxWidth: { xs: 'calc(50% - 12px)', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' }
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
                      <FilterListIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                      <Typography variant="h5" fontWeight={600} color="text.secondary">No products found</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                        Try adjusting your filters or search terms
                      </Typography>
                      <Button variant="outlined" onClick={handleClearFilters}>
                        Clear All Filters
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Container>
      )}

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 300 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setMobileFiltersOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <FilterContent />
      </Drawer>
    </Box>
  );
};

export default Shop;
