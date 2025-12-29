import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const SellerRegisterView = ({
    formData,
    onChange,
    onSubmit,
    isLoading,
    isSuccess,
    isError,
    error
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <Box sx={{ maxWidth: 550, mx: 'auto', mt: 6 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Typography variant="h4" align="center" gutterBottom fontWeight="600" sx={{ mb: 1 }}>
                    Seller Registration
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
                    Join NexaShop and start selling today
                </Typography>

                {isSuccess && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Registration successful! Please wait for admin approval. You can try logging in once approved.
                    </Alert>
                )}
                {isError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error?.data?.message || error?.data || 'Registration failed. Please try again.'}
                    </Alert>
                )}

                <form onSubmit={onSubmit}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        margin="normal"
                        required
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={onChange}
                        margin="normal"
                        required
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Mobile Number"
                        name="mobile"
                        value={formData.mobile}
                        onChange={onChange}
                        margin="normal"
                        required
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={onChange}
                        margin="normal"
                        required
                        variant="outlined"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Store Name"
                        name="storeName"
                        value={formData.storeName}
                        onChange={onChange}
                        margin="normal"
                        required
                        variant="outlined"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ mt: 4, mb: 3, py: 1.5 }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Seller Account'}
                    </Button>

                    <Box textAlign="center">
                        <Link to="/seller/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>
                                Already have an account? <span style={{ fontWeight: 500 }}>Login here</span>
                            </Typography>
                        </Link>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default SellerRegisterView;
