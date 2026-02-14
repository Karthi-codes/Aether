import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

// Get wallet balance and transaction history
export const getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            balance: user.walletBalance,
            frozenBalance: user.frozenBalance || 0,
            transactions,
        });
    } catch (error: any) {
        console.error('Get wallet error:', error);
        res.status(500).json({ message: 'Server error retrieving wallet', error: error.message });
    }
};

// Add funds to wallet (Mock)
export const addFunds = async (req: AuthRequest, res: Response): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount } = req.body;
        const userId = req.userId;

        if (!amount || amount <= 0) {
            res.status(400).json({ message: 'Invalid amount' });
            return;
        }

        // Update user balance
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { walletBalance: amount } },
            { new: true, session }
        );

        if (!user) {
            await session.abortTransaction();
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Create transaction record
        const transaction = new Transaction({
            userId,
            type: 'deposit',
            amount,
            description: 'Funds added via mock payment',
            status: 'completed',
        });

        await transaction.save({ session });

        await session.commitTransaction();

        res.status(200).json({
            message: 'Funds added successfully',
            balance: user.walletBalance,
            transaction,
        });
    } catch (error: any) {
        await session.abortTransaction();
        console.error('Add funds error:', error);
        res.status(500).json({ message: 'Server error adding funds', error: error.message });
    } finally {
        session.endSession();
    }
};
// Transfer funds (P2P)
export const transferFunds = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { recipientEmail, amount } = req.body;
        const senderId = req.userId;

        if (!recipientEmail || !amount || amount <= 0) {
            res.status(400).json({ message: 'Invalid recipient or amount' });
            return;
        }

        // Find sender
        const sender = await User.findById(senderId);
        if (!sender) {
            res.status(404).json({ message: 'Sender not found' });
            return;
        }

        if (sender.walletBalance < amount) {
            res.status(400).json({ message: 'Insufficient funds' });
            return;
        }

        // Find recipient
        const recipient = await User.findOne({ email: recipientEmail });
        if (!recipient) {
            res.status(404).json({ message: 'Recipient not found' });
            return;
        }

        if (sender.email === recipient.email) {
            res.status(400).json({ message: 'Cannot transfer to yourself' });
            return;
        }

        // Deduct from sender
        sender.walletBalance -= amount;
        await sender.save();

        // Add to recipient
        recipient.walletBalance += amount;
        await recipient.save();

        // Create Sender Transaction (Debit)
        const senderTx = new Transaction({
            userId: sender._id,
            type: 'withdrawal', // or 'transfer_out'
            amount: amount,
            description: `Transfer to ${recipient.name} (${recipient.email})`,
            status: 'completed'
        });
        await senderTx.save();

        // Create Recipient Transaction (Credit)
        const recipientTx = new Transaction({
            userId: recipient._id,
            type: 'deposit', // or 'transfer_in'
            amount: amount,
            description: `Received from ${sender.name}`,
            status: 'completed'
        });
        await recipientTx.save();

        res.status(200).json({
            message: 'Transfer successful',
            balance: sender.walletBalance,
            transaction: senderTx
        });
    } catch (error: any) {
        console.error('Transfer funds error:', error);
        res.status(500).json({ message: 'Server error processing transfer', error: error.message });
    }
};
