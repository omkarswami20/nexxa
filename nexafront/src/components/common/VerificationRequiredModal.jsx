import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    Paper,
    Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

const VerificationRequiredModal = ({
    open,
    onClose,
    email,
    mobile,
    emailVerified,
    mobileVerified,
    accountStatus,
    onVerifyEmail,
    onVerifyMobile,
    onResendOtp,
    isLoading,
    error,
    isSeller = false,
}) => {
    const [emailOtp, setEmailOtp] = useState('');
    const [mobileOtp, setMobileOtp] = useState('');
    const [emailError, setEmailError] = useState('');
    const [mobileError, setMobileError] = useState('');
    const [verificationStep, setVerificationStep] = useState(0);
    const [emailResendTimer, setEmailResendTimer] = useState(0);
    const [mobileResendTimer, setMobileResendTimer] = useState(0);

    useEffect(() => {
        if (open) {
            setEmailOtp('');
            setMobileOtp('');
            setEmailError('');
            setMobileError('');
            setEmailResendTimer(0);
            setMobileResendTimer(0);
            // Determine initial step based on verification status
            if (!emailVerified) {
                setVerificationStep(0);
            } else if (!mobileVerified && mobile) {
                setVerificationStep(1);
            } else {
                setVerificationStep(2);
            }
        }
    }, [open, emailVerified, mobileVerified, mobile]);
    
    // Timer countdown for email resend
    useEffect(() => {
        let interval;
        if (emailResendTimer > 0) {
            interval = setInterval(() => {
                setEmailResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [emailResendTimer]);
    
    // Timer countdown for mobile resend
    useEffect(() => {
        let interval;
        if (mobileResendTimer > 0) {
            interval = setInterval(() => {
                setMobileResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [mobileResendTimer]);

    const handleVerifyEmail = async () => {
        if (!emailOtp.trim()) {
            setEmailError('Please enter OTP');
            return;
        }
        setEmailError('');
        try {
            await onVerifyEmail(email, emailOtp);
            // Move to next step if email verification succeeds
            if (!mobileVerified && mobile) {
                setVerificationStep(1);
            }
        } catch (err) {
            setEmailError(err?.data?.message || 'Invalid or expired OTP');
        }
    };

    const handleVerifyMobile = async () => {
        if (!mobileOtp.trim()) {
            setMobileError('Please enter OTP');
            return;
        }
        setMobileError('');
        try {
            await onVerifyMobile(mobile, mobileOtp);
            setVerificationStep(2);
        } catch (err) {
            setMobileError(err?.data?.message || 'Invalid or expired OTP');
        }
    };

    const handleResendEmailOtp = async () => {
        if (emailResendTimer > 0) return; // Prevent resend during cooldown
        
        try {
            await onResendOtp('email');
            setEmailError('');
            setEmailResendTimer(120); // 2 minutes cooldown
        } catch (err) {
            setEmailError(err?.data?.message || 'Failed to resend OTP. Please try again.');
        }
    };

    const handleResendMobileOtp = async () => {
        if (mobileResendTimer > 0) return; // Prevent resend during cooldown
        
        try {
            await onResendOtp('mobile');
            setMobileError('');
            setMobileResendTimer(120); // 2 minutes cooldown
        } catch (err) {
            setMobileError(err?.data?.message || 'Failed to resend OTP. Please try again.');
        }
    };
    
    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const steps = [
        { label: 'Email Verification', completed: emailVerified },
        { label: 'Mobile Verification', completed: mobileVerified },
        { label: 'Complete', completed: emailVerified && mobileVerified },
    ];

    const allVerified = emailVerified && mobileVerified;
    const isPendingAdminApproval = accountStatus === 'PENDING_APPROVAL' || accountStatus === 'PENDING_ADMIN_APPROVAL';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h6" fontWeight="600">
                    Verification Required
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Please complete verification to access your account.
                    </Alert>

                    <Stepper activeStep={verificationStep} sx={{ mb: 4 }}>
                        {steps.map((step, index) => (
                            <Step key={step.label} completed={step.completed}>
                                <StepLabel>{step.label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Email Verification Section */}
                    {!emailVerified && (
                        isSeller ? (
                            <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="subtitle1" fontWeight="600">
                                        Verify Email
                                    </Typography>
                                </Box>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    Check your email ({email}) for the verification link. Click the link in your email to verify your account.
                                </Alert>
                                <Typography variant="body2" color="text.secondary">
                                    If you haven't received the email, please check your spam folder or contact support.
                                </Typography>
                            </Paper>
                        ) : (
                            <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="subtitle1" fontWeight="600">
                                        Verify Email
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Enter the OTP sent to {email}
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Email OTP"
                                    value={emailOtp}
                                    onChange={(e) => {
                                        setEmailOtp(e.target.value);
                                        setEmailError('');
                                    }}
                                    error={!!emailError}
                                    helperText={emailError}
                                    disabled={isLoading}
                                    sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleVerifyEmail}
                                        disabled={isLoading || !emailOtp.trim()}
                                        startIcon={isLoading ? <CircularProgress size={20} /> : null}
                                    >
                                        Verify Email
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        onClick={handleResendEmailOtp} 
                                        disabled={isLoading || emailResendTimer > 0}
                                    >
                                        {emailResendTimer > 0 ? `Resend in ${formatTimer(emailResendTimer)}` : 'Resend OTP'}
                                    </Button>
                                </Box>
                            </Paper>
                        )
                    )}

                    {emailVerified && (
                        <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'success.main', bgcolor: 'success.light' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                                <Typography variant="body1" fontWeight="500">
                                    Email verified
                                </Typography>
                            </Box>
                        </Paper>
                    )}

                    {/* Mobile Verification Section */}
                    {((isSeller && !mobileVerified && mobile) || (!isSeller && emailVerified && !mobileVerified && mobile)) && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="subtitle1" fontWeight="600">
                                        Verify Mobile
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Enter the OTP sent to {mobile}
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Mobile OTP"
                                    value={mobileOtp}
                                    onChange={(e) => {
                                        setMobileOtp(e.target.value);
                                        setMobileError('');
                                    }}
                                    error={!!mobileError}
                                    helperText={mobileError}
                                    disabled={isLoading}
                                    sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleVerifyMobile}
                                        disabled={isLoading || !mobileOtp.trim()}
                                        startIcon={isLoading ? <CircularProgress size={20} /> : null}
                                    >
                                        Verify Mobile
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        onClick={handleResendMobileOtp} 
                                        disabled={isLoading || mobileResendTimer > 0}
                                    >
                                        {mobileResendTimer > 0 ? `Resend in ${formatTimer(mobileResendTimer)}` : 'Resend OTP'}
                                    </Button>
                                </Box>
                            </Paper>
                        </>
                    )}

                    {mobileVerified && mobile && (
                        <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'success.main', bgcolor: 'success.light' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                                <Typography variant="body1" fontWeight="500">
                                    Mobile verified
                                </Typography>
                            </Box>
                        </Paper>
                    )}

                    {/* All Verified - Show Status */}
                    {allVerified && (
                        <Paper elevation={0} sx={{ p: 3, mt: 2, bgcolor: 'success.light' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
                                <Typography variant="h6" fontWeight="600" color="success.dark">
                                    All Verifications Complete!
                                </Typography>
                                {isPendingAdminApproval ? (
                                    <Alert severity="warning" sx={{ width: '100%' }}>
                                        Your account is pending admin approval. You will be able to login once approved.
                                    </Alert>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        You can now login to your account.
                                    </Typography>
                                )}
                            </Box>
                        </Paper>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                {allVerified ? (
                    <Button onClick={onClose} variant="contained" color="primary">
                        Close
                    </Button>
                ) : (
                    <Button onClick={onClose} variant="outlined">
                        Cancel
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default VerificationRequiredModal;


