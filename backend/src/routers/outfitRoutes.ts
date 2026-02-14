import { Router } from 'express';
import { analyzeOutfit } from '../controllers/outfitController';

const router = Router();

router.post('/analyze', analyzeOutfit);

export default router;
