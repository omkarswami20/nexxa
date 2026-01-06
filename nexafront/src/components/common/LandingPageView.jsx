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

const RoleCard = ({ title, description, icon: Icon, to, gradient, delay, buttonColor }) => (
    <Grid item xs={12} md={4}>
        <MotionPaper
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ 
                scale: 1.03,
                y: -5,
                boxShadow: `0 20px 40px -10px ${buttonColor}40` // Soft glow matching brand color
            }}
            sx={cardStyle}
        >
            <MotionBox 
                sx={iconWrapperStyle(gradient)}
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <Icon sx={{ fontSize: 40, color: '#fff' }} />
            </MotionBox>

            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff', mb: 2 }}>
                {title}
            </Typography>

            <Typography sx={descStyle}>
                {description}
            </Typography>

            <Button
                component={Link}
                to={to}
                variant="contained"
                fullWidth
                sx={actionBtnStyle(buttonColor)}
            >
                {title === 'Admin Portal' ? 'Access Dashboard' : `Login as ${title.replace(' Zone', '')}`}
            </Button>
        </MotionPaper>
    </Grid>
);

const LandingPageView = () => {
    const token = useSelector(selectCurrentToken);
    return (
        <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', bgcolor: '#0f172a' }}>
            {/* Animated Background Gradient */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
                    zIndex: 0,
                }}
            />
            
            {/* Decorative Blobs */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '40%',
                    height: '40%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
                    filter: 'blur(100px)',
                    opacity: 0.2,
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-10%',
                    width: '40%',
                    height: '40%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                    filter: 'blur(100px)',
                    opacity: 0.2,
                    zIndex: 0,
                }}
            />

            {/* Product Browsing Section - Only show when LOGGED IN */}
            {token && (
                <Container maxWidth="xl" sx={{ mt: 4, mb: 8, position: 'relative', zIndex: 1 }}>
                    <ProductBrowsingContainer />
                </Container>
            )}

            {/* Seller / Customer / Admin Section - Only show when NOT logged in */}
            {!token && (
                <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1, py: 8 }}>
                    <Container maxWidth="xl">
                        <Box sx={{ mb: 8, textAlign: 'center' }}>
                            <Typography
                                variant="h3"
                                fontWeight={800}
                                gutterBottom
                                sx={{
                                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 2,
                                }}
                            >
                                Choose Your Path
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#94a3b8', maxWidth: 600, mx: 'auto', fontWeight: 400, letterSpacing: '0.01em' }}>
                                One platform. Three roles. Fully connected ecosystem.
                            </Typography>
                        </Box>

                        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                            <RoleCard 
                                title="Admin Portal"
                                description="System control and platform monitoring."
                                icon={AdminPanelSettingsIcon}
                                to="/admin/login"
                                gradient="linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
                                buttonColor="#db2777"
                                delay={0.1}
                            />
                            <RoleCard 
                                title="Customer"
                                description="Shop, track orders, and manage profile."
                                icon={PersonIcon}
                                to="/login"
                                gradient="linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
                                buttonColor="#0284c7"
                                delay={0.2}
                            />
                            <RoleCard 
                                title="Seller Zone"
                                description="Manage products, orders, and earnings."
                                icon={StorefrontIcon}
                                to="/seller/login"
                                gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                                buttonColor="#4f46e5"
                                delay={0.3}
                            />
                        </Grid>

                        {/* Trust Strip */}
                        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center', gap: { xs: 2, md: 6 }, flexWrap: 'wrap', opacity: 0.7 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
                                <Typography variant="body2">🔒 Secure Platform</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
                                <Typography variant="body2">⚡ Fast Performance</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
                                <Typography variant="body2">🏆 Trusted Marketplace</Typography>
                            </Box>
                        </Box>

                        {/* UX Guidance */}
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, color: '#64748b' }}>
                            Tip: You can also switch roles using the top navigation.
                        </Typography>
                    </Container>
                </Box>
            )}
        </Box>
    );
};

/* ===================== */
/* Reusable Styles */
/* ===================== */

const cardStyle = {
    p: 4,
    height: '100%',
    borderRadius: 4,
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    // transition: 'all 0.3s ease', // Removed to let Framer Motion handle it
};

const iconWrapperStyle = (gradient) => ({
    mb: 3,
    p: 2,
    borderRadius: '20px',
    background: gradient,
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const descStyle = {
    mb: 4,
    color: '#94a3b8',
    lineHeight: 1.6,
    flexGrow: 1,
};

const actionBtnStyle = (color) => ({
    py: 1.5,
    bgcolor: color,
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '1rem',
    borderRadius: 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    '&:hover': {
        bgcolor: color,
        filter: 'brightness(1.1)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
    },
});

export default memo(LandingPageView);
