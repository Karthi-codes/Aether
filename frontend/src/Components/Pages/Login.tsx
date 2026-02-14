import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Alert, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        setLoading(true);

        try {
            await login(formData);
            toast.success('Welcome back to Aether!');

            const adminEmails = ['karthikarthikeyan16401@gmail.com', 'logank7129@gmail.com'];
            if (adminEmails.includes(formData.email.toLowerCase())) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
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
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle at 30% 40%, rgba(212, 175, 55, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
                    animation: 'float 20s ease-in-out infinite',
                    pointerEvents: 'none',
                },
                '@keyframes float': {
                    '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                    '33%': { transform: 'translate(30px, -30px) rotate(120deg)' },
                    '66%': { transform: 'translate(-20px, 20px) rotate(240deg)' },
                },
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
            }}
        >
            <Container maxWidth="sm">
                <Box
                    sx={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        padding: { xs: '50px 30px', sm: '70px 60px' },
                        position: 'relative',
                        zIndex: 1,
                        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.1) inset',
                        borderRadius: '16px',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        animation: 'fadeInUp 0.8s ease-out',
                    }}
                >
                    {/* Logo/Brand */}
                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 700,
                            textAlign: 'center',
                            mb: 1,
                            background: 'linear-gradient(135deg, #000000 0%, #D4AF37 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '0.05em',
                            animation: 'fadeInUp 0.8s ease-out 0.2s backwards',
                        }}
                    >
                        AETHER
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            textAlign: 'center',
                            mb: 5,
                            color: '#666666',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            animation: 'fadeInUp 0.8s ease-out 0.3s backwards',
                        }}
                    >
                        Welcome Back
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                animation: 'fadeInUp 0.5s ease-out',
                                borderRadius: '8px',
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            sx={{
                                mb: 3,
                                animation: 'fadeInUp 0.8s ease-out 0.4s backwards',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#D4AF37',
                                        borderWidth: '2px',
                                    },
                                    '&.Mui-focused': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#D4AF37',
                                        borderWidth: '2px',
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#D4AF37',
                                    fontWeight: 600,
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{
                                                color: '#666',
                                                '&:hover': {
                                                    color: '#D4AF37',
                                                },
                                            }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 4,
                                animation: 'fadeInUp 0.8s ease-out 0.5s backwards',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#D4AF37',
                                        borderWidth: '2px',
                                    },
                                    '&.Mui-focused': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#D4AF37',
                                        borderWidth: '2px',
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#D4AF37',
                                    fontWeight: 600,
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                background: 'linear-gradient(135deg, #000000 0%, #2C2C2C 50%, #000000 100%)',
                                color: '#D4AF37',
                                padding: '16px',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                mb: 3,
                                borderRadius: '8px',
                                position: 'relative',
                                overflow: 'hidden',
                                animation: 'fadeInUp 0.8s ease-out 0.6s backwards',
                                transition: 'all 0.3s ease',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)',
                                    transition: 'left 0.5s ease',
                                },
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
                                    '&::before': {
                                        left: '100%',
                                    },
                                },
                                '&:active': {
                                    transform: 'translateY(-1px)',
                                },
                                '&:disabled': {
                                    background: '#cccccc',
                                    color: '#666666',
                                },
                            }}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>

                        {/* Divider */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 3,
                                animation: 'fadeInUp 0.8s ease-out 0.65s backwards',
                            }}
                        >
                            <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #333)' }} />
                            <Typography sx={{ px: 2, color: '#666', fontSize: '0.85rem' }}>or</Typography>
                            <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #333)' }} />
                        </Box>

                        {/* Google Login Button */}
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => {
                                window.location.href = 'http://localhost:8080/api/oauth/google';
                            }}
                            sx={{
                                borderColor: '#333',
                                color: '#333',
                                padding: '14px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                mb: 3,
                                borderRadius: '8px',
                                animation: 'fadeInUp 0.8s ease-out 0.7s backwards',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                '&:hover': {
                                    borderColor: '#D4AF37',
                                    backgroundColor: 'rgba(212, 175, 55, 0.05)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Continue with Google
                        </Button>

                        <Box
                            sx={{
                                textAlign: 'center',
                                mb: 2,
                                animation: 'fadeInUp 0.8s ease-out 0.75s backwards',
                            }}
                        >
                            <Link
                                to="/forgot-password"
                                style={{
                                    color: '#666666',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    transition: 'color 0.3s ease',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#D4AF37'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
                            >
                                Forgot Password?
                            </Link>
                        </Box>

                        <Box
                            sx={{
                                textAlign: 'center',
                                animation: 'fadeInUp 0.8s ease-out 0.8s backwards',
                            }}
                        >
                            <Typography variant="body2" sx={{ color: '#666666' }}>
                                Don't have an account?{' '}
                                <Link
                                    to="/signup"
                                    style={{
                                        color: '#000000',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        borderBottom: '2px solid #D4AF37',
                                        paddingBottom: '2px',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#D4AF37';
                                        e.currentTarget.style.borderBottomWidth = '3px';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = '#000000';
                                        e.currentTarget.style.borderBottomWidth = '2px';
                                    }}
                                >
                                    Create Account
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </Box>

                {/* Gold accent line */}
                <Box
                    sx={{
                        height: '4px',
                        background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
                        mt: 0,
                        borderRadius: '2px',
                        animation: 'fadeInUp 0.8s ease-out 0.9s backwards',
                    }}
                />
            </Container>
        </Box>
    );
};

export default Login;
