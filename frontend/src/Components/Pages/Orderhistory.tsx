import React, { useState } from 'react';
import {
  Box, Container, Typography, Paper, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Stack, Checkbox, FormControlLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../../context/CheckoutContext';
import { useAutoPurchase } from '../../context/AutoPurchaseContext';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { toast } from 'react-toastify';

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const { orderHistory, cancelOrder, processTryBuyReturn, confirmTryBuyPurchase } = useCheckout();
  const { purchaseHistory } = useAutoPurchase();
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);

  // TBYB Return State
  const [tbybReturnOpen, setTbybReturnOpen] = useState(false);
  const [conditions, setConditions] = useState({
    noDamage: false,
    tagsIntact: false,
    barcodePresent: false
  });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnComment, setReturnComment] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'cancelled':
      case 'return-rejected': return 'error';
      case 'try-and-buy': return 'primary';
      case 'returned': return 'default';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircleIcon fontSize="small" />;
      case 'shipped': return <LocalShippingIcon fontSize="small" />;
      case 'cancelled': return <CancelIcon fontSize="small" />;
      default: return <AccessTimeIcon fontSize="small" />;
    }
  };

  const handleReturnClick = (order: any) => {
    setSelectedOrder(order);
    if (order.status === 'try-and-buy') {
      setConditions({ noDamage: false, tagsIntact: false, barcodePresent: false });
      setTbybReturnOpen(true);
    } else {
      setReturnDialogOpen(true);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      cancelOrder(orderId);
      toast.success('Order cancelled successfully');
    }
  };

  const handleReturnSubmit = () => {
    if (!returnReason) {
      toast.error('Please select a reason for return');
      return;
    }

    // Logic to submit return request would go here
    // For now, we simulate success
    toast.success(`Return request submitted for Order #${selectedOrder?.id}`);
    setReturnDialogOpen(false);
    setSelectedOrder(null);
    setReturnReason('');
    setReturnComment('');
  };

  const handleTbybReturnSubmit = () => {
    if (!selectedOrder) return;

    const allConditionsMet = conditions.noDamage && conditions.tagsIntact && conditions.barcodePresent;

    if (allConditionsMet) {
      processTryBuyReturn(selectedOrder.id, true);
    } else {
      // Reject
      const reason = [];
      if (!conditions.noDamage) reason.push("Product Damaged");
      if (!conditions.tagsIntact) reason.push("Tags Removed");
      if (!conditions.barcodePresent) reason.push("Barcode Missing");

      processTryBuyReturn(selectedOrder.id, false, reason.join(", "));
    }
    setTbybReturnOpen(false);
    setSelectedOrder(null);
  };



  // Merge regular orders and auto-purchases
  const allOrders = [
    ...orderHistory,
    ...purchaseHistory.map(ph => ({
      id: ph.id,
      createdAt: ph.purchasedAt || ph.createdAt,
      total: ph.purchasePrice,
      status: ph.status,
      shippingInfo: { firstName: 'Auto', lastName: 'Pay', address: ph.deliveryAddress }, // Mock shipping info for display
      items: [{
        id: ph.productId,
        name: ph.productName,
        price: ph.purchasePrice,
        quantity: 1, // AutoPay is usually 1 qty
        selectedSize: 'OneSize', // Default?
        selectedColor: 'Default',
        image: ph.productImage
      }]
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (allOrders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Paper elevation={0} sx={{ p: 6, borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <ShoppingBagIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>No Orders Yet</Typography>
          <Typography color="text.secondary" paragraph>
            You haven't placed any orders yet. Start shopping to fill your wardrobe!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/shop')}
            sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#333' } }}
          >
            Start Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Button
        startIcon={<KeyboardBackspaceIcon />}
        onClick={() => navigate('/account')}
        sx={{ mb: 4, color: '#666' }}
      >
        Back to Account
      </Button>

      <Typography variant="h4" fontWeight={700} sx={{ mb: 1, fontFamily: '"Playfair Display", serif' }}>
        My Orders
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        View and track your full order history
      </Typography>

      <Stack spacing={3}>
        {allOrders.map((order) => (
          <Paper key={order.id} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: '#f9f9f9', p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">ORDER PLACED</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">TOTAL</Typography>
                <Typography variant="body2" fontWeight={600}>₹{order.total.toLocaleString('en-IN')}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">SHIP TO</Typography>
                <Typography variant="body2" fontWeight={600}>{order.shippingInfo.firstName} {order.shippingInfo.lastName}</Typography>
              </Box>
              <Box sx={{ ml: 'auto' }}>
                <Typography variant="caption" color="text.secondary" display="block">ORDER # {order.id}</Typography>
                <Button
                  size="small"
                  sx={{ p: 0, minWidth: 'auto', textTransform: 'none', color: '#D5A249' }}
                  onClick={() => toast.info('Order details feature coming soon')}
                >
                  View Invoice
                </Button>
              </Box>
            </Box>

            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mr: 2 }}>
                  {order.status === 'delivered' ? 'Delivered' : order.status === 'cancelled' ? 'Cancelled' : 'Arriving Soon'}
                </Typography>
                <Chip
                  icon={getStatusIcon(order.status)}
                  label={order.status.toUpperCase()}
                  color={getStatusColor(order.status) as any}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Box sx={{ flex: { md: 2 } }}>
                  {order.items.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box
                        component="img"
                        src={item.image}
                        sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee' }}
                      />
                      <Box>
                        <Typography fontWeight={600} variant="body1">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Size: {item.selectedSize} | Qty: {item.quantity}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                          ₹{item.price.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ flex: { md: 1 }, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => toast.info(`Tracking Order #${order.id}`)}
                  >
                    Track Package
                  </Button>
                  {['delivered', 'shipped', 'try-and-buy'].includes(order.status) && (
                    <Button
                      variant="outlined"
                      color="warning"
                      fullWidth
                      onClick={() => handleReturnClick(order)}
                    >
                      {order.status === 'try-and-buy' ? 'Return Item' : 'Return / Exchange'}
                    </Button>
                  )}

                  {order.status === 'try-and-buy' && (
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={() => {
                        if (window.confirm("Keep this item? Funds will be deducted from your already frozen balance.")) {
                          confirmTryBuyPurchase(order.id);
                        }
                      }}
                    >
                      Keep Item
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel Order
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>

      {/* Return Request Modal */}
      <Dialog open={returnDialogOpen} onClose={() => setReturnDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>
          Request Return / Exchange
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Order #{selectedOrder?.id}
          </Typography>
          <Box component="form" sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Reason for Return</InputLabel>
              <Select
                value={returnReason}
                label="Reason for Return"
                onChange={(e) => setReturnReason(e.target.value)}
              >
                <MenuItem value="size_too_small">Size too small</MenuItem>
                <MenuItem value="size_too_large">Size too large</MenuItem>
                <MenuItem value="defective">Defective / Damaged</MenuItem>
                <MenuItem value="wrong_item">Received wrong item</MenuItem>
                <MenuItem value="changed_mind">Changed my mind</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Comments"
              placeholder="Please provide more details..."
              value={returnComment}
              onChange={(e) => setReturnComment(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setReturnDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleReturnSubmit} variant="contained" sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#333' } }}>
            Submit Request
          </Button>
        </DialogActions>

      </Dialog>

      {/* TBYB Condition Check Dialog */}
      <Dialog open={tbybReturnOpen} onClose={() => setTbybReturnOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: 'error.main' }}>
          Return Condition Check
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            To accept this return, the product must meet the following conditions.
            <br /><strong>Warning:</strong> If conditions are not met, the return will be rejected and funds will be <strong>debited</strong> from your wallet.
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={<Checkbox checked={conditions.noDamage} onChange={(e) => setConditions({ ...conditions, noDamage: e.target.checked })} />}
              label="Product is NOT damaged"
            />
            <FormControlLabel
              control={<Checkbox checked={conditions.tagsIntact} onChange={(e) => setConditions({ ...conditions, tagsIntact: e.target.checked })} />}
              label="Original Tags are intact (Not removed)"
            />
            <FormControlLabel
              control={<Checkbox checked={conditions.barcodePresent} onChange={(e) => setConditions({ ...conditions, barcodePresent: e.target.checked })} />}
              label="Barcode / Box is present"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setTbybReturnOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={conditions.noDamage && conditions.tagsIntact && conditions.barcodePresent ? "success" : "error"}
            onClick={handleTbybReturnSubmit}
          >
            {conditions.noDamage && conditions.tagsIntact && conditions.barcodePresent ? "Accept Return (Refund)" : "Reject Return (Debit Funds)"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container >
  );
};

export default OrderHistory;
