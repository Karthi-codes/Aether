import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    selectedSize: string;
    selectedColor: string;
    quantity: number;
}

export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    orderNumber: string;
    items: IOrderItem[];
    totalAmount: number;
    shippingAddress?: {
        fullName: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    paymentMethod?: string;
    orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    orderSource?: 'cart' | 'autopurchase' | 'buy_now';
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    selectedSize: { type: String, required: true },
    selectedColor: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true,
    },
    items: [OrderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        fullName: String,
        address: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
    },
    paymentMethod: String,
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    orderSource: {
        type: String,
        enum: ['cart', 'autopurchase', 'buy_now'],
        default: 'cart',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update timestamp on save
OrderSchema.pre('save', function () {
    this.updatedAt = new Date();
});

// Index for faster queries
OrderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
