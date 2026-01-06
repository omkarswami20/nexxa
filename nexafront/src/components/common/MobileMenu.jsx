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
                    bgcolor: '#1e293b',
                    color: '#fff',
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                },
            }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'rgba(255,255,255,0.1)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>
                        Menu
                    </Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}>
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
                        color: '#fff',
                        '&.Mui-selected': {
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.15)',
                            },
                        },
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.05)',
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: '#fff' }}>
                        <HomeIcon color={isActiveRoute('/') && location.pathname === '/' ? 'secondary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>

                {token && role === 'customer' && (
                    <>
                        <ListItemButton 
                            onClick={() => handleNavigate('/cart')}
                            selected={isActiveRoute('/cart')}
                            sx={{
                                color: '#fff',
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                    },
                                },
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: '#fff' }}>
                                <Badge badgeContent={cartItemCount} color="error">
                                    <ShoppingCartIcon color={isActiveRoute('/cart') ? 'secondary' : 'inherit'} />
                                </Badge>
                            </ListItemIcon>
                            <ListItemText primary="Cart" />
                        </ListItemButton>
                        <ListItemButton 
                            onClick={() => handleNavigate('/orders')}
                            selected={isActiveRoute('/orders')}
                            sx={{
                                color: '#fff',
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                    },
                                },
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: '#fff' }}>
                                <PersonIcon color={isActiveRoute('/orders') ? 'secondary' : 'inherit'} />
                            </ListItemIcon>
                            <ListItemText primary="My Orders" />
                        </ListItemButton>
                        <ListItemButton 
                            onClick={() => handleNavigate('/customer/profile')}
                            selected={isActiveRoute('/customer/profile')}
                            sx={{
                                color: '#fff',
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                    },
                                },
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: '#fff' }}>
                                <PersonIcon color={isActiveRoute('/customer/profile') ? 'secondary' : 'inherit'} />
                            </ListItemIcon>
                            <ListItemText primary="My Profile" />
                        </ListItemButton>
                    </>
                )}

                {token && role === 'seller' && (
                    <ListItemButton onClick={() => handleNavigate('/seller/dashboard')} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                        <ListItemIcon sx={{ color: '#fff' }}>
                            <StorefrontIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                )}

                {token && role === 'admin' && (
                    <ListItemButton onClick={() => handleNavigate('/admin/dashboard')} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                        <ListItemIcon sx={{ color: '#fff' }}>
                            <AdminPanelSettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                )}

                {!token && (
                    <>
                        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                        <ListItemButton component={Link} to="/admin/login" onClick={onClose} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                            <ListItemText primary="Admin" />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/customer/login" onClick={onClose} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                            <ListItemText primary="Customer" />
                        </ListItemButton>
                        <ListItemButton component={Link} to="/seller/login" onClick={onClose} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                            <ListItemText primary="Seller" />
                        </ListItemButton>
                    </>
                )}
            </List>
        </Drawer>
    );
};

export default MobileMenu;

