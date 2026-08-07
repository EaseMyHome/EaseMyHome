import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Box, Button, Typography, Stack, Divider,
  IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Paper, Grid, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../../../components/common/PageHeader';
import { saveAdmin, deleteAdmin, addAuditLog } from '../../../redux/common/dataSlice';
import { useToast } from '../../../components/common/ToastProvider';
import DeleteIcon from '@mui/icons-material/Delete';
import './Admins.css';

const schema = yup.object().shape({
  name: yup.string().required('Admin Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().required('Role is required'),
});

const ROLE_PERMISSIONS = {
  'Super Admin': { read: 'Yes', create: 'Yes', update: 'Yes', delete: 'Yes' },
  'Admin': { read: 'Yes', create: 'Yes', update: 'Yes', delete: 'No' },
  'Support Executive': { read: 'Yes', create: 'No', update: 'Yes (Tickets)', delete: 'No' },
};

const Admins = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { admins } = useSelector((state) => state.data);
  const currentUser = useSelector((state) => state.auth.user);

  // States
  const [searchText, setSearchText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const filteredAdmins = admins.filter((adm) => 
    adm.name.toLowerCase().includes(searchText.toLowerCase()) ||
    adm.email.toLowerCase().includes(searchText.toLowerCase()) ||
    adm.role.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenAdd = () => {
    reset({ name: '', email: '', role: 'Support Executive' });
    setDialogOpen(true);
  };

  const handleDeleteClick = (adm) => {
    if (adm.email === currentUser?.email) {
      showToast('Cannot delete currently logged-in account!', 'error');
      return;
    }
    setAdminToDelete(adm);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (adminToDelete) {
      dispatch(deleteAdmin(adminToDelete.id));
      dispatch(addAuditLog({
        user: currentUser?.email || 'admin@easemyhome.com',
        action: `Revoked administrative privileges for ${adminToDelete.name}`,
        module: 'Admin Management'
      }));
      showToast(`Admin ${adminToDelete.name} deleted.`, 'success');
      setDeleteConfirmOpen(false);
      setAdminToDelete(null);
    }
  };

  const onSubmit = (data) => {
    const adminData = {
      ...data,
      id: undefined,
      status: 'Active',
    };
    dispatch(saveAdmin(adminData));
    dispatch(addAuditLog({
      user: currentUser?.email || 'admin@easemyhome.com',
      action: `Created admin user: ${data.name} as ${data.role}`,
      module: 'Admin Management'
    }));
    showToast(`Admin user added successfully!`, 'success');
    setDialogOpen(false);
  };

  const columns = [
    { field: 'id', headerName: 'User ID', width: 120 },
    { field: 'name', headerName: 'Full Name', width: 180, renderCell: (params) => (
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 1.5 }}>{params.value}</Typography>
    )},
    { field: 'email', headerName: 'Email Address', width: 220 },
    { 
      field: 'role', 
      headerName: 'System Role', 
      width: 160, 
      renderCell: (params) => {
        let color = 'default';
        if (params.value === 'Super Admin') color = 'error';
        if (params.value === 'Admin') color = 'primary';
        if (params.value === 'Support Executive') color = 'secondary';
        return <Chip label={params.value} size="small" color={color} sx={{ mt: 1.5, fontWeight: 600 }} />;
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color="success" sx={{ mt: 1.5 }} />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ mt: 1 }}>
          <Tooltip title="Delete/Revoke Access">
            <IconButton onClick={() => handleDeleteClick(params.row)} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Admin User Management"
        subtitle="Provision administrative users, configure roles, and inspect permission scopes."
        searchValue={searchText}
        onSearchChange={setSearchText}
        onAddClick={handleOpenAdd}
        addLabel="Create Admin"
      />

      <Grid container spacing={4} sx={{ mt: 3 }}>
        {/* Left: Admin Users Directory */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ height: 450, width: '100%' }}>
            <DataGrid
              rows={filteredAdmins}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              pageSizeOptions={[5, 10]}
              disableRowSelectionOnClick
              sx={{ border: 'none' }}
            />
          </Paper>
        </Grid>

        {/* Right: Roles Permission Matrix Preview */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Role Permissions Matrix</Typography>
            <Divider sx={{ mb: 2 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Read</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Create</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Update</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(ROLE_PERMISSIONS).map((roleName) => {
                  const perm = ROLE_PERMISSIONS[roleName];
                  return (
                    <TableRow key={roleName}>
                      <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{roleName}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{perm.read}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{perm.create}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{perm.update}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{perm.delete}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Admin Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Invite Admin User</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Full Name"
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register('name')}
              />
              <TextField
                required
                fullWidth
                label="Email Address"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register('email')}
              />
              <TextField
                select
                required
                fullWidth
                label="System Role"
                defaultValue="Support Executive"
                {...register('role')}
              >
                <MenuItem value="Super Admin">Super Admin</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Support Executive">Support Executive</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Create User</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Revoke Access Privileges</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to revoke administrative access for <strong>{adminToDelete?.name}</strong>? They will be immediately signed out and blocked from logging in.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Revoke Access</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admins;
