import { Request, Response } from 'express';
import OrderTracking from '../models/OrderTracking.js';
import { getIO } from '../socket.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// Create new tracking order
export const createTrackingOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, productName, productImage, price, deliveryAddress } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const tracking = new OrderTracking({
            userId,
            productId,
            productName,
            productImage,
            price,
            deliveryAddress,
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });

        await tracking.save();

        // Emit socket event
        const io = getIO();
        io.to(`user_${userId}`).emit('tracking_created', tracking);

        res.status(201).json(tracking);
    } catch (error: any) {
        console.error('Error creating tracking order:', error);
        res.status(500).json({ message: error.message || 'Failed to create tracking order' });
    }
};

// Get tracking by order ID
export const getTrackingByOrderId = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params;
        const userId = req.userId;

        const tracking = await OrderTracking.findOne({ orderId });

        if (!tracking) {
            return res.status(404).json({ message: 'Tracking order not found' });
        }

        // User isolation: only owner can view
        if (tracking.userId.toString() !== userId && !req.userRole) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(tracking);
    } catch (error: any) {
        console.error('Error fetching tracking:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch tracking' });
    }
};

// Get all tracking orders for a user
export const getUserTrackingOrders = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const trackings = await OrderTracking.find({ userId }).sort({ createdAt: -1 });

        res.json(trackings);
    } catch (error: any) {
        console.error('Error fetching user trackings:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch trackings' });
    }
};

// Update stage (Admin only)
export const updateStage = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params;
        const { stage, notes } = req.body;

        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const tracking = await OrderTracking.findOne({ orderId });

        if (!tracking) {
            return res.status(404).json({ message: 'Tracking order not found' });
        }

        // Update current stage
        tracking.currentStage = stage;

        // Update stages array
        const stageIndex = tracking.stages.findIndex(s => s.name === stage);
        if (stageIndex !== -1) {
            tracking.stages[stageIndex].status = 'completed';
            tracking.stages[stageIndex].timestamp = new Date();
            if (notes) tracking.stages[stageIndex].notes = notes;

            // Mark next stage as in_progress
            if (stageIndex + 1 < tracking.stages.length) {
                tracking.stages[stageIndex + 1].status = 'in_progress';
                tracking.stages[stageIndex + 1].timestamp = new Date();
            }
        }

        // If delivered, set actual delivery time
        if (stage === 'delivered') {
            tracking.actualDelivery = new Date();
        }

        await tracking.save();

        // Emit socket event to user
        const io = getIO();
        io.to(`user_${tracking.userId}`).emit('stage_updated', {
            orderId: tracking.orderId,
            stage,
            tracking
        });

        res.json(tracking);
    } catch (error: any) {
        console.error('Error updating stage:', error);
        res.status(500).json({ message: error.message || 'Failed to update stage' });
    }
};

// Update location (for courier simulation)
export const updateLocation = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params;
        const { latitude, longitude } = req.body;

        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const tracking = await OrderTracking.findOne({ orderId });

        if (!tracking) {
            return res.status(404).json({ message: 'Tracking order not found' });
        }

        const newLocation = {
            latitude,
            longitude,
            timestamp: new Date()
        };

        tracking.currentLocation = newLocation;
        if (!tracking.coordinates) tracking.coordinates = [];
        tracking.coordinates.push(newLocation);

        await tracking.save();

        // Emit socket event
        const io = getIO();
        io.to(`user_${tracking.userId}`).emit('location_updated', {
            orderId: tracking.orderId,
            location: newLocation
        });

        res.json(tracking);
    } catch (error: any) {
        console.error('Error updating location:', error);
        res.status(500).json({ message: error.message || 'Failed to update location' });
    }
};

// Assign courier (Admin only)
export const assignCourier = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params;
        const { name, contact, vehicle, vehicleNumber } = req.body;

        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const tracking = await OrderTracking.findOne({ orderId });

        if (!tracking) {
            return res.status(404).json({ message: 'Tracking order not found' });
        }

        tracking.courierInfo = {
            name,
            contact,
            vehicle,
            vehicleNumber
        };

        await tracking.save();

        // Emit socket event
        const io = getIO();
        io.to(`user_${tracking.userId}`).emit('courier_assigned', {
            orderId: tracking.orderId,
            courierInfo: tracking.courierInfo
        });

        res.json(tracking);
    } catch (error: any) {
        console.error('Error assigning courier:', error);
        res.status(500).json({ message: error.message || 'Failed to assign courier' });
    }
};

// Get all tracking orders (Admin only)
export const getAllTrackingOrders = async (req: AuthRequest, res: Response) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const trackings = await OrderTracking.find().sort({ createdAt: -1 }).populate('userId', 'name email');

        res.json(trackings);
    } catch (error: any) {
        console.error('Error fetching all trackings:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch trackings' });
    }
};
