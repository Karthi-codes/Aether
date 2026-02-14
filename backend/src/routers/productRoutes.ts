import express from 'express';
import * as productController from '../controllers/productController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public Routes
router.get('/', productController.getAllProducts);
router.get('/season/:seasonName', productController.getProductsBySeason);
router.get('/festival/:festivalName', productController.getProductsByFestival);
router.get('/:id', productController.getProductById);

// Admin Routes (Protected)
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

export default router;
