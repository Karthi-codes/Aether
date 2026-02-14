import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteReview extends Document {
    userId: mongoose.Types.ObjectId;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    isApproved: boolean;
    createdAt: Date;
}

const SiteReviewSchema = new Schema<ISiteReview>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: true }, // Auto-approve for now, or false if moderation needed
    createdAt: { type: Date, default: Date.now }
});

const SiteReview = mongoose.model<ISiteReview>('SiteReview', SiteReviewSchema);

export default SiteReview;
