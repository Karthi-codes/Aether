import mongoose, { Document, Schema } from 'mongoose';

export interface ILoginHistory extends Document {
    userId?: mongoose.Types.ObjectId;
    email: string;
    loginTime: Date;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
}

const LoginHistorySchema = new Schema<ILoginHistory>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    email: {
        type: String,
        required: true,
    },
    loginTime: {
        type: Date,
        default: Date.now,
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    success: {
        type: Boolean,
        required: true,
        default: true,
    },
});

// Index for faster queries
LoginHistorySchema.index({ userId: 1, loginTime: -1 });
LoginHistorySchema.index({ email: 1, loginTime: -1 });

const LoginHistory = mongoose.model<ILoginHistory>('LoginHistory', LoginHistorySchema);

export default LoginHistory;
