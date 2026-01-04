import React, { memo } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Container,
    Chip,
    Stack
} from '@mui/material';
import { Link } from 'react-router-dom';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SecurityIcon from '@mui/icons-material/Security';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { motion } from 'framer-motion';

import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../../store/slices/auth.slice';

import ProductBrowsingContainer from '../../containers/customer/ProductBrowsingContainer';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const LandingPageView = () => {
    const token = useSelector(selectCurrentToken);
    return (
        <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            {/* Animated Background Gradient */}
            {!token && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
                        backgroundSize: '400% 400%',
                        animation: 'gradientShift 15s ease infinite',
                        opacity: 0.05,
                        zIndex: 0,
                        '@keyframes gradientShift': {
                            '0%': { backgroundPosition: '0% 50%' },
                            '50%': { backgroundPosition: '100% 50%' },
                            '100%': { backgroundPosition: '0% 50%' },
                        },
                    }}
                />
            )}

            {/* Product Browsing Section - Only show when LOGGED IN */}
            {token && (
                <Container maxWidth="xl" sx={{ mt: 4, mb: 8, position: 'relative', zIndex: 1 }}>
                    <ProductBrowsingContainer />
                </Container>
            )}

            {/* Seller / Customer / Admin Section - Only show when NOT logged in */}
            {!token && (
                <Box sx={{ py: { xs: 6, md: 12 }, position: 'relative', zIndex: 1 }}>
                    <Container maxWidth="lg">
                        {/* Hero Section */}
                        <MotionBox
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            sx={{ textAlign: 'center', mb: 10 }}
                        >
                            <Typography
                                variant="h2"
                                fontWeight={800}
                                gutterBottom
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    mb: 2,
                                }}
                            >
                                Welcome to NexaShop
                            </Typography>
                            <Typography
                                variant="h5"
                                color="text.secondary"
                                sx={{ mb: 4, maxWidth: 600, mx: 'auto', fontWeight: 400 }}
                            >
                                Your one-stop marketplace for buying and selling. Join thousands of sellers and customers.
                            </Typography>

                            {/* Trust Badges */}
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                justifyContent="center"
                                sx={{ mb: 6 }}
                            >
                                <Chip
                                    icon={<SecurityIcon />}
                                    label="Secure Platform"
                                    sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }}
                                />
                                <Chip
                                    icon={<LocalShippingIcon />}
                                    label="Fast Delivery"
                                    sx={{ bgcolor: 'info.light', color: 'info.dark', fontWeight: 600 }}
                                />
                                <Chip
                                    icon={<ShoppingBagIcon />}
                                    label="1000+ Products"
                                    sx={{ bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 600 }}
                                />
                            </Stack>
                        </MotionBox>

                        {/* Role Selection Cards */}
                        <Box sx={{ mb: 8 }}>
                            <Typography
                                variant="h4"
                                fontWeight={700}
                                align="center"
                                gutterBottom
                                sx={{ mb: 1 }}
                            >
                                Join Our Ecosystem
                            </Typography>
                            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 6 }}>
                                Choose your role and get started today
                            </Typography>

                            <Grid container spacing={4} justifyContent="center">
                                {/* Seller Card */}
                                <Grid item xs={12} md={4}>
                                    <MotionPaper
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        whileHover={{ y: -8 }}
                                        elevation={0}
                                        sx={cardStyle('primary')}
                                    >
                                        <MotionBox
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                            sx={iconStyle('#2563eb', '#eff6ff', '#dbeafe')}
                                        >
                                            <StorefrontIcon sx={{ fontSize: 48 }} />
                                        </MotionBox>

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
                                    </MotionPaper>
                                </Grid>

                                {/* Customer Card */}
                                <Grid item xs={12} md={4}>
                                    <MotionPaper
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        whileHover={{ y: -8 }}
                                        elevation={0}
                                        sx={cardStyle('info')}
                                    >
                                        <MotionBox
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.5, delay: 0.4 }}
                                            sx={iconStyle('#0284c7', '#e0f2fe', '#bae6fd')}
                                        >
                                            <PersonIcon sx={{ fontSize: 48 }} />
                                        </MotionBox>

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
                                    </MotionPaper>
                                </Grid>

                                {/* Admin Card */}
                                <Grid item xs={12} md={4}>
                                    <MotionPaper
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        whileHover={{ y: -8 }}
                                        elevation={0}
                                        sx={cardStyle('secondary')}
                                    >
                                        <MotionBox
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.5, delay: 0.5 }}
                                            sx={iconStyle('#db2777', '#fdf2f8', '#fce7f3')}
                                        >
                                            <AdminPanelSettingsIcon sx={{ fontSize: 48 }} />
                                        </MotionBox>

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
                                    </MotionPaper>
                                </Grid>
                            </Grid>
                        </Box>
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
    p: { xs: 4, md: 6 },
    height: '100%',
    borderRadius: 4,
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(20px)',
    border: '2px solid',
    borderColor: 'rgba(226,232,240,0.5)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    '&:hover': {
        boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
        borderColor: `${color}.main`,
        background: 'rgba(255,255,255,1)',
    },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${color === 'primary' ? '#2563eb' : color === 'info' ? '#0284c7' : '#db2777'} 0%, transparent 100%)`,
        opacity: 0,
        transition: 'opacity 0.3s ease',
    },
    '&:hover::before': {
        opacity: 1,
    },
});

const iconStyle = (color, from, to) => ({
    mb: 4,
    p: 3,
    borderRadius: '50%',
    color,
    background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
    boxShadow: `0 8px 16px rgba(${color === '#2563eb' ? '37, 99, 235' : color === '#0284c7' ? '2, 132, 199' : '219, 39, 119'}, 0.2)`,
    transition: 'all 0.3s ease',
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
    textTransform: 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
    },
};

const textBtn = {
    textTransform: 'none',
    fontWeight: 500
};

export default memo(LandingPageView);
