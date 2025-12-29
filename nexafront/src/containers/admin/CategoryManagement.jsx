import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    Paper,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Folder as FolderIcon,
} from '@mui/icons-material';
import {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} from '../../store/api/api.slice';

const CategoryManagement = () => {
    const { data: categories, isLoading, error } = useGetCategoriesQuery();
    const [createCategory] = useCreateCategoryMutation();
    const [updateCategory] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    const handleOpenDialog = (category = null) => {
        setEditingCategory(category);
        setFormData({
            name: category ? category.name : '',
            description: category ? category.description : '',
        });
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async () => {
        try {
            if (editingCategory) {
                await updateCategory({
                    id: editingCategory.id,
                    ...formData,
                }).unwrap();
                showNotification('Category updated successfully');
            } else {
                await createCategory({
                    ...formData,
                }).unwrap();
                showNotification('Category created successfully');
            }
            handleCloseDialog();
        } catch (err) {
            showNotification('Failed to save category', 'error');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(id).unwrap();
                showNotification('Category deleted successfully');
            } catch (err) {
                showNotification('Failed to delete category', 'error');
                console.error(err);
            }
        }
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
        setTimeout(() => setNotification({ ...notification, open: false }), 3000);
    };

    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">Error loading categories</Alert>;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h2">
                    Category Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Category
                </Button>
            </Box>

            {notification.open && (
                <Alert severity={notification.severity} sx={{ mb: 2 }}>
                    {notification.message}
                </Alert>
            )}

            <Paper elevation={2}>
                <List>
                    {categories && categories.map((category) => (
                        <ListItem
                            key={category.id}
                            sx={{
                                borderBottom: '1px solid #eee',
                                '&:hover': { bgcolor: '#f5f5f5' },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                <Box sx={{ mr: 2, color: 'primary.main' }}>
                                    <FolderIcon />
                                </Box>
                                <ListItemText
                                    primary={category.name}
                                    secondary={category.description}
                                />
                            </Box>
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="edit"
                                    onClick={() => handleOpenDialog(category)}
                                    size="small"
                                    sx={{ mr: 1 }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleDelete(category.id)}
                                    size="small"
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                    {categories && categories.length === 0 && (
                        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                            No categories found. Create one to get started.
                        </Box>
                    )}
                </List>
            </Paper>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Add Category'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Category Name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!formData.name}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CategoryManagement;
