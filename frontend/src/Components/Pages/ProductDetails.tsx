import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, Container, Typography, Button, Chip, IconButton, Breadcrumbs, Snackbar, Alert, Skeleton, Tabs, Tab, Dialog, TextField } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CachedIcon from '@mui/icons-material/Cached';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import type { Product, CartItem } from '../../types';
import { useCheckout } from '../../context/CheckoutContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAutoPurchase } from '../../context/AutoPurchaseContext';
import { useWallet } from '../../context/WalletContext';
import ProductCard from '../SpecifiedComponents/Product/ProductCard';
import { Bolt, AccountBalanceWallet } from '@mui/icons-material';

const ProductDetails: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createTryBuyOrder } = useCheckout();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addAutoPurchase, isMonitoring } = useAutoPurchase();
  const { wallet } = useWallet();

  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // TBYB State
  const [tbybDialogOpen, setTbybDialogOpen] = useState(false);

  // AutoPay States
  const [autoPayDialogOpen, setAutoPayDialogOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Simulate loading and fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          // Map backend data to frontend model if needed (images handling)
          // Backend has images[], frontend expects image (string) or images[]? 
          // ProductDetails uses product.image (string)
          setProduct({
            ...data,
            id: data._id,
            image: data.images && data.images.length > 0 ? data.images[0] : '', // Fallback
            // Ensure other fields match
          });
        } else {
          setProduct(undefined);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(undefined);
      } finally {
        setIsLoading(false);
        setQuantity(1);
        setSelectedSize('');
        setSelectedColor('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Fetch related products
  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/products?category=${product.category}`);
        if (response.ok) {
          const data = await response.json();
          const filtered = data
            .filter((p: any) => p._id !== product.id)
            .slice(0, 4)
            .map((p: any) => ({
              ...p,
              id: p._id,
              image: p.images && p.images.length > 0 ? p.images[0] : '',
            }));
          setRelatedProducts(filtered);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    fetchRelated();
  }, [product]);

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
            <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 2 }} />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
            <Skeleton variant="text" width={100} height={30} />
            <Skeleton variant="text" width="80%" height={60} />
            <Skeleton variant="text" width={150} height={50} />
            <Skeleton variant="text" width="100%" height={100} sx={{ mt: 2 }} />
          </Box>
        </Box>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>Product Not Found</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The product you're looking for doesn't exist or has been removed.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/shop')} sx={{ bgcolor: '#2C2C2C' }}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const alreadyInCart = selectedSize && selectedColor ? isInCart(product.id, selectedSize, selectedColor) : false;

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      showSnackbar('Please select a size', 'warning');
      return;
    }
    if (!selectedColor) {
      showSnackbar('Please select a color', 'warning');
      return;
    }

    addToCart(product, selectedSize, selectedColor, quantity);
    showSnackbar(`${product.name} added to your bag!`, 'success');
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      showSnackbar('Please select a size', 'warning');
      return;
    }
    if (!selectedColor) {
      showSnackbar('Please select a color', 'warning');
      return;
    }

    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/checkout/cart');
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      showSnackbar('Removed from wishlist');
    } else {
      addToWishlist(product);
      showSnackbar('Added to wishlist');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      showSnackbar('Link copied to clipboard!');
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleSetupAutoPay = () => {
    if (!product) return;
    const target = parseFloat(targetPrice);

    if (isNaN(target) || target <= 0) {
      showSnackbar('Please enter a valid target price', 'warning');
      return;
    }
    // Basic validation
    if (target > product.price) {
      showSnackbar('Target price should be lower than current price', 'warning');
      // We allow it though, but warn?
    }

    // Wallet check is done in Context too, but good to check here for UX
    if (wallet.available < target) {
      showSnackbar('Insufficient wallet balance to reserve funds', 'error');
      return;
    }

    if (!deliveryAddress.trim()) {
      showSnackbar('Please enter delivery address', 'warning');
      return;
    }

    addAutoPurchase(product, target, target, deliveryAddress); // Use target as max
    // implementation plan said max is safety limit.
    setAutoPayDialogOpen(false);
  };

  const handleTbybSubmit = async () => {
    if (!product) return;
    if (!deliveryAddress.trim()) {
      showSnackbar('Please enter delivery address', 'warning');
      return;
    }

    const cartItem: CartItem = {
      ...product,
      quantity: 1,
      selectedSize: selectedSize || 'OneSize',
      selectedColor: selectedColor || 'Default'
    };

    const shippingInfoMock: any = {
      firstName: user?.name || 'Guest',
      lastName: '',
      address: deliveryAddress,
      shippingMethod: 'standard',
      shippingCost: 0
    };

    const success = await createTryBuyOrder(cartItem, shippingInfoMock);
    if (success) {
      setTbybDialogOpen(false);
      navigate('/orders');
    }
  };


  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <Link to="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>Shop</Link>
          <Link to={`/shop?category=${product.category}`} style={{ color: 'inherit', textDecoration: 'none' }}>{product.category}</Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {/* Product Image */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' }, maxWidth: { md: '50%' } }}>
            <Box
              sx={{
                position: 'relative',
                bgcolor: '#f8f8f8',
                borderRadius: 2,
                overflow: 'hidden',
                aspectRatio: '1/1'
              }}
            >
              <Box
                component="img"
                src={product.image}
                alt={product.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Action Buttons */}
              <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <IconButton
                  onClick={handleWishlistToggle}
                  sx={{
                    bgcolor: 'white',
                    color: inWishlist ? '#e91e63' : 'inherit',
                    '&:hover': { bgcolor: 'white' }
                  }}
                >
                  {inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <IconButton onClick={handleShare} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'white' } }}>
                  <ShareOutlinedIcon />
                </IconButton>
              </Box>

              {/* Stock Badge */}
              {product.stock === 0 && (
                <Box sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  bgcolor: '#f44336',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}>
                  Out of Stock
                </Box>
              )}
            </Box>
          </Box>

          {/* Product Info */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' }, maxWidth: { md: '50%' } }}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2 }}>
                {product.category}
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ mt: 1, mb: 2 }}>
                {product.name}
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#D5A249', mb: 3 }}>
                ₹{product.price.toLocaleString('en-IN')}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
                {product.description}
              </Typography>

              {/* Color Selection */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  Color: {selectedColor && <Box component="span" sx={{ fontWeight: 400, color: '#D5A249' }}>{selectedColor}</Box>}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {product.colors.map(color => (
                    <Chip
                      key={color}
                      label={color}
                      onClick={() => setSelectedColor(color)}
                      icon={selectedColor === color ? <CheckCircleOutlineIcon /> : undefined}
                      sx={{
                        bgcolor: selectedColor === color ? '#2C2C2C' : 'white',
                        color: selectedColor === color ? 'white' : 'text.primary',
                        border: '1px solid',
                        borderColor: selectedColor === color ? '#2C2C2C' : '#e0e0e0',
                        fontWeight: 500,
                        '&:hover': { bgcolor: selectedColor === color ? '#2C2C2C' : '#f5f5f5' }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Size Selection */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Size: {selectedSize && <Box component="span" sx={{ fontWeight: 400, color: '#D5A249' }}>{selectedSize}</Box>}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#D5A249', cursor: 'pointer', textDecoration: 'underline' }}>
                    Size Guide
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {product.sizes.map(size => (
                    <Box
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      sx={{
                        minWidth: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: selectedSize === size ? '2px solid #2C2C2C' : '1px solid #e0e0e0',
                        borderRadius: 1,
                        cursor: 'pointer',
                        fontWeight: selectedSize === size ? 700 : 500,
                        bgcolor: selectedSize === size ? '#fafafa' : 'white',
                        px: 1.5,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#2C2C2C' }
                      }}
                    >
                      {size}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Quantity */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Quantity</Typography>
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1
                }}>
                  <IconButton
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    sx={{ borderRadius: 0 }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography fontWeight={600} sx={{ minWidth: 50, textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    sx={{ borderRadius: 0 }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                {quantity >= 10 && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                    Maximum 10 per order
                  </Typography>
                )}
              </Box>

              {/* Action Buttons - Outlet/refurbished: only Try Before You Buy; regular: Add to Bag, Buy Now, AutoPay */}
              <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                {product.isRefurbished ? (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={() => setTbybDialogOpen(true)}
                      disabled={product.stock === 0}
                      startIcon={<ShieldOutlinedIcon />}
                      sx={{
                        py: 2,
                        bgcolor: '#D5A249',
                        color: 'white',
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#b5893d' }
                      }}
                    >
                      TRY BEFORE YOU BUY
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      sx={{
                        py: 2,
                        bgcolor: alreadyInCart ? '#4caf50' : '#2C2C2C',
                        fontWeight: 700,
                        '&:hover': { bgcolor: alreadyInCart ? '#43a047' : 'black' }
                      }}
                    >
                      {alreadyInCart ? 'ADDED TO BAG ✓' : 'ADD TO BAG'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      onClick={handleBuyNow}
                      disabled={product.stock === 0}
                      sx={{
                        py: 2,
                        borderColor: '#D5A249',
                        color: '#D5A249',
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#D5A249', color: 'white', borderColor: '#D5A249' }
                      }}
                    >
                      BUY NOW
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      onClick={() => setAutoPayDialogOpen(true)}
                      disabled={isMonitoring(product.id)}
                      startIcon={<Bolt />}
                      sx={{
                        py: 2,
                        borderColor: '#2C2C2C',
                        color: '#2C2C2C',
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#f5f5f5', borderColor: 'black' }
                      }}
                    >
                      {isMonitoring(product.id) ? 'AUTOPAY ACTIVE' : 'SMART AUTOPAY'}
                    </Button>
                  </>
                )}
              </Box>

              {/* Features */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 4, borderTop: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocalShippingOutlinedIcon sx={{ color: '#D5A249' }} />
                  <Typography variant="body2">Free shipping on orders over $200</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CachedIcon sx={{ color: '#D5A249' }} />
                  <Typography variant="body2">30-day easy returns</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ShieldOutlinedIcon sx={{ color: '#D5A249' }} />
                  <Typography variant="body2">2-year quality guarantee</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Product Details Tabs */}
        <Box sx={{ mt: 8, borderTop: '1px solid #eee', pt: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              mb: 4,
              '& .Mui-selected': { color: '#2C2C2C !important' },
              '& .MuiTabs-indicator': { bgcolor: '#D5A249' }
            }}
          >
            <Tab label="Description" sx={{ fontWeight: 600 }} />
            <Tab label="Details & Care" sx={{ fontWeight: 600 }} />
            <Tab label="Shipping" sx={{ fontWeight: 600 }} />
          </Tabs>

          {activeTab === 0 && (
            <Typography variant="body1" sx={{ maxWidth: 800, lineHeight: 1.8 }}>
              {product.description}
            </Typography>
          )}
          {activeTab === 1 && (
            <Box sx={{ maxWidth: 800 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>• Premium quality materials</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>• Ethically sourced and manufactured</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>• Machine wash cold, tumble dry low</Typography>
              <Typography variant="body1">• Do not bleach or iron directly on prints</Typography>
            </Box>
          )}
          {activeTab === 2 && (
            <Box sx={{ maxWidth: 800 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>• Standard delivery: 5-7 business days</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>• Express delivery: 2-3 business days (+$15)</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>• Overnight delivery: Next business day (+$30)</Typography>
              <Typography variant="body1">• Free shipping on all orders over $200</Typography>
            </Box>
          )}
        </Box>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 10 }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 4 }}>You May Also Like</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {relatedProducts.map(p => (
                <Box
                  key={p.id}
                  sx={{
                    flex: { xs: '1 1 45%', sm: '1 1 30%', md: '1 1 22%' },
                    maxWidth: { xs: '48%', sm: '32%', md: '24%' }
                  }}
                >
                  <ProductCard {...p} />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          action={
            snackbarSeverity === 'success' && snackbarMessage.includes('bag') ? (
              <Button color="inherit" size="small" onClick={() => navigate('/checkout/cart')}>
                View Bag
              </Button>
            ) : undefined
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* AutoPay Dialog - only for non-outlet products */}
      {!product.isRefurbished && (
        <Dialog
          open={autoPayDialogOpen}
          onClose={() => setAutoPayDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Bolt sx={{ fontSize: 32, color: '#D5A249' }} />
              <Typography variant="h5" fontWeight={700}>Setup Smart AutoPay</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Automatically buy this item when price drops to your target.
              <br /><strong>Funds will be reserved from your wallet immediately.</strong>
            </Typography>

            <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceWallet sx={{ color: '#666' }} />
                <Typography variant="body2">Wallet Balance</Typography>
              </Box>
              <Typography variant="h6" fontWeight={700}>₹{wallet.available.toLocaleString('en-IN')}</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#D5A249', fontWeight: 600 }}>CURRENT PRICE: ₹{product.price}</Typography>
                <TextField
                  fullWidth
                  label="Target Price"
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Ex: 2500"
                  sx={{ mt: 1 }}
                />
              </Box>

              <TextField
                fullWidth
                label="Delivery Address"
                multiline
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button fullWidth onClick={() => setAutoPayDialogOpen(false)} sx={{ color: '#666' }}>Cancel</Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSetupAutoPay}
                sx={{ bgcolor: '#2C2C2C', color: 'white', '&:hover': { bgcolor: 'black' } }}
              >
                Confirm & Reserve Funds
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}

      {/* TBYB Dialog */}
      <Dialog
        open={tbybDialogOpen}
        onClose={() => setTbybDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <ShieldOutlinedIcon sx={{ fontSize: 32, color: '#D5A249' }} />
            <Typography variant="h5" fontWeight={700}>Try Before You Buy</Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Order this Outlet Hub item to try at home.
            <br /><strong>Funds will be frozen in your wallet until you decide to keep or return it.</strong>
            <br />If returned damaged or without tags, the amount will be debited.
          </Typography>

          <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWallet sx={{ color: '#666' }} />
              <Typography variant="body2">Wallet Balance</Typography>
            </Box>
            <Typography variant="h6" fontWeight={700}>₹{wallet.available.toLocaleString('en-IN')}</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ p: 2, border: '1px dashed #D5A249', borderRadius: 2, bgcolor: '#fffbf2' }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Conditions:</Typography>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.9rem', color: '#666' }}>
                <li>Funds frozen immediately.</li>
                <li>7 Days to return.</li>
                <li>Tags must be intact.</li>
              </ul>
            </Box>

            <TextField
              fullWidth
              label="Delivery Address"
              multiline
              rows={2}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button fullWidth onClick={() => setTbybDialogOpen(false)} sx={{ color: '#666' }}>Cancel</Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleTbybSubmit}
              sx={{ bgcolor: '#D5A249', color: 'white', '&:hover': { bgcolor: '#b5893d' } }}
            >
              Confirm & Freeze Funds
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ProductDetails;
