import React, { useState, useEffect } from 'react';
import { Box, Typography, Rating, Avatar, TextField, Button, Dialog, DialogTitle, DialogContent, Card, CardContent } from '@mui/material';
import { useAuth } from '../../../../context/AuthContext';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { toast } from 'react-toastify';

interface Review {
    _id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

const SiteReviews: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/site-reviews');
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleSubmitReview = async () => {
        if (!isAuthenticated) return;

        try {
            const response = await fetch('http://localhost:8080/api/site-reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    rating: newRating,
                    comment: newComment
                })
            });

            if (response.ok) {
                toast.success('Thanks for your review!');
                setOpenDialog(false);
                setNewComment('');
                fetchReviews();
            } else {
                toast.error('Failed to submit review');
            }
        } catch (error) {
            toast.error('Error submitting review');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight={700}>Community Voices</Typography>
                <Button
                    variant="contained"
                    onClick={() => {
                        if (isAuthenticated) setOpenDialog(true);
                        else toast.info('Please log in to write a review');
                    }}
                    startIcon={<RateReviewIcon />}
                    sx={{ bgcolor: '#D4AF37', '&:hover': { bgcolor: '#c5a028' } }}
                >
                    Write a Review
                </Button>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {reviews.map((review) => (
                    <Box key={review._id} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.33% - 16px)' } }}>
                        <Card sx={{ height: '100%', position: 'relative', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <CardContent>
                                <FormatQuoteIcon sx={{ position: 'absolute', top: 20, right: 20, fontSize: 40, color: 'text.disabled', opacity: 0.2 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar src={review.userAvatar} alt={review.userName}>
                                        {review.userName.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {review.userName}
                                        </Typography>
                                        <Rating value={review.rating} readOnly size="small" />
                                    </Box>
                                </Box>
                                <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    "{review.comment}"
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>

            {/* Write Review Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Share Your Experience</DialogTitle>
                <DialogContent>
                    <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography>Rating:</Typography>
                            <Rating
                                value={newRating}
                                onChange={(_, val) => setNewRating(val || 5)}
                                size="large"
                            />
                        </Box>
                        <TextField
                            multiline
                            rows={4}
                            label="Your Review"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            fullWidth
                            variant="outlined"
                        />
                        <Button
                            variant="contained"
                            onClick={handleSubmitReview}
                            fullWidth
                            sx={{ mt: 1, bgcolor: '#D4AF37', '&:hover': { bgcolor: '#c5a028' } }}
                        >
                            Submit Review
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default SiteReviews;
