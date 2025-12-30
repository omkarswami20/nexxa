import React from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    IconButton,
    Card,
    CardMedia,
    Alert,
    CircularProgress,
    Chip,
    Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link } from 'react-router-dom';

const ProductDetailView = ({
    product,
    isLoading,
    error,
    quantity,
    onQuantityChange,
    onAddToCart,
    isAddingToCart,
    addToCartError,
}) => {
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !product) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="error">
                    {error?.data?.message || 'Product not found'}
                </Alert>
                <Button component={Link} to="/" sx={{ mt: 2 }}>
                    Back to Home
                </Button>
            </Container>
        );
    }

    const isOutOfStock = (product?.stockQuantity || 0) === 0;

    return (
        <Box sx={{ minHeight: 'calc(100vh - 200px)', py: 4 }}>
            <Container maxWidth="lg">
                <Button component={Link} to="/" sx={{ mb: 3 }}>
                    ← Back to Products
                </Button>

                <Grid container spacing={4}>
                    {/* Product Image */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="500"
                                image={product?.imageUrl || 'https://via.placeholder.com/500x500?text=No+Image'}
                                alt={product?.name || 'Product'}
                                sx={{ objectFit: 'contain', bgcolor: 'grey.50' }}
                            />
                        </Card>
                    </Grid>

                    {/* Product Details */}
                    <Grid item xs={12} md={6}>
                        <Box>
                            {product?.category && (
                                <Chip
                                    label={product.category.name}
                                    size="small"
                                    sx={{ mb: 2 }}
                                />
                            )}
                            <Typography variant="h4" component="h1" fontWeight="600" gutterBottom>
                                {product?.name || 'Unknown Product'}
                            </Typography>

                            <Typography
                                variant="h5"
                                color="primary"
                                fontWeight="600"
                                sx={{ mb: 3 }}
                            >
                                Rs. {product?.price?.toFixed(2) || '0.00'}
                            </Typography>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                {product?.description || 'No description available'}
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Stock Status:
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color={isOutOfStock ? 'error.main' : 'success.main'}
                                    fontWeight="500"
                                >
                                    {isOutOfStock
                                        ? 'Out of Stock'
                                        : `${product?.stockQuantity || 0} items available`}
                                </Typography>
                            </Box>

                            {addToCartError && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {addToCartError}
                                </Alert>
                            )}

                            {!isOutOfStock && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Quantity:
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <IconButton
                                            onClick={() => onQuantityChange(quantity - 1)}
                                            disabled={quantity <= 1}
                                            size="small"
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                                            {quantity}
                                        </Typography>
                                        <IconButton
                                            onClick={() => onQuantityChange(quantity + 1)}
                                            disabled={quantity >= (product?.stockQuantity || 0)}
                                            size="small"
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            )}

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<ShoppingCartIcon />}
                                onClick={onAddToCart}
                                disabled={isOutOfStock || isAddingToCart}
                                fullWidth
                                sx={{ py: 1.5 }}
                            >
                                {isAddingToCart ? 'Adding to Cart...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default ProductDetailView;

