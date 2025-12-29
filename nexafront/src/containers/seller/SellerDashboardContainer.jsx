import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SellerDashboardView from './SellerDashboardView';
import {
    useGetSellerProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useUpdateProductStatusMutation,
    useUpdateProductStockMutation,
    useUploadProductImageMutation,
    useGetCategoriesQuery,
} from '../../store/api/api.slice';
import {
    setSelectedProduct,
    clearSelectedProduct,
    selectSelectedProduct,
    setSearchFilter,
    setCategoryFilter,
    setStatusFilter,
    clearFilters,
    selectProductFilters,
    selectPagination,
    setCurrentPage,
} from '../../store/slices/product.slice';

const SellerDashboardContainer = () => {
    const dispatch = useDispatch();
    const selectedProduct = useSelector(selectSelectedProduct);
    const filters = useSelector(selectProductFilters);
    const pagination = useSelector(selectPagination);

    // Calculate offset from current page and page size
    const offset = (pagination.currentPage - 1) * pagination.pageSize;

    const { data: productsData, isLoading, error } = useGetSellerProductsQuery({
        ...filters,
        limit: pagination.pageSize,
        offset: offset,
    });

    // Extract products and pagination info from response
    const products = productsData?.products || [];
    const totalProducts = productsData?.total || 0;
    const totalPages = Math.ceil(totalProducts / pagination.pageSize);
    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
    const [updateProductStatus] = useUpdateProductStatusMutation();
    const [updateProductStock, { isLoading: isUpdatingStock }] = useUpdateProductStockMutation();
    const [uploadProductImage, { isLoading: isUploadingImage }] = useUploadProductImageMutation();
    const { data: categories } = useGetCategoriesQuery();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [stockUpdateOpen, setStockUpdateOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [productToUpdateStock, setProductToUpdateStock] = useState(null);
    const [operationError, setOperationError] = useState(null);

    const handleOpenDialog = (product = null) => {
        if (product) {
            dispatch(setSelectedProduct(product));
        } else {
            dispatch(clearSelectedProduct());
        }
        setDialogOpen(true);
        setOperationError(null);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        dispatch(clearSelectedProduct());
        setOperationError(null);
    };

    const handleCreate = async (productData) => {
        try {
            setOperationError(null);
            await createProduct(productData).unwrap();
            handleCloseDialog();
        } catch (err) {
            setOperationError(err);
        }
    };

    const handleUpdate = async (productData) => {
        try {
            setOperationError(null);
            await updateProduct({ id: selectedProduct.id, ...productData }).unwrap();
            handleCloseDialog();
        } catch (err) {
            setOperationError(err);
        }
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;

        try {
            setOperationError(null);
            await deleteProduct(productToDelete.id).unwrap();
            setDeleteConfirmOpen(false);
            setProductToDelete(null);
        } catch (err) {
            setOperationError(err);
            // Keep modal open on error so user can retry
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setProductToDelete(null);
    };

    const handleStatusToggle = async (product) => {
        try {
            setOperationError(null);
            const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await updateProductStatus({ id: product.id, status: newStatus }).unwrap();
        } catch (err) {
            setOperationError(err);
        }
    };

    const handleStockUpdateClick = (product) => {
        setProductToUpdateStock(product);
        setStockUpdateOpen(true);
    };

    const handleStockUpdate = async (stockQuantity) => {
        if (!productToUpdateStock) return;

        try {
            setOperationError(null);
            await updateProductStock({ id: productToUpdateStock.id, stockQuantity }).unwrap();
            setStockUpdateOpen(false);
            setProductToUpdateStock(null);
        } catch (err) {
            setOperationError(err);
        }
    };

    const handleStockUpdateCancel = () => {
        setStockUpdateOpen(false);
        setProductToUpdateStock(null);
    };

    const handleImageUpload = async (file) => {
        try {
            const result = await uploadProductImage(file).unwrap();
            return result;
        } catch (err) {
            throw err;
        }
    };

    const handleSubmit = (productData) => {
        if (selectedProduct) {
            handleUpdate(productData);
        } else {
            handleCreate(productData);
        }
    };

    const handlePageChange = (event, newPage) => {
        dispatch(setCurrentPage(newPage));
    };

    return (
        <SellerDashboardView
            products={products}
            isLoading={isLoading}
            error={error}
            dialogOpen={dialogOpen}
            selectedProduct={selectedProduct}
            onOpenDialog={handleOpenDialog}
            onCloseDialog={handleCloseDialog}
            onSubmit={handleSubmit}
            onDelete={handleDeleteClick}
            isSubmitting={isCreating || isUpdating}
            isDeleting={isDeleting}
            operationError={operationError}
            deleteConfirmOpen={deleteConfirmOpen}
            productToDelete={productToDelete}
            onDeleteConfirm={handleDeleteConfirm}
            onDeleteCancel={handleDeleteCancel}
            // categories for filters are derived in the view from the products list
            filters={filters}
            onSearchChange={(value) => {
                dispatch(setSearchFilter(value));
                dispatch(setCurrentPage(1)); // Reset to first page when search changes
            }}
            onCategoryChange={(value) => {
                dispatch(setCategoryFilter(value));
                dispatch(setCurrentPage(1)); // Reset to first page when category changes
            }}
            onStatusChange={(value) => {
                dispatch(setStatusFilter(value));
                dispatch(setCurrentPage(1)); // Reset to first page when status changes
            }}
            onClearFilters={() => dispatch(clearFilters())}
            onStatusToggle={handleStatusToggle}
            onStockUpdateClick={handleStockUpdateClick}
            stockUpdateOpen={stockUpdateOpen}
            productToUpdateStock={productToUpdateStock}
            onStockUpdate={handleStockUpdate}
            onStockUpdateCancel={handleStockUpdateCancel}
            isUpdatingStock={isUpdatingStock}
            onImageUpload={handleImageUpload}
            imageUploadLoading={isUploadingImage}
            // Pagination props
            currentPage={pagination.currentPage}
            totalPages={totalPages}
            totalProducts={totalProducts}
            onPageChange={handlePageChange}
            categories={categories || []}
        />
    );
};

export default SellerDashboardContainer;
