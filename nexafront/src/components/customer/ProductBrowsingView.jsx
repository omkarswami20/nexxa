import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    Alert,
    Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ProductCard from '../common/ProductCard';
import ProductSkeleton from '../common/ProductSkeleton';

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
    const [debouncedSearch, setDebouncedSearch] = useState(searchFilter);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchFilter);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchFilter]);

    useEffect(() => {
        if (debouncedSearch !== searchFilter) {
            onSearchChange(debouncedSearch);
        }
    }, [debouncedSearch]);

    return (
        <Box sx={{ bgcolor: 'background.default', py: 4, minHeight: 'calc(100vh - 120px)' }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 4 },
                        mb: 4,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    }}
                >
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                        Shop Products
                    </Typography>
                    <Typography color="text.secondary">
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
                        sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 220 } }}
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
                    <Grid container spacing={3}>
                        {[...Array(8)].map((_, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                <ProductSkeleton />
                            </Grid>
                        ))}
                    </Grid>
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
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                                    Showing {products.length} of {total} products
                                </Typography>

                                <Grid container spacing={3}>
                                    {products.map((product, index) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                            <ProductCard product={product} index={index} />
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
