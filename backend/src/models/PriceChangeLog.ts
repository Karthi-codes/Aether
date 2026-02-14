import mongoose, { Document, Schema } from 'mongoose';

export interface IPriceChangeLog extends Document {
    productId: string;
    productName: string;
    oldPrice: number;
    newPrice: number;
    changedBy: string; // 'Admin' or specific admin user ID/Name
    changedAt: Date;
}

const PriceChangeLogSchema = new Schema<IPriceChangeLog>({
    productId: {
        type: String,
        required: true,
        index: true
    },
    productName: {
        type: String,
        required: true
    },
    oldPrice: {
        type: Number,
        required: true
    },
    newPrice: {
        type: Number,
        required: true
    },
    changedBy: {
        type: String,
        default: 'Admin'
    },
    changedAt: {
        type: Date,
        default: Date.now,
        index: true // Useful for sorting by date
    }
});

const PriceChangeLog = mongoose.model<IPriceChangeLog>('PriceChangeLog', PriceChangeLogSchema);

export default PriceChangeLog;
