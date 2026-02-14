import { Request, Response } from 'express';
import AutoPurchase from '../models/AutoPurchase';
import PriceChangeLog from '../models/PriceChangeLog';
import Order from '../models/Order';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// Get all active monitors for the logged-in user
export const getAutoPurchases = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const autoPurchases = await AutoPurchase.find({ userId, status: 'active' }).sort({ createdAt: -1 });
        res.json(autoPurchases);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching auto-purchases', error });
    }
};

// Add a new auto-purchase monitor
export const addAutoPurchase = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { productId, productName, productImage, targetPrice, maxPrice, currentPrice, deliveryAddress } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.walletBalance < targetPrice) {
            return res.status(400).json({ message: 'Insufficient wallet balance to set up AutoPay' });
        }

        // Deduct from wallet and move to frozen balance
        user.walletBalance -= targetPrice;
        user.frozenBalance = (user.frozenBalance || 0) + targetPrice;
        await user.save();

        const newAutoPurchase = new AutoPurchase({
            userId,
            productId,
            productName,
            productImage,
            targetPrice,
            currentPrice,
            maxPrice,
            originalPrice: currentPrice,
            lowestPriceSeen: currentPrice,
            deliveryAddress
        });

        await newAutoPurchase.save();
        res.status(201).json(newAutoPurchase);
    } catch (error) {
        res.status(500).json({ message: 'Error creating auto-purchase', error });
    }
};

// Remove/Cancel an auto-purchase
export const removeAutoPurchase = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const autoPurchase = await AutoPurchase.findOne({ _id: id, userId });
        if (!autoPurchase) {
            console.log(`Auto-purchase not found for ID: ${id} and User: ${userId}`);
            return res.status(404).json({ message: 'Auto-purchase not found' });
        }

        if (autoPurchase.status === 'active') {
            const user = await User.findById(userId);
            if (user) {
                // Refund frozen funds to wallet
                user.frozenBalance = Math.max(0, (user.frozenBalance || 0) - autoPurchase.targetPrice);
                user.walletBalance += autoPurchase.targetPrice;
                await user.save();
            }

            autoPurchase.status = 'cancelled';
            await autoPurchase.save();
        }

        res.json({ message: 'Auto-purchase cancelled' });
    } catch (error) {
        console.error('Error removing auto-purchase:', error);
        res.status(500).json({ message: 'Error removing auto-purchase', error });
    }
};

// Update target price
export const updateTargetPrice = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { targetPrice } = req.body;

        const autoPurchase = await AutoPurchase.findOne({ _id: id, userId });
        if (!autoPurchase) {
            return res.status(404).json({ message: 'Auto-purchase not found' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const oldTargetPrice = autoPurchase.targetPrice;
        const diff = targetPrice - oldTargetPrice;

        if (diff > 0) {
            // Increasing target price - need more funds
            if (user.walletBalance < diff) {
                return res.status(400).json({ message: 'Insufficient wallet balance for price increase' });
            }
            user.walletBalance -= diff;
            user.frozenBalance = (user.frozenBalance || 0) + diff;
        } else if (diff < 0) {
            // Decreasing target price - refund difference
            const refund = Math.abs(diff);
            user.frozenBalance = Math.max(0, (user.frozenBalance || 0) - refund);
            user.walletBalance += refund;
        }

        await user.save();

        autoPurchase.targetPrice = targetPrice;
        await autoPurchase.save();

        res.json(autoPurchase);
    } catch (error) {
        res.status(500).json({ message: 'Error updating target price', error });
    }
};

// Get Purchase History (Auto-purchases only)
export const getAutoPurchaseHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        // We can fetch from AutoPurchase where status='purchased'
        // OR from Orders where source='autopurchase'
        // Let's use AutoPurchase model as it has specific fields like 'targetPrice' at time of setup
        const history = await AutoPurchase.find({ userId, status: 'purchased' }).sort({ purchasedAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history', error });
    }
};

// Get Price Change Logs (System wide or product specific?)
// Usually system wide or per product. Frontend showed all logs.
export const getPriceChangeLogs = async (req: Request, res: Response) => {
    try {
        const logs = await PriceChangeLog.find().sort({ changedAt: -1 }).limit(50);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching price logs', error });
    }
};

// Handle Price Update (Internal helper called by Product Controller)
export const handlePriceUpdate = async (productId: string, productName: string, oldPrice: number, newPrice: number, changedBy: string) => {
    try {
        // 1. Create PriceChangeLog
        const log = new PriceChangeLog({
            productId,
            productName,
            oldPrice,
            newPrice,
            changedBy,
            changedAt: new Date()
        });
        await log.save();

        // 2. Check for AutoPurchases that match condition (active and targetPrice >= newPrice)
        const matches = await AutoPurchase.find({
            productId,
            status: 'active',
            targetPrice: { $gte: newPrice }
        });

        console.log(`Checking auto-purchases for ${productName}: Found ${matches.length} matches`);

        for (const match of matches) {
            const user = await User.findById(match.userId);
            if (!user) continue;

            // Execute Purchase
            const cost = newPrice;
            const reserved = match.targetPrice; // Funds currently frozen for this item

            // Adjust balances
            // Remove from frozen
            user.frozenBalance = Math.max(0, (user.frozenBalance || 0) - reserved);

            // Refund difference if any (reserved > cost)
            if (reserved > cost) {
                user.walletBalance += (reserved - cost);
            }

            await user.save();

            // Create Order
            const newOrder = new Order({
                userId: user._id,
                items: [{
                    product: productId,
                    name: productName,
                    quantity: 1,
                    price: newPrice,
                    image: match.productImage
                }],
                totalAmount: cost,
                shippingAddress: match.deliveryAddress ? JSON.parse(match.deliveryAddress) : {},
                paymentMethod: 'wallet',
                orderStatus: 'pending',
                orderSource: 'autopurchase',
                createdAt: new Date(),
                paymentStatus: 'completed'
            });

            await newOrder.save();

            // Update AutoPurchase status
            match.status = 'purchased';
            match.currentPrice = newPrice; // Record purchased price
            match.purchasedAt = new Date();
            await match.save();
        }

    } catch (error) {
        console.error("Error handling price update:", error);
    }
};
