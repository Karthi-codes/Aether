import express from 'express';
import * as walletController from '../controllers/walletController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Get wallet balance and history
router.get('/', authMiddleware, walletController.getWallet);

// Add funds (Mock payment)
router.post('/add-funds', authMiddleware, walletController.addFunds);

// Transfer funds (P2P)
router.post('/transfer', authMiddleware, walletController.transferFunds);

export default router;
