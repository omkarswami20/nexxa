import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProductByIdQuery, useSetCartItemQuantityMutation } from '../../store/api/api.slice';
import ProductDetailView from './ProductDetailView';

const ProductDetailContainer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [addToCartError, setAddToCartError] = useState(null);

    const { data: product, isLoading, error } = useGetProductByIdQuery(id);
    const [setCartItemQuantity, { isLoading: isAddingToCart }] = useSetCartItemQuantityMutation();

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1) return;
        if (product && newQuantity > product.stockQuantity) {
            setAddToCartError(`Only ${product.stockQuantity} items available in stock`);
            return;
        }
        setQuantity(newQuantity);
        setAddToCartError(null);
    };

    const handleAddToCart = async () => {
        if (!product) return;

        if (product.stockQuantity < quantity) {
            setAddToCartError(`Only ${product.stockQuantity} items available in stock`);
            return;
        }

        try {
            setAddToCartError(null);
            await setCartItemQuantity({ productId: product.id, quantity }).unwrap();
            navigate('/cart');
        } catch (err) {
            setAddToCartError(err?.data?.message || 'Failed to add item to cart');
        }
    };

    return (
        <ProductDetailView
            product={product}
            isLoading={isLoading}
            error={error}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
            isAddingToCart={isAddingToCart}
            addToCartError={addToCartError}
        />
    );
};

export default ProductDetailContainer;

