import { Request, Response } from 'express';
import { otpService } from '../services/otpService';
import User from '../models/User';
import jwt from 'jsonwebtoken';

// Send OTP to user's email
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const result = await otpService.resendOTP(email);

        if (!result.success) {
            res.status(400).json({ message: result.message });
            return;
        }

        res.status(200).json({ message: result.message });
    } catch (error: any) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            res.status(400).json({ message: 'Email and OTP are required' });
            return;
        }

        // Validate OTP
        const result = await otpService.validateOTP(email, otp);

        if (!result.success) {
            res.status(400).json({ message: result.message });
            return;
        }

        // Get user details
        const user = await User.findById(result.userId).select('-password');

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

        res.status(200).json({
            message: result.message,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                walletBalance: user.walletBalance,
                frozenBalance: user.frozenBalance || 0,
                profilePhoto: user.profilePhoto,
                isVerified: user.isVerified,
            },
        });
    } catch (error: any) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
    }
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const result = await otpService.resendOTP(email);

        if (!result.success) {
            res.status(400).json({ message: result.message });
            return;
        }

        res.status(200).json({ message: result.message });
    } catch (error: any) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
    }
};
