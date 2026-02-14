import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Transaction from '../models/Transaction';
import LoginHistory from '../models/LoginHistory';
import { AuthRequest } from '../middleware/authMiddleware';
import { otpService } from '../services/otpService';

// ... (existing imports)

// Register new user (CREATE)
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            res.status(400).json({ message: 'Name, email, and password are required' });
            return;
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({ message: 'Email already exists. Please log in or use a different email.' });
            return;
        }

        // Create new user with dummy balance (unverified)
        const user = new User({
            name,
            email,
            password,
            walletBalance: 1000, // Initial Dummy Balance
            role: ['karthikarthikeyan16401@gmail.com', 'logank7129@gmail.com'].includes(email.toLowerCase()) ? 'admin' : 'user',
            isVerified: false, // User must verify email
        });

        await user.save();

        // Create Welcome Bonus Transaction
        const transaction = new Transaction({
            userId: user._id,
            type: 'deposit',
            amount: 1000,
            description: 'Welcome Bonus',
            status: 'completed'
        });
        await transaction.save();

        // Send OTP for email verification
        await otpService.createAndSendOTP(user._id.toString(), user.email, user.name);

        res.status(201).json({
            message: 'Registration successful. Please check your email for the OTP to verify your account.',
            userId: user._id,
            email: user.email,
        });
    } catch (error: any) {
        console.error('Registration error:', error);

        // Handle MongoDB duplicate key error (in case unique index catches it)
        if (error.code === 11000) {
            res.status(400).json({ message: 'Email already exists. Please log in or use a different email.' });
            return;
        }

        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // Save failed login attempt
            await LoginHistory.create({
                email,
                success: false,
                ipAddress: req.ip || req.socket.remoteAddress,
                userAgent: req.get('user-agent'),
            });

            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            // Save failed login attempt
            await LoginHistory.create({
                userId: user._id,
                email,
                success: false,
                ipAddress: req.ip || req.socket.remoteAddress,
                userAgent: req.get('user-agent'),
            });

            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Check if email is verified
        if (!user.isVerified) {
            res.status(403).json({
                message: 'Please verify your email before logging in. Check your inbox for the OTP.',
                email: user.email,
                requiresVerification: true
            });
            return;
        }

        // Save successful login
        await LoginHistory.create({
            userId: user._id,
            email,
            success: true,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.get('user-agent'),
        });

        // Force upgrade role if email matches (for existing users)
        if (['karthikarthikeyan16401@gmail.com', 'logank7129@gmail.com'].includes(email.toLowerCase()) && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                walletBalance: user.walletBalance,
                frozenBalance: user.frozenBalance || 0,
                profilePhoto: user.profilePhoto,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// Get user by ID (READ)
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ user });
    } catch (error: any) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error retrieving user', error: error.message });
    }
};

// Get current authenticated user (READ)
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ user });
    } catch (error: any) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error retrieving user', error: error.message });
    }
};

// Get all users (READ - Admin only)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await User.find().select('-password');

        res.status(200).json({
            users,
            total: users.length,
        });
    } catch (error: any) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error retrieving users', error: error.message });
    }
};

// Update user (UPDATE)
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        // Only allow user to update their own profile
        if (req.userId !== id) {
            res.status(403).json({ message: 'You can only update your own profile' });
            return;
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (req.body.profilePhoto) updateData.profilePhoto = req.body.profilePhoto;
        if (email) {
            // Check if email is already taken
            const existingUser = await User.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                res.status(400).json({ message: 'Email already in use' });
                return;
            }
            updateData.email = email;
        }

        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({
            message: 'User updated successfully',
            user,
        });
    } catch (error: any) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error updating user', error: error.message });
    }
};

// Delete user (DELETE)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Only allow user to delete their own account
        if (req.userId !== id) {
            res.status(403).json({ message: 'You can only delete your own account' });
            return;
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Also delete related data
        await LoginHistory.deleteMany({ userId: id });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error deleting user', error: error.message });
    }
};

// Get login history
export const getLoginHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const history = await LoginHistory.find({ userId: req.userId })
            .sort({ loginTime: -1 })
            .limit(50);

        res.status(200).json({
            history,
            total: history.length,
        });
    } catch (error: any) {
        console.error('Get login history error:', error);
        res.status(500).json({ message: 'Server error retrieving login history', error: error.message });
    }
};
