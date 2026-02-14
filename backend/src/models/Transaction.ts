import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'deposit' | 'purchase' | 'refund';
    amount: number;
    description: string;
    status: 'completed' | 'pending' | 'failed';
    createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['deposit', 'purchase', 'refund'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'failed'],
        default: 'completed',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
