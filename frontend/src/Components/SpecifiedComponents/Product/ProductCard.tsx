import React, { useState } from 'react';
import { Box, Typography, IconButton, Snackbar, Alert, Dialog, DialogContent, Button, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { Product } from '../../../types';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

interface ProductCardProps extends Product { }

const ProductCard: React.FC<ProductCardProps> = (product) => {
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 15;
  const isOutletProduct = product.isRefurbished === true;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(product.id);
      setSnackbar({ open: true, message: 'Removed from wishlist', severity: 'success' });
    } else {
      addToWishlist(product);
      setSnackbar({ open: true, message: 'Added to wishlist ❤️', severity: 'success' });
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setSelectedSize(product.sizes[0] || '');
    setSelectedColor(product.colors[0] || '');
    setShowQuickAdd(true);
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setSnackbar({ open: true, message: 'Please select size and color', severity: 'error' });
      return;
    }
    addToCart(product, selectedSize, selectedColor, 1);
    setSnackbar({ open: true, message: 'Added to bag ✓', severity: 'success' });
    setShowQuickAdd(false);
  };

  return (
    <>
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{ position: 'relative', cursor: isOutOfStock ? 'default' : 'pointer', opacity: isOutOfStock ? 0.8 : 1 }}
      >
        {/* Image Container */}
        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2, bgcolor: '#f5f5f5', pt: '133.33%' }}> {/* 3:4 aspect ratio */}
          <Link to={`/product/${product.id}`} style={{ pointerEvents: isOutOfStock ? 'none' : 'auto' }}>
            <Box
              component="img"
              src={product.image}
              alt={product.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
                transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isHovered && !isOutOfStock ? 'scale(1.08)' : 'scale(1)',
                filter: isOutOfStock ? 'grayscale(0.8)' : 'none'
              }}
            />
          </Link>

          {/* Overlay Gradient */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
              opacity: isHovered && !isOutOfStock ? 1 : 0,
              transition: 'opacity 0.4s',
              pointerEvents: 'none'
            }}
          />

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}
            >
              <Chip
                label="OUT OF STOCK"
                sx={{
                  bgcolor: '#d32f2f',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 1,
                  fontSize: '0.8rem'
                }}
              />
            </Box>
          )}

          {/* Low Stock Badge */}
          {isLowStock && !isOutOfStock && (
            <Chip
              label={`Only ${product.stock} left`}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: inCart ? 44 : 12,
                bgcolor: '#ed6c02', // Orange for warning
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem',
                height: 24
              }}
            />
          )}

          {/* In Cart Badge - only for non-outlet (outlet is TBYB only) */}
          {inCart && !isOutletProduct && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: '#D5A249',
                color: 'white',
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckIcon sx={{ fontSize: 16 }} />
            </Box>
          )}

          {/* Wishlist Button */}
          <IconButton
            onClick={handleWishlistToggle}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: 'white',
              width: 40,
              height: 40,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s',
              transform: isHovered ? 'translateY(0)' : 'translateY(-10px)',
              opacity: isHovered ? 1 : 0,
              '&:hover': { bgcolor: inWishlist ? '#ffebee' : 'white', transform: 'scale(1.1)' },
              zIndex: 2
            }}
          >
            {inWishlist ? (
              <FavoriteIcon sx={{ color: '#e91e63', fontSize: 20 }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>

          {/* Action Buttons - Outlet: Try Before You Buy only; Regular: Quick Add + View */}
          {!isOutOfStock && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                display: 'flex',
                gap: 1,
                transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
                opacity: isHovered ? 1 : 0,
                transition: 'all 0.4s ease',
                zIndex: 2
              }}
            >
              {isOutletProduct ? (
                <Button
                  fullWidth
                  variant="contained"
                  component={Link}
                  to={`/product/${product.id}`}
                  startIcon={<ShieldOutlinedIcon />}
                  sx={{
                    bgcolor: '#D5A249',
                    color: 'white',
                    py: 1.2,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#b5893d', color: 'white' }
                  }}
                >
                  Try Before You Buy
                </Button>
              ) : (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingBagOutlinedIcon />}
                    onClick={handleQuickAdd}
                    sx={{
                      bgcolor: 'white',
                      color: '#2C2C2C',
                      py: 1.2,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      '&:hover': { bgcolor: '#2C2C2C', color: 'white' }
                    }}
                  >
                    Quick Add
                  </Button>
                  <IconButton
                    component={Link}
                    to={`/product/${product.id}`}
                    sx={{
                      bgcolor: 'white',
                      width: 46,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      '&:hover': { bgcolor: '#D5A249', color: 'white' }
                    }}
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </>
              )}
            </Box>
          )}
        </Box>

        {/* Product Info */}
        <Box sx={{ pt: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#D5A249',
              textTransform: 'uppercase',
              letterSpacing: 2,
              fontWeight: 600,
              fontSize: '0.65rem'
            }}
          >
            {product.category}
          </Typography>

          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', pointerEvents: isOutOfStock ? 'none' : 'auto' }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mt: 0.5,
                transition: 'color 0.3s',
                '&:hover': { color: isOutOfStock ? 'inherit' : '#D5A249' }
              }}
            >
              {product.name}
            </Typography>
          </Link>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
            <Typography variant="body1" fontWeight={700} sx={{ fontSize: '1.1rem', color: isOutOfStock ? 'text.disabled' : 'inherit' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </Typography>
            {/* Original price - show actual original for refurbished, or calculated for regular */}
            <Typography
              variant="body2"
              sx={{
                textDecoration: 'line-through',
                color: 'text.disabled',
                fontSize: '0.85rem'
              }}
            >
              ₹{Math.round(product.originalPrice || product.price * 1.3).toLocaleString('en-IN')}
            </Typography>
            {/* Show savings percentage for refurbished */}
            {product.isRefurbished && product.originalPrice && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: '#4CAF50',
                  color: 'white',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontWeight: 600,
                  fontSize: '0.65rem'
                }}
              >
                SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Typography>
            )}
          </Box>

          {/* Color Swatches Preview */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2, opacity: isOutOfStock ? 0.5 : 1 }}>
            {product.colors.slice(0, 4).map((color) => (
              <Box
                key={color}
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor:
                    color.toLowerCase() === 'black' ? '#1a1a1a' :
                      color.toLowerCase() === 'white' ? '#f5f5f5' :
                        color.toLowerCase() === 'cream' ? '#f5f5dc' :
                          color.toLowerCase() === 'navy' ? '#1e3a5f' :
                            color.toLowerCase() === 'brown' ? '#8B4513' :
                              color.toLowerCase() === 'gray' || color.toLowerCase() === 'grey' ? '#808080' :
                                color.toLowerCase() === 'tan' ? '#D2B48C' :
                                  color.toLowerCase() === 'olive' ? '#556B2F' :
                                    color.toLowerCase() === 'beige' ? '#F5F5DC' :
                                      color.toLowerCase() === 'camel' ? '#C19A6B' :
                                        color.toLowerCase(),
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
                +{product.colors.length - 4}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Quick Add Modal */}
      <Dialog
        open={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 400, width: '100%' } }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header with Image */}
          <Box sx={{ display: 'flex', gap: 3, p: 3, borderBottom: '1px solid #eee' }}>
            <Box
              component="img"
              src={product.image}
              alt={product.name}
              sx={{ width: 100, height: 130, objectFit: 'cover', borderRadius: 2 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#D5A249', letterSpacing: 1 }}>
                {product.category.toUpperCase()}
              </Typography>
              <Typography variant="h6" fontWeight={600}>{product.name}</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                ₹{product.price.toLocaleString('en-IN')}
              </Typography>
              {isLowStock && (
                <Typography variant="caption" color="warning.main" fontWeight={600}>
                  Only {product.stock} items left in stock!
                </Typography>
              )}
            </Box>
            <IconButton onClick={() => setShowQuickAdd(false)} sx={{ alignSelf: 'flex-start' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Options */}
          <Box sx={{ p: 3 }}>
            {/* Size Selection */}
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Size: <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>{selectedSize}</Box>
            </Typography>
            <ToggleButtonGroup
              value={selectedSize}
              exclusive
              onChange={(_, val) => val && setSelectedSize(val)}
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}
            >
              {product.sizes.map((size) => (
                <ToggleButton
                  key={size}
                  value={size}
                  sx={{
                    flex: '1 0 auto',
                    minWidth: 50,
                    border: '1px solid #ddd !important',
                    borderRadius: '8px !important',
                    '&.Mui-selected': { bgcolor: '#2C2C2C', color: 'white', borderColor: '#2C2C2C !important' }
                  }}
                >
                  {size}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* Color Selection */}
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Color: <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>{selectedColor}</Box>
            </Typography>
            <ToggleButtonGroup
              value={selectedColor}
              exclusive
              onChange={(_, val) => val && setSelectedColor(val)}
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}
            >
              {product.colors.map((color) => (
                <ToggleButton
                  key={color}
                  value={color}
                  sx={{
                    flex: '1 0 auto',
                    minWidth: 80,
                    border: '1px solid #ddd !important',
                    borderRadius: '8px !important',
                    '&.Mui-selected': { bgcolor: '#2C2C2C', color: 'white', borderColor: '#2C2C2C !important' }
                  }}
                >
                  {color}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* Add to Cart Button */}
            <Button
              fullWidth
              variant="contained"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              sx={{
                bgcolor: '#D5A249',
                color: 'black',
                py: 1.8,
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: 1,
                '&:hover': { bgcolor: '#c49a3e' },
                '&.Mui-disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e'
                }
              }}
            >
              {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCard;
