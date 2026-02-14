import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
    userId: mongoose.Types.ObjectId;
    products: string[]; // Array of Product IDs
    createdAt: Date;
    updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    products: [{
        type: String, // Store product IDs
        ref: 'Product' // Optional: if you want to populate later, but we store IDs for simplicity
    }]
}, {
    timestamps: true
});

const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);
export default Wishlist;
