import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as cartController from '../controllers/cart.controller';
import * as wishlistController from '../controllers/wishlist.controller';

const router = express.Router();

// ==================== CART ROUTES ====================

// Get user's cart
router.get('/cart', authMiddleware, cartController.getCart);

// Add item to cart
router.post('/cart/add', authMiddleware, cartController.addToCart);

// Update item quantity
router.put('/cart/update', authMiddleware, cartController.updateCartItem);

// Remove item from cart
router.delete('/cart/remove', authMiddleware, cartController.removeFromCart);

// Clear user's cart
router.delete('/cart', authMiddleware, cartController.clearCart);

// ==================== WISHLIST ROUTES ====================

// Get user's wishlist
router.get('/wishlist', authMiddleware, wishlistController.getWishlist);

// Add to wishlist
router.post('/wishlist', authMiddleware, wishlistController.addToWishlist);

// Remove from wishlist
router.delete('/wishlist/:productId', authMiddleware, wishlistController.removeFromWishlist);


// ==================== PROFILE PHOTO ROUTES ====================

// Update profile photo
router.post('/profile-photo', authMiddleware, async (req: any, res: any) => {
    try {
        const { profilePhoto } = req.body;

        if (!profilePhoto) {
            return res.status(400).json({ message: 'Profile photo is required' });
        }

        // Import User model
        const User = (await import('../models/User')).default;

        const user = await User.findByIdAndUpdate(
            req.userId,
            { profilePhoto },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile photo updated successfully',
            profilePhoto: user.profilePhoto,
        });
    } catch (error: any) {
        console.error('Update profile photo error:', error);
        res.status(500).json({ message: 'Server error updating profile photo', error: error.message });
    }
});

// Delete profile photo
router.delete('/profile-photo', authMiddleware, async (req: any, res: any) => {
    try {
        const User = (await import('../models/User')).default;

        const user = await User.findByIdAndUpdate(
            req.userId,
            { profilePhoto: null },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile photo removed successfully' });
    } catch (error: any) {
        console.error('Delete profile photo error:', error);
        res.status(500).json({ message: 'Server error removing profile photo', error: error.message });
    }
});

export default router;

