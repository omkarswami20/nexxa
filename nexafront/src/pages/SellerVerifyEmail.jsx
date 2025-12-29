import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVerifySellerEmailMutation } from '../store/api/api.slice';
import { Box, Typography, CircularProgress, Alert, Container, Button } from '@mui/material';

const SellerVerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [verifyEmail, { isLoading, isSuccess, isError, error }] = useVerifySellerEmailMutation();

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        }
    }, [token, verifyEmail]);

    return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
            <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Typography variant="h4" gutterBottom>
                    Email Verification
                </Typography>

                {isLoading && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress />
                        <Typography>Verifying your email...</Typography>
                    </Box>
                )}

                {isSuccess && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Alert severity="success" sx={{ width: '100%' }}>
                            Email verified successfully! Your account is now Pending Approval.
                        </Alert>
                        <Button variant="contained" onClick={() => navigate('/seller/login')}>
                            Go to Login
                        </Button>
                    </Box>
                )}

                {isError && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Alert severity="error" sx={{ width: '100%' }}>
                            Verification failed. The link may be invalid or expired.
                        </Alert>
                        {error?.data?.message && <Typography color="error">{error.data.message}</Typography>}
                        <Button variant="outlined" onClick={() => navigate('/seller/login')}>
                            Back to Login
                        </Button>
                    </Box>
                )}

                {!token && !isLoading && (
                    <Alert severity="warning">
                        No verification token found. Please check your email link.
                    </Alert>
                )}
            </Box>
        </Container>
    );
};

export default SellerVerifyEmail;
