import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
    userId: mongoose.Types.ObjectId;
    otp: string;
    expiresAt: Date;
    createdAt: Date;
}

const OTPSchema = new Schema<IOTP>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // TTL index - MongoDB will auto-delete expired documents
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster lookups
OTPSchema.index({ userId: 1, expiresAt: 1 });

const OTP = mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP;
