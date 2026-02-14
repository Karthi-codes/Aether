import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const OAuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAuthData } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const hasProcessed = useRef(false); // Prevent duplicate processing

    useEffect(() => {
        // Prevent duplicate execution from StrictMode or re-renders
        if (hasProcessed.current) return;

        const handleOAuthCallback = async () => {
            hasProcessed.current = true;

            const token = searchParams.get('token');
            const userParam = searchParams.get('user');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                let errorMessage = 'OAuth authentication failed';
                switch (errorParam) {
                    case 'oauth_failed':
                        errorMessage = 'Google authentication failed. Please try again.';
                        break;
                    case 'no_user':
                        errorMessage = 'Could not retrieve user information.';
                        break;
                    case 'server_error':
                        errorMessage = 'Server error during authentication.';
                        break;
                }
                setError(errorMessage);
                toast.error(errorMessage);
                setTimeout(() => navigate('/login'), 3000);
                return;
            }

            if (token && userParam) {
                try {
                    const user = JSON.parse(decodeURIComponent(userParam));

                    // Store auth data
                    localStorage.setItem('aether_token', token);
                    localStorage.setItem('aether_user', JSON.stringify(user));

                    // Update auth context
                    setAuthData(token, user);

                    toast.success(`Welcome, ${user.name}!`);

                    const adminEmails = ['karthikarthikeyan16401@gmail.com', 'logank7129@gmail.com'];
                    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                } catch (err) {
                    console.error('Error parsing OAuth callback:', err);
                    setError('Failed to process authentication data');
                    toast.error('Failed to process authentication data');
                    setTimeout(() => navigate('/login'), 3000);
                }
            } else {
                setError('Missing authentication data');
                toast.error('Missing authentication data');
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        handleOAuthCallback();
    }, [searchParams, navigate, setAuthData]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            }}
        >
            {error ? (
                <>
                    <Typography variant="h5" sx={{ color: '#ff4444', mb: 2 }}>
                        {error}
                    </Typography>
                    <Typography sx={{ color: '#999' }}>
                        Redirecting to login...
                    </Typography>
                </>
            ) : (
                <>
                    <CircularProgress
                        size={60}
                        sx={{
                            color: '#D4AF37',
                            mb: 3,
                        }}
                    />
                    <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
                        Completing Sign In
                    </Typography>
                    <Typography sx={{ color: '#999' }}>
                        Please wait while we verify your account...
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default OAuthCallback;
