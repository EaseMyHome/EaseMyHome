import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Button, Typography, Stack, Card, CardContent, CardMedia, CardActions,
  IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Switch, Grid, Divider, LinearProgress
} from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { setCategories, addAuditLog } from '../../../redux/common/dataSlice';
import { useToast } from '../../../components/common/ToastProvider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import * as yup from 'yup';
import apiClient from '../../../services/common/api';
import './Categories.css';

const schema = yup.object().shape({
  name: yup.string().required('Category Name is required'),
  image: yup.string().url('Must be a valid image URL').required('Image URL is required'),
  status: yup.string().default('Active'),
});

const Categories = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { categories, services } = useSelector((state) => state.data);
  const currentUser = useSelector((state) => state.auth.user);
  const fileInputRef = useRef(null);

  // States
  const [searchText, setSearchText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formName, setFormName] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formPreviewUrl, setFormPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      if (response.status === 200) {
        dispatch(setCategories(response.data));
      } else {
        showToast('Failed to fetch categories from server', 'error');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) => 
    cat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormImageUrl('');
    setFormPreviewUrl('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.name || '');
    setFormImageUrl(cat.image || '');
    setFormPreviewUrl(cat.image || '');
    setDialogOpen(true);
  };

  const handleImageFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => setFormPreviewUrl(reader.result);
    reader.readAsDataURL(file);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'categories');
      const response = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = response.data;
      if (data.status === 'SUCCESS') {
        setFormImageUrl(data.url);
        setFormPreviewUrl(data.url);
        showToast('Image uploaded!', 'success');
      } else {
        // fallback to base64
        const r = new FileReader();
        r.onloadend = () => setFormImageUrl(r.result);
        r.readAsDataURL(file);
      }
    } catch {
      const r = new FileReader();
      r.onloadend = () => setFormImageUrl(r.result);
      r.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleStatusToggle = async (cat) => {
    try {
      const response = await apiClient.patch(`/categories/${cat.id}/status`);
      if (response.status === 200) {
        fetchCategories();
        dispatch(addAuditLog({
          user: currentUser?.email || 'admin@easemyhome.com',
          action: `Toggled category ${cat.name} availability status`,
          module: 'Category Management'
        }));
        showToast(`Category availability updated for ${cat.name}`, 'success');
      } else {
        showToast('Failed to update category status', 'error');
      }
    } catch (err) {
      showToast('Network error updating category status', 'error');
    }
  };

  const handleDeleteClick = (cat) => {
    setCategoryToDelete(cat);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        const response = await apiClient.delete(`/categories/${categoryToDelete.id}`);
        if (response.status === 200) {
          fetchCategories();
          dispatch(addAuditLog({
            user: currentUser?.email || 'admin@easemyhome.com',
            action: `Deleted category ${categoryToDelete.name}`,
            module: 'Category Management'
          }));
          showToast(`Category ${categoryToDelete.name} deleted.`, 'success');
          setDeleteConfirmOpen(false);
          setCategoryToDelete(null);
        } else {
          showToast('Failed to delete category', 'error');
        }
      } catch (err) {
        showToast('Network error deleting category', 'error');
      }
    }
  };

  const onSubmit = async () => {
    if (!formName.trim()) { showToast('Category name is required', 'error'); return; }
    if (!formImageUrl) { showToast('Please upload a category image', 'error'); return; }
    const categoryData = { name: formName, image: formImageUrl, status: 'Active' };
    try {
      const response = editingCategory
        ? await apiClient.put(`/categories/${editingCategory.id}`, categoryData)
        : await apiClient.post('/categories', categoryData);
      if (response.status === 200 || response.status === 201) {
        fetchCategories();
        dispatch(addAuditLog({
          user: currentUser?.email || 'admin@easemyhome.com',
          action: editingCategory ? `Updated category ${formName}` : `Created new category ${formName}`,
          module: 'Category Management'
        }));
        showToast(`Category ${editingCategory ? 'updated' : 'created'} successfully!`, 'success');
        setDialogOpen(false);
      } else {
        showToast('Failed to save category', 'error');
      }
    } catch (err) {
      showToast('Network error saving category', 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Category Management"
        subtitle="Manage service sectors. Create catalog categories, upload thumbnails, and disable directories."
        searchValue={searchText}
        onSearchChange={setSearchText}
        onAddClick={handleOpenAdd}
        addLabel="Create Category"
      />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {filteredCategories.map((cat) => {
          const catServicesCount = services.filter((s) => s.categoryId === cat.id).length;
          return (
            <Grid key={cat.id} item xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={cat.image}
                  alt={cat.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{cat.name}</Typography>
                    <Chip 
                      label={cat.status} 
                      size="small" 
                      color={cat.status === 'Active' ? 'success' : 'default'} 
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Total Services: {catServicesCount}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={cat.status === 'Active'} 
                        onChange={() => handleStatusToggle(cat)}
                        color="success"
                        size="small"
                      />
                    }
                    label="Enabled"
                    slotProps={{ typography: { variant: 'caption', fontWeight: 600 } }}
                  />
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEdit(cat)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(cat)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Add / Edit Category Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {/* Image Upload */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Category Image *</Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: formPreviewUrl ? 'success.main' : 'primary.main',
                  borderRadius: 2,
                  minHeight: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  bgcolor: formPreviewUrl ? 'success.50' : 'grey.50'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {formPreviewUrl ? (
                  <>
                    <img src={formPreviewUrl} alt="Preview" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                    <Box sx={{ position: 'absolute', bottom: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: 1, px: 1, py: 0.3, fontSize: '0.7rem' }}>Click to change</Box>
                  </>
                ) : (
                  <Stack alignItems="center" spacing={0.5} sx={{ p: 2 }}>
                    <UploadFileIcon sx={{ fontSize: 32, color: 'primary.main', opacity: 0.7 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>Upload from PC</Typography>
                  </Stack>
                )}
              </Box>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageFileSelect} />
              {uploading && <LinearProgress sx={{ mt: 1 }} />}
            </Box>
            <TextField
              required
              fullWidth
              label="Category Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={onSubmit} variant="contained" disabled={uploading}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Category?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category "{categoryToDelete?.name}"? All associated services will lose their category parent.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
