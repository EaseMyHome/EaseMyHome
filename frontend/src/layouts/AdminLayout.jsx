import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Typography, IconButton, Badge, 
  Avatar, Menu, MenuItem, Divider, useTheme, Chip, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Navigation Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EngineeringIcon from '@mui/icons-material/Engineering';
import VerifiedIcon from '@mui/icons-material/Verified';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SettingsIcon from '@mui/icons-material/Settings';

import CampaignIcon from '@mui/icons-material/Campaign';
import { toggleThemeMode } from '../redux/common/themeSlice';
import { logout } from '../redux/auth/authSlice';
import { markNotificationRead, addNotification } from '../redux/common/dataSlice';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ErrorBoundary from '../components/common/ErrorBoundary';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard',             path: '/admin/dashboard',              icon: <DashboardIcon /> },
  { text: 'Customers',             path: '/admin/dashboard/customers',    icon: <PeopleIcon /> },
  { text: 'Providers',             path: '/admin/dashboard/providers',    icon: <EngineeringIcon /> },
  { text: 'Provider Verification', path: '/admin/dashboard/verification', icon: <VerifiedIcon /> },
  { text: 'Categories',            path: '/admin/dashboard/categories',   icon: <CategoryIcon /> },
  { text: 'Bookings',              path: '/admin/dashboard/bookings',     icon: <CalendarMonthIcon /> },
  { text: 'Reviews',               path: '/admin/dashboard/reviews',      icon: <StarIcon /> },
  { text: 'Complaints',            path: '/admin/dashboard/complaints',   icon: <ReportProblemIcon /> },
  { text: 'Notifications',         path: '/admin/dashboard/notifications',icon: <CampaignIcon /> },
  { text: 'Offers',                path: '/admin/dashboard/offers',       icon: <LocalOfferIcon /> },
  { text: 'Banners',               path: '/admin/dashboard/banners',      icon: <PhotoLibraryIcon /> },
  { text: 'Settings',              path: '/admin/dashboard/settings',     icon: <SettingsIcon /> },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const user = useSelector((state) => state.auth.user);
  const mode = useSelector((state) => state.theme.mode);
  const providers = useSelector((state) => state.data?.providers) || [];
  const notifications = useSelector((state) => state.data?.notifications) || [];
  const unreadCount = (notifications || []).filter(n => n && !n.read).length;

  // Auto-sync notifications for pending/new providers so Bell Icon shows alert
  useEffect(() => {
    if (Array.isArray(providers) && providers.length > 0) {
      providers.forEach(p => {
        if (!p) return;
        const isPending = p.status === 'Under Review' || p.status === 'Pending' || p.verified === false;
        if (isPending) {
          const exists = notifications.some(n => n?.providerId === (p.id || p.rawId) || (p.name && n?.message?.includes(p.name)));
          if (!exists) {
            dispatch(addNotification({
              providerId: p.id || p.rawId,
              title: 'New Provider Registration',
              message: `${p.name || 'New Provider'} applied for verification as ${p.skills?.[0] || p.category || 'Service Partner'}.`,
              channel: 'InApp',
              audience: 'All Admin',
              read: false
            }));
          }
        }
      });
    }
  }, [providers]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const handleNotifOpen = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  const activeRoute = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin/dashboard/';
    }
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          🏠 EaseMyHome
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2 }}>
        <List sx={{ px: 1.5, gap: 0.5, display: 'flex', flexDirection: 'column' }}>
          {menuItems.map((item) => {
            const isActive = activeRoute(item.path);
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  onClick={isMobile ? handleDrawerToggle : undefined}
                  sx={{
                    borderRadius: 2,
                    py: 1.25,
                    px: 2,
                    backgroundColor: isActive ? 'primary.light' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    '&:hover': {
                      backgroundColor: isActive ? 'primary.main' : 'action.hover',
                      color: isActive ? 'primary.contrastText' : 'text.primary',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 40, 
                      color: isActive ? 'primary.contrastText' : 'inherit' 
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem', 
                      fontWeight: isActive ? 600 : 500 
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar src={user?.avatar || ''} alt={user?.name}>
          {user?.name ? user.name[0] : 'A'}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
            {user?.name || 'Admin User'}
          </Typography>
          <Chip 
            label={user?.role || 'Administrator'} 
            size="small" 
            color={user?.role === 'Super Admin' ? 'error' : user?.role === 'Admin' ? 'primary' : 'default'}
            sx={{ height: 18, fontSize: '0.7rem', fontWeight: 600, mt: 0.5 }}
          />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Navbar */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 600 }}>
            Admin Portal
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Theme Toggle */}
            <IconButton onClick={() => dispatch(toggleThemeMode())} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {/* Notification Icon */}
            <IconButton color="inherit" onClick={handleNotifOpen}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Notifications Popover Dropdown */}
            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={handleNotifClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { width: 340, maxHeight: 420 } }}
            >
              <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notifications</Typography>
                {unreadCount > 0 && (
                  <Chip 
                    label="Mark all read" 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(markNotificationRead('all'));
                    }}
                    sx={{ cursor: 'pointer', height: 22, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
              <Divider />
              {(Array.isArray(notifications) && notifications.length > 0) ? (
                notifications.filter(Boolean).slice(0, 5).map((n, idx) => (
                  <MenuItem 
                    key={n?.id || idx} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (n?.id) dispatch(markNotificationRead(n.id));
                      handleNotifClose();
                      navigate('/admin/dashboard/notifications');
                    }}
                    sx={{ 
                      py: 1.5, 
                      px: 2, 
                      bgcolor: n?.read ? 'transparent' : 'action.hover',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: n?.read ? 600 : 800, fontSize: '0.85rem' }}>
                        {n?.title || 'System Notification'}
                      </Typography>
                      {!n?.read && <Chip label="New" color="error" size="small" sx={{ height: 16, fontSize: '0.6rem' }} />}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', whiteSpace: 'normal' }}>
                      {n?.message || ''}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                      {n?.createdAt || 'Recent'} • {n?.channel || 'InApp'}
                    </Typography>
                  </MenuItem>
                ))
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No notifications found.</Typography>
                </Box>
              )}
              <Divider />
              <MenuItem 
                onClick={(e) => { 
                  e.stopPropagation();
                  handleNotifClose(); 
                  navigate('/admin/dashboard/notifications'); 
                }}
                sx={{ justifyContent: 'center', py: 1.2, fontWeight: 700, color: 'primary.main', fontSize: '0.85rem' }}
              >
                View Broadcast Panel & History →
              </MenuItem>
            </Menu>

            {/* User Profile Trigger */}
            <IconButton onClick={handleProfileMenuOpen} size="small" sx={{ ml: 1 }}>
              <Avatar src={user?.avatar} sx={{ width: 36, height: 36 }}>
                {user?.name ? user.name[0] : 'A'}
              </Avatar>
            </IconButton>

            {/* Profile Dropdown */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin/dashboard/settings'); }}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Responsive Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {sidebarContent}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {sidebarContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 4 },
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          overflowX: 'auto',
        }}
      >
        <ErrorBoundary>
          <Breadcrumbs />
          <Outlet />
        </ErrorBoundary>
      </Box>
    </Box>
  );
};

export default AdminLayout;
