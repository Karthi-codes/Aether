import { Request, Response } from 'express';
import Festival from '../models/Festival';
import { AuthRequest } from '../middleware/authMiddleware';

// Get all festivals (Admin)
export const getAllFestivals = async (req: Request, res: Response): Promise<void> => {
    try {
        const festivals = await Festival.find().sort({ createdAt: -1 });
        res.status(200).json(festivals);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching festivals', error: error.message });
    }
};

// Get active festivals only (Public)
export const getActiveFestivals = async (req: Request, res: Response): Promise<void> => {
    try {
        const festivals = await Festival.find({ isActive: true }).sort({ name: 1 });
        res.status(200).json(festivals);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching active festivals', error: error.message });
    }
};

// Get festival by ID
export const getFestivalById = async (req: Request, res: Response): Promise<void> => {
    try {
        const festival = await Festival.findById(req.params.id);
        if (!festival) {
            res.status(404).json({ message: 'Festival not found' });
            return;
        }
        res.status(200).json(festival);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching festival', error: error.message });
    }
};

// Get festival by name (Public)
export const getFestivalByName = async (req: Request, res: Response): Promise<void> => {
    try {
        const festival = await Festival.findOne({
            name: { $regex: new RegExp(`^${req.params.name}$`, 'i') },
            isActive: true
        });
        if (!festival) {
            res.status(404).json({ message: 'Festival not found or inactive' });
            return;
        }
        res.status(200).json(festival);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching festival', error: error.message });
    }
};

// Create festival (Admin)
export const createFestival = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, animationType, icon, description, images, startDate, endDate, type } = req.body;

        // Check if festival already exists
        const existingFestival = await Festival.findOne({ name });
        if (existingFestival) {
            res.status(400).json({ message: 'Festival already exists' });
            return;
        }

        const newFestival = new Festival({
            name,
            type: type || 'festival',
            animationType,
            icon,
            description,
            images,
            startDate,
            endDate,
            isActive: false
        });

        const savedFestival = await newFestival.save();
        res.status(201).json(savedFestival);
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating festival', error: error.message });
    }
};

// Toggle festival ON/OFF (Admin)
export const toggleFestival = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const festival = await Festival.findById(req.params.id);
        if (!festival) {
            res.status(404).json({ message: 'Festival not found' });
            return;
        }

        festival.isActive = !festival.isActive;
        await festival.save();

        res.status(200).json({
            message: `Festival ${festival.isActive ? 'activated' : 'deactivated'} successfully`,
            festival
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error toggling festival', error: error.message });
    }
};

// Update festival (Admin)
export const updateFestival = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const updatedFestival = await Festival.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedFestival) {
            res.status(404).json({ message: 'Festival not found' });
            return;
        }
        res.status(200).json(updatedFestival);
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating festival', error: error.message });
    }
};

// Delete festival (Admin)
export const deleteFestival = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const deletedFestival = await Festival.findByIdAndDelete(req.params.id);
        if (!deletedFestival) {
            res.status(404).json({ message: 'Festival not found' });
            return;
        }
        res.status(200).json({ message: 'Festival deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting festival', error: error.message });
    }
};
