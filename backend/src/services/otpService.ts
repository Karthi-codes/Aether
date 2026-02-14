import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import OTP from '../models/OTP';
import User from '../models/User';
import { emailService } from './emailService';

class OTPService {
    // Generate a random 6-digit OTP
    generateOTP(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    // Hash OTP before storing
    async hashOTP(otp: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(otp, salt);
    }

    // Verify OTP
    async verifyOTP(plainOTP: string, hashedOTP: string): Promise<boolean> {
        return bcrypt.compare(plainOTP, hashedOTP);
    }

    // Create and send OTP
    async createAndSendOTP(userId: string, email: string, name: string): Promise<void> {
        try {
            // Delete any existing OTPs for this user
            await OTP.deleteMany({ userId });

            // Generate new OTP
            const otp = this.generateOTP();
            const hashedOTP = await this.hashOTP(otp);

            // Set expiry to 5 minutes from now
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            // Save OTP to database
            await OTP.create({
                userId,
                otp: hashedOTP,
                expiresAt,
            });

            // Send OTP email
            await emailService.sendOTPEmail(email, otp, name);

            console.log(`OTP sent to ${email}`);
        } catch (error) {
            console.error('Create and send OTP error:', error);
            throw new Error('Failed to send OTP');
        }
    }

    // Validate OTP
    async validateOTP(email: string, otpInput: string): Promise<{ success: boolean; message: string; userId?: string }> {
        try {
            // Find user by email
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // Check verification attempts
            if (user.verificationAttempts >= 5) {
                return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
            }

            // Find OTP for this user
            const otpRecord = await OTP.findOne({ userId: user._id }).sort({ createdAt: -1 });

            if (!otpRecord) {
                return { success: false, message: 'No OTP found. Please request a new one.' };
            }

            // Check if OTP is expired
            if (new Date() > otpRecord.expiresAt) {
                await OTP.deleteOne({ _id: otpRecord._id });
                return { success: false, message: 'OTP has expired. Please request a new one.' };
            }

            // Verify OTP
            const isValid = await this.verifyOTP(otpInput, otpRecord.otp);

            if (!isValid) {
                // Increment verification attempts
                user.verificationAttempts += 1;
                await user.save();

                return {
                    success: false,
                    message: `Invalid OTP. ${5 - user.verificationAttempts} attempts remaining.`
                };
            }

            // OTP is valid - mark user as verified
            user.isVerified = true;
            user.verificationAttempts = 0;
            await user.save();

            // Delete the used OTP
            await OTP.deleteOne({ _id: otpRecord._id });

            // Send welcome email
            await emailService.sendWelcomeEmail(user.email, user.name);

            return {
                success: true,
                message: 'Email verified successfully',
                userId: user._id.toString()
            };
        } catch (error) {
            console.error('Validate OTP error:', error);
            throw new Error('Failed to validate OTP');
        }
    }

    // Resend OTP
    async resendOTP(email: string): Promise<{ success: boolean; message: string }> {
        try {
            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return { success: false, message: 'User not found' };
            }

            if (user.isVerified) {
                return { success: false, message: 'Email is already verified' };
            }

            // Reset verification attempts on resend
            user.verificationAttempts = 0;
            await user.save();

            // Create and send new OTP
            await this.createAndSendOTP(user._id.toString(), user.email, user.name);

            return { success: true, message: 'OTP sent successfully' };
        } catch (error) {
            console.error('Resend OTP error:', error);
            throw new Error('Failed to resend OTP');
        }
    }
}

export const otpService = new OTPService();
export default otpService;
