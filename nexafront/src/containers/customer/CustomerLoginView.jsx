import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const CustomerLoginView = ({
    formData,
    onChange,
    onSubmit,
    isLoading,
    isError,
    error,
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
                    Customer Login
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
                    Sign in to your account to continue shopping
                </Typography>

                {isError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error?.data?.message || error?.data || 'Login failed. Please check your credentials.'}
                    </Alert>
                )}

                <form onSubmit={onSubmit}>
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

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ mt: 4, mb: 3, py: 1.5 }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                    </Button>

                    <Box textAlign="center">
                        <Link to="/customer/register" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="body2" sx={{ mb: 1, '&:hover': { color: 'primary.main' } }}>
                                No account? <span style={{ fontWeight: 500 }}>Register here</span>
                            </Typography>
                        </Link>
                        <Link to="/customer/forgot-password" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>
                                Forgot password? <span style={{ fontWeight: 500 }}>Reset here</span>
                            </Typography>
                        </Link>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default CustomerLoginView;

