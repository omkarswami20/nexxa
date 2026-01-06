import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Menu, MenuItem, Divider, Badge, useScrollTrigger, Slide } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentToken, selectCurrentRole, logout } from '../../store/slices/auth.slice';
import { useGetCartQuery } from '../../store/api/api.apislice';
import MobileMenu from '../common/MobileMenu';
import { motion } from 'framer-motion';

const NavLink = ({ to, label, isActive, activeColor }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Box
            component={Link}
            to={to}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                position: 'relative',
                color: isActive || isHovered ? activeColor : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                px: 2,
                py: 1,
                transition: 'color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {label}
            {(isActive || isHovered) && (
                <Box
                    component={motion.div}
                    layoutId="nav-underline"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: '2px',
                        bgcolor: activeColor,
                        width: '100%',
                    }}
                />
            )}
        </Box>
    );
};

const Layout = () => {
    const token = useSelector(selectCurrentToken);
    const role = useSelector(selectCurrentRole);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    const { data: cartItems = [] } = useGetCartQuery(undefined, { skip: !token || role !== 'customer' });
    const cartItemCount = (cartItems || []).reduce((sum, item) => sum + (item?.quantity || 0), 0);
    
    const isActiveRoute = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        handleClose();
        navigate('/');
    };

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a' }}>
            <AppBar 
                position="sticky" 
                elevation={scrolled ? 4 : 0}
                sx={{ 
                    bgcolor: scrolled ? 'rgba(15, 23, 42, 0.9)' : 'transparent',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid',
                    borderColor: scrolled ? 'rgba(255,255,255,0.1)' : 'transparent',
                    transition: 'all 0.3s ease',
                    backgroundImage: 'none',
                    boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.1)' : 'none',
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ py: 1 }}>
                        {/* Mobile Menu Button */}
                        <IconButton
                            onClick={() => setMobileMenuOpen(true)}
                            sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: '#fff' }}
                        >
                            <MenuIcon />
                        </IconButton>

                        {/* Logo */}
                        <Typography
                            variant="h6"
                            noWrap
                            component={Link}
                            to="/"
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'flex' },
                                fontWeight: 800,
                                letterSpacing: '0.02em',
                                color: '#fff',
                                textDecoration: 'none',
                                flexGrow: { xs: 1, md: 0 },
                                fontSize: { xs: '1.25rem', md: '1.5rem' },
                                background: 'linear-gradient(to right, #fff, #94a3b8)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            NEXASHOP
                        </Typography>

                        {/* Cart Icon - Desktop */}
                        {token && role === 'customer' && (
                            <IconButton
                                component={Link}
                                to="/cart"
                                color="inherit"
                                sx={{ display: { xs: 'none', md: 'flex' }, mr: 1.5, color: '#fff' }}
                            >
                                <Badge badgeContent={cartItemCount} color="error">
                                    <ShoppingBagIcon />
                                </Badge>
                            </IconButton>
                        )}

                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, ml: 'auto', alignItems: 'center' }}>
                            {!token ? (
                                <>
                                    <NavLink 
                                        to="/admin/login" 
                                        label="Admin" 
                                        isActive={isActiveRoute('/admin/login')} 
                                        activeColor="#db2777" 
                                    />
                                    <NavLink 
                                        to="/customer/login" 
                                        label="Customer" 
                                        isActive={isActiveRoute('/customer/login')} 
                                        activeColor="#0ea5e9" 
                                    />
                                    <NavLink 
                                        to="/seller/login" 
                                        label="Seller" 
                                        isActive={isActiveRoute('/seller/login')} 
                                        activeColor="#6366f1" 
                                    />
                                </>
                            ) : (
                                <div>
                                    <IconButton
                                        size="large"
                                        aria-label="account of current user"
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        onClick={handleMenu}
                                        color="inherit"
                                        sx={{ color: '#fff' }}
                                    >
                                        <AccountCircle />
                                    </IconButton>
                                    <Menu
                                        id="menu-appbar"
                                        anchorEl={anchorEl}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}
                                        PaperProps={{
                                            sx: {
                                                mt: 1.5,
                                                minWidth: 200,
                                                bgcolor: '#1e293b',
                                                color: '#fff',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                '& .MuiMenuItem-root': {
                                                    '&:hover': {
                                                        bgcolor: 'rgba(255,255,255,0.05)',
                                                    },
                                                },
                                            }
                                        }}
                                    >
                                        {role === 'customer' && [
                                            <MenuItem key="profile" onClick={() => { handleClose(); navigate('/customer/profile'); }}>My Profile</MenuItem>,
                                            <MenuItem key="orders" onClick={() => { handleClose(); navigate('/orders'); }}>My Orders</MenuItem>,
                                            <MenuItem key="cart" onClick={() => { handleClose(); navigate('/cart'); }}>
                                                My Cart {cartItemCount > 0 && `(${cartItemCount})`}
                                            </MenuItem>,
                                            <Divider key="divider" sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                                        ]}
                                        {role === 'seller' && (
                                            <MenuItem onClick={() => { handleClose(); navigate('/seller/dashboard'); }}>Dashboard</MenuItem>
                                        )}
                                        {role === 'admin' && (
                                            <MenuItem onClick={() => { handleClose(); navigate('/admin/dashboard'); }}>Dashboard</MenuItem>
                                        )}
                                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                    </Menu>
                                </div>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

            <Box component="main" sx={{ flexGrow: 1, py: 0 }}>
                {/* Removed Container wrapper to allow full-width landing page */}
                <Outlet />
            </Box>

            <Box
                component="footer"
                sx={{
                    py: 3,
                    mt: 'auto',
                    borderTop: '1px solid',
                    borderColor: 'rgba(255,255,255,0.1)',
                    bgcolor: '#0f172a',
                    color: '#94a3b8'
                }}
            >
                <Container maxWidth="sm">
                    <Typography variant="body2" align="center">
                        {'Copyright © '}
                        <Link to="/" style={{ textDecoration: 'none', color: '#fff', fontWeight: 500 }}>
                            NexaShop
                        </Link>{' '}
                        {new Date().getFullYear()}
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;
