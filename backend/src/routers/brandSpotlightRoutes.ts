import express from 'express';
import { getAllBrands, createBrand, seedBrands } from '../controllers/brandSpotlightController';

const router = express.Router();

router.get('/', getAllBrands);
router.post('/', createBrand);
router.post('/seed', seedBrands);

export default router;
