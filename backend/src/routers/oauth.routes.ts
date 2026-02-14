import express from 'express';
import passport from '../utils/lambda';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

const router = express.Router();

// Initiate Google OAuth
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    })
);

// Google OAuth callback
router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`,
    }),
    (req, res) => {
        try {
            const user = req.user as IUser;

            if (!user) {
                return res.redirect(
                    `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_user`
                );
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            // Prepare user data for frontend (exclude sensitive fields)
            const userData = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                walletBalance: user.walletBalance,
                isVerified: user.isVerified,
                provider: user.provider,
            };

            // Redirect to frontend with token and user data
            const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
            const encodedUser = encodeURIComponent(JSON.stringify(userData));

            res.redirect(
                `${frontendURL}/oauth/callback?token=${token}&user=${encodedUser}`
            );
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(
                `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`
            );
        }
    }
);

export default router;
