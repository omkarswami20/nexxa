import React, { memo } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Container
} from '@mui/material';
import { Link } from 'react-router-dom';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';

import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../../store/slices/auth.slice';

import ProductBrowsingContainer from '../../containers/customer/ProductBrowsingContainer';

const LandingPageView = () => {
    const token = useSelector(selectCurrentToken);
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Product Browsing Section - Only show when LOGGED IN */}
            {token && (
                <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
                    <ProductBrowsingContainer />
                </Container>
            )}

            {/* Seller / Customer / Admin Section - Only show when NOT logged in */}
            {!token && (
                <Box sx={{ py: 10 }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                Join Our Ecosystem
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Choose your role and get started today
                            </Typography>
                        </Box>

                        <Grid container spacing={6} justifyContent="center">
                            {/* Seller Card */}
                            <Grid item xs={12} md={4}>
                                <Paper
                                    elevation={0}
                                    sx={cardStyle('primary')}
                                >
                                    <Box sx={iconStyle('#2563eb', '#eff6ff', '#dbeafe')}>
                                        <StorefrontIcon sx={{ fontSize: 48 }} />
                                    </Box>

                                    <Typography variant="h4" fontWeight={700} gutterBottom>
                                        Sell with Us
                                    </Typography>

                                    <Typography sx={descStyle}>
                                        Scale your business with powerful tools to manage products,
                                        orders, and growth.
                                    </Typography>

                                    <Box sx={{ width: '100%', mt: 'auto' }}>
                                        <Button
                                            component={Link}
                                            to="/seller/login"
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            sx={primaryBtn}
                                        >
                                            Seller Login
                                        </Button>

                                        <Button
                                            component={Link}
                                            to="/seller/register"
                                            variant="text"
                                            fullWidth
                                            sx={textBtn}
                                        >
                                            Create Seller Account
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Customer Card */}
                            <Grid item xs={12} md={4}>
                                <Paper
                                    elevation={0}
                                    sx={cardStyle('info')}
                                >
                                    <Box sx={iconStyle('#0284c7', '#e0f2fe', '#bae6fd')}>
                                        <PersonIcon sx={{ fontSize: 48 }} />
                                    </Box>

                                    <Typography variant="h4" fontWeight={700} gutterBottom>
                                        Shop as Customer
                                    </Typography>

                                    <Typography sx={descStyle}>
                                        Browse products, add to cart, place orders, and track deliveries
                                        easily.
                                    </Typography>

                                    <Box sx={{ width: '100%', mt: 'auto' }}>
                                        <Button
                                            component={Link}
                                            to="/login"
                                            variant="contained"
                                            color="info"
                                            fullWidth
                                            size="large"
                                            sx={primaryBtn}
                                        >
                                            Customer Login
                                        </Button>

                                        <Button
                                            component={Link}
                                            to="/register"
                                            variant="text"
                                            fullWidth
                                            sx={textBtn}
                                        >
                                            Create Customer Account
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Admin Card */}
                            <Grid item xs={12} md={4}>
                                <Paper
                                    elevation={0}
                                    sx={cardStyle('secondary')}
                                >
                                    <Box sx={iconStyle('#db2777', '#fdf2f8', '#fce7f3')}>
                                        <AdminPanelSettingsIcon sx={{ fontSize: 48 }} />
                                    </Box>

                                    <Typography variant="h4" fontWeight={700} gutterBottom>
                                        Admin Portal
                                    </Typography>

                                    <Typography sx={descStyle}>
                                        Manage sellers, monitor platform activity, and control system
                                        operations.
                                    </Typography>

                                    <Box sx={{ width: '100%', mt: 'auto' }}>
                                        <Button
                                            component={Link}
                                            to="/admin/login"
                                            variant="contained"
                                            color="secondary"
                                            fullWidth
                                            size="large"
                                            sx={primaryBtn}
                                        >
                                            Access Dashboard
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            )}
        </Box>
    );
};

/* ===================== */
/* Reusable Styles */
/* ===================== */

const cardStyle = (color) => ({
    p: 6,
    height: '100%',
    borderRadius: 4,
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(226,232,240,0.8)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-10px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        borderColor: `${color}.main`
    },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
});

const iconStyle = (color, from, to) => ({
    mb: 4,
    p: 3,
    borderRadius: '50%',
    color,
    background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
});

const descStyle = {
    mb: 5,
    maxWidth: 320,
    lineHeight: 1.7,
    color: 'text.secondary'
};

const primaryBtn = {
    mb: 2,
    py: 1.5,
    borderRadius: 2,
    fontWeight: 600,
    textTransform: 'none'
};

const textBtn = {
    textTransform: 'none',
    fontWeight: 500
};

export default memo(LandingPageView);
