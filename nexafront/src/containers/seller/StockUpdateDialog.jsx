import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';

const StockUpdateDialog = ({
    open,
    onClose,
    onSubmit,
    product,
    isLoading,
    error,
}) => {
    const [stockQuantity, setStockQuantity] = useState(0);
    const [adjustment, setAdjustment] = useState(0);

    useEffect(() => {
        if (product) {
            setStockQuantity(product.stockQuantity || 0);
            setAdjustment(0);
        }
    }, [product, open]);

    const handleAdjustmentChange = (value) => {
        setAdjustment(parseInt(value) || 0);
        if (product) {
            const newStock = (product.stockQuantity || 0) + (parseInt(value) || 0);
            setStockQuantity(Math.max(0, newStock));
        }
    };

    const handleDirectChange = (value) => {
        const newStock = parseInt(value) || 0;
        setStockQuantity(Math.max(0, newStock));
        if (product) {
            setAdjustment(newStock - (product.stockQuantity || 0));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (stockQuantity >= 0) {
            onSubmit(stockQuantity);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Update Stock - {product?.name}</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error?.data?.message || error?.data || 'An error occurred'}
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Current Stock
                            </Typography>
                            <Typography variant="h6" fontWeight="600">
                                {product?.stockQuantity || 0}
                            </Typography>
                        </Box>

                        <TextField
                            label="Adjustment (+/-)"
                            type="number"
                            value={adjustment}
                            onChange={(e) => handleAdjustmentChange(e.target.value)}
                            fullWidth
                            helperText="Enter positive to add, negative to subtract"
                            inputProps={{ step: '1' }}
                        />

                        <TextField
                            label="New Stock Quantity"
                            type="number"
                            value={stockQuantity}
                            onChange={(e) => handleDirectChange(e.target.value)}
                            fullWidth
                            required
                            inputProps={{ min: '0', step: '1' }}
                        />
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
                        Update Stock
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default StockUpdateDialog;

