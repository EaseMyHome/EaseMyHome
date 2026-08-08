import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Box, Button, Typography, Stack, Card, CardContent, Divider,
  IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, MenuItem, Select, FormControl, InputLabel, Paper, Checkbox, ListItemText
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../../../components/common/PageHeader';
import { saveOffer, deleteOffer, toggleOfferStatus, addAuditLog } from '../../../redux/common/dataSlice';
import { useToast } from '../../../components/common/ToastProvider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './Offers.css';

const schema = yup.object().shape({
  code: yup.string().required('Coupon Code is required').matches(/^[A-Z0-9]+$/, 'Must be uppercase alphanumeric'),
  discount: yup.string().required('Discount percentage or value is required (e.g. 20% or ₹150)'),
  expiryDate: yup.string().required('Expiry Date is required'),
  status: yup.string().default('Active'),
});

const Offers = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { offers, categories } = useSelector((state) => state.data);
  const currentUser = useSelector((state) => state.auth.user);

  // States
  const [searchText, setSearchText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [selectedCats, setSelectedCats] = useState([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  // Filter Search
  const filteredOffers = offers.filter((off) => 
    off.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setSelectedCats([]);
    reset({ code: '', discount: '20%', expiryDate: '2026-12-31', status: 'Active' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (off) => {
    setEditingOffer(off);
    setSelectedCats(off.applicableCategories || []);
    reset({
      code: off.code,
      discount: off.discount,
      expiryDate: off.expiryDate,
      status: off.status,
    });
    setDialogOpen(true);
  };

  const handleStatusToggle = (off) => {
    dispatch(toggleOfferStatus(off.id));
    dispatch(addAuditLog({
      user: currentUser?.email || 'admin@easemyhome.com',
      action: `Toggled status of coupon ${off.code}`,
      module: 'Offers Management'
    }));
    showToast(`Coupon status updated for ${off.code}`, 'success');
  };

  const handleDeleteClick = (off) => {
    setOfferToDelete(off);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (offerToDelete) {
      dispatch(deleteOffer(offerToDelete.id));
      dispatch(addAuditLog({
        user: currentUser?.email || 'admin@easemyhome.com',
        action: `Deleted offer code ${offerToDelete.code}`,
        module: 'Offers Management'
      }));
      showToast(`Coupon ${offerToDelete.code} deleted successfully.`, 'success');
      setDeleteConfirmOpen(false);
      setOfferToDelete(null);
    }
  };

  const handleCategorySelectChange = (event) => {
    setSelectedCats(event.target.value);
  };

  const onSubmit = (data) => {
    const offerData = {
      ...data,
      id: editingOffer ? editingOffer.id : undefined,
      applicableCategories: selectedCats
    };
    dispatch(saveOffer(offerData));
    dispatch(addAuditLog({
      user: currentUser?.email || 'admin@easemyhome.com',
      action: editingOffer ? `Updated discount code ${data.code}` : `Created new discount code ${data.code}`,
      module: 'Offers Management'
    }));
    showToast(`Coupon ${editingOffer ? 'updated' : 'created'} successfully!`, 'success');
    setDialogOpen(false);
  };

  const columns = [
    { field: 'id', headerName: 'Offer ID', width: 120 },
    { 
      field: 'code', 
      headerName: 'Coupon Code', 
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value} color="primary" sx={{ mt: 1.5, fontWeight: 700, fontFamily: 'monospace' }} />
      )
    },
    { field: 'discount', headerName: 'Discount Value', width: 140 },
    { 
      field: 'applicableCategories', 
      headerName: 'Applicable Categories', 
      width: 220,
      renderCell: (params) => (
        <Stack direction="row" gap={0.5} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
          {(params.value || []).map((cat, i) => (
            <Chip key={i} label={cat} size="small" variant="outlined" />
          ))}
        </Stack>
      )
    },
    { field: 'expiryDate', headerName: 'Expiry Date', width: 130 },
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
        const off = params.row;
        return (
          <Box sx={{ mt: 1 }}>
            <Tooltip title="Edit">
              <IconButton onClick={() => handleOpenEdit(off)} color="primary" size="small">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={off.status === 'Active' ? 'Deactivate' : 'Activate'}>
              <IconButton onClick={() => handleStatusToggle(off)} color="warning" size="small">
                <Switch checked={off.status === 'Active'} color="success" size="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={() => handleDeleteClick(off)} color="error" size="small">
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
        title="Offers & Coupon Codes"
        subtitle="Manage marketing promotions. Create campaign discount vouchers, set validity periods, and category scopes."
        searchValue={searchText}
        onSearchChange={setSearchText}
        onAddClick={handleOpenAdd}
        addLabel="Create Offer"
      />

      <Paper sx={{ height: 500, width: '100%', mt: 3 }}>
        <DataGrid
          rows={filteredOffers}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 7 } },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>

      {/* Add / Edit Offer Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingOffer ? 'Edit Offer Settings' : 'Create Campaign Offer'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Coupon Code (e.g. CLEAN30)"
                placeholder="UPPERCASE ALPHANUMERIC"
                error={!!errors.code}
                helperText={errors.code?.message}
                {...register('code')}
              />
              <TextField
                required
                fullWidth
                label="Discount Value (e.g. 20% or ₹200)"
                error={!!errors.discount}
                helperText={errors.discount?.message}
                {...register('discount')}
              />
              <TextField
                required
                fullWidth
                type="date"
                label="Expiry Date"
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.expiryDate}
                helperText={errors.expiryDate?.message}
                {...register('expiryDate')}
              />

              <FormControl fullWidth>
                <InputLabel id="applicable-categories-label">Applicable Categories</InputLabel>
                <Select
                  labelId="applicable-categories-label"
                  multiple
                  value={selectedCats}
                  onChange={handleCategorySelectChange}
                  renderValue={(selected) => selected.join(', ')}
                  label="Applicable Categories"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.name}>
                      <Checkbox checked={selectedCats.indexOf(cat.name) > -1} />
                      <ListItemText primary={cat.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingOffer ? 'Save Settings' : 'Create Coupon'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete Coupon</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to permanently delete offer coupon <strong>{offerToDelete?.code}</strong>?
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

export default Offers;
