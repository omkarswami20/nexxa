import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Grid, Alert } from '@mui/material';
import { useRequestForgotPasswordMutation, useVerifyForgotPasswordMutation } from '../store/api/api.slice';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [requestForgot, reqState] = useRequestForgotPasswordMutation();
  const [verifyForgot, verState] = useVerifyForgotPasswordMutation();
  const navigate = useNavigate();

  const submitEmail = async (e) => {
    e.preventDefault();
    if (!email) return;
    const res = await requestForgot(email);
    if (!res.error) setStep(2);
  };

  const submitReset = async (e) => {
    e.preventDefault();
    const res = await verifyForgot({ email, otp, newPassword });
    if (!res.error) navigate('/customer/login');
  };

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Forgot Password</Typography>
      {step === 1 && (
        <Box component="form" onSubmit={submitEmail}>
          {reqState.isError && <Alert severity="error">{reqState.error?.data?.message || 'Failed to send OTP'}</Alert>}
          <TextField label="Email" type="email" fullWidth size="small" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <Button type="submit" variant="contained" disabled={reqState.isLoading} sx={{ mt: 2 }}>Send OTP</Button>
          <Typography sx={{ mt: 2 }}>
            Back to <Link to="/customer/login">Login</Link>
          </Typography>
        </Box>
      )}
      {step === 2 && (
        <Box component="form" onSubmit={submitReset}>
          {verState.isError && <Alert severity="error">{verState.error?.data?.message || 'Reset failed'}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField label="Email" type="email" fullWidth size="small" value={email} disabled /></Grid>
            <Grid item xs={12}><TextField label="OTP" fullWidth size="small" value={otp} onChange={(e)=>setOtp(e.target.value)} required /></Grid>
            <Grid item xs={12}><TextField label="New Password" type="password" fullWidth size="small" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required /></Grid>
          </Grid>
          <Button type="submit" variant="contained" disabled={verState.isLoading} sx={{ mt: 2 }}>Reset Password</Button>
        </Box>
      )}
    </Box>
  );
};

export default ForgotPassword;
