import { Request, Response } from 'express';
import ScratchCard from '../models/ScratchCard';
import User from '../models/User';

interface AuthRequest extends Request {
    userId?: string;
    user?: any;
}

// Get all scratch cards for the logged-in user
export const getScratchCards = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).userId || (req as any).user?.id || (req as any).user?._id;
        const scratchCards = await ScratchCard.find({ userId }).sort({ earnedAt: -1 });

        const formattedCards = scratchCards.map(card => ({
            id: card._id,
            orderAmount: card.orderAmount,
            discountPercentage: card.discountPercentage,
            discountAmount: card.discountAmount,
            isScratched: card.isScratched,
            isRedeemed: card.isRedeemed,
            expiresAt: card.expiresAt.toISOString(),
            earnedAt: card.earnedAt.toISOString()
        }));

        res.json(formattedCards);
    } catch (error) {
        console.error('Error fetching scratch cards:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Redeem a scratch card
export const redeemScratchCard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as AuthRequest).userId || (req as any).user?.id || (req as any).user?._id;

        const card = await ScratchCard.findOne({ _id: id, userId });

        if (!card) {
            return res.status(404).json({ message: 'Scratch card not found' });
        }

        if (card.isRedeemed) {
            // Check if it was already processed, maybe just return success?
            // But if we want to prevent double money adding, we should error or return current state.
            return res.status(400).json({ message: 'Card already redeemed' });
        }

        if (new Date(card.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'Card expired' });
        }

        if (!card.discountAmount || card.discountAmount <= 0) {
            return res.status(400).json({ message: 'Card has no valid discount amount' });
        }

        // Update card status
        card.isRedeemed = true;
        card.isScratched = true; // Ensure it's revealed
        await card.save();

        // Add to user wallet
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.walletBalance = (user.walletBalance || 0) + card.discountAmount;
        await user.save();

        res.json({
            message: 'Redeemed successfully',
            newWalletBalance: user.walletBalance,
            redeemedAmount: card.discountAmount
        });

    } catch (error) {
        console.error('Error redeeming scratch card:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a scratch card (Internal/Admin/Order usage)
export const createScratchCard = async (req: Request, res: Response) => {
    try {
        const { orderAmount, orderId, userId: bodyUserId } = req.body;
        const userId = bodyUserId || (req as AuthRequest).userId || (req as any).user?.id;

        if (!orderAmount) {
            return res.status(400).json({ message: 'Order amount required' });
        }

        const percentage = Math.floor(Math.random() * 4) + 2;
        const discountAmount = Math.round((orderAmount * percentage) / 100 * 100) / 100;

        const newCard = new ScratchCard({
            userId,
            orderId,
            orderAmount,
            discountPercentage: percentage,
            discountAmount,
            isScratched: false,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        await newCard.save();

        res.status(201).json({
            id: newCard._id,
            orderAmount: newCard.orderAmount,
            expiresAt: newCard.expiresAt.toISOString()
        });
    } catch (error) {
        console.error('Error creating scratch card:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Scratch a card (reveal)
export const scratchCard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as AuthRequest).userId || (req as any).user?.id || (req as any).user?._id;

        const card = await ScratchCard.findOne({ _id: id, userId });
        if (!card) return res.status(404).json({ message: 'Card not found' });

        if (card.isScratched) {
            return res.json({
                percentage: card.discountPercentage,
                amount: card.discountAmount
            });
        }

        // If amount wasn't set on creation, set it now
        if (!card.discountAmount) {
            const percentage = Math.floor(Math.random() * 4) + 2;
            card.discountPercentage = percentage;
            card.discountAmount = Math.round((card.orderAmount * percentage) / 100 * 100) / 100;
        }

        card.isScratched = true;
        await card.save();

        res.json({
            percentage: card.discountPercentage,
            amount: card.discountAmount
        });

    } catch (error) {
        console.error('Error scratching card:', error);
        res.status(500).json({ message: 'Server error' });
    }
}
