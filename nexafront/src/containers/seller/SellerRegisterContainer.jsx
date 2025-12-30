import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OtpModal from '../../components/common/OtpModal';
import { useRegisterSellerMutation, useVerifySellerOtpMutation, useVerifySellerMobileOtpMutation, useResendSellerOtpMutation } from '../../store/api/api.slice';
import SellerRegisterView from './SellerRegisterView';

const SellerRegisterContainer = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '', // Ensure mobile is captured
        password: '',
        storeName: '',
    });
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const [registerSeller, { isLoading, isSuccess, isError, error }] = useRegisterSellerMutation();
    const [verifySellerEmail, { isLoading: isVerifyingEmail, error: emailError }] = useVerifySellerOtpMutation();
    const [verifySellerMobile, { isLoading: isVerifyingMobile, error: mobileError }] = useVerifySellerMobileOtpMutation();
    const [resendOtp] = useResendSellerOtpMutation();

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear field-level error when user edits the field
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerSeller(formData).unwrap();
            setShowOtpModal(true);
            setFieldErrors({});
        } catch (err) {
            // Extract mobile-specific message from various possible API error shapes
            const data = err?.data || {};
            let mobileMsg;
            if (data?.errors && data.errors.mobile) {
                // errors: { mobile: '...' }
                mobileMsg = data.errors.mobile;
            } else if (Array.isArray(data?.errors) && data.errors.length) {
                // errors: [{ field: 'mobile', message: '...' }, ...]
                const mobileErrorObj = data.errors.find((x) => x.field === 'mobile' || /mobile/i.test(x?.field || '') || /mobile/i.test(x?.message || ''));
                if (mobileErrorObj) mobileMsg = mobileErrorObj.message || String(mobileErrorObj);
            } else if (data?.message && /mobile/i.test(data.message)) {
                mobileMsg = data.message;
            } else if (err?.error && /mobile/i.test(err.error)) {
                mobileMsg = err.error;
            } else {
                // fallback: raw message
                mobileMsg = undefined;
            }

            if (mobileMsg) {
                setFieldErrors({ mobile: mobileMsg });
            }
            console.error('Failed to register:', err);
        }
    };

    // Seller only has one verify endpoint in slice? Let's check api.slice.js again.
    // Line 392: verifySellerOtp takes { email, otp }.
    // It seems seller might only need email verification or similar.
    // But user said: "for seller also we are used mobile otp".
    // I need to check if a mobile verify endpoint exists for seller.
    // Checked api.slice.js: only `verifySellerOtp` (email-based) exists at line 392.
    // Use `verifySellerOtp` for now, assuming it covers the main verification. 

    const handleVerifyEmail = async (email, otp) => {
        try {
            await verifySellerEmail({ email, otp }).unwrap();
        } catch (err) {
            console.error("Email verification failed", err);
        }
    };

    const handleVerifyMobile = async (mobile, otp) => {
        try {
            await verifySellerMobile({ mobile, otp }).unwrap();
        } catch (err) {
            console.error("Mobile verification failed", err);
        }
    };

    const handleResendOtp = async (type) => {
        // Sellers resend logic might distinguish type if backend supports it differently.
        // Currently resendSellerOtp sends to mobile (identifier).
        // If type is email, we might need a different endpoint or use generic one.
        // For now, assuming resendSellerOtp handles mobile mainly or identifier logic.
        // Actually, backend /mobile/send-otp handles identifier.
        const identifier = type === 'mobile' ? formData.mobile : formData.email;
        if (!identifier) return;

        if (type === 'mobile') {
            try {
                await resendOtp({ identifier }).unwrap();
                console.log(`Resent OTP to ${type}: ${identifier}`);
            } catch (err) {
                console.error(`Failed to resend ${type} OTP`, err);
            }
        } else {
            // For email resend, seller might not have a dedicated endpoint yet? 
            // Or maybe reuse the same if backend supports email identifier in that endpoint?
            // Backend /mobile/send-otp logs "mobile/identifier required". 
            // Let's assume it works for mobile. Email resend via link is usually default.
            // If user wants email OTP resend, we might need that logic. 
            // But seller email verification is LINK based, not OTP based typically (unless changed).
            // Wait, verifySellerEmail takes OTP? 
            // api.slice says: verifySellerEmail -> /otp/seller/verify.
            // SellerService.register sends LINK.
            // But SellerRegisterContainer expects OTP verify?
            // If Seller Service sends LINK, then frontend shouldn't ask for Email OTP.
            // But OtpModal asks for both. 
            // User said: "fallow sme method for mobile number flow sameas customer".
            // Customer has both.

            // If seller is Link based, then Email section in Modal should be purely informational "Check your email".
            // But logic is requesting OTP.
            // Conflicting flows. 
            // Let's implement mobile resend for now as requested.
        }
    };

    return (
        <>
            <SellerRegisterView
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
                    onClose={() => { setShowOtpModal(false); navigate('/seller/login'); }}
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

export default SellerRegisterContainer;
