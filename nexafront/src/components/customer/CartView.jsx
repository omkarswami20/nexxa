import React from 'react';
import {
    Box,
    Container,
    Typography,
    IconButton,
    Button,
    Divider,
    Card,
    CardContent,
    CardMedia,
    Grid,
    CircularProgress,
    Alert,
    Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link } from 'react-router-dom';

const CartView = ({
    items,
    isLoading,
    totalQty,
    totalAmount,
    onIncrease,
    onDecrease,
    onRemove,
    onCheckout,
}) => {
    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" fontWeight="600" gutterBottom>
                Shopping Cart
            </Typography>

            {items.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Your cart is empty
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Start shopping to add items to your cart
                    </Typography>
                    <Button component={Link} to="/" variant="contained">
                        Continue Shopping
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        {items.map((item) => {
                            const product = item?.product;
                            return (
                                <Card key={item?.id ?? `cart-item-${item.productId}`} sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Grid container spacing={2} alignItems="center">
                                            {/* Product Image */}
                                            <Grid item xs={12} sm={3}>
                                                <CardMedia
                                                    component="img"
                                                    height="120"
                                                    image={
                                                        product?.imageUrl ||
                                                        'https://via.placeholder.com/120x120?text=No+Image'
                                                    }
                                                    alt={product?.name || 'Product'}
                                                    sx={{ objectFit: 'cover', borderRadius: 1 }}
                                                />
                                            </Grid>

                                            {/* Product Details */}
                                            <Grid item xs={12} sm={6}>
                                                <Typography
                                                    variant="h6"
                                                    component={Link}
                                                    to={`/products/${item?.productId}`}
                                                    sx={{
                                                        textDecoration: 'none',
                                                        color: 'inherit',
                                                        '&:hover': { color: 'primary.main' },
                                                    }}
                                                >
                                                    {product?.name || `Product #${item?.productId}`}
                                                </Typography>
                                                {product?.category && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {product.category.name}
                                                    </Typography>
                                                )}
                                                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                                    Rs. {(product?.price || 0).toFixed(2)}
                                                </Typography>
                                                {product && (product.stockQuantity || 0) < (item.quantity || 0) && (
                                                    <Alert severity="warning" sx={{ mt: 1 }}>
                                                        Only {product.stockQuantity} available in stock
                                                    </Alert>
                                                )}
                                            </Grid>

                                            {/* Quantity Controls */}
                                            <Grid item xs={12} sm={3}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => onDecrease(item.productId, item.quantity)}
                                                            disabled={(item.quantity || 0) <= 1}
                                                        >
                                                            <RemoveIcon />
                                                        </IconButton>
                                                        <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
                                                            {item.quantity || 0}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => onIncrease(item.productId, item.quantity)}
                                                            disabled={
                                                                product && (item.quantity || 0) >= (product.stockQuantity || 0)
                                                            }
                                                        >
                                                            <AddIcon />
                                                        </IconButton>
                                                    </Box>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => onRemove(item.productId)}
                                                        size="small"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                                                    Subtotal: Rs. {((product?.price || 0) * (item.quantity || 0)).toFixed(2)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Grid>

                    {/* Order Summary */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                            <Typography variant="h6" gutterBottom fontWeight="600">
                                Order Summary
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1">Items ({totalQty})</Typography>
                                <Typography variant="body1">Rs. {totalAmount.toFixed(2)}</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" fontWeight="600">
                                    Total
                                </Typography>
                                <Typography variant="h6" fontWeight="600" color="primary">
                                    Rs. {totalAmount.toFixed(2)}
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={onCheckout}
                                sx={{ py: 1.5 }}
                            >
                                Proceed to Checkout
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default CartView;

