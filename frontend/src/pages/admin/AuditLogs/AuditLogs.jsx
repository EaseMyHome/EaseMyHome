import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Paper, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../../../components/common/PageHeader';
import { useToast } from '../../../components/common/ToastProvider';
import './AuditLogs.css';

const AuditLogs = () => {
  const { showToast } = useToast();
  const { auditLogs } = useSelector((state) => state.data);

  // States
  const [searchText, setSearchText] = useState('');

  // Search filter logic
  const filteredLogs = auditLogs.filter((log) => 
    log.user.toLowerCase().includes(searchText.toLowerCase()) ||
    log.action.toLowerCase().includes(searchText.toLowerCase()) ||
    log.module.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { field: 'id', headerName: 'Log ID', width: 120 },
    { field: 'user', headerName: 'User Email', width: 200 },
    { 
      field: 'module', 
      headerName: 'System Module', 
      width: 170,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" sx={{ mt: 1.5, fontWeight: 600 }} />
      )
    },
    { field: 'action', headerName: 'Action Executed', width: 320 },
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'time', headerName: 'Time', width: 110 },
    { field: 'ipAddress', headerName: 'IP Address', width: 140 },
  ];

  return (
    <Box>
      <PageHeader
        title="Security Audit Logs"
        subtitle="Read-only history logging of administrative operations. Tracks active logins, database updates, document verification decisions, and IP origins."
        searchValue={searchText}
        onSearchChange={setSearchText}
        onRefresh={() => showToast('Audit logs updated', 'success')}
      />

      <Paper sx={{ height: 500, width: '100%', mt: 3 }}>
        <DataGrid
          rows={filteredLogs}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 7 } },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>
    </Box>
  );
};

export default AuditLogs;
