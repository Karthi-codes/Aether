import express from 'express';
import {
    getAllSeasons,
    getActiveSeasons,
    getSeasonById,
    getSeasonByName,
    createSeason,
    toggleSeason,
    updateSeason,
    deleteSeason
} from '../controllers/seasonController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import upload from '../middleware/upload';

const router = express.Router();

// Public routes
router.get('/active', getActiveSeasons);
router.get('/name/:name', getSeasonByName);

// Admin routes (protected)
router.get('/', authMiddleware, adminMiddleware, getAllSeasons);
router.get('/:id', authMiddleware, adminMiddleware, getSeasonById);
router.post('/', authMiddleware, adminMiddleware, createSeason);
router.patch('/:id/toggle', authMiddleware, adminMiddleware, toggleSeason);
router.put('/:id', authMiddleware, adminMiddleware, updateSeason);
router.delete('/:id', authMiddleware, adminMiddleware, deleteSeason);

// Image upload endpoint
router.post('/:id/upload', authMiddleware, adminMiddleware, upload.array('images', 10), async (req, res) => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const imageUrls = files.map(file => `/uploads/seasons/${file.filename}`);

        // Import Season model dynamically to avoid circular dependencies
        const Season = (await import('../models/Season')).default;
        const season = await Season.findById(req.params.id);

        if (!season) {
            return res.status(404).json({ message: 'Season not found' });
        }

        season.images = [...season.images, ...imageUrls];
        await season.save();

        res.status(200).json({
            message: 'Images uploaded successfully',
            images: season.images
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

export default router;
