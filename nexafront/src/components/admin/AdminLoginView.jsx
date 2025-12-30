import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const AdminLoginView = ({
    email,
    password,
    onEmailChange,
    onPasswordChange,
    onSubmit,
    isLoading,
    isError,
    error
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <Box sx={{ maxWidth: 450, mx: 'auto', mt: 8 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Typography variant="h4" align="center" gutterBottom fontWeight="600" sx={{ mb: 1 }}>
                    Admin Portal
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
                    Secure access for administrators only
                </Typography>

                {isError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error?.data?.message || error?.data || 'Access Denied.'}
                    </Alert>
                )}

                <form onSubmit={onSubmit}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        margin="normal"
                        required
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => onPasswordChange(e.target.value)}
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
                        color="secondary"
                        size="large"
                        sx={{ mt: 4, mb: 2, py: 1.5 }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login to Dashboard'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default AdminLoginView;
