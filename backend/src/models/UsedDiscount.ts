import mongoose, { Document, Schema } from 'mongoose';

export interface IUsedDiscount extends Document {
    userId: mongoose.Types.ObjectId;
    discountValue: number;
    source: 'scratch_card' | 'promo_code' | 'combo';
    usedAt: Date;
}

const UsedDiscountSchema = new Schema<IUsedDiscount>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    discountValue: {
        type: Number,
        required: true,
    },
    source: {
        type: String,
        enum: ['scratch_card', 'promo_code', 'combo'],
        required: true,
    },
    usedAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for finding used discounts by user
UsedDiscountSchema.index({ userId: 1, discountValue: 1 });

const UsedDiscount = mongoose.model<IUsedDiscount>('UsedDiscount', UsedDiscountSchema);

export default UsedDiscount;
