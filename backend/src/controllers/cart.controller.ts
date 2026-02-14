import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Cart from '../models/Cart';
import Product from '../models/Product'; // Assuming you have a Product model

// Get Cart
export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
            await cart.save();
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error });
    }
};

// Add to Cart
export const addToCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { productId, quantity, selectedSize, selectedColor } = req.body;

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const itemIndex = cart.items.findIndex(p =>
            p.productId == productId &&
            p.selectedSize === selectedSize &&
            p.selectedColor === selectedColor
        );

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                productId,
                name: product.name,
                image: product.images && product.images.length > 0 ? product.images[0] : '',
                price: product.price,
                selectedSize,
                selectedColor,
                quantity
            });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error });
    }
};

// Update Cart Item Quantity
export const updateCartItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { productId, quantity, selectedSize, selectedColor } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(p =>
            p.productId == productId &&
            p.selectedSize === selectedSize &&
            p.selectedColor === selectedColor
        );

        if (itemIndex > -1) {
            // If quantity is 0 or less, remove the item
            if (quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
            await cart.save();
            res.json(cart);
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart', error });
    }
};

// Remove from Cart
export const removeFromCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { productId, selectedSize, selectedColor } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Filter out the item to remove
        cart.items = cart.items.filter(p =>
            !(p.productId == productId &&
                p.selectedSize === selectedSize &&
                p.selectedColor === selectedColor)
        );

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing from cart', error });
    }
};

// Clear Cart
export const clearCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        await Cart.findOneAndDelete({ userId });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing cart', error });
    }
};
