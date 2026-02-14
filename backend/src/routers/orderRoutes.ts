import express, { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { createScratchCard, MIN_ORDER_FOR_SCRATCH_CARD } from '../services/discountService';

const router = express.Router();

// Generate unique order number
const generateOrderNumber = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

// Create new order (when user completes purchase)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { items, totalAmount, shippingAddress, paymentMethod, shippingCost } = req.body;

        if (!items || items.length === 0) {
            res.status(400).json({ message: 'Order must contain at least one item' });
            return;
        }

        // Map items to ensure correct field names
        const mappedItems = items.map((item: any) => ({
            productId: item.productId || item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            selectedSize: item.selectedSize || item.size || 'One Size',
            selectedColor: item.selectedColor || item.color || 'Default',
            quantity: item.quantity || 1,
        }));

        const orderNumber = generateOrderNumber();

        if (paymentMethod === 'wallet') {
            const user = await User.findById(req.userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            if (user.walletBalance < totalAmount) {
                res.status(400).json({ message: 'Insufficient wallet balance' });
                return;
            }

            // Deduct from wallet
            user.walletBalance -= totalAmount;
            await user.save();

            // Create transaction record
            await Transaction.create({
                userId: req.userId,
                type: 'purchase',
                amount: totalAmount,
                description: `Purchase - Order #${orderNumber}`,
                status: 'completed'
            });
        }

        // Check stock and deduct counts
        for (const item of mappedItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                res.status(404).json({ message: `Product not found: ${item.name}` });
                return;
            }
            if (product.stock < item.quantity) {
                res.status(400).json({ message: `Insufficient stock for: ${item.name}` });
                return;
            }
            product.stock -= item.quantity;
            await product.save();
        }

        const order = await Order.create({
            userId: req.userId,
            orderNumber,
            items: mappedItems,
            totalAmount,
            shippingAddress,
            paymentMethod,
            orderStatus: paymentMethod === 'wallet' ? 'processing' : 'pending',
        });

        // Generate scratch card for orders above minimum threshold
        let scratchCard = null;
        if (totalAmount >= MIN_ORDER_FOR_SCRATCH_CARD && req.userId) {
            scratchCard = await createScratchCard(
                req.userId.toString(),
                order._id.toString(),
                totalAmount
            );
        }

        // Get updated user balance for wallet payments
        let newWalletBalance = undefined;
        if (paymentMethod === 'wallet') {
            const updatedUser = await User.findById(req.userId);
            newWalletBalance = updatedUser?.walletBalance;
        }

        res.status(201).json({
            message: 'Order created successfully',
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                items: order.items,
                totalAmount: order.totalAmount,
                orderStatus: order.orderStatus,
                createdAt: order.createdAt,
            },
            newWalletBalance, // Include for wallet payments
            scratchCard: scratchCard ? {
                id: scratchCard._id,
                orderAmount: scratchCard.orderAmount,
                expiresAt: scratchCard.expiresAt,
            } : null, // Include scratch card info if generated
        });
    } catch (error: any) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error creating order', error: error.message });
    }
});

// Get user's order history
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orders = await Order.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            orders,
            totalOrders: orders.length,
        });
    } catch (error: any) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Server error retrieving orders', error: error.message });
    }
});

// Get specific order by order number
router.get('/:orderNumber', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { orderNumber } = req.params;

        const order = await Order.findOne({
            userId: req.userId,
            orderNumber,
        }).select('-__v');

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        res.status(200).json({ order });
    } catch (error: any) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Server error retrieving order', error: error.message });
    }
});

// Get last purchase (most recent order)
router.get('/last/purchase', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const lastOrder = await Order.findOne({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select('-__v');

        if (!lastOrder) {
            res.status(404).json({ message: 'No previous purchases found' });
            return;
        }

        res.status(200).json({
            message: 'Last purchase retrieved successfully',
            order: lastOrder,
        });
    } catch (error: any) {
        console.error('Get last purchase error:', error);
        res.status(500).json({ message: 'Server error retrieving last purchase', error: error.message });
    }
});

export default router;
