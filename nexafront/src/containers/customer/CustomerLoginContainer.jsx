import React, { useState } from 'react';
import { useLoginCustomerMutation, useVerifyCustomerEmailOtpMutation, useVerifyCustomerMobileOtpMutation, useResendOtpMutation } from '../../store/api/api.apislice';
import CustomerLoginView from '../../components/customer/CustomerLoginView';
import VerificationRequiredModal from '../../components/common/VerificationRequiredModal';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/auth.slice';
import { useNavigate } from 'react-router-dom';

const CustomerLoginContainer = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState({
        emailVerified: false,
        mobileVerified: false,
        accountStatus: 'PENDING',
        email: '',
        mobile: '',
    });
    
    const [loginCustomer, { isLoading, isError, error }] = useLoginCustomerMutation();
    const [verifyEmail, { isLoading: isVerifyingEmail }] = useVerifyCustomerEmailOtpMutation();
    const [verifyMobile, { isLoading: isVerifyingMobile }] = useVerifyCustomerMobileOtpMutation();
    const [resendOtp] = useResendOtpMutation();
    
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
            // Check if error is VERIFICATION_REQUIRED
            if (err?.data?.error === 'VERIFICATION_REQUIRED' || err?.error === 'VERIFICATION_REQUIRED') {
                const errorData = err?.data || err;
                setVerificationStatus({
                    emailVerified: errorData.emailVerified || false,
                    mobileVerified: errorData.mobileVerified || false,
                    accountStatus: errorData.accountStatus || 'PENDING',
                    email: errorData.email || formData.email,
                    mobile: errorData.mobile || '',
                });
                setShowVerificationModal(true);
            } else {
                console.error('Failed to login:', err);
            }
        }
    };

    const handleVerifyEmail = async (email, otp) => {
        try {
            await verifyEmail({ email, otp }).unwrap();
            // Update verification status
            setVerificationStatus(prev => ({ ...prev, emailVerified: true }));
            // If all verified, try to login again
            if (verificationStatus.mobileVerified || !verificationStatus.mobile) {
                setTimeout(() => {
                    handleSubmit({ preventDefault: () => {} });
                }, 1000);
            }
        } catch (err) {
            throw err;
        }
    };

    const handleVerifyMobile = async (mobile, otp) => {
        try {
            await verifyMobile({ mobile, otp }).unwrap();
            // Update verification status
            setVerificationStatus(prev => ({ ...prev, mobileVerified: true }));
            // If all verified, try to login again
            if (verificationStatus.emailVerified) {
                setTimeout(() => {
                    handleSubmit({ preventDefault: () => {} });
                }, 1000);
            }
        } catch (err) {
            throw err;
        }
    };

    const handleResendOtp = async (type) => {
        const identifier = type === 'mobile' ? verificationStatus.mobile : verificationStatus.email;
        if (!identifier) return;
        try {
            await resendOtp({ identifier, type }).unwrap();
        } catch (err) {
            throw err;
        }
    };

    const handleCloseModal = () => {
        setShowVerificationModal(false);
        // If all verified and account is active, try login again
        if (verificationStatus.emailVerified && verificationStatus.mobileVerified && verificationStatus.accountStatus === 'ACTIVE') {
            handleSubmit({ preventDefault: () => {} });
        }
    };

    return (
        <>
            <CustomerLoginView
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                isError={isError && (!error?.data?.error || error?.data?.error !== 'VERIFICATION_REQUIRED')}
                error={error?.data?.error === 'VERIFICATION_REQUIRED' ? null : error}
            />
            {showVerificationModal && (
                <VerificationRequiredModal
                    open={showVerificationModal}
                    onClose={handleCloseModal}
                    email={verificationStatus.email}
                    mobile={verificationStatus.mobile}
                    emailVerified={verificationStatus.emailVerified}
                    mobileVerified={verificationStatus.mobileVerified}
                    accountStatus={verificationStatus.accountStatus}
                    onVerifyEmail={handleVerifyEmail}
                    onVerifyMobile={handleVerifyMobile}
                    onResendOtp={handleResendOtp}
                    isLoading={isVerifyingEmail || isVerifyingMobile}
                    error={null}
                />
            )}
        </>
    );
};

export default CustomerLoginContainer;

