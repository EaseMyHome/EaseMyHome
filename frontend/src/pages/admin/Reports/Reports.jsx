import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, Button, Typography, Stack, Card, CardContent, Divider,
  MenuItem, Select, FormControl, InputLabel, Paper, Grid, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import { useToast } from '../../../components/common/ToastProvider';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import './Reports.css';

const Reports = () => {
  const { showToast } = useToast();
  const { customers, providers, bookings, categories, services, complaints } = useSelector((state) => state.data);

  // States
  const [reportType, setReportType] = useState('bookings'); // bookings, customers, providers, services, complaints

  const handleReportChange = (event) => {
    setReportType(event.target.value);
  };

  const getReportData = () => {
    switch (reportType) {
      case 'customers':
        return {
          title: 'Customer Directory Report',
          headers: ['Customer ID', 'Name', 'Email', 'Phone', 'Status', 'Join Date'],
          rows: customers.map(c => [c.id, c.name, c.email, c.phone, c.status, c.joinDate]),
          summary: `Total Registered Customers: ${customers.length} | Active: ${customers.filter(c=>c.status==='Active').length} | Blocked: ${customers.filter(c=>c.status==='Blocked').length}`
        };
      case 'providers':
        return {
          title: 'Service Provider Audit Report',
          headers: ['Provider ID', 'Name', 'Email', 'Experience', 'Status', 'Rating'],
          rows: providers.map(p => [p.id, p.name, p.email, p.experience, p.status, p.rating]),
          summary: `Total Service Partners: ${providers.length} | Approved: ${providers.filter(p=>p.status==='Active').length} | Pending verification: ${providers.filter(p=>p.status==='Pending').length}`
        };
      case 'services':
        return {
          title: 'Services Catalog Matrix',
          headers: ['Service ID', 'Service Name', 'Price (₹)', 'Est. Duration', 'Status'],
          rows: services.map(s => [s.id, s.name, `₹${s.price}`, s.duration, s.status]),
          summary: `Total Sub-Services Configured: ${services.length} | Enabled: ${services.filter(s=>s.status==='Active').length}`
        };
      case 'complaints':
        return {
          title: 'Support Tickets Audit',
          headers: ['Ticket ID', 'Customer', 'Title', 'Assigned To', 'Date', 'Status'],
          rows: complaints.map(c => [c.id, c.customerName, c.title, c.assignedTo || 'Unassigned', c.date, c.status]),
          summary: `Total Complaints Filed: ${complaints.length} | Open Tickets: ${complaints.filter(c=>c.status==='Open').length} | Resolved: ${complaints.filter(c=>c.status==='Closed').length}`
        };
      case 'bookings':
      default:
        return {
          title: 'Booking Transactions Summary',
          headers: ['Booking ID', 'Customer', 'Provider', 'Service', 'Date', 'Status'],
          rows: bookings.map(b => [b.id, b.customerName, b.providerName || 'Unassigned', b.service, b.date, b.status]),
          summary: `Total Reservations: ${bookings.length} | Completed: ${bookings.filter(b=>b.status==='Completed').length} | Cancelled: ${bookings.filter(b=>b.status==='Cancelled').length}`
        };
    }
  };

  const currentReport = getReportData();

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [currentReport.headers.join(','), ...currentReport.rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${currentReport.title} to Excel (CSV)`, 'success');
  };

  const handleExportPDF = () => {
    // Standard client print triggering is the cleanest native PDF mock helper
    window.print();
    showToast(`Generating PDF preview for ${currentReport.title}`, 'info');
  };

  return (
    <Box>
      <PageHeader
        title="Administrative Reports"
        subtitle="Generate reports across system modules. Export files to Excel or generate printable PDF summaries."
      />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Selector Panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>Report Configuration</Typography>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel id="report-target-label">Target Dataset</InputLabel>
                <Select
                  labelId="report-target-label"
                  value={reportType}
                  label="Target Dataset"
                  onChange={handleReportChange}
                >
                  <MenuItem value="bookings">Bookings Ledger</MenuItem>
                  <MenuItem value="customers">Customers Profile List</MenuItem>
                  <MenuItem value="providers">Provider Registry</MenuItem>
                  <MenuItem value="services">Services Catalog Matrix</MenuItem>
                  <MenuItem value="complaints">Customer Support Tickets</MenuItem>
                </Select>
              </FormControl>

              <Divider />

              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
                fullWidth
              >
                Export to Excel (CSV)
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleExportPDF}
                fullWidth
              >
                Download PDF Summary
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Report Preview Panel */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {currentReport.title}
              </Typography>
              <Chip label="Report Preview" color="info" size="small" variant="outlined" />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {currentReport.summary}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ overflowX: 'auto', maxHeight: 350 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {currentReport.headers.map((h, i) => (
                      <TableCell key={i} sx={{ fontWeight: 600 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentReport.rows.map((row, rIdx) => (
                    <TableRow key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <TableCell key={cIdx}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
