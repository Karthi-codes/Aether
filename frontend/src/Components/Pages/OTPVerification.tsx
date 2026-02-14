import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Alert } from '@mui/material';
import { toast } from 'react-toastify';
import { apiService } from '../../services/api.service';
import { useAuth } from '../../context/AuthContext';

const OTPVerification: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { } = useAuth();

    // Get email from navigation state
    const email = location.state?.email || '';


    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Redirect if no email
    useEffect(() => {
        if (!email) {
            navigate('/signup');
        }
    }, [email, navigate]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;

        const timer = setInterval(() => {
            setResendCooldown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take only last character
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);

        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('');
        setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);

        // Focus last filled input or first empty
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('Please enter all 6 digits');
            toast.error('Please enter all 6 digits');
            return;
        }

        setLoading(true);

        try {
            const response = await apiService.verifyOTP({ email, otp: otpString });

            toast.success('Email verified successfully! Welcome to Aether.');

            // Auto-login after verification
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('authUser', JSON.stringify(response.user));

            navigate('/');
            window.location.reload(); // Reload to update auth context
        } catch (err: any) {
            const errorMessage = err.message || 'Verification failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        try {
            await apiService.resendOTP({ email });
            toast.success('OTP sent successfully! Check your email.');
            setResendCooldown(60); // 60 seconds cooldown
            setTimeLeft(300); // Reset timer
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            toast.error(err.message || 'Failed to resend OTP');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2,
                '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
            }}
        >
            {/* Animated background effects */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '40%',
                    height: '40%',
                    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'float 20s ease-in-out infinite',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-10%',
                    width: '40%',
                    height: '40%',
                    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'float 25s ease-in-out infinite',
                    animationDelay: '5s',
                }}
            />

            <Container maxWidth="sm">
                <Box
                    sx={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 4,
                        padding: 5,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        '@keyframes fadeInUp': {
                            from: {
                                opacity: 0,
                                transform: 'translateY(30px)',
                            },
                            to: {
                                opacity: 1,
                                transform: 'translateY(0)',
                            },
                        },
                        animation: 'fadeInUp 0.6s ease-out',
                    }}
                >
                    {/* Logo */}
                    <Typography
                        variant="h3"
                        align="center"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #000000 0%, #D4AF37 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: 2,
                            mb: 1,
                        }}
                    >
                        AETHER
                    </Typography>

                    <Typography
                        variant="h5"
                        align="center"
                        sx={{ color: '#333', fontWeight: 600, mb: 1 }}
                    >
                        Verify Your Email
                    </Typography>

                    <Typography
                        variant="body2"
                        align="center"
                        sx={{ color: '#666', mb: 4 }}
                    >
                        We've sent a 6-digit code to <strong>{email}</strong>
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* OTP Input */}
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1.5,
                                justifyContent: 'center',
                                mb: 3,
                            }}
                        >
                            {otp.map((digit, index) => (
                                <TextField
                                    key={index}
                                    inputRef={(el) => (inputRefs.current[index] = el)}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e as any)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    inputProps={{
                                        maxLength: 1,
                                        style: {
                                            textAlign: 'center',
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                        },
                                    }}
                                    sx={{
                                        width: 56,
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: '#D4AF37',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#D4AF37',
                                                borderWidth: 2,
                                            },
                                        },
                                    }}
                                />
                            ))}
                        </Box>

                        {/* Timer */}
                        <Typography
                            variant="body2"
                            align="center"
                            sx={{
                                color: timeLeft < 60 ? '#d32f2f' : '#666',
                                mb: 3,
                                fontWeight: 500,
                            }}
                        >
                            {timeLeft > 0 ? `Time remaining: ${formatTime(timeLeft)}` : 'OTP expired'}
                        </Typography>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading || timeLeft <= 0}
                            sx={{
                                py: 1.5,
                                background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
                                color: '#D4AF37',
                                fontWeight: 600,
                                fontSize: '16px',
                                borderRadius: 2,
                                textTransform: 'none',
                                mb: 2,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #1a1a1a 0%, #444444 100%)',
                                },
                                '&:disabled': {
                                    background: '#ccc',
                                    color: '#666',
                                },
                            }}
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </Button>

                        {/* Resend Button */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                Didn't receive the code?
                            </Typography>
                            <Button
                                onClick={handleResend}
                                disabled={resendCooldown > 0}
                                sx={{
                                    color: resendCooldown > 0 ? '#999' : '#D4AF37',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': {
                                        background: 'rgba(212, 175, 55, 0.1)',
                                    },
                                }}
                            >
                                {resendCooldown > 0
                                    ? `Resend in ${resendCooldown}s`
                                    : 'Resend OTP'}
                            </Button>
                        </Box>
                    </form>

                    {/* Back to Login */}
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Link
                            to="/login"
                            style={{
                                color: '#666',
                                textDecoration: 'none',
                                fontSize: '14px',
                            }}
                        >
                            ← Back to Login
                        </Link>
                    </Box>
                </Box>

                {/* Gold accent line */}
                <Box
                    sx={{
                        width: '100%',
                        height: 4,
                        background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                        mt: 2,
                        borderRadius: 2,
                    }}
                />
            </Container>
        </Box>
    );
};

export default OTPVerification;
