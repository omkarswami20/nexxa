import React from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Alert,
    Paper,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Divider,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const CheckoutView = ({
    items,
    addresses,
    selectedAddressId,
    useNewAddress,
    newAddress,
    onAddressSelectionChange,
    onNewAddressChange,
    onPlaceOrder,
    isLoading,
    isError,
    error,
    totalAmount,
}) => {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" fontWeight="600" gutterBottom>
                Checkout
            </Typography>

            {isError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error?.data?.message || 'Checkout failed. Please try again.'}
                </Alert>
            )}

            <Grid container spacing={4}>
                {/* Order Items Summary */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Order Items
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        {items.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="body1" color="text.secondary">
                                    Your cart is empty
                                </Typography>
                            </Box>
                        ) : (
                            items.map((item) => {
                                const product = item?.product;
                                return (
                                    <Box key={item?.id ?? `${item?.productId}`} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            {product?.imageUrl && (
                                                <Box
                                                    component="img"
                                                    src={product.imageUrl}
                                                    alt={product?.name || 'Product'}
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        objectFit: 'cover',
                                                        borderRadius: 1,
                                                    }}
                                                />
                                            )}
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle1" fontWeight="500">
                                                    {product?.name || `Product #${item?.productId}`}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Quantity: {item?.quantity || 0} × Rs. {(product?.price || 0).toFixed(2)}
                                                </Typography>
                                                <Typography variant="body2" fontWeight="500" sx={{ mt: 0.5 }}>
                                                    Subtotal: Rs. {((product?.price || 0) * (item?.quantity || 0)).toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {items.indexOf(item) < items.length - 1 && <Divider sx={{ mt: 2 }} />}
                                    </Box>
                                );
                            })
                        )}
                    </Paper>

                    {/* Address Selection */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Shipping Address
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <FormControl component="fieldset" fullWidth>
                            <RadioGroup
                                value={useNewAddress ? 'new' : selectedAddressId}
                                onChange={(e) => onAddressSelectionChange(e.target.value)}
                            >
                                {/* Saved Addresses */}
                                {addresses.map((addr) => (
                                    <FormControlLabel
                                        key={addr.id}
                                        value={addr.id.toString()}
                                        control={<Radio />}
                                        label={
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="500">
                                                    {addr.name} {addr.isDefault && '(Default)'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {addr.line1}
                                                    {addr.line2 && `, ${addr.line2}`}
                                                    <br />
                                                    {addr.city}, {addr.state} {addr.zip}
                                                    <br />
                                                    {addr.country}
                                                    {addr.phone && ` • ${addr.phone}`}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                ))}

                                {/* New Address Option */}
                                <FormControlLabel
                                    value="new"
                                    control={<Radio />}
                                    label={
                                        <Typography variant="subtitle2" fontWeight="500">
                                            Use a new address
                                        </Typography>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>

                        {/* New Address Form */}
                        {useNewAddress && (
                            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle2" gutterBottom fontWeight="500">
                                    Enter New Address
                                </Typography>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Name"
                                            name="name"
                                            value={newAddress.name}
                                            onChange={(e) => onNewAddressChange('name', e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Phone"
                                            name="phone"
                                            value={newAddress.phone}
                                            onChange={(e) => onNewAddressChange('phone', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Address Line 1"
                                            name="line1"
                                            value={newAddress.line1}
                                            onChange={(e) => onNewAddressChange('line1', e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Address Line 2"
                                            name="line2"
                                            value={newAddress.line2}
                                            onChange={(e) => onNewAddressChange('line2', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="City"
                                            name="city"
                                            value={newAddress.city}
                                            onChange={(e) => onNewAddressChange('city', e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="State"
                                            name="state"
                                            value={newAddress.state}
                                            onChange={(e) => onNewAddressChange('state', e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="ZIP Code"
                                            name="zip"
                                            value={newAddress.zip}
                                            onChange={(e) => onNewAddressChange('zip', e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Country"
                                            name="country"
                                            value={newAddress.country}
                                            onChange={(e) => onNewAddressChange('country', e.target.value)}
                                            required
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Order Summary */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Order Summary
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1">Items ({items.length})</Typography>
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
                            onClick={onPlaceOrder}
                            disabled={isLoading || items.length === 0}
                            sx={{ py: 1.5 }}
                        >
                            {isLoading ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                                    Placing Order...
                                </>
                            ) : (
                                'Place Order'
                            )}
                        </Button>
                        {items.length === 0 && (
                            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                                Add items to cart to checkout
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CheckoutView;

