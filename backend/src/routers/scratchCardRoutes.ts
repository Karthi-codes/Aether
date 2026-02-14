import express from 'express';
import { getScratchCards, redeemScratchCard, scratchCard } from '../controllers/scratchCardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// protect authentication middleware
router.use(authMiddleware);

router.get('/', getScratchCards);
router.post('/:id/redeem', redeemScratchCard);
router.put('/:id/scratch', scratchCard); // Reveal/scratch card

export default router;
