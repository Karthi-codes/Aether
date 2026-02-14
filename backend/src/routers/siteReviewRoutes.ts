import express from 'express';
import { getSiteReviews, createSiteReview } from '../controllers/siteReviewController';
import { authMiddleware as protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getSiteReviews);
router.post('/', protect, createSiteReview);

export default router;
