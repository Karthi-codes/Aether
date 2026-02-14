import express from 'express';
import {
    getAllFestivals,
    getActiveFestivals,
    getFestivalById,
    getFestivalByName,
    createFestival,
    toggleFestival,
    updateFestival,
    deleteFestival
} from '../controllers/festivalController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import upload from '../middleware/upload';

const router = express.Router();

// Public routes
router.get('/active', getActiveFestivals);
router.get('/name/:name', getFestivalByName);

// Admin routes (protected)
router.get('/', authMiddleware, adminMiddleware, getAllFestivals);
router.get('/:id', authMiddleware, adminMiddleware, getFestivalById);
router.post('/', authMiddleware, adminMiddleware, createFestival);
router.patch('/:id/toggle', authMiddleware, adminMiddleware, toggleFestival);
router.put('/:id', authMiddleware, adminMiddleware, updateFestival);
router.delete('/:id', authMiddleware, adminMiddleware, deleteFestival);

// Image upload endpoint
router.post('/:id/upload', authMiddleware, adminMiddleware, upload.array('images', 10), async (req, res) => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const imageUrls = files.map(file => `/uploads/festivals/${file.filename}`);

        // Import Festival model dynamically to avoid circular dependencies
        const Festival = (await import('../models/Festival')).default;
        const festival = await Festival.findById(req.params.id);

        if (!festival) {
            return res.status(404).json({ message: 'Festival not found' });
        }

        festival.images = [...festival.images, ...imageUrls];
        await festival.save();

        res.status(200).json({
            message: 'Images uploaded successfully',
            images: festival.images
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

export default router;
