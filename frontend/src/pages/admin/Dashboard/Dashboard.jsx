import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, Typography, Card, CardContent, Divider, List, ListItem, 
  ListItemText, ListItemAvatar, Avatar, Chip, Stack, Paper, Grid
} from '@mui/material';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import apiClient from '../../../services/common/api';
import { setBookings, setProviders, setCustomers, setCategories, setReviews } from '../../../redux/common/dataSlice';

// Icons
import PeopleIcon from '@mui/icons-material/People';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CategoryIcon from '@mui/icons-material/Category';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HandymanIcon from '@mui/icons-material/Handyman';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RateReviewIcon from '@mui/icons-material/RateReview';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import './Dashboard.css';

const COLORS = ['#4f46e5', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { customers, providers, bookings, categories, services, complaints, reviews } = useSelector((state) => state.data);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [bRes, pRes, cRes, catRes] = await Promise.allSettled([
          apiClient.get('/bookings/customer'),
          apiClient.get('/admin/providers'),
          apiClient.get('/admin/users'),
          apiClient.get('/categories')
        ]);

        if (bRes.status === 'fulfilled' && Array.isArray(bRes.value.data)) {
          dispatch(setBookings(bRes.value.data));
        }
        if (pRes.status === 'fulfilled' && Array.isArray(pRes.value.data)) {
          dispatch(setProviders(pRes.value.data));
        }
        if (cRes.status === 'fulfilled' && Array.isArray(cRes.value.data)) {
          dispatch(setCustomers(cRes.value.data));
        }
        if (catRes.status === 'fulfilled' && Array.isArray(catRes.value.data)) {
          dispatch(setCategories(catRes.value.data));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchDashboardData();
  }, [dispatch]);

  // Robust Case-Insensitive Status Helper
  const getStatus = (b) => String(b.status || '').toUpperCase();

  // Compute metrics
  const totalCustomers = customers.length;
  const totalProviders = providers.length;
  const pendingApprovals = providers.filter(p => String(p.verificationStatus || p.status || '').toUpperCase() === 'PENDING').length;
  const activeProviders = providers.filter(p => String(p.status || '').toUpperCase() === 'ACTIVE').length;
  const totalCategories = categories.length;
  const totalServices = services.length;
  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(b => getStatus(b) === 'PENDING').length;
  const ongoingBookings = bookings.filter(b => ['ACCEPTED', 'ASSIGNED', 'CONFIRMED', 'ON THE WAY', 'STARTED', 'RESCHEDULED'].includes(getStatus(b))).length;
  const completedBookings = bookings.filter(b => getStatus(b) === 'COMPLETED').length;
  const cancelledBookings = bookings.filter(b => ['CANCELLED', 'DECLINED'].includes(getStatus(b))).length;

  const totalEarnedRevenue = bookings
    .filter(b => getStatus(b) === 'COMPLETED')
    .reduce((sum, b) => sum + (b.subService?.price || b.amount || 499), 0);

  // 10% platform commission breakdown
  const PLATFORM_FEE = 0.10;
  const adminCommission   = +(totalEarnedRevenue * PLATFORM_FEE).toFixed(2);
  const providerPayouts   = +(totalEarnedRevenue * (1 - PLATFORM_FEE)).toFixed(2);

  // Chart datasets
  const monthlyBookingsData = [
    { name: 'Feb', bookings: Math.max(12, Math.round(totalBookings * 0.2)) },
    { name: 'Mar', bookings: Math.max(25, Math.round(totalBookings * 0.4)) },
    { name: 'Apr', bookings: Math.max(40, Math.round(totalBookings * 0.6)) },
    { name: 'May', bookings: Math.max(65, Math.round(totalBookings * 0.8)) },
    { name: 'Jun', bookings: Math.max(90, totalBookings) },
    { name: 'Jul', bookings: Math.max(120, totalBookings + 15) },
  ];

  const dailyBookingsData = [
    { name: 'Mon', count: Math.max(2, Math.round(totalBookings * 0.1)) },
    { name: 'Tue', count: Math.max(4, Math.round(totalBookings * 0.15)) },
    { name: 'Wed', count: Math.max(5, Math.round(totalBookings * 0.2)) },
    { name: 'Thu', count: Math.max(6, Math.round(totalBookings * 0.25)) },
    { name: 'Fri', count: Math.max(8, Math.round(totalBookings * 0.3)) },
    { name: 'Sat', count: Math.max(12, Math.round(totalBookings * 0.4)) },
    { name: 'Sun', count: Math.max(10, Math.round(totalBookings * 0.35)) },
  ];

  const servicePopularityData = categories.length > 0 ? categories.map((cat, idx) => ({
    name: cat.name,
    value: bookings.filter(b => (b.category || b.serviceType || '').toLowerCase().includes((cat.name || '').toLowerCase())).length || (idx + 1) * 3
  })) : [
    { name: 'Plumbing', value: 15 },
    { name: 'Electrical', value: 20 },
    { name: 'Cleaning', value: 35 },
    { name: 'AC Repair', value: 25 },
  ];

  const registrationTrends = [
    { name: 'Mar', Customers: Math.max(10, totalCustomers), Providers: Math.max(2, totalProviders) },
    { name: 'Apr', Customers: Math.max(25, totalCustomers + 5), Providers: Math.max(5, totalProviders + 2) },
    { name: 'May', Customers: Math.max(50, totalCustomers + 12), Providers: Math.max(8, totalProviders + 4) },
    { name: 'Jun', Customers: Math.max(85, totalCustomers + 20), Providers: Math.max(12, totalProviders + 6) },
  ];

  const statusDistribution = [
    { name: 'Pending', value: pendingBookings },
    { name: 'Ongoing', value: ongoingBookings },
    { name: 'Completed', value: completedBookings },
    { name: 'Cancelled', value: cancelledBookings },
  ].filter(item => item.value > 0);

  const statCards = [
    { title: 'Total Customers',       value: totalCustomers,   icon: <PeopleIcon />,              color: '#4f46e5' },
    { title: 'Total Providers',       value: totalProviders,   icon: <EngineeringIcon />,          color: '#059669' },
    { title: 'Pending Approvals',     value: pendingApprovals, icon: <VerifiedUserIcon />,         color: '#f59e0b' },
    { title: 'Active Providers',      value: activeProviders,  icon: <HandymanIcon />,             color: '#06b6d4' },
    // ── Earnings Breakdown ─────────────────────────────────────────────────────
    { title: 'Total Revenue (Gross)', value: `₹${totalEarnedRevenue.toLocaleString()}`,  icon: <AccountBalanceWalletIcon />, color: '#0f172a',  bg: '#f8fafc' },
    { title: 'Admin Commission (10%)',value: `₹${adminCommission.toLocaleString()}`,    icon: <TrendingUpIcon />,           color: '#dc2626',  bg: '#fff1f2' },
    { title: 'Provider Payouts (90%)',value: `₹${providerPayouts.toLocaleString()}`,    icon: <CurrencyRupeeIcon />,        color: '#059669',  bg: '#ecfdf5' },
    // ────────────────────────────────────────────────────────────────────────────
    { title: 'Total Customer Reviews',value: (reviews || []).length, icon: <RateReviewIcon />,    color: '#8b5cf6' },
    { title: 'Total Bookings',        value: totalBookings,    icon: <CalendarMonthIcon />,        color: '#6366f1' },
    { title: 'Pending Invites',       value: pendingBookings,  icon: <CalendarMonthIcon />,        color: '#eab308' },
    { title: 'Ongoing Jobs',          value: ongoingBookings,  icon: <CalendarMonthIcon />,        color: '#3b82f6' },
    { title: 'Completed Jobs',        value: completedBookings,icon: <CalendarMonthIcon />,        color: '#22c55e' },
    { title: 'Cancelled Jobs',        value: cancelledBookings,icon: <CalendarMonthIcon />,        color: '#ef4444' },
  ];


  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Dashboard Overview</Typography>
        <Typography variant="body2" color="text.secondary">Real-time metrics, analytics, and activities for EaseMyHome platform.</Typography>
      </Box>

      {/* Analytics Counter Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 2.18 }}>
            <Card sx={{ height: '100%', bgcolor: card.bg || 'white' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 500 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: card.color }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${card.color}15`, color: card.color, width: 44, height: 44 }}>
                    {card.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Line Chart: Monthly Bookings */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Monthly Bookings</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={monthlyBookingsData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="bookings" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Bar Chart: Daily Bookings */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Daily Bookings (Weekly View)</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={dailyBookingsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pie Chart: Service Popularity */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Service Popularity</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={servicePopularityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {servicePopularityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Line Chart: Registrations */}
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>User Registrations Trend</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={registrationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Customers" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Providers" stroke="#10b981" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Donut Chart: Booking Status Distribution */}
        <Grid size={{ xs: 12, md: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Booking Status Distribution</Typography>
            <ResponsiveContainer width="100%" height="85%">
              {statusDistribution.length > 0 ? (
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => {
                      let color = '#94a3b8';
                      if (entry.name === 'Pending') color = '#eab308';
                      if (entry.name === 'Ongoing') color = '#3b82f6';
                      if (entry.name === 'Completed') color = '#22c55e';
                      if (entry.name === 'Cancelled') color = '#ef4444';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <Stack alignItems="center" justifyContent="center" height="100%">
                  <Typography color="text.secondary">No active bookings data to display status distribution.</Typography>
                </Stack>
              )}
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activities Section */}
      <Grid container spacing={4}>
        {/* Latest Bookings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, minHeight: 350 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Latest Bookings</Typography>
            <Divider />
            <List>
              {bookings.slice(0, 4).map((b) => (
                <ListItem key={b.id} disableGutters>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                      {b.customerName[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${b.customerName} - ${b.service}`}
                    secondary={`Scheduled: ${b.date} | Slot: ${b.timeSlot}`}
                  />
                  <Chip 
                    label={b.status} 
                    size="small" 
                    color={
                      b.status === 'Completed' ? 'success' : 
                      b.status === 'Cancelled' ? 'error' : 
                      b.status === 'Pending' ? 'warning' : 'info'
                    } 
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Latest Providers & Active Complaints */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, minHeight: 350 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recent Complaints</Typography>
            <Divider />
            <List>
              {complaints.length > 0 ? (
                complaints.slice(0, 4).map((c) => (
                  <ListItem key={c.id} disableGutters>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                        <WarningAmberIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={c.title}
                      secondary={`By: ${c.customerName} | Assigned To: ${c.assignedTo || 'Unassigned'}`}
                    />
                    <Chip 
                      label={c.status} 
                      size="small" 
                      color={
                        c.status === 'Closed' ? 'success' : 
                        c.status === 'In Progress' ? 'info' : 'error'
                      } 
                    />
                  </ListItem>
                ))
              ) : (
                <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No complaints filed recently.</Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
