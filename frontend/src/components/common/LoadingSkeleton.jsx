import React from 'react';
import { Box, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Grid } from '@mui/material';

const LoadingSkeleton = ({ type = 'table', rows = 5, cols = 4 }) => {
  if (type === 'cards') {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={36} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (type === 'form') {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Skeleton variant="text" width="50%" height={40} sx={{ mb: 4 }} />
        <Skeleton variant="rectangular" height={56} sx={{ mb: 3, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={56} sx={{ mb: 3, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={120} sx={{ mb: 3, borderRadius: 1 }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>
    );
  }

  // Default: Table skeleton
  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow>
            {Array.from({ length: cols }).map((_, c) => (
              <TableCell key={c}>
                <Skeleton variant="text" height={24} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <TableCell key={c}>
                  <Skeleton variant="text" height={20} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default LoadingSkeleton;
