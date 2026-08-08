import React from 'react';
import { 
  Box, Typography, TextField, Button, InputAdornment, 
  Menu, MenuItem, IconButton, Tooltip, Stack 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

const PageHeader = ({
  title,
  subtitle,
  // Search
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  // Filters
  filterOptions = [],
  selectedFilter = '',
  onFilterChange,
  // Sort
  sortOptions = [],
  selectedSort = '',
  onSortChange,
  // Actions
  onAddClick,
  addLabel = 'Add New',
  onExport,
  onRefresh,
}) => {
  const [filterAnchor, setFilterAnchor] = React.useState(null);
  const [sortAnchor, setSortAnchor] = React.useState(null);

  const handleFilterOpen = (e) => setFilterAnchor(e.currentTarget);
  const handleFilterClose = () => setFilterAnchor(null);

  const handleSortOpen = (e) => setSortAnchor(e.currentTarget);
  const handleSortClose = () => setSortAnchor(null);

  return (
    <Box sx={{ mb: 4 }}>
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
          {onRefresh && (
            <Tooltip title="Refresh Data">
              <IconButton onClick={onRefresh} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          {onExport && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={onExport}
              color="primary"
            >
              Export
            </Button>
          )}
          {onAddClick && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddClick}
              color="primary"
            >
              {addLabel}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Search, Filter & Sort Controls Row */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        alignItems="center"
        sx={{ width: '100%', mt: 2 }}
      >
        {onSearchChange && (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' }, maxWidth: { sm: 400 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }
            }}
          />
        )}

        <Stack direction="row" spacing={1.5} sx={{ ml: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
          {onFilterChange && filterOptions.length > 0 && (
            <>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<FilterListIcon />}
                onClick={handleFilterOpen}
                sx={{ borderColor: 'divider' }}
              >
                Filter: {selectedFilter || 'All'}
              </Button>
              <Menu
                anchorEl={filterAnchor}
                open={Boolean(filterAnchor)}
                onClose={handleFilterClose}
              >
                <MenuItem onClick={() => { onFilterChange(''); handleFilterClose(); }}>
                  All
                </MenuItem>
                {filterOptions.map((opt) => (
                  <MenuItem 
                    key={opt.value} 
                    onClick={() => { onFilterChange(opt.value); handleFilterClose(); }}
                    selected={selectedFilter === opt.value}
                  >
                    {opt.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {onSortChange && sortOptions.length > 0 && (
            <>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<SortIcon />}
                onClick={handleSortOpen}
                sx={{ borderColor: 'divider' }}
              >
                Sort By
              </Button>
              <Menu
                anchorEl={sortAnchor}
                open={Boolean(sortAnchor)}
                onClose={handleSortClose}
              >
                {sortOptions.map((opt) => (
                  <MenuItem 
                    key={opt.value} 
                    onClick={() => { onSortChange(opt.value); handleSortClose(); }}
                    selected={selectedSort === opt.value}
                  >
                    {opt.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default PageHeader;
