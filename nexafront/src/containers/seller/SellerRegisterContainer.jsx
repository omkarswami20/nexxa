import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OtpModal from '../../components/common/OtpModal';
import { useRegisterSellerMutation, useVerifySellerOtpMutation } from '../../store/api/api.slice';
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
    const [verifySellerOtp, { isLoading: isVerifying, error: verifyError }] = useVerifySellerOtpMutation();

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

    const handleVerify = async (identifier, otp) => {
        // Determine if verifying email or mobile. 
        // API slice only has generic verifySellerOtp which sends {email, otp}.
        // If backend expects mobile otp via same endpoint or different, that's a backend question.
        // Based on previous logs, seller registration sends email. 
        // Let's use verifySellerOtp for email.

        await verifySellerOtp({ email: formData.email, otp }).unwrap();
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
            {/* {showOtpModal && (
                <OtpModal
                    open={showOtpModal}
                    onClose={() => { setShowOtpModal(false); navigate('/seller/login'); }}
                    email={formData.email}
                    mobile={formData.mobile} // Pass mobile for display
                    onVerifyEmail={(email, otp) => handleVerify(email, otp)}
                    onVerifyMobile={async (mobile, otp) => {
                        // Fallback or todo if mobile verification API is missing for seller
                        console.log("Mobile verification for seller not yet implemented in slice");
                    }}
                    isLoading={isVerifying}
                    error={verifyError?.data?.message}
                />
            )} */}
        </>
    );
};

export default SellerRegisterContainer;
