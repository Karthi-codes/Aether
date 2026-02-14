 import mongoose, { Schema, Document } from 'mongoose';

export interface IBrandProduct {
    id: string;
    name: string;
    img: string;
    price: number;
    category: 'men' | 'women';
    type: string;
}

export interface IBrandSpotlight extends Document {
    name: string;
    logo: string;
    coverImage: string;
    color: string;
    products: IBrandProduct[];
}

const BrandProductSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    img: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ['men', 'women'], required: true },
    type: { type: String, required: true }
}, { _id: false });

const BrandSpotlightSchema = new Schema({
    name: { type: String, required: true, unique: true },
    logo: { type: String },
    coverImage: { type: String, required: true },
    color: { type: String, required: true },
    products: [BrandProductSchema]
}, { timestamps: true });

export default mongoose.model<IBrandSpotlight>('BrandSpotlight', BrandSpotlightSchema);
