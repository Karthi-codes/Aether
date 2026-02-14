import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
    productId: string;
    name: string;
    image: string;
    price: number;
    selectedSize: string;
    selectedColor: string;
    quantity: number;
}

export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

const CartSchema = new Schema<ICart>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [{
        productId: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        selectedSize: { type: String, required: true },
        selectedColor: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 }
    }]
}, {
    timestamps: true
});

const Cart = mongoose.model<ICart>('Cart', CartSchema);
export default Cart;
