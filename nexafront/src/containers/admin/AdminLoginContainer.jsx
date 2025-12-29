import React, { useState } from 'react';
import { useLoginAdminMutation } from '../../store/api/api.slice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/auth.slice';
import { useNavigate } from 'react-router-dom';
import AdminLoginView from './AdminLoginView';

const AdminLoginContainer = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginAdmin, { isLoading, isError, error }] = useLoginAdminMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = await loginAdmin({ email, password }).unwrap();
            dispatch(setCredentials({ user: email, token: userData.token, role: 'admin' }));
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    return (
        <AdminLoginView
            email={email}
            password={password}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isError={isError}
            error={error}
        />
    );
};

export default AdminLoginContainer;
