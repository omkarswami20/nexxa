import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, Alert } from '@mui/material';

const OtpModal = ({ open, onClose, email, mobile, onVerifyEmail, onVerifyMobile, isLoading, error }) => {
    const [emailOtp, setEmailOtp] = useState('');
    const [mobileOtp, setMobileOtp] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [mobileVerified, setMobileVerified] = useState(false);

    const handleVerifyEmail = async () => {
        if (emailOtp) {
            await onVerifyEmail(email, emailOtp);
            setEmailVerified(true); // Ideally wait for promise to resolve, but container handles real status
        }
    };

    const handleVerifyMobile = async () => {
        if (mobileOtp) {
            await onVerifyMobile(mobile, mobileOtp);
            setMobileVerified(true);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Verify Your Account</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please enter the OTPs sent to your email and mobile number.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Email OTP Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>Email Verification ({email})</Typography>
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

                {/* Mobile OTP Section */}
                <Box>
                    <Typography variant="subtitle2" gutterBottom>Mobile Verification ({mobile})</Typography>
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
                {(emailVerified && mobileVerified) && (
                    <Button variant="contained" color="success" onClick={onClose}>
                        Continue to Login
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default OtpModal;
