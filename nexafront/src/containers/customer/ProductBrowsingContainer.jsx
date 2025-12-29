import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllProductsQuery, useGetCategoriesQuery } from '../../store/api/api.slice';
import ProductBrowsingView from './ProductBrowsingView';
import { useNavigate } from 'react-router-dom';

const ProductBrowsingContainer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(12);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    const offset = (currentPage - 1) * pageSize;

    const { data: productsData, isLoading, error } = useGetAllProductsQuery({
        category: categoryFilter || undefined,
        search: searchFilter || undefined,
        limit: pageSize,
        offset: offset,
    });

    const { data: categories = [] } = useGetCategoriesQuery();

    // Extract products and pagination info
    const products = productsData?.products || (Array.isArray(productsData) ? productsData : []);
    const total = productsData?.total || products.length;
    const totalPages = Math.ceil(total / pageSize);

    const handlePageChange = (event, newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategoryChange = (category) => {
        setCategoryFilter(category);
        setCurrentPage(1);
    };

    const handleSearchChange = (search) => {
        setSearchFilter(search);
        setCurrentPage(1);
    };

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
    };

    return (
        <ProductBrowsingView
            products={products}
            categories={categories}
            isLoading={isLoading}
            error={error}
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            categoryFilter={categoryFilter}
            searchFilter={searchFilter}
            onPageChange={handlePageChange}
            onCategoryChange={handleCategoryChange}
            onSearchChange={handleSearchChange}
            onProductClick={handleProductClick}
        />
    );
};

export default ProductBrowsingContainer;

