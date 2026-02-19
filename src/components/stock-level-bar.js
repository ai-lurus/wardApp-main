import { Box, LinearProgress, Typography } from '@mui/material';

export const getStockStatus = (currentStock, minStock) => {
  if (currentStock === 0) return 'outOfStock';
  if (currentStock <= minStock) return 'critical';
  if (currentStock <= minStock * 1.5) return 'lowStock';
  return 'inStock';
};

const statusColorMap = {
  outOfStock: 'error',
  critical: 'error',
  lowStock: 'warning',
  inStock: 'success',
};

export const StockLevelBar = ({ currentStock, minStock }) => {
  const maxScale = minStock * 2;
  const percentage = Math.min((currentStock / maxScale) * 100, 100);
  const status = getStockStatus(currentStock, minStock);
  const color = statusColorMap[status];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={color}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
        {currentStock}/{minStock * 2}
      </Typography>
    </Box>
  );
};
