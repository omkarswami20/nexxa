import React, { useMemo } from 'react';
import { useGetCartQuery, useSetCartItemQuantityMutation, useRemoveCartItemMutation } from '../../store/api/api.slice';
import CartView from './CartView';
import { useNavigate } from 'react-router-dom';

const CartContainer = () => {
    const { data: items = [], isLoading } = useGetCartQuery();
    const [setQty] = useSetCartItemQuantityMutation();
    const [removeItem] = useRemoveCartItemMutation();
    const navigate = useNavigate();

    const totalQty = useMemo(() => items.reduce((s, it) => s + (it.quantity || 0), 0), [items]);
    
    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => {
            const product = item.product;
            if (product && product.price) {
                return sum + (parseFloat(product.price) * (item.quantity || 0));
            }
            return sum;
        }, 0);
    }, [items]);

    const handleInc = async (pId, q) => {
        try {
            await setQty({ productId: pId, quantity: q + 1 }).unwrap();
        } catch (err) {
            console.error('Failed to update quantity:', err);
        }
    };

    const handleDec = async (pId, q) => {
        try {
            await setQty({ productId: pId, quantity: Math.max(0, q - 1) }).unwrap();
        } catch (err) {
            console.error('Failed to update quantity:', err);
        }
    };

    const handleRemove = async (pId) => {
        try {
            await removeItem(pId).unwrap();
        } catch (err) {
            console.error('Failed to remove item:', err);
        }
    };

    return (
        <CartView
            items={items}
            isLoading={isLoading}
            totalQty={totalQty}
            totalAmount={totalAmount}
            onIncrease={handleInc}
            onDecrease={handleDec}
            onRemove={handleRemove}
            onCheckout={() => navigate('/checkout')}
        />
    );
};

export default CartContainer;

