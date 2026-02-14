import express from 'express';
import {
    getAutoPurchases,
    addAutoPurchase,
    removeAutoPurchase,
    updateTargetPrice,
    getAutoPurchaseHistory,
    getPriceChangeLogs
} from '../controllers/autoPurchase.controller';
import { authMiddleware as auth } from '../middleware/authMiddleware';

const router = express.Router();

// Auto Purchase Routes
router.get('/', auth, getAutoPurchases);
router.post('/', auth, addAutoPurchase);
router.put('/:id', auth, updateTargetPrice);
router.delete('/:id', auth, removeAutoPurchase);

// History
router.get('/history', auth, getAutoPurchaseHistory);

// Price Logs (Public or Auth? safely Auth)
router.get('/price-logs', getPriceChangeLogs);

export default router;
