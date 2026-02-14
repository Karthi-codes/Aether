import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';

// Get Wishlist
export const getWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = new Wishlist({ userId, products: [] });
            await wishlist.save();
        }

        // Ideally, populate product details here if needed
        // For now, returning the list of product IDs, frontend might fetch details
        // Or we can fetch details:
        const productDetails = await Product.find({ _id: { $in: wishlist.products } });

        res.json({ wishlist, items: productDetails });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wishlist', error });
    }
};

// Add to Wishlist
export const addToWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { items } = req.body; // Expecting { items: [{ productId: '...' }, ...] } or just { productId: '...' }

        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            wishlist = new Wishlist({ userId, products: [] });
        }

        // If items are passed as a bulk sync (from frontend loaded state)
        if (items && Array.isArray(items)) {
            const newIds = items.map((i: any) => i.productId).filter((id: string) => !wishlist?.products.includes(id));
            wishlist.products.push(...newIds);

            await wishlist.save();
            return res.json(wishlist);
        }

        // Single add
        const { productId } = req.body;
        if (!productId) {
            // If body has items but not array (edge case), or just invalid
            return res.status(400).json({ message: 'Product ID required' });
        }

        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
        }

        res.json(wishlist);

    } catch (error) {
        res.status(500).json({ message: 'Error adding to wishlist', error });
    }
};

// Remove from Wishlist
export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ userId });
        if (wishlist) {
            wishlist.products = wishlist.products.filter(id => id !== productId);
            await wishlist.save();
        }

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Error removing from wishlist', error });
    }
};
