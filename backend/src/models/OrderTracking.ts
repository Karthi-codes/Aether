import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderTracking extends Document {
    userId: mongoose.Types.ObjectId;
    orderId: string;
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    deliveryAddress: any;
    currentStage: string;
    stages: Array<{
        name: string;
        status: 'pending' | 'in_progress' | 'completed';
        timestamp?: Date;
        notes?: string;
    }>;
    currentLocation?: {
        latitude: number;
        longitude: number;
        timestamp: Date;
    };
    coordinates: Array<{
        latitude: number;
        longitude: number;
        timestamp: Date;
    }>;
    courierInfo?: {
        name: string;
        contact: string;
        vehicle: string;
        vehicleNumber: string;
    };
    estimatedDelivery: Date;
    actualDelivery?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const OrderTrackingSchema = new Schema<IOrderTracking>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true, unique: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String },
    price: { type: Number, required: true },
    deliveryAddress: { type: Schema.Types.Mixed },
    currentStage: { type: String, default: 'order_placed' },
    stages: [{
        name: { type: String, required: true },
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        timestamp: { type: Date },
        notes: { type: String }
    }],
    currentLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
        timestamp: { type: Date }
    },
    coordinates: [{
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    courierInfo: {
        name: { type: String },
        contact: { type: String },
        vehicle: { type: String },
        vehicleNumber: { type: String }
    },
    estimatedDelivery: { type: Date, required: true },
    actualDelivery: { type: Date }
}, {
    timestamps: true
});

// Initialize default stages
OrderTrackingSchema.pre('save', function () {
    if (this.isNew && (!this.stages || this.stages.length === 0)) {
        this.stages = [
            { name: 'order_placed', status: 'completed' as const, timestamp: new Date() },
            { name: 'processing', status: 'pending' as const },
            { name: 'shipped', status: 'pending' as const },
            { name: 'out_for_delivery', status: 'pending' as const },
            { name: 'delivered', status: 'pending' as const }
        ];
    }
});

export default mongoose.model<IOrderTracking>('OrderTracking', OrderTrackingSchema);
