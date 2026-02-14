import mongoose, { Document, Schema } from 'mongoose';

export interface IFestival extends Document {
    name: string;
    type: string;
    isActive: boolean;
    animationType: string;
    icon: string;
    description: string;
    images: string[];
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const FestivalSchema = new Schema<IFestival>({
    name: {
        type: String,
        required: true,
        trim: true,
        enum: ['Deepavali', 'Pongal', 'Christmas']
    },
    type: {
        type: String,
        default: 'festival'
    },
    isActive: {
        type: Boolean,
        default: false
    },
    animationType: {
        type: String,
        required: true,
        enum: ['sparkle', 'glow']
    },
    icon: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    images: {
        type: [String],
        default: []
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    }
}, {
    timestamps: true
});

const Festival = mongoose.model<IFestival>('Festival', FestivalSchema);

export default Festival;
