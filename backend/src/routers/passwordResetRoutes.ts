import express, { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';

const router = express.Router();

// Request password reset (generates token)
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists or not for security
            res.status(200).json({
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
            return;
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token before saving to database
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed token and expiry (1 hour from now)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        // In a real app, you would send this token via email
        // For now, we'll return it in the response (NOT SECURE FOR PRODUCTION!)
        res.status(200).json({
            message: 'Password reset token generated',
            resetToken, // In production, send this via email instead
            // For testing: Use this URL format: /reset-password?token=RESET_TOKEN
        });
    } catch (error: any) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error processing request', error: error.message });
    }
});

// Reset password with token
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            res.status(400).json({ message: 'Token and new password are required' });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({ message: 'Password must be at least 6 characters' });
            return;
        }

        // Hash the token from request to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token that hasn't expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid or expired reset token' });
            return;
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error resetting password', error: error.message });
    }
});

// Verify reset token (optional - to check if token is valid before showing reset form)
router.get('/verify-reset-token/:token', async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.params.token as string;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            res.status(400).json({ valid: false, message: 'Invalid or expired token' });
            return;
        }

        res.status(200).json({ valid: true, message: 'Token is valid' });
    } catch (error: any) {
        console.error('Verify token error:', error);
        res.status(500).json({ valid: false, message: 'Server error', error: error.message });
    }
});

export default router;
