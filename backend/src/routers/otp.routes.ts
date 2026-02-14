import express from 'express';
import * as otpController from '../controllers/otpController';

const router = express.Router();

// Send OTP
router.post('/send-otp', otpController.sendOTP);

// Verify OTP
router.post('/verify-otp', otpController.verifyOTP);

// Resend OTP
router.post('/resend-otp', otpController.resendOTP);

export default router;
