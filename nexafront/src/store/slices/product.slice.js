import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedProduct: null,
    filters: {
        category: '',
        search: '',
        status: '',
    },
    sortBy: 'name', // 'name', 'price', 'stock', 'createdAt'
    sortOrder: 'asc', // 'asc', 'desc'
    pagination: {
        currentPage: 1,
        pageSize: 5,
    },
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setSelectedProduct: (state, action) => {
            state.selectedProduct = action.payload;
        },
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },
        setCategoryFilter: (state, action) => {
            state.filters.category = action.payload;
        },
        setSearchFilter: (state, action) => {
            state.filters.search = action.payload;
        },
        setStatusFilter: (state, action) => {
            state.filters.status = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {
                category: '',
                search: '',
                status: '',
            };
            state.pagination.currentPage = 1; // Reset to first page when filters change
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },
        setSortOrder: (state, action) => {
            state.sortOrder = action.payload;
        },
        setCurrentPage: (state, action) => {
            state.pagination.currentPage = action.payload;
        },
        setPageSize: (state, action) => {
            state.pagination.pageSize = action.payload;
            state.pagination.currentPage = 1; // Reset to first page when page size changes
        },
        resetPagination: (state) => {
            state.pagination.currentPage = 1;
        },
        resetProductState: (state) => {
            return initialState;
        },
    },
});

export const {
    setSelectedProduct,
    clearSelectedProduct,
    setCategoryFilter,
    setSearchFilter,
    setStatusFilter,
    clearFilters,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setPageSize,
    resetPagination,
    resetProductState,
} = productSlice.actions;

export default productSlice.reducer;

// Selectors
export const selectSelectedProduct = (state) => state.product.selectedProduct;
export const selectProductFilters = (state) => state.product.filters;
export const selectSortBy = (state) => state.product.sortBy;
export const selectSortOrder = (state) => state.product.sortOrder;
export const selectPagination = (state) => state.product.pagination;
