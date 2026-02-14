import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // Optional for OAuth users
    role: 'user' | 'admin';
    walletBalance: number;
    frozenBalance: number;
    profilePhoto?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    isVerified: boolean;
    verificationAttempts: number;
    provider: 'local' | 'google';
    providerId?: string;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: false, // Optional for OAuth users
    },
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    },
    providerId: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    walletBalance: {
        type: Number,
        default: 0,
    },
    profilePhoto: {
        type: String,
        default: null,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationAttempts: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving (only for local auth users)
UserSchema.pre('save', async function () {
    // Skip if password not modified or not set (OAuth users)
    if (!this.isModified('password') || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false; // OAuth users have no password
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
