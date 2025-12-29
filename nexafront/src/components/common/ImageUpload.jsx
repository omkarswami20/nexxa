import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    CircularProgress,
    Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';

const ImageUpload = ({ value, onChange, onUpload, isLoading, error, maxSizeMB = 5 }) => {
    const [preview, setPreview] = useState(value || null);
    const [localError, setLocalError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setLocalError('Please select an image file');
            return;
        }

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            setLocalError(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        setLocalError(null);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload file if onUpload callback provided
        if (onUpload) {
            try {
                const result = await onUpload(file);
                if (result?.data?.url) {
                    onChange(result.data.url);
                }
            } catch (err) {
                setLocalError('Failed to upload image. Please try again.');
            }
        } else {
            // If no upload callback, just set the file
            onChange(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setLocalError(null);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Box>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {preview ? (
                <Box>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            position: 'relative',
                            display: 'inline-block',
                        }}
                    >
                        <Box
                            component="img"
                            src={preview}
                            alt="Preview"
                            sx={{
                                maxWidth: 200,
                                maxHeight: 200,
                                objectFit: 'contain',
                                display: 'block',
                            }}
                        />
                        <IconButton
                            size="small"
                            onClick={handleRemove}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'error.main',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'error.dark',
                                },
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Paper>
                    <Button
                        variant="outlined"
                        onClick={handleClick}
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 1 }}
                        disabled={isLoading}
                    >
                        Change Image
                    </Button>
                </Box>
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        border: '2px dashed',
                        borderColor: 'divider',
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover',
                        },
                    }}
                    onClick={handleClick}
                >
                    <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Click to upload or drag and drop
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        PNG, JPG, GIF up to {maxSizeMB}MB
                    </Typography>
                    {isLoading && (
                        <Box sx={{ mt: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                </Paper>
            )}

            {(error || localError) && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    {localError || error?.data?.message || 'An error occurred'}
                </Alert>
            )}
        </Box>
    );
};

export default ImageUpload;

