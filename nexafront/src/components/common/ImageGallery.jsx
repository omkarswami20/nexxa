import React, { useState } from 'react';
import {
    Box,
    Card,
    CardMedia,
    IconButton,
    Dialog,
    DialogContent,
    Zoom,
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const ImageGallery = ({ imageUrl, productName }) => {
    const [zoomOpen, setZoomOpen] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleZoomOpen = () => setZoomOpen(true);
    const handleZoomClose = () => setZoomOpen(false);

    const fullImageUrl = imageUrl
        ? (imageUrl.startsWith('http') ? imageUrl : `http://localhost:8080/uploads/products/${imageUrl}`)
        : 'https://via.placeholder.com/500x500?text=No+Image';

    return (
        <>
            <Box sx={{ position: 'relative' }}>
                <MotionCard
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        position: 'relative',
                        bgcolor: 'grey.50',
                    }}
                >
                    {imageLoading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'grey.100',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 50,
                                    height: 50,
                                    border: '3px solid',
                                    borderColor: 'primary.main',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    '@keyframes spin': {
                                        '0%': { transform: 'rotate(0deg)' },
                                        '100%': { transform: 'rotate(360deg)' },
                                    },
                                }}
                            />
                        </Box>
                    )}
                    <CardMedia
                        component="img"
                        height="500"
                        image={fullImageUrl}
                        alt={productName || 'Product'}
                        onLoad={() => setImageLoading(false)}
                        sx={{
                            objectFit: 'contain',
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.02)',
                            },
                        }}
                        onClick={handleZoomOpen}
                    />
                    <IconButton
                        onClick={handleZoomOpen}
                        sx={{
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 1)',
                            },
                        }}
                    >
                        <ZoomInIcon />
                    </IconButton>
                </MotionCard>
            </Box>

            <Dialog
                open={zoomOpen}
                onClose={handleZoomClose}
                maxWidth="lg"
                fullWidth
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                        boxShadow: 'none',
                    },
                }}
            >
                <DialogContent sx={{ p: 0, position: 'relative' }}>
                    <IconButton
                        onClick={handleZoomClose}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            zIndex: 1,
                            color: 'white',
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Box
                        component="img"
                        src={fullImageUrl}
                        alt={productName || 'Product'}
                        sx={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '90vh',
                            objectFit: 'contain',
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ImageGallery;

