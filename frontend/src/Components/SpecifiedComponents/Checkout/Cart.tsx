import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Typography, Button, IconButton, Divider,
  Chip, Paper, LinearProgress, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Slider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimerIcon from '@mui/icons-material/Timer';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import { useAutoPurchase } from '../../../context/AutoPurchaseContext';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

// Theme colors
const GOLD = '#D5A249';
const BLACK = '#000000';
const WHITE = '#FFFFFF';

interface EditPriceDialogProps {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    productName: string;
    currentPrice: number;
    targetPrice: number;
    lowestPriceSeen: number;
  } | null;
  onSave: (id: string, newPrice: number) => void;
}

const EditPriceDialog: React.FC<EditPriceDialogProps> = ({ open, onClose, item, onSave }) => {
  const [newTargetPrice, setNewTargetPrice] = useState(item?.targetPrice || 0);

  React.useEffect(() => {
    if (item) {
      setNewTargetPrice(item.targetPrice);
    }
  }, [item]);

  if (!item) return null;

  const handleSave = () => {
    onSave(item.id, newTargetPrice);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Edit Target Price
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
          {item.productName}
        </Typography>

        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Current Price</Typography>
            <Typography variant="body2" fontWeight={600}>
              ₹{item.currentPrice.toLocaleString('en-IN')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              <LocalOfferIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle', color: '#4CAF50' }} />
              Lowest Offered
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: '#4CAF50' }}>
              ₹{item.lowestPriceSeen.toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          New Target Price
        </Typography>
        <Slider
          value={newTargetPrice}
          onChange={(_, val) => setNewTargetPrice(val as number)}
          min={100}
          max={item.currentPrice}
          step={100}
          sx={{
            color: GOLD,
            '& .MuiSlider-thumb': { bgcolor: GOLD },
            '& .MuiSlider-track': { bgcolor: GOLD }
          }}
        />
        <TextField
          fullWidth
          type="number"
          value={newTargetPrice}
          onChange={(e) => setNewTargetPrice(Number(e.target.value))}
          InputProps={{
            startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
          }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ bgcolor: BLACK, '&:hover': { bgcolor: '#222' } }}
        >
          Save Target Price
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { autoPurchaseItems, removeAutoPurchase, updateTargetPrice } = useAutoPurchase();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    id: string;
    productName: string;
    currentPrice: number;
    targetPrice: number;
    lowestPriceSeen: number;
  } | null>(null);

  // Filter only active auto-purchase items
  const activeAutoPurchases = autoPurchaseItems.filter(item => item.status === 'active');

  const finalTotal = totalPrice;

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed with checkout', {
        position: 'top-right',
        autoClose: 3000,
      });
      setTimeout(() => navigate('/login'), 1000);
      return;
    }
    navigate('/checkout/shipping');
  };

  const handleQuantityChange = (productId: string, size: string, color: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      removeFromCart(productId, size, color);
    } else if (newQty <= 10) {
      updateQuantity(productId, size, color, newQty);
    }
  };

  const handleEditPrice = (item: typeof editingItem) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleSavePrice = (id: string, newPrice: number) => {
    updateTargetPrice(id, newPrice);
  };

  if (items.length === 0 && activeAutoPurchases.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <ShoppingBagOutlinedIcon sx={{ fontSize: 100, color: '#e0e0e0', mb: 3 }} />
        <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>Your bag is empty</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Looks like you haven't added anything to your bag yet.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/shop')}
          sx={{ bgcolor: '#2C2C2C', px: 6, py: 1.5, fontWeight: 700 }}
        >
          START SHOPPING
        </Button>
      </Container>
    );
  }



  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight={800}>Shopping Bag</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your bag
          </Typography>
        </Box>
        <Button
          variant="text"
          startIcon={<DeleteOutlineIcon />}
          onClick={clearCart}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: '#e91e63',
              bgcolor: 'rgba(233, 30, 99, 0.08)'
            },
            fontWeight: 600
          }}
        >
          Clear All
        </Button>
      </Box>



      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Cart Items */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 60%' }, maxWidth: { lg: '65%' } }}>

          {/* Auto-Purchase Monitoring Section */}
          {activeAutoPurchases.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingDownIcon sx={{ color: GOLD }} />
                <Typography variant="h6" fontWeight={700}>
                  Auto-Purchase Monitoring
                </Typography>
                <Chip
                  label={`${activeAutoPurchases.length} Active`}
                  size="small"
                  sx={{ bgcolor: '#4CAF50', color: WHITE, fontWeight: 600 }}
                />
              </Box>

              <Paper sx={{ bgcolor: WHITE, borderRadius: 2, overflow: 'hidden', border: `2px solid ${GOLD}` }} elevation={0}>
                {activeAutoPurchases.map((item, index) => (
                  <Box key={item.id}>
                    <Box sx={{ display: 'flex', gap: 3, p: 3 }}>
                      {/* Image */}
                      <Box
                        component="img"
                        src={item.productImage}
                        alt={item.productName}
                        sx={{
                          width: { xs: 80, sm: 100 },
                          height: { xs: 100, sm: 130 },
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />

                      {/* Details */}
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                              {item.productName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Chip
                                icon={<TimerIcon sx={{ fontSize: 16 }} />}
                                label="Monitoring"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                                  color: '#4CAF50',
                                  fontWeight: 600,
                                  '& .MuiChip-icon': { color: '#4CAF50' }
                                }}
                              />
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              onClick={() => handleEditPrice({
                                id: item.id,
                                productName: item.productName,
                                currentPrice: item.currentPrice,
                                targetPrice: item.targetPrice,
                                lowestPriceSeen: item.lowestPriceSeen ?? item.currentPrice
                              })}
                              sx={{ color: GOLD, '&:hover': { bgcolor: 'rgba(213, 162, 73, 0.1)' } }}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => removeAutoPurchase(item.id)}
                              sx={{ color: '#999', '&:hover': { color: '#e91e63' } }}
                              size="small"
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Price Info */}
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Current Price</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              ₹{item.currentPrice.toLocaleString('en-IN')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Target Price</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="body2" fontWeight={600} sx={{ color: GOLD }}>
                                ₹{item.targetPrice.toLocaleString('en-IN')}
                              </Typography>
                              <IconButton
                                size="small"
                                sx={{ p: 0.25 }}
                                onClick={() => handleEditPrice({
                                  id: item.id,
                                  productName: item.productName,
                                  currentPrice: item.currentPrice,
                                  targetPrice: item.targetPrice,
                                  lowestPriceSeen: item.lowestPriceSeen ?? item.currentPrice
                                })}
                              >
                                <EditIcon sx={{ fontSize: 14, color: GOLD }} />
                              </IconButton>
                            </Box>
                          </Box>

                          {/* Lowest Price Seen */}
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 1,
                            p: 1,
                            bgcolor: 'rgba(76, 175, 80, 0.08)',
                            borderRadius: 1,
                            border: '1px dashed rgba(76, 175, 80, 0.3)'
                          }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocalOfferIcon sx={{ fontSize: 16, color: '#4CAF50' }} />
                              <span style={{ color: '#666' }}>Lowest Price Seen</span>
                            </Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ color: '#4CAF50' }}>
                              ₹{(item.lowestPriceSeen ?? item.currentPrice).toLocaleString('en-IN')}
                            </Typography>
                          </Box>

                          <Box sx={{ mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, (item.targetPrice / item.currentPrice) * 100)}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#eee',
                                '& .MuiLinearProgress-bar': { bgcolor: GOLD }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              Will buy when price drops to ₹{item.targetPrice.toLocaleString('en-IN')} or below
                            </Typography>
                          </Box>
                        </Box>

                        {/* Delivery Address */}
                        {item.deliveryAddress && (
                          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              📍 Delivery: {item.deliveryAddress.slice(0, 50)}...
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    {index < activeAutoPurchases.length - 1 && <Divider />}
                  </Box>
                ))}
              </Paper>
            </Box>
          )}

          {/* Regular Cart Items Section */}
          {items.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ShoppingBagOutlinedIcon sx={{ color: BLACK }} />
                <Typography variant="h6" fontWeight={700}>
                  Cart Items
                </Typography>
                <Chip
                  label={`${items.length} Items`}
                  size="small"
                  sx={{ bgcolor: BLACK, color: WHITE, fontWeight: 600 }}
                />
              </Box>

              <Box sx={{ bgcolor: WHITE, borderRadius: 2, overflow: 'hidden' }}>
                {items.map((item, index) => (
                  <Box key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}>
                    <Box sx={{ display: 'flex', gap: 3, p: 3 }}>
                      {/* Image */}
                      <Link to={`/product/${item.id}`}>
                        <Box
                          component="img"
                          src={item.image}
                          alt={item.name}
                          sx={{
                            width: { xs: 100, sm: 140 },
                            height: { xs: 130, sm: 180 },
                            objectFit: 'cover',
                            borderRadius: 1,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            '&:hover': { opacity: 0.9 }
                          }}
                        />
                      </Link>

                      {/* Details */}
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flex: 1 }}>
                          <Box>
                            <Typography variant="overline" color="text.secondary">{item.category}</Typography>
                            <Link to={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <Typography variant="h6" fontWeight={700} sx={{ '&:hover': { color: GOLD } }}>
                                {item.name}
                              </Typography>
                            </Link>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip label={item.selectedColor} size="small" variant="outlined" />
                              <Chip label={`Size: ${item.selectedSize}`} size="small" variant="outlined" />
                            </Box>
                          </Box>
                          <IconButton
                            onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                            sx={{ color: '#999', '&:hover': { color: '#e91e63' } }}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2 }}>
                          {/* Quantity */}
                          <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            border: '1px solid #e0e0e0',
                            borderRadius: 1
                          }}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.selectedSize, item.selectedColor, item.quantity, -1)}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ minWidth: 40, textAlign: 'center', fontWeight: 600 }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.selectedSize, item.selectedColor, item.quantity, 1)}
                              disabled={item.quantity >= 10}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          {/* Price */}
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight={700}>
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </Typography>
                            {item.quantity > 1 && (
                              <Typography variant="caption" color="text.secondary">
                                ₹{item.price.toLocaleString('en-IN')} each
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    {index < items.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Continue Shopping */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/shop')}
            sx={{ mt: 3, color: 'text.secondary' }}
          >
            Continue Shopping
          </Button>
        </Box>

        {/* Order Summary */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 30%' }, maxWidth: { lg: '35%' } }}>
          <Box sx={{ bgcolor: WHITE, borderRadius: 2, p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Order Summary</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Subtotal ({totalItems} items)</Typography>
              <Typography fontWeight={600}>₹{totalPrice.toLocaleString('en-IN')}</Typography>
            </Box>

            {activeAutoPurchases.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">
                  Auto-Purchase ({activeAutoPurchases.length})
                </Typography>
                <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                  Monitoring...
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Typography variant="h6" fontWeight={700}>Estimated Total</Typography>
              <Typography variant="h6" fontWeight={700}>₹{finalTotal.toLocaleString('en-IN')}</Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleProceedToCheckout}
              disabled={items.length === 0}
              sx={{
                py: 2,
                bgcolor: BLACK,
                color: WHITE,
                fontWeight: 700,
                fontSize: '1rem',
                '&:hover': { bgcolor: '#222' },
                '&:disabled': { bgcolor: '#ccc' }
              }}
            >
              PROCEED TO CHECKOUT
            </Button>

            {items.length === 0 && activeAutoPurchases.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                Add items to cart to checkout. Auto-purchase items will be purchased automatically when price drops.
              </Typography>
            )}

            {/* Trust Badges */}
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Typography variant="caption" color="text.secondary">Visa</Typography>
                <Typography variant="caption" color="text.secondary">Mastercard</Typography>
                <Typography variant="caption" color="text.secondary">PayPal</Typography>
                <Typography variant="caption" color="text.secondary">Apple Pay</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Edit Price Dialog */}
      <EditPriceDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        item={editingItem}
        onSave={handleSavePrice}
      />
    </Container>
  );
};

export default Cart;
