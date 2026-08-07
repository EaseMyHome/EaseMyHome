import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Button, Typography, Stack, Card, CardContent, CardMedia, CardActions,
  IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel, Grid, LinearProgress, Divider, Avatar
} from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { addAuditLog } from '../../../redux/common/dataSlice';
import { useToast } from '../../../components/common/ToastProvider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ImageIcon from '@mui/icons-material/Image';

import apiClient from '../../../services/common/api';
import './Banners.css';

const Banners = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const currentUser = useSelector((state) => state.auth.user);
  const fileInputRef = useRef(null);

  // State
  const [banners, setBanners] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formOrder, setFormOrder] = useState(1);
  const [formPreviewUrl, setFormPreviewUrl] = useState('');

  const fetchBanners = async () => {
    try {
      const response = await apiClient.get('/banners');
      if (response.status === 200) {
        setBanners(response.data);
      }
    } catch (err) {
      console.error('Error loading banners:', err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const filteredBanners = banners.filter((b) =>
    (b.title?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (b.subtitle?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  const resetForm = () => {
    setFormTitle('');
    setFormSubtitle('');
    setFormImageUrl('');
    setFormPreviewUrl('');
    setFormOrder(banners.length + 1);
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBanner(b);
    setFormTitle(b.title || '');
    setFormSubtitle(b.subtitle || '');
    setFormImageUrl(b.imageUrl || '');
    setFormPreviewUrl(b.imageUrl || '');
    setFormOrder(b.displayOrder || 1);
    setDialogOpen(true);
  };

  const handleImageFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(20);

    // Preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setFormPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'banners');
      setUploadProgress(50);
      const response = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadProgress(90);
      const data = response.data;
      if (data.status === 'SUCCESS') {
        setFormImageUrl(data.url);
        setFormPreviewUrl(data.url);
        showToast('Image uploaded successfully!', 'success');
      } else {
        showToast('Image upload failed, using local preview', 'warning');
        const reader2 = new FileReader();
        reader2.onloadend = () => {
          setFormImageUrl(reader2.result);
        };
        reader2.readAsDataURL(file);
      }
    } catch (err) {
      showToast('Network error during upload, using local preview', 'warning');
      const reader2 = new FileReader();
      reader2.onloadend = () => setFormImageUrl(reader2.result);
      reader2.readAsDataURL(file);
    } finally {
      setUploading(false);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleStatusToggle = async (b) => {
    try {
      const response = await apiClient.patch(`/banners/${b.id}/status`);
      if (response.status === 200) {
        fetchBanners();
        dispatch(addAuditLog({
          user: currentUser?.email || 'admin@easemyhome.com',
          action: `Toggled banner "${b.title}" status`,
          module: 'Banner Management'
        }));
        showToast(`Banner status updated`, 'success');
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  const handleDeleteClick = (b) => {
    setBannerToDelete(b);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (bannerToDelete) {
      try {
        const response = await apiClient.delete(`/banners/${bannerToDelete.id}`);
        if (response.status === 200) {
          fetchBanners();
          dispatch(addAuditLog({
            user: currentUser?.email || 'admin@easemyhome.com',
            action: `Deleted banner "${bannerToDelete.title}"`,
            module: 'Banner Management'
          }));
          showToast('Banner deleted successfully.', 'success');
          setDeleteConfirmOpen(false);
          setBannerToDelete(null);
        } else {
          showToast('Failed to delete banner', 'error');
        }
      } catch (err) {
        showToast('Network error deleting banner', 'error');
      }
    }
  };

  const handleSave = async () => {
    if (!formTitle.trim()) { showToast('Banner title is required', 'error'); return; }
    if (!formSubtitle.trim()) { showToast('Banner subtitle is required', 'error'); return; }
    if (!formImageUrl) { showToast('Please upload a banner image', 'error'); return; }

    const payload = {
      title: formTitle,
      subtitle: formSubtitle,
      imageUrl: formImageUrl,
      displayOrder: formOrder,
      status: editingBanner?.status || 'Active'
    };

    try {
      const response = editingBanner
        ? await apiClient.put(`/banners/${editingBanner.id}`, payload)
        : await apiClient.post('/banners', payload);

      if (response.status === 200 || response.status === 201) {
        fetchBanners();
        dispatch(addAuditLog({
          user: currentUser?.email || 'admin@easemyhome.com',
          action: editingBanner ? `Updated banner "${formTitle}"` : `Created banner "${formTitle}"`,
          module: 'Banner Management'
        }));
        showToast(`Banner ${editingBanner ? 'updated' : 'created'} successfully!`, 'success');
        setDialogOpen(false);
      } else {
        showToast('Failed to save banner', 'error');
      }
    } catch (err) {
      showToast('Network error saving banner', 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Homepage Banner Promos"
        subtitle="Manage client-app banner campaigns. Upload images from your PC, adjust ordering, and toggle visibility."
        searchValue={searchText}
        onSearchChange={setSearchText}
        onAddClick={handleOpenAdd}
        addLabel="Add Banner"
      />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {filteredBanners.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary', border: '1.5px dashed #cbd5e1', borderRadius: 3 }}>
              <ImageIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
              <Typography variant="body1">No banners created yet. Click "Add Banner" to get started.</Typography>
            </Box>
          </Grid>
        ) : (
          filteredBanners.map((b) => (
            <Grid key={b.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={b.imageUrl}
                  alt={b.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{b.title}</Typography>
                    <Chip label={`Order: ${b.displayOrder}`} size="small" variant="outlined" color="primary" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{b.subtitle}</Typography>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={b.status === 'Active'}
                        onChange={() => handleStatusToggle(b)}
                        color="success"
                        size="small"
                      />
                    }
                    label="Visible"
                    slotProps={{ typography: { variant: 'caption', fontWeight: 600 } }}
                  />
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEdit(b)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(b)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add / Edit Banner Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingBanner ? 'Edit Banner' : 'Create New Banner'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Image Upload Area */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Banner Image *</Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: formPreviewUrl ? 'success.main' : 'primary.main',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: formPreviewUrl ? 'success.50' : 'primary.50',
                  cursor: 'pointer',
                  position: 'relative',
                  minHeight: 160,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {formPreviewUrl ? (
                  <>
                    <img
                      src={formPreviewUrl}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, borderRadius: 6 }}
                    />
                    <Box sx={{
                      position: 'absolute', bottom: 8, right: 8,
                      bgcolor: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: 1.5,
                      px: 1.5, py: 0.5, fontSize: '0.75rem', fontWeight: 600
                    }}>
                      Click to change
                    </Box>
                  </>
                ) : (
                  <Stack alignItems="center" spacing={1}>
                    <UploadFileIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Click to upload image from your PC
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supports JPG, PNG, WebP, GIF
                    </Typography>
                  </Stack>
                )}
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageFileSelect}
              />
              {uploading && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Uploading image...
                  </Typography>
                </Box>
              )}
            </Box>

            <TextField
              required
              fullWidth
              label="Promo Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Summer Cleaning Special"
            />
            <TextField
              required
              fullWidth
              label="Promo Subtitle"
              value={formSubtitle}
              onChange={(e) => setFormSubtitle(e.target.value)}
              placeholder="e.g. Get 20% off on all home cleaning services"
            />
            <TextField
              required
              fullWidth
              type="number"
              label="Display Order Index"
              value={formOrder}
              onChange={(e) => setFormOrder(Number(e.target.value))}
              inputProps={{ min: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={uploading}
          >
            {editingBanner ? 'Save Changes' : 'Create Banner'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete Banner</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to permanently delete banner <strong>{bannerToDelete?.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Banners;
