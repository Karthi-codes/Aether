import mongoose, { Document, Schema } from 'mongoose';

export interface IScratchCard extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    orderId?: mongoose.Schema.Types.ObjectId; // Reference to the order
    orderAmount: number;
    discountPercentage?: number;
    discountAmount?: number;
    isScratched: boolean;
    isRedeemed: boolean;
    expiresAt: Date;
    earnedAt: Date;
}

const ScratchCardSchema: Schema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    orderAmount: {
        type: Number,
        required: true,
    },
    discountPercentage: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    isScratched: {
        type: Boolean,
        default: false,
    },
    isRedeemed: {
        type: Boolean,
        default: false,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    earnedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export default mongoose.model<IScratchCard>('ScratchCard', ScratchCardSchema);
