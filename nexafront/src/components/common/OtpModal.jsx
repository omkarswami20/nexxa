import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, Alert } from '@mui/material';

const OtpModal = ({ open, onClose, email, mobile, onVerifyEmail, onVerifyMobile, onResendOtp, isLoading, error, hideEmailSection = false }) => {
    const [emailOtp, setEmailOtp] = useState('');
    const [mobileOtp, setMobileOtp] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [mobileVerified, setMobileVerified] = useState(false);

    // Timer State
    const [emailTimer, setEmailTimer] = useState(60);
    const [mobileTimer, setMobileTimer] = useState(60);

    React.useEffect(() => {
        let emailInterval;
        if (emailTimer > 0 && !emailVerified) {
            emailInterval = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(emailInterval);
    }, [emailTimer, emailVerified]);

    React.useEffect(() => {
        let mobileInterval;
        if (mobileTimer > 0 && !mobileVerified) {
            mobileInterval = setInterval(() => setMobileTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(mobileInterval);
    }, [mobileTimer, mobileVerified]);

    const handleVerifyEmail = async () => {
        if (emailOtp) {
            await onVerifyEmail(email, emailOtp);
            setEmailVerified(true);
        }
    };

    const handleVerifyMobile = async () => {
        if (mobileOtp) {
            await onVerifyMobile(mobile, mobileOtp);
            setMobileVerified(true);
        }
    };

    const handleResend = (type) => {
        if (onResendOtp) {
            onResendOtp(type);
            if (type === 'email') setEmailTimer(60);
            if (type === 'mobile') setMobileTimer(60);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Verify Your Account</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {hideEmailSection 
                        ? `Please enter the OTP sent to your mobile number.` 
                        : `Please enter the OTPs sent to your email and mobile number.`}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Email OTP Section */}
                {!hideEmailSection && (
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">Email Verification ({email})</Typography>
                        <Button
                            variant="text"
                            size="small"
                            disabled={emailTimer > 0 || emailVerified}
                            onClick={() => handleResend('email')}
                        >
                            {emailTimer > 0 ? `Resend in ${emailTimer}s` : 'Resend OTP'}
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Email OTP"
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value)}
                            disabled={emailVerified}
                        />
                        <Button
                            variant="contained"
                            onClick={handleVerifyEmail}
                            disabled={!emailOtp || emailVerified || isLoading}
                        >
                            {emailVerified ? 'Verified' : 'Verify'}
                        </Button>
                    </Box>
                </Box>
                )}

                {/* Mobile OTP Section */}
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">Mobile Verification ({mobile})</Typography>
                        <Button
                            variant="text"
                            size="small"
                            disabled={mobileTimer > 0 || mobileVerified}
                            onClick={() => handleResend('mobile')}
                        >
                            {mobileTimer > 0 ? `Resend in ${mobileTimer}s` : 'Resend OTP'}
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Mobile OTP"
                            value={mobileOtp}
                            onChange={(e) => setMobileOtp(e.target.value)}
                            disabled={mobileVerified}
                        />
                        <Button
                            variant="contained"
                            onClick={handleVerifyMobile}
                            disabled={!mobileOtp || mobileVerified || isLoading}
                        >
                            {mobileVerified ? 'Verified' : 'Verify'}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                {(hideEmailSection ? mobileVerified : (emailVerified && mobileVerified)) && (
                    <Button variant="contained" color="success" onClick={onClose}>
                        Continue to Login
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default OtpModal;
