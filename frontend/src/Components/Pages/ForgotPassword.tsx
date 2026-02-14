import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Alert } from '@mui/material';

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/password/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                // In development, we get the token back. In production, it would be sent via email
                if (data.resetToken) {
                    setResetToken(data.resetToken);
                }
            } else {
                setError(data.message || 'Failed to process request');
            }
        } catch (err: any) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
                    pointerEvents: 'none',
                },
            }}
        >
            <Container maxWidth="sm">
                <Box
                    sx={{
                        backgroundColor: '#ffffff',
                        padding: { xs: '40px 24px', sm: '60px 48px' },
                        position: 'relative',
                        zIndex: 1,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 700,
                            textAlign: 'center',
                            mb: 1,
                            color: '#000000',
                            letterSpacing: '0.05em',
                        }}
                    >
                        AETHER
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            textAlign: 'center',
                            mb: 4,
                            color: '#666666',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                        }}
                    >
                        Reset Your Password
                    </Typography>

                    {message && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {message}
                            {resetToken && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                        Your Reset Token (for testing):
                                    </Typography>
                                    <Typography variant="caption" sx={{ wordBreak: 'break-all', display: 'block', mb: 1 }}>
                                        {resetToken}
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => navigate(`/reset-password?token=${resetToken}`)}
                                        sx={{ mt: 1 }}
                                    >
                                        Reset Password Now
                                    </Button>
                                </Box>
                            )}
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {!message && (
                        <form onSubmit={handleSubmit}>
                            <Typography variant="body2" sx={{ mb: 3, color: '#666666', textAlign: 'center' }}>
                                Enter your email address and we'll send you instructions to reset your password.
                            </Typography>

                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                sx={{
                                    mb: 4,
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#000000',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#000000',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#000000',
                                    },
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    backgroundColor: '#000000',
                                    color: '#ffffff',
                                    padding: '14px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    mb: 3,
                                    '&:hover': {
                                        backgroundColor: '#333333',
                                    },
                                    '&:disabled': {
                                        backgroundColor: '#cccccc',
                                    },
                                }}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#666666' }}>
                                    Remember your password?{' '}
                                    <Link
                                        to="/login"
                                        style={{
                                            color: '#000000',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            borderBottom: '1px solid #000000',
                                        }}
                                    >
                                        Sign In
                                    </Link>
                                </Typography>
                            </Box>
                        </form>
                    )}
                </Box>

                <Box
                    sx={{
                        height: '4px',
                        background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
                        mt: 0,
                    }}
                />
            </Container>
        </Box>
    );
};

export default ForgotPassword;
