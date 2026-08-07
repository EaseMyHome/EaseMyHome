import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Box, Button, Typography, Stack, Card, CardContent, Divider,
  IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Switch, MenuItem, Select, FormControl, InputLabel, Paper
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../../../components/common/PageHeader';
import { saveService, deleteService, toggleServiceStatus, addAuditLog } from '../../../redux/common/dataSlice';
import { useToast } from '../../../components/common/ToastProvider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './Services.css';

const schema = yup.object().shape({
  name: yup.string().required('Service Name is required'),
  categoryId: yup.string().required('Category assignment is required'),
  duration: yup.string().required('Estimated duration is required (e.g. 60 mins)'),
  price: yup.number().typeError('Price must be a number').positive('Price must be positive').required('Price is required'),
  description: yup.string().required('Description is required'),
  status: yup.string().default('Active'),
});

const Services = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { services, categories } = useSelector((state) => state.data);
  const currentUser = useSelector((state) => state.auth.user);

  // States
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  // Filter Categories list for drop downs
  const filterOptions = categories.map(c => ({ label: c.name, value: c.id }));

  // Search & filter logic
  const filteredServices = services.filter((srv) => {
    const matchesSearch = 
      srv.name.toLowerCase().includes(searchText.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter ? srv.categoryId === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    reset({ name: '', categoryId: categories[0]?.id || '', duration: '60 mins', price: 499, description: '', status: 'Active' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setEditingService(srv);
    reset({
      name: srv.name,
      categoryId: srv.categoryId,
      duration: srv.duration,
      price: srv.price,
      description: srv.description,
      status: srv.status,
    });
    setDialogOpen(true);
  };

  const handleStatusToggle = (srv) => {
    dispatch(toggleServiceStatus(srv.id));
    dispatch(addAuditLog({
      user: currentUser?.email || 'admin@easemyhome.com',
      action: `Toggled service ${srv.name} active status`,
      module: 'Service Management'
    }));
    showToast(`Service active state toggled for ${srv.name}`, 'success');
  };

  const handleDeleteClick = (srv) => {
    setServiceToDelete(srv);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (serviceToDelete) {
      dispatch(deleteService(serviceToDelete.id));
      dispatch(addAuditLog({
        user: currentUser?.email || 'admin@easemyhome.com',
        action: `Deleted service ${serviceToDelete.name}`,
        module: 'Service Management'
      }));
      showToast(`Service ${serviceToDelete.name} deleted.`, 'success');
      setDeleteConfirmOpen(false);
      setServiceToDelete(null);
    }
  };

  const onSubmit = (data) => {
    const serviceData = {
      ...data,
      id: editingService ? editingService.id : undefined,
    };
    dispatch(saveService(serviceData));
    dispatch(addAuditLog({
      user: currentUser?.email || 'admin@easemyhome.com',
      action: editingService ? `Updated service ${data.name}` : `Created new service ${data.name}`,
      module: 'Service Management'
    }));
    showToast(`Service ${editingService ? 'updated' : 'created'} successfully!`, 'success');
    setDialogOpen(false);
  };

  const columns = [
    { field: 'id', headerName: 'Service ID', width: 120 },
    { 
      field: 'name', 
      headerName: 'Service Name', 
      width: 200, 
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, mt: 1.5 }}>{params.value}</Typography>
      )
    },
    { 
      field: 'categoryId', 
      headerName: 'Category', 
      width: 150, 
      valueGetter: (value) => {
        const cat = categories.find(c => c.id === value);
        return cat ? cat.name : 'Unknown';
      }
    },
    { 
      field: 'price', 
      headerName: 'Price (₹)', 
      width: 110,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 500 }}>₹{params.value}</Typography>
      )
    },
    { field: 'duration', headerName: 'Est. Duration', width: 130 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120, 
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value === 'Active' ? 'success' : 'default'} 
          sx={{ mt: 1.5, fontWeight: 600 }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const srv = params.row;
        return (
          <Box sx={{ mt: 1 }}>
            <Tooltip title="Edit">
              <IconButton onClick={() => handleOpenEdit(srv)} color="primary" size="small">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={srv.status === 'Active' ? 'Deactivate' : 'Activate'}>
              <IconButton onClick={() => handleStatusToggle(srv)} color="warning" size="small">
                <Switch checked={srv.status === 'Active'} color="success" size="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={() => handleDeleteClick(srv)} color="error" size="small">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Sub-Service Directory"
        subtitle="Configure specific services, durations, prices, and map them to parent categories."
        searchValue={searchText}
        onSearchChange={setSearchText}
        filterOptions={filterOptions}
        selectedFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        onAddClick={handleOpenAdd}
        addLabel="Add Service"
      />

      <Paper sx={{ height: 500, width: '100%', mt: 3 }}>
        <DataGrid
          rows={filteredServices}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 7 } },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>

      {/* Add / Edit Service Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingService ? 'Edit Service Details' : 'Add New Service'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Service Name"
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register('name')}
              />

              <FormControl fullWidth error={!!errors.categoryId}>
                <InputLabel id="category-select-label">Category Assignment</InputLabel>
                <Select
                  labelId="category-select-label"
                  label="Category Assignment"
                  defaultValue={editingService?.categoryId || categories[0]?.id || ''}
                  {...register('categoryId')}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && <Typography variant="caption" color="error">{errors.categoryId.message}</Typography>}
              </FormControl>

              <Stack direction="row" spacing={2}>
                <TextField
                  required
                  fullWidth
                  label="Est. Duration (e.g. 90 mins)"
                  error={!!errors.duration}
                  helperText={errors.duration?.message}
                  {...register('duration')}
                />
                <TextField
                  required
                  fullWidth
                  label="Base Price (₹)"
                  type="number"
                  error={!!errors.price}
                  helperText={errors.price?.message}
                  {...register('price')}
                />
              </Stack>

              <TextField
                required
                fullWidth
                multiline
                rows={3}
                label="Service Description"
                error={!!errors.description}
                helperText={errors.description?.message}
                {...register('description')}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingService ? 'Save Changes' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete Service</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to permanently delete service <strong>{serviceToDelete?.name}</strong>?
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

export default Services;
