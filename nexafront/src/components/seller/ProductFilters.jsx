import React from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const ProductFilters = ({
    search,
    category,
    status,
    categories = [],
    onSearchChange,
    onCategoryChange,
    onStatusChange,
    onClearFilters,
}) => {
    return (
        <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            label="Category"
                            onChange={(e) => onCategoryChange(e.target.value)}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.id || cat} value={cat.name || cat}>
                                    {cat.name || cat}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            label="Status"
                            onChange={(e) => onStatusChange(e.target.value)}
                        >
                            <MenuItem value="">All Status</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={onClearFilters}
                        size="small"
                    >
                        Clear
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProductFilters;

