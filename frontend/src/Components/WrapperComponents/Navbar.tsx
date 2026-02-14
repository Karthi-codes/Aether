import React, { useState } from 'react';
import { AppBar, Toolbar, Box, Typography, IconButton, InputBase, Badge, Paper, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import BoltIcon from '@mui/icons-material/Bolt';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useAutoPurchase } from '../../context/AutoPurchaseContext';
import { useScratchCards } from '../../context/ScratchCardContext';
import logo from '../../assets/logo2.png';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { autoPurchaseItems } = useAutoPurchase();

  const activeAutoCount = autoPurchaseItems.filter(item => item.status === 'active').length;

  const { totalItems: wishlistItems } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const { unscratchedCount } = useScratchCards();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const megaMenuData: Record<string, Record<string, string[]>> = {
    "WOMEN'S": {
      "Clothing": ["Dresses", "Tops", "Skirts", "Pants", "Outerwear", "Hoodies"],
      "Shoes": ["Heels", "Sneakers", "Boots", "Sandals"],
      "Accessories": ["Bags", "Jewelry", "Belts", "Scarves"]
    },
    "MEN'S": {
      "Clothing": ["Shirts", "T-Shirts", "Pants", "Jackets", "Suits", "Hoodies"],
      "Shoes": ["Formal", "Sneakers", "Boots", "Causal"],
      "Accessories": ["Watches", "Belts", "Wallets", "Hats"]
    },
    "ACCESSORIES": {
      "Jewelry": ["Necklaces", "Earrings", "Rings", "Bracelets"],
      "Bags": ["Handbags", "Totes", "Clutches", "Backpacks"],
      "Other": ["Sunglasses", "Scarves", "Hats", "Gloves"]
    }
  };

  const categoryImages: Record<string, string> = {
    // Women's
    "Dresses": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80",
    "Tops": "https://images.unsplash.com/photo-1563178406-4cdc2923acce?auto=format&fit=crop&q=80",
    "Skirts": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80",
    "Pants": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80",
    "Outerwear": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80",
    "Hoodies": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80",
    "Heels": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80",
    "Sneakers": "https://images.unsplash.com/photo-1560769629-975e13f0c470?auto=format&fit=crop&q=80",
    "Boots": "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80",
    "Sandals": "https://images.unsplash.com/photo-1562273138-f46be4ebdf6e?auto=format&fit=crop&q=80",
    "Bags": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80",
    "Jewelry": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80",
    "Belts": "https://images.unsplash.com/photo-1624223046422-796d31e09469?auto=format&fit=crop&q=80",
    "Scarves": "https://images.unsplash.com/photo-1584030373081-f37b7bb2fa8e?auto=format&fit=crop&q=80",

    // Men's
    "Shirts": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80",
    "T-Shirts": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80",
    "Jackets": "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&q=80",
    "Suits": "https://images.unsplash.com/photo-1593032465175-d81f0f53d35b?auto=format&fit=crop&q=80",
    "Formal": "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&q=80",
    "Watches": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80",
    "Wallets": "https://images.unsplash.com/photo-1627123424574-181ce5171c98?auto=format&fit=crop&q=80",
    "Hats": "https://images.unsplash.com/photo-1533827432537-70133748f5c8?auto=format&fit=crop&q=80",

    // Accessories
    "Necklaces": "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80",
    "Earrings": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80",
    "Rings": "https://images.unsplash.com/photo-1605100804763-ebea2406a95f?auto=format&fit=crop&q=80",
    "Bracelets": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80",
    "Handbags": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80",
    "Totes": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80",
    "Clutches": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80",
    "Backpacks": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80",
    "Sunglasses": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80",
    "Gloves": "https://images.unsplash.com/photo-1542284752-19e0b8d2d644?auto=format&fit=crop&q=80"
  };

  const categories = [
    { name: "WOMEN'S", path: '/shop?category=Women' },
    { name: "MEN'S", path: '/shop?category=Men' },
    { name: 'ACCESSORIES', path: '/shop?category=Accessories' },
  ];



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <Toolbar sx={{ height: 80, px: { xs: 2, md: 4 } }}>

          {/* Left: Mobile Menu & Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <IconButton
              sx={{ display: { md: 'none' } }}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  component="img"
                  src={logo}
                  alt="Aether Logo"
                  sx={{
                    height: { xs: 50, sm: 70, md: 130 },
                    width: 'auto',
                    maxHeight: '100%'
                  }}
                />

              </Box>
            </Link>
          </Box>

          {/* Center: Navigation Links (Desktop) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, height: '100%', alignItems: 'center', flex: 1, justifyContent: 'center', mx: 4 }}>
            <Box
              sx={{ display: 'flex', gap: 3, height: '100%', alignItems: 'center' }}
              onMouseLeave={() => setHoverTimeout(setTimeout(() => setActiveCategory(null), 150))}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: 0.8,
                  letterSpacing: '1px',
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': { opacity: 1, color: '#D5A249' },
                }}
                onClick={() => handleNavClick('/shop')}
                onMouseEnter={() => {
                  if (hoverTimeout) clearTimeout(hoverTimeout);
                  setActiveCategory(null); // Close others
                }}
              >
                SHOP
              </Typography>

              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: 0.8,
                  letterSpacing: '1px',
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': { opacity: 1, color: '#D5A249' },
                }}
                onClick={() => handleNavClick('/style-studio')}
                onMouseEnter={() => {
                  if (hoverTimeout) clearTimeout(hoverTimeout);
                  setActiveCategory(null); // Close others
                }}
              >
                STYLE STUDIO
              </Typography>

              {Object.keys(megaMenuData).map((cat) => (
                <Box
                  key={cat}
                  sx={{ height: '100%', display: 'flex', alignItems: 'center' }}
                  onMouseEnter={() => {
                    if (hoverTimeout) clearTimeout(hoverTimeout);
                    setActiveCategory(cat);
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: activeCategory === cat ? 1 : 0.8,
                      color: activeCategory === cat ? '#D5A249' : 'inherit',
                      letterSpacing: '1px',
                      position: 'relative',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: activeCategory === cat ? '2px solid #D5A249' : '2px solid transparent',
                      transition: 'all 0.3s',
                      '&:hover': { opacity: 1, color: '#D5A249' },
                    }}
                    onClick={() => {
                      handleNavClick(`/shop?category=${cat === "WOMEN'S" ? 'Women' : cat === "MEN'S" ? 'Men' : 'Accessories'}`);
                      setActiveCategory(null);
                    }}
                  >
                    {cat}
                  </Typography>
                </Box>
              ))}


              {/* Mega Menu Dropdown */}
              <Paper
                sx={{
                  position: 'fixed',
                  top: 90, // Height of Toolbar
                  left: 0,
                  right: 0,
                  width: '100%',
                  bgcolor: 'background.paper',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  zIndex: 1300,
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease',
                  opacity: activeCategory ? 1 : 0,
                  visibility: activeCategory ? 'visible' : 'hidden',
                  transform: activeCategory ? 'translateY(0)' : 'translateY(-10px)',
                  pointerEvents: activeCategory ? 'auto' : 'none',
                }}
                onMouseEnter={() => {
                  if (hoverTimeout) clearTimeout(hoverTimeout);
                }}
                onMouseLeave={() => setHoverTimeout(setTimeout(() => setActiveCategory(null), 150))}
              >
                <Box sx={{ maxWidth: '1280px', mx: 'auto', p: 4, display: 'flex', gap: 8 }}>
                  {/* Left Side: Categories */}
                  <Box sx={{ flex: 1, display: 'flex', gap: 8 }}>
                    {activeCategory && megaMenuData[activeCategory] && Object.entries(megaMenuData[activeCategory]).map(([subCat, items]) => (
                      <Box key={subCat}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            color: '#D5A249',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}
                        >
                          {subCat}
                        </Typography>
                        <List dense disablePadding>
                          {(items as string[]).map((item) => (
                            <ListItem
                              key={item}
                              disablePadding
                              sx={{
                                mb: 1,
                                cursor: 'pointer',
                                '&:hover span': { color: 'text.primary', transform: 'translateX(5px)' }
                              }}
                              onClick={() => {
                                handleNavClick(`/shop?category=${activeCategory === "WOMEN'S" ? 'Women' : activeCategory === "MEN'S" ? 'Men' : 'Accessories'}&sub=${item}`);
                                setActiveCategory(null);
                              }}
                              onMouseEnter={() => setPreviewImage(categoryImages[item] || null)}
                              onMouseLeave={() => setPreviewImage(null)}
                            >
                              <ListItemText
                                primary={item}
                                sx={{
                                  '& span': {
                                    color: 'text.secondary',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s',
                                    fontWeight: 500
                                  }
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ))}
                  </Box>

                  {/* Right Side: Featured Image/Card */}
                  <Box sx={{ width: 300, display: { xs: 'none', md: 'block' } }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: '250px',
                        bgcolor: '#f5f5f5',
                        borderRadius: 2,
                        backgroundImage: previewImage
                          ? `url(${previewImage})`
                          : activeCategory === "WOMEN'S"
                            ? 'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80)'
                            : activeCategory === "MEN'S"
                              ? 'url(https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80)'
                              : 'url(https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80)',
                        backgroundSize: 'cover',
                        transition: 'background-image 0.3s ease-in-out',
                        backgroundPosition: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover .overlay': { opacity: 1 }
                      }}
                    >
                      <Box
                        className="overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          bgcolor: 'rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s'
                        }}
                      >
                        <Typography variant="h6" color="white" fontWeight={700}>NEW ARRIVALS</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Right: Search & Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {/* Search */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}>
              <Paper
                component="form"
                onSubmit={handleSearch}
                sx={{
                  p: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  width: 250,
                  borderRadius: 20,
                  bgcolor: '#f5f5f5',
                  boxShadow: 'none',
                  border: '1px solid #eee',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: '#f0f0f0',
                    borderColor: '#D5A249'
                  },
                  '&:focus-within': {
                    bgcolor: 'white',
                    borderColor: '#D5A249',
                    boxShadow: '0 0 0 2px rgba(213, 162, 73, 0.2)'
                  }
                }}
              >
                <InputBase
                  sx={{
                    ml: 2,
                    flex: 1,
                    fontSize: '0.9rem',
                    '& ::placeholder': {
                      color: '#666',
                      opacity: 1
                    }
                  }}
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <IconButton type="submit" sx={{ p: '8px', color: '#D5A249' }} aria-label="search">
                  <SearchIcon sx={{ fontSize: 22 }} />
                </IconButton>
              </Paper>
            </Box>

            {/* Mobile Search */}
            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#2C2C2C' }}
              onClick={() => navigate('/shop')}
            >
              <SearchIcon sx={{ fontSize: 22 }} />
            </IconButton>

            <IconButton
              component={Link}
              to="/wishlist"
              sx={{ color: '#2C2C2C', ml: { md: 0.5 } }}
            >
              <Badge badgeContent={wishlistItems} color="secondary">
                <FavoriteBorderIcon sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>

            <IconButton component={Link} to="/checkout/cart" sx={{ color: '#2C2C2C' }}>
              <Badge
                badgeContent={totalItems}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: '#D5A249',
                    color: 'black',
                    fontWeight: 700
                  }
                }}
              >
                <ShoppingBagOutlinedIcon sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>

            {/* Wallet */}
            <IconButton
              component={Link}
              to="/wallet"
              sx={{
                color: '#000000ff',
                display: { xs: 'none', sm: 'flex' },
                borderRadius: '50%',
                p: 1,
                ml: 1,
                transition: 'all 0.3s',
              }}
            >
              <AccountBalanceWalletIcon sx={{ fontSize: 22 }} />
            </IconButton>

            {/* SmartAutoPay */}
            <IconButton
              component={Link}
              to="/smart-autopay"
              sx={{
                color: activeAutoCount > 0 ? '#D5A249' : '#2C2C2C',
                display: { xs: 'none', sm: 'flex' },
                transition: 'all 0.3s',
                animation: activeAutoCount > 0 ? 'pulse 2s infinite' : 'none',
              }}
            >
              <Badge
                badgeContent={activeAutoCount}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: '#D5A249',
                    color: 'black',
                    fontWeight: 700
                  }
                }}
              >
                <BoltIcon sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>

            {/* Rewards */}
            {isAuthenticated && (
              <IconButton
                component={Link}
                to="/rewards"
                sx={{
                  color: unscratchedCount > 0 ? '#D5A249' : '#2C2C2C',
                  display: { xs: 'none', sm: 'flex' },
                  transition: 'all 0.3s',
                  animation: unscratchedCount > 0 ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' }
                  }
                }}
              >
                <Badge
                  badgeContent={unscratchedCount}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: '#e91e63',
                      color: 'white',
                      fontWeight: 700
                    }
                  }}
                >
                  <CardGiftcardIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>
            )}

            {/* Admin Dashboard */}
            {isAuthenticated && user?.role === 'admin' && (
              <IconButton component={Link} to="/admin" sx={{ color: '#D4AF37', display: { xs: 'none', sm: 'flex' } }}>
                <Box component="span" sx={{ fontSize: '1.3rem' }}>👑</Box>
              </IconButton>
            )}

            {/* Account */}
            <IconButton
              component={Link}
              to="/account"
              sx={{ color: '#2C2C2C', display: { xs: 'none', sm: 'flex' }, p: 0.5 }}
            >
              {isAuthenticated && user?.profilePhoto ? (
                <Box
                  component="img"
                  src={user.profilePhoto}
                  alt={user.name}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #D4AF37'
                  }}
                />
              ) : (
                <PersonOutlineIcon sx={{ fontSize: 22 }} />
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 300 } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src={logo}
              alt="Aether"
              sx={{
                height: 50,
                width: 'auto'
              }}
            />
            <Typography variant="h6" fontWeight={800}>AETHER</Typography>
          </Box>
          <IconButton onClick={() => setIsMobileMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Mobile Search */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Paper
            component="form"
            onSubmit={(e) => {
              handleSearch(e);
              setIsMobileMenuOpen(false);
            }}
            sx={{
              p: '2px 8px',
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#f5f5f5',
              boxShadow: 'none',
              borderRadius: 1
            }}
          >
            <InputBase
              sx={{ flex: 1, fontSize: '0.9rem' }}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <IconButton type="submit" size="small">
              <SearchIcon />
            </IconButton>
          </Paper>
        </Box>

        <Divider />

        <List sx={{ px: 1 }}>
          <ListItem
            onClick={() => handleNavClick('/shop')}
            sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <ListItemText
              primary="SHOP ALL"
              primaryTypographyProps={{ fontWeight: 700, letterSpacing: '1px' }}
            />
          </ListItem>
          <ListItem
            onClick={() => handleNavClick('/style-studio')}
            sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <ListItemText
              primary="STYLE STUDIO"
              primaryTypographyProps={{ fontWeight: 700, letterSpacing: '1px' }}
            />
          </ListItem>
          {categories.map((cat) => (
            <ListItem
              key={cat.name}
              onClick={() => handleNavClick(cat.path)}
              sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              <ListItemText
                primary={cat.name}
                primaryTypographyProps={{ fontWeight: 600, letterSpacing: '1px' }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        <List sx={{ px: 1 }}>
          <ListItem onClick={() => handleNavClick('/checkout/cart')} sx={{ cursor: 'pointer', borderRadius: 1 }}>
            <ListItemText primary="Shopping Bag" />
            {totalItems > 0 && (
              <Badge badgeContent={totalItems} sx={{ '& .MuiBadge-badge': { bgcolor: '#D5A249', color: 'black' } }} />
            )}
          </ListItem>
          <ListItem onClick={() => handleNavClick('/wishlist')} sx={{ cursor: 'pointer', borderRadius: 1 }}>
            <ListItemText primary="Wishlist" />
            {wishlistItems > 0 && (
              <Badge badgeContent={wishlistItems} color="secondary" />
            )}
          </ListItem>
          <ListItem onClick={() => handleNavClick('/account')} sx={{ cursor: 'pointer', borderRadius: 1 }}>
            <ListItemText primary="My Account" />
          </ListItem>
          <ListItem onClick={() => handleNavClick('/wallet')} sx={{ cursor: 'pointer', borderRadius: 1 }}>
            <ListItemText primary={isAuthenticated ? `Wallet (₹${user?.walletBalance?.toLocaleString('en-IN') || '0'})` : "Wallet"} />
          </ListItem>

          <ListItem onClick={() => handleNavClick('/smart-autopay')} sx={{ cursor: 'pointer', borderRadius: 1 }}>
            <ListItemText primary="SmartAutoPay" primaryTypographyProps={{ fontWeight: 600 }} />
            {activeAutoCount > 0 && (
              <Badge badgeContent={activeAutoCount} sx={{ '& .MuiBadge-badge': { bgcolor: '#D5A249', color: 'black' } }} />
            )}
          </ListItem>
          {isAuthenticated && user?.role === 'admin' && (
            <ListItem onClick={() => handleNavClick('/admin')} sx={{ cursor: 'pointer', borderRadius: 1 }}>
              <ListItemText primary="Admin Dashboard" primaryTypographyProps={{ color: '#D4AF37', fontWeight: 'bold' }} />
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
