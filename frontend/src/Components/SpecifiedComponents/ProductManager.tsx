import React, { useState, useEffect } from 'react';
import {
    Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
    FormControlLabel, Checkbox, Typography, Chip, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { categories as allCategories } from '../../data/products';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    images: string[];
    category: string;
    stock: number;
    sizes: string[];
    colors: string[];
    isFeatured: boolean;
}

// Filter out 'All' and 'Hub' from the categories list for the dropdown
const categories = allCategories.filter(c => c !== 'All' && c !== 'Hub');

const ProductManager: React.FC = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        color: '',
        size: '',
        id: ''
    });

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', description: '', price: 0, discountPrice: 0,
        images: [''], category: '', stock: 0, sizes: [], colors: [], isFeatured: false
    });

    const filteredProducts = products.filter((product, index) => {
        const matchesSearch = product.name.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCategory = filters.category ? product.category === filters.category : true;
        const matchesMinPrice = filters.minPrice ? product.price >= Number(filters.minPrice) : true;
        const matchesMaxPrice = filters.maxPrice ? product.price <= Number(filters.maxPrice) : true;
        const matchesColor = filters.color ? product.colors.some(c => c.toLowerCase().includes(filters.color.toLowerCase())) : true;
        const matchesSize = filters.size ? product.sizes.some(s => s.toLowerCase().includes(filters.size.toLowerCase())) : true;
        const matchesId = filters.id ? (index + 1) === Number(filters.id) : true;

        return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesColor && matchesSize && matchesId;
    });



    const API_URL = 'http://localhost:8080/api/products';

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(API_URL); // Public endpoint
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleOpen = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '', description: '', price: 0, discountPrice: 0,
                images: [''], category: '', stock: 0, sizes: [], colors: [], isFeatured: false
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingProduct(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;

        // Handle checkbox manually since it's not present in the generic event type
        if (name === 'isFeatured') {
            // We need to cast e to access 'checked' property which is only available on HTMLInputElement
            const isChecked = (e as React.ChangeEvent<HTMLInputElement>).target.checked;
            setFormData({ ...formData, [name]: isChecked });
            return;
        }

        if (name === 'images') {
            // Simple comma-separated handling for now
            const strValue = value as string;
            setFormData({ ...formData, images: strValue.split(',').map(s => s.trim()) });
        } else if (name === 'sizes' || name === 'colors') {
            const strValue = value as string;
            setFormData({ ...formData, [name]: strValue.split(',').map(s => s.trim()) });
        } else if (name === 'price' || name === 'discountPrice' || name === 'stock') {
            // Ensure numbers are stored as numbers
            setFormData({ ...formData, [name]: Number(value) });
        } else if (name) {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async () => {
        try {
            const url = editingProduct ? `${API_URL}/${editingProduct._id}` : API_URL;
            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success(editingProduct ? 'Product updated' : 'Product created');
                fetchProducts();
                handleClose();
            } else {
                toast.error('Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Server error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success('Product deleted');
                fetchProducts();
            } else {
                toast.error('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6" fontWeight={700}>Products</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    sx={{
                        bgcolor: 'black',
                        color: 'white',
                        '&:hover': { bgcolor: '#333' },
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        px: 3
                    }}
                >
                    Add Product
                </Button>
            </Box>

            {/* Filters */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 4,
                    border: '1px solid #eee',
                    bgcolor: '#fafafa',
                    borderRadius: 2
                }}
            >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                    <TextField
                        placeholder="Search Name"
                        variant="outlined"
                        size="small"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 140, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={filters.category}
                            label="Category"
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <MenuItem value=""><em>All</em></MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        placeholder="Min Price"
                        type="number"
                        variant="outlined"
                        size="small"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        sx={{ width: 110, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                    <TextField
                        placeholder="Max Price"
                        type="number"
                        variant="outlined"
                        size="small"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        sx={{ width: 110, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                    <TextField
                        placeholder="Color"
                        variant="outlined"
                        size="small"
                        value={filters.color}
                        onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                        sx={{ width: 110, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                    <TextField
                        placeholder="Size"
                        variant="outlined"
                        size="small"
                        value={filters.size}
                        onChange={(e) => setFilters({ ...filters, size: e.target.value })}
                        sx={{ width: 90, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                    <TextField
                        placeholder="ID (Index)"
                        type="number"
                        variant="outlined"
                        size="small"
                        value={filters.id}
                        onChange={(e) => setFilters({ ...filters, id: e.target.value })}
                        sx={{ width: 100, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />

                    <Box sx={{ flexGrow: 1 }} />

                    <Button
                        variant="outlined"
                        onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', color: '', size: '', id: '' })}
                        sx={{
                            height: "10%",
                            width: "10%",
                            color: 'green',
                            borderColor: 'green',
                            borderRadius: 1,
                            fontWeight: 600,
                            minWidth: 100,
                            '&:hover': {
                                borderColor: 'black',
                                bgcolor: 'rgba(0,0,0,0.05)'
                            }
                        }}
                    >
                        CLEAR
                    </Button>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Image</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Stock</TableCell>
                            <TableCell>Featured</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProducts.map((product, index) => (
                            <TableRow key={product._id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <img src={product.images[0]} alt={product.name} style={{ width: 50, height: 50, objectFit: 'cover' }} />
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>
                                    ₹{product.price.toLocaleString('en-IN')}
                                    {product.discountPrice && (
                                        <Typography variant="caption" sx={{ textDecoration: 'line-through', ml: 1, color: 'text.secondary' }}>
                                            ₹{product.discountPrice.toLocaleString('en-IN')}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell>
                                    {product.isFeatured && <Chip label="Featured" color="secondary" size="small" />}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(product)} color="primary"><EditIcon /></IconButton>
                                    <IconButton onClick={() => handleDelete(product._id)} color="error"><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                            <TextField fullWidth label="Name" name="name" value={formData.name || ''} onChange={handleChange} />
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    label="Category"
                                    name="category"
                                    value={formData.category || ''}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as string })}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat} value={cat}>
                                            {cat}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ flex: '1 1 100%' }}>
                            <TextField fullWidth label="Description" name="description" multiline rows={3} value={formData.description || ''} onChange={handleChange} />
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 31%' } }}>
                            <TextField fullWidth label="Price (₹)" name="price" type="number" value={formData.price || ''} onChange={handleChange} />
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 31%' } }}>
                            <TextField fullWidth label="Discount Price (₹)" name="discountPrice" type="number" value={formData.discountPrice || ''} onChange={handleChange} />
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 31%' } }}>
                            <TextField fullWidth label="Stock" name="stock" type="number" value={formData.stock || ''} onChange={handleChange} />
                        </Box>
                        <Box sx={{ flex: '1 1 100%' }}>
                            <TextField
                                fullWidth
                                label="Images (Comma separated URLs)"
                                name="images"
                                value={Array.isArray(formData.images) ? formData.images.join(', ') : formData.images || ''}
                                onChange={handleChange}
                                helperText="Enter full image URLs separated by commas"
                            />
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                            <TextField
                                fullWidth
                                label="Sizes (Comma separated)"
                                name="sizes"
                                value={Array.isArray(formData.sizes) ? formData.sizes.join(', ') : formData.sizes || ''}
                                onChange={handleChange}
                            />
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 48%' } }}>
                            <TextField
                                fullWidth
                                label="Colors (Comma separated)"
                                name="colors"
                                value={Array.isArray(formData.colors) ? formData.colors.join(', ') : formData.colors || ''}
                                onChange={handleChange}
                            />
                        </Box>
                        <Box sx={{ flex: '1 1 100%' }}>
                            <FormControlLabel
                                control={<Checkbox checked={formData.isFeatured || false} onChange={handleChange} name="isFeatured" />}
                                label="Featured Product"
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductManager;
