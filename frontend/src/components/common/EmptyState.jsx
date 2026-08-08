import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

const EmptyState = ({
  icon: Icon = InboxIcon,
  title = 'No Records Found',
  description = 'There are no items to display at the moment. Try adjusting your filters or search query.',
  actionLabel,
  onActionClick,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 6,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.default',
        my: 3,
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 2 }}>
        <Icon sx={{ fontSize: 60, opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
        {description}
      </Typography>
      {actionLabel && onActionClick && (
        <Button variant="contained" color="primary" onClick={onActionClick}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
