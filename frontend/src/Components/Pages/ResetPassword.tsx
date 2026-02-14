import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Alert } from '@mui/material';

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [checkingToken, setCheckingToken] = useState(true);

    useEffect(() => {
        if (!token) {
            setError('No reset token provided');
            setCheckingToken(false);
            return;
        }

        // Verify token is valid
        fetch(`http://localhost:8080/api/password/verify-reset-token/${token}`)
            .then(res => res.json())
            .then(data => {
                setTokenValid(data.valid);
                if (!data.valid) {
                    setError(data.message || 'Invalid or expired token');
                }
            })
            .catch(() => {
                setError('Failed to verify token');
            })
            .finally(() => {
                setCheckingToken(false);
            });
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/password/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err: any) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (checkingToken) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>Verifying reset token...</Typography>
            </Box>
        );
    }

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
                        Create New Password
                    </Typography>

                    {message && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {message}
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {tokenValid && !message ? (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="New Password"
                                name="newPassword"
                                type="password"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                sx={{
                                    mb: 3,
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

                            <TextField
                                fullWidth
                                label="Confirm New Password"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
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
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>
                    ) : !message ? (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                                Unable to reset password. The reset link may be invalid or expired.
                            </Typography>
                            <Link
                                to="/forgot-password"
                                style={{
                                    color: '#000000',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    borderBottom: '1px solid #000000',
                                }}
                            >
                                Request New Reset Link
                            </Link>
                        </Box>
                    ) : null}
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

export default ResetPassword;
