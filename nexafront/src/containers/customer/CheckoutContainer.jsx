import React, { useState } from 'react';
import { useGetCartQuery, useCheckoutMutation, useGetAddressesQuery } from '../../store/api/api.slice';
import CheckoutView from './CheckoutView';
import { useNavigate } from 'react-router-dom';

const CheckoutContainer = () => {
    const { data: items = [] } = useGetCartQuery();
    const { data: addresses = [] } = useGetAddressesQuery();
    const [checkout, { isLoading, isError, error }] = useCheckoutMutation();
    const navigate = useNavigate();

    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0);
    const [newAddress, setNewAddress] = useState({
        name: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
    });

    const handleAddressSelectionChange = (value) => {
        if (value === 'new') {
            setUseNewAddress(true);
            setSelectedAddressId('');
        } else {
            setUseNewAddress(false);
            setSelectedAddressId(value);
        }
    };

    const handleNewAddressChange = (field, value) => {
        setNewAddress((prev) => ({ ...prev, [field]: value }));
    };

    const handlePlaceOrder = async () => {
        try {
            const payload = useNewAddress
                ? { address: newAddress }
                : { addressId: parseInt(selectedAddressId) };

            const res = await checkout(payload).unwrap();
            navigate(`/orders/${res.id}`);
        } catch (err) {
            console.error('Checkout failed:', err);
        }
    };

    const totalAmount = items.reduce((sum, item) => {
        const product = item.product;
        if (product && product.price) {
            return sum + parseFloat(product.price) * (item.quantity || 0);
        }
        return sum;
    }, 0);

    return (
        <CheckoutView
            items={items}
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            useNewAddress={useNewAddress}
            newAddress={newAddress}
            onAddressSelectionChange={handleAddressSelectionChange}
            onNewAddressChange={handleNewAddressChange}
            onPlaceOrder={handlePlaceOrder}
            isLoading={isLoading}
            isError={isError}
            error={error}
            totalAmount={totalAmount}
        />
    );
};

export default CheckoutContainer;

