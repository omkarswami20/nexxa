import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import ImageUpload from '../../components/common/ImageUpload';

const ProductFormDialog = ({
    open,
    onClose,
    onSubmit,
    product,
    isLoading,
    error,
    // categories kept only for potential future use, not used in the form now
    categories = [],
    onImageUpload,
    imageUploadLoading,
    imageUploadError,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        categoryId: '',
        imageUrl: '',
        status: 'ACTIVE',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                stockQuantity: product.stockQuantity || '',
                categoryId: product.category?.id || '',
                imageUrl: product.imageUrl || '',
                status: product.status || 'ACTIVE',
            });
        } else {
            setFormData({
                name: '',
                description: '',
                price: '',
                stockQuantity: '',
                categoryId: '',
                imageUrl: '',
                status: 'ACTIVE',
            });
        }
        setErrors({});
    }, [product, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Valid price is required';
        }
        if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
            newErrors.stockQuantity = 'Valid stock quantity is required';
        }
        if (!formData.categoryId) {
            newErrors.categoryId = 'Category is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({
                ...formData,
                price: parseFloat(formData.price),
                stockQuantity: parseInt(formData.stockQuantity),
                status: formData.status,
            });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {product ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error?.data?.message || error?.data || 'An error occurred'}
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Product Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                        />
                        <TextField
                            label="Price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            fullWidth
                            required
                            inputProps={{ step: '0.01', min: '0' }}
                            error={!!errors.price}
                            helperText={errors.price}
                        />
                        <TextField
                            label="Stock Quantity"
                            name="stockQuantity"
                            type="number"
                            value={formData.stockQuantity}
                            onChange={handleChange}
                            fullWidth
                            required
                            inputProps={{ min: '0' }}
                            error={!!errors.stockQuantity}
                            helperText={errors.stockQuantity}
                        />
                        <FormControl fullWidth required error={!!errors.categoryId}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="categoryId"
                                value={formData.categoryId}
                                label="Category"
                                onChange={handleChange}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.categoryId && (
                                <Box sx={{ color: 'error.main', fontSize: '0.75rem', ml: 1.5, mt: 0.5 }}>
                                    {errors.categoryId}
                                </Box>
                            )}
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                label="Status"
                                onChange={handleChange}
                            >
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="INACTIVE">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                        <Box>
                            <InputLabel sx={{ mb: 1 }}>Product Image</InputLabel>
                            <ImageUpload
                                value={formData.imageUrl}
                                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                                onUpload={onImageUpload}
                                isLoading={imageUploadLoading}
                                error={imageUploadError}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} /> : null}
                    >
                        {product ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ProductFormDialog;

