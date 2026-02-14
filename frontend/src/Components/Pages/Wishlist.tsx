import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Paper,
  Fade,
  Zoom,
  Chip,
  Tooltip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
// FavoriteBorderIcon removed
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

// Theme Colors
const GOLD = '#D5A249';
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const LIGHT_GRAY = '#F5F5F5';
const BORDER_GRAY = '#E0E0E0';

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Zoom in timeout={500}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 4 }}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${GOLD}20, ${GOLD}05)`,
                filter: 'blur(20px)',
              }}
            />
            <FavoriteIcon
              sx={{
                fontSize: 100,
                color: GOLD,
                opacity: 0.3,
                position: 'relative',
                zIndex: 1
              }}
            />
          </Box>
        </Zoom>

        <Fade in timeout={700}>
          <Box>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                mb: 2,
                fontFamily: '"Playfair Display", serif',
                color: BLACK
              }}
            >
              Your Wishlist is Empty
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                color: '#666',
                fontSize: '1.1rem',
                maxWidth: 500,
                mx: 'auto'
              }}
            >
              Save your favorite items here and never lose track of what you love
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<LocalMallOutlinedIcon />}
              onClick={() => navigate('/shop')}
              sx={{
                bgcolor: BLACK,
                color: WHITE,
                px: 6,
                py: 1.8,
                fontWeight: 700,
                borderRadius: 2,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: '#333',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
                }
              }}
            >
              Start Shopping
            </Button>
          </Box>
        </Fade>
      </Container>
    );
  }

  const handleQuickAdd = (product: typeof items[0]) => {
    addToCart(product, product.sizes[0], product.colors[0], 1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: BLACK,
                display: 'flex',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}
            >
              <FavoriteIcon sx={{ fontSize: 32, color: GOLD }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                  fontFamily: '"Playfair Display", serif',
                  color: BLACK
                }}
              >
                My Wishlist
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', mt: 0.5 }}>
                {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={clearWishlist}
              startIcon={<DeleteOutlineIcon />}
              sx={{
                color: '#666',
                borderColor: BORDER_GRAY,
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#e91e63',
                  color: '#e91e63',
                  bgcolor: 'rgba(233, 30, 99, 0.05)'
                }
              }}
            >
              Clear All
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Product Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: { xs: 2, sm: 2.5, md: 3 }
        }}
      >
        {items.map((item, index) => (
          <Fade in timeout={300 + index * 100} key={item.id}>
            <Paper
              elevation={0}
              sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                border: `1px solid ${BORDER_GRAY}`,
                bgcolor: WHITE,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: GOLD,
                  boxShadow: '0 8px 30px rgba(213, 162, 73, 0.15)',
                  transform: 'translateY(-4px)',
                  '& .product-image': {
                    transform: 'scale(1.05)',
                  },
                  '& .quick-add-btn': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  }
                }
              }}
            >
              {/* Image Container */}
              <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '133%', // 3:4 aspect ratio
                    overflow: 'hidden',
                    bgcolor: LIGHT_GRAY,
                  }}
                >
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.name}
                    className="product-image"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />

                  {/* Stock Badge */}
                  {!item.inStock && (
                    <Chip
                      label="Out of Stock"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: 'rgba(0,0,0,0.8)',
                        color: WHITE,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                  )}
                </Box>
              </Link>

              {/* Remove Button */}
              <Tooltip title="Remove from wishlist" placement="left">
                <IconButton
                  onClick={() => removeFromWishlist(item.id)}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: '#ffebee',
                      color: '#e91e63',
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <FavoriteIcon sx={{ fontSize: 20, color: '#e91e63' }} />
                </IconButton>
              </Tooltip>

              {/* Product Details */}
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  {item.category}
                </Typography>

                <Link
                  to={`/product/${item.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{
                      mb: 1,
                      fontSize: '0.95rem',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      transition: 'color 0.2s',
                      '&:hover': { color: GOLD }
                    }}
                  >
                    {item.name}
                  </Typography>
                </Link>

                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{
                    color: BLACK,
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '1.1rem',
                    mb: 1.5
                  }}
                >
                  ₹{item.price.toLocaleString('en-IN')}
                </Typography>

                {/* Quick Add Button */}
                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  className="quick-add-btn"
                  startIcon={<ShoppingBagOutlinedIcon />}
                  onClick={() => handleQuickAdd(item)}
                  disabled={!item.inStock}
                  sx={{
                    bgcolor: BLACK,
                    color: WHITE,
                    fontWeight: 700,
                    borderRadius: 2,
                    py: 1,
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    opacity: { xs: 1, md: 0 },
                    transform: { xs: 'translateY(0)', md: 'translateY(10px)' },
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: '#333',
                    },
                    '&:disabled': {
                      bgcolor: LIGHT_GRAY,
                      color: '#999',
                    }
                  }}
                >
                  {item.inStock ? 'Quick Add' : 'Out of Stock'}
                </Button>
              </Box>
            </Paper>
          </Fade>
        ))}
      </Box>

      {/* Continue Shopping Button */}
      <Fade in timeout={800}>
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/shop')}
            sx={{
              color: '#666',
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                bgcolor: LIGHT_GRAY,
                color: BLACK,
              }
            }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Fade>
    </Container>
  );
};

export default Wishlist;
