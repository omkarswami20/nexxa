import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    IconButton,
    Badge,
    Typography,
    Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentToken, selectCurrentRole } from '../../store/slices/auth.slice';
import { useGetCartQuery } from '../../store/api/api.apislice';

const MobileMenu = ({ open, onClose }) => {
    const token = useSelector(selectCurrentToken);
    const role = useSelector(selectCurrentRole);
    const navigate = useNavigate();
    const location = useLocation();
    const { data: cartItems = [] } = useGetCartQuery(undefined, { skip: !token || role !== 'customer' });
    const cartItemCount = (cartItems || []).reduce((sum, item) => sum + (item?.quantity || 0), 0);
    
    const isActiveRoute = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 300,
                },
            }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>
                        Menu
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>
            <List sx={{ pt: 1 }}>
                <ListItemButton 
                    component={Link} 
                    to="/" 
                    onClick={onClose}
                    selected={isActiveRoute('/') && location.pathname === '/'}
                    sx={{
                        '&.Mui-selected': {
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.light',
                            },
                        },
                    }}
                >
                    <ListItemIcon>
                        <HomeIcon color={isActiveRoute('/') && location.pathname === '/' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>

                {token && role === 'customer' && (
                    <>
                        <ListItemButton 
                            onClick={() => handleNavigate('/cart')}
                            selected={isActiveRoute('/cart')}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>
                                <Badge badgeContent={cartItemCount} color="error">
                                    <ShoppingCartIcon color={isActiveRoute('/cart') ? 'primary' : 'inherit'} />
                                </Badge>
                            </ListItemIcon>
                            <ListItemText primary="Cart" />
                        </ListItemButton>
                        <ListItemButton 
                            onClick={() => handleNavigate('/orders')}
                            selected={isActiveRoute('/orders')}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>
                                <PersonIcon color={isActiveRoute('/orders') ? 'primary' : 'inherit'} />
                            </ListItemIcon>
                            <ListItemText primary="My Orders" />
                        </ListItemButton>
                        <ListItemButton 
                            onClick={() => handleNavigate('/customer/profile')}
                            selected={isActiveRoute('/customer/profile')}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>
                                <PersonIcon color={isActiveRoute('/customer/profile') ? 'primary' : 'inherit'} />
                            </ListItemIcon>
                            <ListItemText primary="My Profile" />
                        </ListItemButton>
                    </>
                )}

                {token && role === 'seller' && (
                    <ListItemButton onClick={() => handleNavigate('/seller/dashboard')}>
                        <ListItemIcon>
                            <StorefrontIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                )}

                {token && role === 'admin' && (
                    <ListItemButton onClick={() => handleNavigate('/admin/dashboard')}>
                        <ListItemIcon>
                            <AdminPanelSettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                )}

                {!token && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        <ListItemButton component={Link} to="/login" onClick={onClose}>
                            <ListItemText primary="Customer Login" />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/register" onClick={onClose}>
                            <ListItemText primary="Register" />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/seller/login" onClick={onClose}>
                            <ListItemText primary="Seller Login" />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/admin/login" onClick={onClose}>
                            <ListItemText primary="Admin Portal" />
                        </ListItemButton>
                    </>
                )}
            </List>
        </Drawer>
    );
};

export default MobileMenu;

