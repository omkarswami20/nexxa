import React from 'react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    CircularProgress,
    Alert,
    Chip,
    Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const ProductBrowsingView = ({
    products,
    categories,
    isLoading,
    error,
    currentPage,
    totalPages,
    total,
    categoryFilter,
    searchFilter,
    onPageChange,
    onCategoryChange,
    onSearchChange,
    onProductClick,
}) => {
    return (
        <Box sx={{ bgcolor: '#f8fafc', py: 4, minHeight: 'calc(100vh - 120px)' }}>
            <Container maxWidth="xl">

                {/* Header */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        mb: 4,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h4" fontWeight={700}>
                        Shop Products
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                        Discover quality products from trusted sellers
                    </Typography>
                </Paper>

                {/* Filters */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                    }}
                >
                    <TextField
                        placeholder="Search products..."
                        value={searchFilter}
                        onChange={(e) => onSearchChange(e.target.value)}
                        size="small"
                        sx={{ flexGrow: 1, minWidth: 220 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryFilter}
                            label="Category"
                            onChange={(e) => onCategoryChange(e.target.value)}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.name}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {(categoryFilter || searchFilter) && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                onCategoryChange('');
                                onSearchChange('');
                            }}
                        >
                            Clear
                        </Button>
                    )}
                </Paper>

                {/* Error */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error?.data?.message || 'Failed to load products. Please try again.'}
                    </Alert>
                )}

                {/* Loading */}
                {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Products */}
                {!isLoading && !error && (
                    <>
                        {products.length === 0 ? (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 6,
                                    textAlign: 'center',
                                    borderRadius: 3,
                                    border: '1px dashed',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="h6" color="text.secondary">
                                    No products found
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Try changing filters or check again later
                                </Typography>
                            </Paper>
                        ) : (
                            <>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Showing {products.length} of {total} products
                                </Typography>

                                <Grid container spacing={3}>
                                    {products.map((product) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                            <Card
                                                sx={{
                                                    height: '100%',
                                                    borderRadius: 3,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    transition: 'all 0.25s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-6px)',
                                                        boxShadow: 6,
                                                    },
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => onProductClick(product.id)}
                                            >
                                                <Box sx={{ position: 'relative' }}>
                                                    <CardMedia
                                                        component="img"
                                                        height="200"
                                                        image={
                                                            product.imageUrl
                                                                ? `http://localhost:8080/uploads/products/${product.imageUrl}`
                                                                : 'https://via.placeholder.com/400x300?text=No+Image'
                                                        }
                                                        alt={product.name}
                                                    />
                                                    <Chip
                                                        label={`Rs. ${product.price?.toFixed(2) || '0.00'}`}
                                                        color="primary"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 12,
                                                            right: 12,
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </Box>

                                                <CardContent sx={{ flexGrow: 1 }}>
                                                    <Typography variant="h6" noWrap gutterBottom>
                                                        {product.name}
                                                    </Typography>

                                                    {product.category && (
                                                        <Chip
                                                            label={product.category.name}
                                                            size="small"
                                                            sx={{ mb: 1 }}
                                                        />
                                                    )}

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            mb: 2,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {product.description || 'No description available'}
                                                    </Typography>

                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            mt: 'auto',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color={
                                                                product.stockQuantity > 0
                                                                    ? 'success.main'
                                                                    : 'error.main'
                                                            }
                                                        >
                                                            {product.stockQuantity > 0
                                                                ? `${product.stockQuantity} in stock`
                                                                : 'Out of stock'}
                                                        </Typography>

                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<ShoppingCartIcon />}
                                                        >
                                                            View
                                                        </Button>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                                        <Pagination
                                            count={totalPages}
                                            page={currentPage}
                                            onChange={onPageChange}
                                            color="primary"
                                            size="large"
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default ProductBrowsingView;
