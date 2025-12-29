import React, { useState } from 'react';
import { useRegisterCustomerMutation, useVerifyCustomerEmailOtpMutation, useVerifyCustomerMobileOtpMutation } from '../../store/api/api.slice';
import CustomerRegisterView from './CustomerRegisterView';
import { useNavigate } from 'react-router-dom';

import OtpModal from '../../components/common/OtpModal';

const CustomerRegisterContainer = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '', // Ensure mobile is part of state
        password: '',
    });
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // Mutations for registration and verification
    const [registerCustomer, { isLoading, isSuccess, isError, error }] = useRegisterCustomerMutation();
    const [verifyEmail, { isLoading: isVerifyingEmail, error: emailError }] = useVerifyCustomerEmailOtpMutation();
    const [verifyMobile, { isLoading: isVerifyingMobile, error: mobileError }] = useVerifyCustomerMobileOtpMutation();

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerCustomer(formData).unwrap();
            // Show OTP modal instead of navigating immediately
            setShowOtpModal(true);
            setFieldErrors({});
        } catch (err) {
            const msg = err?.data?.message || err?.error || String(err);
            if (/mobile/i.test(msg) || /already.*registered/i.test(msg)) {
                setFieldErrors({ mobile: msg });
            }
            console.error('Failed to register:', err);
        }
    };

    const handleVerifyEmail = async (email, otp) => {
        try {
            await verifyEmail({ email, otp }).unwrap();
        } catch (err) {
            console.error("Email verification failed", err);
        }
    };

    const handleVerifyMobile = async (mobile, otp) => {
        try {
            await verifyMobile({ mobile, otp }).unwrap();
        } catch (err) {
            console.error("Mobile verification failed", err);
        }
    };

    const handleOtpClose = () => {
        setShowOtpModal(false);
        navigate('/customer/login'); // Or keep them here? User might close accidentally. 
        // For now, let's assume close = done or give up. 
        // Better UX: Only navigate if strictly verified, but modal handles "Continue to Login" button.
    };

    return (
        <>
            <CustomerRegisterView
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                isSuccess={isSuccess}
                isError={isError}
                error={error}
                fieldErrors={fieldErrors}
            />
            {showOtpModal && (
                <OtpModal
                    open={showOtpModal}
                    onClose={handleOtpClose}
                    email={formData.email}
                    mobile={formData.mobile}
                    onVerifyEmail={handleVerifyEmail}
                    onVerifyMobile={handleVerifyMobile}
                    isLoading={isVerifyingEmail || isVerifyingMobile}
                    error={(emailError?.data?.message || mobileError?.data?.message)}
                />
            )}
        </>
    );
};

export default CustomerRegisterContainer;

