import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress,
    Alert,
    Chip,
    Pagination,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ProductFormDialog from './ProductFormDialog';
import ConfirmationModal from '../common/ConfirmationModal';
import ProductFilters from './ProductFilters';
import StockUpdateDialog from './StockUpdateDialog';
import LogoutContainer from '../../containers/common/LogoutContainer';
import LogoutIcon from '@mui/icons-material/Logout';
import Avatar from '@mui/material/Avatar';

const SellerDashboardView = ({
    products,
    isLoading,
    error,
    dialogOpen,
    selectedProduct,
    onOpenDialog,
    onCloseDialog,
    onSubmit,
    onDelete,
    isSubmitting,
    isDeleting,
    operationError,
    deleteConfirmOpen,
    productToDelete,
    onDeleteConfirm,
    onDeleteCancel,
    // filters state from Redux
    filters,
    onSearchChange,
    onCategoryChange,
    onStatusChange,
    onClearFilters,
    onStatusToggle,
    onStockUpdateClick,
    stockUpdateOpen,
    productToUpdateStock,
    onStockUpdate,
    onStockUpdateCancel,
    isUpdatingStock,
    onImageUpload,
    imageUploadLoading,
    // Pagination props
    currentPage = 1,
    totalPages = 0,
    totalProducts = 0,
    onPageChange,
    categories = [],
}) => {
    // derivedCategories logic removed in favor of passed categories prop

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" gutterBottom fontWeight="600">
                        Seller Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your products and inventory
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <LogoutContainer>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            size="large"
                        >
                            Logout
                        </Button>
                    </LogoutContainer>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => onOpenDialog(null)}
                        size="large"
                    >
                        Add Product
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12} md={4}>
                    <Card
                        elevation={0}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderLeft: '4px solid',
                            borderLeftColor: 'success.main',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" gap={2.5}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        bgcolor: 'success.light',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <CheckCircleIcon sx={{ color: 'success.dark' }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Store Status
                                    </Typography>
                                    <Typography variant="h5" fontWeight="600" color="success.dark">
                                        Active
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card
                        elevation={0}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" gap={2.5}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        bgcolor: 'primary.light',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <InventoryIcon sx={{ color: 'primary.dark' }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Total Products
                                    </Typography>
                                    <Typography variant="h5" fontWeight="600" color="text.primary">
                                        {isLoading ? '...' : products?.length || 0}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {operationError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {operationError?.data?.message || operationError?.data || 'An error occurred'}
                </Alert>
            )}

            <ProductFilters
                search={filters?.search || ''}
                category={filters?.category || ''}
                status={filters?.status || ''}
                categories={categories}
                onSearchChange={onSearchChange}
                onCategoryChange={onCategoryChange}
                onStatusChange={onStatusChange}
                onClearFilters={onClearFilters}
            />

            <Paper
                elevation={0}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="600">
                        My Products
                    </Typography>
                </Box>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Alert severity="error">
                            {error?.data?.message || 'Failed to load products. Please try again.'}
                        </Alert>
                    </Box>
                ) : products && products.length > 0 ? (
                    <>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Image</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Price</TableCell>
                                        <TableCell>Stock</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product?.id ?? Math.random()} hover>
                                            <TableCell>
                                                {/* <img width={"200px"} src={`http://localhost:8080/uploads/products/${product.imageUrl}`} alt={product?.name || 'Product'} /> */}
                                                {product?.imageUrl ? (
                                                    <Avatar
                                                        src={`http://localhost:8080/uploads/products/${product.imageUrl}`}
                                                        alt={product?.name || 'Product'}
                                                        variant="rounded"
                                                        sx={{ width: 56, height: 56 }}
                                                    />
                                                ) : (
                                                    <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: 'grey.300' }}>
                                                        <InventoryIcon />
                                                    </Avatar>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body1" fontWeight="500">
                                                        {product?.name || 'Unknown Product'}
                                                    </Typography>
                                                    {product?.description && (
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                maxWidth: 300,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {product.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {product?.category ? (
                                                    <Chip
                                                        label={product.category?.name || product.category}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        -
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body1" fontWeight="500">
                                                    ₹{(parseFloat(product?.price || 0)).toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography
                                                        variant="body1"
                                                        color={(product?.stockQuantity || 0) > 0 ? 'text.primary' : 'error'}
                                                        fontWeight="500"
                                                    >
                                                        {product?.stockQuantity || 0}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onStockUpdateClick(product)}
                                                        color="primary"
                                                        title="Update Stock"
                                                    >
                                                        <Inventory2Icon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={product.status || 'ACTIVE'}
                                                    color={product.status === 'ACTIVE' ? 'success' : 'default'}
                                                    size="small"
                                                    onClick={() => onStatusToggle(product)}
                                                    icon={product.status === 'ACTIVE' ? <ToggleOnIcon /> : <ToggleOffIcon />}
                                                    sx={{ cursor: 'pointer', minWidth: 100, justifyContent: 'flex-start' }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onOpenDialog(product)}
                                                    disabled={isDeleting}
                                                    color="primary"
                                                    title="Edit"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDelete(product)}
                                                    disabled={isDeleting}
                                                    color="error"
                                                    title="Delete"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {totalPages > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={onPageChange}
                                    color="primary"
                                    size="large"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        )}
                    </>
                ) : (
                    <Box
                        sx={{
                            p: 8,
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Box sx={{ p: 3, mb: 3, bgcolor: 'action.hover', display: 'inline-flex' }}>
                            <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.6 }} />
                        </Box>
                        <Typography variant="h6" color="text.primary" gutterBottom fontWeight="600">
                            No Products Yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
                            Get started by adding your first product to your store.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => onOpenDialog(null)}
                        >
                            Add Your First Product
                        </Button>
                    </Box>
                )}
            </Paper>

            <ProductFormDialog
                open={dialogOpen}
                onClose={onCloseDialog}
                onSubmit={onSubmit}
                product={selectedProduct}
                isLoading={isSubmitting}
                error={operationError}
                onImageUpload={onImageUpload}
                imageUploadLoading={imageUploadLoading}
                categories={categories}
            />

            <StockUpdateDialog
                open={stockUpdateOpen}
                onClose={onStockUpdateCancel}
                onSubmit={onStockUpdate}
                product={productToUpdateStock}
                isLoading={isUpdatingStock}
                error={operationError}
            />

            <ConfirmationModal
                open={deleteConfirmOpen}
                onClose={onDeleteCancel}
                onConfirm={onDeleteConfirm}
                title="Delete Product"
                message={
                    productToDelete
                        ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
                        : 'Are you sure you want to delete this product? This action cannot be undone.'
                }
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="error"
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default SellerDashboardView;
