import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Tabs, Tab, Avatar, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

import { useNavigate } from 'react-router-dom';
import ProductManager from './ProductManager';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import SeasonFestivalManager from './SeasonFestivalManager';

interface Stats {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    revenue: number;
}

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

const AdminDashboard: React.FC = () => {
    const { user, token, loading } = useAuth();

    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    // Theme colors
    const colors = {
        bg: '#f5f5f5',
        cardBg: 'white',
        cardBorder: '#e0e0e0',
        text: '#1a1a1a',
        textSecondary: '#666',
        accent: '#D4AF37',
        accentBg: 'rgba(212, 175, 55, 0.1)',
    };

    useEffect(() => {
        if (loading) return;
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        fetchStats();
        fetchUsers();
    }, [user, navigate, token, loading]);

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: <PeopleIcon />, color: '#4CAF50', change: '+12%' },
        { label: 'Total Products', value: stats?.totalProducts || 0, icon: <InventoryIcon />, color: '#2196F3', change: '+5%' },
        { label: 'Total Orders', value: stats?.totalOrders || 0, icon: <ShoppingCartIcon />, color: '#FF9800', change: '+8%' },
        { label: 'Revenue', value: `₹${(stats?.revenue || 0).toLocaleString('en-IN')}`, icon: <CurrencyRupeeIcon />, color: '#E91E63', change: '+15%' },
    ];

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: colors.bg }}>
                <Typography sx={{ color: colors.text }}>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.bg, py: 4 }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: colors.text }}>
                            Admin Dashboard
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
                            Welcome back, {user?.name}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => { fetchStats(); fetchUsers(); }} sx={{ color: colors.accent }}>
                        <RefreshIcon />
                    </IconButton>
                </Box>

                {/* Stats Cards */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                    {statCards.map((stat, index) => (
                        <Box
                            key={index}
                            sx={{
                                flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' },
                                bgcolor: colors.cardBg,
                                borderRadius: 3,
                                p: 3,
                                border: `1px solid ${colors.cardBorder}`,
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-4px)' }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: colors.text }}>
                                        {stat.value}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                        <TrendingUpIcon sx={{ fontSize: 16, color: '#4CAF50' }} />
                                        <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                                            {stat.change}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        bgcolor: `${stat.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: stat.color
                                    }}
                                >
                                    {stat.icon}
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Tabs */}
                <Paper sx={{ mb: 3, bgcolor: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTab-root': { color: colors.textSecondary },
                            '& .Mui-selected': { color: colors.accent },
                            '& .MuiTabs-indicator': { bgcolor: colors.accent }
                        }}
                    >
                        <Tab label="Product Management" />
                        <Tab label="Seasons & Festivals" />
                        <Tab label="User Management" />
                        <Tab label="Orders" />
                    </Tabs>
                </Paper>

                {/* Tab Content */}
                <Box sx={{ bgcolor: colors.cardBg, borderRadius: 2, border: `1px solid ${colors.cardBorder}`, p: 3 }}>
                    {tabValue === 0 && <ProductManager />}

                    {/* Tab 1: Seasons & Festivals */}
                    {tabValue === 1 && <SeasonFestivalManager />}

                    {/* Tab 2: User Management */}
                    {tabValue === 2 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 3, color: colors.text, fontWeight: 600 }}>
                                Registered Users ({users.length})
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>User</TableCell>
                                            <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Email</TableCell>
                                            <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Role</TableCell>
                                            <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Joined</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map((u) => (
                                            <TableRow key={u._id} sx={{ '&:hover': { bgcolor: colors.accentBg } }}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{ bgcolor: colors.accent, width: 36, height: 36 }}>
                                                            {u.name?.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Typography sx={{ color: colors.text }}>{u.name}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ color: colors.text }}>{u.email}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={u.role}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: u.role === 'admin' ? '#E91E6320' : '#4CAF5020',
                                                            color: u.role === 'admin' ? '#E91E63' : '#4CAF50',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: colors.textSecondary }}>
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {users.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} sx={{ textAlign: 'center', color: colors.textSecondary, py: 4 }}>
                                                    No users found. Backend endpoint may need configuration.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                    {tabValue === 3 && (
                        <Typography variant="h6" sx={{ p: 3, color: colors.textSecondary, textAlign: 'center' }}>
                            Order Management Coming Soon
                        </Typography>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default AdminDashboard;
