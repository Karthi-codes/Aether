import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, TextField, Button, Stepper, Step, StepLabel, FormControlLabel, Checkbox, Radio, RadioGroup, Alert } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useCart } from '../../../context/CartContext';
import { useCheckout, type ShippingInfo } from '../../../context/CheckoutContext';
import { useAuth } from '../../../context/AuthContext';

import { toast } from 'react-toastify';
import { COMPANY_LOCATION } from '../../../utils/shippingCalculator';
import { geocodeAddress, calculateDistance, reverseGeocode } from '../../../utils/geocoding';
import DeliveryMap from '../Map/DeliveryMap';

interface FormErrors {
  [key: string]: string;
}

const Shipping: React.FC = () => {
  const navigate = useNavigate();
  const { totalPrice, totalItems, items } = useCart();
  const { shippingInfo, setShippingInfo } = useCheckout();
  const { isAuthenticated } = useAuth();


  // Theme colors
  const colors = {
    bg: 'white',
    bgSelected: '#fafafa',
    border: '#e0e0e0',
    borderSelected: '#2C2C2C',
    text: '#1a1a1a',
    textSecondary: 'text.secondary',
    summaryBg: '#f9f9f9',
  };

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue checkout');
      navigate('/login');
      return;
    }
    if (items.length === 0) {
      navigate('/checkout/cart');
    }
  }, [items, isAuthenticated, navigate]);

  const [formData, setFormData] = useState<Omit<ShippingInfo, 'shippingMethod'>>({
    firstName: shippingInfo?.firstName || '',
    lastName: shippingInfo?.lastName || '',
    email: shippingInfo?.email || '',
    phone: shippingInfo?.phone || '',
    address: shippingInfo?.address || '',
    apartment: shippingInfo?.apartment || '',
    city: shippingInfo?.city || '',
    state: shippingInfo?.state || '',
    zipCode: shippingInfo?.zipCode || '',
    country: shippingInfo?.country || 'India',
    shippingCost: shippingInfo?.shippingCost || 0
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>(
    (shippingInfo?.shippingMethod as 'standard' | 'express') || 'standard'
  );
  const [saveInfo, setSaveInfo] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for map coordinates and distance
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [mapDistance, setMapDistance] = useState<number>(0);

  // Calculate shipping costs based on geocoded distance
  const actualDistance = mapDistance;

  // Calculate shipping options with actual distance
  const calculatedShippingOptions = useMemo(() => {
    // Determine cost based on distance and cart total

    // Standard Delivery
    let standardCost = 0;
    if (totalPrice < 300) {
      // If distance is known, calculate based on it, otherwise default base cost
      const baseCost = actualDistance > 0 ? Math.round(30 + (actualDistance * 2)) : 50;
      standardCost = Math.min(baseCost, 500);
    }
    // Else free if >= 300

    // Express Delivery
    let expressCost = 0;
    if (totalPrice < 600) {
      // If distance is known, calculate based on it, otherwise default base cost
      const baseCost = actualDistance > 0 ? Math.round(50 + (actualDistance * 4)) : 100;
      expressCost = Math.min(baseCost, 1000);
    }
    // Else free if >= 600

    return [
      {
        id: 'standard' as const,
        name: 'Standard Delivery',
        icon: '📦',
        deliveryDays: '5-7 business days',
        cost: standardCost
      },
      {
        id: 'express' as const,
        name: 'Express Delivery',
        icon: '🚚',
        deliveryDays: '2-3 business days',
        cost: expressCost
      }
    ];
  }, [actualDistance]);

  const selectedShippingOption = calculatedShippingOptions?.find(o => o.id === shippingMethod);
  const shippingCost = selectedShippingOption?.cost || 0;

  // Geocode address when city/state/address changes
  const geocodeDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateGeocode = useCallback(async () => {
    if (formData.city && formData.state && formData.address) {
      const result = await geocodeAddress(
        formData.address,
        formData.city,
        formData.state,
        formData.country
      );
      if (result) {
        setDestinationCoords({ lat: result.lat, lon: result.lon });
        const dist = calculateDistance(
          COMPANY_LOCATION.coordinates.lat,
          COMPANY_LOCATION.coordinates.lng,
          result.lat,
          result.lon
        );
        setMapDistance(dist);
      }
    }
  }, [formData.address, formData.city, formData.state, formData.country]);

  // Handle map click to set exact location
  // Handle map click to set exact location and reverse geocode
  const handleMapLocationSelect = useCallback(async (lat: number, lon: number) => {
    setDestinationCoords({ lat, lon });

    // Calculate distance
    const dist = calculateDistance(
      COMPANY_LOCATION.coordinates.lat,
      COMPANY_LOCATION.coordinates.lng,
      lat,
      lon
    );
    setMapDistance(dist);

    // Reverse geocode to get address details
    try {
      const result = await reverseGeocode(lat, lon);
      if (result) {
        setFormData(prev => ({
          ...prev,
          city: result.city || prev.city,
          state: result.state || prev.state,
          country: result.country || prev.country,
          zipCode: prev.zipCode, // Zip often not accurate from reverse geo
          address: result.displayName || prev.address // Use ample address
        }));
        // Show simplified address if displayName is too long
        if (result.displayName) {
          const parts = result.displayName.split(',');
          const simpleAddr = parts.slice(0, 3).join(',');
          setFormData(prev => ({ ...prev, address: simpleAddr }));
        }
      }
    } catch (error) {
      console.error('Failed to auto-fill address from map', error);
    }
  }, []);

  useEffect(() => {
    if (geocodeDebounceRef.current) {
      clearTimeout(geocodeDebounceRef.current);
    }
    geocodeDebounceRef.current = setTimeout(updateGeocode, 1500);
    return () => {
      if (geocodeDebounceRef.current) {
        clearTimeout(geocodeDebounceRef.current);
      }
    };
  }, [updateGeocode]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid 6-digit PIN code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate brief processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Save shipping info with correct cost
    setShippingInfo({
      ...formData,
      shippingMethod,
      shippingCost // Ensure calculated cost is saved
    });

    setIsSubmitting(false);
    navigate('/checkout/payment');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Stepper */}
      <Stepper activeStep={1} sx={{ mb: 6 }}>
        <Step completed><StepLabel>Cart</StepLabel></Step>
        <Step><StepLabel>Shipping</StepLabel></Step>
        <Step><StepLabel>Payment</StepLabel></Step>
      </Stepper>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {/* Shipping Form */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 60%' }, maxWidth: { md: '65%' } }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Contact Information</Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="you@example.com"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
                <TextField
                  fullWidth
                  required
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  placeholder="(555) 123-4567"
                />
              </Box>
            </Box>

            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Shipping Address</Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  fullWidth
                  required
                  label="Street Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  placeholder="123 Main Street"
                />
              </Box>
              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  fullWidth
                  label="Apartment, suite, etc. (optional)"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleChange}
                  placeholder="Apt 4B"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 30%' } }}>
                <TextField
                  fullWidth
                  required
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={!!errors.city}
                  helperText={errors.city}
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 30%' } }}>
                <TextField
                  fullWidth
                  required
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  error={!!errors.state}
                  helperText={errors.state}
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 30%' } }}>
                <TextField
                  fullWidth
                  required
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  error={!!errors.zipCode}
                  helperText={errors.zipCode}
                  placeholder="12345"
                />
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  sx={{ '&.Mui-checked': { color: '#D5A249' } }}
                />
              }
              label="Save this information for next time"
              sx={{ mt: 2 }}
            />
            {/* Shipping Method */}
            <Typography variant="h5" fontWeight={700} sx={{ mt: 5, mb: 2 }}>Shipping Method</Typography>

            {/* Company Location Info */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon fontSize="small" />
                <Typography variant="body2">
                  Ships from: <strong>{COMPANY_LOCATION.address}</strong>
                </Typography>
              </Box>
            </Alert>

            {/* Distance & City Info */}
            {mapDistance > 0 && formData.city && (
              <Alert severity="success" sx={{ mb: 3 }}>
                📍 Delivering to <strong>{formData.city}</strong> ({mapDistance} km from Salem)
              </Alert>
            )}

            {mapDistance === 0 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Enter your address above to calculate shipping charges
              </Alert>
            )}

            <RadioGroup value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value as typeof shippingMethod)}>
              {(calculatedShippingOptions || [
                { id: 'standard' as const, name: 'Standard Delivery', icon: '📦', deliveryDays: '5-7 business days', cost: 0 },
                { id: 'express' as const, name: 'Express Delivery', icon: '🚚', deliveryDays: '2-3 business days', cost: 0 },
                { id: 'overnight' as const, name: 'Overnight Delivery', icon: '✈️', deliveryDays: 'Next business day', cost: 0 }
              ]).map(option => (
                <Box
                  key={option.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    mb: 1.5,
                    border: shippingMethod === option.id ? `2px solid ${colors.borderSelected}` : `1px solid ${colors.border}`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: shippingMethod === option.id ? colors.bgSelected : colors.bg,
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setShippingMethod(option.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Radio value={option.id} sx={{ '&.Mui-checked': { color: colors.borderSelected } }} />
                    <Typography fontSize="1.5rem">{option.icon}</Typography>
                    <Box>
                      <Typography fontWeight={600}>{option.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{option.deliveryDays}</Typography>
                    </Box>
                  </Box>
                  <Typography fontWeight={600} sx={{ color: option.cost > 0 ? '#D5A249' : '#888' }}>
                    {option.cost === 0 ? <span style={{ color: '#4CAF50', fontWeight: 800 }}>FREE</span> : `₹${option.cost}`}
                  </Typography>
                </Box>
              ))}
            </RadioGroup>

            {/* Delivery Map */}
            <Box sx={{ mt: 4 }}>
              <DeliveryMap
                destinationLat={destinationCoords?.lat}
                destinationLon={destinationCoords?.lon}
                destinationAddress={`${formData.address}, ${formData.city}`}
                distance={mapDistance}
                onLocationSelect={handleMapLocationSelect}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/checkout/cart')}
                sx={{ px: 4, borderColor: colors.borderSelected, color: colors.text }}
              >
                Back to Cart
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  px: 6,
                  py: 1.5,
                  bgcolor: '#2C2C2C',
                  color: 'white',
                  fontWeight: 700,
                  '&:hover': { bgcolor: 'black' }
                }}
              >
                {isSubmitting ? 'Processing...' : 'Continue to Payment'}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Order Summary */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, maxWidth: { md: '35%' } }}>
          <Box sx={{ bgcolor: colors.summaryBg, borderRadius: 2, p: 3, position: 'sticky', top: 100, border: `1px solid ${colors.border}` }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Order Summary</Typography>

            {/* Items Preview */}
            <Box sx={{ mb: 3, maxHeight: 200, overflow: 'auto' }}>
              {items.slice(0, 3).map(item => (
                <Box key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.name}
                    sx={{ width: 50, height: 60, objectFit: 'cover', borderRadius: 1 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{item.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.selectedColor} / {item.selectedSize} × {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Typography>
                </Box>
              ))}
              {items.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  +{items.length - 3} more items
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Subtotal ({totalItems} items)</Typography>
              <Typography fontWeight={600}>₹{totalPrice.toLocaleString('en-IN')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography color="text.secondary">{selectedShippingOption?.name || 'Select delivery'}</Typography>
              </Box>
              <Typography fontWeight={600} sx={{ color: '#D5A249' }}>
                {mapDistance > 0 ? `₹${shippingCost}` : '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 3, mt: 2, borderTop: `1px solid ${colors.border}` }}>
              <Typography variant="h6" fontWeight={700}>Total</Typography>
              <Typography variant="h6" fontWeight={700}>₹{(totalPrice + shippingCost).toLocaleString('en-IN')}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Shipping;
