import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Button,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Switch,
    FormControlLabel,
    Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api.service';
import { toast } from 'react-toastify';

interface Season {
    _id: string;
    name: string;
    animationType: string;
    icon: string;
    isActive: boolean;
}

interface Festival {
    _id: string;
    name: string;
    type: string;
    animationType: string;
    icon: string;
    description: string;
    images: string[];
    startDate?: string;
    endDate?: string;
    isActive: boolean;
}



const SeasonFestivalManager: React.FC = () => {

    const { token } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [festivals, setFestivals] = useState<Festival[]>([]);

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'festival',
        animationType: '',
        icon: '',
        description: '',
        images: '',
        startDate: '',
        endDate: '',
    });

    const colors = {
        cardBg: 'white',
        text: '#1a1a1a',
        textSecondary: '#666',
        accent: '#D4AF37',
        border: '#e0e0e0',
    };

    const seasonAnimations = [
        { value: 'snow', label: 'Snow ❄' },
        { value: 'breeze', label: 'Breeze 🍃' },
        { value: 'rain', label: 'Rain 💧' },
        { value: 'fall', label: 'Fall Leaves 🍂' },
        { value: 'groom', label: 'Bloom 🌸' },
    ];

    const festivalAnimations = [
        { value: 'sparkle', label: 'Sparkle ✨' },
        { value: 'glow', label: 'Glow 🔆' },
    ];

    const iconOptions = [
        { value: '❄️', label: 'Snowflake ❄️' },
        { value: '☀️', label: 'Sun ☀️' },
        { value: '🌧️', label: 'Rain 🌧️' },
        { value: '🍂', label: 'Fall Leaf 🍂' },
        { value: '🌸', label: 'Flower 🌸' },
        { value: '✨', label: 'Sparkles ✨' },
        { value: '🪔', label: 'Diya 🪔' },
        { value: '🎄', label: 'Tree 🎄' },
        { value: '🪁', label: 'Kite 🪁' },
    ];

    const seasonNames = ['Winter', 'Summer', 'Rainy', 'Spring', 'Autumn'];
    const festivalNames = ['Deepavali', 'Pongal', 'Christmas'];

    useEffect(() => {
        if (token) fetchData();
    }, [token, tabValue]);



    const fetchData = async () => {
        try {
            if (tabValue === 0) {
                const data = await apiService.getSeasons(token!);
                setSeasons(data);
            } else {
                const data = await apiService.getFestivals(token!);
                setFestivals(data);
            }
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const handleOpenDialog = (item?: Season | Festival) => {
        if (item) {
            setIsEditing(true);
            setCurrentId(item._id);
            if (tabValue === 0) {
                const s = item as Season;
                setFormData({
                    name: s.name,
                    type: 'season',
                    animationType: s.animationType,
                    icon: s.icon,
                    description: (s as any).description || '',
                    images: (s as any).images ? (s as any).images.join(', ') : '',
                    startDate: '',
                    endDate: '',
                });
            } else {
                const f = item as Festival;
                setFormData({
                    name: f.name,
                    type: f.type || 'festival',
                    animationType: f.animationType,
                    icon: f.icon,
                    description: f.description || '',
                    images: f.images ? f.images.join(', ') : '',
                    startDate: f.startDate ? f.startDate.split('T')[0] : '',
                    endDate: f.endDate ? f.endDate.split('T')[0] : '',
                });
            }
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData({
                name: '',
                type: tabValue === 0 ? 'season' : 'festival',
                animationType: '',
                icon: '',
                description: '',
                images: '',
                startDate: '',
                endDate: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => setOpenDialog(false);

    const handleSubmit = async () => {
        try {
            const dataToSubmit: any = { ...formData };
            // Process images for both seasons and festivals
            dataToSubmit.images = formData.images.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');

            if (isEditing && currentId) {
                if (tabValue === 0) {
                    await apiService.updateSeason(currentId, dataToSubmit, token!);
                } else {
                    await apiService.updateFestival(currentId, dataToSubmit, token!);
                }
                toast.success('Updated successfully');
            } else {
                if (tabValue === 0) {
                    await apiService.createSeason(dataToSubmit, token!);
                } else {
                    await apiService.createFestival(dataToSubmit, token!);
                }
                toast.success('Created successfully');
            }
            handleCloseDialog();
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            if (tabValue === 0) {
                await apiService.toggleSeason(id, token!);
            } else {
                await apiService.toggleFestival(id, token!);
            }
            toast.success(`Item ${currentStatus ? 'deactivated' : 'activated'}`);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Toggle failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            if (tabValue === 0) {
                await apiService.deleteSeason(id, token!);
            } else {
                await apiService.deleteFestival(id, token!);
            }
            toast.success('Deleted successfully');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Delete failed');
        }
    };

    const renderItemCard = (item: Season | Festival) => (
        <Box
            key={item._id}
            sx={{
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.33% - 16px)' },
                minWidth: 0,
            }}
        >
            <Card sx={{
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                position: 'relative',
                overflow: 'hidden',
            }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: '1.8rem' }}>{item.icon}</Typography>
                            <Box>
                                <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>{item.name}</Typography>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    Animation: {item.animationType}
                                </Typography>
                            </Box>
                        </Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={item.isActive}
                                    onChange={() => handleToggleActive(item._id, item.isActive)}
                                    color="success"
                                />
                            }
                            label={item.isActive ? 'Active' : 'Inactive'}
                            sx={{
                                '& .MuiFormControlLabel-label': {
                                    fontSize: '0.75rem',
                                    color: item.isActive ? '#4CAF50' : colors.textSecondary,
                                    fontWeight: 600,
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            {(item as any).description}
                        </Typography>
                        {tabValue === 1 && (
                            <Typography variant="caption" display="block" sx={{ color: colors.textSecondary, mt: 1 }}>
                                {(item as Festival).startDate && `Start: ${(item as Festival).startDate?.split('T')[0]}`}
                                {(item as Festival).endDate && ` | End: ${(item as Festival).endDate?.split('T')[0]}`}
                            </Typography>
                        )}
                    </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <IconButton size="small" onClick={() => handleOpenDialog(item)} sx={{ color: colors.text }}>
                        <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(item._id)} sx={{ color: '#f44336' }}>
                        <DeleteIcon />
                    </IconButton>
                </CardActions>
            </Card>
        </Box>
    );

    return (
        <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} textColor="secondary" indicatorColor="secondary">
                    <Tab label="Seasons" />
                    <Tab label="Festivals" />
                </Tabs>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ bgcolor: colors.accent, color: '#000', '&:hover': { bgcolor: '#bfa030' } }}
                >
                    Add {tabValue === 0 ? 'Season' : 'Festival'}
                </Button>
            </Box>

            {/* Cards Container using Flexbox */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {tabValue === 0
                    ? seasons.map(renderItemCard)
                    : festivals.map(renderItemCard)
                }
                {((tabValue === 0 && seasons.length === 0) || (tabValue === 1 && festivals.length === 0)) && (
                    <Box sx={{ width: '100%' }}>
                        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: colors.cardBg, color: colors.textSecondary }}>
                            No items found. Click "Add" to create one.
                        </Paper>
                    </Box>
                )}
            </Box>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: colors.cardBg, color: colors.text }}>
                    {isEditing ? 'Edit' : 'Add'} {tabValue === 0 ? 'Season' : 'Festival'}
                </DialogTitle>
                <DialogContent sx={{ bgcolor: colors.cardBg }}>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            select
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            helperText={tabValue === 0 ? 'Select from predefined seasons' : 'Select from predefined festivals'}
                        >
                            {(tabValue === 0 ? seasonNames : festivalNames).map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Animation Type"
                            value={formData.animationType}
                            onChange={(e) => setFormData({ ...formData, animationType: e.target.value })}
                            fullWidth
                        >
                            {(tabValue === 0 ? seasonAnimations : festivalAnimations).map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </TextField>



                        <TextField
                            select
                            label="Icon"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            fullWidth
                        >
                            {iconOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                        />
                        <TextField
                            label="Images (Comma separated URLs)"
                            value={formData.images}
                            onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                            fullWidth
                        />
                        {tabValue === 1 && (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Start Date"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="End Date"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ bgcolor: colors.cardBg, p: 2 }}>
                    <Button onClick={handleCloseDialog} sx={{ color: colors.textSecondary }}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: colors.accent, color: '#000' }}>
                        {isEditing ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SeasonFestivalManager;
