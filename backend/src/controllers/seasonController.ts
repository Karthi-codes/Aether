import { Request, Response } from 'express';
import Season from '../models/Season';
import { AuthRequest } from '../middleware/authMiddleware';

// Get all seasons (Admin)
export const getAllSeasons = async (req: Request, res: Response): Promise<void> => {
    try {
        const seasons = await Season.find().sort({ createdAt: -1 });
        res.status(200).json(seasons);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching seasons', error: error.message });
    }
};

// Get active seasons only (Public)
export const getActiveSeasons = async (req: Request, res: Response): Promise<void> => {
    try {
        const seasons = await Season.find({ isActive: true }).sort({ name: 1 });
        res.status(200).json(seasons);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching active seasons', error: error.message });
    }
};

// Get season by ID
export const getSeasonById = async (req: Request, res: Response): Promise<void> => {
    try {
        const season = await Season.findById(req.params.id);
        if (!season) {
            res.status(404).json({ message: 'Season not found' });
            return;
        }
        res.status(200).json(season);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching season', error: error.message });
    }
};

// Get season by name (Public)
export const getSeasonByName = async (req: Request, res: Response): Promise<void> => {
    try {
        const season = await Season.findOne({
            name: { $regex: new RegExp(`^${req.params.name}$`, 'i') },
            isActive: true
        });
        if (!season) {
            res.status(404).json({ message: 'Season not found or inactive' });
            return;
        }
        res.status(200).json(season);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching season', error: error.message });
    }
};

// Create season (Admin)
export const createSeason = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, animationType, icon } = req.body;

        // Check if season already exists
        const existingSeason = await Season.findOne({ name });
        if (existingSeason) {
            res.status(400).json({ message: 'Season already exists' });
            return;
        }

        const newSeason = new Season({
            name,
            animationType,
            icon,
            isActive: false
        });

        const savedSeason = await newSeason.save();
        res.status(201).json(savedSeason);
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating season', error: error.message });
    }
};

// Toggle season ON/OFF (Admin)
export const toggleSeason = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const season = await Season.findById(req.params.id);
        if (!season) {
            res.status(404).json({ message: 'Season not found' });
            return;
        }

        season.isActive = !season.isActive;
        await season.save();

        res.status(200).json({
            message: `Season ${season.isActive ? 'activated' : 'deactivated'} successfully`,
            season
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error toggling season', error: error.message });
    }
};

// Update season (Admin)
export const updateSeason = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const updatedSeason = await Season.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedSeason) {
            res.status(404).json({ message: 'Season not found' });
            return;
        }
        res.status(200).json(updatedSeason);
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating season', error: error.message });
    }
};

// Delete season (Admin)
export const deleteSeason = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const deletedSeason = await Season.findByIdAndDelete(req.params.id);
        if (!deletedSeason) {
            res.status(404).json({ message: 'Season not found' });
            return;
        }
        res.status(200).json({ message: 'Season deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting season', error: error.message });
    }
};
