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
        <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
            <AppBar 
                position="sticky" 
                elevation={scrolled ? 4 : 0}
                sx={{ 
                    bgcolor: scrolled ? 'background.paper' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ py: 1 }}>
                        {/* Mobile Menu Button */}
                        <IconButton
                            onClick={() => setMobileMenuOpen(true)}
                            sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: 'text.primary' }}
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
                                fontWeight: 700,
                                letterSpacing: '0.02em',
                                color: 'text.primary',
                                textDecoration: 'none',
                                flexGrow: { xs: 1, md: 0 },
                                fontSize: { xs: '1rem', md: '1.25rem' },
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
                                sx={{ display: { xs: 'none', md: 'flex' }, mr: 1.5, color: 'primary.main' }}
                            >
                                <Badge badgeContent={cartItemCount} color="error">
                                    <ShoppingBagIcon />
                                </Badge>
                            </IconButton>
                        )}

                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5, ml: 'auto', alignItems: 'center' }}>
                            {!token ? (
                                <>
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to="/customer/login"
                                        sx={{
                                            color: isActiveRoute('/customer/login') ? 'primary.main' : 'text.primary',
                                            fontWeight: isActiveRoute('/customer/login') ? 600 : 400,
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            }
                                        }}
                                    >
                                        Customer Login
                                    </Button>
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to="/customer/register"
                                        sx={{
                                            color: isActiveRoute('/customer/register') ? 'primary.main' : 'text.primary',
                                            fontWeight: isActiveRoute('/customer/register') ? 600 : 400,
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            }
                                        }}
                                    >
                                        Register
                                    </Button>
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to="/seller/login"
                                        sx={{
                                            color: isActiveRoute('/seller/login') ? 'primary.main' : 'text.primary',
                                            fontWeight: isActiveRoute('/seller/login') ? 600 : 400,
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            }
                                        }}
                                    >
                                        Seller Login
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        component={Link}
                                        to="/admin/login"
                                        sx={{
                                            fontWeight: isActiveRoute('/admin/login') ? 600 : 400,
                                        }}
                                    >
                                        Admin Portal
                                    </Button>
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
                                        sx={{ color: 'text.primary' }}
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
                                                border: '1px solid',
                                                borderColor: 'divider',
                                            }
                                        }}
                                    >
                                        {role === 'customer' && [
                                            <MenuItem key="profile" onClick={() => { handleClose(); navigate('/customer/profile'); }}>My Profile</MenuItem>,
                                            <MenuItem key="orders" onClick={() => { handleClose(); navigate('/orders'); }}>My Orders</MenuItem>,
                                            <MenuItem key="cart" onClick={() => { handleClose(); navigate('/cart'); }}>
                                                My Cart {cartItemCount > 0 && `(${cartItemCount})`}
                                            </MenuItem>,
                                            <Divider key="divider" />
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

            <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
                <Container maxWidth="xl">
                    <Outlet />
                </Container>
            </Box>

            <Box
                component="footer"
                sx={{
                    py: 3,
                    mt: 'auto',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                }}
            >
                <Container maxWidth="sm">
                    <Typography variant="body2" color="text.secondary" align="center">
                        {'Copyright © '}
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>
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
