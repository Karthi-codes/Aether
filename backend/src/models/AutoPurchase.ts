import mongoose, { Document, Schema } from 'mongoose';

export interface IAutoPurchase extends Document {
    userId: mongoose.Types.ObjectId;
    productId: string;
    productName: string;
    productImage: string;
    targetPrice: number;
    currentPrice: number;
    maxPrice: number;
    originalPrice: number;
    lowestPriceSeen: number;
    status: 'active' | 'purchased' | 'cancelled' | 'insufficient_funds';
    deliveryAddress: string;
    createdAt: Date;
    purchasedAt?: Date;
}

const AutoPurchaseSchema = new Schema<IAutoPurchase>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    productId: {
        type: String,
        required: true,
        index: true
    },
    productName: {
        type: String,
        required: true
    },
    productImage: {
        type: String,
        required: true
    },
    targetPrice: {
        type: Number,
        required: true
    },
    currentPrice: {
        type: Number,
        required: true
    },
    maxPrice: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    lowestPriceSeen: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'purchased', 'cancelled', 'insufficient_funds'],
        default: 'active',
        index: true
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    purchasedAt: {
        type: Date
    }
});

// Compound index for efficient querying of active monitors per user
AutoPurchaseSchema.index({ userId: 1, status: 1 });

const AutoPurchase = mongoose.model<IAutoPurchase>('AutoPurchase', AutoPurchaseSchema);

export default AutoPurchase;
