import mongoose, { Document, Schema } from 'mongoose';

export interface ISeason extends Document {
    name: string;
    type: string;
    isActive: boolean;
    animationType: string;
    icon: string;
    description: string;
    images: string[]; // Array of product images for this season
    createdAt: Date;
    updatedAt: Date;
}

const SeasonSchema = new Schema<ISeason>({
    name: {
        type: String,
        required: true,
        trim: true,
        enum: ['Winter', 'Summer', 'Rainy', 'Spring', 'Autumn']
    },
    type: {
        type: String,
        default: 'season'
    },
    isActive: {
        type: Boolean,
        default: false
    },
    animationType: {
        type: String,
        required: true,
        enum: ['snow', 'breeze', 'rain', 'fall', 'groom']
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
    }
}, {
    timestamps: true
});

const Season = mongoose.model<ISeason>('Season', SeasonSchema);

export default Season;
