import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Chip,
    Skeleton,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MotionCard = motion(Card);

const ProductCard = ({ product, index = 0 }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const navigate = useNavigate();

    const imageUrl = product.imageUrl
        ? `http://localhost:8080/uploads/products/${product.imageUrl}`
        : 'https://via.placeholder.com/400x300?text=No+Image';

    const handleClick = () => {
        navigate(`/products/${product.id}`);
    };

    return (
        <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            sx={{
                height: '100%',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                    boxShadow: 8,
                    borderColor: 'primary.main',
                },
            }}
            onClick={handleClick}
        >
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                {imageLoading && (
                    <Skeleton
                        variant="rectangular"
                        height={200}
                        sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}
                    />
                )}
                <CardMedia
                    component="img"
                    height="200"
                    image={imageUrl}
                    alt={product.name}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                        setImageError(true);
                        setImageLoading(false);
                    }}
                    sx={{
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                        display: imageLoading ? 'none' : 'block',
                    }}
                />
                {imageError && (
                    <Box
                        sx={{
                            height: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.100',
                            color: 'text.secondary',
                        }}
                    >
                        <Typography variant="body2">No Image</Typography>
                    </Box>
                )}
                <Chip
                    label={`Rs. ${product.price?.toFixed(2) || '0.00'}`}
                    color="primary"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 600,
                        boxShadow: 2,
                    }}
                />
            </Box>

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography
                    variant="h6"
                    noWrap
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        mb: 1,
                    }}
                >
                    {product.name}
                </Typography>

                {product.category && (
                    <Chip
                        label={product.category.name}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1.5, width: 'fit-content' }}
                    />
                )}

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flexGrow: 1,
                    }}
                >
                    {product.description || 'No description available'}
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 'auto',
                    }}
                >
                    <Typography
                        variant="caption"
                        color={product.stockQuantity > 0 ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 600 }}
                    >
                        {product.stockQuantity > 0
                            ? `${product.stockQuantity} in stock`
                            : 'Out of stock'}
                    </Typography>

                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                        disabled={product.stockQuantity === 0}
                    >
                        View
                    </Button>
                </Box>
            </CardContent>
        </MotionCard>
    );
};

export default ProductCard;

