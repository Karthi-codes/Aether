import { Request, Response } from 'express';
import BrandSpotlight from '../models/BrandSpotlight';

export const getAllBrands = async (req: Request, res: Response): Promise<void> => {
    try {
        const brands = await BrandSpotlight.find();
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching brands', error });
    }
};

export const createBrand = async (req: Request, res: Response): Promise<void> => {
    try {
        const newBrand = new BrandSpotlight(req.body);
        const savedBrand = await newBrand.save();
        res.status(201).json(savedBrand);
    } catch (error) {
        res.status(500).json({ message: 'Error creating brand', error });
    }
};

export const seedBrands = async (req: Request, res: Response): Promise<void> => {
    try {
        const brandsData = req.body.brands;
        if (!brandsData || !Array.isArray(brandsData)) {
            res.status(400).json({ message: 'Invalid brands data' });
            return;
        }

        await BrandSpotlight.deleteMany({}); // Clear existing
        const seededBrands = await BrandSpotlight.insertMany(brandsData);
        res.status(201).json({ message: 'Brands seeded successfully', count: seededBrands.length });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding brands', error });
    }
};
