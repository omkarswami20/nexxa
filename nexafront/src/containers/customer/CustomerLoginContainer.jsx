import React, { useState } from 'react';
import { useLoginCustomerMutation } from '../../store/api/api.slice';
import CustomerLoginView from './CustomerLoginView';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/auth.slice';
import { useNavigate } from 'react-router-dom';

const CustomerLoginContainer = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loginCustomer, { isLoading, isError, error }] = useLoginCustomerMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await loginCustomer(formData).unwrap();
            if (res) {
                const accessToken = res.accessToken || res.token;
                const refreshToken = res.refreshToken;
                const user = res.user || { email: formData.email };
                dispatch(setCredentials({ user, token: accessToken, refreshToken, role: 'customer' }));
                navigate('/');
            }
        } catch (err) {
            console.error('Failed to login:', err);
        }
    };

    return (
        <CustomerLoginView
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isError={isError}
            error={error}
        />
    );
};

export default CustomerLoginContainer;

