import { useState } from 'react';
import { useRegisterCustomerMutation, useVerifyCustomerEmailOtpMutation, useVerifyCustomerMobileOtpMutation, useResendOtpMutation } from '../../store/api/api.apislice';
import CustomerRegisterView from '../../components/customer/CustomerRegisterView';
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
    const [resendOtp] = useResendOtpMutation();

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
            // Extract mobile-specific message from various possible API error shapes
            const data = err?.data || {};
            let mobileMsg;
            if (data?.errors && data.errors.mobile) {
                mobileMsg = data.errors.mobile;
            } else if (Array.isArray(data?.errors) && data.errors.length) {
                const mobileErrorObj = data.errors.find((x) => x.field === 'mobile' || /mobile/i.test(x?.field || '') || /mobile/i.test(x?.message || ''));
                if (mobileErrorObj) mobileMsg = mobileErrorObj.message || String(mobileErrorObj);
            } else if (data?.message && /mobile/i.test(data.message)) {
                mobileMsg = data.message;
            } else if (err?.error && /mobile/i.test(err.error)) {
                mobileMsg = err.error;
            }

            if (mobileMsg) {
                setFieldErrors({ mobile: mobileMsg });
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

    const handleResendOtp = async (type) => {
        const identifier = type === 'mobile' ? formData.mobile : formData.email;
        if (!identifier) return;
        try {
            await resendOtp({ identifier, type }).unwrap();
            console.log(`Resent OTP to ${type}: ${identifier}`);
        } catch (err) {
            console.error(`Failed to resend ${type} OTP`, err);
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
                    onResendOtp={handleResendOtp}
                    isLoading={isVerifyingEmail || isVerifyingMobile}
                    error={(emailError?.data?.message || mobileError?.data?.message)}
                />
            )}
        </>
    );
};

export default CustomerRegisterContainer;

