import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    images: string[];
    category: string;
    stock: number;
    sizes: string[];
    colors: string[];
    isFeatured: boolean;
    isRefurbished?: boolean;
    condition?: 'new' | 'refurbished' | 'open-box';
    originalPrice?: number;
    seasonId?: mongoose.Types.ObjectId;
    festivalId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images: [{ type: String, required: true }],
    category: { type: String, required: true, index: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isRefurbished: { type: Boolean, default: false },
    condition: { type: String, enum: ['new', 'refurbished', 'open-box'], default: 'new' },
    originalPrice: { type: Number },
    seasonId: { type: Schema.Types.ObjectId, ref: 'Season' },
    festivalId: { type: Schema.Types.ObjectId, ref: 'Festival' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for backward compatibility / frontend ease
ProductSchema.virtual('image').get(function () {
    return this.images && this.images.length > 0 ? this.images[0] : '';
});

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
