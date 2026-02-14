import { Request, Response } from 'express';
import Product from '../models/Product';
import Season from '../models/Season';
import Festival from '../models/Festival';
import { AuthRequest } from '../middleware/authMiddleware';
import { handlePriceUpdate } from './autoPurchase.controller';

// Get all products (Public)
// Get all products (Public)
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, featured, search } = req.query;
        let query: any = {};

        if (category) {
            query.category = category;
        }

        if (featured === 'true') {
            query.isFeatured = true;
        }

        if (search) {
            // Escape special characters to prevent regex errors
            const safeSearch = (search as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.name = { $regex: safeSearch, $options: 'i' };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });

        // Check if products exist, return empty array instead of error if not found (though existing logic was fine)
        // But mainly we want to catch potential connection errors or query errors

        res.status(200).json(products);
    } catch (error: any) {
        console.error('Error in getAllProducts:', error); // Log the error on the server
        res.status(500).json({
            message: 'Error fetching products',
            error: error.message || 'Internal Server Error'
        });
    }
};

// Get single product (Public)
export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(200).json(product);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

// Get products by season (Public - only if season is active)
export const getProductsBySeason = async (req: Request, res: Response): Promise<void> => {
    try {
        const { seasonName } = req.params;

        // Find the season and check if it's active
        const season = await Season.findOne({
            name: { $regex: new RegExp(`^${seasonName}$`, 'i') }
        });

        if (!season) {
            res.status(404).json({ message: 'Season not found' });
            return;
        }

        if (!season.isActive) {
            res.status(403).json({ message: 'This season is currently not active' });
            return;
        }

        // Get products for this season
        const products = await Product.find({ seasonId: season._id }).sort({ createdAt: -1 });
        res.status(200).json({
            season: {
                name: season.name,
                animationType: season.animationType,
                icon: season.icon
            },
            products
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching seasonal products', error: error.message });
    }
};

// Get products by festival (Public - only if festival is active)
export const getProductsByFestival = async (req: Request, res: Response): Promise<void> => {
    try {
        const { festivalName } = req.params;

        // Find the festival and check if it's active
        const festival = await Festival.findOne({
            name: { $regex: new RegExp(`^${festivalName}$`, 'i') }
        });

        if (!festival) {
            res.status(404).json({ message: 'Festival not found' });
            return;
        }

        if (!festival.isActive) {
            res.status(403).json({ message: 'This festival is currently not active' });
            return;
        }

        // Get products for this festival
        const products = await Product.find({ festivalId: festival._id }).sort({ createdAt: -1 });
        res.status(200).json({
            festival: {
                name: festival.name,
                animationType: festival.animationType,
                icon: festival.icon
            },
            products
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching festival products', error: error.message });
    }
};

// Create product (Admin)
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};

// Update product (Admin)
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const productId = req.params.id;
        const updates = req.body;

        // Find existing product to check for price change
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        const oldPrice = existingProduct.price;

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updates,
            { new: true, runValidators: true }
        );

        if (updates.price !== undefined && updates.price !== oldPrice) {
            // Trigger price update logic (Logs + AutoPurchase)
            // run async
            handlePriceUpdate(
                String(productId),
                existingProduct.name,
                oldPrice,
                Number(updates.price),
                String(req.userId || 'admin')
            );
        }

        res.status(200).json(updatedProduct);
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

// Delete product (Admin)
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

