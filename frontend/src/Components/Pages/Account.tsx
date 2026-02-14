import React, { useState, useRef } from 'react';
import { Box, Container, Typography, Button, Paper, Divider, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api.service';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

const Account: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, token, updateUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleSignup = () => {
        navigate('/signup');
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB');
            return;
        }

        setUploading(true);

        // Convert to base64
        const reader = new FileReader();

        reader.onloadend = async () => {
            try {
                const base64String = reader.result as string;
                const result = await apiService.uploadProfilePhoto(base64String, token);
                updateUser({ profilePhoto: result.profilePhoto });
                toast.success('Profile photo updated!');
            } catch (error: any) {
                console.error('Upload error:', error);
                toast.error(error.message || 'Failed to upload photo');
            } finally {
                setUploading(false);
            }
        };

        reader.onerror = () => {
            toast.error('Failed to read file');
            setUploading(false);
        };

        reader.readAsDataURL(file);
    };

    const handleDeletePhoto = async () => {
        if (!token) return;

        setUploading(true);
        try {
            await apiService.deleteProfilePhoto(token);
            updateUser({ profilePhoto: undefined });
            toast.success('Profile photo removed');
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove photo');
        }
        setUploading(false);
    };

    return (
        <Box
            sx={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                background: 'linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, sm: 6 },
                        border: '1px solid #e0e0e0',
                        borderRadius: 0,
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />

                        {/* Profile Photo with Gradient Ring */}
                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                            {/* Gradient Ring Background */}
                            <Box
                                sx={{
                                    width: 110,
                                    height: 110,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #1a1a1a 0%, #c0c0c0 35%, #ffffff 60%, #a8a8a8 85%, #2d2d2d 100%)',
                                    p: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Box
                                    onClick={isAuthenticated ? handlePhotoClick : undefined}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        bgcolor: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: isAuthenticated ? 'pointer' : 'default',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s',
                                        '&:hover': isAuthenticated ? {
                                            transform: 'scale(0.98)',
                                        } : {}
                                    }}
                                >
                                    {uploading ? (
                                        <CircularProgress size={40} sx={{ color: '#1a1a1a' }} />
                                    ) : user?.profilePhoto ? (
                                        <Box
                                            component="img"
                                            src={user.profilePhoto}
                                            alt={user.name}
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <PersonIcon sx={{ fontSize: 50, color: '#1a1a1a' }} />
                                    )}
                                </Box>
                            </Box>

                            {/* Camera overlay when authenticated */}
                            {isAuthenticated && !uploading && (
                                <Tooltip title="Change photo">
                                    <IconButton
                                        onClick={handlePhotoClick}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 4,
                                            right: 4,
                                            background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                                            color: 'white',
                                            width: 32,
                                            height: 32,
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #333 0%, #666 100%)'
                                            }
                                        }}
                                    >
                                        <CameraAltIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            )}

                            {/* Delete button if has photo */}
                            {isAuthenticated && user?.profilePhoto && !uploading && (
                                <Tooltip title="Remove photo">
                                    <IconButton
                                        onClick={handleDeletePhoto}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 4,
                                            left: 4,
                                            bgcolor: '#fff',
                                            color: '#e53935',
                                            width: 32,
                                            height: 32,
                                            border: '2px solid #e53935',
                                            '&:hover': { bgcolor: '#ffebee' }
                                        }}
                                    >
                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>

                        <Typography
                            variant="h4"
                            sx={{
                                fontFamily: '"Playfair Display", serif',
                                fontWeight: 700,
                                mb: 1,
                                color: '#000000',
                            }}
                        >
                            My Account
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666666', letterSpacing: '0.05em' }}>
                            {isAuthenticated ? 'Manage your account' : 'Sign in to your account'}
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    {isAuthenticated ? (
                        /* Logged In View */
                        <Box>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                                    Welcome Back
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {user?.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    {user?.email}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ color: '#666', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                                    Quick Actions
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => navigate('/account/orders')}
                                        sx={{
                                            borderColor: '#000000',
                                            color: '#000000',
                                            py: 1.5,
                                            fontWeight: 600,
                                            letterSpacing: '0.05em',
                                            '&:hover': {
                                                borderColor: '#000000',
                                                bgcolor: 'rgba(0,0,0,0.05)',
                                            },
                                        }}
                                    >
                                        My Orders
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => navigate('/shop')}
                                        sx={{
                                            borderColor: '#000000',
                                            color: '#000000',
                                            py: 1.5,
                                            fontWeight: 600,
                                            letterSpacing: '0.05em',
                                            '&:hover': {
                                                borderColor: '#000000',
                                                bgcolor: 'rgba(0,0,0,0.05)',
                                            },
                                        }}
                                    >
                                        Continue Shopping
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => navigate('/wishlist')}
                                        sx={{
                                            borderColor: '#000000',
                                            color: '#000000',
                                            py: 1.5,
                                            fontWeight: 600,
                                            letterSpacing: '0.05em',
                                            '&:hover': {
                                                borderColor: '#000000',
                                                bgcolor: 'rgba(0,0,0,0.05)',
                                            },
                                        }}
                                    >
                                        View Wishlist
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => navigate('/checkout/cart')}
                                        sx={{
                                            borderColor: '#000000',
                                            color: '#000000',
                                            py: 1.5,
                                            fontWeight: 600,
                                            letterSpacing: '0.05em',
                                            '&:hover': {
                                                borderColor: '#000000',
                                                bgcolor: 'rgba(0,0,0,0.05)',
                                            },
                                        }}
                                    >
                                        View Cart
                                    </Button>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Logout Button */}
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<LogoutIcon />}
                                onClick={handleLogout}
                                sx={{
                                    bgcolor: '#000000',
                                    color: '#ffffff',
                                    py: 1.5,
                                    fontWeight: 600,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    '&:hover': {
                                        bgcolor: '#333333',
                                    },
                                }}
                            >
                                Logout
                            </Button>
                        </Box>
                    ) : (
                        /* Logged Out View */
                        <Box>
                            <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: '#666' }}>
                                Sign in to access your account, view your orders, and manage your wishlist.
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<LoginIcon />}
                                    onClick={handleLogin}
                                    sx={{
                                        bgcolor: '#000000',
                                        color: '#ffffff',
                                        py: 1.5,
                                        fontWeight: 600,
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        '&:hover': {
                                            bgcolor: '#333333',
                                        },
                                    }}
                                >
                                    Sign In
                                </Button>

                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={handleSignup}
                                    sx={{
                                        borderColor: '#000000',
                                        color: '#000000',
                                        py: 1.5,
                                        fontWeight: 600,
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        '&:hover': {
                                            borderColor: '#000000',
                                            bgcolor: 'rgba(0,0,0,0.05)',
                                        },
                                    }}
                                >
                                    Create Account
                                </Button>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Button
                                variant="text"
                                fullWidth
                                onClick={() => navigate('/shop')}
                                sx={{
                                    color: '#666',
                                    py: 1,
                                    fontWeight: 500,
                                    '&:hover': {
                                        bgcolor: 'transparent',
                                        color: '#000',
                                    },
                                }}
                            >
                                Continue as Guest
                            </Button>
                        </Box>
                    )}
                </Paper>

                {/* Gold accent line */}
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

export default Account;
