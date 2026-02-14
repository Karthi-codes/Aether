import { Request, Response } from 'express';
import SiteReview from '../models/SiteReview';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

export const getSiteReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const reviews = await SiteReview.find({ isApproved: true }).sort({ createdAt: -1 }).limit(20);
        res.status(200).json(reviews);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};

export const createSiteReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { rating, comment } = req.body;
        const authReq = req as AuthRequest;
        const userId = authReq.userId;

        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const newReview = new SiteReview({
            userId,
            userName: user.name,
            userAvatar: user.profilePhoto,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json(newReview);
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating review', error: error.message });
    }
};
