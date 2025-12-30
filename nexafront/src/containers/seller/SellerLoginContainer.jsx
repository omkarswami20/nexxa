import React, { useState } from 'react';
import { useLoginSellerMutation, useVerifySellerOtpMutation, useVerifySellerMobileOtpMutation, useResendSellerOtpMutation } from '../../store/api/api.apislice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/auth.slice';
import { useNavigate } from 'react-router-dom';
import SellerLoginView from '../../components/seller/SellerLoginView';
import VerificationRequiredModal from '../../components/common/VerificationRequiredModal';

const SellerLoginContainer = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState({
        emailVerified: false,
        mobileVerified: false,
        accountStatus: 'PENDING_ADMIN_APPROVAL',
        email: '',
        mobile: '',
    });
    
    const [loginSeller, { isLoading, isError, error }] = useLoginSellerMutation();
    const [verifyEmail, { isLoading: isVerifyingEmail }] = useVerifySellerOtpMutation();
    const [verifyMobile, { isLoading: isVerifyingMobile }] = useVerifySellerMobileOtpMutation();
    const [resendOtp] = useResendSellerOtpMutation();
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = await loginSeller({ email, password }).unwrap();
            dispatch(setCredentials({ user: email, token: userData.token, role: 'seller' }));
            navigate('/seller/dashboard');
        } catch (err) {
            // Check if error is VERIFICATION_REQUIRED
            if (err?.data?.error === 'VERIFICATION_REQUIRED' || err?.error === 'VERIFICATION_REQUIRED') {
                const errorData = err?.data || err;
                setVerificationStatus({
                    emailVerified: errorData.emailVerified || false,
                    mobileVerified: errorData.mobileVerified || false,
                    accountStatus: errorData.accountStatus || 'PENDING_ADMIN_APPROVAL',
                    email: errorData.email || email,
                    mobile: errorData.mobile || '',
                });
                setShowVerificationModal(true);
            } else {
                console.error('Login failed:', err);
            }
        }
    };

    const handleVerifyEmail = async (email, otp) => {
        try {
            await verifyEmail({ email, otp }).unwrap();
            // Update verification status
            setVerificationStatus(prev => ({ ...prev, emailVerified: true }));
        } catch (err) {
            throw err;
        }
    };

    const handleVerifyMobile = async (mobile, otp) => {
        try {
            await verifyMobile({ mobile, otp }).unwrap();
            // Update verification status
            setVerificationStatus(prev => ({ ...prev, mobileVerified: true }));
            // For sellers, even after verification, they need admin approval
            // So we don't auto-retry login
        } catch (err) {
            throw err;
        }
    };

    const handleResendOtp = async (type) => {
        const identifier = type === 'mobile' ? verificationStatus.mobile : verificationStatus.email;
        if (!identifier) return;
        try {
            if (type === 'mobile') {
                await resendOtp({ identifier }).unwrap();
            } else {
                // Email resend for seller might need different endpoint
                // For now, seller email verification is link-based
                throw new Error('Email verification link should be resent from registration');
            }
        } catch (err) {
            throw err;
        }
    };

    const handleCloseModal = () => {
        setShowVerificationModal(false);
        // For sellers, even if verified, they need admin approval
        // So we don't auto-retry login
    };

    return (
        <>
            <SellerLoginView
                email={email}
                password={password}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
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
                    isSeller={true}
                />
            )}
        </>
    );
};

export default SellerLoginContainer;
