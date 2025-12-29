import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Grid, Alert } from '@mui/material';
import { useVerifyCustomerEmailOtpMutation, useVerifyCustomerMobileOtpMutation } from '../store/api/api.slice';
import { useNavigate } from 'react-router-dom';

const VerifyOtp = ({ mode = 'email' }) => {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [verifyEmail, emailState] = useVerifyCustomerEmailOtpMutation();
  const [verifyMobile, mobileState] = useVerifyCustomerMobileOtpMutation();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    let res;
    if (mode === 'mobile') {
      res = await verifyMobile({ mobile, otp });
    } else {
      res = await verifyEmail({ email, otp });
    }
    if (!res.error) navigate('/');
  };

  const err = mode === 'mobile' ? mobileState.error : emailState.error;
  const isLoading = mode === 'mobile' ? mobileState.isLoading : emailState.isLoading;
  const isError = mode === 'mobile' ? mobileState.isError : emailState.isError;

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 480 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Verify {mode === 'mobile' ? 'Mobile' : 'Email'} OTP</Typography>
      {isError && <Alert severity="error">{err?.data?.message || 'Verification failed'}</Alert>}
      <Grid container spacing={2}>
        {mode === 'mobile' ? (
          <Grid item xs={12}><TextField label="Mobile" fullWidth size="small" value={mobile} onChange={(e)=>setMobile(e.target.value)} required /></Grid>
        ) : (
          <Grid item xs={12}><TextField label="Email" type="email" fullWidth size="small" value={email} onChange={(e)=>setEmail(e.target.value)} required /></Grid>
        )}
        <Grid item xs={12}><TextField label="OTP" fullWidth size="small" value={otp} onChange={(e)=>setOtp(e.target.value)} required /></Grid>
      </Grid>
      <Button type="submit" variant="contained" disabled={isLoading} sx={{ mt: 2 }}>Verify</Button>
    </Box>
  );
};

export default VerifyOtp;
