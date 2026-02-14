import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import Transaction from '../models/Transaction';
import Product from '../models/Product';

// Get all transactions (Admin only)
export const getAllTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const transactions = await Transaction.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            transactions,
            total: transactions.length,
        });
    } catch (error: any) {
        console.error('Get all transactions error:', error);
        res.status(500).json({ message: 'Server error retrieving transactions', error: error.message });
    }
};

// Get system stats (Admin only)
export const getSystemStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalTransactions = await Transaction.countDocuments();

        // Calculate total funds in system
        const users = await User.find({}, 'walletBalance');
        const totalFunds = users.reduce((acc, user) => acc + (user.walletBalance || 0), 0);

        res.status(200).json({
            totalUsers,
            totalProducts,
            totalOrders: totalTransactions, // Using transactions as orders for now
            revenue: totalFunds,
            totalTransactions,
            totalFunds,
        });
    } catch (error: any) {
        console.error('Get system stats error:', error);
        res.status(500).json({ message: 'Server error retrieving stats', error: error.message });
    }
};

// Get all users (Admin only)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error: any) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error retrieving users', error: error.message });
    }
};
